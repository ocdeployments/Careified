import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  let agencyId: string | null = null

  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') {
      return NextResponse.json({ error: 'not_agency' }, { status: 403 })
    }

    const agencyResult = await pool.query(
      "SELECT id::text as id FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (agencyResult.rows.length === 0) {
      return NextResponse.json({ error: 'agency_not_approved' }, { status: 403 })
    }

    agencyId = agencyResult.rows[0].id
  } catch (e: any) {
    if (e?.message?.includes('NEXT_REDIRECT')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }
    console.error('Auth error:', e)
    return NextResponse.json({ error: 'auth_error' }, { status: 500 })
  }

  // Return default zeros
  const result = {
    clients_unmatched: 0,
    airecruit_ready: 0,
    credentials_expiring: 0,
    trial_ends_at: null,
  }

  // Clients unmatched
  try {
    const clientsRes = await pool.query(
      "SELECT COUNT(*) as c FROM client_needs WHERE agency_id::text = $1 AND matched_caregiver_id IS NULL AND status != 'closed'",
      [agencyId]
    )
    result.clients_unmatched = parseInt(clientsRes.rows[0]?.c || '0')
  } catch (e) {
    console.error('clients_unmatched query failed:', e)
  }

  // AIRecruit ready (results in last 48 hours)
  try {
    const airecruitRes = await pool.query(
      `SELECT COUNT(*) as c FROM airecruit_call_results cr
       WHERE cr.campaign_id IN (SELECT id FROM airecruit_campaigns WHERE agency_id = $1)
       AND cr.called_at > NOW() - INTERVAL '48 hours'
       AND cr.recommendation = 'review'`,
      [agencyId]
    )
    result.airecruit_ready = parseInt(airecruitRes.rows[0]?.c || '0')
  } catch (e) {
    console.error('airecruit_ready query failed:', e)
  }

  // Credentials expiring (next 30 days)
  try {
    const credsRes = await pool.query(
      `SELECT COUNT(*) as c FROM caregiver_certifications cc
       WHERE cc.caregiver_id IN (SELECT id FROM caregivers WHERE created_by_agency_id = $1)
       AND cc.expiry_date IS NOT NULL
       AND cc.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'`,
      [agencyId]
    )
    result.credentials_expiring = parseInt(credsRes.rows[0]?.c || '0')
  } catch (e) {
    console.error('credentials_expiring query failed:', e)
  }

  // Trial end date
  try {
    const agencyRes = await pool.query(
      'SELECT trial_ends_at FROM agencies WHERE id = $1',
      [agencyId]
    )
    result.trial_ends_at = agencyRes.rows[0]?.trial_ends_at || null
  } catch (e) {
    console.error('trial_ends_at query failed:', e)
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' }
  })
}