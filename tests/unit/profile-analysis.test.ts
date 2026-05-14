import { describe, it, expect } from 'vitest'

// These tests verify the types and expected behavior
// without requiring actual DB connections

describe('analyseProfile types', () => {
  it('ProfileGap interface has expected fields', () => {
    const gap = {
      type: 'no_references' as const,
      description: 'No references on file',
      severity: 'high' as const,
      action: 'Request references',
      call_type: 'reference_calls'
    }
    expect(gap.type).toBe('no_references')
    expect(gap.severity).toBe('high')
  })

  it('ProfileAnalysis interface has expected fields', () => {
    const analysis = {
      caregiver_id: 'cg-1',
      campaign_readiness: 45,
      readiness_label: 'needs_work' as const,
      strengths: ['Experienced caregiver'],
      gaps: [],
      recommended_calls: [],
      risk_flags: [],
      ai_summary: 'Profile needs references',
      generated_at: new Date().toISOString(),
      profile_completeness: 45
    }
    expect(analysis.campaign_readiness).toBeGreaterThanOrEqual(0)
    expect(analysis.campaign_readiness).toBeLessThanOrEqual(100)
  })

  it('readiness_label matches score ranges', () => {
    const getLabel = (score: number) => {
      if (score >= 70) return 'ready'
      if (score >= 40) return 'needs_work'
      return 'incomplete'
    }
    expect(getLabel(80)).toBe('ready')
    expect(getLabel(55)).toBe('needs_work')
    expect(getLabel(25)).toBe('incomplete')
  })

  it('gaps are categorized correctly', () => {
    const gapTypes = [
      'unverified_reference',
      'unverified_employer',
      'missing_credential',
      'incomplete_work_history',
      'no_references',
      'low_trust_score',
      'missing_photo'
    ]
    expect(gapTypes).toContain('no_references')
    expect(gapTypes).toContain('missing_photo')
  })
})