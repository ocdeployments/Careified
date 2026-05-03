import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function getCaregiver(clerkUserId: string) {
  const r = await pool.query('SELECT id, first_name, last_name FROM caregivers WHERE clerk_user_id = $1', [clerkUserId])
  return r.rows[0] || null
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const caregiver = await getCaregiver(userId)
  if (!caregiver) return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })

  const { referenceName, referenceEmail, referencePhone, relationship } = await req.json()
  if (!referenceName || !relationship) return NextResponse.json({ error: 'Name and relationship required' }, { status: 400 })
  if (!referenceEmail && !referencePhone) return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })

  const result = await pool.query(
    `INSERT INTO reference_verification_requests (caregiver_id, reference_name, reference_email, reference_phone, relationship)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, token`,
    [caregiver.id, referenceName, referenceEmail || null, referencePhone || null, relationship]
  )

  const { id, token } = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://careified.vercel.app'
  return NextResponse.json({ id, token, responseUrl: `${appUrl}/reference/${token}` })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const caregiver = await getCaregiver(userId)
  if (!caregiver) return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })

  const result = await pool.query(
    `SELECT id, reference_name, reference_email, relationship, status, sent_at, completed_at,
            would_rehire, reliability_rating, professionalism_rating, comment, years_known
     FROM reference_verification_requests WHERE caregiver_id = $1 ORDER BY sent_at DESC`,
    [caregiver.id]
  )
  return NextResponse.json({ references: result.rows })
}
