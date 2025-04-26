import { platformClient, ApiClient } from 'purecloud-platform-client-v2'
import { PlatformConfig, HistoricalQuery } from '../../types'

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

export class GenesysApiClient {
  private client: ApiClient
  private config: PlatformConfig
  private authToken?: string

  constructor(config: PlatformConfig) {
    this.config = config
    this.client = platformClient.ApiClient.instance
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
    const analyticsApi = new platformClient.AnalyticsApi()
    const routingApi = new platformClient.RoutingApi()

    // Fetch queue observations
    const queueObservations = await analyticsApi.getAnalyticsQueuesObservations({
      filter: {
        type: 'or',
        predicates: [
          {
            dimension: 'queueId',
            value: '*',
          },
        ],
      },
    })

    // Fetch queue details
    const queues = await routingApi.getRoutingQueues({ pageSize: 100 })

    let activeCalls = 0
    let totalHandleTime = 0
    let totalCalls = 0
    let abandonedCalls = 0
    const queueDetails: Record<string, any> = {}

    queueObservations.data.forEach((observation) => {
      activeCalls += observation.metrics.oInteracting || 0
      totalHandleTime += observation.metrics.oTotalHandleTime || 0
      totalCalls += observation.metrics.oTotalCalls || 0
      abandonedCalls += observation.metrics.oAbandon || 0

      queueDetails[observation.queue.id] = {
        name: observation.queue.name,
        activeCalls: observation.metrics.oInteracting || 0,
        waitingCalls: observation.metrics.oWaiting || 0,
        serviceLevel: observation.metrics.oServiceLevel || 0,
      }
    })

    return {
      activeCalls,
      totalQueues: queues.entities.length,
      averageHandleTime: totalCalls > 0 ? totalHandleTime / totalCalls : 0,
      serviceLevel: queueObservations.data.reduce((acc, q) => acc + (q.metrics.oServiceLevel || 0), 0) / queueObservations.data.length,
      abandonRate: totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0,
      callsInLastHour: totalCalls,
      queueDetails,
    }
  }

  async fetchAgentMetrics(): Promise<AgentMetrics> {
    const usersApi = new platformClient.UsersApi()
    const presenceApi = new platformClient.PresenceApi()

    // Fetch all users
    const users = await usersApi.getUsers({ pageSize: 100 })

    // Fetch presence for all users
    const presenceStates = new Map<string, number>()
    for (const user of users.entities) {
      try {
        const presence = await presenceApi.getUserPresence(user.id, 'PURECLOUD')
        const state = presence.presenceDefinition.systemPresence
        presenceStates.set(state, (presenceStates.get(state) || 0) + 1)
      } catch (error) {
        console.error(`Failed to fetch presence for user ${user.id}:`, error)
      }
    }

    return {
      totalAgents: users.entities.length,
      availableAgents: presenceStates.get('AVAILABLE') || 0,
      agentStates: Object.fromEntries(presenceStates),
    }
  }

  async fetchHistoricalData(query: HistoricalQuery): Promise<{
    metrics: Record<string, number>
    segments: Record<string, Record<string, number>>
  }> {
    const analyticsApi = new platformClient.AnalyticsApi()

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

    response.conversations.forEach((conversation) => {
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

      if (conversation.participants.some(p => p.disconnectType === 'ABANDON')) {
        metrics.abandonedCalls++
      }

      // Group by requested segments
      if (query.groupBy) {
        query.groupBy.forEach((groupKey) => {
          const value = (conversation as any)[groupKey]
          if (value) {
            if (!segments[groupKey]) {
              segments[groupKey] = {}
            }
            segments[groupKey][value] = (segments[groupKey][value] || 0) + 1
          }
        })
      }
    })

    metrics.averageHandleTime = metrics.totalCalls > 0 ? metrics.totalDuration / metrics.totalCalls : 0

    return { metrics, segments }
  }
} 