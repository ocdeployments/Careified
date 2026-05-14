// Trust score computation engine for Careified rating system
// Pure math - no LLM calls

export interface PlacementReview {
  professional_reliability_score: number | null
  human_qualities_score: number | null
  personal_care_hygiene_score: number | null
  beyond_the_call_score: number | null
  skills_match_score: number | null
  communication_conduct_score: number | null
  would_reengage: boolean | null
  reviewer_type: 'caregiver' | 'system' | 'agency' | 'admin'
  status: string
}

export interface TrustScoreResult {
  aggregate_score: number | null
  dimension_scores: {
    professional_reliability: number | null
    human_qualities: number | null
    personal_care_hygiene: number | null
    beyond_the_call: number | null
    skills_match: number | null
    communication_conduct: number | null
  }
  source_breakdown: {
    self_count: number
    agency_count: number
    system_count: number
    admin_count: number
  }
  would_reengage_rate: number
  ceiling: 4.0 | 5.0
  review_count: number
  confidence: 'low' | 'medium' | 'high'
}

// Source weights per RATING_SYSTEM.md §2
const SOURCE_WEIGHTS = {
  caregiver: 0.15,
  system: 0.25,
  agency: 0.45,
  admin: 0.15,
}

// Category weights per spec
const CATEGORY_WEIGHTS = {
  professional_reliability: 0.30,
  human_qualities: 0.25,
  personal_care_hygiene: 0.20,
  skills_match: 0.15,
  communication_conduct: 0.10,
}

/**
 * Compute weighted trust score from placement reviews
 *
 * TEST CASES (inline):
 *
 * Test 1: Self-only, 2 reviews
 * - Review 1: agency=4.0, self=3.5, reviewer_type='caregiver'
 * - Review 2: agency=4.5, self=4.0, reviewer_type='caregiver'
 * Expected: aggregate_score caps at 4.0 (self-only ceiling)
 *
 * Test 2: Agency + self, 5 reviews
 * - 2 agency reviews (4.5, 5.0), 3 self reviews (3.5, 4.0, 4.0)
 * Expected: aggregate_score can reach up to 5.0
 *
 * Test 3: All nulls
 * - Reviews exist but all scores are null
 * Expected: aggregate_score: null (not 0)
 */
export function computeTrustScore(reviews: PlacementReview[]): TrustScoreResult {
  // Filter to approved reviews only
  const approvedReviews = reviews.filter(r => r.status === 'approved')

  if (approvedReviews.length === 0) {
    return {
      aggregate_score: null,
      dimension_scores: {
        professional_reliability: null,
        human_qualities: null,
        personal_care_hygiene: null,
        beyond_the_call: null,
        skills_match: null,
        communication_conduct: null,
      },
      source_breakdown: { self_count: 0, agency_count: 0, system_count: 0, admin_count: 0 },
      would_reengage_rate: 0,
      ceiling: 4.0,
      review_count: 0,
      confidence: 'low',
    }
  }

  // Count sources
  const sourceCounts = {
    self_count: approvedReviews.filter(r => r.reviewer_type === 'caregiver').length,
    agency_count: approvedReviews.filter(r => r.reviewer_type === 'agency').length,
    system_count: approvedReviews.filter(r => r.reviewer_type === 'system').length,
    admin_count: approvedReviews.filter(r => r.reviewer_type === 'admin').length,
  }

  // Calculate would_reengage_rate
  const reengageYes = approvedReviews.filter(r => r.would_reengage === true).length
  const would_reengage_rate = approvedReviews.length > 0
    ? reengageYes / approvedReviews.length
    : 0

  // Determine ceiling: 4.0 if no agency reviews, 5.0 if has agency reviews
  const ceiling: 4.0 | 5.0 = sourceCounts.agency_count > 0 ? 5.0 : 4.0

  // Calculate confidence
  let confidence: 'low' | 'medium' | 'high' = 'low'
  if (approvedReviews.length >= 10) confidence = 'high'
  else if (approvedReviews.length >= 3) confidence = 'medium'

  // Calculate dimension scores with source weighting
  const dimensions = [
    'professional_reliability',
    'human_qualities',
    'personal_care_hygiene',
    'beyond_the_call',
    'skills_match',
    'communication_conduct',
  ] as const

  const dimensionScores: Record<string, number | null> = {}

  for (const dim of dimensions) {
    const dbField = `${dim}_score` as keyof PlacementReview

    // Get all scores for this dimension across all reviews
    const scoresWithWeight = approvedReviews.map(review => {
      const score = review[dbField] as number | null
      if (score === null) return null

      const weight = SOURCE_WEIGHTS[review.reviewer_type as keyof typeof SOURCE_WEIGHTS] || 0
      return { score, weight }
    }).filter(s => s !== null)

    if (scoresWithWeight.length === 0) {
      dimensionScores[dim] = null
    } else {
      // Weighted average
      const totalWeight = scoresWithWeight.reduce((sum, s) => sum + s.weight, 0)
      const weightedSum = scoresWithWeight.reduce((sum, s) => sum + (s.score * s.weight), 0)
      dimensionScores[dim] = weightedSum / totalWeight
    }
  }

  // Calculate aggregate score from weighted dimensions
  // Honest null: exclude null categories from weighted average
  let aggregateScore: number | null = null

  const validDimensionScores: Array<{ dim: string; score: number }> = []
  for (const dim of dimensions) {
    const score = dimensionScores[dim]
    if (score !== null) {
      validDimensionScores.push({ dim, score })
    }
  }

  if (validDimensionScores.length > 0) {
    // Calculate weighted average of dimensions
    let totalWeight = 0
    let weightedSum = 0

    for (const { dim, score } of validDimensionScores) {
      const weight = CATEGORY_WEIGHTS[dim as keyof typeof CATEGORY_WEIGHTS] || 0
      weightedSum += score * weight
      totalWeight += weight
    }

    aggregateScore = totalWeight > 0 ? weightedSum / totalWeight : null

    // Add beyond_the_call bonus (up to 0.3 points)
    const beyondScore = dimensionScores.beyond_the_call
    if (beyondScore !== null && beyondScore >= 4.0) {
      const bonus = Math.min((beyondScore - 3.0) * 0.15, 0.3)
      aggregateScore = Math.min((aggregateScore || 0) + bonus, ceiling)
    }

    // Apply ceiling
    if (aggregateScore !== null) {
      aggregateScore = Math.min(aggregateScore, ceiling)
      aggregateScore = Math.round(aggregateScore * 10) / 10 // One decimal place
    }
  }

  return {
    aggregate_score: aggregateScore,
    dimension_scores: {
      professional_reliability: dimensionScores.professional_reliability,
      human_qualities: dimensionScores.human_qualities,
      personal_care_hygiene: dimensionScores.personal_care_hygiene,
      beyond_the_call: dimensionScores.beyond_the_call,
      skills_match: dimensionScores.skills_match,
      communication_conduct: dimensionScores.communication_conduct,
    },
    source_breakdown: sourceCounts,
    would_reengage_rate,
    ceiling,
    review_count: approvedReviews.length,
    confidence,
  }
}