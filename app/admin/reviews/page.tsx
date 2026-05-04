import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import ReviewsClient from './ReviewsClient'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

type SpotCheckReview = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  agency_name: string
  engagement_start: string
  engagement_end: string
  would_re_engage: boolean
  punctuality: number
  reliability: number
  warmth: number
  personal_hygiene: number
  comms_agency: number
  admin_flagged: boolean
  created_at: string
}

type DisputeReview = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  agency_name: string
  dispute_reason: string
  status: string
  dispute_deadline: string
  created_at: string
}

async function getSpotCheckReviews(): Promise<SpotCheckReview[]> {
  const { rows } = await pool.query(
    `SELECT
      pr.id,
      c.first_name AS caregiver_first_name,
      c.last_name AS caregiver_last_name,
      a.name AS agency_name,
      pr.engagement_start,
      pr.engagement_end,
      pr.would_re_engage,
      pr.punctuality,
      pr.reliability,
      pr.warmth,
      pr.personal_hygiene,
      pr.comms_agency,
      pr.admin_flagged,
      pr.created_at
    FROM placement_reviews pr
    JOIN caregivers c ON pr.caregiver_id = c.id
    JOIN agencies a ON pr.agency_id = a.id
    WHERE pr.admin_flagged = true AND pr.status = 'pending'
    ORDER BY pr.created_at DESC
    LIMIT 50`
  )
  return rows
}

async function getDisputeReviews(): Promise<DisputeReview[]> {
  const { rows } = await pool.query(
    `SELECT
      pr.id,
      c.first_name AS caregiver_first_name,
      c.last_name AS caregiver_last_name,
      a.name AS agency_name,
      pr.review_text AS dispute_reason,
      pr.status,
      pr.dispute_deadline,
      pr.created_at
    FROM placement_reviews pr
    JOIN caregivers c ON pr.caregiver_id = c.id
    JOIN agencies a ON pr.agency_id = a.id
    WHERE pr.status = 'disputed'
    ORDER BY pr.dispute_deadline ASC
    LIMIT 50`
  )
  return rows
}

export default async function AdminReviewsPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    redirect('/sign-in')
  }

  const [spotChecks, disputes] = await Promise.all([
    getSpotCheckReviews(),
    getDisputeReviews(),
  ])

  return <ReviewsClient spotChecks={spotChecks} disputes={disputes} />
}