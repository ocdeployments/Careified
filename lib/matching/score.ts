// lib/matching/score.ts
import type {
  CaregiverForMatching,
  MatchNeed,
  MatchResult,
  MatchScope,
  DimensionScore,
  DimensionKey,
} from './types'
import { BASE_WEIGHTS } from './types'
import { runGates } from './gates'
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
 * Derive strong_fits and gaps from dimension sources.
 * These are human-readable explanations for the UI.
 */
function deriveExplanations(
  dimensions: Record<DimensionKey, DimensionScore>
): { strong_fits: string[]; gaps: string[] } {
  const strong_fits: string[] = []
  const gaps: string[] = []

  const cf = dimensions.clinical_fit
  if (cf.score != null) {
    if (cf.score >= 70) strong_fits.push(humanizeClinical(cf.source, 'strong'))
    else if (cf.score < 40) gaps.push(humanizeClinical(cf.source, 'gap'))
  }

  const rl = dimensions.reliability
  if (rl.score != null && rl.score >= 80) {
    strong_fits.push(humanizeReliability(rl.source, 'strong'))
  } else if (rl.score != null && rl.score < 50) {
    gaps.push(humanizeReliability(rl.source, 'gap'))
  }

  const log = dimensions.logistics_match
  if (log.score != null) {
    if (log.source.includes('same_city')) strong_fits.push('In your service area')
    if (log.source.includes('available_now')) strong_fits.push('Available immediately')
    if (log.source.includes('live_in_capable')) strong_fits.push('Live-in capable')
    if (log.score < 40) gaps.push('Travel or availability constraints')
  }

  const lang = dimensions.cultural_language_fit
  if (lang.score != null && lang.score >= 70) {
    const match = /language:([^|]+)/.exec(lang.source)
    if (match) strong_fits.push(`Speaks ${match[1]}`)
    else if (lang.source.includes('multilingual')) strong_fits.push('Multilingual')
  }

  const env = dimensions.environment_fit
  if (env.score != null && env.score < 60) {
    const conflicts = env.source.split('|').filter(s => s !== 'no_conflicts')
    for (const c of conflicts) gaps.push(humanizeEnvConflict(c))
  }

  const pers = dimensions.personality_compatibility
  if (pers.score != null && pers.score >= 70) {
    strong_fits.push('Personality fit with stated client preferences')
  }

  return {
    strong_fits: Array.from(new Set(strong_fits)).slice(0, 8),
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
  caregiver: CaregiverForMatching,
  need: MatchNeed
): MatchResult {
  const scope = inferScope(need)
  const gates = runGates(caregiver, need)

  // If gates fail, return excluded result (no score).
  if (!gates.passed) {
    return {
      overall_score: null,
      scope,
      dimensions: buildEmptyDimensions('gates_failed'),
      strong_fits: [],
      gaps: gates.failed.map(f => f.replace(/[_:]/g, ' ')),
      unknowns: [],
      gates_passed: false,
      gates_failed: gates.failed,
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

  // Compute overall score from renormalized weighted average
  const active = (Object.entries(dimensions) as [DimensionKey, DimensionScore][])
    .filter(([, d]) => d.score !== null)

  let overall_score: number | null = null
  if (active.length > 0) {
    const weighted = active.reduce(
      (sum, [, d]) => sum + (d.score as number) * d.weight_applied,
      0
    )
    overall_score = Math.round(weighted)
  }

  // Collect unknowns
  const unknowns = (Object.entries(dimensions) as [DimensionKey, DimensionScore][])
    .filter(([, d]) => d.score === null)
    .map(([k]) => k)

  const { strong_fits, gaps } = deriveExplanations(dimensions)

  return {
    overall_score,
    scope,
    dimensions,
    strong_fits,
    gaps,
    unknowns,
    gates_passed: true,
    gates_failed: [],
    computed_at: new Date().toISOString(),
  }
}

function buildEmptyDimensions(reason: string): Record<DimensionKey, DimensionScore> {
  const empty: DimensionScore = {
    score: null,
    confidence: 'none',
    source: reason,
    weight_applied: 0,
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
