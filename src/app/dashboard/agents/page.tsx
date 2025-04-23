'use client'

import {
  Card,
  Title,
  Text,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Metric,
  ProgressBar,
  Flex,
  BadgeDelta,
  BarList,
  DonutChart,
  Legend,
} from '@tremor/react'
import {
  UserCircleIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const mockAgents = [
  {
    id: 1,
    name: 'Sarah Miller',
    avatar: '👩',
    role: 'Senior Agent',
    metrics: {
      callsHandled: 245,
      avgCallDuration: '4:30',
      satisfaction: 4.8,
      resolution: 92,
    },
    performance: {
      current: 94,
      previous: 88,
    },
    callTypes: [
      { name: 'Technical Support', value: 45 },
      { name: 'Account Issues', value: 30 },
      { name: 'Billing Questions', value: 15 },
      { name: 'General Inquiries', value: 10 },
    ],
  },
  {
    id: 2,
    name: 'John Davis',
    avatar: '👨',
    role: 'Customer Support',
    metrics: {
      callsHandled: 198,
      avgCallDuration: '5:15',
      satisfaction: 4.6,
      resolution: 88,
    },
    performance: {
      current: 86,
      previous: 82,
    },
    callTypes: [
      { name: 'Technical Support', value: 30 },
      { name: 'Account Issues', value: 40 },
      { name: 'Billing Questions', value: 20 },
      { name: 'General Inquiries', value: 10 },
    ],
  },
  {
    id: 3,
    name: 'Emily Chen',
    avatar: '👩',
    role: 'Technical Support',
    metrics: {
      callsHandled: 212,
      avgCallDuration: '6:00',
      satisfaction: 4.7,
      resolution: 90,
    },
    performance: {
      current: 89,
      previous: 85,
    },
    callTypes: [
      { name: 'Technical Support', value: 60 },
      { name: 'Account Issues', value: 20 },
      { name: 'Billing Questions', value: 10 },
      { name: 'General Inquiries', value: 10 },
    ],
  },
]

const categories = [
  { name: 'Technical Support', color: 'blue' },
  { name: 'Account Issues', color: 'emerald' },
  { name: 'Billing Questions', color: 'amber' },
  { name: 'General Inquiries', color: 'rose' },
]

export default function AgentsPage() {
  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Agent Performance</Title>
        <Text>Monitor and analyze agent metrics and performance trends.</Text>
      </div>

      {/* Leaderboard Section */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <TrophyIcon className="h-6 w-6 text-amber-500" />
          <Title>Top Performers</Title>
        </div>
        <div className="space-y-4">
          {mockAgents
            .sort((a, b) => b.performance.current - a.performance.current)
            .map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
              >
                <Flex>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl" role="img" aria-label="Agent Avatar">
                      {agent.avatar}
                    </span>
                    <div>
                      <Text className="font-medium">{agent.name}</Text>
                      <Text className="text-sm text-gray-500">{agent.role}</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Metric>{agent.performance.current}%</Metric>
                    <BadgeDelta
                      deltaType={
                        agent.performance.current - agent.performance.previous > 0
                          ? 'increase'
                          : 'decrease'
                      }
                    >
                      {agent.performance.current - agent.performance.previous}%
                    </BadgeDelta>
                  </div>
                </Flex>
                <ProgressBar
                  value={agent.performance.current}
                  color="blue"
                  className="mt-3"
                />
              </div>
            ))}
        </div>
      </Card>

      {/* Detailed Metrics */}
      <TabGroup>
        <TabList>
          <Tab icon={UserCircleIcon}>Individual Performance</Tab>
          <Tab icon={ChartBarIcon}>Team Analytics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
              {mockAgents.map((agent) => (
                <Card key={agent.id}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl" role="img" aria-label="Agent Avatar">
                      {agent.avatar}
                    </span>
                    <div>
                      <Title>{agent.name}</Title>
                      <Text>{agent.role}</Text>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Flex>
                        <Text>Calls Handled</Text>
                        <Metric>{agent.metrics.callsHandled}</Metric>
                      </Flex>
                      <ProgressBar
                        value={(agent.metrics.callsHandled / 300) * 100}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Flex>
                        <Text>Customer Satisfaction</Text>
                        <Metric>{agent.metrics.satisfaction}/5.0</Metric>
                      </Flex>
                      <ProgressBar
                        value={(agent.metrics.satisfaction / 5) * 100}
                        color="emerald"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Title className="mb-2">Call Distribution</Title>
                      <DonutChart
                        data={agent.callTypes}
                        category="value"
                        index="name"
                        valueFormatter={(value: number) => `${value}%`}
                        colors={['blue', 'emerald', 'amber', 'rose']}
                        className="h-40"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid numItemsMd={2} className="gap-6 mt-6">
              <Card>
                <Title>Team Performance Overview</Title>
                <div className="mt-4">
                  <DonutChart
                    data={categories.map((cat) => ({
                      name: cat.name,
                      value: mockAgents.reduce(
                        (acc, agent) =>
                          acc +
                          (agent.callTypes.find((t) => t.name === cat.name)
                            ?.value || 0),
                        0
                      ),
                    }))}
                    category="value"
                    index="name"
                    valueFormatter={(value: number) => `${value} calls`}
                    colors={['blue', 'emerald', 'amber', 'rose']}
                    className="h-60"
                  />
                </div>
                <Legend
                  categories={categories.map((cat) => cat.name)}
                  colors={categories.map((cat) => cat.color)}
                  className="mt-4"
                />
              </Card>
              <Card>
                <Title>Resolution Rates</Title>
                <div className="mt-4">
                  {mockAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <span role="img" aria-label="Agent Avatar" className="text-xl">
                          {agent.avatar}
                        </span>
                        <Text>{agent.name}</Text>
                      </div>
                      <Text>{agent.metrics.resolution}%</Text>
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