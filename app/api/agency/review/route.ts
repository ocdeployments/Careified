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

  // Verify agency status
  const agencyRes = await pool.query(
    'SELECT id, status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (agencyRes.rows.length === 0) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  const agency = agencyRes.rows[0]
  if (agency.status !== 'approved') {
    return NextResponse.json({ error: 'Agency not approved' }, { status: 403 })
  }

  const body = await req.json()
  const {
    clientId,
    caregiverId,
    engagement_start,
    engagement_end,
    punctuality,
    reliability,
    professional_conduct,
    warmth,
    dignity,
    patience,
    emotional_presence,
    personal_hygiene,
    client_hygiene,
    environment_cleanliness,
    infection_control,
    specialty_match,
    medical_awareness,
    medication_handling,
    mobility_safety,
    comms_agency,
    comms_family,
    boundaries,
    cultural_sensitivity,
    initiative,
    emotional_support,
    family_communication,
    creative_engagement,
    problem_solving,
    continuity_of_care,
    beyond_call_notes,
    would_re_engage,
    review_text,
  } = body

  // Validate required fields
  if (!clientId || !caregiverId || !engagement_start || !engagement_end) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify client belongs to agency
  const clientRes = await pool.query(
    'SELECT id FROM client_needs WHERE id = $1 AND agency_id = $2',
    [clientId, agency.id]
  )

  if (clientRes.rows.length === 0) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Verify caregiver exists
  const caregiverRes = await pool.query(
    'SELECT id FROM caregivers WHERE id = $1',
    [caregiverId]
  )

  if (caregiverRes.rows.length === 0) {
    return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
  }

  // Random admin flag (10% chance)
  const adminFlagged = Math.random() < 0.10

  // Insert review
  const insertRes = await pool.query(
    `INSERT INTO placement_reviews (
      agency_id, caregiver_id, client_id,
      engagement_start, engagement_end,
      punctuality, reliability, professional_conduct,
      warmth, dignity, patience, emotional_presence,
      personal_hygiene, client_hygiene, environment_cleanliness, infection_control,
      specialty_match, medical_awareness, medication_handling, mobility_safety,
      comms_agency, comms_family, boundaries, cultural_sensitivity,
      initiative, emotional_support, family_communication, creative_engagement, problem_solving, continuity_of_care, beyond_call_notes,
      would_re_engage, review_text,
      personality_validated, status, dispute_deadline, admin_flagged
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, 'pending', NOW() + INTERVAL '14 days', $37
    ) RETURNING id`,
    [
      agency.id, caregiverId, clientId,
      engagement_start, engagement_end,
      punctuality, reliability, professional_conduct,
      warmth, dignity, patience, emotional_presence,
      personal_hygiene, client_hygiene, environment_cleanliness, infection_control,
      specialty_match, medical_awareness, medication_handling, mobility_safety,
      comms_agency, comms_family, boundaries, cultural_sensitivity,
      initiative, emotional_support, family_communication, creative_engagement, problem_solving, continuity_of_care, beyond_call_notes,
      would_re_engage, review_text,
      JSON.stringify({}), // personality_validated
      adminFlagged,
    ]
  )

  const reviewId = insertRes.rows[0].id

  // Trigger score recalculation and badge computation
  try {
    await fetch(`${req.nextUrl.origin}/api/caregiver/score/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caregiverId,
        eventType: 'placement_completed',
        agencyId: agency.id,
        placementId: reviewId,
        wouldReengage: would_re_engage,
        ratings: {
          punctuality,
          reliability,
          professional_conduct,
          warmth,
          dignity,
          patience,
          personal_hygiene,
          specialty_match,
          comms_agency,
        },
      }),
    })

    // Compute and save badges
    const { computeBadges } = await import('@/lib/caregiver-trust-score/badges')
    const { rows: allReviews } = await pool.query(
      `SELECT id, agency_id, caregiver_id, client_id, engagement_start, engagement_end,
              would_re_engage, warmth, dignity, client_hygiene, emotional_presence,
              specialty_match, cultural_sensitivity, initiative, status, created_at
       FROM placement_reviews
       WHERE caregiver_id = $1 AND status IN ('pending', 'approved', 'disputed')`,
      [caregiverId]
    )
    const { rows: caregiverData } = await pool.query(
      'SELECT specializations, years_experience, aggregate_score, personality_profile FROM caregivers WHERE id = $1',
      [caregiverId]
    )

    if (caregiverData.length > 0) {
      const c = caregiverData[0]
      const reviews = allReviews.map(r => ({
        ...r,
        engagement_start: r.engagement_start?.toISOString(),
        engagement_end: r.engagement_end?.toISOString(),
        created_at: r.created_at?.toISOString(),
      }))
      const personalityProfile = (c.personality_profile || {}) as Record<string, unknown>
      const badges = computeBadges(
        reviews,
        c.specializations || [],
        c.years_experience || 0,
        parseFloat(c.aggregate_score) || 0,
        {
          status: personalityProfile.honesty_score_status as string | undefined,
          badge_earned: personalityProfile.honesty_badge as string | undefined,
        }
      )

      // Save badges to caregiver record
      if (badges.length > 0) {
        await pool.query(
          'UPDATE caregivers SET badges = $1 WHERE id = $2',
          [JSON.stringify(badges), caregiverId]
        )
      }
    }
  } catch (e) {
    console.error('Failed to trigger score recalculation or badge computation:', e)
  }

  return NextResponse.json({ id: reviewId, adminFlagged }, { status: 201 })
}