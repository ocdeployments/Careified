// lib/enrichment/bestFitProfile.ts
import type { CaregiverForEnrichment, BestFitProfile } from './types'

/**
 * Generate a best-fit client profile from caregiver data.
 * Pure function — same input always produces same output.
 */
export function generateBestFitProfile(
  cg: CaregiverForEnrichment
): BestFitProfile {
  const strong: string[] = []
  const weak: string[] = []

  const specs = cg.specializations || []
  const credentials = cg.credentials || []
  const languages = cg.languages || []
  const env = cg.environment_comfort || {}
  const prefs = cg.client_preferences || {}
  const years = cg.years_experience || 0

  // ── Specialty-driven strong fits ──
  if (specs.some(s => /Dementia|Alzheimer|Memory/i.test(s))) {
    strong.push("Elderly clients with dementia or Alzheimer's")
  }
  if (specs.some(s => /Palliative|Hospice|End of life/i.test(s))) {
    strong.push('Palliative and end-of-life care clients')
  }
  if (specs.some(s => /Parkinson/i.test(s))) {
    strong.push("Clients with Parkinson's disease")
  }
  if (specs.some(s => /Post-hospital|Post-surgical|Rehab|Stroke/i.test(s))) {
    strong.push('Post-hospital recovery and rehabilitation clients')
  }
  if (specs.some(s => /Bariatric/i.test(s))) {
    strong.push('Bariatric clients requiring specialized transfer support')
  }
  if (specs.some(s => /Paediatric|Pediatric/i.test(s))) {
    strong.push('Pediatric and special-needs children')
  }
  if (specs.some(s => /Mental health|Behavioural/i.test(s))) {
    strong.push('Clients needing mental health support')
  }

  // ── Language-driven strong fits ──
  const nonEnglish = languages.filter(l => l !== 'English')
  if (nonEnglish.length > 0) {
    strong.push(`${nonEnglish.join('/')}-speaking households`)
  }

  // ── Placement type driven ──
  const placementTypes = cg.placement_types || []
  const hasLiveIn = placementTypes.some(p => /Live-in/i.test(p))
  const hasOvernight = placementTypes.some(p => /Overnight/i.test(p))
  const hasRespite = placementTypes.some(p => /Respite|Casual|Weekend/i.test(p))

  if (hasLiveIn) {
    strong.push('Live-in or long-term residential care')
  }
  if (hasOvernight) {
    strong.push('Overnight shifts and sleep-in support')
  }

  // ── Experience tier ──
  if (years >= 10) {
    strong.push('Complex care situations requiring seasoned judgment')
  } else if (years <= 2) {
    weak.push('Complex multi-condition cases (better for straightforward care)')
  }

  // ── Credential-driven ──
  if (credentials.includes('RN') || credentials.includes('LPN / LVN')) {
    strong.push('Clients with complex medical needs and medication management')
  }

  // ── Care style preference ──
  if (prefs.care_style === 'companionship') {
    strong.push('Clients who need companionship and emotional support')
    weak.push('Clients requiring heavy physical care or complex medical tasks')
  }
  if (prefs.care_style === 'hands_on') {
    strong.push('Clients needing hands-on physical and medical care')
  }

  // ── Environment-driven weak fits ──
  if (env.clutter === 'no') {
    weak.push('Very cluttered or disorganized homes')
  }
  if (env.hoarding === 'no') {
    weak.push('Homes with hoarding tendencies')
  }
  if (env.smoking_indoor === 'no' && env.smoking_outdoor === 'no') {
    weak.push('Households with any smoking')
  } else if (env.smoking_indoor === 'no' && env.smoking_outdoor !== 'no') {
    weak.push('Indoor-smoking households')
  }
  if (env.dogs === 'no' && env.cats === 'no' && env.other_pets === 'no') {
    weak.push('Households with pets')
  }
  if (env.large_family === 'no') {
    weak.push('Large or very active family households')
  }

  // ── Age range ──
  const ages = prefs.age_ranges || []
  if (ages.length > 0 && !ages.includes('children')) {
    if (specs.every(s => !/Paediatric|Pediatric/i.test(s))) {
      weak.push('Pediatric care')
    }
  }

  // ── Determine recommended placement length ──
  let recLength: BestFitProfile['recommended_placement_length'] = 'either'
  if (hasLiveIn && years >= 5) recLength = 'long_term'
  else if (hasRespite && !hasLiveIn) recLength = 'short_term'

  // ── Determine recommended intensity ──
  let recIntensity: BestFitProfile['recommended_intensity'] = 'any'
  if (years <= 2 && prefs.care_style === 'companionship') recIntensity = 'light'
  else if (years >= 8 && (credentials.includes('RN') || credentials.includes('LPN / LVN'))) recIntensity = 'complex'
  else if (years >= 4) recIntensity = 'moderate'

  // Dedupe and limit length
  return {
    strong_fits: Array.from(new Set(strong)).slice(0, 6),
    weak_fits: Array.from(new Set(weak)).slice(0, 4),
    recommended_placement_length: recLength,
    recommended_intensity: recIntensity,
    generated_at: new Date().toISOString(),
  }
}
