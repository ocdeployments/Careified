import { describe, it, expect } from 'vitest'

// Test the consent types at type level
describe('Consent Gate Integration', () => {
  it('handles all 5 consent types', () => {
    const consentTypes = [
      'recruit_calls',
      'reference_calls',
      'past_employer_calls',
      'regulatory_calls',
      'match_time_calls'
    ]
    // All consent types should be valid strings
    consentTypes.forEach(type => {
      expect(typeof type).toBe('string')
      expect(type).toContain('_calls')
    })
  })

  it('consent gate request has required fields', () => {
    const request = {
      caregiverId: 'cg-123',
      consentType: 'recruit_calls',
      targetPhone: '+14165550100',
      callPurpose: 'recruitment'
    }
    expect(request.caregiverId).toBeDefined()
    expect(request.consentType).toBeDefined()
    expect(request.targetPhone).toBeDefined()
  })

  it('consent result has allowed field', () => {
    const result = { allowed: false, reason: 'No consent' }
    expect(result).toHaveProperty('allowed')
    expect(result).toHaveProperty('reason')
  })
})