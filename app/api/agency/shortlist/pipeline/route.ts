import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const VALID_STATUSES = ['discovered', 'contacted', 'interviewing', 'placed', 'inactive']

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { caregiverId, pipelineStatus } = await req.json()

  if (!caregiverId || !pipelineStatus) {
    return NextResponse.json({ error: 'caregiverId and pipelineStatus required' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(pipelineStatus)) {
    return NextResponse.json({ error: 'Invalid pipeline status' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `UPDATE agency_shortlist
       SET pipeline_status = $1
       WHERE agency_clerk_id = $2 AND caregiver_id = $3
       RETURNING id`,
      [pipelineStatus, userId, caregiverId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found in shortlist' }, { status: 404 })
    }

    return NextResponse.json({ success: true, pipeline_status: pipelineStatus })
  } catch (error) {
    console.error('Pipeline status update error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.caregiver_id,
        s.pipeline_status,
        s.created_at,
        c.first_name,
        c.last_name,
        c.job_title,
        c.photo_url,
        c.aggregate_score,
        c.city,
        c.state,
        c.availability_status,
        c.years_experience,
        c.specializations
      FROM agency_shortlist s
      JOIN caregivers c ON c.id = s.caregiver_id
      WHERE s.agency_clerk_id = $1
      ORDER BY
        CASE s.pipeline_status
          WHEN 'interviewing' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'discovered' THEN 3
          WHEN 'placed' THEN 4
          WHEN 'inactive' THEN 5
          ELSE 6
        END,
        s.created_at DESC
    `, [userId])

    return NextResponse.json({ success: true, caregivers: result.rows })
  } catch (error) {
    console.error('Pipeline GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}