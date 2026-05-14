// Careified — GET Notifications List
// Returns paginated notifications for the authenticated caregiver

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

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
    return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
  }

  const caregiverId = caregiverResult.rows[0].id
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const unreadOnly = searchParams.get('unread_only') === 'true'

  try {
    // Build query based on filters
    let query = `
      SELECT id, type, title, message, action_url, metadata, read_at, created_at
      FROM caregiver_notifications
      WHERE caregiver_id = $1
    `
    const params: (string | number)[] = [caregiverId]

    if (unreadOnly) {
      query += ' AND read_at IS NULL'
    }

    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3'
    params.push(limit, offset)

    const notifications = await pool.query(query, params)

    // Get unread count
    const unreadResult = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM caregiver_notifications
       WHERE caregiver_id = $1 AND read_at IS NULL`,
      [caregiverId]
    )

    // Get total count
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM caregiver_notifications
       WHERE caregiver_id = $1`,
      [caregiverId]
    )

    return NextResponse.json({
      notifications: notifications.rows,
      unread_count: parseInt(unreadResult.rows[0].unread_count),
      total: parseInt(totalResult.rows[0].total)
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}