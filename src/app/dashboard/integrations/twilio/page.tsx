'use client';

import { Card, Title, Text, Button, TextInput, Badge } from '@tremor/react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TwilioIntegration() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [webhookUrl, setWebhookUrl] = useState('');
  const { data: session } = useSession();

  // Generate webhook URL when component mounts
  useEffect(() => {
    if (session?.user?.organizationId) {
      const baseUrl = window.location.origin;
      setWebhookUrl(`${baseUrl}/api/integrations/twilio/webhook?organizationId=${session.user.organizationId}`);
    }
  }, [session]);

  const handleConnect = async () => {
    if (!session?.user?.organizationId) {
      console.error('No organization ID found');
      return;
    }

    setLoading(true);
    try {
      // First, find the existing Twilio integration
      const response = await fetch('/api/integrations');
      const integrations = await response.json();
      const existingTwilio = integrations.find((i: any) => i.provider === 'twilio');

      if (existingTwilio) {
        // Update existing integration
        const updateResponse = await fetch('/api/integrations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingTwilio.id,
            status: 'connected',
            config: {
              accountSid: credentials.accountSid,
              authToken: credentials.authToken,
              phoneNumber: credentials.phoneNumber,
              webhookUrl: webhookUrl
            },
            lastSync: new Date(),
          }),
        });

        if (!updateResponse.ok) throw new Error('Failed to update integration');
      } else {
        // Create new integration if none exists
        const createResponse = await fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'twilio',
            name: 'Twilio',
            type: 'call_platform',
            organizationId: session.user.organizationId,
            config: {
              accountSid: credentials.accountSid,
              authToken: credentials.authToken,
              phoneNumber: credentials.phoneNumber,
              webhookUrl: webhookUrl
            },
            status: 'connected',
          }),
        });

        if (!createResponse.ok) throw new Error('Failed to create integration');
      }
      
      setStatus('connected');
      setStep(3);
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 md:p-10 mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Title>Twilio Integration</Title>
        <Badge color={status === 'connected' ? 'green' : 'red'}>
          {status === 'connected' ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Step 1: Introduction */}
        <Card className={step !== 1 ? 'opacity-50' : ''}>
          <Title>Step 1: Prepare Your Twilio Account</Title>
          <Text className="mt-2">
            Before connecting Twilio to Rephoria, make sure you have:
          </Text>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>A Twilio account (create one at twilio.com if needed)</li>
            <li>Access to your Twilio Account SID and Auth Token</li>
            <li>A Twilio phone number to make calls from</li>
            <li>Permission to configure webhooks in your Twilio account</li>
          </ul>
          <Button 
            className="mt-4"
            onClick={() => setStep(2)}
          >
            I'm Ready
          </Button>
        </Card>

        {/* Step 2: Credentials */}
        <Card className={step !== 2 ? 'opacity-50' : ''}>
          <Title>Step 2: Connect Your Twilio Account</Title>
          <div className="mt-4 space-y-4">
            <div>
              <Text>Account SID</Text>
              <TextInput
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={credentials.accountSid}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  accountSid: e.target.value
                }))}
              />
            </div>
            <div>
              <Text>Auth Token</Text>
              <TextInput
                type="password"
                placeholder="Your Twilio Auth Token"
                value={credentials.authToken}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  authToken: e.target.value
                }))}
              />
            </div>
            <div>
              <Text>Phone Number</Text>
              <TextInput
                placeholder="+1234567890"
                value={credentials.phoneNumber}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  phoneNumber: e.target.value
                }))}
              />
              <Text className="mt-1 text-sm text-gray-500">
                Enter your Twilio phone number in E.164 format (e.g., +1234567890)
              </Text>
            </div>
            <Button 
              loading={loading}
              onClick={handleConnect}
              disabled={!credentials.accountSid || !credentials.authToken || !credentials.phoneNumber}
            >
              Connect Twilio
            </Button>
          </div>
        </Card>

        {/* Step 3: Webhook Configuration */}
        <Card className={step !== 3 ? 'opacity-50' : ''}>
          <Title>Step 3: Configure Webhooks</Title>
          <Text className="mt-2">
            Configure your Twilio phone numbers to use this webhook URL:
          </Text>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg font-mono text-sm break-all">
            {webhookUrl}
          </div>
          <div className="mt-4 space-y-2">
            <Text>To complete setup:</Text>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Go to your Twilio Console</li>
              <li>Navigate to Phone Numbers → Manage → Active numbers</li>
              <li>Click on your phone number ({credentials.phoneNumber})</li>
              <li>Under "Voice & Fax", paste the webhook URL above into "A Call Comes In"</li>
              <li>Save your changes</li>
            </ol>
          </div>
          <Button 
            className="mt-4"
            variant="secondary"
            onClick={() => window.open('https://www.twilio.com/console/phone-numbers/incoming', '_blank')}
          >
            Open Twilio Console
          </Button>
        </Card>
      </div>
    </main>
  );
} 