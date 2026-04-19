// lib/enrichment/types.ts

export type EnvValue = 'yes' | 'no' | 'prefer_not'

export type EnvironmentComfort = {
  dogs?: EnvValue
  cats?: EnvValue
  other_pets?: EnvValue
  smoking_indoor?: EnvValue
  smoking_outdoor?: EnvValue
  clutter?: EnvValue
  large_family?: EnvValue
  hoarding?: EnvValue
  substance_use?: EnvValue
}

export type CareStyle = 'hands_on' | 'companionship' | 'balanced'

export type AgeRangeKey =
  | 'children'
  | 'young_adults'
  | 'adults'
  | 'seniors'
  | 'elderly'

export type ClientPreferences = {
  personality_types?: string[]
  age_ranges?: AgeRangeKey[]
  care_style?: CareStyle | null
}

export type Motivation = {
  why_caregiving?: string
  proudest_placement?: string
  ideal_client?: string
}

export type BestFitProfile = {
  strong_fits: string[]
  weak_fits: string[]
  recommended_placement_length: 'short_term' | 'long_term' | 'either'
  recommended_intensity: 'light' | 'moderate' | 'complex' | 'any'
  generated_at: string
}

export type MatchingTag =
  | 'personal_connection'
  | 'values_driven'
  | 'long_term_oriented'
  | 'medical_specialist'
  | 'companionship_specialist'
  | 'multilingual'
  | 'dementia_specialist'
  | 'palliative_specialist'
  | 'pediatric_specialist'
  | 'high_environment_flexibility'
  | 'low_environment_flexibility'
  | 'religious_cultural_fit'
  | 'post_surgical_specialist'

export type CaregiverForEnrichment = {
  id: string
  first_name: string
  last_name: string
  job_title: string | null
  bio: string | null
  specializations: string[] | null
  credentials: string[] | null
  placement_types: string[] | null
  languages: string[] | null
  years_experience: number | null
  has_vehicle: boolean | null
  willing_live_in: boolean | null
  travel_radius: number | null
  client_preferences: ClientPreferences | null
  environment_comfort: EnvironmentComfort | null
  motivation: Motivation | null
}

export type EnrichmentResult = {
  best_fit_profile: BestFitProfile
  matching_tags: MatchingTag[]
  profile_strength_score: number
}
