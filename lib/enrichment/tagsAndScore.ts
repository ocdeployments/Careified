// lib/enrichment/tagsAndScore.ts
import type { CaregiverForEnrichment, MatchingTag } from './types'

/**
 * Extract matching tags from caregiver profile.
 * Tags let agencies filter 1000s of caregivers without reading essays.
 */
export function extractMatchingTags(
  cg: CaregiverForEnrichment
): MatchingTag[] {
  const tags = new Set<MatchingTag>()

  const specs = cg.specializations || []
  const credentials = cg.credentials || []
  const languages = cg.languages || []
  const motivation = cg.motivation || {}
  const env = cg.environment_comfort || {}
  const prefs = cg.client_preferences || {}

  // ── Specialty tags ──
  if (specs.some(s => /Dementia|Alzheimer|Memory/i.test(s))) tags.add('dementia_specialist')
  if (specs.some(s => /Palliative|Hospice|End of life/i.test(s))) tags.add('palliative_specialist')
  if (specs.some(s => /Paediatric|Pediatric/i.test(s))) tags.add('pediatric_specialist')
  if (specs.some(s => /Post-hospital|Post-surgical|Stroke|Rehab/i.test(s))) tags.add('post_surgical_specialist')

  // ── Credential tags ──
  if (credentials.some(c => ['RN', 'LPN / LVN', 'CNA'].includes(c))) {
    tags.add('medical_specialist')
  }

  // ── Care style tags ──
  if (prefs.care_style === 'companionship') tags.add('companionship_specialist')

  // ── Language tag ──
  const nonEnglish = languages.filter(l => l !== 'English')
  if (nonEnglish.length >= 1) tags.add('multilingual')

  // ── Motivation text analysis ──
  const q1 = (motivation.why_caregiving || '').toLowerCase()
  const q2 = (motivation.proudest_placement || '').toLowerCase()
  const q3 = (motivation.ideal_client || '').toLowerCase()
  const allText = `${q1} ${q2} ${q3}`

  if (
    /grandmother|grandfather|grandparent|mother|father|parent|aunt|uncle|family member|relative/i.test(q1)
  ) {
    tags.add('personal_connection')
  }

  if (
    /calling|vocation|purpose|meaning|passion|values|faith|believe/i.test(q1)
  ) {
    tags.add('values_driven')
  }

  if (
    /long[- ]?term|years with|stayed|continuing|ongoing relationship|build trust/i.test(allText)
  ) {
    tags.add('long_term_oriented')
  }

  if (
    /church|temple|mosque|synagogue|spiritual|religious|faith|pray/i.test(allText)
  ) {
    tags.add('religious_cultural_fit')
  }

  // ── Environment flexibility ──
  const envValues = Object.values(env)
  const yesCount = envValues.filter(v => v === 'yes').length
  const noCount = envValues.filter(v => v === 'no').length

  if (yesCount >= 6 && noCount <= 2) tags.add('high_environment_flexibility')
  if (noCount >= 5) tags.add('low_environment_flexibility')

  return Array.from(tags)
}

/**
 * Compute profile strength score (0-100).
 * Weighted by how much each field contributes to match quality.
 */
export function computeProfileStrength(
  cg: CaregiverForEnrichment
): number {
  let score = 0

  // Hard data — the basics (40 points total)
  if (cg.bio && cg.bio.length >= 50) score += 5
  if ((cg.specializations || []).length >= 2) score += 10
  if ((cg.credentials || []).length >= 1) score += 10
  if ((cg.placement_types || []).length >= 1) score += 5
  if ((cg.languages || []).length >= 1) score += 5
  if (cg.years_experience != null) score += 5

  // Soft data from 11B (30 points total)
  const prefs = cg.client_preferences || {}
  if ((prefs.personality_types || []).length >= 2) score += 8
  if ((prefs.age_ranges || []).length >= 1) score += 7
  if (prefs.care_style) score += 5

  const env = cg.environment_comfort || {}
  const envAnswered = Object.values(env).filter(v => v != null).length
  if (envAnswered >= 9) score += 10
  else if (envAnswered >= 5) score += 5

  // Motivation (20 points total)
  const m = cg.motivation || {}
  if ((m.why_caregiving || '').length >= 30) score += 10
  if ((m.proudest_placement || '').length >= 30) score += 5
  if ((m.ideal_client || '').length >= 30) score += 5

  // Logistics (10 points total)
  if (cg.has_vehicle != null) score += 3
  if (cg.willing_live_in != null) score += 3
  if (cg.travel_radius != null) score += 4

  return Math.min(100, score)
}
