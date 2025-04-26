import * as PureCloud from 'purecloud-platform-client-v2'
import { PlatformConfig, HistoricalQuery } from '@/types/platform-integration'

interface QueueMetrics {
  activeCalls: number
  totalQueues: number
  averageHandleTime: number
  serviceLevel: number
  abandonRate: number
  callsInLastHour: number
  queueDetails: Record<string, any>
}

interface AgentMetrics {
  totalAgents: number
  availableAgents: number
  agentStates: Record<string, number>
}

interface QueueObservationMetrics {
  oInteracting: number
  oTotalHandleTime: number
  oTotalCalls: number
  oAbandon: number
  oWaiting: number
  oServiceLevel: number
}

interface QueueObservationData {
  group: {
    queueId: string
    mediaType: string
  }
  data: QueueObservationMetrics[]
}

interface Conversation {
  conversationStart: string
  conversationEnd?: string
  participants: Array<{
    disconnectType?: string
  }>
  [key: string]: any
}

export class GenesysApiClient {
  private client: any
  private config: PlatformConfig
  private authToken?: string

  constructor(config: PlatformConfig) {
    this.config = config
    this.client = PureCloud.ApiClient.instance
  }

  async initialize(environment: string, clientId: string, clientSecret: string): Promise<void> {
    this.client.setEnvironment(environment)
    await this.client.loginClientCredentialsGrant(clientId, clientSecret)
    this.authToken = this.client.authData.accessToken
  }

  async getAuthToken(): Promise<string> {
    if (!this.authToken) {
      throw new Error('Client not initialized')
    }
    return this.authToken
  }

  async fetchQueueMetrics(): Promise<QueueMetrics> {
    const analyticsApi = new PureCloud.AnalyticsApi()
    const routingApi = new PureCloud.RoutingApi()

    // Fetch queue observations
    const queueObservations = await analyticsApi.postAnalyticsQueuesObservationsQuery({
      filter: {
        type: 'or',
        predicates: [
          {
            dimension: 'queueId',
            value: '*',
          },
        ],
      },
      metrics: ['oInteracting', 'oTotalHandleTime', 'oTotalCalls', 'oAbandon', 'oWaiting', 'oServiceLevel']
    })

    // Fetch queue details
    const queues = await routingApi.getRoutingQueues({ pageSize: 100 })
    const queueEntities = queues?.entities || []

    let activeCalls = 0
    let totalHandleTime = 0
    let totalCalls = 0
    let abandonedCalls = 0
    const queueDetails: Record<string, any> = {}

    const results = queueObservations?.results || []
    results.forEach((result: any) => {
      const metrics = result.data?.[0] || {}
      const queueId = result.group?.queueId

      if (queueId) {
        activeCalls += Number(metrics.oInteracting || 0)
        totalHandleTime += Number(metrics.oTotalHandleTime || 0)
        totalCalls += Number(metrics.oTotalCalls || 0)
        abandonedCalls += Number(metrics.oAbandon || 0)

        const queue = queueEntities.find(q => q.id === queueId)
        queueDetails[queueId] = {
          name: queue?.name || 'Unknown Queue',
          activeCalls: Number(metrics.oInteracting || 0),
          waitingCalls: Number(metrics.oWaiting || 0),
          serviceLevel: Number(metrics.oServiceLevel || 0),
        }
      }
    })

    const totalServiceLevel = results.reduce((acc: number, result: any) => {
      const metrics = result.data?.[0] || {}
      return acc + Number(metrics.oServiceLevel || 0)
    }, 0)

    return {
      activeCalls,
      totalQueues: queueEntities.length,
      averageHandleTime: totalCalls > 0 ? totalHandleTime / totalCalls : 0,
      serviceLevel: results.length > 0 ? totalServiceLevel / results.length : 0,
      abandonRate: totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0,
      callsInLastHour: totalCalls,
      queueDetails,
    }
  }

  async fetchAgentMetrics(): Promise<AgentMetrics> {
    const usersApi = new PureCloud.UsersApi()
    const presenceApi = new PureCloud.PresenceApi()

    // Fetch all users
    const users = await usersApi.getUsers({ pageSize: 100 })
    const userEntities = users?.entities || []

    // Fetch presence for all users
    const presenceStates = new Map<string, number>()
    for (const user of userEntities) {
      try {
        if (user.id) {
          const presence = await presenceApi.getUserPresence(user.id, 'PURECLOUD')
          const state = presence?.presenceDefinition?.systemPresence || 'UNKNOWN'
          presenceStates.set(state, (presenceStates.get(state) || 0) + 1)
        }
      } catch (error) {
        console.error(`Failed to fetch presence for user ${user.id}:`, error)
      }
    }

    return {
      totalAgents: userEntities.length,
      availableAgents: presenceStates.get('AVAILABLE') || 0,
      agentStates: Object.fromEntries(presenceStates),
    }
  }

  async fetchHistoricalData(query: HistoricalQuery): Promise<{
    metrics: Record<string, number>
    segments: Record<string, Record<string, number>>
  }> {
    const analyticsApi = new PureCloud.AnalyticsApi()

    const response = await analyticsApi.postAnalyticsConversationsDetailsQuery({
      interval: `${query.startDate.toISOString()}/${query.endDate.toISOString()}`,
      order: 'asc',
      orderBy: 'conversationStart',
      paging: {
        pageSize: 100,
        pageNumber: 1,
      },
    })

    const metrics: Record<string, number> = {
      totalCalls: 0,
      totalDuration: 0,
      averageHandleTime: 0,
      abandonedCalls: 0,
      shortCalls: 0,
    }

    const segments: Record<string, Record<string, number>> = {}
    const conversations = response?.conversations || []

    conversations.forEach((conversation: any) => {
      if (conversation.conversationStart) {
        metrics.totalCalls++
        metrics.totalDuration += conversation.conversationEnd
          ? new Date(conversation.conversationEnd).getTime() - new Date(conversation.conversationStart).getTime()
          : 0

        if (conversation.conversationEnd) {
          const duration = new Date(conversation.conversationEnd).getTime() - new Date(conversation.conversationStart).getTime()
          if (duration < 30000) { // Less than 30 seconds
            metrics.shortCalls++
          }
        }

        if (conversation.participants?.some((p: any) => p.disconnectType === 'ABANDON')) {
          metrics.abandonedCalls++
        }

        // Group by requested segments
        if (query.groupBy) {
          query.groupBy.forEach((groupKey: string) => {
            const value = conversation[groupKey]
            if (value) {
              if (!segments[groupKey]) {
                segments[groupKey] = {}
              }
              segments[groupKey][value] = (segments[groupKey][value] || 0) + 1
            }
          })
        }
      }
    })

    metrics.averageHandleTime = metrics.totalCalls > 0 ? metrics.totalDuration / metrics.totalCalls : 0

    return { metrics, segments }
  }
} 