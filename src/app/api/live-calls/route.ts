import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty data when no integration is connected
    const emptyData = {
      activeCalls: []
    }

    return NextResponse.json(emptyData)
  } catch (error) {
    console.error('Error in live-calls API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live call data' },
      { status: 500 }
    )
  }
} 