import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { computeBadges, PlacementReview } from '@/lib/caregiver-trust-score/badges'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get caregiver
  const { rows: caregiverRows } = await pool.query(
    'SELECT id, specializations, years_experience, aggregate_score, personality_profile FROM caregivers WHERE user_id = $1',
    [userId]
  )

  if (caregiverRows.length === 0) {
    return NextResponse.json({ badges: [] })
  }

  const caregiver = caregiverRows[0]

  // Get all placement reviews for this caregiver
  const { rows: reviewRows } = await pool.query(
    `SELECT id, agency_id, caregiver_id, client_id, engagement_start, engagement_end,
            would_re_engage, warmth, dignity, client_hygiene, emotional_presence,
            specialty_match, cultural_sensitivity, initiative, status, created_at
     FROM placement_reviews
     WHERE caregiver_id = $1 AND status IN ('pending', 'approved', 'disputed')`,
    [caregiver.id]
  )

  const reviews: PlacementReview[] = reviewRows.map(r => ({
    ...r,
    engagement_start: r.engagement_start?.toISOString(),
    engagement_end: r.engagement_end?.toISOString(),
    created_at: r.created_at?.toISOString(),
  }))

  // Get specializations
  const specializations = (caregiver.specializations || []) as string[]

  // Get tenure (years_experience or approximate from created_at)
  const tenureYears = caregiver.years_experience || 0

  // Get aggregate score (convert from Decimal)
  const aggregateScore = parseFloat(caregiver.aggregate_score) || 0

  // Get personality honesty score
  const personalityProfile = (caregiver.personality_profile || {}) as Record<string, unknown>
  const honestyScore = {
    status: personalityProfile.honesty_score_status as string | undefined,
    badge_earned: personalityProfile.honesty_badge as string | undefined,
  }

  const badges = computeBadges(
    reviews,
    specializations,
    tenureYears,
    aggregateScore,
    honestyScore
  )

  return NextResponse.json({ badges })
}