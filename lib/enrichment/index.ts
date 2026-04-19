// lib/enrichment/index.ts
import { Pool } from 'pg'
import { generateDisclosedPreferences } from './bestFitProfile'
import { extractMatchingTags, computeProfileStrength } from './tagsAndScore'
import type {
  CaregiverForEnrichment,
  EnrichmentResult,
} from './types'

export * from './types'
export { generateDisclosedPreferences } from './bestFitProfile'
export { extractMatchingTags, computeProfileStrength } from './tagsAndScore'

/**
 * Run all enrichment derivations on a single caregiver record.
 * Pure function — no DB writes. Caller decides what to persist.
 */
export function enrichCaregiver(
  cg: CaregiverForEnrichment
): EnrichmentResult {
  return {
    disclosed_preferences: generateDisclosedPreferences(cg),
    matching_tags: extractMatchingTags(cg),
    profile_strength_score: computeProfileStrength(cg),
  }
}

/**
 * Load a caregiver, run enrichment, persist the result.
 * Used by the save-field/save-step API routes (wired in File 6).
 */
export async function enrichAndPersist(
  pool: Pool,
  caregiverId: string
): Promise<EnrichmentResult> {
  const { rows } = await pool.query(
    `SELECT
      id, first_name, last_name, job_title, bio,
      specializations, credentials, placement_types, languages,
      years_experience, has_vehicle, willing_live_in, travel_radius,
      client_preferences, environment_comfort, motivation
    FROM caregivers
    WHERE id = $1`,
    [caregiverId]
  )

  if (rows.length === 0) {
    throw new Error(`Caregiver ${caregiverId} not found`)
  }

  const cg = rows[0] as CaregiverForEnrichment
  const result = enrichCaregiver(cg)

  // Store as best_fit_profile for backward compatibility during transition
  await pool.query(
    `UPDATE caregivers
    SET
      best_fit_profile = $1,
      profile_strength_score = $2,
      updated_at = now()
    WHERE id = $3`,
    [
      JSON.stringify(result.disclosed_preferences),
      result.profile_strength_score,
      caregiverId,
    ]
  )

  return result
}
