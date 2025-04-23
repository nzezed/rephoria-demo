'use client'

import { useState, useCallback } from 'react'
import {
  Card,
  Title,
  Text,
  Grid,
  Button,
  Badge,
  ProgressBar,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'

interface BatchFile {
  id: string
  name: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: {
    language: string
    duration: string
    summary: string
    sentiment: string
    keyPoints?: string[]
    actionItems?: string[]
    customerIntent?: string
    agentPerformance?: {
      score: number
      strengths: string[]
      improvements: string[]
    }
  }
  error?: string
  file?: File
}

export default function BatchProcessingPage() {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0,
      file: file,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: true
  })

  const processFiles = async () => {
    setIsProcessing(true)
    
    // Process files in batches of 3 to avoid overwhelming the system
    const batchSize = 3
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize)
      
      // Process batch concurrently
      await Promise.all(batch.map(async (file) => {
        try {
          // Update status to processing
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'processing', progress: 10 } : f
          ))

          // Prepare form data
          const formData = new FormData()
          if (file.file) {
            formData.append('audio', file.file)
          }

          // Update progress to show request is being made
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress: 30 } : f
          ))

          // Make API call
          const response = await fetch('/api/batch', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Failed to process file')
          }

          // Update progress for processing
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress: 60 } : f
          ))

          const data = await response.json()
          const result = data.results[0] // Since we're sending one file at a time

          if (result.error) {
            throw new Error(result.error)
          }

          // Update with successful result
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'completed',
              progress: 100,
              result: {
                language: result.language || 'Unknown',
                duration: result.duration || '0:00',
                summary: result.analysis.summary || 'No summary available',
                sentiment: result.analysis.sentiment || 'neutral',
                keyPoints: result.analysis.keyPoints,
                actionItems: result.analysis.actionItems,
                customerIntent: result.analysis.customerIntent,
                agentPerformance: result.analysis.agentPerformance,
              }
            } : f
          ))
        } catch (error) {
          console.error('Error processing file:', error)
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'failed',
              progress: 0,
              error: error instanceof Error ? error.message : 'Failed to process file'
            } : f
          ))
        }
      }))
    }
    
    setIsProcessing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'processing':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Title>Batch Processing</Title>
        <Text>Upload and analyze multiple call recordings simultaneously.</Text>
      </div>

      {/* File Upload Area */}
      <Card>
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-2 text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </div>
              <Text className="text-xs text-gray-500">
                Multiple audio files supported (MP3, WAV, M4A)
              </Text>
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={processFiles}
                disabled={isProcessing || !files.some(f => f.status === 'pending')}
                loading={isProcessing}
              >
                Process {files.filter(f => f.status === 'pending').length} Files
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Processing Queue */}
      {files.length > 0 && (
        <Card>
          <Title>Processing Queue</Title>
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>File</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Progress</TableHeaderCell>
                <TableHeaderCell>Results</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                      <Text>{file.name}</Text>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <Badge color={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full">
                      <ProgressBar
                        value={file.progress}
                        color={getStatusColor(file.status)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.status === 'completed' && file.result && (
                      <div className="space-y-1">
                        <Text>Language: {file.result.language}</Text>
                        <Text>Duration: {file.result.duration}</Text>
                        <Text>Sentiment: {file.result.sentiment}</Text>
                        <Text className="truncate max-w-md">
                          Summary: {file.result.summary}
                        </Text>
                        {file.result.agentPerformance && (
                          <Text>
                            Agent Score: {file.result.agentPerformance.score}%
                          </Text>
                        )}
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            // TODO: Show detailed results modal
                            console.log('Detailed results:', file.result)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                    {file.status === 'failed' && (
                      <Text className="text-red-500">{file.error}</Text>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </main>
  )
} 