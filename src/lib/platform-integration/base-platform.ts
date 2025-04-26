import {
  PlatformConfig,
  PlatformStatus,
  PlatformEvents,
  CallData,
  AgentState,
  QueueState,
  PlatformMetrics,
  HistoricalQuery,
  HistoricalData,
} from './types'

export abstract class BasePlatformIntegration {
  protected config: PlatformConfig
  protected status: PlatformStatus
  protected events: PlatformEvents
  protected pollingInterval?: NodeJS.Timeout

  constructor(config: PlatformConfig, events: PlatformEvents) {
    this.config = config
    this.events = events
    this.status = {
      connected: false,
      capabilities: {
        features: {
          realTimeMonitoring: false,
          historicalData: false,
          agentStatus: false,
          queueMetrics: false,
          callRecording: false,
          customEvents: false,
          webhooks: false,
        },
        limits: {},
      },
      currentMetrics: {
        timestamp: new Date(),
        activeCalls: 0,
        totalAgents: 0,
        availableAgents: 0,
        totalQueues: 0,
        averageHandleTime: 0,
        serviceLevel: 0,
        abandonRate: 0,
        callsInLastHour: 0,
        metadata: {},
      },
    }
  }

  // Core methods that must be implemented by platform-specific classes
  abstract initialize(): Promise<void>
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract fetchCurrentMetrics(): Promise<PlatformMetrics>
  abstract fetchHistoricalData(query: HistoricalQuery): Promise<HistoricalData>

  // Optional methods that can be overridden
  protected async startPolling(): Promise<void> {
    if (!this.config.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      try {
        const metrics = await this.fetchCurrentMetrics()
        this.events.onMetricsUpdate(metrics)
      } catch (error) {
        this.handleError(error as Error)
      }
    }, this.config.pollingInterval)
  }

  protected stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = undefined
    }
  }

  // Utility methods for derived classes
  protected async updateStatus(partial: Partial<PlatformStatus>): Promise<void> {
    this.status = { ...this.status, ...partial }
  }

  protected handleError(error: Error): void {
    console.error(`Platform ${this.config.name} error:`, error)
    this.events.onError(error)
  }

  protected emitCallUpdate(call: CallData): void {
    this.events.onCallUpdate({ ...call, platformId: this.config.id })
  }

  protected emitAgentUpdate(agent: AgentState): void {
    this.events.onAgentUpdate({ ...agent, platformId: this.config.id })
  }

  protected emitQueueUpdate(queue: QueueState): void {
    this.events.onQueueUpdate({ ...queue, platformId: this.config.id })
  }

  // Public methods for status and capability checking
  public getStatus(): PlatformStatus {
    return this.status
  }

  public isConnected(): boolean {
    return this.status.connected
  }

  public hasCapability(feature: keyof PlatformCapabilities['features']): boolean {
    return this.status.capabilities.features[feature]
  }

  public getConfig(): PlatformConfig {
    return this.config
  }
} 