// lib/matching/dimension-meta.ts
import type { DimensionKey } from './types'

export type DimensionMeta = {
 label: string
 shortLabel: string
 description: string
 weight: number
 whatItMeasures: string
}

export const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
 clinical_fit: {
 label: 'Clinical fit',
 shortLabel: 'Clinical',
 description: 'How the caregiver\'s disclosed specialties, credentials, and experience align with the client\'s primary care needs.',
 weight: 0.25,
 whatItMeasures: 'Specialty match, credential relevance, years of experience',
 },
 reliability: {
 label: 'Reliability',
 shortLabel: 'Reliability',
 description: 'Verified history of completed placements, tenure, and no-show patterns. Null when the caregiver has no prior platform placement history.',
 weight: 0.20,
 whatItMeasures: 'Completion rate, no-shows, would-rehire rate from past agencies',
 },
 logistics_match: {
 label: 'Logistics match',
 shortLabel: 'Logistics',
 description: 'Physical availability to do the job: proximity, transport, placement type compatibility, current availability.',
 weight: 0.15,
 whatItMeasures: 'Location, travel radius, vehicle, availability status, placement type',
 },
 personality_compatibility: {
 label: 'Personality alignment',
 shortLabel: 'Personality',
 description: 'Self-reported personality preferences of the caregiver compared to client personality traits. Null when client personality not specified.',
 weight: 0.15,
 whatItMeasures: 'Caregiver preferred client types vs. client desired personality',
 },
 cultural_language_fit: {
 label: 'Cultural & language fit',
 shortLabel: 'Cultural',
 description: 'Language match (critical for caregiving) and multilingual range.',
 weight: 0.10,
 whatItMeasures: 'Required language match, bilingual/multilingual breadth',
 },
 retention_signal: {
 label: 'Retention signal',
 shortLabel: 'Retention',
 description: 'Historical tenure per placement from verified outcomes. Falls back to stated preferences when no placement history exists — lower confidence.',
 weight: 0.10,
 whatItMeasures: 'Average placement duration, long-term stated preferences',
 },
 environment_fit: {
 label: 'Environment fit',
 shortLabel: 'Environment',
 description: 'Compatibility of caregiver environment preferences with client household (pets, smoking, home condition, family size).',
 weight: 0.05,
 whatItMeasures: 'Pets, smoking, clutter, family dynamics',
 },
}

export const DIMENSION_ORDER: DimensionKey[] = [
 'clinical_fit',
 'reliability',
 'logistics_match',
 'cultural_language_fit',
 'personality_compatibility',
 'retention_signal',
 'environment_fit',
]

export function confidenceLabel(multiplier: number): string {
 if (multiplier >= 0.9) return 'High — verified'
 if (multiplier >= 0.7) return 'Good — documented'
 if (multiplier >= 0.5) return 'Fair — reference-confirmed'
 if (multiplier > 0) return 'Low — self-reported only'
 return 'No data'
}

export function tierFromMultiplier(multiplier: number): 1 | 2 | 3 | 4 {
 if (multiplier >= 0.95) return 1
 if (multiplier >= 0.70) return 2
 if (multiplier >= 0.50) return 3
 return 4
}
