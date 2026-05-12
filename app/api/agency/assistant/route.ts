import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'minimax/minimax-m2.5'

async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string } | null> {
  let userId: string | null | undefined
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch (e: any) {
    if (e?.message?.includes('NEXT_REDIRECT') || e?.code === 'NEXT_REDIRECT') {
      return null
    }
    console.error('Auth error:', e)
    return null
  }

  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return null

    const result = await pool.query(
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return { agencyId: result.rows[0].id, agencyName: result.rows[0].name }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Query 1: Agency info
    const agencyResult = await pool.query(
      'SELECT id, name, city, province_state, tier FROM agencies WHERE id = $1',
      [agency.agencyId]
    )
    const agencyInfo = agencyResult.rows[0] || {}

    // Query 2: Rostered caregivers
    let roster: any[] = []
    try {
      const rosterResult = await pool.query(
        `SELECT first_name, last_name, city, years_experience, specializations,
                availability_status, aggregate_score, claim_status, placement_types
         FROM caregivers
         WHERE source_agency_id = $1 AND availability_status = 'available'
         LIMIT 20`,
        [agency.agencyId]
      )
      roster = rosterResult.rows.map(c => ({
        first_name: c.first_name,
        last_name: c.last_name,
        city: c.city,
        years_experience: c.years_experience,
        specializations: c.specializations,
        availability_status: c.availability_status,
        aggregate_score: c.aggregate_score,
        claim_status: c.claim_status,
        placement_types: c.placement_types
      }))
    } catch (e) {
      console.error('Roster query failed:', e)
      roster = []
    }

    // Query 3: Shortlist with pipeline
    let shortlist = []
    try {
      const shortlistResult = await pool.query(
        `SELECT c.first_name, c.last_name, s.pipeline_stage, s.notes, s.added_at
         FROM agency_shortlist s
         JOIN caregivers c ON c.id = s.caregiver_id
         WHERE s.agency_id = $1
         ORDER BY s.added_at DESC
         LIMIT 10`,
        [agency.agencyId]
      )
      shortlist = shortlistResult.rows
    } catch (e) {
      console.error('Shortlist query failed:', e)
      shortlist = []
    }

    // Query 4: Active clients
    let clients = []
    try {
      const clientsResult = await pool.query(
        `SELECT first_name, last_name, city, care_level, primary_diagnosis
         FROM client_needs
         WHERE agency_id = $1
         LIMIT 10`,
        [agency.agencyId]
      )
      clients = clientsResult.rows
    } catch (e) {
      console.error('Clients query failed:', e)
      clients = []
    }

    // Query 5: Recent AIRecruit results (join through campaign)
    let airecruitResults = []
    try {
      const airecruitResult = await pool.query(
        `SELECT cr.candidate_name, cr.overall_score, cr.recommendation, cr.summary, cr.called_at
         FROM airecruit_call_results cr
         JOIN airecruit_campaigns cc ON cc.id = cr.campaign_id
         WHERE cc.agency_id = $1
         ORDER BY cr.called_at DESC
         LIMIT 5`,
        [agency.agencyId]
      )
      airecruitResults = airecruitResult.rows
    } catch (e) {
      console.error('AIRecruit query failed:', e)
      airecruitResults = []
    }

    const systemPrompt = `You are the Careified AI Assistant for ${agency.agencyName}.

You have live access to ${agency.agencyName}'s platform data:
- Roster: ${roster.length} caregivers
- Shortlist: ${shortlist.length} caregivers across pipeline stages
- Clients: ${clients.length} active clients
- Recent AIRecruit: ${airecruitResults.length} screening results

YOUR CAPABILITIES:
Search and filter caregivers by criteria.
Summarize shortlist pipeline status.
Identify gaps between client needs and caregivers.
Explain AIRecruit screening results.
Suggest next actions.

AGENCY DATA:
ROSTER: ${JSON.stringify(roster)}
SHORTLIST: ${JSON.stringify(shortlist)}
CLIENTS: ${JSON.stringify(clients)}
AIRECRUIT RESULTS: ${JSON.stringify(airecruitResults)}

RULES — NON-NEGOTIABLE:
1. Never recommend a caregiver for hiring
2. Use 'criteria alignment' not 'recommendation'
3. Every caregiver-specific response must end with: 'All placement decisions are made independently by ${agency.agencyName}. Careified presents information only.'
4. Use 'as reported' for caregiver-provided data
5. Never claim to verify what you cannot verify
6. Keep responses concise and action-oriented
7. Reference the agency's actual data specifically — name caregivers and clients from the context above

TONE: You work for this agency coordinator. Be efficient, specific, and helpful.`

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
        'X-Title': 'Careified Agency Assistant',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 600,
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
    console.error('Agency assistant error:', error)
    return NextResponse.json(
      { error: 'AI temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
