import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

interface SelfAssessment {
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

// Validate scores
function isValidScore(score: number): boolean {
  return score >= 0 && score <= 5 && (score * 2) % 1 === 0
}

// Auth check - caregiver role
async function checkCaregiver(): Promise<{ caregiverId: string; clerkUserId: string } | null> {
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

    if (role !== 'caregiver') return null

    const result = await pool.query(
      'SELECT id FROM caregivers WHERE clerk_id = $1',
      [userId]
    )

    if (result.rows.length === 0) return null

    return {
      caregiverId: result.rows[0].id,
      clerkUserId: userId
    }
  } catch {
    return null
  }
}

// Check rate limit: 1 self-assessment per 90 days
async function checkSelfAssessmentRateLimit(caregiverId: string): Promise<{ allowed: boolean; lastSubmission: Date | null; daysUntilNext: number }> {
  const result = await pool.query(
    `SELECT review_submitted_at FROM placement_reviews
     WHERE caregiver_id = $1 AND reviewer_type = 'caregiver'
     ORDER BY review_submitted_at DESC LIMIT 1`,
    [caregiverId]
  )

  if (result.rows.length === 0) {
    return { allowed: true, lastSubmission: null, daysUntilNext: 0 }
  }

  const lastSubmission = new Date(result.rows[0].review_submitted_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - lastSubmission.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSince >= 90) {
    return { allowed: true, lastSubmission, daysUntilNext: 0 }
  }

  return { allowed: false, lastSubmission, daysUntilNext: 90 - daysSince }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (!checkRateLimit(clientIp, 3)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const caregiver = await checkCaregiver()
    if (!caregiver) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Only caregivers can submit self-assessments' },
        { status: 403 }
      )
    }

    // Check rate limit
    const rateLimit = await checkSelfAssessmentRateLimit(caregiver.caregiverId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', message: `Your last self-assessment was ${rateLimit.lastSubmission?.toLocaleDateString()}. You can update in ${rateLimit.daysUntilNext} days.` },
        { status: 429 }
      )
    }

    const body: SelfAssessment = await request.json()

    // Validate required fields
    if (!body.placement_start_date) {
      return NextResponse.json(
        { error: 'validation_error', message: 'placement_start_date required' },
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
      const score = body[field as keyof SelfAssessment] as number
      if (!isValidScore(score)) {
        return NextResponse.json(
          { error: 'validation_error', message: `${field} must be 0-5 in 0.5 increments` },
          { status: 400 }
        )
      }
    }

    // Insert self-assessment
    const insertResult = await pool.query(
      `INSERT INTO placement_reviews
       (caregiver_id, agency_id, reviewer_type, reviewer_id,
        placement_start_date, placement_end_date,
        professional_reliability_score, human_qualities_score,
        personal_care_hygiene_score, beyond_the_call_score,
        skills_match_score, communication_conduct_score,
        would_reengage, positive_feedback, improvement_feedback,
        status)
       VALUES ($1, NULL, 'caregiver', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'approved')
       RETURNING id`,
      [
        caregiver.caregiverId,
        caregiver.clerkUserId,
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
       VALUES ('self_assessment_submitted', $1, $2, $3)`,
      [
        caregiver.clerkUserId,
        reviewId,
        JSON.stringify({ caregiver_id: caregiver.caregiverId })
      ]
    )

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      message: 'Self-assessment submitted. Your profile will update within minutes.',
    })
  } catch (err) {
    console.error('Error in POST /api/reviews/self:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to submit self-assessment' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}