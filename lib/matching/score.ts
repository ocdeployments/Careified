// lib/matching/score.ts
import type {
  MatchNeed,
  MatchResult,
  MatchScope,
  DimensionScore,
  DimensionKey,
} from './types'
import { BASE_WEIGHTS, ALIGNMENT_DISCLAIMER } from './types'
import { runGates } from './gates'
import type { CaregiverWithProvenance } from './caregiver-loader'
import {
  scoreClinicalFit,
  scoreReliability,
  scoreLogisticsMatch,
  scorePersonalityCompatibility,
  scoreCulturalLanguageFit,
  scoreRetentionSignal,
  scoreEnvironmentFit,
} from './dimensions'

/**
 * Infer the match scope from the need payload.
 * If the need looks like a full client_needs record (has personality_desired,
 * home_condition, etc.), it's a full match. Otherwise it's a filter match.
 */
function inferScope(need: MatchNeed): MatchScope {
  const hasFullData =
    need.personality_desired != null ||
    need.home_condition != null ||
    need.family_dynamics != null ||
    need.pets_present != null ||
    need.secondary_conditions != null

  return hasFullData ? 'full_client_match' : 'partial_filter_match'
}

/**
 * Renormalize weights across dimensions that have non-null scores.
 * Weights from null-scoring dimensions are redistributed proportionally.
 */
function renormalizeWeights(
  dimensions: Record<DimensionKey, DimensionScore>
): Record<DimensionKey, DimensionScore> {
  const active = (Object.entries(dimensions) as [DimensionKey, DimensionScore][])
    .filter(([, d]) => d.score !== null)

  if (active.length === 0) {
    return dimensions
  }

  const totalActiveWeight = active.reduce(
    (sum, [key]) => sum + BASE_WEIGHTS[key],
    0
  )

  if (totalActiveWeight === 0) return dimensions

  // Build new dimensions object with renormalized weight_applied values
  const result = { ...dimensions }
  for (const [key, dim] of active) {
    result[key] = {
      ...dim,
      weight_applied: BASE_WEIGHTS[key] / totalActiveWeight,
    }
  }
  return result
}

/**
 * Derive criteria_aligned and gaps from dimension sources.
 * These are human-readable explanations for the UI.
 */
function deriveExplanations(
  dimensions: Record<DimensionKey, DimensionScore>
): { criteria_aligned: string[]; gaps: string[] } {
  const criteria_aligned: string[] = []
  const gaps: string[] = []

  const cf = dimensions.clinical_fit
  if (cf.score != null) {
    if (cf.score >= 70) criteria_aligned.push(humanizeClinical(cf.source, 'strong'))
    else if (cf.score < 40) gaps.push(humanizeClinical(cf.source, 'gap'))
  }

  const rl = dimensions.reliability
  if (rl.score != null && rl.score >= 80) {
    criteria_aligned.push(humanizeReliability(rl.source, 'strong'))
  } else if (rl.score != null && rl.score < 50) {
    gaps.push(humanizeReliability(rl.source, 'gap'))
  }

  const log = dimensions.logistics_match
  if (log.score != null) {
    if (log.source.includes('same_city')) criteria_aligned.push('In your service area')
    if (log.source.includes('available_now')) criteria_aligned.push('Available immediately')
    if (log.source.includes('live_in_capable')) criteria_aligned.push('Live-in capable')
    if (log.score < 40) gaps.push('Travel or availability constraints')
  }

  const lang = dimensions.cultural_language_fit
  if (lang.score != null && lang.score >= 70) {
    const match = /language:([^|]+)/.exec(lang.source)
    if (match) criteria_aligned.push(`Speaks ${match[1]}`)
    else if (lang.source.includes('multilingual')) criteria_aligned.push('Multilingual')
  }

  const env = dimensions.environment_fit
  if (env.score != null && env.score < 60) {
    const conflicts = env.source.split('|').filter(s => s !== 'no_conflicts')
    for (const c of conflicts) gaps.push(humanizeEnvConflict(c))
  }

  const pers = dimensions.personality_compatibility
  if (pers.score != null && pers.score >= 70) {
    criteria_aligned.push('Personality fit with stated client preferences')
  }

  return {
    criteria_aligned: Array.from(new Set(criteria_aligned)).slice(0, 8),
    gaps: Array.from(new Set(gaps)).slice(0, 6),
  }
}

function humanizeClinical(source: string, kind: 'strong' | 'gap'): string {
  const condMatch = /:([^_]+)$/.exec(source)
  const cond = condMatch?.[1] ?? 'clinical needs'
  if (kind === 'strong') {
    return source.startsWith('direct_specialty_match')
      ? `Direct specialty match for ${cond}`
      : `Related experience with ${cond}`
  }
  return `No direct specialty match for ${cond}`
}

function humanizeReliability(source: string, kind: 'strong' | 'gap'): string {
  if (source.startsWith('verified_from_')) {
    const match = /from_(\d+)_/.exec(source)
    const n = match?.[1] ?? '?'
    return kind === 'strong'
      ? `Verified reliability across ${n} placements`
      : `Reliability concerns from ${n} placements`
  }
  return kind === 'strong' ? 'Verified track record' : 'Reliability concerns'
}

function humanizeEnvConflict(c: string): string {
  if (c.includes('dogs')) return 'Client has dogs; caregiver prefers not'
  if (c.includes('cats')) return 'Client has cats; caregiver prefers not'
  if (c.includes('smoking')) return 'Smoking household; caregiver prefers not'
  if (c.includes('clutter')) return 'Cluttered home; caregiver prefers organized'
  if (c.includes('hoarding')) return 'Hoarding conditions may not fit'
  if (c.includes('large_family')) return 'Large/active family; caregiver prefers quieter'
  return c.replace(/_/g, ' ')
}

/**
 * Main entry point. Compute a match score between a caregiver and a need.
 * Returns MatchResult — never throws on missing data, only on malformed input.
 */
export function computeMatchScore(
  caregiver: CaregiverWithProvenance,
  need: MatchNeed
): MatchResult {
  const scope = inferScope(need)
  const gates = runGates(caregiver, need)

  // If gates fail, return excluded result (no score).
  if (!gates.passed) {
    return {
      alignment_score: null,
      overall_score: null,
      scope,
      dimensions: buildEmptyDimensions('gates_failed'),
      criteria_aligned: [],
      strong_fits: [],
      criteria_not_aligned: gates.failed.map(f => f.replace(/[_:]/g, ' ')),
      gaps: [],
      unknowns: [],
      gates_passed: false,
      gates_failed: gates.failed,
      disclaimer: ALIGNMENT_DISCLAIMER,
      overall_confidence: null,
      computed_at: new Date().toISOString(),
    }
  }

  // Score each dimension
  const rawDimensions: Record<DimensionKey, DimensionScore> = {
    clinical_fit: scoreClinicalFit(caregiver, need),
    reliability: scoreReliability(caregiver, need),
    logistics_match: scoreLogisticsMatch(caregiver, need),
    personality_compatibility: scorePersonalityCompatibility(caregiver, need, scope),
    cultural_language_fit: scoreCulturalLanguageFit(caregiver, need),
    retention_signal: scoreRetentionSignal(caregiver, need),
    environment_fit: scoreEnvironmentFit(caregiver, need),
  }

  // Renormalize weights across non-null dimensions
  const dimensions = renormalizeWeights(rawDimensions)

  // Compute overall score from renormalized weighted average,
  // multiplied by per-dimension confidence.
  const active = (Object.entries(dimensions) as [DimensionKey, DimensionScore][])
    .filter(([, d]) => d.score !== null)

  let alignment_score: number | null = null
  let overall_confidence: number | null = null

  if (active.length > 0) {
    // Weighted score × confidence sum, normalized by effective weight sum
    let weightedScoreSum = 0
    let effectiveWeightSum = 0
    let confidenceWeightedSum = 0
    let weightSum = 0

    for (const [, d] of active) {
      const effectiveWeight = d.weight_applied * d.confidence_multiplier
      weightedScoreSum += (d.score as number) * effectiveWeight
      effectiveWeightSum += effectiveWeight
      confidenceWeightedSum += d.confidence_multiplier * d.weight_applied
      weightSum += d.weight_applied
    }

    if (effectiveWeightSum > 0) {
      alignment_score = Math.round(weightedScoreSum / effectiveWeightSum)
    }

    if (weightSum > 0) {
      overall_confidence = Math.round((confidenceWeightedSum / weightSum) * 100) / 100
    }
  }

  // Collect unknowns
  const unknowns = (Object.entries(dimensions) as [DimensionKey, DimensionScore][])
    .filter(([, d]) => d.score === null)
    .map(([k]) => k)

  const { criteria_aligned, gaps } = deriveExplanations(dimensions)

  return {
    alignment_score,
    overall_score: alignment_score, // deprecated alias
    scope,
    dimensions,
    criteria_aligned,
    strong_fits: criteria_aligned, // deprecated alias
    criteria_not_aligned: gaps,
    gaps, // deprecated alias
    unknowns,
    gates_passed: true,
    gates_failed: [],
    disclaimer: ALIGNMENT_DISCLAIMER,
    overall_confidence,
    computed_at: new Date().toISOString(),
  }
}

function buildEmptyDimensions(reason: string): Record<DimensionKey, DimensionScore> {
  const empty: DimensionScore = {
    score: null,
    confidence: 'none',
    confidence_multiplier: 0,
    source: reason,
    weight_applied: 0,
    attributes_used: [],
  }
  return {
    clinical_fit: empty,
    reliability: empty,
    logistics_match: empty,
    personality_compatibility: empty,
    cultural_language_fit: empty,
    retention_signal: empty,
    environment_fit: empty,
  }
}
