// Careified — GET Unread Notification Count
// Lightweight endpoint for navbar bell badge

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ unread_count: 0 })
  }

  const caregiverId = caregiverResult.rows[0].id

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM caregiver_notifications
       WHERE caregiver_id = $1 AND read_at IS NULL`,
      [caregiverId]
    )

    return NextResponse.json({
      unread_count: parseInt(result.rows[0].unread_count)
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Notifications count error:', error)
    return NextResponse.json({ unread_count: 0 })
  }
}