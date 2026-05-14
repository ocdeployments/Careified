// Careified — POST Mark Notifications Read
// Marks notifications as read for the authenticated caregiver

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get caregiver ID from userId
  const caregiverResult = await pool.query(
    'SELECT id FROM caregivers WHERE user_id = $1',
    [userId]
  )

  if (caregiverResult.rows.length === 0) {
    return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
  }

  const caregiverId = caregiverResult.rows[0].id

  try {
    const body = await req.json()
    const notificationIds = body.notification_ids

    let markedRead = 0

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const result = await pool.query(
        `UPDATE caregiver_notifications
         SET read_at = NOW()
         WHERE id = ANY($1) AND caregiver_id = $2
         RETURNING id`,
        [notificationIds, caregiverId]
      )
      markedRead = result.rowCount || 0
    } else {
      // Mark all as read
      const result = await pool.query(
        `UPDATE caregiver_notifications
         SET read_at = NOW()
         WHERE caregiver_id = $1 AND read_at IS NULL
         RETURNING id`,
        [caregiverId]
      )
      markedRead = result.rowCount || 0
    }

    return NextResponse.json({ marked_read: markedRead })
  } catch (error) {
    console.error('Notifications mark-read error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}