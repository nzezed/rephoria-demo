import { BasePlatformIntegration } from './base-platform'
import {
  PlatformConfig,
  PlatformType,
  PlatformEvents,
  CallData,
  AgentState,
  QueueState,
  PlatformMetrics,
  HistoricalQuery,
  HistoricalData,
} from './types'

export class IntegrationManager {
  private platforms: Map<string, BasePlatformIntegration> = new Map()
  private eventHandlers: PlatformEvents
  private platformFactories: Map<PlatformType, (config: PlatformConfig, events: PlatformEvents) => BasePlatformIntegration>

  constructor(eventHandlers: PlatformEvents) {
    this.eventHandlers = eventHandlers
    this.platformFactories = new Map()
  }

  // Register a platform factory for creating platform-specific integrations
  public registerPlatform(
    type: PlatformType,
    factory: (config: PlatformConfig, events: PlatformEvents) => BasePlatformIntegration
  ): void {
    this.platformFactories.set(type, factory)
  }

  // Add and initialize a new platform integration
  public async addPlatform(config: PlatformConfig): Promise<void> {
    if (this.platforms.has(config.id)) {
      throw new Error(`Platform with ID ${config.id} already exists`)
    }

    const factory = this.platformFactories.get(config.type)
    if (!factory) {
      throw new Error(`No factory registered for platform type ${config.type}`)
    }

    const platform = factory(config, {
      onCallUpdate: (call: CallData) => this.handleCallUpdate(config.id, call),
      onAgentUpdate: (agent: AgentState) => this.handleAgentUpdate(config.id, agent),
      onQueueUpdate: (queue: QueueState) => this.handleQueueUpdate(config.id, queue),
      onMetricsUpdate: (metrics: PlatformMetrics) => this.handleMetricsUpdate(config.id, metrics),
      onError: (error: Error) => this.handleError(config.id, error),
    })

    await platform.initialize()
    this.platforms.set(config.id, platform)

    if (config.enabled) {
      await platform.connect()
    }
  }

  // Remove and cleanup a platform integration
  public async removePlatform(platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId)
    if (!platform) {
      throw new Error(`Platform with ID ${platformId} not found`)
    }

    await platform.disconnect()
    this.platforms.delete(platformId)
  }

  // Connect to a platform
  public async connectPlatform(platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId)
    if (!platform) {
      throw new Error(`Platform with ID ${platformId} not found`)
    }

    await platform.connect()
  }

  // Disconnect from a platform
  public async disconnectPlatform(platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId)
    if (!platform) {
      throw new Error(`Platform with ID ${platformId} not found`)
    }

    await platform.disconnect()
  }

  // Get historical data across all platforms
  public async getHistoricalData(query: HistoricalQuery): Promise<Record<string, HistoricalData>> {
    const results: Record<string, HistoricalData> = {}
    
    for (const [platformId, platform] of this.platforms) {
      if (platform.isConnected() && platform.hasCapability('historicalData')) {
        try {
          results[platformId] = await platform.fetchHistoricalData(query)
        } catch (error) {
          this.handleError(platformId, error as Error)
        }
      }
    }

    return results
  }

  // Event handlers that aggregate data from all platforms
  private handleCallUpdate(platformId: string, call: CallData): void {
    this.eventHandlers.onCallUpdate(call)
  }

  private handleAgentUpdate(platformId: string, agent: AgentState): void {
    this.eventHandlers.onAgentUpdate(agent)
  }

  private handleQueueUpdate(platformId: string, queue: QueueState): void {
    this.eventHandlers.onQueueUpdate(queue)
  }

  private handleMetricsUpdate(platformId: string, metrics: PlatformMetrics): void {
    this.eventHandlers.onMetricsUpdate(metrics)
  }

  private handleError(platformId: string, error: Error): void {
    this.eventHandlers.onError(new Error(`Platform ${platformId}: ${error.message}`))
  }

  // Utility methods
  public getPlatform(platformId: string): BasePlatformIntegration | undefined {
    return this.platforms.get(platformId)
  }

  public getAllPlatforms(): Map<string, BasePlatformIntegration> {
    return this.platforms
  }

  public getConnectedPlatforms(): BasePlatformIntegration[] {
    return Array.from(this.platforms.values()).filter(platform => platform.isConnected())
  }
} 