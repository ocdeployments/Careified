// lib/matching/persistence.ts
import { Pool } from 'pg'
import type { MatchResult, CaregiverForMatching, MatchNeed } from './types'
import { computeMatchScore } from './score'

export async function persistMatchScore(
  pool: Pool,
  caregiverId: string,
  clientNeedsId: string,
  result: MatchResult
): Promise<void> {
  await pool.query(
    `INSERT INTO match_scores (
      caregiver_id, client_needs_id,
      overall_score, clinical_fit, reliability, logistics_match,
      personality_compatibility, cultural_language_fit,
      retention_likelihood, environment_fit,
      strong_fits, gaps
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      caregiverId,
      clientNeedsId,
      result.overall_score,
      result.dimensions.clinical_fit.score,
      result.dimensions.reliability.score,
      result.dimensions.logistics_match.score,
      result.dimensions.personality_compatibility.score,
      result.dimensions.cultural_language_fit.score,
      result.dimensions.retention_signal.score,
      result.dimensions.environment_fit.score,
      result.strong_fits,
      result.gaps,
    ]
  )
}

export async function getCachedMatchScore(
  pool: Pool,
  caregiverId: string,
  clientNeedsId: string,
  maxAgeMinutes = 60
): Promise<MatchResult | null> {
  const { rows } = await pool.query(
    `SELECT * FROM match_scores
    WHERE caregiver_id = $1 AND client_needs_id = $2
    AND created_at > now() - interval '${maxAgeMinutes} minutes'
    ORDER BY created_at DESC LIMIT 1`,
    [caregiverId, clientNeedsId]
  )
  if (rows.length === 0) return null
  // Reconstruct MatchResult from cached row (partial — UI rebuilds rest from caregiver data)
  return null // For now, cache lookup returns null — forces recompute. Will refine if perf needs.
}

export async function loadCaregiverForMatching(
  pool: Pool,
  caregiverId: string
): Promise<CaregiverForMatching | null> {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name,
      specializations, credentials, placement_types, languages,
      years_experience, hourly_rate, hourly_rate_max, gender,
      city, state, postal_code, travel_radius,
      has_vehicle, willing_live_in, willing_overnight,
      availability_status,
      client_preferences, environment_comfort, motivation,
      reliability_metrics
    FROM caregivers WHERE id = $1 AND status = 'approved'`,
    [caregiverId]
  )
  return (rows[0] as CaregiverForMatching) ?? null
}

export async function loadAllApprovedCaregivers(
  pool: Pool
): Promise<CaregiverForMatching[]> {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name,
      specializations, credentials, placement_types, languages,
      years_experience, hourly_rate, hourly_rate_max, gender,
      city, state, postal_code, travel_radius,
      has_vehicle, willing_live_in, willing_overnight,
      availability_status,
      client_preferences, environment_comfort, motivation,
      reliability_metrics
    FROM caregivers WHERE status = 'approved'`
  )
  return rows as CaregiverForMatching[]
}
