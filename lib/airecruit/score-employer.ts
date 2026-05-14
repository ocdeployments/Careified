// Careified — AIRecruit Employer Call Scoring
// Extract structured employment verification from employer call transcripts

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export interface EmployerScore {
  employment_confirmed: boolean | null
  re_engage: boolean | null
  departure_reason: string | null
  additional_notes: string | null
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  confidence: 'high' | 'medium' | 'low'
  ai_summary: string | null
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function scoreEmployerCall(
  transcript: string,
  caregiverName: string,
  employerName: string
): Promise<EmployerScore> {
  const prompt = `Extract the following from this employment verification call transcript about ${caregiverName} at ${employerName}. Return JSON only, no other text:

{
  "employment_confirmed": was employment confirmed by the supervisor? (true/false/null if unclear/not discussed),
  "re_engage": did the supervisor say they would consider re-engaging this person? (true/false/null if unclear/not discussed),
  "departure_reason": what was the reason for departure if mentioned (1-2 sentences, or null if not discussed),
  "additional_notes": any other notable points from the supervisor (1-2 sentences, or null if nothing else),
  "overall_sentiment": positive if confirmed and positive, neutral if unclear or non-committal, negative if declined to confirm or expressed concerns,
  "confidence": high if clear confirmation was given, medium if vague, low if declined to answer/call failed,
  "ai_summary": 2-3 sentence plain English summary of the employment verification outcome
}

If the call failed, supervisor declined, or no confirmation was given, return all fields as null except overall_sentiment: 'neutral' and confidence: 'low'.`

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
        console.error('[OPENROUTER CREDITS] Employer scoring failed due to credits/quota')
        return {
          employment_confirmed: null,
          re_engage: null,
          departure_reason: null,
          additional_notes: null,
          overall_sentiment: 'neutral',
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
      employment_confirmed: result.employment_confirmed ?? null,
      re_engage: result.re_engage ?? null,
      departure_reason: result.departure_reason || null,
      additional_notes: result.additional_notes || null,
      overall_sentiment: result.overall_sentiment || 'neutral',
      confidence: result.confidence || 'low',
      ai_summary: result.ai_summary || null,
    }
  } catch (error) {
    console.error('SCORE EMPLOYER ERROR:', error)
    return {
      employment_confirmed: null,
      re_engage: null,
      departure_reason: null,
      additional_notes: null,
      overall_sentiment: 'neutral',
      confidence: 'low',
      ai_summary: 'Scoring failed - ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}