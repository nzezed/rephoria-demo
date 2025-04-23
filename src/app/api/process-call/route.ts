'use client';

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  let tempFilePath = '';
  
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Create a temporary file
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    tempFilePath = join('/tmp', `upload-${Date.now()}.wav`)
    writeFileSync(tempFilePath, buffer)

    // Step 1: Transcribe audio using Whisper (with language detection)
    const transcription = await openai.audio.transcriptions.create({
      file: await import('fs').then(fs => fs.createReadStream(tempFilePath)),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    // Clean up temp file
    unlinkSync(tempFilePath)

    const detectedLanguage = transcription.language;

    // Step 2: Analyze transcription using GPT-3.5 in the detected language
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant analyzing sales call transcripts. The call is in ${detectedLanguage}. 
Provide your analysis in ${detectedLanguage}. Extract key information and provide insights in the following JSON format:
{
  "summary": "Brief summary of the call in ${detectedLanguage}",
  "insights": [
    {
      "type": "interest" | "followUp" | "objection" | "key_point",
      "content": "Description of the insight in ${detectedLanguage}",
      "importance": "high" | "medium" | "low"
    }
  ],
  "suggestedFollowUp": {
    "timing": "When to follow up (in ${detectedLanguage})",
    "approach": "How to approach the follow-up (in ${detectedLanguage})",
    "icebreaker": "Suggested opening line referencing previous conversation (in ${detectedLanguage})",
    "talkingPoints": ["Key points to discuss (in ${detectedLanguage})"]
  },
  "language": "${detectedLanguage}"
}`,
        },
        {
          role: 'user',
          content: `Analyze this sales call transcript and provide insights in ${detectedLanguage}: ${transcription.text}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    if (!completion.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    const analysis = JSON.parse(completion.choices[0].message.content);

    // Add metadata to the analysis
    const result = {
      ...analysis,
      customerId: 'CUST-' + Math.random().toString(36).substr(2, 6),
      customerName: 'Customer', // In production, this would come from your CRM
      date: new Date().toISOString().split('T')[0],
      duration: '00:00', // In production, calculate from audio length
      detectedLanguage: detectedLanguage,
    }

    return NextResponse.json(result)
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (tempFilePath) {
        unlinkSync(tempFilePath)
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    console.error('Error processing call:', error)
    return NextResponse.json(
      { error: 'Error processing call recording' },
      { status: 500 }
    )
  }
} 