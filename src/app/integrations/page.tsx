'use client'

import { useState } from 'react'
import { useIntegrationStore } from '@/services/integration-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { integrationManager } from '@/services/integration-manager'
import { ChangeEvent } from 'react'

export default function IntegrationsPage() {
  const [accountSid, setAccountSid] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [isConfiguring, setIsConfiguring] = useState(false)
  const activeIntegrations = useIntegrationStore(state => state.activeIntegrations)

  const handleConfigureTwilio = async () => {
    setIsConfiguring(true)
    try {
      const success = await integrationManager.configureTwilio(accountSid, authToken)
      if (success) {
        setAccountSid('')
        setAuthToken('')
      }
    } catch (error) {
      console.error('Error configuring Twilio:', error)
    }
    setIsConfiguring(false)
  }

  const handleDisconnectTwilio = async () => {
    try {
      await integrationManager.disconnectTwilio()
    } catch (error) {
      console.error('Error disconnecting Twilio:', error)
    }
  }

  const handleAccountSidChange = (e: ChangeEvent<HTMLInputElement>) => setAccountSid(e.target.value)
  const handleAuthTokenChange = (e: ChangeEvent<HTMLInputElement>) => setAuthToken(e.target.value)

  const twilioIntegration = activeIntegrations.find(i => i.id === 'twilio')

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Twilio</CardTitle>
            <CardDescription>
              Connect your Twilio account to enable call center features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {twilioIntegration ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnectTwilio}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Configure</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Twilio Integration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountSid">Account SID</Label>
                        <Input
                          id="accountSid"
                          value={accountSid}
                          onChange={handleAccountSidChange}
                          placeholder="Enter your Twilio Account SID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authToken">Auth Token</Label>
                        <Input
                          id="authToken"
                          type="password"
                          value={authToken}
                          onChange={handleAuthTokenChange}
                          placeholder="Enter your Twilio Auth Token"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleConfigureTwilio}
                        disabled={isConfiguring || !accountSid || !authToken}
                      >
                        {isConfiguring ? 'Configuring...' : 'Connect'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 