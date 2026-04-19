import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { recordAgencyConsent } from '@/lib/consent/capture'
import type { ConsentType } from '@/lib/legal/text'

const ALLOWED_TYPES: ConsentType[] = [
  'agency_platform_role',
  'agency_employer_responsibility',
  'agency_no_warranty',
  'agency_data_usage',
]

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [userId]
  )
  const agencyId = rows[0]?.id
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  let body: { consents: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const consents = Array.isArray(body.consents) ? body.consents : []
  const invalid = consents.filter(c => !ALLOWED_TYPES.includes(c as ConsentType))
  if (invalid.length > 0) {
    return NextResponse.json({ error: 'invalid_consent_type', invalid }, { status: 400 })
  }

  const ipAddress = req.headers.get('x-forwarded-for') || undefined
  const userAgent = req.headers.get('user-agent') || undefined

  const ids: string[] = []
  for (const t of consents) {
    const id = await recordAgencyConsent(pool, agencyId, userId, {
      consentType: t as ConsentType,
      granted: true,
      ipAddress,
      userAgent,
    })
    ids.push(id)
  }

  return NextResponse.json({ recorded: ids.length, ids })
}
