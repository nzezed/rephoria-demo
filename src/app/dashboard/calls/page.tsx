'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Badge,
  Grid,
  Flex,
  Icon,
  Metric,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@tremor/react'
import { PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'

// Define the Call type returned by the API
interface Call {
  id: string
  agent: { id: string; name: string } | null
  startTime: string
  endTime?: string
  status: string
  createdAt: string
}

// Define the shape of a transcript entry
interface TranscriptEntry { time: string; speaker: string; text: string }

export default function LiveCalls() {
  const [activeCalls, setActiveCalls] = useState<Call[]>([])
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])

  // Fetch calls once on mount
  useEffect(() => {
    async function loadCalls() {
      try {
        const res = await fetch('/api/calls')
        if (res.ok) {
          const data: Call[] = await res.json()
          setActiveCalls(data)
          if (data.length > 0) setSelectedCall(data[0])
        }
      } catch (err) {
        console.error('Failed to fetch calls', err)
      }
    }
    loadCalls()
  }, [])

  // Fetch transcript whenever selectedCall changes
  useEffect(() => {
    async function loadTranscript() {
      if (!selectedCall) return setTranscriptEntries([])
      try {
        const res = await fetch(`/api/calls/${selectedCall.id}/transcript`)
        if (res.ok) {
          const data = await res.json()
          setTranscriptEntries(Array.isArray(data.text) ? data.text : [])
        }
      } catch (err) {
        console.error('Failed to load transcript', err)
      }
    }
    loadTranscript()
  }, [selectedCall])

  // Calculate call duration as MM:SS
  function calculateDuration(start: string, end?: string) {
    const startMs = new Date(start).getTime()
    const endMs = end ? new Date(end).getTime() : Date.now()
    const totalSec = Math.floor((endMs - startMs) / 1000)
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'emerald'
      case 'neutral':
        return 'yellow'
      case 'negative':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <main className="space-y-6">
      <div>
        <Title>Live Calls</Title>
        <Text>Monitor active calls and view real-time transcriptions.</Text>
      </div>

      <Grid numItemsMd={2} className="gap-6">
        {/* Active Calls List */}
        <Card>
          <Title>Active Calls</Title>
          <div className="mt-4 space-y-4">
            {activeCalls.map(call => (
              <div
                key={call.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedCall?.id === call.id
                    ? 'bg-rephoria-50 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedCall(call)}
              >
                <Flex>
                  <div className="space-y-2">
                    <Text className="font-medium">{call.agent?.name || 'Unknown Agent'}</Text>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{new Date(call.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge color={getSentimentColor(call.status)}>
                      {call.status}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>{calculateDuration(call.startTime, call.endTime)}</span>
                    </div>
                  </div>
                </Flex>
              </div>
            ))}
          </div>
        </Card>

        {/* Call Details */}
        <Card>
          <TabGroup>
            <TabList>
              <Tab>Transcript</Tab>
              <Tab>Analytics</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="mt-4 space-y-4">
                  {transcriptEntries.length > 0 ? (
                    transcriptEntries.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex space-x-4 ${
                          entry.speaker === 'Agent' ? 'justify-end' : ''
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            entry.speaker === 'Agent'
                              ? 'bg-rephoria-50 text-rephoria-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{entry.speaker}</span>
                            <span>{entry.time}</span>
                          </div>
                          <Text>{entry.text}</Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text>No transcript available</Text>
                  )}
                </div>
              </TabPanel>
              <TabPanel>
                <div className="mt-4">
                  <Title>Call Analytics</Title>
                  <div className="mt-4 space-y-4">
                    <Card decoration="top" decorationColor="emerald">
                      <Text>Sentiment Score</Text>
                      <Metric>85%</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="blue">
                      <Text>Customer Satisfaction</Text>
                      <Metric>4.5/5</Metric>
                    </Card>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      </Grid>
    </main>
  )
} 