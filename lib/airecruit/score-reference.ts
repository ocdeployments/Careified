// Careified — AIRecruit Reference Call Scoring
// Extract structured feedback from reference call transcripts

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export interface ReferenceScore {
  would_reengage: boolean | null
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  reliability_notes: string | null
  client_interaction_notes: string | null
  strengths: string | null
  additional_notes: string | null
  confidence: 'high' | 'medium' | 'low'
  ai_summary: string | null
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function scoreReferenceCall(
  transcript: string,
  caregiverName: string
): Promise<ReferenceScore> {
  const prompt = `Extract the following from this reference call transcript about ${caregiverName}. Return JSON only, no other text:

{
  "would_reengage": did the reference say yes to working with ${caregiverName} again? (true/false/null if unclear),
  "overall_sentiment": positive/neutral/negative based on tone and content overall,
  "reliability_notes": what the reference said about punctuality and reliability (1-2 sentences, or null if not discussed),
  "client_interaction_notes": what the reference said about client interaction (1-2 sentences, or null if not discussed),
  "strengths": what strengths were mentioned (1-2 sentences, or null if not discussed),
  "additional_notes": any other notable points (1-2 sentences, or null if nothing else),
  "confidence": high if reference was clear and specific, medium if vague, low if declined/minimal,
  "ai_summary": 2-3 sentence plain English summary of the reference's overall impression
}

If the reference declined to answer or call failed, return all fields as null except overall_sentiment: 'neutral' and confidence: 'low'.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified',
      },
      body: JSON.stringify({
        model: 'upstage/ring-2.6-1t:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured data from transcripts.'
          },
          {
            role: 'user',
            content: `Transcript:\n${transcript}\n\n${prompt}`
          }
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OPENROUTER ERROR:', response.status, errorText)
      // Check for credit exhaustion
      if (response.status === 402 || response.status === 429 || errorText.includes('credits') || errorText.includes('quota')) {
        console.error('[OPENROUTER CREDITS] Reference scoring failed due to credits/quota')
        return {
          would_reengage: null,
          overall_sentiment: 'neutral',
          reliability_notes: null,
          client_interaction_notes: null,
          strengths: null,
          additional_notes: null,
          confidence: 'low',
          ai_summary: 'Scoring pending - API quota exceeded'
        }
      }
      throw new Error(`OpenRouter error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in response')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      would_reengage: result.would_reengage ?? null,
      overall_sentiment: result.overall_sentiment || 'neutral',
      reliability_notes: result.reliability_notes || null,
      client_interaction_notes: result.client_interaction_notes || null,
      strengths: result.strengths || null,
      additional_notes: result.additional_notes || null,
      confidence: result.confidence || 'low',
      ai_summary: result.ai_summary || null,
    }
  } catch (error) {
    console.error('SCORE REFERENCE ERROR:', error)
    return {
      would_reengage: null,
      overall_sentiment: 'neutral',
      reliability_notes: null,
      client_interaction_notes: null,
      strengths: null,
      additional_notes: null,
      confidence: 'low',
      ai_summary: 'Scoring failed - ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
