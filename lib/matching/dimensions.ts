// lib/matching/dimensions.ts
import type {
  MatchNeed,
  DimensionScore,
  DimensionKey,
} from './types'
import { BASE_WEIGHTS } from './types'
import type { CaregiverWithProvenance } from './caregiver-loader'
import { lowestConfidenceFor } from './caregiver-loader'

// ─────────────────────────────────────────────────────────
// Helper: build a DimensionScore
// ─────────────────────────────────────────────────────────

function unknown(dim: DimensionKey, source: string): DimensionScore {
  return {
    score: null,
    confidence: 'none',
    confidence_multiplier: 0,
    source,
    weight_applied: 0, // renormalized later
    attributes_used: [],
  }
}

function scored(
  dim: DimensionKey,
  score: number,
  confidenceLabel: 'high' | 'medium' | 'low',
  source: string,
  provenance: { confidence: number; attributes_used: string[] }
): DimensionScore {
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    confidence: confidenceLabel,
    confidence_multiplier: provenance.confidence,
    source,
    weight_applied: BASE_WEIGHTS[dim], // renormalized later
    attributes_used: provenance.attributes_used,
  }
}

// ─────────────────────────────────────────────────────────
// 1. Clinical Fit
// ─────────────────────────────────────────────────────────

export function scoreClinicalFit(
  cg: CaregiverWithProvenance,
  need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['specializations', 'credentials', 'years_experience'])

  if (!need.primary_condition) {
    return unknown('clinical_fit', 'no_primary_condition_specified')
  }

  const specs = cg.specializations || []
  const credentials = cg.credentials || []
  const years = cg.years_experience || 0

  const cond = need.primary_condition.toLowerCase()
  const specTexts = specs.map(s => s.toLowerCase())

  let score = 0
  let hasDirectMatch = false

  // Direct specialty match
  if (specTexts.some(s => s.includes(cond) || cond.split(' ').some(w => s.includes(w)))) {
    score += 50
    hasDirectMatch = true
  }

  // Related condition matches (e.g., Alzheimer's -> Dementia/Memory)
  const conditionSynonyms: Record<string, string[]> = {
    'alzheimer': ['dementia', 'memory'],
    'dementia': ['alzheimer', 'memory'],
    'parkinson': ['mobility', 'tremor'],
    'stroke': ['post-hospital', 'recovery', 'rehab'],
    'palliative': ['hospice', 'end of life'],
    'hospice': ['palliative', 'end of life'],
  }
  const synonyms = Object.entries(conditionSynonyms)
    .filter(([key]) => cond.includes(key))
    .flatMap(([, syns]) => syns)
  if (synonyms.some(syn => specTexts.some(s => s.includes(syn)))) {
    score += hasDirectMatch ? 10 : 30
  }

  // Secondary conditions
  if (need.secondary_conditions && need.secondary_conditions.length > 0) {
    const secondaryMatch = need.secondary_conditions.filter(sec =>
      specTexts.some(s => s.includes(sec.toLowerCase()))
    ).length
    score += Math.min(15, secondaryMatch * 5)
  }

  // Credential depth (RN/LPN for medical, PSW/CNA/HHA for personal care)
  const medicalConditions = ['complex', 'medical', 'wound', 'medication', 'iv']
  const needsMedical = medicalConditions.some(m => cond.includes(m)) || need.care_intensity === 'complex'
  if (needsMedical && credentials.some(c => ['RN', 'LPN / LVN'].includes(c))) {
    score += 15
  } else if (credentials.some(c => ['CNA', 'PSW', 'HHA'].includes(c))) {
    score += 10
  }

  // Experience bonus (capped)
  score += Math.min(10, years)

  if (score === 0) {
    // No match at all — honest low score
    return scored(
      'clinical_fit',
      20,
      'medium',
      `no_direct_specialty_match_for_${need.primary_condition}`,
      prov
    )
  }

  const confidenceLabel: 'high' | 'medium' = hasDirectMatch && years >= 5 ? 'high' : 'medium'
  return scored(
    'clinical_fit',
    score,
    confidenceLabel,
    hasDirectMatch
      ? `direct_specialty_match:${need.primary_condition}`
      : `related_specialty_match:${need.primary_condition}`,
    prov
  )
}

// ─────────────────────────────────────────────────────────
// 2. Reliability
// ─────────────────────────────────────────────────────────

export function scoreReliability(
  cg: CaregiverWithProvenance,
  _need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['reliability_metrics'])
  const metrics = cg.reliability_metrics

  // HONEST HANDLING: if no placement data, this dimension is UNKNOWN.
  // We do NOT default to 70, 50, or any other number.
  if (
    !metrics ||
    metrics.total_placements == null ||
    metrics.total_placements === 0
  ) {
    return unknown('reliability', 'no_placement_history')
  }

  const completionRate = metrics.completion_rate ?? 0
  const noShowRate = metrics.no_show_rate ?? 0
  const wouldRehire = metrics.would_rehire_pct ?? 0
  const placements = metrics.total_placements

  // Base: completion rate (0-50 points)
  let score = completionRate * 50

  // No-show inverse (0-25 points, -25 for every 10% no-show rate)
  score += (1 - noShowRate) * 25

  // Would-rehire (0-25 points)
  score += wouldRehire * 25

  // Confidence calibration by data quantity
  let confidenceLabel: 'high' | 'medium' | 'low'
  if (placements >= 10) confidenceLabel = 'high'
  else if (placements >= 3) confidenceLabel = 'medium'
  else confidenceLabel = 'low'

  return scored(
    'reliability',
    score,
    confidenceLabel,
    `verified_from_${placements}_placement_${placements === 1 ? 'outcome' : 'outcomes'}`,
    prov
  )
}

// ─────────────────────────────────────────────────────────
// 3. Logistics Match
// ─────────────────────────────────────────────────────────

export function scoreLogisticsMatch(
  cg: CaregiverWithProvenance,
  need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, [
    'city', 'travel_radius', 'has_vehicle',
    'willing_live_in', 'willing_overnight',
    'availability_status', 'placement_types',
  ])

  // If we have no location in the need, we can't score this
  if (!need.city && !need.state) {
    return unknown('logistics_match', 'no_location_specified')
  }

  let score = 0
  let sources: string[] = []

  // Same city = strong signal
  if (need.city && cg.city) {
    if (need.city.toLowerCase() === cg.city.toLowerCase()) {
      score += 40
      sources.push('same_city')
    } else {
      // Different city, same state: depends on travel radius
      const radius = cg.travel_radius || 0
      if (radius >= 25) {
        score += 25
        sources.push(`travel_radius_${radius}mi`)
      } else if (radius >= 15) {
        score += 15
        sources.push(`travel_radius_${radius}mi_limited`)
      } else {
        score += 5
        sources.push('different_city_short_radius')
      }
    }
  }

  // Has vehicle / driver's license
  if (cg.has_vehicle === true) {
    score += 15
    sources.push('has_vehicle')
  }

  // Placement type flexibility
  if (need.placement_type) {
    const wants = need.placement_type.toLowerCase()
    if (/live-in/.test(wants) && cg.willing_live_in === true) {
      score += 20
      sources.push('live_in_capable')
    }
    if (/overnight/.test(wants) && cg.willing_overnight === true) {
      score += 20
      sources.push('overnight_capable')
    }
  }

  // Availability state
  if (cg.availability_status === 'available_now') {
    score += 15
    sources.push('available_now')
  } else if (cg.availability_status === 'open_to_opportunities') {
    score += 10
    sources.push('open_to_opportunities')
  } else if (cg.availability_status === 'available_from') {
    score += 5
    sources.push('available_from_future_date')
  }

  const confidenceLabel: 'high' | 'medium' = (need.city && cg.city) ? 'high' : 'medium'
  return scored(
    'logistics_match',
    score,
    confidenceLabel,
    sources.join('|') || 'minimal_logistics_signal',
    prov
  )
}

// ─────────────────────────────────────────────────────────
// 4. Personality Compatibility
// ─────────────────────────────────────────────────────────

export function scorePersonalityCompatibility(
  cg: CaregiverWithProvenance,
  need: MatchNeed,
  scope: 'full_client_match' | 'partial_filter_match' = 'partial_filter_match'
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['client_preferences'])

  // HONEST HANDLING: without client personality data, we cannot score compatibility.
  // Caregiver self-data alone tells us nothing about FIT — only about THEM.
  if (!need.personality_desired || need.personality_desired.length === 0) {
    return unknown(
      'personality_compatibility',
      scope === 'full_client_match'
        ? 'client_personality_not_specified'
        : 'filter_mode_no_personality_data'
    )
  }

  const cgPrefs = cg.client_preferences
  if (!cgPrefs || !cgPrefs.personality_types || cgPrefs.personality_types.length === 0) {
    return unknown('personality_compatibility', 'caregiver_preferences_not_provided')
  }

  const cgPersTypes = cgPrefs.personality_types.map(p => p.toLowerCase())
  const clientTypes = need.personality_desired.map(p => p.toLowerCase())

  // Direct overlaps
  const overlaps = clientTypes.filter(ct => cgPersTypes.some(cp => cp.includes(ct) || ct.includes(cp)))
  const matchRatio = overlaps.length / clientTypes.length

  // Score: 100 = perfect overlap, scales down
  let score = matchRatio * 80

  // Care style fit
  if (cgPrefs.care_style) {
    if (need.care_intensity === 'complex' && cgPrefs.care_style === 'hands_on') score += 20
    else if (need.care_intensity === 'light' && cgPrefs.care_style === 'companionship') score += 20
    else if (cgPrefs.care_style === 'balanced') score += 10
  }

  return scored(
    'personality_compatibility',
    score,
    'medium', // self-reported preferences on both sides
    `overlap:${overlaps.length}/${clientTypes.length}_types`,
    prov
  )
}

// ─────────────────────────────────────────────────────────
// 5. Cultural / Language Fit
// ─────────────────────────────────────────────────────────

export function scoreCulturalLanguageFit(
  cg: CaregiverWithProvenance,
  need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['languages'])

  let score = 0
  let sources: string[] = []

  // Language (gates handle "required" — this scores the "nice to have" layer)
  if (need.language_required && cg.languages) {
    const hasLang = cg.languages.some(
      l => l.toLowerCase() === need.language_required!.toLowerCase()
    )
    if (hasLang) {
      score += 60
      sources.push(`language:${need.language_required}`)
    }
  }

  // Multilingual bonus (not about a specific language, just breadth)
  const langCount = (cg.languages || []).length
  if (langCount >= 3) {
    score += 15
    sources.push('multilingual_3+')
  } else if (langCount === 2) {
    score += 10
    sources.push('bilingual')
  }

  // Cultural preference (if specified)
  if (need.cultural_preference) {
    // We don't have a cultural_background field yet — flag as unknown if used
    sources.push(`cultural_preference_specified_but_unverified`)
  }

  // If we have no language data at all to match against
  if (sources.length === 0) {
    return unknown('cultural_language_fit', 'no_language_or_cultural_criteria')
  }

  return scored(
    'cultural_language_fit',
    score,
    'high',
    sources.join('|'),
    prov
  )
}

// ─────────────────────────────────────────────────────────
// 6. Retention Signal
// ─────────────────────────────────────────────────────────

export function scoreRetentionSignal(
  cg: CaregiverWithProvenance,
  need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['reliability_metrics', 'motivation'])
  const metrics = cg.reliability_metrics

  // If we have placement data, use verified tenure
  if (metrics && metrics.total_placements && metrics.total_placements > 0 && metrics.avg_placement_duration_days) {
    let score = 0
    const avgDays = metrics.avg_placement_duration_days

    if (avgDays >= 365) score = 90
    else if (avgDays >= 180) score = 75
    else if (avgDays >= 90) score = 60
    else if (avgDays >= 30) score = 40
    else score = 20

    const confidenceLabel: 'high' | 'medium' = metrics.total_placements >= 3 ? 'high' : 'medium'
    return scored(
      'retention_signal',
      score,
      confidenceLabel,
      `verified_avg_tenure_${avgDays}_days`,
      prov
    )
  }

  // No placement data — fall back to stated preferences as a WEAK signal
  const motivation = cg.motivation
  const ideal = motivation?.ideal_client?.toLowerCase() || ''
  const why = motivation?.why_caregiving?.toLowerCase() || ''
  const combined = `${ideal} ${why}`

  const longTermSignals = [
    'long-term', 'long term', 'years with', 'ongoing', 'continuing',
    'build trust', 'relationship', 'stay', 'continuity',
  ]
  const longTermMatch = longTermSignals.some(s => combined.includes(s))

  if (longTermMatch && motivation?.why_caregiving) {
    return scored(
      'retention_signal',
      60, // stated preference only — capped
      'low',
      'stated_long_term_preference_no_placement_history',
      prov
    )
  }

  // No placement data AND no stated signal — unknown.
  return unknown('retention_signal', 'no_placement_history_or_stated_preference')
}

// ─────────────────────────────────────────────────────────
// 7. Environment Fit
// ─────────────────────────────────────────────────────────

export function scoreEnvironmentFit(
  cg: CaregiverWithProvenance,
  need: MatchNeed
): DimensionScore {
  const prov = lowestConfidenceFor(cg, ['environment_comfort'])
  const env = cg.environment_comfort
  if (!env || Object.keys(env).length === 0) {
    return unknown('environment_fit', 'caregiver_environment_comfort_not_provided')
  }

  // If the need doesn't specify any environment details, we can't score
  const hasNeedData =
    (need.pets_present && need.pets_present.length > 0) ||
    need.smoking_household != null ||
    need.home_condition != null ||
    need.family_dynamics != null

  if (!hasNeedData) {
    return unknown('environment_fit', 'no_client_environment_specified')
  }

  let score = 100 // start high, subtract for conflicts
  const conflicts: string[] = []

  // Pets
  if (need.pets_present?.includes('dogs') && env.dogs === 'no') {
    score -= 30
    conflicts.push('dogs_present_caregiver_declined')
  }
  if (need.pets_present?.includes('cats') && env.cats === 'no') {
    score -= 25
    conflicts.push('cats_present_caregiver_declined')
  }
  if (need.pets_present?.includes('other_pets') && env.other_pets === 'no') {
    score -= 15
    conflicts.push('other_pets_caregiver_declined')
  }

  // Smoking
  if (need.smoking_household === true) {
    if (env.smoking_indoor === 'no' && env.smoking_outdoor === 'no') {
      score -= 40
      conflicts.push('smoking_household_caregiver_declined')
    } else if (env.smoking_indoor === 'no' && env.smoking_outdoor !== 'yes') {
      score -= 20
      conflicts.push('smoking_household_partial_fit')
    }
  }

  // Clutter
  if (need.home_condition === 'cluttered' && env.clutter === 'no') {
    score -= 25
    conflicts.push('cluttered_home_caregiver_declined')
  }
  if (need.home_condition === 'hoarding' && env.hoarding === 'no') {
    score -= 35
    conflicts.push('hoarding_home_caregiver_declined')
  }

  // Family
  if (need.family_dynamics === 'large_active' && env.large_family === 'no') {
    score -= 20
    conflicts.push('large_family_caregiver_declined')
  }

  return scored(
    'environment_fit',
    score,
    'medium',
    conflicts.length === 0 ? 'no_conflicts' : conflicts.join('|'),
    prov
  )
}
