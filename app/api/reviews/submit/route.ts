import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

interface ReviewSubmission {
  caregiver_id: string
  placement_start_date: string
  placement_end_date?: string
  professional_reliability_score: number
  human_qualities_score: number
  personal_care_hygiene_score: number
  beyond_the_call_score?: number
  skills_match_score: number
  communication_conduct_score: number
  would_reengage: boolean
  positive_feedback?: string
  improvement_feedback?: string
}

// Validate scores are 0-5 in 0.5 increments
function isValidScore(score: number): boolean {
  return score >= 0 && score <= 5 && (score * 2) % 1 === 0
}

// Auth check - approved agency only
async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string; clerkUserId: string } | null> {
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
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return {
      agencyId: result.rows[0].id,
      agencyName: result.rows[0].name,
      clerkUserId: userId
    }
  } catch {
    return null
  }
}

// Verify agency has relationship with caregiver (roster OR shortlist)
async function verifyAgencyRelationship(agencyId: string, caregiverId: string): Promise<boolean> {
  // Check roster
  const rosterResult = await pool.query(
    'SELECT id FROM caregivers WHERE id = $1 AND source_agency_id = $2',
    [caregiverId, agencyId]
  )
  if (rosterResult.rows.length > 0) return true

  // Check shortlist
  const shortlistResult = await pool.query(
    'SELECT id FROM agency_shortlist WHERE caregiver_id = $1 AND agency_id = $2',
    [caregiverId, agencyId]
  )
  return shortlistResult.rows.length > 0
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (!checkRateLimit(clientIp, 5)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Only approved agencies can submit reviews' },
        { status: 403 }
      )
    }

    const body: ReviewSubmission = await request.json()

    // Validate required fields
    if (!body.caregiver_id || !body.placement_start_date) {
      return NextResponse.json(
        { error: 'validation_error', message: 'caregiver_id and placement_start_date required' },
        { status: 400 }
      )
    }

    // Validate scores
    const scoreFields = [
      'professional_reliability_score',
      'human_qualities_score',
      'personal_care_hygiene_score',
      'skills_match_score',
      'communication_conduct_score',
    ]

    for (const field of scoreFields) {
      const score = body[field as keyof ReviewSubmission] as number
      if (!isValidScore(score)) {
        return NextResponse.json(
          { error: 'validation_error', message: `${field} must be 0-5 in 0.5 increments` },
          { status: 400 }
        )
      }
    }

    // Validate beyond_the_call if provided
    if (body.beyond_the_call_score !== undefined && !isValidScore(body.beyond_the_call_score)) {
      return NextResponse.json(
        { error: 'validation_error', message: 'beyond_the_call_score must be 0-5 in 0.5 increments' },
        { status: 400 }
      )
    }

    // Verify caregiver exists
    const caregiverResult = await pool.query(
      'SELECT id FROM caregivers WHERE id = $1',
      [body.caregiver_id]
    )
    if (caregiverResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Caregiver not found' },
        { status: 404 }
      )
    }

    // Verify agency relationship
    const hasRelationship = await verifyAgencyRelationship(agency.agencyId, body.caregiver_id)
    if (!hasRelationship) {
      return NextResponse.json(
        { error: 'forbidden', message: 'You can only review caregivers in your roster or shortlist' },
        { status: 403 }
      )
    }

    // Insert review
    const insertResult = await pool.query(
      `INSERT INTO placement_reviews
       (caregiver_id, agency_id, reviewer_type, reviewer_id,
        placement_start_date, placement_end_date,
        professional_reliability_score, human_qualities_score,
        personal_care_hygiene_score, beyond_the_call_score,
        skills_match_score, communication_conduct_score,
        would_reengage, positive_feedback, improvement_feedback,
        status)
       VALUES ($1, $2, 'agency', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'approved')
       RETURNING id`,
      [
        body.caregiver_id,
        agency.agencyId,
        agency.clerkUserId,
        body.placement_start_date,
        body.placement_end_date || null,
        body.professional_reliability_score,
        body.human_qualities_score,
        body.personal_care_hygiene_score,
        body.beyond_the_call_score || null,
        body.skills_match_score,
        body.communication_conduct_score,
        body.would_reengage,
        body.positive_feedback || null,
        body.improvement_feedback || null,
      ]
    )

    const reviewId = insertResult.rows[0].id

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (action, actor_clerk_id, target_id, metadata)
       VALUES ('review_submitted', $1, $2, $3)`,
      [
        agency.clerkUserId,
        reviewId,
        JSON.stringify({ caregiver_id: body.caregiver_id, agency_id: agency.agencyId })
      ]
    )

    // TODO: Trigger recompute (will be done in Commit 9)
    // For now, just return success
    return NextResponse.json({
      success: true,
      review_id: reviewId,
      message: 'Rating submitted. Profile will update within minutes.',
    })
  } catch (err) {
    console.error('Error in POST /api/reviews/submit:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to submit review' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}