import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

async function getAgencyId(userId: string): Promise<string | null> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string

  if (role !== 'agency' && role !== 'admin') {
    return null
  }

  const agencyResult = await pool.query(
    "SELECT id::text as id FROM agencies WHERE clerk_user_id = $1 AND status IN ('approved', 'active')",
    [userId]
  )

  if (agencyResult.rows.length === 0) {
    return null
  }

  return agencyResult.rows[0].id
}

async function generateNarrative(agencyId: string): Promise<{ narrative: string; empty?: boolean }> {
  // Gather all data in parallel queries
  const [airecruitData, expiringCreds, unmatchedClients, benchGaps] = await Promise.all([
    // AIRecruit results from last 24h
    pool.query(`
      SELECT ac."caregiverId" as caregiver_id,
             c.first_name, c.last_name,
             ac."rawScore" as overall_score,
             ac.recommendation
      FROM "AIRecruitCall" ac
      JOIN "AIRecruitCampaign" camp ON camp.id = ac."campaignId"
      LEFT JOIN caregivers c ON c.id::text = ac."caregiverId"
      WHERE camp."agencyId" = $1::uuid::text
        AND ac."completedAt" > NOW() - INTERVAL '24 hours'
        AND ac.recommendation IS NOT NULL
      ORDER BY ac."rawScore" DESC NULLS LAST LIMIT 5
    `, [agencyId]),

    // Expiring credentials (next 60 days)
    pool.query(`
      SELECT COUNT(*)::int as count
      FROM caregiver_certifications cc
      JOIN caregivers c ON c.id = cc.caregiver_id
      WHERE c.created_by_agency_id = $1::uuid
        AND cc.expiry_date IS NOT NULL
        AND cc.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '60 days'
    `, [agencyId]),

    // Unmatched clients (longest waiting)
    pool.query(`
      SELECT client_first_name, EXTRACT(DAY FROM now() - created_at)::int as days_waiting
      FROM client_needs
      WHERE agency_id = $1::uuid AND matched_caregiver_id IS NULL AND status != 'closed'
      ORDER BY created_at ASC LIMIT 3
    `, [agencyId]),

    // Bench strength gaps (critical)
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE specializations::text ILIKE '%dementia%') as dementia_count,
        COUNT(*) FILTER (WHERE languages::text ILIKE '%french%') as french_count,
        COUNT(*) FILTER (WHERE willing_live_in = true) as livein_count,
        COUNT(*) FILTER (WHERE specializations::text ILIKE '%wound%') as wound_count
      FROM caregivers
      WHERE created_by_agency_id = $1::uuid
    `, [agencyId]),
  ])

  const airecruitResults = airecruitData.rows
  const expiringCount = expiringCreds.rows[0]?.count || 0
  const unmatchedList = unmatchedClients.rows
  const bench = benchGaps.rows[0]

  // Identify critical gaps
  const criticalGaps: string[] = []
  if (parseInt(bench?.dementia_count || '0') === 0) criticalGaps.push('Dementia')
  if (parseInt(bench?.french_count || '0') === 0) criticalGaps.push('French')
  if (parseInt(bench?.livein_count || '0') === 0) criticalGaps.push('Live-in')
  if (parseInt(bench?.wound_count || '0') === 0) criticalGaps.push('Wound care')

  // Check for empty state - skip LLM if no activity
  const hasActivity = airecruitResults.length > 0 || expiringCount > 0 || unmatchedList.length > 0 || criticalGaps.length > 0

  if (!hasActivity) {
    return {
      narrative: 'No activity to report. Check back after business hours when Paracle completes its calls.',
      empty: true,
    }
  }

  // Build user prompt
  const airecruitSummary = airecruitResults.length > 0
    ? airecruitResults.map(r => `${r.first_name} ${r.last_name} (ID: ${r.caregiver_id}, score: ${r.overall_score})`).join(', ')
    : 'No calls completed'

  const userPrompt = `Here is today's triage data for this agency:
- AIRecruit calls completed during business hours: ${airecruitResults.length} calls, top scorers: ${airecruitSummary}
- Expiring credentials in next 60 days: ${expiringCount}
- Unmatched clients: ${unmatchedList.length} total, longest waiting: ${unmatchedList.map(c => `${c.client_first_name} (${c.days_waiting} days)`).join(', ') || 'none'}
- Critical bench gaps: ${criticalGaps.length > 0 ? criticalGaps.join(', ') : 'none'}
Write a 2-3 sentence triage briefing.`

  const systemPrompt = `You are a triage assistant for a home care staffing agency. Write a plain English morning briefing in exactly 2-3 sentences. Be specific: use actual names and numbers. Do not use bullet points, headers, or markdown. Format caregiver names as [First Last](caregiverId) so they can be rendered as links. Be direct and actionable.`

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'upstage/ring-2.6-1t:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`)
    }

    const data = await response.json()
    const narrative = data.choices?.[0]?.message?.content?.trim()

    if (!narrative) {
      throw new Error('Empty response from OpenRouter')
    }

    // Strip markdown
    return narrative.replace(/^```[\s\S]*?```$/gm, '').replace(/^\*\*|^\*|#+ /gm, '').trim()
  } catch (error) {
    console.error('[TRIDGE_NARRATIVE] OpenRouter error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  // Check cache
  const cacheResult = await pool.query(
    'SELECT narrative FROM triage_narrative_cache WHERE agency_id = $1::uuid AND date = CURRENT_DATE',
    [agencyId]
  )

  if (cacheResult.rows.length > 0) {
    return NextResponse.json({
      narrative: cacheResult.rows[0].narrative,
      cached: true,
    })
  }

  // Cache miss - generate narrative
  let narrative: string
  let fallback = false
  let empty = false

  try {
    const result = await generateNarrative(agencyId)
    narrative = result.narrative
    empty = result.empty || false
  } catch (error) {
    narrative = 'Your triage summary is being prepared — check back shortly.'
    fallback = true
  }

  // Cache the result (including empty state)
  try {
    await pool.query(
      `INSERT INTO triage_narrative_cache (agency_id, date, narrative) VALUES ($1::uuid, CURRENT_DATE, $2) ON CONFLICT (agency_id, date) DO NOTHING`,
      [agencyId, narrative]
    )
  } catch (e) {
    console.warn('[TRIDGE_NARRATIVE] Cache write failed:', e)
  }

  return NextResponse.json({
    narrative,
    cached: false,
    fallback,
    empty,
  })
}

export async function DELETE(request: NextRequest) {
  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  // Clear today's cache
  try {
    await pool.query(
      'DELETE FROM triage_narrative_cache WHERE agency_id = $1::uuid AND date = CURRENT_DATE',
      [agencyId]
    )
  } catch (e) {
    console.error('[TRIDGE_NARRATIVE] Cache clear failed:', e)
    return NextResponse.json({ error: 'clear_failed' }, { status: 500 })
  }

  return NextResponse.json({ cleared: true })
}