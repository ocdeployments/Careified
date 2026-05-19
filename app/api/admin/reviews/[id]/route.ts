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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { id: reviewId } = await params
  const body = await req.json()
  const { action, note } = body

  if (!['approve', 'flag', 'uphold', 'override'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get current review data
  const { rows: reviews } = await pool.query(
    'SELECT caregiver_id, status FROM placement_reviews WHERE id = $1',
    [reviewId]
  )

  if (reviews.length === 0) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const caregiverId = reviews[0].caregiver_id
  let newStatus: string

  switch (action) {
    case 'approve':
      newStatus = 'approved'
      break
    case 'flag':
      newStatus = 'flagged'
      break
    case 'uphold':
    case 'override':
      newStatus = action === 'uphold' ? 'disputed_upheld' : 'overridden'
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Update the review
  await pool.query(
    `UPDATE placement_reviews
     SET status = $1, admin_flagged = false
     WHERE id = $2`,
    [newStatus, reviewId]
  )

  // If override, trigger score recalculation
  if (action === 'override') {
    try {
      await fetch(`${req.nextUrl.origin}/api/caregiver/score/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          eventType: 'reference_rehire_no', // Negative signal from dispute override
          notes: note || 'Dispute override by admin',
        }),
      })
    } catch (e) {
      console.error('Failed to trigger score recalc:', e)
    }
  }

  return NextResponse.json({ success: true, status: newStatus })
}