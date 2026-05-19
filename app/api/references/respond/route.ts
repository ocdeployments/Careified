import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const result = await pool.query(
    `SELECT r.reference_name, r.relationship, r.status, c.first_name, c.last_name
     FROM reference_verification_requests r
     JOIN caregivers c ON c.id = r.caregiver_id
     WHERE r.token = $1`,
    [token]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  return NextResponse.json({ request: result.rows[0] })
}

export async function POST(req: NextRequest) {
  const { token, wouldRehire, reliabilityRating, professionalismRating, comment, yearsKnown } = await req.json()

  if (!token || !wouldRehire || !reliabilityRating || !professionalismRating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await pool.query(
    'SELECT id, status FROM reference_verification_requests WHERE token = $1', [token]
  )
  if (existing.rows.length === 0) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  if (existing.rows[0].status === 'completed') return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null
  await pool.query(
    `UPDATE reference_verification_requests
     SET status = 'completed', completed_at = NOW(),
         would_rehire = $1, reliability_rating = $2, professionalism_rating = $3,
         comment = $4, years_known = $5, ip_address = $6
     WHERE token = $7`,
    [wouldRehire, reliabilityRating, professionalismRating, comment || null, yearsKnown || null, ip, token]
  )
  return NextResponse.json({ success: true })
}
