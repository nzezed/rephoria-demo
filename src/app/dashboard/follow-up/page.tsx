'use client'

import { useState } from 'react'
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
  Flex,
  Badge,
  Button,
  TextInput,
} from '@tremor/react'
import {
  CloudArrowUpIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { GlobeAltIcon } from '@heroicons/react/24/solid'

interface CallInsight {
  type: 'interest' | 'followUp' | 'objection' | 'key_point'
  content: string
  importance: 'high' | 'medium' | 'low'
}

interface CallAnalysis {
  customerId: string
  customerName: string
  date: string
  duration: string
  summary: string
  insights: CallInsight[]
  suggestedFollowUp: {
    timing: string
    approach: string
    icebreaker: string
    talkingPoints: string[]
  }
  detectedLanguage: string
}

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCurrentFile(file)
      setError(null)
    }
  }

  const handleProcess = async () => {
    if (!currentFile) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', currentFile)

      const response = await fetch('/api/process-call', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process recording')
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the recording')
    } finally {
      setIsProcessing(false)
    }
  }

  const getInsightColor = (importance: string): string => {
    switch (importance) {
      case 'high':
        return 'rose'
      case 'medium':
        return 'amber'
      case 'low':
        return 'blue'
      default:
        return 'gray'
    }
  }

  // Function to get the language display name
  const getLanguageDisplayName = (langCode: string): string => {
    try {
      return new Intl.DisplayNames([langCode], { type: 'language' }).of(langCode) || langCode
    } catch (e) {
      return langCode
    }
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Call Follow-up Assistant</Title>
        <Text>Upload call recordings for AI-powered insights and follow-up suggestions. Supports multiple languages.</Text>
      </div>

      {/* File Upload Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="space-y-2 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </div>
                  <Text className="text-xs text-gray-500">Audio files only (MP3, WAV, M4A)</Text>
                </div>
              </label>
            </div>
            <Button
              disabled={!currentFile || isProcessing}
              loading={isProcessing}
              onClick={handleProcess}
            >
              Process Recording
            </Button>
          </div>
          {currentFile && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <DocumentTextIcon className="h-4 w-4" />
              <span>{currentFile.name}</span>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Grid numItems={1} className="gap-6">
          <Card>
            <Flex alignItems="center" className="space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500" />
              <Title>Call Overview</Title>
              {analysis.detectedLanguage && (
                <Badge icon={GlobeAltIcon} color="blue">
                  {getLanguageDisplayName(analysis.detectedLanguage)}
                </Badge>
              )}
            </Flex>
            <Text className="mt-4">{analysis.summary}</Text>
          </Card>

          <Card>
            <Flex alignItems="center">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              <Title>Key Insights</Title>
            </Flex>
            <ul className="mt-4 space-y-2">
              {analysis.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-2 w-2 mt-2 mr-2 bg-yellow-500 rounded-full" />
                  <Text>{insight.content}</Text>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <Flex alignItems="center">
              <ArrowPathIcon className="h-5 w-5 text-green-500" />
              <Title>Suggested Follow-ups</Title>
            </Flex>
            <ul className="mt-4 space-y-2">
              {analysis.suggestedFollowUp.talkingPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-2 w-2 mt-2 mr-2 bg-green-500 rounded-full" />
                  <Text>{point}</Text>
                </li>
              ))}
            </ul>
          </Card>
        </Grid>
      )}
    </main>
  )
} 