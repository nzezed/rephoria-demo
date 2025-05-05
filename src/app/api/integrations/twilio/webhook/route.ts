import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { headers } from 'next/headers';
import type { Prisma, Integration } from '@prisma/client';

// Twilio TwiML helper
const VoiceResponse = twilio.twiml.VoiceResponse;

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

function isTwilioConfig(config: unknown): config is TwilioConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;
  return typeof c.accountSid === 'string' && typeof c.authToken === 'string' && typeof c.phoneNumber === 'string';
}

/**
 * Validates that the incoming request is from Twilio using stored credentials
 */
async function validateTwilioRequest(webhookUrl: string, params: any, twilioSignature: string | null): Promise<boolean> {
  if (!twilioSignature) {
    console.error('No Twilio signature found in request')
    return false
  }

  try {
    // Find the active Twilio integration
    const integration = await prisma.integration.findFirst({
      where: {
        provider: 'twilio',
        status: 'connected',
        organizationId: params.organizationId
      }
    });

    if (!integration?.config) {
      console.error('No active Twilio integration found')
      return false
    }

    // Use the stored auth token from the integration config
    const configData = integration.config as unknown
    if (!isTwilioConfig(configData)) {
      console.error('Invalid Twilio configuration')
      return false
    }

    const authToken = configData.authToken
    if (!authToken) {
      console.error('No Twilio auth token found in integration config')
      return false
    }

    // Validate the request using the stored auth token
    const validator = twilio.webhook(authToken)
    const isValid = validator(webhookUrl, params, twilioSignature)
    return Boolean(isValid)
  } catch (error) {
    console.error('Error validating Twilio webhook:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const params = await request.json()
  const twilioSignature = request.headers.get('X-Twilio-Signature')
  const webhookUrl = request.url
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId')

  if (!organizationId) {
    return new Response('Organization ID is required', { status: 400 })
  }

  // Validate the request is from Twilio
  const isValid = await validateTwilioRequest(webhookUrl, { organizationId }, twilioSignature)
  if (!isValid) {
    return new Response('Invalid signature', { status: 403 })
  }

  try {
    // Process the webhook data
    console.log('Received valid Twilio webhook:', params);

    const callSid = params.CallSid;
    const callStatus = params.CallStatus;

    if (!callSid) {
      console.error('CallSid is missing in the webhook payload');
      return new Response('CallSid is missing', { status: 400 });
    }

    // Try to find the existing call or create a new one
    const call = await prisma.call.upsert({
      where: { twilioCallSid: callSid },
      update: {
        status: callStatus,
      },
      create: {
        twilioCallSid: callSid,
        status: callStatus,
        startTime: new Date(),
        organization: {
          connect: {
            id: organizationId
          }
        }
      }
    });

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Handle recording status updates
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const headersList = headers();
    
    // Validate the request is from Twilio
    const isValid = await validateTwilioRequest(
      request.url, 
      {}, 
      request.headers.get('X-Twilio-Signature')
    );
    
    if (!isValid) {
      console.error('Invalid Twilio signature');
      return new NextResponse('Invalid signature', { status: 403 });
    }
    
    const formData = await request.formData();
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;

    if (!callId) {
      return new NextResponse('Call ID required', { status: 400 });
    }

    // Update call with recording URL
    await prisma.call.update({
      where: { id: callId },
      data: {
        recordingUrl,
        status: recordingStatus === 'completed' ? 'completed' : 'in-progress',
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error updating recording status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
