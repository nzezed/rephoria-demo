import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/integrations
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Cast prisma to any to access integration delegate
    const integrations = await (prisma as any).integration.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(integrations)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

// POST /api/integrations  (create or update)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { provider, type, config, status } = body
  if (!provider || !type) {
    return NextResponse.json({ error: 'Provider and type are required' }, { status: 400 })
  }

  try {
    // Cast prisma to any for integration delegate
    const existing = await (prisma as any).integration.findFirst({
      where: { organizationId: session.user.organizationId, provider }
    })

    let integration
    if (existing) {
      integration = await (prisma as any).integration.update({
        where: { id: existing.id },
        data: {
          config,
          status: status || 'connected',
          lastSync: new Date()
        }
      })
    } else {
      integration = await (prisma as any).integration.create({
        data: {
          organizationId: session.user.organizationId,
          provider,
          type,
          config,
          status: status || 'connected',
          lastSync: new Date()
        }
      })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error saving integration:', error)
    return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 })
  }
}

// DELETE /api/integrations (disconnect)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { integrationId } = await request.json()
  if (!integrationId) {
    return NextResponse.json({ error: 'Missing integration ID' }, { status: 400 })
  }

  try {
    // Cast prisma to any for integration delegate
    const existing = await (prisma as any).integration.findFirst({
      where: { organizationId: session.user.organizationId, id: integrationId }
    })
    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }
    await (prisma as any).integration.delete({ where: { id: integrationId } })
    return NextResponse.json({ status: 'disconnected' })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('id')

    if (integrationId) {
      // Return specific integration status
      const config = integrationConfigs[integrationId]
      if (!config) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        status: config.status,
        lastSync: config.lastSync
      })
    }

    // Return all integration statuses
    return NextResponse.json(
      Object.entries(integrationConfigs).reduce((acc, [id, config]) => ({
        ...acc,
        [id]: {
          status: config.status,
          lastSync: config.lastSync
        }
      }), {})
    )
  } catch (error) {
    console.error('Error fetching integration status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration status' },
      { status: 500 }
    )
  }
} 