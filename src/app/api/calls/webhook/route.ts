import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Incoming webhook to create a new call record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { callId: externalId, recordingUrl, agentId, startTime, endTime } = body
    if (!externalId || !recordingUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Cast prisma to any to access call delegate
    const client = prisma as any
    const call = await client.call.create({
      data: {
        // store external ID in recordingUrl or add a field if needed
        recordingUrl,
        agentId: agentId || null,
        status: 'pending',
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null
      }
    })

    // Trigger asynchronous processing of this call (transcription & insights)
    try {
      const baseUrl = new URL(request.url).origin
      fetch(`${baseUrl}/api/calls/${call.id}/process`, { method: 'POST' }).catch(err => {
        console.error('Error triggering call processing:', err)
      })
    } catch (err) {
      console.error('Error constructing process URL:', err)
    }

    return NextResponse.json({ callId: call.id })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 