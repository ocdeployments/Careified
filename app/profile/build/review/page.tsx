'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SELF_ASSESSMENT_QUESTIONS = {
  professional_reliability_score: {
    question: 'How would you rate your own punctuality and reliability?',
    description: 'How consistently do you arrive on time and follow through on commitments?',
  },
  human_qualities_score: {
    question: 'How do you feel you connect with clients emotionally?',
    description: 'Your warmth, patience, and ability to build rapport with those you care for.',
  },
  personal_care_hygiene_score: {
    question: 'How do you rate your standards of personal care and hygiene?',
    description: 'Your attention to cleanliness, infection control, and environment standards.',
  },
  skills_match_score: {
    question: 'How would you rate your skills and competencies?',
    description: 'Your technical abilities, specialty knowledge, and medical awareness.',
  },
  communication_conduct_score: {
    question: 'How would you rate your communication with families and agencies?',
    description: 'Your ability to communicate clearly, professionally, and appropriately.',
  },
  beyond_the_call_score: {
    question: 'How often do you go above and beyond for clients?',
    description: 'Your initiative, problem-solving, and willingness to help beyond the basics.',
  },
}

interface LastAssessment {
  review_submitted_at: string
}

export default function SelfAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastAssessment, setLastAssessment] = useState<LastAssessment | null>(null)
  const [canSubmit, setCanSubmit] = useState(true)

  // Form state
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
    checkLastAssessment()
  }, [])

  async function checkLastAssessment() {
    try {
      const res = await fetch('/api/reviews/self/last')
      if (res.ok) {
        const data = await res.json()
        setLastAssessment(data.last_assessment)

        if (data.last_assessment) {
          const lastDate = new Date(data.last_assessment.review_submitted_at)
          const now = new Date()
          const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSince < 90) {
            setCanSubmit(false)
          }
        }
      }
    } catch (err) {
      console.error('Failed to check last assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleScoreChange(field: string, value: number) {
    setScores(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (wouldReengage === null) {
      setError('Please answer the re-engagement question')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews/self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_start_date: new Date().toISOString().split('T')[0],
          ...scores,
          beyond_the_call_score: scores.beyond_the_call_score,
          would_reengage: wouldReengage,
          positive_feedback: positiveFeedback || undefined,
          improvement_feedback: improvementFeedback || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to submit self-assessment')
        return
      }

      setSuccess(data.message || 'Self-assessment submitted. Your profile will update within minutes.')
      setTimeout(() => {
        router.push('/profile/build')
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
      <span style={{ color: '#C9973A', fontSize: '16px' }}>
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#0D1B3E', marginBottom: '8px' }}>
        Self-Assessment
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Reflect on your placement experiences to build your reputation profile.
      </p>

      {/* Ceiling banner */}
      <div style={{
        background: '#FEF3C7',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        borderLeft: '4px solid #B45309',
      }}>
        <p style={{ margin: 0, color: '#92400E', fontSize: '14px' }}>
          <strong>Your self-assessment contributes to your profile score.</strong> Agency placements unlock your full score potential — self-assessment alone reaches a maximum of 4.0.
        </p>
      </div>

      {!canSubmit && lastAssessment && (
        <div style={{
          background: '#FEE2E2',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: 0, color: '#991B1B' }}>
            Your last self-assessment was {new Date(lastAssessment.review_submitted_at).toLocaleDateString()}. You can update in {Math.ceil(90 - (new Date().getTime() - new Date(lastAssessment.review_submitted_at).getTime()) / (1000 * 60 * 60 * 24))} days.
          </p>
        </div>
      )}

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
        {/* Self-reflection questions */}
        {Object.entries(SELF_ASSESSMENT_QUESTIONS).map(([field, { question, description }]) => (
          <div key={field} style={{ background: '#F9FAFB', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <label style={{ fontWeight: '600', color: '#0D1B3E' }}>{question}</label>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>{description}</p>
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
              disabled={!canSubmit}
              style={{
                width: '100%',
                accentColor: '#C9973A',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
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
            Would you re-engage with yourself as a caregiver? *
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setWouldReengage(true)}
              disabled={!canSubmit}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid',
                borderRadius: '8px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: wouldReengage === true ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : 'white',
                borderColor: wouldReengage === true ? '#C9973A' : '#E2E8F0',
                color: wouldReengage === true ? '#0D1B3E' : '#666',
                opacity: canSubmit ? 1 : 0.7,
              }}
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setWouldReengage(false)}
              disabled={!canSubmit}
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid',
                borderRadius: '8px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: wouldReengage === false ? '#FEE2E2' : 'white',
                borderColor: wouldReengage === false ? '#EF4444' : '#E2E8F0',
                color: wouldReengage === false ? '#991B1B' : '#666',
                opacity: canSubmit ? 1 : 0.7,
              }}
            >
              NO
            </button>
          </div>
        </div>

        {/* Optional feedback */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
            What strengths do you bring to your work? (optional)
          </label>
          <textarea
            value={positiveFeedback}
            onChange={(e) => setPositiveFeedback(e.target.value.slice(0, 500))}
            disabled={!canSubmit}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical',
              opacity: canSubmit ? 1 : 0.7,
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0D1B3E' }}>
            What areas are you working to improve? (optional)
          </label>
          <textarea
            value={improvementFeedback}
            onChange={(e) => setImprovementFeedback(e.target.value.slice(0, 500))}
            disabled={!canSubmit}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical',
              opacity: canSubmit ? 1 : 0.7,
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            background: canSubmit ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : '#E5E7EB',
            color: canSubmit ? '#0D1B3E' : '#9CA3AF',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
            opacity: submitting || !canSubmit ? 0.7 : 1,
          }}
        >
          {submitting ? 'Submitting...' : canSubmit ? 'Submit Self-Assessment' : 'Assessment Pending'}
        </button>
      </form>
    </div>
  )
}