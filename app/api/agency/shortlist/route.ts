import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Fire-and-forget notification helper
async function sendShortlistNotification(caregiverId: string, type: 'shortlisted' | 'removed_from_shortlist', agencyId: string, agencyName: string) {
  try {
    const { createNotification, NotificationTemplates } = await import('@/lib/notifications/create')
    await createNotification({
      caregiverId,
      type,
      ...(type === 'shortlisted'
        ? NotificationTemplates.shortlisted(agencyName)
        : NotificationTemplates.removed_from_shortlist(agencyName)),
      metadata: { agency_id: agencyId, agency_name: agencyName }
    })
  } catch (err) {
    console.error('[notifications] shortlist notification failed:', err)
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { caregiverId, notes } = await req.json()
  if (!caregiverId) {
    return NextResponse.json({ error: 'caregiverId required' }, { status: 400 })
  }

  try {
    // Check if already shortlisted
    const existing = await pool.query(
      'SELECT id FROM agency_shortlist WHERE agency_clerk_id = $1 AND caregiver_id = $2',
      [userId, caregiverId]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({ success: true, message: 'Already shortlisted' })
    }

    await pool.query(
      'INSERT INTO agency_shortlist (agency_clerk_id, caregiver_id, notes, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, caregiverId, notes || null]
    )

    // Get agency name for notification
    const agencyResult = await pool.query(
      'SELECT id, name FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )
    if (agencyResult.rows.length > 0) {
      sendShortlistNotification(caregiverId, 'shortlisted', agencyResult.rows[0].id, agencyResult.rows[0].name)
    }

    return NextResponse.json({ success: true, message: 'Added to shortlist' })
  } catch (error) {
    console.error('Shortlist POST error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { caregiverId } = await req.json()

  try {
    await pool.query(
      'DELETE FROM agency_shortlist WHERE agency_clerk_id = $1 AND caregiver_id = $2',
      [userId, caregiverId]
    )

    // Get agency name for notification
    const agencyResult = await pool.query(
      'SELECT id, name FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )
    if (agencyResult.rows.length > 0) {
      sendShortlistNotification(caregiverId, 'removed_from_shortlist', agencyResult.rows[0].id, agencyResult.rows[0].name)
    }

    return NextResponse.json({ success: true, message: 'Removed from shortlist' })
  } catch (error) {
    console.error('Shortlist DELETE error:', error)
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
        s.notes,
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
      ORDER BY s.created_at DESC
    `, [userId])

    return NextResponse.json({ success: true, caregivers: result.rows })
  } catch (error) {
    console.error('Shortlist GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}