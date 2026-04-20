// lib/opportunities/discover.ts
import { Pool } from 'pg'
import { computeMatchScore } from '@/lib/matching'
import { loadCaregiverForMatchingV2 } from '@/lib/matching'
import { decryptPHI, decryptPHIJson } from '@/lib/encryption/phi'
import type { MatchNeed } from '@/lib/matching'

export type Opportunity = {
 client_needs_id: string
 // Agency intentionally omitted — not revealed until mutual interest
 alignment_score: number | null
 overall_confidence: number | null
 scope: string
 criteria_aligned: string[]
 criteria_not_aligned: string[]
 unknowns: string[]
 // Client-side sanitized fields — no PHI
 primary_condition: string | null
 placement_type: string | null
 care_intensity: string | null
 city: string | null
 state: string | null
 language_required: string | null
 hourly_rate_max: number | null
 duration_expected: string | null
 hours_per_week: number | null
 start_date: string | null
 already_interested: boolean
}

/**
 * Discover open opportunities aligned to a caregiver.
 * Runs the matching algorithm against every open client_needs, filters by gates,
 * and returns top N by alignment score. Excludes already-dismissed and already-interested.
 *
 * Agency identity is NEVER included in the response. Caregivers must express
 * interest first; agencies are surfaced only after mutual acknowledgment.
 */
export async function discoverOpportunities(
 pool: Pool,
 caregiverId: string,
 limit: number = 10
): Promise<Opportunity[]> {
 const caregiver = await loadCaregiverForMatchingV2(pool, caregiverId)
 if (!caregiver) return []

 // Load open client needs
 const { rows: needs } = await pool.query(`
 SELECT
 id,
 client_first_name_encrypted,
 primary_condition_encrypted,
 secondary_conditions_encrypted,
 mobility_level_encrypted,
 services_needed,
 care_intensity,
 placement_type,
 hours_per_week,
 start_date,
 duration_expected,
 city, state, postal_code,
 pets_present,
 smoking_household,
 home_condition,
 family_dynamics,
 language_required,
 gender_preference,
 cultural_preference,
 personality_desired,
 hourly_rate_max
 FROM client_needs
 WHERE status = 'open'
 `)

 if (needs.length === 0) return []

 // Load interest + seen state
 const { rows: interests } = await pool.query(
 `SELECT client_needs_id, status FROM caregiver_opportunity_interest
 WHERE caregiver_id = $1`,
 [caregiverId]
 )
 const interestMap = new Map(interests.map(i => [i.client_needs_id, i.status]))

 const { rows: seen } = await pool.query(
 `SELECT client_needs_id FROM caregiver_opportunity_seen
 WHERE caregiver_id = $1 AND dismissed = true`,
 [caregiverId]
 )
 const dismissed = new Set(seen.map(s => s.client_needs_id))

 const scored: Opportunity[] = []

 for (const n of needs) {
 if (dismissed.has(n.id)) continue

 // Decrypt only what we need for matching — NOT for display
 const primaryCondition = decryptPHI(n.primary_condition_encrypted)
 const secondary = decryptPHIJson<string[]>(n.secondary_conditions_encrypted)

 const need: MatchNeed = {
 city: n.city,
 state: n.state,
 postal_code: n.postal_code,
 primary_condition: primaryCondition ?? undefined,
 secondary_conditions: secondary ?? undefined,
 services_needed: n.services_needed,
 care_intensity: n.care_intensity,
 placement_type: n.placement_type,
 hours_per_week: n.hours_per_week,
 start_date: n.start_date?.toISOString?.() ?? n.start_date,
 duration_expected: n.duration_expected,
 pets_present: n.pets_present,
 smoking_household: n.smoking_household,
 home_condition: n.home_condition,
 family_dynamics: n.family_dynamics,
 language_required: n.language_required,
 gender_preference: n.gender_preference,
 cultural_preference: n.cultural_preference,
 personality_desired: n.personality_desired,
 hourly_rate_max: n.hourly_rate_max ? Number(n.hourly_rate_max) : undefined,
 }

 const result = computeMatchScore(caregiver, need)

 // Only surface opportunities where the caregiver passes gates
 // AND alignment_score is at least 50 (low-quality matches hidden)
 if (!result.gates_passed) continue
 if ((result.alignment_score ?? 0) < 50) continue

 scored.push({
 client_needs_id: n.id,
 alignment_score: result.alignment_score,
 overall_confidence: result.overall_confidence,
 scope: result.scope,
 criteria_aligned: result.criteria_aligned,
 criteria_not_aligned: result.criteria_not_aligned,
 unknowns: result.unknowns,

 // Sanitized display fields — NO PHI, NO agency
 primary_condition: primaryCondition,
 placement_type: n.placement_type,
 care_intensity: n.care_intensity,
 city: n.city,
 state: n.state,
 language_required: n.language_required,
 hourly_rate_max: n.hourly_rate_max ? Number(n.hourly_rate_max) : null,
 duration_expected: n.duration_expected,
 hours_per_week: n.hours_per_week,
 start_date: n.start_date?.toISOString?.() ?? n.start_date,

 already_interested: interestMap.get(n.id) === 'interested',
 })
 }

 scored.sort((a, b) => (b.alignment_score ?? 0) - (a.alignment_score ?? 0))
 return scored.slice(0, limit)
}
