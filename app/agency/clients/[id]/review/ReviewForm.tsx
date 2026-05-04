'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type ReviewData = {
  engagement_start: string
  engagement_end: string
  punctuality: number
  reliability: number
  professional_conduct: number
  warmth: number
  dignity: number
  patience: number
  emotional_presence: number
  personal_hygiene: number
  client_hygiene: number
  environment_cleanliness: number
  infection_control: number
  specialty_match: number
  medical_awareness: number
  medication_handling: number
  mobility_safety: number
  comms_agency: number
  comms_family: number
  boundaries: number
  cultural_sensitivity: number
  initiative: boolean
  emotional_support: boolean
  family_communication: boolean
  creative_engagement: boolean
  problem_solving: boolean
  continuity_of_care: boolean
  beyond_call_notes: string
  would_re_engage: boolean
  review_text: string
}

const initialData: ReviewData = {
  engagement_start: '',
  engagement_end: '',
  punctuality: 0,
  reliability: 0,
  professional_conduct: 0,
  warmth: 0,
  dignity: 0,
  patience: 0,
  emotional_presence: 0,
  personal_hygiene: 0,
  client_hygiene: 0,
  environment_cleanliness: 0,
  infection_control: 0,
  specialty_match: 0,
  medical_awareness: 0,
  medication_handling: 0,
  mobility_safety: 0,
  comms_agency: 0,
  comms_family: 0,
  boundaries: 0,
  cultural_sensitivity: 0,
  initiative: false,
  emotional_support: false,
  family_communication: false,
  creative_engagement: false,
  problem_solving: false,
  continuity_of_care: false,
  beyond_call_notes: '',
  would_re_engage: false,
  review_text: '',
}

export default function ReviewForm({ client }: { client: { id: string; client_first_name: string | null; city: string | null; state: string | null; matched_caregiver_id: string | null } }) {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ReviewData>(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField<K extends keyof ReviewData>(field: K, value: ReviewData[K]) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function canProceed(s: number): boolean {
    switch (s) {
      case 1:
        return !!data.engagement_start && !!data.engagement_end
      case 2:
        return data.punctuality > 0 && data.reliability > 0 && data.professional_conduct > 0
      case 3:
        return data.warmth > 0 && data.dignity > 0 && data.patience > 0 && data.emotional_presence > 0
      case 4:
        return data.personal_hygiene > 0 && data.client_hygiene > 0 && data.environment_cleanliness > 0 && data.infection_control > 0
      case 5:
        return data.specialty_match > 0 && data.medical_awareness > 0 && data.medication_handling > 0 && data.mobility_safety > 0
      case 6:
        return data.comms_agency > 0 && data.comms_family > 0 && data.boundaries > 0 && data.cultural_sensitivity > 0
      case 7:
        return true
      case 8:
        return data.would_re_engage !== false
      case 9:
        return true
      default:
        return false
    }
  }

  async function handleSubmit() {
    if (!params.id || !client.matched_caregiver_id) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/agency/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.id,
          caregiverId: client.matched_caregiver_id,
          ...data,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit review')
      }

      router.push(`/agency/clients/${params.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to submit review'
      setError(msg)
      setSubmitting(false)
    }
  }

  const stepTitles: Record<number, string> = {
    1: 'Engagement dates',
    2: 'Professional reliability',
    3: 'Human qualities',
    4: 'Hygiene',
    5: 'Skills match',
    6: 'Communication',
    7: 'Beyond the call',
    8: 'Would re-engage',
    9: 'Review & submit',
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      <Link href={`/agency/clients/${params.id}`} style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
        ← Back to client
      </Link>

      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, color: '#0D1B3E', margin: '16px 0 8px 0' }}>
        Rate placement
      </h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>
        {client.client_first_name || 'Client'} · {client.city}, {client.state}
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <div
            key={n}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: n <= step ? '#C9973A' : '#E2E8F0',
              transition: 'background 200ms',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
        Step {step} of 9: {stepTitles[step]}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Step 1: Dates */}
      {step === 1 && (
        <div style={cardStyle}>
          <p style={{ color: '#64748B', marginBottom: 20 }}>
            When did this placement start and end? These dates are required before you can continue.
          </p>
          <div style={{ display: 'grid', gap: 16 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B3E', marginBottom: 6 }}>Start date *</div>
              <input
                type="date"
                value={data.engagement_start}
                onChange={e => updateField('engagement_start', e.target.value)}
                style={inputStyle}
              />
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B3E', marginBottom: 6 }}>End date *</div>
              <input
                type="date"
                value={data.engagement_end}
                onChange={e => updateField('engagement_end', e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Professional reliability */}
      {step === 2 && (
        <div style={cardStyle}>
          <StarRatingGroup
            label="Punctuality"
            value={data.punctuality}
            onChange={v => updateField('punctuality', v)}
          />
          <StarRatingGroup
            label="Reliability"
            value={data.reliability}
            onChange={v => updateField('reliability', v)}
          />
          <StarRatingGroup
            label="Professional conduct"
            value={data.professional_conduct}
            onChange={v => updateField('professional_conduct', v)}
          />
        </div>
      )}

      {/* Step 3: Human qualities */}
      {step === 3 && (
        <div style={cardStyle}>
          <StarRatingGroup
            label="Warmth"
            value={data.warmth}
            onChange={v => updateField('warmth', v)}
          />
          <StarRatingGroup
            label="Dignity"
            value={data.dignity}
            onChange={v => updateField('dignity', v)}
          />
          <StarRatingGroup
            label="Patience"
            value={data.patience}
            onChange={v => updateField('patience', v)}
          />
          <StarRatingGroup
            label="Emotional presence"
            value={data.emotional_presence}
            onChange={v => updateField('emotional_presence', v)}
          />
        </div>
      )}

      {/* Step 4: Hygiene */}
      {step === 4 && (
        <div style={cardStyle}>
          <StarRatingGroup
            label="Personal hygiene"
            value={data.personal_hygiene}
            onChange={v => updateField('personal_hygiene', v)}
          />
          <StarRatingGroup
            label="Client hygiene support"
            value={data.client_hygiene}
            onChange={v => updateField('client_hygiene', v)}
          />
          <StarRatingGroup
            label="Environment cleanliness"
            value={data.environment_cleanliness}
            onChange={v => updateField('environment_cleanliness', v)}
          />
          <StarRatingGroup
            label="Infection control"
            value={data.infection_control}
            onChange={v => updateField('infection_control', v)}
          />
        </div>
      )}

      {/* Step 5: Skills */}
      {step === 5 && (
        <div style={cardStyle}>
          <StarRatingGroup
            label="Specialty match"
            value={data.specialty_match}
            onChange={v => updateField('specialty_match', v)}
          />
          <StarRatingGroup
            label="Medical awareness"
            value={data.medical_awareness}
            onChange={v => updateField('medical_awareness', v)}
          />
          <StarRatingGroup
            label="Medication handling"
            value={data.medication_handling}
            onChange={v => updateField('medication_handling', v)}
          />
          <StarRatingGroup
            label="Mobility & safety"
            value={data.mobility_safety}
            onChange={v => updateField('mobility_safety', v)}
          />
        </div>
      )}

      {/* Step 6: Communication */}
      {step === 6 && (
        <div style={cardStyle}>
          <StarRatingGroup
            label="Communication with agency"
            value={data.comms_agency}
            onChange={v => updateField('comms_agency', v)}
          />
          <StarRatingGroup
            label="Communication with family"
            value={data.comms_family}
            onChange={v => updateField('comms_family', v)}
          />
          <StarRatingGroup
            label="Boundaries"
            value={data.boundaries}
            onChange={v => updateField('boundaries', v)}
          />
          <StarRatingGroup
            label="Cultural sensitivity"
            value={data.cultural_sensitivity}
            onChange={v => updateField('cultural_sensitivity', v)}
          />
        </div>
      )}

      {/* Step 7: Beyond the call */}
      {step === 7 && (
        <div style={cardStyle}>
          <p style={{ color: '#64748B', marginBottom: 20 }}>
            Did the caregiver go above and beyond? Select all that apply.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            <Toggle
              label="Initiative"
              checked={data.initiative}
              onChange={v => updateField('initiative', v)}
            />
            <Toggle
              label="Emotional support"
              checked={data.emotional_support}
              onChange={v => updateField('emotional_support', v)}
            />
            <Toggle
              label="Family communication"
              checked={data.family_communication}
              onChange={v => updateField('family_communication', v)}
            />
            <Toggle
              label="Creative engagement"
              checked={data.creative_engagement}
              onChange={v => updateField('creative_engagement', v)}
            />
            <Toggle
              label="Problem solving"
              checked={data.problem_solving}
              onChange={v => updateField('problem_solving', v)}
            />
            <Toggle
              label="Continuity of care"
              checked={data.continuity_of_care}
              onChange={v => updateField('continuity_of_care', v)}
            />
          </div>
          <label style={{ marginTop: 20, display: 'block' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B3E', marginBottom: 6 }}>Notes on above and beyond</div>
            <textarea
              value={data.beyond_call_notes}
              onChange={e => updateField('beyond_call_notes', e.target.value)}
              placeholder="Describe any notable examples..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </label>
        </div>
      )}

      {/* Step 8: Would re-engage */}
      {step === 8 && (
        <div style={cardStyle}>
          <p style={{ color: '#64748B', marginBottom: 24, textAlign: 'center' }}>
            Would you engage this caregiver again?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              onClick={() => updateField('would_re_engage', true)}
              style={{
                padding: 32,
                borderRadius: 16,
                border: data.would_re_engage === true ? '2px solid #C9973A' : '2px solid #E2E8F0',
                background: data.would_re_engage === true ? '#FDF6EC' : 'white',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#0D1B3E' }}>Yes</div>
            </button>
            <button
              onClick={() => updateField('would_re_engage', false)}
              style={{
                padding: 32,
                borderRadius: 16,
                border: data.would_re_engage === false ? '2px solid #DC2626' : '2px solid #E2E8F0',
                background: data.would_re_engage === false ? '#FEF2F2' : 'white',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>✗</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#0D1B3E' }}>No</div>
            </button>
          </div>
        </div>
      )}

      {/* Step 9: Review & submit */}
      {step === 9 && (
        <div style={cardStyle}>
          <p style={{ color: '#64748B', marginBottom: 20 }}>
            Add an optional review text (50-500 characters).
          </p>
          <textarea
            value={data.review_text}
            onChange={e => updateField('review_text', e.target.value)}
            placeholder="Share your experience working with this caregiver..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
          />
          {data.review_text.length > 0 && data.review_text.length < 50 && (
            <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
              Minimum 50 characters ({data.review_text.length}/50)
            </div>
          )}
          {data.review_text.length > 500 && (
            <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
              Maximum 500 characters ({data.review_text.length}/500)
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} style={secondaryButtonStyle}>
            Back
          </button>
        ) : (
          <div />
        )}
        {step < 9 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed(step)}
            style={{
              ...primaryButtonStyle,
              opacity: canProceed(step) ? 1 : 0.5,
              cursor: canProceed(step) ? 'pointer' : 'not-allowed',
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || (data.review_text.length > 0 && data.review_text.length < 50)}
            style={{
              ...primaryButtonStyle,
              opacity: submitting || (data.review_text.length > 0 && data.review_text.length < 50) ? 0.5 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        )}
      </div>
    </div>
  )
}

function StarRatingGroup({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B3E', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: n <= value ? '1.5px solid #C9973A' : '1.5px solid #E2E8F0',
              background: n <= value ? '#FDF6EC' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms',
              padding: 0,
            }}
          >
            <StarIcon filled={n <= value} />
          </button>
        ))}
      </div>
    </div>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#C9973A' : 'none'} stroke={filled ? '#C9973A' : '#CBD5E1'} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? '#C9973A' : '#E2E8F0',
          position: 'relative',
          transition: 'background 150ms',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: 'white',
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            transition: 'left 150ms',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        />
      </div>
      <span style={{ fontSize: 14, color: '#0D1B3E' }}>{label}</span>
    </label>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: 24,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1.5px solid #E2E8F0',
  fontSize: 14,
  fontFamily: FONT_SANS,
  outline: 'none',
  transition: 'border-color 150ms',
  boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
  color: '#0D1B3E',
  padding: '14px 28px',
  borderRadius: 10,
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  background: 'white',
  color: '#0D1B3E',
  padding: '14px 28px',
  borderRadius: 10,
  border: '1.5px solid #E2E8F0',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}