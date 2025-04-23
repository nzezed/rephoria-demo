import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const files: File[] = []
  let tempFiles: string[] = []

  try {
    const formData = await request.formData()
    
    // Extract all files from the form data
    formData.forEach((value, key) => {
      if (value instanceof File) {
        files.push(value)
      }
    })

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Process each file
    const results = await Promise.all(files.map(async (file) => {
      try {
        // Create a temporary file
        const buffer = Buffer.from(await file.arrayBuffer())
        const tempPath = join('/tmp', `upload-${Date.now()}-${file.name}`)
        writeFileSync(tempPath, buffer)
        tempFiles.push(tempPath)

        // Step 1: Transcribe audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
          file: await import('fs').then(fs => fs.createReadStream(tempPath)),
          model: 'whisper-1',
          response_format: 'verbose_json',
        })

        // Step 2: Analyze transcription using GPT-3.5
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant analyzing sales call transcripts. 
Extract key information and provide insights in the following JSON format:
{
  "summary": "Brief summary of the call",
  "sentiment": "positive" | "neutral" | "negative",
  "keyPoints": ["Array of key discussion points"],
  "actionItems": ["Array of follow-up actions needed"],
  "customerIntent": "Customer's main intention or need",
  "agentPerformance": {
    "score": number between 0-100,
    "strengths": ["Array of things done well"],
    "improvements": ["Array of areas for improvement"]
  }
}`
            },
            {
              role: 'user',
              content: `Analyze this sales call transcript: ${transcription.text}`
            }
          ],
          response_format: { type: 'json_object' },
        })

        const analysis = JSON.parse(completion.choices[0].message.content!)

        return {
          fileName: file.name,
          language: transcription.language,
          duration: '3:45', // In production, calculate from audio length
          transcription: transcription.text,
          analysis
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        return {
          fileName: file.name,
          error: 'Failed to process file'
        }
      }
    }))

    // Clean up temp files
    tempFiles.forEach(path => {
      try {
        unlinkSync(path)
      } catch (e) {
        console.error('Error deleting temp file:', e)
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    // Clean up temp files in case of error
    tempFiles.forEach(path => {
      try {
        unlinkSync(path)
      } catch (e) {
        console.error('Error deleting temp file:', e)
      }
    })

    console.error('Error processing batch:', error)
    return NextResponse.json(
      { error: 'Error processing files' },
      { status: 500 }
    )
  }
} 