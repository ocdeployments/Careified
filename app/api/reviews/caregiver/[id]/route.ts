import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

// Auth check - approved agency
async function checkApprovedAgency(): Promise<{ agencyId: string } | null> {
  let userId: string | null | undefined
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch {
    return null
  }

  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return null

    const result = await pool.query(
      "SELECT id FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return { agencyId: result.rows[0].id }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Only approved agencies can view reviews' },
        { status: 403 }
      )
    }

    const { id: caregiverId } = await params

    // Verify caregiver exists
    const caregiverResult = await pool.query(
      'SELECT id, first_name, last_name FROM caregivers WHERE id = $1',
      [caregiverId]
    )
    if (caregiverResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Caregiver not found' },
        { status: 404 }
      )
    }

    // Get all approved reviews for this caregiver
    const reviewsResult = await pool.query(
      `SELECT * FROM placement_reviews
       WHERE caregiver_id = $1 AND status = 'approved'
       ORDER BY review_submitted_at DESC`,
      [caregiverId]
    )

    // Get trust score
    const trustScoreResult = await pool.query(
      'SELECT aggregate_score FROM caregivers WHERE id = $1',
      [caregiverId]
    )

    // Get suitability
    const suitabilityResult = await pool.query(
      'SELECT * FROM caregiver_suitability WHERE caregiver_id = $1',
      [caregiverId]
    )

    // Get badges (placeholder - will be built in later commits)
    const badgesResult = await pool.query(
      `SELECT * FROM caregiver_badges WHERE caregiver_id = $1 AND status = 'earned'
       ORDER BY earned_at DESC`,
      [caregiverId]
    )

    // Non-recommender: aggregate only, not individual reviews
    // The submitting agency sees their own review in full
    const reviews = reviewsResult.rows.map(r => ({
      id: r.id,
      reviewer_type: r.reviewer_type,
      placement_start_date: r.placement_start_date,
      placement_end_date: r.placement_end_date,
      professional_reliability_score: r.professional_reliability_score,
      human_qualities_score: r.human_qualities_score,
      personal_care_hygiene_score: r.personal_care_hygiene_score,
      beyond_the_call_score: r.beyond_the_call_score,
      skills_match_score: r.skills_match_score,
      communication_conduct_score: r.communication_conduct_score,
      would_reengage: r.would_reengage,
      positive_feedback: r.agency_id === agency.agencyId ? r.positive_feedback : null, // Only show own feedback
      improvement_feedback: r.agency_id === agency.agencyId ? r.improvement_feedback : null,
    }))

    return NextResponse.json({
      reviews,
      trust_score: trustScoreResult.rows[0]?.aggregate_score || null,
      suitability: suitabilityResult.rows[0] || null,
      badge_triggers: badgesResult.rows, // Placeholder
    })
  } catch (err) {
    console.error('Error in GET /api/reviews/caregiver/[id]:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}