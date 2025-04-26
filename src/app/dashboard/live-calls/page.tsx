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
import { CallData, CallTranscript, CallSentiment } from '../../../types/platform-integration'

interface LiveCall extends CallData {
  transcript?: CallTranscript
  sentiment?: CallSentiment
}

export default function LiveCallsPage() {
  const [activeCalls, setActiveCalls] = useState<LiveCall[]>([])
  const [selectedCall, setSelectedCall] = useState<LiveCall | null>(null)
  const { getActiveCallPlatform } = useIntegrationStore()

  useEffect(() => {
    // Subscribe to real-time updates
    const platform = getActiveCallPlatform()
    if (!platform) return

    const unsubscribe = platform.subscribeToLiveUpdates({
      onCallUpdate: (call) => {
        setActiveCalls((prev) => {
          const index = prev.findIndex((c) => c.id === call.id)
          if (index === -1) {
            return [...prev, call as LiveCall]
          }
          const updated = [...prev]
          updated[index] = { ...updated[index], ...call }
          return updated
        })
      },
      onTranscriptUpdate: (callId, transcript) => {
        setActiveCalls((prev) => {
          const index = prev.findIndex((c) => c.id === callId)
          if (index === -1) return prev
          const updated = [...prev]
          updated[index] = { ...updated[index], transcript }
          return updated
        })
      },
      onSentimentUpdate: (callId, sentiment) => {
        setActiveCalls((prev) => {
          const index = prev.findIndex((c) => c.id === callId)
          if (index === -1) return prev
          const updated = [...prev]
          updated[index] = { ...updated[index], sentiment }
          return updated
        })
      },
    })

    return () => unsubscribe()
  }, [getActiveCallPlatform])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'emerald'
    if (sentiment > 0) return 'blue'
    if (sentiment > -0.5) return 'orange'
    return 'rose'
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
                      <Text>Duration: {Math.floor(call.duration || 0)}s</Text>
                    </div>
                    <div className="flex-1">
                      <Text>Type: {call.type}</Text>
                      <Text>Queue: {call.queueId}</Text>
                    </div>
                    {call.sentiment && (
                      <Badge color={getSentimentColor(call.sentiment.overall)}>
                        Sentiment: {(call.sentiment.overall * 100).toFixed(0)}%
                      </Badge>
                    )}
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
                        (acc, call) => acc + (call.sentiment?.overall || 0),
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
                      activeCalls.reduce((acc, call) => acc + (call.duration || 0), 0) /
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
              {selectedCall.transcript?.segments.map((segment, index) => (
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
            {selectedCall.sentiment && (
              <div className="mt-4 space-y-6">
                <div>
                  <Text>Overall Sentiment</Text>
                  <ProgressBar
                    value={(selectedCall.sentiment.overall + 1) * 50}
                    color={getSentimentColor(selectedCall.sentiment.overall)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Text>Key Phrases</Text>
                  <List className="mt-2">
                    {selectedCall.sentiment.keyPhrases.map((phrase, index) => (
                      <ListItem key={index}>
                        <Flex justifyContent="start" className="space-x-2">
                          <Text>{phrase.text}</Text>
                          <Badge color={getSentimentColor(phrase.sentiment)}>
                            {(phrase.sentiment * 100).toFixed(0)}%
                          </Badge>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </div>
              </div>
            )}
          </Card>
        </Grid>
      )}
    </main>
  )
} 