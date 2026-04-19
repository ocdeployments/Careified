// lib/matching/persistence.ts
import { Pool } from 'pg'
import type { MatchResult, MatchNeed } from './types'
import { computeMatchScore } from './score'
import { loadCaregiverForMatchingV2, loadAllApprovedCaregiversV2, type CaregiverWithProvenance } from './caregiver-loader'

export async function persistMatchScore(
  pool: Pool,
  caregiverId: string,
  clientNeedsId: string,
  result: MatchResult
): Promise<void> {
  const overall = result.alignment_score ?? result.overall_score
  const strongs = result.criteria_aligned ?? result.strong_fits ?? []
  const gapsList = result.criteria_not_aligned ?? result.gaps ?? []

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
      overall,
      result.dimensions.clinical_fit.score,
      result.dimensions.reliability.score,
      result.dimensions.logistics_match.score,
      result.dimensions.personality_compatibility.score,
      result.dimensions.cultural_language_fit.score,
      result.dimensions.retention_signal.score,
      result.dimensions.environment_fit.score,
      strongs,
      gapsList,
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

// V2 loaders that use the attribute-aware loader
export async function loadCaregiverForMatching(
  pool: Pool,
  caregiverId: string
): Promise<CaregiverWithProvenance | null> {
  return loadCaregiverForMatchingV2(pool, caregiverId)
}

export async function loadAllApprovedCaregivers(
  pool: Pool
): Promise<CaregiverWithProvenance[]> {
  return loadAllApprovedCaregiversV2(pool)
}
