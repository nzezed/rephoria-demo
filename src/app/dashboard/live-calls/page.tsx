'use client';

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
} from '@tremor/react'
import { useIntegrationStore } from '@/services/integration-manager'

interface LiveCall {
  id: string
  agentId: string
  duration: number
  type: string
  queueId: string
  status: string
  sentiment: number
  transcript: {
    segments: {
      speaker: 'AGENT' | 'CUSTOMER'
      text: string
      timestamp: string
      sentiment?: number
    }[]
  }
}

export default function LiveCallsPage() {
  const [activeCalls, setActiveCalls] = useState<LiveCall[]>([])
  const [selectedCall, setSelectedCall] = useState<LiveCall | null>(null)
  const { getActiveCallPlatform } = useIntegrationStore()

  useEffect(() => {
    const fetchLiveCallData = async () => {
      try {
        const platform = getActiveCallPlatform()
        if (!platform) {
          setActiveCalls([])
          setSelectedCall(null)
          return
        }

        const response = await fetch('/api/live-calls')
        if (!response.ok) {
          throw new Error('Failed to fetch live call data')
        }

        const data = await response.json()
        setActiveCalls(data.activeCalls)
      } catch (error) {
        console.error('Error fetching live call data:', error)
        setActiveCalls([])
      }
    }

    fetchLiveCallData()
    const interval = setInterval(fetchLiveCallData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [getActiveCallPlatform])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'emerald'
    if (sentiment > 0) return 'blue'
    if (sentiment > -0.5) return 'orange'
    return 'rose'
  }

  if (activeCalls.length === 0) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>No Active Calls</Title>
          <Text>There are currently no active calls in the system.</Text>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Grid numItemsLg={3} className="gap-6 mb-6">
        <Col numColSpanLg={2}>
          <Card>
            <Title>Active Calls ({activeCalls.length})</Title>
            <List className="mt-4">
              {activeCalls.map((call) => (
                <ListItem
                  key={call.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCall(call)}
                >
                  <Flex justifyContent="start" className="space-x-4">
                    <div className="flex-1">
                      <Text>Agent: {call.agentId}</Text>
                      <Text>Duration: {Math.floor(call.duration)}s</Text>
                    </div>
                    <div className="flex-1">
                      <Text>Type: {call.type}</Text>
                      <Text>Queue: {call.queueId}</Text>
                    </div>
                    <Badge color={getSentimentColor(call.sentiment)}>
                      Sentiment: {(call.sentiment * 100).toFixed(0)}%
                    </Badge>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Card>
        </Col>

        <Card>
          <Title>Call Statistics</Title>
          <div className="mt-4 space-y-6">
            <div>
              <Text>Average Sentiment</Text>
              <Metric>
                {activeCalls.length > 0
                  ? (
                      (activeCalls.reduce(
                        (acc, call) => acc + call.sentiment,
                        0
                      ) /
                        activeCalls.length) *
                      100
                    ).toFixed(0) + '%'
                  : 'N/A'}
              </Metric>
            </div>
            <div>
              <Text>Average Duration</Text>
              <Metric>
                {activeCalls.length > 0
                  ? Math.floor(
                      activeCalls.reduce((acc, call) => acc + call.duration, 0) /
                        activeCalls.length
                    ) + 's'
                  : 'N/A'}
              </Metric>
            </div>
          </div>
        </Card>
      </Grid>

      {selectedCall && (
        <Grid numItemsLg={2} className="gap-6">
          <Card>
            <Title>Live Transcript</Title>
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {selectedCall.transcript.segments.map((segment, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    segment.speaker === 'AGENT' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <Text className="font-semibold">{segment.speaker}</Text>
                  <Text>{segment.text}</Text>
                  {segment.sentiment !== undefined && (
                    <Badge color={getSentimentColor(segment.sentiment)} className="mt-1">
                      Sentiment: {(segment.sentiment * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Title>Call Analysis</Title>
            <div className="mt-4 space-y-6">
              <div>
                <Text>Overall Sentiment</Text>
                <ProgressBar
                  value={(selectedCall.sentiment + 1) * 50}
                  color={getSentimentColor(selectedCall.sentiment)}
                  className="mt-2"
                />
              </div>
              <div>
                <Text>Call Duration</Text>
                <Metric>{Math.floor(selectedCall.duration)}s</Metric>
              </div>
              <div>
                <Text>Status</Text>
                <Badge>{selectedCall.status}</Badge>
              </div>
            </div>
          </Card>
        </Grid>
      )}
    </main>
  )
} 