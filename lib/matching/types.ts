// lib/matching/types.ts

/**
 * Confidence in a dimension score.
 * - 'high': computed from verified data (credentials, placement outcomes)
 * - 'medium': computed from structured self-reported data (e.g., specializations)
 * - 'low': computed from inferred or partial data
 * - 'none': no data available, score is null
 */
export type Confidence = 'high' | 'medium' | 'low' | 'none'

/**
 * The shape every dimension scoring function returns.
 * score is null when confidence is 'none' — it is never faked.
 */
export type DimensionScore = {
  score: number | null
  confidence: Confidence
  source: string // Human-readable explanation of source
  weight_applied: number // Actual weight used after renormalization (0-1)
}

/**
 * Scope of a match computation.
 * - 'full_client_match': computed against a full client_needs record — all dimensions potentially scorable
 * - 'partial_filter_match': computed against a filter spec (search UI) — some dimensions inherently unknown
 */
export type MatchScope = 'full_client_match' | 'partial_filter_match'

/**
 * Result of a match computation between a caregiver and a need (client_needs or filter spec).
 */
export type MatchResult = {
  /** Overall weighted score, or null if no dimensions scorable. */
  overall_score: number | null

  /** What this match was computed against. */
  scope: MatchScope

  /** Per-dimension scores. */
  dimensions: {
    clinical_fit: DimensionScore
    reliability: DimensionScore
    logistics_match: DimensionScore
    personality_compatibility: DimensionScore
    cultural_language_fit: DimensionScore
    retention_signal: DimensionScore
    environment_fit: DimensionScore
  }

  /** Human-readable reasons this is a strong match. */
  strong_fits: string[]

  /** Human-readable concerns or mismatches. */
  gaps: string[]

  /** Dimensions where no data was available — explicit, not hidden. */
  unknowns: string[]

  /** Whether the caregiver passed all hard filter gates. */
  gates_passed: boolean

  /** If gates_passed is false, which gates failed. */
  gates_failed: string[]

  /** ISO timestamp when this was computed. */
  computed_at: string
}

/**
 * Input for the matching function.
 * Either a full client_needs record OR a partial filter spec.
 * Both share the same fields — presence/absence determines scope.
 */
export type MatchNeed = {
  // Required for hard filter gates
  city?: string
  state?: string
  postal_code?: string

  // Optional — if provided, used in scoring
  primary_condition?: string
  secondary_conditions?: string[]
  services_needed?: string[]
  care_intensity?: 'light' | 'moderate' | 'complex'
  placement_type?: string
  hours_per_week?: number
  start_date?: string // ISO date
  duration_expected?: string

  language_required?: string
  gender_preference?: string
  cultural_preference?: string
  personality_desired?: string[] // Client personality traits from client_needs

  // Environment
  pets_present?: string[] // ['dogs', 'cats', 'other_pets']
  smoking_household?: boolean
  home_condition?: string // 'organized' | 'moderate' | 'cluttered' | 'hoarding'
  family_dynamics?: string // 'small' | 'moderate' | 'large_active'

  hourly_rate_max?: number
}

/**
 * Caregiver shape consumed by the matching algorithm.
 * Includes everything the dimension functions may read.
 */
export type CaregiverForMatching = {
  id: string
  first_name: string
  last_name: string

  // Hard data
  specializations: string[] | null
  credentials: string[] | null
  placement_types: string[] | null
  languages: string[] | null
  years_experience: number | null
  hourly_rate: number | null
  hourly_rate_max: number | null
  gender: string | null

  // Location & logistics
  city: string | null
  state: string | null
  postal_code: string | null
  travel_radius: number | null // in miles
  has_vehicle: boolean | null
  willing_live_in: boolean | null
  willing_overnight: boolean | null

  // Availability
  availability_status: string | null

  // Soft data from 11B/11C
  client_preferences: {
    personality_types?: string[]
    age_ranges?: string[]
    care_style?: 'hands_on' | 'companionship' | 'balanced' | null
  } | null
  environment_comfort: {
    dogs?: 'yes' | 'no' | 'prefer_not'
    cats?: 'yes' | 'no' | 'prefer_not'
    other_pets?: 'yes' | 'no' | 'prefer_not'
    smoking_indoor?: 'yes' | 'no' | 'prefer_not'
    smoking_outdoor?: 'yes' | 'no' | 'prefer_not'
    clutter?: 'yes' | 'no' | 'prefer_not'
    large_family?: 'yes' | 'no' | 'prefer_not'
    hoarding?: 'yes' | 'no' | 'prefer_not'
    substance_use?: 'yes' | 'no' | 'prefer_not'
  } | null
  motivation: {
    why_caregiving?: string
    proudest_placement?: string
    ideal_client?: string
  } | null

  // Reliability data (likely null for now — from placement_outcomes aggregation)
  reliability_metrics: {
    total_placements?: number
    avg_placement_duration_days?: number
    completion_rate?: number
    no_show_rate?: number
    would_rehire_pct?: number
  } | null
}

/**
 * Original dimension weights from strategy doc.
 * These are the STARTING weights. They are dynamically renormalized
 * when dimensions return null (confidence: 'none').
 */
export const BASE_WEIGHTS = {
  clinical_fit: 0.25,
  reliability: 0.20,
  logistics_match: 0.15,
  personality_compatibility: 0.15,
  cultural_language_fit: 0.10,
  retention_signal: 0.10,
  environment_fit: 0.05,
} as const

export type DimensionKey = keyof typeof BASE_WEIGHTS
