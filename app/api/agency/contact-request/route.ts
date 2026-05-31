import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { caregiverId, message } = await req.json()
  if (!caregiverId) {
    return NextResponse.json({ error: 'caregiverId required' }, { status: 400 })
  }

  try {
    // Verify agency exists for this user
    const agencyResult = await pool.query(
      'SELECT id FROM agencies WHERE clerk_user_id = $1 AND status = $2',
      [userId, 'approved']
    )

    if (agencyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agency not found or not approved' }, { status: 403 })
    }

    const agencyId = agencyResult.rows[0].id

    // Insert contact request
    await pool.query(
      'INSERT INTO contact_requests (agency_id, caregiver_id, message, created_at) VALUES ($1, $2, $3, NOW())',
      [agencyId, caregiverId, message || null]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact request POST error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
