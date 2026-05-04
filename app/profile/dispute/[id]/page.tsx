import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import DisputeForm from './DisputeForm'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

type ReviewData = {
  id: string
  agency_name: string
  engagement_start: string
  engagement_end: string
  status: string
  dispute_deadline: string
  punctuality: number
  reliability: number
  warmth: number
  dignity: number
}

async function getReview(reviewId: string, userId: string): Promise<ReviewData | null> {
  const { rows } = await pool.query(
    `SELECT
      pr.id,
      a.name AS agency_name,
      pr.engagement_start,
      pr.engagement_end,
      pr.status,
      pr.dispute_deadline,
      pr.punctuality,
      pr.reliability,
      pr.warmth,
      pr.dignity
    FROM placement_reviews pr
    JOIN agencies a ON pr.agency_id = a.id
    JOIN caregivers c ON pr.caregiver_id = c.id
    WHERE pr.id = $1 AND c.user_id = $2`,
    [reviewId, userId]
  )
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    agency_name: r.agency_name,
    engagement_start: r.engagement_start?.toISOString(),
    engagement_end: r.engagement_end?.toISOString(),
    status: r.status,
    dispute_deadline: r.dispute_deadline?.toISOString(),
    punctuality: r.punctuality,
    reliability: r.reliability,
    warmth: r.warmth,
    dignity: r.dignity,
  }
}

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id: reviewId } = await params
  const review = await getReview(reviewId, userId)

  if (!review) {
    return (
      <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ color: '#0D1B3E' }}>Review not found</h1>
        <p style={{ color: '#64748B' }}>This review doesn't exist or you don't have access.</p>
        <a href="/profile/strength" style={{ color: '#C9973A' }}>Back to profile strength</a>
      </div>
    )
  }

  if (review.status === 'disputed') {
    return (
      <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ color: '#0D1B3E' }}>Already disputed</h1>
        <p style={{ color: '#64748B' }}>You have already submitted a dispute for this review.</p>
        <a href="/profile/strength" style={{ color: '#C9973A' }}>Back to profile strength</a>
      </div>
    )
  }

  if (new Date(review.dispute_deadline) < new Date()) {
    return (
      <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ color: '#0D1B3E' }}>Dispute window closed</h1>
        <p style={{ color: '#64748B' }}>The 14-day dispute window has passed for this review.</p>
        <a href="/profile/strength" style={{ color: '#C9973A' }}>Back to profile strength</a>
      </div>
    )
  }

  return <DisputeForm review={review} />
}