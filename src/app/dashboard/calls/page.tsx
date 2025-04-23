'use client'

import { useState, useEffect } from 'react'
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
import { PhoneIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline'

// Mock active calls data
const mockCalls = [
  {
    id: 1,
    agent: 'Sarah Miller',
    customer: '+1 (555) 123-4567',
    duration: '05:23',
    sentiment: 'positive',
    transcript: [
      { time: '00:00', speaker: 'Agent', text: 'Thank you for calling Acme Support. This is Sarah. How may I help you today?' },
      { time: '00:05', speaker: 'Customer', text: 'Hi Sarah, I\'m having trouble accessing my account.' },
      { time: '00:10', speaker: 'Agent', text: 'I\'m sorry to hear that. I\'ll be happy to help you regain access. Can you please verify your email address?' },
    ],
  },
  {
    id: 2,
    agent: 'John Davis',
    customer: '+1 (555) 987-6543',
    duration: '02:45',
    sentiment: 'neutral',
    transcript: [
      { time: '00:00', speaker: 'Agent', text: 'Thank you for calling Acme Support. This is John. How can I assist you?' },
      { time: '00:06', speaker: 'Customer', text: 'Hello, I\'d like to upgrade my subscription plan.' },
      { time: '00:12', speaker: 'Agent', text: 'I\'ll be glad to help you with that. First, let me pull up your account information.' },
    ],
  },
]

export default function LiveCalls() {
  const [activeCalls, setActiveCalls] = useState(mockCalls)
  const [selectedCall, setSelectedCall] = useState(mockCalls[0])

  // Simulate updating call durations
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCalls(calls =>
        calls.map(call => ({
          ...call,
          duration: incrementTime(call.duration),
        }))
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const incrementTime = (timeStr: string) => {
    const [mins, secs] = timeStr.split(':').map(Number)
    const totalSeconds = mins * 60 + secs + 1
    const newMins = Math.floor(totalSeconds / 60)
    const newSecs = totalSeconds % 60
    return `${String(newMins).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`
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
                  selectedCall.id === call.id
                    ? 'bg-rephoria-50 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedCall(call)}
              >
                <Flex>
                  <div className="space-y-2">
                    <Text className="font-medium">{call.agent}</Text>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{call.customer}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge color={getSentimentColor(call.sentiment)}>
                      {call.sentiment}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{call.duration}</span>
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
                  {selectedCall.transcript.map((entry, index) => (
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
                  ))}
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