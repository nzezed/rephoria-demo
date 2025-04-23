import { NextResponse } from 'next/server'

// In a real application, these would be stored in a database
let integrationConfigs: Record<string, any> = {}

export async function POST(request: Request) {
  try {
    const { integrationId, config } = await request.json()

    // Validate required fields
    if (!integrationId || !config.apiKey || !config.accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real application, this would:
    // 1. Validate the credentials with the actual service
    // 2. Store the encrypted credentials in a database
    // 3. Set up necessary webhooks or listeners
    // 4. Initialize any required client libraries

    // For demo purposes, we'll just store the config
    integrationConfigs[integrationId] = {
      ...config,
      status: 'connected',
      lastSync: new Date().toISOString()
    }

    return NextResponse.json({
      status: 'connected',
      lastSync: integrationConfigs[integrationId].lastSync
    })
  } catch (error) {
    console.error('Error connecting integration:', error)
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { integrationId } = await request.json()

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integration ID' },
        { status: 400 }
      )
    }

    // In a real application, this would:
    // 1. Remove webhooks and listeners
    // 2. Clean up any resources
    // 3. Update the database

    delete integrationConfigs[integrationId]

    return NextResponse.json({ status: 'disconnected' })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    )
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