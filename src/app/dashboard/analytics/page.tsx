'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Text,
  Grid,
  Col,
  Metric,
  ProgressBar,
  Flex,
  Badge,
  List,
  ListItem,
  BarChart,
  LineChart,
} from '@tremor/react'
import { useIntegrationStore } from '@/services/integration-manager'

interface AnalyticsData {
  totalCalls: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  avgDuration: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  satisfaction: {
    metric: string
    progress: number
    target: string
    delta: string
  }
  trends: {
    date: string
    'Total Calls': number
    'Avg Duration': number
    'Customer Satisfaction': number
  }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { getActiveCallPlatform } = useIntegrationStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const platform = getActiveCallPlatform()
        if (!platform) {
          setData(null)
          return
        }

        // Fetch data from the API
        const response = await fetch('/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (error) {
        console.error('Error loading analytics:', error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [getActiveCallPlatform])

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>Loading analytics...</Title>
          <Text>Please wait while we fetch the latest data.</Text>
        </Card>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>No active call platform</Title>
          <Text>Please configure and connect a call platform to view analytics.</Text>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Grid numItemsLg={3} className="gap-6 mb-6">
        <Card>
          <Title>Total Calls</Title>
          <Metric>{data.totalCalls.metric}</Metric>
          <Text>Target: {data.totalCalls.target}</Text>
          <ProgressBar value={data.totalCalls.progress} className="mt-2" />
          <Text className="mt-2">Change: {data.totalCalls.delta}</Text>
        </Card>
        <Card>
          <Title>Average Duration</Title>
          <Metric>{data.avgDuration.metric}</Metric>
          <Text>Target: {data.avgDuration.target}</Text>
          <ProgressBar value={data.avgDuration.progress} className="mt-2" />
          <Text className="mt-2">Change: {data.avgDuration.delta}</Text>
        </Card>
        <Card>
          <Title>Customer Satisfaction</Title>
          <Metric>{data.satisfaction.metric}</Metric>
          <Text>Target: {data.satisfaction.target}</Text>
          <ProgressBar value={data.satisfaction.progress} className="mt-2" />
          <Text className="mt-2">Change: {data.satisfaction.delta}</Text>
        </Card>
      </Grid>

      <Grid numItemsLg={1} className="gap-6">
        <Card>
          <Title>Trends</Title>
          <LineChart
            className="mt-6"
            data={data.trends}
            index="date"
            categories={['Total Calls', 'Avg Duration', 'Customer Satisfaction']}
            colors={['blue', 'orange', 'emerald']}
          />
        </Card>
      </Grid>
    </main>
  )
} 