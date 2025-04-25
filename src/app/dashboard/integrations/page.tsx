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
import type { Integration } from '@/services/integration-manager'

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

  const handleConnect = async (integrationId: string) => {
    const integration = activeIntegrations.find((i) => i.id === integrationId)
    if (!integration) return

    if (integration.status === 'connected') {
      // Disconnect
      try {
        addOrUpdateIntegration({
          ...integration,
          status: 'disconnected',
          lastSync: undefined,
          config: undefined,
        })
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
      addOrUpdateIntegration({
        ...integration,
        status: 'connected',
        lastSync: new Date().toISOString(),
        config,
      })
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
      case 'pending':
        return 'yellow'
      default:
        return 'red'
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
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Integrations</Title>
        <Text>Connect Rephoria with your existing call center platforms and CRM systems.</Text>
      </div>

      {/* Call Platforms */}
      <Card>
        <Title>Call Center Platforms</Title>
        <Text>Connect your call platform to enable real-time call analysis and insights.</Text>
        
        <Grid numItemsMd={3} className="gap-6 mt-6">
          {activeIntegrations
            .filter(integration => integration.type === 'call_platform')
            .map(integration => (
              <Card key={integration.id} decoration="left" decorationColor={getStatusColor(integration.status)}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <Title>{integration.name}</Title>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge color={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                    {integration.lastSync && (
                      <Text className="text-sm">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </Text>
                    )}
                  </div>

                  <Button
                    size="sm"
                    color={integration.status === 'connected' ? 'red' : 'blue'}
                    onClick={() => handleConnect(integration.id)}
                  >
                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </Card>
            ))}
        </Grid>
      </Card>

      {/* CRM Systems */}
      <Card>
        <Title>CRM Systems</Title>
        <Text>Connect your CRM to sync customer data and enhance call insights.</Text>
        
        <Grid numItemsMd={3} className="gap-6 mt-6">
          {activeIntegrations
            .filter(integration => integration.type === 'crm')
            .map(integration => (
              <Card key={integration.id} decoration="left" decorationColor={getStatusColor(integration.status)}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CloudArrowUpIcon className="h-5 w-5 text-gray-500" />
                      <Title>{integration.name}</Title>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge color={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                    {integration.lastSync && (
                      <Text className="text-sm">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </Text>
                    )}
                  </div>

                  <Button
                    size="sm"
                    color={integration.status === 'connected' ? 'red' : 'blue'}
                    onClick={() => handleConnect(integration.id)}
                  >
                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </Card>
            ))}
        </Grid>
      </Card>

      {/* Configuration Modal */}
      {activeIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <div className="space-y-6">
              <div className="space-y-2">
                <Title>Configure {activeIntegrations.find(i => i.id === activeIntegration)?.name}</Title>
                <Text>Enter your credentials to connect the platform.</Text>
              </div>

              <div className="space-y-4">
                {renderConfigFields(activeIntegration)}
              </div>

              <Flex className="space-x-2 justify-end">
                <Button variant="secondary" onClick={() => setActiveIntegration(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
              </Flex>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}