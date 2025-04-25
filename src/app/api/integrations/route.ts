import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Integration } from '@/services/integration-manager'

// Always fetch fresh data
export const dynamic = 'force-dynamic'

const DEFAULT_INTEGRATIONS = [
  {
    provider: 'twilio',
    name: 'Twilio',
    type: 'call_platform',
    status: 'disconnected',
  },
  {
    provider: 'five9',
    name: 'Five9',
    type: 'call_platform',
    status: 'disconnected',
  },
  {
    provider: 'genesys',
    name: 'Genesys',
    type: 'call_platform',
    status: 'disconnected',
  },
  {
    provider: 'salesforce',
    name: 'Salesforce',
    type: 'crm',
    status: 'disconnected',
  },
  {
    provider: 'hubspot',
    name: 'HubSpot',
    type: 'crm',
    status: 'disconnected',
  },
  {
    provider: 'zendesk',
    name: 'Zendesk',
    type: 'crm',
    status: 'disconnected',
  },
]

// GET /api/integrations
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Check if we have any integrations
    const count = await prisma.integration.count({
      where: { organizationId: session.user.organizationId }
    })

    // If no integrations exist, create the default ones
    if (count === 0) {
      await prisma.integration.createMany({
        data: DEFAULT_INTEGRATIONS.map(integration => ({
          ...integration,
          organizationId: session.user.organizationId,
        })),
      })
    }

    // Fetch all integrations
    const integrations = await prisma.integration.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(integrations)
  } catch (err) {
    console.error('Error fetching integrations:', err)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

// POST /api/integrations
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { provider, type, config, status } = await request.json()
  if (!provider || !type) {
    return NextResponse.json({ error: 'Provider and type are required' }, { status: 400 })
  }
  try {
    const integration = await prisma.integration.create({
      data: {
        organizationId: session.user.organizationId,
        provider,
        type,
        config,
        status: status || 'connected',
        lastSync: new Date(),
      },
    })
    return NextResponse.json(integration)
  } catch (err) {
    console.error('Error creating integration:', err)
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
  }
}

// DELETE /api/integrations
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
    const existing = await prisma.integration.findFirst({
      where: { organizationId: session.user.organizationId, id: integrationId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }
    await prisma.integration.delete({ where: { id: integrationId } })
    return NextResponse.json({ status: 'disconnected' })
  } catch (err) {
    console.error('Error deleting integration:', err)
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
  }
}

// Update an integration
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const integration = await request.json() as Integration

    // Verify the integration belongs to the user's organization
    const existing = await prisma.integration.findFirst({
      where: { 
        id: integration.id,
        organizationId: session.user.organizationId 
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Update the integration in the database
    const updated = await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: integration.status,
        config: integration.config,
        lastSync: integration.lastSync,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 })
  }
}