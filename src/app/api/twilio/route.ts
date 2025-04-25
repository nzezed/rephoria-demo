import { NextResponse } from 'next/server'
import twilio from 'twilio'
import type { CallInstance } from 'twilio/lib/rest/api/v2010/account/call'

export async function POST(request: Request) {
  try {
    const { accountSid, authToken } = await request.json()
    
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      )
    }

    const client = twilio(accountSid, authToken)
    const now = new Date()
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours

    // Fetch calls from the last 24 hours
    const calls: CallInstance[] = await client.calls.list({
      startTime: startDate,
      endTime: now
    })

    // Calculate metrics
    const totalCalls = calls.length
    const completedCalls = calls.filter(call => call.status === 'completed')
    const avgDurationMinutes = completedCalls.length > 0
      ? completedCalls.reduce((acc: number, call: CallInstance) => acc + (parseInt(call.duration || '0') || 0), 0) / completedCalls.length / 60
      : 0

    // Group calls by hour for trends
    const hourlyTrends = new Map()
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      hourlyTrends.set(hour.toISOString().split('T')[0], {
        'Total Calls': 0,
        'Avg Duration': 0,
        'Customer Satisfaction': 0
      })
    }

    calls.forEach((call: CallInstance) => {
      const date = new Date(call.startTime).toISOString().split('T')[0]
      const existing = hourlyTrends.get(date) || {
        'Total Calls': 0,
        'Avg Duration': 0,
        'Customer Satisfaction': 0
      }
      existing['Total Calls']++
      if (call.status === 'completed') {
        existing['Avg Duration'] = (existing['Avg Duration'] * (existing['Total Calls'] - 1) + parseInt(call.duration || '0') / 60) / existing['Total Calls']
      }
      hourlyTrends.set(date, existing)
    })

    // Convert trends to array
    const trends = Array.from(hourlyTrends.entries()).map(([date, data]) => ({
      date,
      ...data
    }))

    // Calculate progress and deltas compared to previous day
    const previousDayTotal = calls.filter((call: CallInstance) => {
      const callDate = new Date(call.startTime)
      return callDate < startDate && callDate >= new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
    }).length

    const totalDelta = previousDayTotal > 0
      ? ((totalCalls - previousDayTotal) / previousDayTotal * 100).toFixed(0)
      : '0'

    return NextResponse.json({
      totalCalls: {
        metric: totalCalls.toString(),
        progress: Math.min((totalCalls / 200) * 100, 100), // Assuming target is 200 calls
        target: '200',
        delta: `${totalDelta}%`,
      },
      avgDuration: {
        metric: `${avgDurationMinutes.toFixed(1)}m`,
        progress: Math.min((avgDurationMinutes / 5) * 100, 100), // Assuming target is 5 minutes
        target: '5m',
        delta: '+0%', // We could calculate this if needed
      },
      satisfaction: {
        metric: '4.2/5', // This would come from a separate survey integration
        progress: 84,
        target: '5/5',
        delta: '+0%',
      },
      trends: trends.reverse(), // Show most recent first
    })
  } catch (error) {
    console.error('Error fetching Twilio data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Twilio data' },
      { status: 500 }
    )
  }
} 