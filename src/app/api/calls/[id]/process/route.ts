import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { writeFileSync, unlinkSync, createReadStream } from 'fs'
import { join } from 'path'

// Disable static prerendering for this dynamic API route
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Cast prisma to any to access model delegates
const client = prisma as any

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Initialize OpenAI inside handler to avoid build-time env issues
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey })

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callId = params.id
  // Fetch call and verify tenant
  const call = await client.call.findUnique({
    where: { id: callId },
    include: { organization: true }
  })
  if (!call || call.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Call not found' }, { status: 404 })
  }
  if (!call.recordingUrl) {
    return NextResponse.json({ error: 'No recording URL for this call' }, { status: 400 })
  }
  // Ensure recordingUrl is string
  const recordingUrl = call.recordingUrl as string

  // Download audio and run Whisper
  const tempPath = join('/tmp', `call-${callId}.wav`)
  try {
    const res = await fetch(recordingUrl)
    const buffer = Buffer.from(await res.arrayBuffer())
    writeFileSync(tempPath, buffer)

    const transcriptionRes = await openai.audio.transcriptions.create({
      file: createReadStream(tempPath),
      model: 'whisper-1'
    })
    const text = transcriptionRes.text

    // Store transcript
    await client.transcript.upsert({
      where: { callId: callId },
      create: { callId, text },
      update: { text }
    })

    // Run GPT analysis
    const analysisRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a call center analytics assistant.' },
        { role: 'user', content: `Analyze this call transcript and extract insights: ${text}` }
      ],
      response_format: { type: 'json_object' }
    })
    // Parse analysis content with non-null assertion
    const analysis = JSON.parse(analysisRes.choices[0].message.content!)

    // Store insights
    if (Array.isArray(analysis.insights)) {
      for (const ins of analysis.insights) {
        await client.insight.create({
          data: {
            callId,
            type: ins.type,
            content: ins.content,
            importance: ins.importance
          }
        })
      }
    }

    // Update call status
    await client.call.update({ where: { id: callId }, data: { status: 'processed' } })

    return NextResponse.json({ status: 'processed' })
  } catch (error) {
    console.error('Error processing call:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  } finally {
    try { unlinkSync(tempPath) } catch {} // cleanup
  }
} 