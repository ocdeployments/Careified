'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
}

const CATEGORY_LABELS = {
  professional_reliability_score: {
    label: 'Professional Reliability',
    description: 'Punctuality, consistency, follows through on commitments',
  },
  human_qualities_score: {
    label: 'Human Qualities',
    description: 'Warmth, dignity, patience, emotional presence',
  },
  personal_care_hygiene_score: {
    label: 'Personal Care & Hygiene',
    description: 'Standards of care, hygiene, environment cleanliness',
  },
  skills_match_score: {
    label: 'Skills Match',
    description: 'Competency, specialty skills, medical awareness',
  },
  communication_conduct_score: {
    label: 'Communication & Conduct',
    description: 'Communication with agency, family, professional boundaries',
  },
  beyond_the_call_score: {
    label: 'Beyond the Call',
    description: 'Initiative, problem solving, going above expectations',
  },
}

export default function NewReviewPage() {
  const router = useRouter()
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [placementStart, setPlacementStart] = useState('')
  const [placementEnd, setPlacementEnd] = useState('')
  const [scores, setScores] = useState({
    professional_reliability_score: 3,
    human_qualities_score: 3,
    personal_care_hygiene_score: 3,
    skills_match_score: 3,
    communication_conduct_score: 3,
    beyond_the_call_score: 3,
  })
  const [wouldReengage, setWouldReengage] = useState<boolean | null>(null)
  const [positiveFeedback, setPositiveFeedback] = useState('')
  const [improvementFeedback, setImprovementFeedback] = useState('')

  useEffect(() => {
    fetchRosteredCaregivers()
  }, [])

  async function fetchRosteredCaregivers() {
    try {
      const res = await fetch('/api/roster/list')
      if (res.ok) {
        const data = await res.json()
        setCaregivers(data.caregivers || [])
      }
    } catch (err) {
      console.error('Failed to fetch caregivers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCaregivers = caregivers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleSelectCaregiver(caregiver: Caregiver) {
    setSelectedCaregiver(caregiver.id)
    setSearchQuery(`${caregiver.first_name} ${caregiver.last_name}`)
    setShowDropdown(false)
  }

  function handleScoreChange(field: string, value: number) {
    setScores(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCaregiver) {
      setError('Please select a caregiver')
      return
    }

    if (!placementStart) {
      setError('Please enter the placement start date')
      return
    }

    if (wouldReengage === null) {
      setError('Please indicate if you would re-engage this caregiver')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiver_id: selectedCaregiver,
          placement_start_date: placementStart,
          placement_end_date: placementEnd || undefined,
          ...scores,
          beyond_the_call_score: scores.beyond_the_call_score,
          would_reengage: wouldReengage,
          positive_feedback: positiveFeedback || undefined,
          improvement_feedback: improvementFeedback || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to submit rating')
        return
      }

      setSuccess(data.message || 'Rating submitted successfully')
      setTimeout(() => {
        router.push('/agency/roster')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function renderStarDisplay(value: number) {
    const fullStars = Math.floor(value)
    const hasHalf = (value % 1) >= 0.5
    return (
      <span style={{ color: '#C9973A', fontSize: '18px' }}>
        {'★'.repeat(fullStars)}
        {hasHalf ? '⯪' : ''}
        {'☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </span>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#0D1B3E', marginBottom: '8px' }}>
        Rate a placement
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Share your experience with this caregiver to help build their reputation.
      </p>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Caregiver Search/Select */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
            Select Caregiver *
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
              setSelectedCaregiver('')
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Type to search your rostered caregivers..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {showDropdown && filteredCaregivers.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              {filteredCaregivers.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCaregiver(c)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F4F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  {c.first_name} {c.last_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placement Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
              Placement Start Date *
            </label>
            <input
              type="date"
              value={placementStart}
              onChange={(e) => setPlacementStart(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
              Placement End Date
            </label>
            <input
              type="date"
              value={placementEnd}
              onChange={(e) => setPlacementEnd(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
        </div>

        {/* Score Sliders */}
        {Object.entries(CATEGORY_LABELS).map(([field, { label, description }]) => (
          <div key={field} style={{ background: '#F9FAFB', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <label style={{ fontWeight: '600', color: '#0D1B3E' }}>{label}</label>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{renderStarDisplay(scores[field as keyof typeof scores])}</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#0D1B3E' }}>
                  {scores[field as keyof typeof scores]}
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={scores[field as keyof typeof scores]}
              onChange={(e) => handleScoreChange(field, parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#C9973A',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
              <span>0</span>
              <span>5</span>
            </div>
          </div>
        ))}

        {/* Would Re-engage */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', color: '#0D1B3E' }}>
            Would you re-engage this caregiver? *
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setWouldReengage(true)}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid',
                borderRadius: '8px',
                cursor: 'pointer',
                background: wouldReengage === true ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : 'white',
                borderColor: wouldReengage === true ? '#C9973A' : '#E2E8F0',
                color: wouldReengage === true ? '#0D1B3E' : '#666',
                transition: 'all 0.2s',
              }}
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setWouldReengage(false)}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid',
                borderRadius: '8px',
                cursor: 'pointer',
                background: wouldReengage === false ? '#FEE2E2' : 'white',
                borderColor: wouldReengage === false ? '#EF4444' : '#E2E8F0',
                color: wouldReengage === false ? '#991B1B' : '#666',
                transition: 'all 0.2s',
              }}
            >
              NO
            </button>
          </div>
        </div>

        {/* Positive Feedback */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
            What stood out? (optional)
          </label>
          <textarea
            value={positiveFeedback}
            onChange={(e) => setPositiveFeedback(e.target.value.slice(0, 500))}
            placeholder="Share specific qualities or moments that made this caregiver exceptional..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical',
            }}
          />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{positiveFeedback.length}/500</p>
        </div>

        {/* Improvement Feedback */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
            What could improve? (optional)
          </label>
          <textarea
            value={improvementFeedback}
            onChange={(e) => setImprovementFeedback(e.target.value.slice(0, 500))}
            placeholder="Areas where the caregiver could grow or develop..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical',
            }}
          />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{improvementFeedback.length}/500</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
            This feedback is private to your agency and Careified admin. It is not shown publicly.
          </p>
        </div>

        {/* Non-recommender disclaimer */}
        <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #B45309' }}>
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px' }}>
            This rating will be displayed as reported by your agency. Careified does not verify ratings or endorse any caregiver.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  )
}