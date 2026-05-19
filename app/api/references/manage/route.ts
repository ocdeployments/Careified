import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caregiverRes = await pool.query(
    'SELECT id FROM caregivers WHERE clerk_user_id = $1',
    [userId]
  )
  if (caregiverRes.rows.length === 0) {
    return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })
  }

  const result = await pool.query(
    `SELECT id, reference_name, reference_email, reference_phone, relationship,
            status, sent_at, completed_at, created_at
     FROM reference_verification_requests
     WHERE caregiver_id = $1
     ORDER BY created_at DESC`,
    [caregiverRes.rows[0].id]
  )

  return NextResponse.json({ references: result.rows })
}