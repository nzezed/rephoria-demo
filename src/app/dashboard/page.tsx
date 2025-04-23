'use client'

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
} from '@tremor/react'

const data = [
  {
    date: '2024-01',
    'Total Calls': 456,
    'Avg Duration': 8.2,
    'Customer Satisfaction': 4.2,
  },
  {
    date: '2024-02',
    'Total Calls': 523,
    'Avg Duration': 7.8,
    'Customer Satisfaction': 4.4,
  },
  {
    date: '2024-03',
    'Total Calls': 589,
    'Avg Duration': 7.1,
    'Customer Satisfaction': 4.6,
  },
  // Add more mock data here
]

const kpis = {
  totalCalls: {
    metric: '2,345',
    progress: 85,
    target: '3,000',
    delta: '13.2%',
  },
  avgDuration: {
    metric: '7.2m',
    progress: 65,
    target: '6.5m',
    delta: '-8.1%',
  },
  satisfaction: {
    metric: '4.5/5',
    progress: 90,
    target: '4.8/5',
    delta: '+2.3%',
  },
}

export default function Dashboard() {
  return (
    <main>
      <Title>Dashboard</Title>
      <Text>Real-time overview of your call center performance.</Text>

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
                  <Metric>{kpis.totalCalls.metric}</Metric>
                  <BadgeDelta deltaType="increase">{kpis.totalCalls.delta}</BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({kpis.totalCalls.target})</Text>
                  <Text className="text-right">{kpis.totalCalls.progress}%</Text>
                </Flex>
                <ProgressBar value={kpis.totalCalls.progress} className="mt-2" />
              </Card>

              <Card>
                <Title>Average Call Duration</Title>
                <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
                  <Metric>{kpis.avgDuration.metric}</Metric>
                  <BadgeDelta deltaType="decrease">{kpis.avgDuration.delta}</BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({kpis.avgDuration.target})</Text>
                  <Text className="text-right">{kpis.avgDuration.progress}%</Text>
                </Flex>
                <ProgressBar value={kpis.avgDuration.progress} className="mt-2" />
              </Card>

              <Card>
                <Title>Customer Satisfaction</Title>
                <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
                  <Metric>{kpis.satisfaction.metric}</Metric>
                  <BadgeDelta deltaType="increase">{kpis.satisfaction.delta}</BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                  <Text>Progress to target ({kpis.satisfaction.target})</Text>
                  <Text className="text-right">{kpis.satisfaction.progress}%</Text>
                </Flex>
                <ProgressBar value={kpis.satisfaction.progress} className="mt-2" />
              </Card>
            </Grid>

            {/* Charts */}
            <div className="mt-6">
              <Card>
                <Title>Performance Trends</Title>
                <AreaChart
                  className="mt-4 h-72"
                  data={data}
                  index="date"
                  categories={['Total Calls', 'Avg Duration', 'Customer Satisfaction']}
                  colors={['blue', 'red', 'green']}
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Detailed Analytics</Title>
                <Text>Coming soon...</Text>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  )
} 