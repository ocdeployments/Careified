'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1.5px solid #E2E8F0',
  backgroundColor: 'white',
  fontSize: 13,
  color: '#0D1B3E',
  outline: 'none',
  fontFamily: FONT_SANS,
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#0D1B3E',
  marginBottom: 6,
}

const sectionStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: 32,
  marginBottom: 24,
}

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT_SERIF,
  fontSize: 22,
  color: '#0D1B3E',
  margin: '0 0 24px 0',
}

export default function NewClientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_first_name: '',
    client_age: '',
    primary_condition: '',
    secondary_conditions: [] as string[],
    mobility_level: '',
    medications_complex: false,
    services_needed: [] as string[],
    care_intensity: '',
    placement_type: '',
    hours_per_week: '',
    start_date: '',
    duration_expected: '',
    city: '',
    state: 'TX',
    postal_code: '',
    pets_present: [] as string[],
    smoking_household: false,
    home_condition: '',
    family_dynamics: '',
    language_required: '',
    gender_preference: '',
    personality_desired: [] as string[],
    hourly_rate_max: '',
  })

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleArr<K extends keyof typeof form>(key: K, value: string) {
    const arr = form[key] as unknown as string[]
    const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    setForm(f => ({ ...f, [key]: next as any }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const payload: Record<string, unknown> = { ...form }
    // Clean empty strings
    for (const k of Object.keys(payload)) {
      if (payload[k] === '' || (Array.isArray(payload[k]) && (payload[k] as unknown[]).length === 0)) {
        delete payload[k]
      }
    }
    if (payload.client_age) payload.client_age = Number(payload.client_age)
    if (payload.hours_per_week) payload.hours_per_week = Number(payload.hours_per_week)
    if (payload.hourly_rate_max) payload.hourly_rate_max = Number(payload.hourly_rate_max)

    try {
      const res = await fetch('/api/agency/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create client')
      }
      const data = await res.json()
      router.push(`/agency/clients/${data.client.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setSubmitting(false)
    }
  }

  const canSubmit = form.client_first_name && form.primary_condition && form.city && form.state

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '0 0 8px 0' }}>
        New Client
      </h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>
        The more you tell us, the better the matches.
      </p>

      {/* Basics */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Basics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>First name <span style={{ color: '#EF4444' }}>*</span></label>
            <input style={inputStyle} value={form.client_first_name} onChange={e => setField('client_first_name', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Age</label>
            <input style={inputStyle} type="number" value={form.client_age} onChange={e => setField('client_age', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Medical */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Medical</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Primary condition <span style={{ color: '#EF4444' }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Alzheimer's, Parkinson's, post-surgical recovery" value={form.primary_condition} onChange={e => setField('primary_condition', e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Mobility level</label>
          <select style={inputStyle} value={form.mobility_level} onChange={e => setField('mobility_level', e.target.value)}>
            <option value="">Select...</option>
            <option value="independent">Independent</option>
            <option value="assistance">Needs assistance</option>
            <option value="wheelchair">Wheelchair</option>
            <option value="bedbound">Bedbound</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.medications_complex} onChange={e => setField('medications_complex', e.target.checked)} />
            <span style={{ fontSize: 14, color: '#0D1B3E' }}>Complex medication management required</span>
          </label>
        </div>
      </div>

      {/* Care plan */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Care plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Care intensity</label>
            <select style={inputStyle} value={form.care_intensity} onChange={e => setField('care_intensity', e.target.value)}>
              <option value="">Select...</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Placement type</label>
            <select style={inputStyle} value={form.placement_type} onChange={e => setField('placement_type', e.target.value)}>
              <option value="">Select...</option>
              <option value="Permanent placement">Permanent placement</option>
              <option value="Live-in care">Live-in care</option>
              <option value="Regular part-time">Regular part-time</option>
              <option value="Overnight care">Overnight care</option>
              <option value="Casual / relief shifts">Casual / relief shifts</option>
              <option value="Respite care">Respite care</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Hours per week</label>
            <input style={inputStyle} type="number" value={form.hours_per_week} onChange={e => setField('hours_per_week', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Start date</label>
            <input style={inputStyle} type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Duration expected</label>
            <input style={inputStyle} placeholder="e.g. 6 months, ongoing" value={form.duration_expected} onChange={e => setField('duration_expected', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Location</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>City <span style={{ color: '#EF4444' }}>*</span></label>
            <input style={inputStyle} value={form.city} onChange={e => setField('city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>State <span style={{ color: '#EF4444' }}>*</span></label>
            <input style={inputStyle} value={form.state} onChange={e => setField('state', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Postal code</label>
            <input style={inputStyle} value={form.postal_code} onChange={e => setField('postal_code', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Environment */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Home environment</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Pets present</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['dogs', 'cats', 'other_pets'].map(p => (
              <Pill key={p} label={p.replace('_', ' ')} active={form.pets_present.includes(p)} onClick={() => toggleArr('pets_present', p)} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.smoking_household} onChange={e => setField('smoking_household', e.target.checked)} />
            <span style={{ fontSize: 14, color: '#0D1B3E' }}>Smoking household</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Home condition</label>
            <select style={inputStyle} value={form.home_condition} onChange={e => setField('home_condition', e.target.value)}>
              <option value="">Select...</option>
              <option value="organized">Organized</option>
              <option value="moderate">Moderately tidy</option>
              <option value="cluttered">Cluttered</option>
              <option value="hoarding">Hoarding tendencies</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Family dynamics</label>
            <select style={inputStyle} value={form.family_dynamics} onChange={e => setField('family_dynamics', e.target.value)}>
              <option value="">Select...</option>
              <option value="small">Small/quiet</option>
              <option value="moderate">Moderate</option>
              <option value="large_active">Large and active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Caregiver preferences</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Language required</label>
            <input style={inputStyle} placeholder="e.g. Spanish, Mandarin" value={form.language_required} onChange={e => setField('language_required', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Gender preference</label>
            <select style={inputStyle} value={form.gender_preference} onChange={e => setField('gender_preference', e.target.value)}>
              <option value="">Any</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Client personality traits (optional — improves personality matching)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'Quiet and reflective', 'Chatty and social', 'Strong-willed or stubborn',
              'Gentle and easy-going', 'Anxious or fearful',
              'Formerly professional', 'Creative or artistic', 'Religious or spiritual',
            ].map(t => (
              <Pill key={t} label={t} active={form.personality_desired.includes(t)} onClick={() => toggleArr('personality_desired', t)} />
            ))}
          </div>
        </div>
      </div>

      {/* Rate */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Budget</h2>
        <div style={{ maxWidth: 200 }}>
          <label style={labelStyle}>Max hourly rate (USD)</label>
          <input style={inputStyle} type="number" step="0.01" value={form.hourly_rate_max} onChange={e => setField('hourly_rate_max', e.target.value)} />
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={() => router.push('/agency/clients')}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: '1.5px solid #E2E8F0',
            background: 'white',
            color: '#0D1B3E',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: FONT_SANS,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            border: 'none',
            background: canSubmit && !submitting ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : '#E2E8F0',
            color: '#0D1B3E',
            fontSize: 14,
            fontWeight: 700,
            cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
            fontFamily: FONT_SANS,
          }}
        >
          {submitting ? 'Creating…' : 'Create Client & Find Matches'}
        </button>
      </div>
    </div>
  )
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        padding: '8px 16px',
        borderRadius: 20,
        border: `1.5px solid ${active ? '#C9973A' : '#E2E8F0'}`,
        background: active ? '#C9973A' : 'white',
        color: active ? '#0D1B3E' : '#64748B',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: FONT_SANS,
        textTransform: 'capitalize',
      }}
    >
      {label}
    </button>
  )
}