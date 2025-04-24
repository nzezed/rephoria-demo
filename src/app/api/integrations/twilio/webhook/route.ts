import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { headers } from 'next/headers';

// Twilio TwiML helper
const VoiceResponse = twilio.twiml.VoiceResponse;

// Validate that the request is coming from Twilio
function validateTwilioRequest(request: Request, headersList: Headers) {
  const twilioSignature = headersList.get('x-twilio-signature');
  const webhookUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/integrations/twilio/webhook`
    : `${process.env.NEXTAUTH_URL}/api/integrations/twilio/webhook`;

  // Get the raw body and validate the request
  const validator = twilio.webhook(process.env.TWILIO_WEBHOOK_SECRET);
  return validator(webhookUrl, params, twilioSignature);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const headersList = headers();
    
    // Validate the request is from Twilio
    if (!validateTwilioRequest(request, headersList)) {
      console.error('Invalid Twilio signature');
      return new NextResponse('Invalid signature', { status: 403 });
    }
    
    // Extract call information from Twilio's request
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const direction = formData.get('Direction') as string;
    
    // Get organization based on the Twilio number (To number for incoming calls)
    const integration = await prisma.integration.findFirst({
      where: {
        provider: 'twilio',
        status: 'connected',
        phoneNumbers: {
          has: to
        }
      },
      include: {
        organization: true,
      },
    });

    if (!integration) {
      console.error(`No organization found for Twilio number ${to}`);
      return new NextResponse('Organization not found', { status: 404 });
    }

    // Create a new call record
    const call = await prisma.call.create({
      data: {
        organizationId: integration.organizationId,
        status: 'in-progress',
        startTime: new Date(),
        // Find an available agent or leave it null for now
        // agentId: availableAgent?.id,
        recordingUrl: null, // Will be updated when recording is available
      },
    });

    // Generate TwiML response
    const twiml = new VoiceResponse();
    
    // Start recording
    twiml.record({
      action: `/api/integrations/twilio/recording-status?callId=${call.id}`,
      recordingStatusCallback: `/api/integrations/twilio/recording-ready?callId=${call.id}`,
      playBeep: false,
      trim: 'trim-silence',
    });

    // Return TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle recording status updates
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const formData = await request.formData();
    const headersList = headers();
    
    // Validate the request is from Twilio
    if (!validateTwilioRequest(request, headersList)) {
      console.error('Invalid Twilio signature');
      return new NextResponse('Invalid signature', { status: 403 });
    }
    
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