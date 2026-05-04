'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type ReviewData = {
  id: string
  agency_name: string
  engagement_start: string
  engagement_end: string
  status: string
  dispute_deadline: string
  punctuality: number
  reliability: number
  warmth: number
  dignity: number
}

export default function DisputeForm({ review }: { review: ReviewData }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!reason.trim() || reason.length < 50) {
      setError('Please provide at least 50 characters explaining your dispute')
      return
    }
    if (reason.length > 500) {
      setError('Reason must be 500 characters or less')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/caregiver/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: review.id, reason }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit dispute')
      }

      router.push('/profile/strength')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to submit dispute'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      <Link href="/profile/strength" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
        ← Back to profile strength
      </Link>

      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, color: '#0D1B3E', margin: '16px 0 8px 0' }}>
        Dispute this review
      </h1>

      {/* Review summary */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0D1B3E' }}>{review.agency_name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {review.engagement_start?.slice(0, 10)} — {review.engagement_end?.slice(0, 10)}
            </div>
          </div>
          <div style={{
            background: '#FEF3C7',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            color: '#D97706',
          }}>
            Pending Review
          </div>
        </div>

        {/* Ratings received */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          <RatingBox label="Punctuality" value={review.punctuality} />
          <RatingBox label="Reliability" value={review.reliability} />
          <RatingBox label="Warmth" value={review.warmth} />
          <RatingBox label="Dignity" value={review.dignity} />
        </div>

        <div style={{ fontSize: 11, color: '#94A3B8' }}>
          Dispute deadline: {review.dispute_deadline?.slice(0, 10)}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ background: '#F7F4F0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B3E', marginBottom: 8 }}>
          How disputes work
        </div>
        <ul style={{ fontSize: 12, color: '#64748B', margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
          <li>You have 14 days from when the review was submitted to dispute it</li>
          <li>Provide a clear explanation of what you disagree with</li>
          <li>The agency will be notified and can respond or update the review</li>
          <li>If unresolved, an admin will review your dispute</li>
        </ul>
      </div>

      {/* Form */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24 }}>
        <label>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B3E', marginBottom: 8 }}>
            Why are you disputing this review?
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Provide specific details about what you disagree with and why..."
            rows={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              fontSize: 14,
              fontFamily: FONT_SANS,
              outline: 'none',
              resize: 'vertical',
              minHeight: 120,
              boxSizing: 'border-box',
            }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: reason.length < 50 ? '#DC2626' : '#64748B' }}>
            {reason.length}/500 characters (minimum 50)
          </span>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: 12, borderRadius: 8, marginTop: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link
            href="/profile/strength"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              background: 'white',
              color: '#64748B',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || reason.length < 50}
            style={{
              flex: 1,
              padding: '14px 28px',
              borderRadius: 10,
              border: 'none',
              background: reason.length < 50 ? '#E2E8F0' : 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: reason.length < 50 ? '#94A3B8' : '#0D1B3E',
              fontSize: 14,
              fontWeight: 600,
              cursor: reason.length < 50 ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RatingBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#F7F4F0', borderRadius: 8, padding: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B3E' }}>{value || '—'}</div>
      <div style={{ fontSize: 10, color: '#64748B' }}>{label}</div>
    </div>
  )
}