import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

async function getAgencyId(userId: string) {
  const r = await pool.query('SELECT id FROM agencies WHERE clerk_user_id = $1', [userId])
  return r.rows[0]?.id || null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 404 })

  const r = await pool.query(`
    SELECT id, name, display_name, business_type, license_number,
      contact_first_name, contact_last_name, contact_email, contact_phone,
      street, city, state, postal_code, status,
      brand_color, tagline, website_url, service_areas, care_types,
      coordinator_count, current_tools, recruitment_methods,
      business_registration, insurance_carrier, insurance_policy,
      background_check_provider
    FROM agencies WHERE id = $1
  `, [agencyId])

  return NextResponse.json({ agency: r.rows[0] })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 404 })

  const body = await req.json()
  const allowed = [
    'name','display_name','tagline','website_url','brand_color',
    'city','state','postal_code','street',
    'service_areas','care_types','coordinator_count','current_tools',
    'recruitment_methods','business_registration','license_number',
    'insurance_carrier','insurance_policy','background_check_provider',
    'contact_first_name','contact_last_name','contact_email','contact_phone',
  ]

  const updates = Object.entries(body).filter(([k]) => allowed.includes(k))
  if (!updates.length) return NextResponse.json({ error: 'no_valid_fields' }, { status: 400 })

  const setClauses = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ')
  const values = updates.map(([, v]) => v)
  values.push(agencyId)

  await pool.query(
    `UPDATE agencies SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length}`,
    values
  )

  const r = await pool.query('SELECT * FROM agencies WHERE id = $1', [agencyId])
  return NextResponse.json({ agency: r.rows[0] })
}
