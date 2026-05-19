import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get caregiver
  const { rows: caregiverRows } = await pool.query(
    'SELECT id FROM caregivers WHERE user_id = $1',
    [userId]
  )

  if (caregiverRows.length === 0) {
    return NextResponse.json({ disputes: [] })
  }

  const caregiverId = caregiverRows[0].id

  // Get reviews within dispute window (dispute_deadline > now)
  const { rows } = await pool.query(
    `SELECT
      pr.id,
      a.name AS agency_name,
      pr.engagement_start,
      pr.engagement_end,
      pr.status,
      pr.dispute_deadline
    FROM placement_reviews pr
    JOIN agencies a ON pr.agency_id = a.id
    WHERE pr.caregiver_id = $1
      AND pr.dispute_deadline > NOW()
      AND pr.status IN ('pending', 'approved')
    ORDER BY pr.dispute_deadline ASC`,
    [caregiverId]
  )

  const disputes = rows.map(r => ({
    id: r.id,
    agency_name: r.agency_name,
    engagement_start: r.engagement_start?.toISOString(),
    engagement_end: r.engagement_end?.toISOString(),
    status: r.status,
    dispute_deadline: r.dispute_deadline?.toISOString(),
  }))

  return NextResponse.json({ disputes })
}