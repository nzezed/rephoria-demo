import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'

export async function GET() {
  try {
    // Find the active Twilio integration
    const integration = await prisma.integration.findFirst({
      where: {
        provider: 'twilio',
        status: 'connected'
      }
    })

    if (!integration?.config) {
      return NextResponse.json({
        error: 'No active Twilio integration found'
      }, { status: 404 })
    }

    const config = integration.config as any
    if (!config.accountId || !config.apiKey) {
      return NextResponse.json({
        error: 'Invalid Twilio configuration'
      }, { status: 400 })
    }

    // Initialize Twilio client
    const client = twilio(config.accountId, config.apiKey)
    
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch calls for today
    const calls = await client.calls.list({
      startTime: today,
      endTime: tomorrow,
    })

    // Calculate metrics
    const totalCalls = calls.length
    const completedCalls = calls.filter(call => call.status === 'completed')
    const avgDurationSec = completedCalls.length > 0
      ? completedCalls.reduce((acc, call) => acc + (parseInt(call.duration) || 0), 0) / completedCalls.length
      : 0
    const avgDurationMin = Math.round(avgDurationSec / 60)

    // Get last 7 days of data for trends
    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const daysCalls = await client.calls.list({
        startTime: date,
        endTime: nextDay,
      })

      const dayCompletedCalls = daysCalls.filter(call => call.status === 'completed')
      const dayAvgDuration = dayCompletedCalls.length > 0
        ? dayCompletedCalls.reduce((acc, call) => acc + (parseInt(call.duration) || 0), 0) / dayCompletedCalls.length / 60
        : 0

      trendData.push({
        date: date.toISOString().split('T')[0],
        'Total Calls': daysCalls.length,
        'Avg Duration': Math.round(dayAvgDuration),
        'Customer Satisfaction': 0, // Twilio doesn't provide this directly
      })
    }

    return NextResponse.json({
      totalCalls: {
        metric: totalCalls.toString(),
        progress: Math.min(100, (totalCalls / 100) * 100),
        target: '100',
        delta: '0%', // We'd need historical data to calculate this
      },
      avgDuration: {
        metric: `${avgDurationMin}m`,
        progress: Math.min(100, (avgDurationMin / 5) * 100),
        target: '5m',
        delta: '0%',
      },
      satisfaction: {
        metric: '0/5', // Twilio doesn't provide this directly
        progress: 0,
        target: '5/5',
        delta: '0%',
      },
      trends: trendData,
    })
  } catch (error) {
    console.error('Error fetching Twilio data:', error)
    return NextResponse.json({
      error: 'Failed to fetch Twilio data'
    }, { status: 500 })
  }
} 