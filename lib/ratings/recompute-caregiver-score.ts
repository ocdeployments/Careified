// Recompute trigger - wires all layers of the rating system together

import { Pool } from 'pg'
import { computeTrustScore, PlacementReview, TrustScoreResult } from './compute-trust-score'
import { computeSuitabilityScores, generateSuitabilityNarrative, CaregiverProfile } from './compute-suitability'

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

export async function recomputeCaregiverScore(caregiverId: string): Promise<void> {
  // 1. Fetch all approved placement reviews for caregiver
  const reviewsResult = await pool.query(
    `SELECT * FROM placement_reviews
     WHERE caregiver_id = $1 AND status = 'approved'`,
    [caregiverId]
  )

  const reviews: PlacementReview[] = reviewsResult.rows.map(r => ({
    professional_reliability_score: r.professional_reliability_score,
    human_qualities_score: r.human_qualities_score,
    personal_care_hygiene_score: r.personal_care_hygiene_score,
    beyond_the_call_score: r.beyond_the_call_score,
    skills_match_score: r.skills_match_score,
    communication_conduct_score: r.communication_conduct_score,
    would_reengage: r.would_reengage,
    reviewer_type: r.reviewer_type,
    status: r.status,
  }))

  // 2. Compute trust score
  const trustScore: TrustScoreResult = computeTrustScore(reviews)

  // 3. Fetch caregiver profile fields for suitability
  const caregiverResult = await pool.query(
    'SELECT first_name, last_name, specializations, diagnosis_experience, adls_performed, years_experience, credentials FROM caregivers WHERE id = $1',
    [caregiverId]
  )

  if (caregiverResult.rows.length === 0) {
    console.error(`Caregiver not found: ${caregiverId}`)
    return
  }

  const caregiver = caregiverResult.rows[0]

  const profile: CaregiverProfile = {
    specializations: caregiver.specializations || [],
    diagnosisExperience: caregiver.diagnosis_experience || [],
    adlsPerformed: caregiver.adls_performed || [],
    yearsExperience: caregiver.years_experience || 0,
    credentials: caregiver.credentials || [],
  }

  // 4. Compute suitability scores
  const suitabilityScores = computeSuitabilityScores(trustScore, profile)

  // 5. Generate LLM narrative
  const caregiverName = `${caregiver.first_name} ${caregiver.last_name}`
  const reviewCount = trustScore.review_count
  const narrative = await generateSuitabilityNarrative(trustScore, suitabilityScores, caregiverName, reviewCount)

  // 6. Update caregiver aggregate_score
  await pool.query(
    'UPDATE caregivers SET aggregate_score = $1 WHERE id = $2',
    [trustScore.aggregate_score, caregiverId]
  )

  // 7. Upsert caregiver_suitability
  await pool.query(
    `INSERT INTO caregiver_suitability
     (caregiver_id, dementia_alzheimers, parkinsons, palliative_end_of_life,
      post_surgical_recovery, acquired_brain_injury, developmental_disability,
      companion_social, high_acuity_medical, pediatric, mental_health_support,
      suitability_summary, credibility_narrative, best_match_types, caution_types,
      computed_at, review_count_at_computation, score_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), $16, 1)
     ON CONFLICT (caregiver_id) DO UPDATE SET
      dementia_alzheimers = $2,
      parkinsons = $3,
      palliative_end_of_life = $4,
      post_surgical_recovery = $5,
      acquired_brain_injury = $6,
      developmental_disability = $7,
      companion_social = $8,
      high_acuity_medical = $9,
      pediatric = $10,
      mental_health_support = $11,
      suitability_summary = $12,
      credibility_narrative = $13,
      best_match_types = $14,
      caution_types = $15,
      computed_at = NOW(),
      review_count_at_computation = $16,
      score_version = caregiver_suitability.score_version + 1`,
    [
      caregiverId,
      suitabilityScores.dementia_alzheimers,
      suitabilityScores.parkinsons,
      suitabilityScores.palliative_end_of_life,
      suitabilityScores.post_surgical_recovery,
      suitabilityScores.acquired_brain_injury,
      suitabilityScores.developmental_disability,
      suitabilityScores.companion_social,
      suitabilityScores.high_acuity_medical,
      suitabilityScores.pediatric,
      suitabilityScores.mental_health_support,
      narrative.suitability_summary,
      narrative.credibility_narrative,
      suitabilityScores.best_match_types,
      suitabilityScores.caution_types,
      reviewCount,
    ]
  )

  console.warn(`[SCORE] Recomputed for caregiver ${caregiverId}: aggregate=${trustScore.aggregate_score}, review_count=${reviewCount}`)
}