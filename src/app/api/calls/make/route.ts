import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the phone number to call from the request body
    const { to } = await request.json()
    if (!to) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Find the active Twilio integration
    const integration = await prisma.integration.findFirst({
      where: {
        provider: 'twilio',
        status: 'connected',
        organizationId: session.user.organizationId
      }
    })

    if (!integration?.config) {
      return NextResponse.json({ 
        error: 'No active Twilio integration found. Please check your integration settings.' 
      }, { status: 404 })
    }

    const config = integration.config as any
    if (!config.accountSid || !config.authToken) {
      return NextResponse.json({ 
        error: 'Invalid Twilio configuration. Please check your integration settings.' 
      }, { status: 400 })
    }

    // Get the Twilio phone number from the integration config
    const phoneNumber = config.phoneNumber || config.fromNumber
    if (!phoneNumber) {
      return NextResponse.json({ 
        error: 'No Twilio phone number configured. Please check your integration settings.' 
      }, { status: 400 })
    }

    // Get the webhook URL from the integration config
    const webhookUrl = config.webhookUrl
    if (!webhookUrl) {
      return NextResponse.json({ 
        error: 'No webhook URL configured. Please check your integration settings.' 
      }, { status: 400 })
    }

    // Initialize Twilio client
    const client = twilio(config.accountSid, config.authToken)

    // Make the call
    const call = await client.calls.create({
      to,
      from: phoneNumber,
      url: webhookUrl,
      statusCallback: webhookUrl,
      record: true, // Record the call
    })

    return NextResponse.json({ 
      message: 'Call initiated successfully',
      callSid: call.sid
    })
  } catch (error) {
    console.error('Error making call:', error)
    return NextResponse.json({ 
      error: 'Failed to make call. Please check your Twilio configuration and try again.' 
    }, { status: 500 })
  }
} 