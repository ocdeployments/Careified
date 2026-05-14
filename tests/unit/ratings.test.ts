import { describe, it, expect } from 'vitest'
import { computeTrustScore, type TrustScoreResult, type PlacementReview } from '@/lib/ratings/compute-trust-score'
import { computeSuitabilityScores } from '@/lib/ratings/compute-suitability'

describe('computeTrustScore', () => {
  it('self-only reviews cap at 4.0', () => {
    const reviews: PlacementReview[] = [{
      reviewer_type: 'caregiver',
      professional_reliability_score: 5,
      human_qualities_score: 5,
      personal_care_hygiene_score: 5,
      beyond_the_call_score: 5,
      skills_match_score: 5,
      communication_conduct_score: 5,
      would_reengage: true,
      status: 'approved'
    }]
    const result = computeTrustScore(reviews)
    expect(result.ceiling).toBe(4.0)
    expect(result.aggregate_score).toBeLessThanOrEqual(4.0)
    expect(result.confidence).toBe('low')
  })

  it('agency reviews unlock ceiling of 5.0', () => {
    const reviews: PlacementReview[] = [{
      reviewer_type: 'agency',
      professional_reliability_score: 5,
      human_qualities_score: 5,
      personal_care_hygiene_score: 5,
      beyond_the_call_score: 5,
      skills_match_score: 5,
      communication_conduct_score: 5,
      would_reengage: true,
      status: 'approved'
    }]
    const result = computeTrustScore(reviews)
    expect(result.ceiling).toBe(5.0)
  })

  it('null scores do not crash or return 0', () => {
    const reviews: PlacementReview[] = [{
      reviewer_type: 'caregiver',
      professional_reliability_score: null,
      human_qualities_score: null,
      personal_care_hygiene_score: null,
      beyond_the_call_score: null,
      skills_match_score: null,
      communication_conduct_score: null,
      would_reengage: null,
      status: 'approved'
    }]
    expect(() => computeTrustScore(reviews)).not.toThrow()
    const result = computeTrustScore(reviews)
    expect(result).not.toBeNull()
    expect(result.aggregate_score).not.toBe(0)
  })

  it('returns proper shape', () => {
    const reviews: PlacementReview[] = [{
      reviewer_type: 'agency',
      professional_reliability_score: 4,
      human_qualities_score: 4,
      personal_care_hygiene_score: 4,
      skills_match_score: 4,
      communication_conduct_score: 4,
      beyond_the_call_score: 5,
      would_reengage: true,
      status: 'approved'
    }]
    const result = computeTrustScore(reviews)
    expect(result).toHaveProperty('aggregate_score')
    expect(result).toHaveProperty('dimension_scores')
    expect(result).toHaveProperty('source_breakdown')
    expect(result).toHaveProperty('ceiling')
    expect(result).toHaveProperty('confidence')
  })
})

describe('computeSuitabilityScores', () => {
  const baseTrustScore: TrustScoreResult = {
    dimension_scores: {
      professional_reliability: 4,
      human_qualities: 4,
      personal_care_hygiene: 3,
      beyond_the_call: 3,
      skills_match: 3,
      communication_conduct: 3
    },
    aggregate_score: 3.8,
    ceiling: 5.0,
    confidence: 'medium',
    would_reengage_rate: 0.8,
    review_count: 5,
    source_breakdown: { self_count: 0, agency_count: 5,
      system_count: 0, admin_count: 0 }
  }

  it('all scores between 0 and 10', () => {
    const result = computeSuitabilityScores(baseTrustScore, {
      specializations: ['Dementia'],
      diagnosisExperience: ['Dementia/Alzheimers'],
      adlsPerformed: ['Bathing', 'Dressing'],
      yearsExperience: 5
    })
    Object.values(result).forEach(score => {
      if (typeof score === 'number') {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(10)
      }
    })
  })

  it('dementia specialization adds bonus', () => {
    const withSpec = computeSuitabilityScores(baseTrustScore, {
      specializations: ['Dementia'],
      diagnosisExperience: ['Dementia/Alzheimers'],
      adlsPerformed: [], yearsExperience: 3
    })
    const withoutSpec = computeSuitabilityScores(baseTrustScore, {
      specializations: [],
      diagnosisExperience: [],
      adlsPerformed: [], yearsExperience: 3
    })
    expect(withSpec.dementia_alzheimers)
      .toBeGreaterThan(withoutSpec.dementia_alzheimers)
  })
})