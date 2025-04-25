'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Grid,
  Metric,
  AreaChart,
  BadgeDelta,
  Flex,
  ProgressBar,
  type Color,
} from '@tremor/react'
import { integrationManager, useIntegrationStore } from '@/services/integration-manager'

interface DashboardData {
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

const chartColors: Record<string, Color> = {
  totalCalls: 'indigo',
  avgDuration: 'rose',
  satisfaction: 'emerald'
} as const

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const activeCallPlatform = useIntegrationStore((state) => state.getActiveCallPlatform())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const dashboardData = await integrationManager.fetchDashboardData()
      setData(dashboardData)
      setLoading(false)
    }

    fetchData()

    // Refresh data every minute if we have an active integration
    let interval: NodeJS.Timeout
    if (activeCallPlatform) {
      interval = setInterval(fetchData, 60000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activeCallPlatform])

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </Grid>
      </div>
    )
  }

  return (
    <main>
      <div className="space-y-2">
        <Title>Dashboard</Title>
        {activeCallPlatform ? (
          <Text>Real-time overview of your {activeCallPlatform.name} call center performance.</Text>
        ) : (
          <Text className="text-yellow-600">
            No call platform connected. Connect an integration to see real data. Showing placeholder data.
          </Text>
        )}
      </div>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
              {/* KPI Cards */}
              <Card>
                <Title>Total Calls</Title>
                <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
                  <Metric>{data.totalCalls.metric}</Metric>
                  <BadgeDelta deltaType={parseFloat(data.totalCalls.delta) >= 0 ? 'increase' : 'decrease'}>
                    {data.totalCalls.delta}
                  </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({data.totalCalls.target})</Text>
                  <Text className="text-right">{data.totalCalls.progress}%</Text>
                </Flex>
                <ProgressBar color={chartColors.totalCalls} value={data.totalCalls.progress} className="mt-2" />
              </Card>

              <Card>
                <Title>Average Call Duration</Title>
                <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
                  <Metric>{data.avgDuration.metric}</Metric>
                  <BadgeDelta deltaType={parseFloat(data.avgDuration.delta) >= 0 ? 'increase' : 'decrease'}>
                    {data.avgDuration.delta}
                  </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({data.avgDuration.target})</Text>
                  <Text className="text-right">{data.avgDuration.progress}%</Text>
                </Flex>
                <ProgressBar color={chartColors.avgDuration} value={data.avgDuration.progress} className="mt-2" />
              </Card>

              <Card>
                <Title>Customer Satisfaction</Title>
                <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
                  <Metric>{data.satisfaction.metric}</Metric>
                  <BadgeDelta deltaType={parseFloat(data.satisfaction.delta) >= 0 ? 'increase' : 'decrease'}>
                    {data.satisfaction.delta}
                  </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({data.satisfaction.target})</Text>
                  <Text className="text-right">{data.satisfaction.progress}%</Text>
                </Flex>
                <ProgressBar color={chartColors.satisfaction} value={data.satisfaction.progress} className="mt-2" />
              </Card>
            </Grid>

            {/* Charts */}
            <div className="mt-6">
              <Card>
                <Title>Performance Trends</Title>
                <AreaChart
                  className="mt-4 h-72"
                  data={data.trends}
                  index="date"
                  categories={['Total Calls', 'Avg Duration', 'Customer Satisfaction']}
                  colors={[chartColors.totalCalls, chartColors.avgDuration, chartColors.satisfaction]}
                  valueFormatter={(number: number) => number.toString()}
                  showLegend
                  showGridLines
                  startEndOnly
                  showYAxis
                  showXAxis
                  curveType="monotone"
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Detailed Analytics</Title>
                {activeCallPlatform ? (
                  <Text>Detailed analytics for {activeCallPlatform.name} coming soon...</Text>
                ) : (
                  <Text className="text-yellow-600">
                    Connect a call platform integration to view detailed analytics.
                  </Text>
                )}
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  )
} 