'use client'

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
  Legend,
  Color,
} from '@tremor/react'
import {
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'

// Mock data for call volume trends
const callVolumeTrends = [
  { date: '2024-01-01', 'Inbound Calls': 234, 'Outbound Calls': 156, 'Missed Calls': 12 },
  { date: '2024-01-02', 'Inbound Calls': 245, 'Outbound Calls': 143, 'Missed Calls': 8 },
  { date: '2024-01-03', 'Inbound Calls': 267, 'Outbound Calls': 165, 'Missed Calls': 15 },
  { date: '2024-01-04', 'Inbound Calls': 289, 'Outbound Calls': 158, 'Missed Calls': 11 },
  { date: '2024-01-05', 'Inbound Calls': 278, 'Outbound Calls': 172, 'Missed Calls': 9 },
]

// Mock data for customer satisfaction
const satisfactionData = [
  { rating: '5 Stars', percentage: 45 },
  { rating: '4 Stars', percentage: 30 },
  { rating: '3 Stars', percentage: 15 },
  { rating: '2 Stars', percentage: 7 },
  { rating: '1 Star', percentage: 3 },
]

// Mock data for call categories
const callCategories = [
  { category: 'Technical Support', calls: 450 },
  { category: 'Account Management', calls: 320 },
  { category: 'Billing Inquiries', calls: 280 },
  { category: 'Product Information', calls: 190 },
  { category: 'General Questions', calls: 160 },
]

// Mock data for hourly distribution
const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
  hour: i.toString().padStart(2, '0') + ':00',
  calls: Math.floor(Math.random() * 50) + 20,
}))

export default function AnalyticsPage() {
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
              <Metric>4m 32s</Metric>
            </div>
          </Flex>
          <ProgressBar value={75} color="blue" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="start" className="space-x-4">
            <UserGroupIcon className="h-8 w-8 text-emerald-500" />
            <div>
              <Text>First Call Resolution</Text>
              <Metric>84.2%</Metric>
            </div>
          </Flex>
          <ProgressBar value={84.2} color="emerald" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="start" className="space-x-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-amber-500" />
            <div>
              <Text>Customer Satisfaction</Text>
              <Metric>4.5/5.0</Metric>
            </div>
          </Flex>
          <ProgressBar value={90} color="amber" className="mt-3" />
        </Card>

        <Card decoration="top" decorationColor="rose">
          <Flex justifyContent="start" className="space-x-4">
            <ChartPieIcon className="h-8 w-8 text-rose-500" />
            <div>
              <Text>Service Level</Text>
              <Metric>92.8%</Metric>
            </div>
          </Flex>
          <ProgressBar value={92.8} color="rose" className="mt-3" />
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
                  data={callVolumeTrends}
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
                  data={hourlyDistribution}
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
                  data={satisfactionData}
                  category="percentage"
                  index="rating"
                  valueFormatter={(number: number) => `${number}%`}
                  colors={['emerald', 'blue', 'amber', 'orange', 'rose']}
                />
              </Card>
              <Card>
                <Title>Satisfaction Trends</Title>
                <div className="mt-4">
                  {satisfactionData.map((item) => (
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
            <Grid numItemsMd={2} className="gap-6 mt-6">
              <Card>
                <Title>Call Categories</Title>
                <Text>Distribution of calls by category</Text>
                <DonutChart
                  className="mt-4 h-80"
                  data={callCategories}
                  category="calls"
                  index="category"
                  valueFormatter={(number: number) => number.toString()}
                  colors={['blue', 'cyan', 'indigo', 'violet', 'fuchsia']}
                />
              </Card>
              <Card>
                <Title>Category Breakdown</Title>
                <div className="mt-4">
                  {callCategories.map((item, index) => (
                    <div key={item.category} className="mt-3">
                      <Flex>
                        <Text>{item.category}</Text>
                        <Text>{item.calls} calls</Text>
                      </Flex>
                      <ProgressBar
                        value={(item.calls / Math.max(...callCategories.map(c => c.calls))) * 100}
                        color={['blue', 'cyan', 'indigo', 'violet', 'fuchsia'][index] as Color}
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  )
} 