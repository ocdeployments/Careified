'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  slate: '#64748B',
  border: '#E2E8F0',
  red: '#DC2626',
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  direct_supervisor: 'Direct supervisor',
  agency_coordinator: 'Agency coordinator',
  colleague: 'Colleague',
  client_family: 'Client or family member',
  other: 'Other',
}

export default function ReferenceResponsePage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [wouldRehire, setWouldRehire] = useState('')
  const [reliabilityRating, setReliabilityRating] = useState(0)
  const [professionalismRating, setProfessionalismRating] = useState(0)
  const [yearsKnown, setYearsKnown] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetch(`/api/references/respond?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        if (data.request.status === 'completed') { setSubmitted(true) }
        setRequest(data.request)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load request'); setLoading(false) })
  }, [token])

  const handleSubmit = async () => {
    if (!wouldRehire || !reliabilityRating || !professionalismRating) {
      setError('Please answer all required questions')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/references/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, wouldRehire, reliabilityRating, professionalismRating, comment, yearsKnown }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Submission failed'); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '8px' }}>
        {label} <span style={{ color: COLORS.red }}>*</span>
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n} type="button" onClick={() => onChange(n)}
            style={{
              width: '44px', height: '44px', borderRadius: '8px', fontSize: '18px',
              border: value >= n ? 'none' : '1px solid ' + COLORS.border,
              background: value >= n ? COLORS.gold : 'white',
              color: value >= n ? COLORS.navy : '#94A3B8',
              cursor: 'pointer', fontWeight: 700,
            }}
          >
            {n}
          </button>
        ))}
        <span style={{ fontSize: '12px', color: COLORS.slate, alignSelf: 'center', marginLeft: '8px' }}>
          {value === 0 ? 'Not rated' : value === 5 ? 'Excellent' : value === 4 ? 'Strong' : value === 3 ? 'Acceptable' : value === 2 ? 'Below standard' : 'Poor'}
        </span>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: COLORS.slate }}>Loading...</p>
    </div>
  )

  if (error && !request) return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.navy, marginBottom: '12px' }}>Link not found</div>
        <p style={{ color: COLORS.slate, fontSize: '14px' }}>This verification link is invalid or has expired.</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0FDF4', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', color: '#16A34A' }}>✓</div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: COLORS.navy, marginBottom: '12px' }}>Thank you</div>
        <p style={{ fontSize: '14px', color: COLORS.slate, lineHeight: 1.6 }}>
          Your reference has been recorded and attached to {request?.first_name}&apos;s profile on Careified.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: COLORS.navy, borderRadius: '16px 16px 0 0', padding: '32px', color: 'white', marginBottom: '0' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Careified — Reference Verification
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            {request?.first_name} {request?.last_name} listed you as a reference
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
            This takes about 4 minutes. Your response is attached directly to their caregiver profile and shared only with agencies they apply to.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '0 0 16px 16px', padding: '32px', border: '1px solid ' + COLORS.border, borderTop: 'none' }}>

          <div style={{ marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '4px' }}>You are listed as</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: COLORS.navy }}>
              {RELATIONSHIP_LABELS[request?.relationship] || request?.relationship}
            </div>
          </div>

          {/* Years known */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '8px' }}>
              How long have you known {request?.first_name} professionally?
            </label>
            <select
              value={yearsKnown}
              onChange={e => setYearsKnown(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + COLORS.border, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            >
              <option value="">Select...</option>
              <option value="lt1">Less than 1 year</option>
              <option value="1-2">1–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Would rehire */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '8px' }}>
              Would you hire or work with {request?.first_name} again? <span style={{ color: COLORS.red }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { value: 'yes', label: 'Yes, without hesitation', color: '#16A34A', bg: '#F0FDF4' },
                { value: 'yes_reservations', label: 'Yes, with some reservations', color: '#D97706', bg: '#FFFBEB' },
                { value: 'no', label: 'No', color: COLORS.red, bg: '#FEF2F2' },
              ].map(opt => (
                <button
                  key={opt.value} type="button" onClick={() => setWouldRehire(opt.value)}
                  style={{
                    padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    border: wouldRehire === opt.value ? `2px solid ${opt.color}` : '1px solid ' + COLORS.border,
                    background: wouldRehire === opt.value ? opt.bg : 'white',
                    color: wouldRehire === opt.value ? opt.color : COLORS.slate,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <StarRating value={reliabilityRating} onChange={setReliabilityRating} label={`How would you rate ${request?.first_name}'s reliability and dependability?`} />
          <StarRating value={professionalismRating} onChange={setProfessionalismRating} label={`How would you rate ${request?.first_name}'s professionalism and conduct?`} />

          {/* Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '8px' }}>
              Anything you would like agencies to know about working with {request?.first_name}? (optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Brief comment about their work ethic, strengths, or anything relevant..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + COLORS.border, borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            />
            <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>{comment.length}/400</div>
          </div>

          {error && (
            <div style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', color: COLORS.red, marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="button" onClick={handleSubmit} disabled={submitting}
            style={{
              width: '100%', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 700,
              border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              background: submitting ? '#94A3B8' : COLORS.navy, color: 'white',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit reference'}
          </button>

          <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
            Your response is timestamped and stored securely. It is shared only with agencies that {request?.first_name} applies to.
          </p>
        </div>
      </div>
    </div>
  )
}
