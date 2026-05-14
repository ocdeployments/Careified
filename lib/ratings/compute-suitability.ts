// Suitability scoring engine for Careified rating system
// Part A: Rule-based scoring, Part B: LLM narrative

import { computeTrustScore, TrustScoreResult } from './compute-trust-score'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface SuitabilityScores {
  dementia_alzheimers: number
  parkinsons: number
  palliative_end_of_life: number
  post_surgical_recovery: number
  acquired_brain_injury: number
  developmental_disability: number
  companion_social: number
  high_acuity_medical: number
  pediatric: number
  mental_health_support: number
  best_match_types: string[]
  caution_types: string[]
}

export interface CaregiverProfile {
  specializations: string[]
  diagnosisExperience: string[]
  adlsPerformed: string[]
  yearsExperience: number
  credentials?: string[]
}

// Map caregiver profile data to normalized strings for matching
function normalizeSpecializations(specs: string[]): string[] {
  return specs.map(s => s.toLowerCase().trim())
}

function hasSpecialization(profile: CaregiverProfile, term: string): boolean {
  const normalized = normalizeSpecializations(profile.specializations)
  const normalizedTerm = term.toLowerCase()
  return normalized.some(s => s.includes(normalizedTerm))
}

function hasDiagnosis(profile: CaregiverProfile, term: string): boolean {
  const normalized = normalizeSpecializations(profile.diagnosisExperience)
  const normalizedTerm = term.toLowerCase()
  return normalized.some(d => d.includes(normalizedTerm))
}

function hasCredential(profile: CaregiverProfile, term: string): boolean {
  if (!profile.credentials) return false
  const normalized = profile.credentials.map(c => c.toLowerCase())
  const normalizedTerm = term.toLowerCase()
  return normalized.some(c => c.includes(normalizedTerm))
}

// Get dimension score or default to 5.0 (neutral) if null
function getScore(dim: number | null): number {
  return dim ?? 5.0
}

/**
 * Part A: Rule-based suitability scores (0-10 per client type)
 */
export function computeSuitabilityScores(
  trustScore: TrustScoreResult,
  caregiverProfile: CaregiverProfile
): SuitabilityScores {
  const dims = trustScore.dimension_scores
  const s = getScore

  // Calculate each client type score using the mapping from the spec
  const scores = {
    dementia_alzheimers: Math.min(10,
      s(dims.human_qualities) * 0.4 +
      s(dims.professional_reliability) * 0.3 +
      s(dims.personal_care_hygiene) * 0.3 +
      (hasSpecialization(caregiverProfile, 'dementia') || hasDiagnosis(caregiverProfile, 'dementia') ? 2 : 0)
    ),

    parkinsons: Math.min(10,
      s(dims.personal_care_hygiene) * 0.35 +
      s(dims.skills_match) * 0.35 +
      s(dims.human_qualities) * 0.30 +
      (hasDiagnosis(caregiverProfile, 'parkinsons') ? 2 : 0)
    ),

    palliative_end_of_life: Math.min(10,
      s(dims.human_qualities) * 0.5 +
      s(dims.communication_conduct) * 0.3 +
      s(dims.professional_reliability) * 0.2 +
      (hasSpecialization(caregiverProfile, 'palliative') ? 2 : 0)
    ),

    post_surgical_recovery: Math.min(10,
      s(dims.skills_match) * 0.4 +
      s(dims.personal_care_hygiene) * 0.3 +
      s(dims.professional_reliability) * 0.3
    ),

    acquired_brain_injury: Math.min(10,
      s(dims.skills_match) * 0.4 +
      s(dims.human_qualities) * 0.35 +
      s(dims.professional_reliability) * 0.25
    ),

    developmental_disability: Math.min(10,
      s(dims.human_qualities) * 0.35 +
      s(dims.professional_reliability) * 0.35 +
      s(dims.skills_match) * 0.30 +
      (hasSpecialization(caregiverProfile, 'developmental') ? 2 : 0)
    ),

    companion_social: Math.min(10,
      s(dims.human_qualities) * 0.6 +
      (s(dims.beyond_the_call) || 0) * 0.2 +
      s(dims.communication_conduct) * 0.2
    ),

    high_acuity_medical: Math.min(10,
      s(dims.skills_match) * 0.5 +
      s(dims.professional_reliability) * 0.3 +
      s(dims.personal_care_hygiene) * 0.2 +
      (hasCredential(caregiverProfile, 'RN') || hasCredential(caregiverProfile, 'RPN') || hasCredential(caregiverProfile, 'LPN') ? 3 : 0)
    ),

    pediatric: Math.min(10,
      s(dims.human_qualities) * 0.4 +
      s(dims.professional_reliability) * 0.35 +
      s(dims.communication_conduct) * 0.25 +
      (hasSpecialization(caregiverProfile, 'pediatric') ? 2 : 0)
    ),

    mental_health_support: Math.min(10,
      s(dims.human_qualities) * 0.5 +
      s(dims.communication_conduct) * 0.3 +
      s(dims.professional_reliability) * 0.2 +
      (hasSpecialization(caregiverProfile, 'mental health') ? 2 : 0)
    ),
  }

  // Determine best match types (top 3 >= 7.0)
  const clientTypes = Object.entries(scores)
    .filter(([key]) => key !== 'best_match_types' && key !== 'caution_types')
    .sort((a, b) => b[1] - a[1])

  const best_match_types = clientTypes
    .filter(([, score]) => score >= 7.0)
    .slice(0, 3)
    .map(([type]) => type.replace(/_/g, ' '))

  const caution_types = clientTypes
    .filter(([, score]) => score <= 4.0)
    .map(([type]) => type.replace(/_/g, ' '))

  return {
    ...scores,
    best_match_types,
    caution_types,
  }
}

/**
 * Part B: LLM narrative generation
 * Uses Ring model per CLAUDE.md AI MODEL CONFIGURATION
 */
export async function generateSuitabilityNarrative(
  trustScore: TrustScoreResult,
  suitabilityScores: SuitabilityScores,
  caregiverName: string,
  reviewCount: number
): Promise<{ suitability_summary: string; credibility_narrative: string }> {
  // If insufficient data, return conservative narrative
  if (reviewCount < 3) {
    return {
      suitability_summary: `Insufficient placement data to generate a full suitability analysis. ${reviewCount} review(s) recorded. Analysis will update as placement history grows.`,
      credibility_narrative: `Insufficient placement data to generate a full credibility narrative. ${reviewCount} review(s) recorded. Narrative will update as placement history grows.`,
    }
  }

  const firstName = caregiverName.split(' ')[0]
  const bestTypes = suitabilityScores.best_match_types.join(', ') || 'various client types'
  const cautionTypes = suitabilityScores.caution_types.length > 0
    ? `Placements involving ${suitabilityScores.caution_types.join(', ')} may benefit from additional agency support.`
    : ''
  const reengageRate = Math.round(trustScore.would_reengage_rate * 100)

  // Determine highest dimension
  const dims = trustScore.dimension_scores
  const dimEntries = Object.entries(dims).filter(([, v]) => v !== null) as [string, number][]
  dimEntries.sort((a, b) => b[1] - a[1])
  const highestDim = dimEntries[0]?.[0]?.replace(/_/g, ' ') || 'various dimensions'

  const prompt = `You are a placement analyst for a home care staffing platform. Write two brief narratives (2-3 sentences each) about a caregiver based on their placement review data.

IMPORTANT: Do not recommend or endorse this caregiver. Present findings as data patterns only. Use phrases like "scores suggest", "data indicates", "pattern shows". Never use "best", "ideal", "perfect", "recommended".

Caregiver: ${firstName}
Total reviews: ${reviewCount}
Would re-engage rate: ${reengageRate}%
Highest scored dimension: ${highestDim}
Top client type matches: ${bestTypes}
${cautionTypes}

Write in this exact JSON format (no markdown, no explanation):
{
  "suitability_summary": "Based on [N] placement reviews, [FirstName] shows strongest alignment with [top client types]. Their [highest dimension] scores suggest [specific strength]. [If caution types exist: [caution note]]",
  "credibility_narrative": "[FirstName]'s agency re-engagement rate of [X]% across [N] placements indicates [interpretation]. Their [dimension] scores are consistently [pattern], suggesting [meaning for agencies]."
}`

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified Suitability Analyzer',
      },
      body: JSON.stringify({
        model: 'upstage/ring-2.6-1t:free',
        max_tokens: 500,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    // Check for credit exhaustion
    if (!response.ok) {
      const errorText = await response.text()
      const errorLower = errorText.toLowerCase()
      if (errorLower.includes('credits') || errorLower.includes('quota') || errorLower.includes('rate limit') || errorLower.includes('billing') || response.status === 402 || response.status === 429) {
        console.error('[OPENROUTER CREDITS] Ring model returned credit/quota error in suitability narrative')
        return {
          suitability_summary: `Based on ${reviewCount} placement reviews, ${firstName} shows strongest alignment with ${bestTypes}. Analysis pending due to service availability.`,
          credibility_narrative: `Re-engagement rate of ${reengageRate}% across ${reviewCount} placements. Full credibility analysis pending due to service availability.`,
        }
      }
      console.error('OpenRouter error:', errorText)
      return {
        suitability_summary: `Based on ${reviewCount} placement reviews, ${firstName} shows strongest alignment with ${bestTypes}. Analysis unavailable at this time.`,
        credibility_narrative: `Re-engagement rate of ${reengageRate}% across ${reviewCount} placements. Full credibility analysis unavailable at this time.`,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    const clean = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      suitability_summary: parsed.suitability_summary || '',
      credibility_narrative: parsed.credibility_narrative || '',
    }
  } catch (err) {
    console.error('generateSuitabilityNarrative error:', err)
    return {
      suitability_summary: `Analysis unavailable for ${firstName}.`,
      credibility_narrative: `Credibility analysis unavailable at this time.`,
    }
  }
}