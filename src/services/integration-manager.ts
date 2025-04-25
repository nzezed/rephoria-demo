import { create } from 'zustand'
import { type StateCreator } from 'zustand'

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
  loadIntegrations: () => Promise<void>
  updateIntegration: (integration: Integration) => Promise<void>
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
  loadIntegrations: async () => {
    try {
      const response = await fetch('/api/integrations')
      if (!response.ok) {
        throw new Error('Failed to load integrations')
      }
      const integrations = await response.json()
      set({ activeIntegrations: integrations })
    } catch (error) {
      console.error('Error loading integrations:', error)
    }
  },
  updateIntegration: async (integration: Integration) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(integration),
      })
      if (!response.ok) {
        throw new Error('Failed to update integration')
      }
      // Update local state after successful save
      const { activeIntegrations } = get()
      set({
        activeIntegrations: activeIntegrations.map((i) =>
          i.id === integration.id ? integration : i
        ),
      })
    } catch (error) {
      console.error('Error updating integration:', error)
      throw error
    }
  },
}))

// Data fetching based on active integration
class IntegrationManager {
  private static instance: IntegrationManager
  private store = useIntegrationStore

  private constructor() {
    // Load integrations when the manager is instantiated
    this.store.getState().loadIntegrations()
  }

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
      // Fetch data from the appropriate API endpoint
      switch (activePlatform.id) {
        case 'twilio':
          return await this.fetchTwilioData()
        case 'five9':
          return await this.fetchFive9Data()
        case 'genesys':
          return await this.fetchGenesysData()
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

  private async fetchTwilioData(): Promise<DashboardData> {
    const response = await fetch('/api/integrations/twilio/data')
    if (!response.ok) {
      throw new Error('Failed to fetch Twilio data')
    }
    return response.json()
  }

  private async fetchFive9Data(): Promise<DashboardData> {
    // Implement Five9 API integration
    throw new Error('Not implemented')
  }

  private async fetchGenesysData(): Promise<DashboardData> {
    // Implement Genesys API integration
    throw new Error('Not implemented')
  }
}

export const integrationManager = IntegrationManager.getInstance()
export { useIntegrationStore } 