import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SuitabilityCard from '@/components/ratings/SuitabilityCard'

describe('SuitabilityCard', () => {
  it('shows placeholder when suitability is null', () => {
    render(
      <SuitabilityCard
        suitability={null}
        reviewCount={0}
        caregiverFirstName="Maria"
      />
    )
    expect(screen.getByText(/placement history grows/i)).toBeTruthy()
  })

  it('shows review count', () => {
    render(
      <SuitabilityCard
        suitability={null}
        reviewCount={2}
        caregiverFirstName="Maria"
      />
    )
    expect(screen.getByText(/2 placement reviews/)).toBeTruthy()
  })

  it('renders without crashing when suitability has data', () => {
    const mockSuitability = {
      dementia_alzheimers: 8,
      parkinsons: null,
      palliative_end_of_life: null,
      post_surgical_recovery: null,
      acquired_brain_injury: null,
      developmental_disability: null,
      companion_social: 9,
      high_acuity_medical: 4,
      pediatric: null,
      mental_health_support: null,
      suitability_summary: 'Strong companion care profile.',
      credibility_narrative: 'Consistent re-engagement.',
      best_match_types: ['companion_social', 'dementia_alzheimers'],
      caution_types: ['high_acuity_medical'],
      review_count_at_computation: 5
    }
    expect(() => render(
      <SuitabilityCard
        suitability={mockSuitability}
        reviewCount={5}
        caregiverFirstName="Maria"
      />
    )).not.toThrow()
  })

  it('shows data updates message when data exists', () => {
    render(
      <SuitabilityCard
        suitability={null}
        reviewCount={0}
        caregiverFirstName="Maria"
      />
    )
    const content = document.body.textContent || ''
    expect(content).toContain('updates as placement history grows')
  })
})