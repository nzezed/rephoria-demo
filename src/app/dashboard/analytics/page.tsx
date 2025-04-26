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
import { CallSummary, AgentPerformance } from '../../../types/platform-integration'

interface AnalyticsData {
  callSummaries: CallSummary[]
  agentPerformance: AgentPerformance[]
  trends: {
    date: string
    sentiment: number
    callVolume: number
    avgDuration: number
  }[]
  topIssues: {
    issue: string
    count: number
    sentiment: number
  }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { getActiveCallPlatform } = useIntegrationStore()

  useEffect(() => {
    const loadAnalytics = async () => {
      const platform = getActiveCallPlatform()
      if (!platform) {
        setLoading(false)
        return
      }

      try {
        const [callSummaries, agentPerformance, trends, topIssues] = await Promise.all([
          platform.getCallSummaries(),
          platform.getAgentPerformance(),
          platform.getTrends(),
          platform.getTopIssues(),
        ])

        setData({
          callSummaries,
          agentPerformance,
          trends,
          topIssues,
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
    const interval = setInterval(loadAnalytics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [getActiveCallPlatform])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'emerald'
    if (sentiment > 0) return 'blue'
    if (sentiment > -0.5) return 'orange'
    return 'rose'
  }

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>Loading analytics...</Title>
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
          <Title>Call Volume</Title>
          <Metric>{data.callSummaries.length}</Metric>
          <LineChart
            className="mt-4 h-28"
            data={data.trends}
            index="date"
            categories={['callVolume']}
            colors={['blue']}
            showLegend={false}
            showXAxis={false}
            showYAxis={false}
            showGridLines={false}
          />
        </Card>
        <Card>
          <Title>Average Sentiment</Title>
          <Metric>
            {(
              data.callSummaries.reduce((acc, call) => acc + call.sentiment.overall, 0) /
              data.callSummaries.length
            ).toFixed(1)}
          </Metric>
          <LineChart
            className="mt-4 h-28"
            data={data.trends}
            index="date"
            categories={['sentiment']}
            colors={['emerald']}
            showLegend={false}
            showXAxis={false}
            showYAxis={false}
            showGridLines={false}
          />
        </Card>
        <Card>
          <Title>Average Duration</Title>
          <Metric>
            {Math.floor(
              data.callSummaries.reduce((acc, call) => acc + call.duration, 0) /
                data.callSummaries.length
            )}
            s
          </Metric>
          <LineChart
            className="mt-4 h-28"
            data={data.trends}
            index="date"
            categories={['avgDuration']}
            colors={['orange']}
            showLegend={false}
            showXAxis={false}
            showYAxis={false}
            showGridLines={false}
          />
        </Card>
      </Grid>

      <Grid numItemsLg={2} className="gap-6 mb-6">
        <Card>
          <Title>Top Issues</Title>
          <BarChart
            className="mt-4"
            data={data.topIssues}
            index="issue"
            categories={['count']}
            colors={['blue']}
          />
          <List className="mt-4">
            {data.topIssues.map((issue) => (
              <ListItem key={issue.issue}>
                <Flex justifyContent="between" alignItems="center">
                  <Text>{issue.issue}</Text>
                  <Flex className="space-x-2">
                    <Badge>{issue.count} calls</Badge>
                    <Badge color={getSentimentColor(issue.sentiment)}>
                      {(issue.sentiment * 100).toFixed(0)}% sentiment
                    </Badge>
                  </Flex>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Card>

        <Card>
          <Title>Agent Performance</Title>
          <List className="mt-4">
            {data.agentPerformance.map((agent) => (
              <ListItem key={agent.agentId}>
                <Flex justifyContent="between" alignItems="center">
                  <div>
                    <Text>{agent.name}</Text>
                    <Text className="text-gray-500">{agent.callsHandled} calls</Text>
                  </div>
                  <div className="space-y-2">
                    <Flex className="space-x-2">
                      <Badge color={getSentimentColor(agent.averageSentiment)}>
                        {(agent.averageSentiment * 100).toFixed(0)}% sentiment
                      </Badge>
                      <Badge color="blue">{Math.floor(agent.averageHandleTime)}s avg</Badge>
                    </Flex>
                    <ProgressBar
                      value={agent.resolutionRate * 100}
                      color="emerald"
                      className="w-32"
                    />
                  </div>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>

      <Grid numItemsLg={1} className="gap-6">
        <Card>
          <Title>Recent Call Summaries</Title>
          <List className="mt-4">
            {data.callSummaries.slice(0, 5).map((summary) => (
              <ListItem key={summary.id}>
                <div className="space-y-2">
                  <Flex justifyContent="between">
                    <Text>Call {summary.id}</Text>
                    <Flex className="space-x-2">
                      <Badge>{Math.floor(summary.duration)}s</Badge>
                      <Badge color={getSentimentColor(summary.sentiment.overall)}>
                        {(summary.sentiment.overall * 100).toFixed(0)}% sentiment
                      </Badge>
                    </Flex>
                  </Flex>
                  <Text className="text-gray-500">{summary.summary}</Text>
                  {summary.actionItems.length > 0 && (
                    <div>
                      <Text className="font-medium">Action Items:</Text>
                      <List>
                        {summary.actionItems.map((item, index) => (
                          <ListItem key={index}>{item}</ListItem>
                        ))}
                      </List>
                    </div>
                  )}
                  {summary.customerIntent && (
                    <Text>
                      <span className="font-medium">Customer Intent: </span>
                      {summary.customerIntent}
                    </Text>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>
    </main>
  )
} 