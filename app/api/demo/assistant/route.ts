import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'minimax/minimax-m2.5'

// Rate limiting: Map<IP, timestamps[]>
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Filter to last hour
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_WINDOW_MS)

  if (validTimestamps.length >= RATE_LIMIT) {
    return false
  }

  // Add current timestamp
  validTimestamps.push(now)
  rateLimitMap.set(ip, validTimestamps)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    if (!OPENROUTER_API_KEY) {
      console.error('Demo assistant error: OPENROUTER_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demo rate limit reached. Sign up for full access at careified.ca' },
        { status: 429 }
      )
    }

    // Fetch demo caregiver context
    const caregiverResult = await pool.query(`
      SELECT first_name, last_name, city, province_state, years_experience,
             specializations, availability_status, aggregate_score, placement_types
      FROM caregivers
      WHERE availability_status = 'available'
      LIMIT 20
    `)

    const caregivers = caregiverResult.rows.map(c => ({
      first_name: c.first_name,
      last_name: c.last_name,
      city: c.city,
      province_state: c.province_state,
      years_experience: c.years_experience,
      specializations: c.specializations,
      availability_status: c.availability_status,
      aggregate_score: c.aggregate_score,
      placement_types: c.placement_types
    }))

    const systemPrompt = `You are the Careified AI Assistant — a demo of Careified's agency intelligence platform for home care agencies in Canada and the US.

You help agency coordinators:
- Search caregivers by skills, location, availability, experience, and specialization
- Understand what Careified does
- Explore caregiver profiles and match criteria

AVAILABLE CAREGIVERS IN THIS DEMO:
${JSON.stringify(caregivers)}

PLATFORM CAPABILITIES YOU CAN DESCRIBE:
- Caregiver search with 20+ filters
- Verified credential profiles
- AIRecruit — AI outbound screening calls
- Agency roster management
- Client intake and match analysis
- Caregiver ID cards with verify slugs

RULES YOU MUST FOLLOW — NON-NEGOTIABLE:
1. Never recommend a caregiver for hiring
2. Use 'criteria alignment score' not 'match score'
3. Use 'criteria aligned' not 'recommended'
4. Every response mentioning a specific caregiver must end with: 'All placement decisions are made independently by your agency. Careified presents information only.'
5. If asked about suitability: present alignment criteria only, never vouch
6. Label yourself as AI on first response only: 'I am Careified's AI assistant (demo mode).'
7. Keep responses concise — max 4 lines per caregiver
8. If asked what you can do: describe platform features, do not just list caregivers
9. Never claim to verify what you cannot verify — use 'as reported' for caregiver-provided data

TONE: Professional, efficient, warm. You save the agency coordinator time.`

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified Demo Assistant',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', response.status)
      return NextResponse.json(
        { error: 'AI temporarily unavailable. Please try again in a moment.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content

    if (!aiMessage) {
      return NextResponse.json(
        { error: 'AI temporarily unavailable. Please try again in a moment.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: aiMessage })
  } catch (error) {
    console.error('Demo assistant error:', error)
    return NextResponse.json(
      { error: 'AI temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}