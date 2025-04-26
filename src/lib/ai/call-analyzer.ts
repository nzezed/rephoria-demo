import OpenAI from 'openai'
import { CallTranscript, CallSentiment, CallSummary, TranscriptSegment, CustomerHistory } from '../../types/platform-integration'

export class CallAnalyzer {
  private openai: OpenAI
  private activeTranscriptions: Map<string, CallTranscript> = new Map()

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  async processTranscriptSegment(
    callId: string,
    segment: TranscriptSegment
  ): Promise<{
    sentiment: number
    keyPhrases: Array<{ text: string; sentiment: number }>
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following call segment for sentiment and key phrases. Return a JSON object with sentiment score (-1 to 1) and important phrases with their sentiment scores.'
          },
          {
            role: 'user',
            content: segment.text
          }
        ],
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const analysis = JSON.parse(content)
      return {
        sentiment: analysis.sentiment,
        keyPhrases: analysis.keyPhrases
      }
    } catch (error) {
      console.error('Error analyzing transcript segment:', error)
      return {
        sentiment: 0,
        keyPhrases: []
      }
    }
  }

  async generateCallSummary(transcript: CallTranscript): Promise<CallSummary> {
    try {
      const fullText = transcript.segments
        .map(s => `${s.speaker}: ${s.text}`)
        .join('\n')

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze this call transcript and provide a structured summary including main points, action items, customer intent, whether follow-up is needed, next steps, and key insights. Return as JSON.'
          },
          {
            role: 'user',
            content: fullText
          }
        ],
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating call summary:', error)
      return {
        mainPoints: [],
        actionItems: [],
        customerIntent: 'Unknown',
        followUpNeeded: false,
        nextSteps: [],
        keyInsights: []
      }
    }
  }

  async generateAgentSuggestions(
    transcript: CallTranscript,
    sentiment: CallSentiment
  ): Promise<{
    immediate: string[]
    longTerm: string[]
  }> {
    try {
      const context = {
        transcript: transcript.segments.map(s => ({
          speaker: s.speaker,
          text: s.text,
          sentiment: s.sentiment
        })),
        overallSentiment: sentiment.overall,
        sentimentProgression: sentiment.progression,
        keyPhrases: sentiment.keyPhrases
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Based on this call data, provide immediate suggestions for the current call and long-term improvement suggestions for the agent. Return as JSON with "immediate" and "longTerm" arrays.'
          },
          {
            role: 'user',
            content: JSON.stringify(context)
          }
        ],
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating agent suggestions:', error)
      return {
        immediate: [],
        longTerm: []
      }
    }
  }

  async analyzeCustomerHistory(
    customerId: string,
    calls: CallSummary[]
  ): Promise<CustomerHistory> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze this customer\'s call history and provide insights, interests, and next action recommendations. Return as JSON.'
          },
          {
            role: 'user',
            content: JSON.stringify(calls)
          }
        ],
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const analysis = JSON.parse(content)
      return {
        customerId,
        lastContact: new Date(),
        totalCalls: calls.length,
        calls,
        overallSentiment: analysis.overallSentiment,
        interests: analysis.interests,
        preferences: analysis.preferences,
        nextActionRecommendation: analysis.nextActionRecommendation
      }
    } catch (error) {
      console.error('Error analyzing customer history:', error)
      return {
        customerId,
        lastContact: new Date(),
        totalCalls: calls.length,
        calls,
        overallSentiment: 0,
        interests: [],
        preferences: {},
        nextActionRecommendation: ''
      }
    }
  }
} 