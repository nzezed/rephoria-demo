'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Text,
  Grid,
  Button,
  TextInput,
  Select,
  SelectItem,
  Badge,
  Flex,
} from '@tremor/react'
import {
  PhoneIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { useIntegrationStore } from '@/services/integration-manager'
import { integrationManager } from '@/services/integration-manager'
import type { Integration } from '@/services/integration-manager'
import { useRouter } from 'next/navigation'

interface IntegrationConfig {
  authToken?: string
  accountSid?: string
  region?: string
  environment?: 'production' | 'sandbox'
}

export default function IntegrationsPage() {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null)
  const [config, setConfig] = useState<IntegrationConfig>({})
  const { activeIntegrations, addOrUpdateIntegration } = useIntegrationStore()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize available integrations
  useEffect(() => {
    if (activeIntegrations.length === 0) {
      // Add Twilio as an available integration if it's not already present
      const twilioIntegration: Integration = {
        id: 'twilio',
        name: 'Twilio',
        type: 'call_platform',
        status: 'disconnected'
      }
      addOrUpdateIntegration(twilioIntegration)
    }
  }, [activeIntegrations, addOrUpdateIntegration])

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      setIntegrations(data)
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationId: string) => {
    const integration = activeIntegrations.find((i) => i.id === integrationId)
    if (!integration) return

    if (integration.status === 'connected') {
      // Disconnect
      try {
        if (integration.id === 'twilio') {
          await integrationManager.disconnectTwilio()
        } else {
          addOrUpdateIntegration({
            ...integration,
            status: 'disconnected',
            lastSync: undefined,
            config: undefined,
          })
        }
      } catch (error) {
        console.error('Error disconnecting integration:', error)
      }
    } else {
      setActiveIntegration(integrationId)
      setConfig({})
    }
  }

  const handleSaveConfig = async () => {
    if (!activeIntegration) return

    const integration = activeIntegrations.find((i) => i.id === activeIntegration)
    if (!integration) return

    try {
      if (integration.id === 'twilio') {
        const success = await integrationManager.configureTwilio(
          config.accountSid || '',
          config.authToken || ''
        )
        if (!success) {
          throw new Error('Failed to configure Twilio')
        }
      } else {
        addOrUpdateIntegration({
          ...integration,
          status: 'connected',
          lastSync: new Date().toISOString(),
          config,
        })
      }
      setActiveIntegration(null)
      setConfig({})
    } catch (error) {
      console.error('Error saving integration config:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'green'
      case 'disconnected':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const renderConfigFields = (provider: string) => {
    switch (provider) {
      case 'twilio':
        return (
          <>
            <div>
              <Text>Account SID</Text>
              <Text className="text-sm text-gray-500 mb-2">
                Your Twilio Account SID starts with "AC". Find it in your Twilio Console Dashboard.
              </Text>
              <TextInput
                placeholder="AC..."
                value={config.accountSid || ''}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
              />
            </div>

            <div>
              <Text>Auth Token</Text>
              <Text className="text-sm text-gray-500 mb-2">
                Your Twilio Auth Token is a 32-character string. Find it in your Twilio Console Dashboard.
              </Text>
              <TextInput
                type="password"
                placeholder="Enter your Auth Token"
                value={config.authToken || ''}
                onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
              />
            </div>

            <div>
              <Text>Environment</Text>
              <Text className="text-sm text-gray-500 mb-2">
                Choose 'Production' for live calls or 'Sandbox' for testing.
              </Text>
              <Select
                value={config.environment || ''}
                onValueChange={(value) => setConfig({ ...config, environment: value as 'production' | 'sandbox' })}
              >
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </Select>
            </div>
          </>
        )
      default:
        return (
          <>
            <div>
              <Text>API Key</Text>
              <TextInput
                placeholder="Enter your API key"
                value={config.authToken || ''}
                onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
              />
            </div>

            <div>
              <Text>Account ID</Text>
              <TextInput
                placeholder="Enter your account ID"
                value={config.accountSid || ''}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
              />
            </div>

            <div>
              <Text>Region</Text>
              <Select
                value={config.region || ''}
                onValueChange={(value) => setConfig({ ...config, region: value })}
              >
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
              </Select>
            </div>

            <div>
              <Text>Environment</Text>
              <Select
                value={config.environment || ''}
                onValueChange={(value) => setConfig({ ...config, environment: value as 'production' | 'sandbox' })}
              >
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </Select>
            </div>
          </>
        )
    }
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <Title>Integrations</Title>
        <Button onClick={() => router.push('/dashboard/integrations/new')}>
          Add New Integration
        </Button>
      </div>

      {loading ? (
        <Text>Loading integrations...</Text>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration: any) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Title>{integration.name}</Title>
                <Badge color={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
              </div>
              <Text className="mb-4">{integration.description || 'No description available'}</Text>
              <div className="flex justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/integrations/${integration.provider}`)}
                >
                  Configure
                </Button>
                {integration.status === 'connected' && (
                  <Button
                    variant="destructive"
                    onClick={() => router.push(`/dashboard/integrations/${integration.provider}/disconnect`)}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}