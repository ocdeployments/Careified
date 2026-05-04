import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get caregiver record for this user
  const { rows: caregiverRows } = await pool.query(
    'SELECT id FROM caregivers WHERE user_id = $1',
    [userId]
  )

  if (caregiverRows.length === 0) {
    return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
  }

  const caregiverId = caregiverRows[0].id
  const body = await req.json()
  const { review_id, reason } = body

  if (!review_id || !reason) {
    return NextResponse.json({ error: 'review_id and reason required' }, { status: 400 })
  }

  if (reason.length > 500) {
    return NextResponse.json({ error: 'Reason must be 500 characters or less' }, { status: 400 })
  }

  // Get the review
  const { rows: reviews } = await pool.query(
    `SELECT id, caregiver_id, status, dispute_deadline
     FROM placement_reviews
     WHERE id = $1 AND caregiver_id = $2`,
    [review_id, caregiverId]
  )

  if (reviews.length === 0) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const review = reviews[0]

  // Check if already disputed
  if (review.status === 'disputed') {
    return NextResponse.json({ error: 'Review already disputed' }, { status: 400 })
  }

  // Check dispute deadline
  if (!review.dispute_deadline || new Date(review.dispute_deadline) < new Date()) {
    return NextResponse.json({ error: 'Dispute deadline has passed' }, { status: 400 })
  }

  // Update to disputed status with reason in review_text
  await pool.query(
    `UPDATE placement_reviews
     SET status = 'disputed', review_text = $1
     WHERE id = $2`,
    [reason, review_id]
  )

  return NextResponse.json({ success: true, message: 'Dispute submitted' })
}