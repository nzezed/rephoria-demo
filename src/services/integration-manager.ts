import { create, StateCreator } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface Integration {
  id: string
  name: string
  type: 'call_platform' | 'crm'
  status: 'connected' | 'disconnected' | 'pending'
  lastSync?: string
  config?: {
    accountSid?: string
    authToken?: string
    [key: string]: any
  }
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
  addOrUpdateIntegration: (integration: Integration) => void
  removeIntegration: (integrationId: string) => void
}

type SetState = (
  partial: IntegrationStore | Partial<IntegrationStore> | ((state: IntegrationStore) => IntegrationStore | Partial<IntegrationStore>),
  replace?: boolean
) => void

type GetState = () => IntegrationStore

type IntegrationPersist = (
  config: StateCreator<IntegrationStore>,
  options: PersistOptions<IntegrationStore>
) => StateCreator<IntegrationStore>

// Store to manage integration state
const useIntegrationStore = create<IntegrationStore>(
  (persist as IntegrationPersist)(
    (set: SetState, get: GetState) => ({
      activeIntegrations: [],
      setIntegrations: (integrations: Integration[]) => set({ activeIntegrations: integrations }),
      getActiveCallPlatform: () => {
        const { activeIntegrations } = get()
        return activeIntegrations.find(
          (integration: Integration) => integration.type === 'call_platform' && integration.status === 'connected'
        ) || null
      },
      addOrUpdateIntegration: (integration: Integration) => {
        const { activeIntegrations } = get()
        const existingIndex = activeIntegrations.findIndex((i: Integration) => i.id === integration.id)
        
        if (existingIndex >= 0) {
          const updatedIntegrations = [...activeIntegrations]
          updatedIntegrations[existingIndex] = integration
          set({ activeIntegrations: updatedIntegrations })
        } else {
          set({ activeIntegrations: [...activeIntegrations, integration] })
        }
      },
      removeIntegration: (integrationId: string) => {
        const { activeIntegrations } = get()
        set({
          activeIntegrations: activeIntegrations.filter((i: Integration) => i.id !== integrationId)
        })
      }
    }),
    {
      name: 'rephoria-integrations',
      version: 1,
    }
  )
)

interface IntegrationManager {
  configureTwilio(accountSid: string, authToken: string): Promise<boolean>
  disconnectTwilio(): Promise<void>
  fetchDashboardData(): Promise<DashboardData>
}

// Data fetching based on active integration
class IntegrationManagerImpl implements IntegrationManager {
  private static instance: IntegrationManagerImpl
  private store = useIntegrationStore

  private constructor() {
    // Initialize with stored data
    this.initializeFromStorage()
  }

  static getInstance(): IntegrationManagerImpl {
    if (!IntegrationManagerImpl.instance) {
      IntegrationManagerImpl.instance = new IntegrationManagerImpl()
    }
    return IntegrationManagerImpl.instance
  }

  private async initializeFromStorage() {
    // The store will automatically rehydrate from localStorage
    // We can add any additional initialization logic here if needed
  }

  async configureTwilio(accountSid: string, authToken: string): Promise<boolean> {
    try {
      // Here you would typically validate the credentials with Twilio
      // For now, we'll just store them
      const twilioIntegration: Integration = {
        id: 'twilio',
        name: 'Twilio',
        type: 'call_platform',
        status: 'connected',
        lastSync: new Date().toISOString(),
        config: {
          accountSid,
          authToken
        }
      }

      this.store.getState().addOrUpdateIntegration(twilioIntegration)
      return true
    } catch (error) {
      console.error('Error configuring Twilio:', error)
      return false
    }
  }

  async disconnectTwilio() {
    this.store.getState().removeIntegration('twilio')
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
    if (!config?.accountSid || !config?.authToken) {
      throw new Error('Twilio configuration missing')
    }

    try {
      // Here you would make actual API calls to Twilio
      // For now, return enhanced placeholder data
      return {
        totalCalls: {
          metric: '150',
          progress: 75,
          target: '200',
          delta: '+15%',
        },
        avgDuration: {
          metric: '4.5m',
          progress: 90,
          target: '5m',
          delta: '+5%',
        },
        satisfaction: {
          metric: '4.2/5',
          progress: 84,
          target: '5/5',
          delta: '+10%',
        },
        trends: [
          {
            date: new Date().toISOString().split('T')[0],
            'Total Calls': 150,
            'Avg Duration': 4.5,
            'Customer Satisfaction': 4.2,
          },
        ],
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

export const integrationManager = IntegrationManagerImpl.getInstance()
export { useIntegrationStore }
export type { Integration, IntegrationManager } 