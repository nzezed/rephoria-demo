import { create } from 'zustand'
import { type StateCreator } from 'zustand'
import twilio from 'twilio'

export interface Integration {
  id: string
  name: string
  type: 'call_platform' | 'crm'
  status: 'connected' | 'disconnected' | 'pending'
  lastSync?: string
  config?: Record<string, any>
}

interface DashboardData {
  totalCalls: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  avgDuration: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  satisfaction: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  trends: {
    date: string
    'Total Calls': number
    'Avg Duration': number
    'Customer Satisfaction': number
  }[]
}

interface IntegrationStore {
  activeIntegrations: Integration[]
  setIntegrations: (integrations: Integration[]) => void
  getActiveCallPlatform: () => Integration | null
}

// Store to manage integration state
const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  activeIntegrations: [],
  setIntegrations: (integrations: Integration[]) => set({ activeIntegrations: integrations }),
  getActiveCallPlatform: () => {
    const { activeIntegrations } = get()
    return activeIntegrations.find(
      (i: Integration) => i.type === 'call_platform' && i.status === 'connected'
    ) || null
  },
}))

// Data fetching based on active integration
class IntegrationManager {
  private static instance: IntegrationManager
  private store = useIntegrationStore

  private constructor() {}

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager()
    }
    return IntegrationManager.instance
  }

  async fetchDashboardData(): Promise<DashboardData> {
    const activePlatform = this.store.getState().getActiveCallPlatform()
    
    if (!activePlatform) {
      return this.getPlaceholderData()
    }

    try {
      // Here we would integrate with the actual platform's API
      switch (activePlatform.id) {
        case 'twilio':
          return await this.fetchTwilioData(activePlatform.config)
        case 'five9':
          return await this.fetchFive9Data(activePlatform.config)
        case 'genesys':
          return await this.fetchGenesysData(activePlatform.config)
        default:
          return this.getPlaceholderData()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return this.getPlaceholderData()
    }
  }

  private getPlaceholderData(): DashboardData {
    return {
      totalCalls: {
        metric: '0',
        progress: 0,
        target: '100',
        delta: '0%',
      },
      avgDuration: {
        metric: '0m',
        progress: 0,
        target: '5m',
        delta: '0%',
      },
      satisfaction: {
        metric: '0/5',
        progress: 0,
        target: '5/5',
        delta: '0%',
      },
      trends: [
        {
          date: new Date().toISOString().split('T')[0],
          'Total Calls': 0,
          'Avg Duration': 0,
          'Customer Satisfaction': 0,
        },
      ],
    }
  }

  private async fetchTwilioData(config: Record<string, any> | undefined): Promise<DashboardData> {
    if (!config?.accountId || !config?.apiKey) {
      throw new Error('Missing Twilio credentials')
    }

    try {
      // Initialize Twilio client
      const client = twilio(config.accountId, config.apiKey)
      
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Fetch calls for today
      const calls = await client.calls.list({
        startTime: today,
        endTime: tomorrow,
      })

      // Calculate metrics
      const totalCalls = calls.length
      const completedCalls = calls.filter(call => call.status === 'completed')
      const avgDurationSec = completedCalls.length > 0
        ? completedCalls.reduce((acc, call) => acc + (parseInt(call.duration) || 0), 0) / completedCalls.length
        : 0
      const avgDurationMin = Math.round(avgDurationSec / 60)

      // Get last 7 days of data for trends
      const trendData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const daysCalls = await client.calls.list({
          startTime: date,
          endTime: nextDay,
        })

        const dayCompletedCalls = daysCalls.filter(call => call.status === 'completed')
        const dayAvgDuration = dayCompletedCalls.length > 0
          ? dayCompletedCalls.reduce((acc, call) => acc + (parseInt(call.duration) || 0), 0) / dayCompletedCalls.length / 60
          : 0

        trendData.push({
          date: date.toISOString().split('T')[0],
          'Total Calls': daysCalls.length,
          'Avg Duration': Math.round(dayAvgDuration),
          'Customer Satisfaction': 0, // Twilio doesn't provide this directly
        })
      }

      return {
        totalCalls: {
          metric: totalCalls.toString(),
          progress: Math.min(100, (totalCalls / 100) * 100),
          target: '100',
          delta: '0%', // We'd need historical data to calculate this
        },
        avgDuration: {
          metric: `${avgDurationMin}m`,
          progress: Math.min(100, (avgDurationMin / 5) * 100),
          target: '5m',
          delta: '0%',
        },
        satisfaction: {
          metric: '0/5', // Twilio doesn't provide this directly
          progress: 0,
          target: '5/5',
          delta: '0%',
        },
        trends: trendData,
      }
    } catch (error) {
      console.error('Error fetching Twilio data:', error)
      throw error
    }
  }

  private async fetchFive9Data(config: Record<string, any> | undefined): Promise<DashboardData> {
    // Implement Five9 API integration
    throw new Error('Not implemented')
  }

  private async fetchGenesysData(config: Record<string, any> | undefined): Promise<DashboardData> {
    // Implement Genesys API integration
    throw new Error('Not implemented')
  }
}

export const integrationManager = IntegrationManager.getInstance()
export { useIntegrationStore } 