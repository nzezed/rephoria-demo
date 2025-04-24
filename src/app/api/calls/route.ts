import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Cast prisma to any to access the `call` delegate
    const calls = await (prisma as any).call.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json(calls)
  } catch (err) {
    console.error('Error fetching calls:', err)
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    // Cast prisma to any to access the `call` delegate
    const call = await (prisma as any).call.create({
      data: {
        organizationId: session.user.organizationId,
        agentId: body.agentId || null,
        recordingUrl: body.recordingUrl || null,
        status: body.status || 'pending',
        startTime: new Date(),
        endTime: body.endTime ? new Date(body.endTime) : null
      }
    })
    return NextResponse.json(call)
  } catch (err) {
    console.error('Error creating call:', err)
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
  }
} 