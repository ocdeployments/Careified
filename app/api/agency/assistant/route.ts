import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'minimax/minimax-m2.5:free'

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

    if (role !== 'agency' && role !== 'admin') return null

    const result = await pool.query(
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status IN ('approved', 'active')",
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
    // Rate limit: 30 requests per IP per hour (AI route)
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp, 30)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

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

    const systemPrompt = `You are the Careified Agency Assistant — a knowledgeable operations co-pilot for home care agencies.

You help coordinators with their daily workflow on the Careified platform. You know what the platform can do and you always present data — never make hiring recommendations.

PLATFORM CAPABILITIES YOU KNOW ABOUT:
- Search caregivers by diagnosis experience, availability, location, certifications, languages, shift type
- Add clients with care needs and get ranked alignment scores (not recommendations — scores)
- View agency roster — caregivers the agency added, imported, or invited
- Track pipeline stages: Discovered → Contacted → Interviewing → Placed → Inactive
- Launch AIRecruit screening campaigns — AI calls candidates by phone overnight
- Start reference calls — AI calls listed references and scores responses
- Start employer verification calls — AI calls past employers
- QuickFill — alert available caregivers of an urgent shift opening
- View shortlist with pipeline status per candidate
- Credential tracking — VSC, CPR, First Aid expiry dates

CRITICAL LANGUAGE RULES — non-negotiable:
- NEVER say "recommend", "best match", "top candidate", "hire this person", "safe to hire"
- ALWAYS say "highest alignment score", "strong fit on X dimensions", "review and decide"
- You present data. The agency makes all placement decisions.
- Every response involving a specific caregiver ends with: "The placement decision is yours."

RESPONSE FORMAT:
- Be concise. 2-3 sentences maximum unless detail is specifically requested.
- If the user wants to navigate somewhere or take an action, end your response with one action block:
  <action>{"type":"navigate","url":"/agency/search?q=dementia"}</action>
- Only include an action block when you are confident the user wants to go somewhere or do something.
- Never include more than one action block per response.

AVAILABLE ACTION URLs:
/agency/search — search caregivers (add ?q= for keywords)
 /agency/clients — client list
 /agency/clients/new — add new client
 /agency/clients?tab=unmatched — unmatched clients
 /agency/airecruit — AIRecruit campaigns
 /agency/airecruit/new — start new campaign
 /agency/roster — agency roster
 /agency/roster/import — import CSV
 /agency/shortlist — shortlist and pipeline
 /agency/intelligence — ROI and analytics

SEARCH INTENT: When the user asks to find a caregiver with specific attributes, output a search action block using these params:
 - language: e.g. French, Spanish, Cantonese, Mandarin, Portuguese, Tagalog
 - specialty: e.g. dementia, palliative, pediatric, ALS, Parkinson's, diabetes, wound_care
 - availability: one of live_in | overnight | full_time | part_time | flexible
 - placement: one of live_in | hourly | overnight
 - city: city name
 - urgent: true (only if user says urgent/emergency/ASAP)
 - vehicle: true (only if user specifically asks for driver)

 Output format: <action>{"type":"navigate","url":"/agency/search?language=French&availability=overnight&city=Scarborough"}</action>

 Only include params the user actually specified. Never invent params. If the user says 'find me a caregiver' with no attributes, use ?q= only.

AGENCY DATA:
ROSTER: ${JSON.stringify(roster)}
SHORTLIST: ${JSON.stringify(shortlist)}
CLIENTS: ${JSON.stringify(clients)}
AIRECRUIT RESULTS: ${JSON.stringify(airecruitResults)}`

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

    return NextResponse.json({ response: aiMessage, streamed: false })
  } catch (error) {
    console.error('Agency assistant error:', error)
    return NextResponse.json(
      { error: 'AI temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
