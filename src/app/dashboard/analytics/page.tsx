'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Title,
  Text,
  Tab,
  TabGroup,
  TabList,
  TabPanels,
  TabPanel,
  AreaChart,
  BarChart,
  DonutChart,
  Grid,
  Flex,
  Metric,
  ProgressBar,
} from '@tremor/react'
import {
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'
import { useIntegrationStore } from '@/services/integration-manager'

interface AnalyticsData {
  metrics: {
    avgHandleTime: { value: string; progress: number }
    firstCallResolution: { value: string; progress: number }
    customerSatisfaction: { value: string; progress: number }
    serviceLevel: { value: string; progress: number }
  }
  callVolumeTrends: Array<{
    date: string
    'Inbound Calls': number
    'Outbound Calls': number
    'Missed Calls': number
  }>
  hourlyDistribution: Array<{
    hour: string
    calls: number
  }>
  satisfactionData: Array<{
    rating: string
    percentage: number
  }>
  callCategories: Array<{
    category: string
    calls: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { getActiveCallPlatform } = useIntegrationStore()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const platform = getActiveCallPlatform()
        if (platform?.config) {
          const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(platform.config),
          })

          if (!response.ok) {
            throw new Error('Failed to fetch analytics data')
          }

          const analyticsData = await response.json()
          setData(analyticsData)
        } else {
          // Use placeholder data when no platform is connected
          setData({
            metrics: {
              avgHandleTime: { value: '0m 0s', progress: 0 },
              firstCallResolution: { value: '0%', progress: 0 },
              customerSatisfaction: { value: '0/5.0', progress: 0 },
              serviceLevel: { value: '0%', progress: 0 },
            },
            callVolumeTrends: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              'Inbound Calls': 0,
              'Outbound Calls': 0,
              'Missed Calls': 0,
            })),
            hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
              hour: i.toString().padStart(2, '0') + ':00',
              calls: 0,
            })),
            satisfactionData: [
              { rating: '5 Stars', percentage: 0 },
              { rating: '4 Stars', percentage: 0 },
              { rating: '3 Stars', percentage: 0 },
              { rating: '2 Stars', percentage: 0 },
              { rating: '1 Star', percentage: 0 },
            ],
            callCategories: [
              { category: 'Technical Support', calls: 0 },
              { category: 'Account Management', calls: 0 },
              { category: 'Billing Inquiries', calls: 0 },
              { category: 'Product Information', calls: 0 },
              { category: 'General Questions', calls: 0 },
            ],
          })
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      }
      setLoading(false)
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [getActiveCallPlatform])

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Text>Loading analytics data...</Text>
      </div>
    )
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Analytics Dashboard</Title>
        <Text>Comprehensive analysis of call center performance and trends.</Text>
      </div>

      {/* Key Metrics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div>
              <Text>Average Handle Time</Text>
              <Metric>{data.metrics.avgHandleTime.value}</Metric>
            </div>
          </Flex>
          <ProgressBar value={data.metrics.avgHandleTime.progress} color="blue" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="start" className="space-x-4">
            <UserGroupIcon className="h-8 w-8 text-emerald-500" />
            <div>
              <Text>First Call Resolution</Text>
              <Metric>{data.metrics.firstCallResolution.value}</Metric>
            </div>
          </Flex>
          <ProgressBar value={data.metrics.firstCallResolution.progress} color="emerald" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="start" className="space-x-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-amber-500" />
            <div>
              <Text>Customer Satisfaction</Text>
              <Metric>{data.metrics.customerSatisfaction.value}</Metric>
            </div>
          </Flex>
          <ProgressBar value={data.metrics.customerSatisfaction.progress} color="amber" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="rose">
          <Flex justifyContent="start" className="space-x-4">
            <ChartPieIcon className="h-8 w-8 text-rose-500" />
            <div>
              <Text>Service Level</Text>
              <Metric>{data.metrics.serviceLevel.value}</Metric>
            </div>
          </Flex>
          <ProgressBar value={data.metrics.serviceLevel.progress} color="rose" className="mt-3" />
        </Card>
      </Grid>

      {/* Detailed Analytics */}
      <TabGroup>
        <TabList>
          <Tab>Call Volume</Tab>
          <Tab>Customer Satisfaction</Tab>
          <Tab>Call Distribution</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Call Volume Trends</Title>
                <Text>Daily breakdown of call volumes by type</Text>
                <AreaChart
                  className="mt-4 h-72"
                  data={data.callVolumeTrends}
                  index="date"
                  categories={['Inbound Calls', 'Outbound Calls', 'Missed Calls']}
                  colors={['blue', 'emerald', 'rose']}
                  valueFormatter={(number: number) => number.toString()}
                />
              </Card>
              <Card className="mt-6">
                <Title>Hourly Call Distribution</Title>
                <Text>Number of calls received per hour</Text>
                <BarChart
                  className="mt-4 h-72"
                  data={data.hourlyDistribution}
                  index="hour"
                  categories={['calls']}
                  colors={['blue']}
                  valueFormatter={(number: number) => number.toString()}
                />
              </Card>
            </div>
          </TabPanel>

          <TabPanel>
            <Grid numItemsMd={2} className="gap-6 mt-6">
              <Card>
                <Title>Customer Satisfaction Distribution</Title>
                <Text>Breakdown of customer ratings</Text>
                <DonutChart
                  className="mt-4 h-80"
                  data={data.satisfactionData}
                  category="percentage"
                  index="rating"
                  valueFormatter={(number: number) => `${number}%`}
                  colors={['emerald', 'blue', 'amber', 'orange', 'rose']}
                />
              </Card>
              <Card>
                <Title>Satisfaction Trends</Title>
                <div className="mt-4">
                  {data.satisfactionData.map((item) => (
                    <div key={item.rating} className="mt-3">
                      <Flex>
                        <Text>{item.rating}</Text>
                        <Text>{item.percentage}%</Text>
                      </Flex>
                      <ProgressBar
                        value={item.percentage}
                        color={
                          item.rating.startsWith('5')
                            ? 'emerald'
                            : item.rating.startsWith('4')
                            ? 'blue'
                            : item.rating.startsWith('3')
                            ? 'amber'
                            : item.rating.startsWith('2')
                            ? 'orange'
                            : 'rose'
                        }
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Card className="mt-6">
              <Title>Call Categories</Title>
              <Text>Distribution of calls by category</Text>
              <BarChart
                className="mt-4 h-80"
                data={data.callCategories}
                index="category"
                categories={['calls']}
                colors={['blue']}
                valueFormatter={(number: number) => number.toString()}
                layout="vertical"
              />
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  )
} 