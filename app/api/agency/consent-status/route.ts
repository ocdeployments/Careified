import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { hasCurrentAgencyConsent } from '@/lib/consent/capture'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [userId]
  )
  const agencyId = rows[0]?.id
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  return NextResponse.json({
    has_agency_platform_role: await hasCurrentAgencyConsent(pool, agencyId, 'agency_platform_role'),
    has_agency_employer_responsibility: await hasCurrentAgencyConsent(pool, agencyId, 'agency_employer_responsibility'),
    has_agency_no_warranty: await hasCurrentAgencyConsent(pool, agencyId, 'agency_no_warranty'),
    has_agency_data_usage: await hasCurrentAgencyConsent(pool, agencyId, 'agency_data_usage'),
  })
}
