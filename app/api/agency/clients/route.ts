// app/api/agency/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

async function getAgencyId(clerkUserId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [clerkUserId]
  )
  return rows[0]?.id ?? null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  const { rows } = await pool.query(
    `SELECT id, client_first_name, client_age, primary_condition,
      placement_type, city, state, language_required, status,
      created_at, matched_caregiver_id
    FROM client_needs
    WHERE agency_id = $1
    ORDER BY created_at DESC`,
    [agencyId]
  )

  return NextResponse.json({ clients: rows })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const fields = [
    'client_first_name', 'client_age',
    'primary_condition', 'secondary_conditions', 'mobility_level', 'medications_complex',
    'services_needed', 'care_intensity', 'placement_type', 'hours_per_week',
    'start_date', 'duration_expected',
    'city', 'state', 'postal_code',
    'pets_present', 'smoking_household', 'home_condition', 'family_dynamics',
    'language_required', 'gender_preference', 'cultural_preference', 'personality_desired',
    'hourly_rate_max',
  ]

  const values: unknown[] = [agencyId]
  const cols: string[] = ['agency_id']
  const placeholders: string[] = ['$1']
  let idx = 2

  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null && body[f] !== '') {
      cols.push(f)
      values.push(body[f])
      placeholders.push(`$${idx++}`)
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO client_needs (${cols.join(',')})
    VALUES (${placeholders.join(',')})
    RETURNING id, client_first_name, status, created_at`,
    values
  )

  return NextResponse.json({ client: rows[0] }, { status: 201 })
}