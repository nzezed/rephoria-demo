'use client'

import { useState } from 'react'
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
} from '@tremor/react'
import {
  PhoneIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface Integration {
  id: string
  name: string
  type: 'call_platform' | 'crm'
  status: 'connected' | 'disconnected' | 'pending'
  lastSync?: string
}

interface IntegrationConfig {
  apiKey?: string
  accountId?: string
  region?: string
  environment?: 'production' | 'sandbox'
  organizationId?: string
  clientId?: string
  clientSecret?: string
}

export default function IntegrationsPage() {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null)
  const [config, setConfig] = useState<IntegrationConfig>({})
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'steam-connect',
      name: 'Steam Connect',
      type: 'call_platform',
      status: 'disconnected',
    },
    {
      id: 'twilio',
      name: 'Twilio',
      type: 'call_platform',
      status: 'disconnected',
    },
    {
      id: 'five9',
      name: 'Five9',
      type: 'call_platform',
      status: 'disconnected',
    },
    {
      id: 'genesys',
      name: 'Genesys',
      type: 'call_platform',
      status: 'disconnected',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      type: 'crm',
      status: 'disconnected',
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      type: 'crm',
      status: 'disconnected',
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      type: 'crm',
      status: 'disconnected',
    },
  ])

  const handleConnect = async (integrationId: string) => {
    setActiveIntegration(integrationId)
    // Reset config when selecting a new integration
    setConfig({})
  }

  const handleSaveConfig = async () => {
    if (!activeIntegration) return

    // In a real application, this would make an API call to validate and store credentials
    setIntegrations(integrations.map(integration => 
      integration.id === activeIntegration
        ? { 
            ...integration, 
            status: 'connected',
            lastSync: new Date().toISOString()
          }
        : integration
    ))
    setActiveIntegration(null)
    setConfig({})
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
          {integrations
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
          {integrations
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
                <Title>Configure {integrations.find(i => i.id === activeIntegration)?.name}</Title>
                <Text>Enter your credentials to connect the platform.</Text>
              </div>

              <div className="space-y-4">
                {activeIntegration === 'steam-connect' ? (
                  <>
                    <div>
                      <Text>Organization ID</Text>
                      <TextInput
                        placeholder="Enter your Steam Connect Organization ID"
                        value={config.organizationId || ''}
                        onChange={(e) => setConfig({ ...config, organizationId: e.target.value })}
                      />
                    </div>

                    <div>
                      <Text>Client ID</Text>
                      <TextInput
                        placeholder="Enter your Steam Connect Client ID"
                        value={config.clientId || ''}
                        onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                      />
                    </div>

                    <div>
                      <Text>Client Secret</Text>
                      <TextInput
                        type="password"
                        placeholder="Enter your Steam Connect Client Secret"
                        value={config.clientSecret || ''}
                        onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      />
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
                ) : (
                  <>
                    <div>
                      <Text>API Key</Text>
                      <TextInput
                        placeholder="Enter your API key"
                        value={config.apiKey || ''}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      />
                    </div>

                    <div>
                      <Text>Account ID</Text>
                      <TextInput
                        placeholder="Enter your account ID"
                        value={config.accountId || ''}
                        onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
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
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveIntegration(null)
                    setConfig({})
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={
                    activeIntegration === 'steam-connect'
                      ? !config.organizationId || !config.clientId || !config.clientSecret
                      : !config.apiKey || !config.accountId
                  }
                >
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
} 