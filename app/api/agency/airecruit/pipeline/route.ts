import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const agencyResult = await pool.query(
      `SELECT id FROM agencies WHERE clerk_user_id = $1 AND status IN ('approved','active') LIMIT 1`,
      [userId]
    )
    if (!agencyResult.rows.length) return NextResponse.json({ shortlisted: [], screened: [], references: [], ready: [] })
    const agencyId = agencyResult.rows[0].id

    const [shortlistedRes, screenedRes] = await Promise.all([
      pool.query(`
        SELECT c.id,
               TRIM(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')) as name,
               COALESCE(c.placement_types[1], 'Caregiver') as role,
               COALESCE(c.specializations, ARRAY[]::text[]) as specializations,
               s.created_at
        FROM agency_shortlist s
        JOIN caregivers c ON c.id::text = s.caregiver_id
        WHERE s.agency_clerk_id = $1
        ORDER BY s.created_at DESC
      `, [userId]),
      pool.query(`
        SELECT DISTINCT ON (ac."candidateName")
               ac.id as call_id,
               ac."campaignId" as campaign_id,
               ac."candidateName" as name,
               COALESCE(ac."rawScore", 0) as score,
               ac.recommendation,
               'Candidate' as role
        FROM "AIRecruitCall" ac
        JOIN "AIRecruitCampaign" camp ON camp.id = ac."campaignId"
        WHERE camp."agencyId" = $1
          AND ac.recommendation IS NOT NULL
        ORDER BY ac."candidateName", ac."rawScore" DESC NULLS LAST
      `, [agencyId]),
    ])

    const allScreened = screenedRes.rows
    const ready = allScreened.filter(s => s.recommendation === 'advance' && s.score >= 80)
    const screened = allScreened.filter(s => !(s.recommendation === 'advance' && s.score >= 80))

    return NextResponse.json({
      shortlisted: shortlistedRes.rows,
      screened,
      references: [],
      ready,
    })
  } catch (err) {
    console.error('[airecruit/pipeline]', err)
    return NextResponse.json({ shortlisted: [], screened: [], references: [], ready: [] })
  }
}