import {
  PlatformEvents,
  CallData,
  AgentState,
  QueueState,
} from '../../types'

interface GenesysEvent {
  topicName: string
  eventBody: any
  metadata?: {
    correlationId: string
    type: string
  }
}

export class GenesysEventProcessor {
  private events: PlatformEvents

  constructor(events: PlatformEvents) {
    this.events = events
  }

  async processEvent(event: GenesysEvent): Promise<void> {
    try {
      const { topicName, eventBody } = event

      if (topicName.startsWith('v2.conversations')) {
        await this.processConversationEvent(eventBody)
      } else if (topicName.startsWith('v2.users')) {
        await this.processUserEvent(eventBody)
      } else if (topicName.startsWith('v2.analytics.queues')) {
        await this.processQueueEvent(eventBody)
      }
    } catch (error) {
      console.error('Error processing Genesys event:', error)
      throw error
    }
  }

  private async processConversationEvent(eventBody: any): Promise<void> {
    const call: CallData = {
      id: eventBody.id,
      platformId: 'genesys',
      timestamp: new Date(eventBody.startTime),
      type: this.mapConversationType(eventBody.direction),
      status: this.mapConversationState(eventBody.state),
      duration: eventBody.duration,
      waitTime: eventBody.waitTime,
      agentId: eventBody.participants.find((p: any) => p.purpose === 'agent')?.id,
      customerId: eventBody.participants.find((p: any) => p.purpose === 'customer')?.id,
      queueId: eventBody.queueId,
      recordingUrl: eventBody.recording?.url,
      tags: eventBody.tags || [],
      metadata: {
        ani: eventBody.ani,
        dnis: eventBody.dnis,
        direction: eventBody.direction,
        provider: eventBody.provider,
        disconnectType: eventBody.disconnectType,
      },
    }

    this.events.onCallUpdate(call)
  }

  private async processUserEvent(eventBody: any): Promise<void> {
    const agent: AgentState = {
      id: eventBody.id,
      platformId: 'genesys',
      name: eventBody.name,
      status: this.mapPresenceState(eventBody.presenceDefinition.systemPresence),
      currentCallId: eventBody.conversationId,
      lastStatusChange: new Date(eventBody.startTime),
      skills: eventBody.routingStatus.skills || [],
      metadata: {
        email: eventBody.email,
        department: eventBody.department,
        title: eventBody.title,
        routingStatus: eventBody.routingStatus,
        presence: eventBody.presenceDefinition,
      },
    }

    this.events.onAgentUpdate(agent)
  }

  private async processQueueEvent(eventBody: any): Promise<void> {
    const queue: QueueState = {
      id: eventBody.queue.id,
      platformId: 'genesys',
      name: eventBody.queue.name,
      size: eventBody.metrics.oOnQueue || 0,
      activeAgents: eventBody.metrics.oOnQueue || 0,
      availableAgents: eventBody.metrics.oAvailable || 0,
      waitingCalls: eventBody.metrics.oWaiting || 0,
      averageWaitTime: eventBody.metrics.oWaitMilliseconds || 0,
      serviceLevel: eventBody.metrics.oServiceLevel || 0,
      lastUpdate: new Date(),
    }

    this.events.onQueueUpdate(queue)
  }

  private mapConversationType(direction: string): CallData['type'] {
    switch (direction.toUpperCase()) {
      case 'INBOUND':
        return 'INBOUND'
      case 'OUTBOUND':
        return 'OUTBOUND'
      case 'TRANSFER':
        return 'TRANSFER'
      default:
        return 'INTERNAL'
    }
  }

  private mapConversationState(state: string): CallData['status'] {
    switch (state.toUpperCase()) {
      case 'ALERTING':
        return 'INITIATED'
      case 'DIALING':
        return 'RINGING'
      case 'ACTIVE':
        return 'IN_PROGRESS'
      case 'DISCONNECTED':
        return 'COMPLETED'
      case 'NONE':
        return 'MISSED'
      default:
        return 'ABANDONED'
    }
  }

  private mapPresenceState(state: string): AgentState['status'] {
    switch (state.toUpperCase()) {
      case 'AVAILABLE':
        return 'ONLINE'
      case 'OFFLINE':
        return 'OFFLINE'
      case 'BUSY':
        return 'BUSY'
      case 'AWAY':
        return 'AWAY'
      default:
        return 'BREAK'
    }
  }
} 