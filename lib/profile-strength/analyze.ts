// lib/profile-strength/analyze.ts
import { Pool } from 'pg'
import { getAttributeMap } from '@/lib/attributes'

export type StrengthGap = {
 field: string
 label: string
 impact: 'high' | 'medium' | 'low'
 action: string
 dimensions_affected: string[]
}

export type StrengthReport = {
 score: number // 0-100, weighted completeness
 score_tier: 'weak' | 'fair' | 'strong' | 'complete'
 completed: string[] // field labels caregiver has filled
 gaps: StrengthGap[] // prioritized list of missing items
 verification_mix: {
 tier_1: number
 tier_2: number
 tier_3: number
 tier_4: number
 }
 next_best_action: StrengthGap | null
}

// Canonical list of fields caregivers should fill, with weights and dimension impact.
const FIELD_CATALOG: Array<{
 field: string
 label: string
 weight: number // points towards overall strength (0-100 scale)
 impact: 'high' | 'medium' | 'low'
 action: string
 dimensions_affected: string[]
}> = [
 { field: 'specializations', label: 'Care specializations', weight: 12, impact: 'high',
 action: 'Add at least 3 conditions you\'ve cared for',
 dimensions_affected: ['Clinical fit'] },

 { field: 'credentials', label: 'Credentials & certifications', weight: 10, impact: 'high',
 action: 'List your licenses and certifications',
 dimensions_affected: ['Clinical fit'] },

 { field: 'years_experience', label: 'Years of experience', weight: 5, impact: 'medium',
 action: 'Enter your years in caregiving',
 dimensions_affected: ['Clinical fit'] },

 { field: 'languages', label: 'Languages spoken', weight: 8, impact: 'high',
 action: 'Add every language you speak fluently',
 dimensions_affected: ['Cultural & language fit'] },

 { field: 'placement_types', label: 'Placement types you offer', weight: 8, impact: 'high',
 action: 'Select live-in, overnight, hourly, etc.',
 dimensions_affected: ['Logistics match'] },

 { field: 'city', label: 'City', weight: 5, impact: 'high',
 action: 'Enter your city',
 dimensions_affected: ['Logistics match'] },

 { field: 'travel_radius', label: 'Travel radius', weight: 4, impact: 'medium',
 action: 'How far are you willing to travel?',
 dimensions_affected: ['Logistics match'] },

 { field: 'has_vehicle', label: 'Transportation', weight: 3, impact: 'medium',
 action: 'Indicate if you have a vehicle',
 dimensions_affected: ['Logistics match'] },

 { field: 'availability_status', label: 'Current availability', weight: 4, impact: 'medium',
 action: 'Update your availability status',
 dimensions_affected: ['Logistics match'] },

 { field: 'hourly_rate', label: 'Hourly rate', weight: 4, impact: 'medium',
 action: 'Set your hourly rate',
 dimensions_affected: ['Logistics match'] },

 { field: 'client_preferences', label: 'Client preferences', weight: 8, impact: 'high',
 action: 'Describe who you work best with',
 dimensions_affected: ['Personality alignment'] },

 { field: 'environment_comfort', label: 'Environment comfort', weight: 8, impact: 'medium',
 action: 'Answer all 9 household comfort questions',
 dimensions_affected: ['Environment fit'] },

 { field: 'motivation', label: 'Your story', weight: 10, impact: 'medium',
 action: 'Share why you became a caregiver',
 dimensions_affected: ['Retention signal'] },

 { field: 'bio', label: 'Bio', weight: 5, impact: 'low',
 action: 'Write a short introduction',
 dimensions_affected: [] },

 { field: 'photo_url', label: 'Profile photo', weight: 3, impact: 'low',
 action: 'Upload a professional photo',
 dimensions_affected: [] },

 { field: 'references', label: 'References', weight: 3, impact: 'high',
 action: 'Add 2+ references (increases reliability tier)',
 dimensions_affected: ['Reliability'] },
]

// Fields above that are considered "complete" only with non-trivial values
function isFieldComplete(value: unknown): boolean {
 if (value == null || value === '') return false
 if (Array.isArray(value)) return value.length > 0
 if (typeof value === 'object') return Object.keys(value as object).length > 0
 if (typeof value === 'number') return true
 return String(value).trim().length > 0
}

/**
 * Analyze profile strength by combining caregivers row + attributes.
 */
export async function analyzeProfileStrength(
 pool: Pool,
 caregiverId: string
): Promise<StrengthReport> {
 const { rows } = await pool.query(
 `SELECT
 id, bio, photo_url,
 specializations, credentials, placement_types, languages,
 years_experience, hourly_rate, city, state, travel_radius,
 has_vehicle, availability_status,
 client_preferences, environment_comfort, motivation
 FROM caregivers WHERE id = $1`,
 [caregiverId]
 )
 if (rows.length === 0) throw new Error(`Caregiver ${caregiverId} not found`)
 const cg = rows[0]

 // References count as a special field — query separately
 const { rows: refs } = await pool.query(
 `SELECT COUNT(*) as n FROM caregiver_references WHERE caregiver_id = $1`,
 [caregiverId]
 )
 const referenceCount = Number(refs[0]?.n ?? 0)
 const hasReferences = referenceCount >= 2

 const attrs = await getAttributeMap(pool, caregiverId)

 // Verification mix
 const mix = { tier_1: 0, tier_2: 0, tier_3: 0, tier_4: 0 }
 for (const a of Object.values(attrs)) {
 if (a.tier === 1) mix.tier_1++
 else if (a.tier === 2) mix.tier_2++
 else if (a.tier === 3) mix.tier_3++
 else mix.tier_4++
 }

 // Score + completed + gaps
 let score = 0
 const completed: string[] = []
 const gaps: StrengthGap[] = []

 for (const f of FIELD_CATALOG) {
 const value =
 f.field === 'references' ? hasReferences : (cg as Record<string, unknown>)[f.field]
 if (isFieldComplete(value)) {
 score += f.weight
 completed.push(f.label)
 } else {
 gaps.push({
 field: f.field,
 label: f.label,
 impact: f.impact,
 action: f.action,
 dimensions_affected: f.dimensions_affected,
 })
 }
 }

 // Prioritize gaps: high > medium > low
 const impactOrder = { high: 0, medium: 1, low: 2 }
 gaps.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])

 const score_tier: StrengthReport['score_tier'] =
 score >= 90 ? 'complete' :
 score >= 70 ? 'strong' :
 score >= 50 ? 'fair' :
 'weak'

 return {
 score: Math.min(100, score),
 score_tier,
 completed,
 gaps,
 verification_mix: mix,
 next_best_action: gaps[0] ?? null,
 }
}
