'use client';

import { Card, Title, Text, Button, TextInput, Badge } from '@tremor/react';
import { useState, useEffect } from 'react';

export default function TwilioIntegration() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    accountSid: '',
    authToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Generate webhook URL when component mounts
  useEffect(() => {
    const baseUrl = window.location.origin;
    setWebhookUrl(`${baseUrl}/api/integrations/twilio/webhook`);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'twilio',
          type: 'call_platform',
          config: {
            accountSid: credentials.accountSid,
            authToken: credentials.authToken,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to connect');
      
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
            <Button 
              loading={loading}
              onClick={handleConnect}
              disabled={!credentials.accountSid || !credentials.authToken}
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
              <li>Click on your phone number</li>
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