import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { decryptPHI, decryptPHIJson } from '@/lib/encryption/phi'
import { logAudit } from '@/lib/audit/log'

async function getAgencyId(clerkUserId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [clerkUserId]
  )
  return rows[0]?.id ?? null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  const { id } = await params

  const { rows } = await pool.query(
    `SELECT * FROM client_needs WHERE id = $1 AND agency_id = $2`,
    [id, agencyId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const r = rows[0]

  const client = {
    id: r.id,
    client_first_name: decryptPHI(r.client_first_name_encrypted),
    client_age: r.client_age,
    primary_condition: decryptPHI(r.primary_condition_encrypted),
    secondary_conditions: decryptPHIJson<string[]>(r.secondary_conditions_encrypted) ?? [],
    mobility_level: decryptPHI(r.mobility_level_encrypted),
    medications_complex: (() => {
      const v = decryptPHI(r.medications_complex_encrypted)
      return v === 'true' ? true : v === 'false' ? false : null
    })(),
    services_needed: r.services_needed,
    care_intensity: r.care_intensity,
    placement_type: r.placement_type,
    hours_per_week: r.hours_per_week,
    start_date: r.start_date,
    duration_expected: r.duration_expected,
    city: r.city,
    state: r.state,
    postal_code: r.postal_code,
    pets_present: r.pets_present,
    smoking_household: r.smoking_household,
    home_condition: r.home_condition,
    family_dynamics: r.family_dynamics,
    language_required: r.language_required,
    gender_preference: r.gender_preference,
    cultural_preference: r.cultural_preference,
    personality_desired: r.personality_desired,
    hourly_rate_max: r.hourly_rate_max,
    status: r.status,
    matched_caregiver_id: r.matched_caregiver_id,
    created_at: r.created_at,
  }

  logAudit(pool, {
    actorType: 'agency',
    actorId: userId,
    action: 'client_needs_view',
    resourceType: 'client_needs',
    resourceId: id,
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ client })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  const { id } = await params

  const result = await pool.query(
    `DELETE FROM client_needs WHERE id = $1 AND agency_id = $2`,
    [id, agencyId]
  )

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  logAudit(pool, {
    actorType: 'agency',
    actorId: userId,
    action: 'client_needs_deleted',
    resourceType: 'client_needs',
    resourceId: id,
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ success: true })
}
