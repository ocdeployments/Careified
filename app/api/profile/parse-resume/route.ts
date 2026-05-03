// Careified — Resume Parse API (LLM-powered)
// Uses OpenRouter to extract structured ProfileFormData from resume text

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 60000))
  if (mimeType.includes('pdf')) {
    const strings = raw.match(/[^\x00-\x08\x0E-\x1F\x7F-\xFF]{4,}/g) || []
    return strings.join(' ')
  }
  return raw
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromBuffer(buffer, file.type)

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 })
    }

    const prompt = `You are a resume parser for a caregiving platform. Extract structured data from this resume text.

Return ONLY valid JSON with these exact fields (use null for missing fields):
{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "city": string | null,
  "state": string | null,
  "jobTitle": string | null,
  "yearsExperience": number | null,
  "bio": string | null,
  "languages": string[] | null,
  "services": string[] | null,
  "specializations": string[] | null,
  "credentials": string[] | null,
  "diagnosisExperience": string[] | null,
  "adlsPerformed": string[] | null,
  "certifications": string[] | null,
  "employers": [{"organisation": string, "title": string, "startYear": string | null, "endYear": string | null, "current": boolean}] | null
}

Rules:
- diagnosisExperience: only include from this list: ["Alzheimer's/Dementia","Parkinson's","Stroke Recovery","Diabetes","Mobility/Fall Risk","Hospice/Palliative","Post-Surgical","Incontinence Care","Mental Health","Spinal Cord Injury","Developmental Disability","Pediatric/Special Needs"]
- adlsPerformed: only include from this list: ["Bathing","Dressing","Grooming","Toileting","Incontinence care","Transfers","Ambulation","Feeding","Meal preparation","Medication reminders","Repositioning","Range of motion","Wound care observation","Hoyer lift","Gait belt use"]
- services: extract any caregiving services mentioned
- credentials: extract certifications like PSW, RPN, RN, CNA, HHA etc
- bio: write a 2-sentence professional summary from the resume content, or null if insufficient info
- Return ONLY the JSON object, no markdown, no explanation

Resume text:
${text.slice(0, 8000)}`

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified Resume Parser',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        max_tokens: 1000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: 'LLM parsing failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    let parsed: Record<string, any> = {}
    try {
      const clean = content.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      console.error('JSON parse failed:', content)
      return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
    }

    // Filter out null values
    const result = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}
