// lib/enrichment/bestFitProfile.ts
import type { CaregiverForEnrichment, CaregiverDisclosedPreferences } from './types'

/**
 * Generate disclosed preferences from caregiver data.
 * Pure function — same input always produces same output.
 */
export function generateDisclosedPreferences(
  cg: CaregiverForEnrichment
): CaregiverDisclosedPreferences {
  const best_for: string[] = []
  const less_suited_for: string[] = []

  const specs = cg.specializations || []
  const credentials = cg.credentials || []
  const languages = cg.languages || []
  const env = cg.environment_comfort || {}
  const prefs = cg.client_preferences || {}
  const years = cg.years_experience || 0

  // ── Specialty-driven best fits ──
  if (specs.some(s => /Dementia|Alzheimer|Memory/i.test(s))) {
    best_for.push("Elderly clients with dementia or Alzheimer's")
  }
  if (specs.some(s => /Palliative|Hospice|End of life/i.test(s))) {
    best_for.push('Palliative and end-of-life care clients')
  }
  if (specs.some(s => /Parkinson/i.test(s))) {
    best_for.push("Clients with Parkinson's disease")
  }
  if (specs.some(s => /Post-hospital|Post-surgical|Rehab|Stroke/i.test(s))) {
    best_for.push('Post-hospital recovery and rehabilitation clients')
  }
  if (specs.some(s => /Bariatric/i.test(s))) {
    best_for.push('Bariatric clients requiring specialized transfer support')
  }
  if (specs.some(s => /Paediatric|Pediatric/i.test(s))) {
    best_for.push('Pediatric and special-needs children')
  }
  if (specs.some(s => /Mental health|Behavioural/i.test(s))) {
    best_for.push('Clients needing mental health support')
  }

  // ── Language-driven best fits ──
  const nonEnglish = languages.filter(l => l !== 'English')
  if (nonEnglish.length > 0) {
    best_for.push(`${nonEnglish.join('/')}-speaking households`)
  }

  // ── Placement type driven ──
  const placementTypes = cg.placement_types || []
  const hasLiveIn = placementTypes.some(p => /Live-in/i.test(p))
  const hasOvernight = placementTypes.some(p => /Overnight/i.test(p))
  const hasRespite = placementTypes.some(p => /Respite|Casual|Weekend/i.test(p))

  if (hasLiveIn) {
    best_for.push('Live-in or long-term residential care')
  }
  if (hasOvernight) {
    best_for.push('Overnight shifts and sleep-in support')
  }

  // ── Experience tier ──
  if (years >= 10) {
    best_for.push('Complex care situations requiring seasoned judgment')
  } else if (years <= 2) {
    less_suited_for.push('Complex multi-condition cases (better for straightforward care)')
  }

  // ── Credential-driven ──
  if (credentials.includes('RN') || credentials.includes('LPN / LVN')) {
    best_for.push('Clients with complex medical needs and medication management')
  }

  // ── Care style preference ──
  if (prefs.care_style === 'companionship') {
    best_for.push('Clients who need companionship and emotional support')
    less_suited_for.push('Clients requiring heavy physical care or complex medical tasks')
  }
  if (prefs.care_style === 'hands_on') {
    best_for.push('Clients needing hands-on physical and medical care')
  }

  // ── Environment-driven less suited ──
  if (env.clutter === 'no') {
    less_suited_for.push('Very cluttered or disorganized homes')
  }
  if (env.hoarding === 'no') {
    less_suited_for.push('Homes with hoarding tendencies')
  }
  if (env.smoking_indoor === 'no' && env.smoking_outdoor === 'no') {
    less_suited_for.push('Households with any smoking')
  } else if (env.smoking_indoor === 'no' && env.smoking_outdoor !== 'no') {
    less_suited_for.push('Indoor-smoking households')
  }
  if (env.dogs === 'no' && env.cats === 'no' && env.other_pets === 'no') {
    less_suited_for.push('Households with pets')
  }
  if (env.large_family === 'no') {
    less_suited_for.push('Large or very active family households')
  }

  // ── Age range ──
  const ages = prefs.age_ranges || []
  if (ages.length > 0 && !ages.includes('children')) {
    if (specs.every(s => !/Paediatric|Pediatric/i.test(s))) {
      less_suited_for.push('Pediatric care')
    }
  }

  // ── Determine recommended placement length ──
  let recLength: CaregiverDisclosedPreferences['recommended_placement_length'] = 'either'
  if (hasLiveIn && years >= 5) recLength = 'long_term'
  else if (hasRespite && !hasLiveIn) recLength = 'short_term'

  // ── Determine recommended intensity ──
  let recIntensity: CaregiverDisclosedPreferences['recommended_intensity'] = 'any'
  if (years <= 2 && prefs.care_style === 'companionship') recIntensity = 'light'
  else if (years >= 8 && (credentials.includes('RN') || credentials.includes('LPN / LVN'))) recIntensity = 'complex'
  else if (years >= 4) recIntensity = 'moderate'

  // Dedupe and limit length
  return {
    caregiver_indicates_best_for: Array.from(new Set(best_for)).slice(0, 6),
    caregiver_indicates_less_suited_for: Array.from(new Set(less_suited_for)).slice(0, 4),
    recommended_placement_length: recLength,
    recommended_intensity: recIntensity,
    generated_at: new Date().toISOString(),
  }
}

/** @deprecated Use generateDisclosedPreferences */
export const generateBestFitProfile = generateDisclosedPreferences
