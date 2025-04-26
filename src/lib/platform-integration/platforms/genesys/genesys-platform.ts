import { platformApi, notificationsApi, UsersApi, RoutingApi, AnalyticsApi } from 'purecloud-platform-client-v2'
import {
  PlatformConfig,
  PlatformEvents,
  PlatformMetrics,
  HistoricalQuery,
  HistoricalData,
  PlatformCapabilities,
} from '../../types'
import { BasePlatformIntegration } from '../../base-platform'
import { GenesysWebSocket } from './genesys-websocket'
import { GenesysApiClient } from './genesys-api-client'
import { GenesysEventProcessor } from './genesys-event-processor'

export class GenesysPlatform extends BasePlatformIntegration {
  private apiClient: GenesysApiClient
  private webSocket: GenesysWebSocket
  private eventProcessor: GenesysEventProcessor
  private isInitialized: boolean = false

  constructor(config: PlatformConfig, events: PlatformEvents) {
    super(config, events)
    this.apiClient = new GenesysApiClient(config)
    this.webSocket = new GenesysWebSocket(this.handleWebSocketMessage.bind(this))
    this.eventProcessor = new GenesysEventProcessor(this.events)

    // Set Genesys-specific capabilities
    this.status.capabilities = {
      features: {
        realTimeMonitoring: true,
        historicalData: true,
        agentStatus: true,
        queueMetrics: true,
        callRecording: true,
        customEvents: true,
        webhooks: true,
      },
      limits: {
        maxPollingRate: 1000, // 1 second minimum between polls
        maxWebhookRate: 100, // 100 requests per second
        maxHistoricalRange: 90, // 90 days max historical data
      },
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize the Genesys Platform API client
      const { environment, clientId, clientSecret } = this.config.credentials.customConfig || {}
      if (!environment || !clientId || !clientSecret) {
        throw new Error('Missing required Genesys credentials')
      }

      await this.apiClient.initialize(environment, clientId, clientSecret)
      this.isInitialized = true
      
      await this.updateStatus({
        connected: false,
        error: undefined,
      })
    } catch (error) {
      await this.updateStatus({
        connected: false,
        error: `Failed to initialize Genesys platform: ${(error as Error).message}`,
      })
      throw error
    }
  }

  async connect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Platform not initialized')
    }

    try {
      // Connect WebSocket for real-time events
      await this.webSocket.connect(await this.apiClient.getAuthToken())
      
      // Start polling for metrics that aren't available via WebSocket
      await this.startPolling()

      await this.updateStatus({
        connected: true,
        error: undefined,
        lastSync: new Date(),
      })
    } catch (error) {
      await this.updateStatus({
        connected: false,
        error: `Failed to connect to Genesys platform: ${(error as Error).message}`,
      })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling()
    await this.webSocket.disconnect()
    
    await this.updateStatus({
      connected: false,
      error: undefined,
    })
  }

  async fetchCurrentMetrics(): Promise<PlatformMetrics> {
    try {
      const [queueMetrics, agentMetrics] = await Promise.all([
        this.apiClient.fetchQueueMetrics(),
        this.apiClient.fetchAgentMetrics(),
      ])

      const metrics: PlatformMetrics = {
        timestamp: new Date(),
        activeCalls: queueMetrics.activeCalls,
        totalAgents: agentMetrics.totalAgents,
        availableAgents: agentMetrics.availableAgents,
        totalQueues: queueMetrics.totalQueues,
        averageHandleTime: queueMetrics.averageHandleTime,
        serviceLevel: queueMetrics.serviceLevel,
        abandonRate: queueMetrics.abandonRate,
        callsInLastHour: queueMetrics.callsInLastHour,
        metadata: {
          queueDetails: queueMetrics.queueDetails,
          agentStates: agentMetrics.agentStates,
        },
      }

      await this.updateStatus({
        lastSync: new Date(),
        currentMetrics: metrics,
      })

      return metrics
    } catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  async fetchHistoricalData(query: HistoricalQuery): Promise<HistoricalData> {
    try {
      const data = await this.apiClient.fetchHistoricalData(query)
      return {
        periodStart: query.startDate,
        periodEnd: query.endDate,
        metrics: data.metrics,
        segments: data.segments,
      }
    } catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  private async handleWebSocketMessage(message: any): Promise<void> {
    try {
      await this.eventProcessor.processEvent(message)
    } catch (error) {
      this.handleError(error as Error)
    }
  }
} 