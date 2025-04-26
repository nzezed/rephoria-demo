export type PlatformType = 'GENESYS' | 'FIVE9' | 'TWILIO' | 'AVAYA' | 'CUSTOM'

export interface CallData {
  id: string
  platformId: string
  timestamp: Date
  type: 'INBOUND' | 'OUTBOUND' | 'INTERNAL' | 'TRANSFER'
  status: 'INITIATED' | 'RINGING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'ABANDONED'
  duration?: number
  waitTime?: number
  agentId?: string
  customerId?: string
  queueId?: string
  recordingUrl?: string
  transcript?: CallTranscript
  sentiment?: CallSentiment
  summary?: CallSummary
  tags: string[]
  metadata: Record<string, any>
}

export interface CallTranscript {
  segments: TranscriptSegment[]
  isLive: boolean
  lastUpdate: Date
}

export interface TranscriptSegment {
  speaker: 'AGENT' | 'CUSTOMER'
  text: string
  timestamp: Date
  sentiment?: number // -1 to 1
  confidence: number
}

export interface CallSentiment {
  overall: number // -1 to 1
  progression: Array<{
    timestamp: Date
    value: number
  }>
  keyPhrases: Array<{
    text: string
    sentiment: number
    timestamp: Date
  }>
}

export interface CallSummary {
  mainPoints: string[]
  actionItems: string[]
  customerIntent: string
  followUpNeeded: boolean
  nextSteps: string[]
  keyInsights: string[]
}

export interface CustomerHistory {
  customerId: string
  lastContact: Date
  totalCalls: number
  calls: CallSummary[]
  overallSentiment: number
  interests: string[]
  preferences: Record<string, any>
  nextActionRecommendation: string
}

export interface AgentState {
  id: string
  platformId: string
  name: string
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY' | 'BREAK'
  currentCallId?: string
  lastStatusChange: Date
  skills: string[]
  performance?: AgentPerformance
  metadata: Record<string, any>
}

export interface AgentPerformance {
  metrics: {
    averageHandleTime: number
    firstCallResolution: number
    customerSatisfaction: number
    callsHandled: number
    successRate: number
  }
  trends: {
    improvement: string[]
    areasForGrowth: string[]
  }
  aiSuggestions: {
    immediate: string[]
    longTerm: string[]
  }
}

export interface QueueState {
  id: string
  platformId: string
  name: string
  size: number
  activeAgents: number
  availableAgents: number
  waitingCalls: number
  averageWaitTime: number
  serviceLevel: number
  lastUpdate: Date
}

export interface PlatformMetrics {
  timestamp: Date
  activeCalls: number
  totalAgents: number
  availableAgents: number
  totalQueues: number
  averageHandleTime: number
  serviceLevel: number
  abandonRate: number
  callsInLastHour: number
  sentiment: {
    average: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  }
  metadata: Record<string, any>
}

export interface PlatformCredentials {
  apiKey?: string
  apiSecret?: string
  accountId?: string
  authToken?: string
  region?: string
  environment: 'production' | 'sandbox'
  customConfig?: Record<string, any>
}

export interface PlatformConfig {
  id: string
  name: string
  type: PlatformType
  credentials: PlatformCredentials
  webhookUrl?: string
  pollingInterval?: number
  enabled: boolean
}

export interface PlatformCapabilities {
  features: {
    realTimeMonitoring: boolean
    historicalData: boolean
    agentStatus: boolean
    queueMetrics: boolean
    callRecording: boolean
    customEvents: boolean
    webhooks: boolean
    liveTranscription: boolean
    sentimentAnalysis: boolean
    aiAssistance: boolean
  }
  limits: {
    maxPollingRate?: number
    maxWebhookRate?: number
    maxHistoricalRange?: number
    maxConcurrentTranscriptions?: number
  }
}

export interface PlatformStatus {
  connected: boolean
  lastSync?: Date
  error?: string
  capabilities: PlatformCapabilities
  currentMetrics: PlatformMetrics
}

export interface PlatformEvents {
  onCallUpdate: (call: CallData) => void
  onAgentUpdate: (agent: AgentState) => void
  onQueueUpdate: (queue: QueueState) => void
  onMetricsUpdate: (metrics: PlatformMetrics) => void
  onTranscriptUpdate: (callId: string, transcript: CallTranscript) => void
  onSentimentUpdate: (callId: string, sentiment: CallSentiment) => void
  onCustomerHistoryUpdate: (customerId: string, history: CustomerHistory) => void
  onError: (error: Error) => void
}

export interface HistoricalQuery {
  startDate: Date
  endDate: Date
  metrics: string[]
  filters?: Record<string, any>
  groupBy?: string[]
}

export interface HistoricalData {
  periodStart: Date
  periodEnd: Date
  metrics: Record<string, number>
  segments?: Record<string, Record<string, number>>
} 