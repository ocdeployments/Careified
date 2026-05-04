import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { computeMatchScore, loadAllApprovedCaregivers } from '@/lib/matching'
import { generateGapAnalysis } from '@/lib/matching/gap-analysis'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

async function parseCommand(query: string, agencyId: string) {
  const clientRows = await pool.query(
    'SELECT id, client_first_name, primary_condition, city, state FROM client_needs WHERE agency_id = $1',
    [agencyId]
  )
  const clientNames = clientRows.rows.map((r: any) => r.client_first_name).join(', ')

  const prompt = `You are a caregiving agency assistant. Parse this staffing request and return JSON only.

Known clients: ${clientNames || 'none'}

Request: "${query}"

Return JSON:
{
  "intent": "find_caregiver" | "unknown",
  "client_name": string | null,
  "client_found": boolean,
  "condition": string | null,
  "city": string | null,
  "time": string | null,
  "summary": string
}

Rules:
- client_found = true only if name matches a known client exactly or closely
- summary = one sentence describing what the agency wants
- Return ONLY valid JSON, no markdown`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      max_tokens: 300,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { intent: 'unknown', client_name: null, client_found: false, summary: query }
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyRow = await pool.query('SELECT id FROM agencies WHERE clerk_user_id = $1', [userId])
  if (!agencyRow.rows.length) return NextResponse.json({ error: 'no_agency' }, { status: 403 })
  const agencyId = agencyRow.rows[0].id

  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'empty_query' }, { status: 400 })

  const parsed = await parseCommand(query, agencyId)

  if (parsed.intent !== 'find_caregiver') {
    return NextResponse.json({
      type: 'unknown',
      message: "I can help you find caregivers. Try: \"Find a caregiver for Eleanor\" or \"Find someone with dementia experience in Toronto\"",
    })
  }

  // Look up client
  let client = null
  let need: Record<string, any> = {}

  if (parsed.client_found && parsed.client_name) {
    const clientRow = await pool.query(
      `SELECT * FROM client_needs WHERE agency_id = $1 AND client_first_name ILIKE $2 LIMIT 1`,
      [agencyId, `%${parsed.client_name}%`]
    )
    if (clientRow.rows.length) {
      client = clientRow.rows[0]
      need = { ...client }
      delete need.id
      delete need.agency_id
      delete need.status
      delete need.matched_caregiver_id
      delete need.created_at
      delete need.updated_at
    }
  }

  // Build need from parsed if no client
  if (!client) {
    need = {
      primary_condition: parsed.condition || undefined,
      city: parsed.city || undefined,
      state: undefined,
    }
  }

  // Run match
  const caregivers = await loadAllApprovedCaregivers(pool)
  const ranked = caregivers
    .map(cg => {
      try { return { caregiver: cg, result: computeMatchScore(cg, need as any) } }
      catch { return null }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => (b.result.alignment_score ?? 0) - (a.result.alignment_score ?? 0))
    .slice(0, 3)

  const results = ranked.map(r => ({
    caregiver_id: r.caregiver.id,
    first_name: r.caregiver.first_name,
    last_name: r.caregiver.last_name,
    city: r.caregiver.city,
    state: r.caregiver.state,
    years_experience: r.caregiver.years_experience,
    hourly_rate: r.caregiver.hourly_rate,
    alignment_score: r.result.alignment_score,
    criteria_aligned: r.result.criteria_aligned?.slice(0, 3) || [],
    gaps: generateGapAnalysis(r.caregiver as any, need).slice(0, 2),
  }))

  return NextResponse.json({
    type: 'matches',
    summary: parsed.summary,
    client: client ? { id: client.id, name: client.client_first_name } : null,
    client_name: parsed.client_name,
    client_found: !!client,
    results,
  })
}
