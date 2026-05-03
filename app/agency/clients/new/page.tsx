'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
}

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
  margin: '0 0 4px 0',
}

const sectionSubtitle: React.CSSProperties = {
  fontSize: 13,
  color: '#64748B',
  marginBottom: 24,
}

const DIAGNOSES = [
  "Alzheimer's/Dementia", "Parkinson's", 'Stroke Recovery', 'Diabetes',
  'Mobility/Fall Risk', 'Hospice/Palliative', 'Post-Surgical',
  'Incontinence Care', 'Mental Health', 'Spinal Cord Injury',
  'Developmental Disability', 'Pediatric/Special Needs'
]

const ADLS = [
  'Bathing', 'Dressing', 'Grooming', 'Toileting', 'Incontinence care',
  'Transfers (bed/chair)', 'Ambulation/walking', 'Feeding', 'Meal preparation',
  'Medication reminders', 'Repositioning', 'Range of motion',
  'Wound care observation', 'Oxygen monitoring', 'Hoyer lift operation',
  'Gait belt use', 'Two-person transfers', 'Catheter care'
]

const ADL_LEVELS = [
  { value: 'standby', label: 'Standby' },
  { value: 'partial', label: 'Partial' },
  { value: 'total', label: 'Total' },
]

const BEHAVIOURS = [
  'Wandering', 'Sundowning', 'Agitation', 'Verbal aggression',
  'Refusal of care', 'Confusion/disorientation', 'Depression/withdrawal',
  'Anxiety', 'Physical aggression', 'Night waking'
]

const EQUIPMENT = [
  'Hoyer lift', 'Gait belt', 'Hospital bed', 'Wheelchair',
  'Oxygen equipment', 'Catheter', 'Feeding tube', 'Shower bench',
  'Walker/cane', 'CPAP', 'Wound care supplies'
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHIFTS = [
  { key: 'morning', label: 'Morning 6am–12pm' },
  { key: 'afternoon', label: 'Afternoon 12pm–6pm' },
  { key: 'evening', label: 'Evening 6pm–11pm' },
  { key: 'overnight', label: 'Overnight 11pm–6am' },
]

const PERSONALITY_TRAITS = [
  'Quiet and reflective', 'Chatty and social', 'Strong-willed',
  'Gentle and easy-going', 'Anxious or fearful',
  'Formerly professional', 'Creative or artistic', 'Religious or spiritual',
  'Resistant to care', 'Memory loss - gentle reminders needed',
]

export default function NewClientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consentsLoaded, setConsentsLoaded] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [acknowledgedPlatform, setAcknowledgedPlatform] = useState(false)
  const [acknowledgedEmployer, setAcknowledgedEmployer] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)

  useEffect(() => {
    fetch('/api/agency/consent-status')
      .then(r => r.json())
      .then(d => {
        if (!d.has_agency_platform_role || !d.has_agency_employer_responsibility) {
          setShowConsentModal(true)
        }
        setConsentsLoaded(true)
      })
      .catch(() => setConsentsLoaded(true))
  }, [])

  const [form, setForm] = useState({
    client_first_name: '',
    client_age: '',
    primary_condition: '',
    secondary_conditions: [] as string[],
    cognitive_status: '',
    communication_status: '',
    mobility_level: '',
    medications_complex: false,
    behaviours: [] as string[],
    equipment_in_home: [] as string[],
    adls_needed: {} as Record<string, string>,
    services_needed: [] as string[],
    care_intensity: '',
    placement_type: '',
    hours_per_week: '',
    schedule_grid: {} as Record<string, boolean>,
    start_date: '',
    duration_expected: '',
    city: '',
    state: 'TX',
    postal_code: '',
    pets_present: [] as string[],
    smoking_household: false,
    home_condition: '',
    family_dynamics: '',
    family_involvement: '',
    language_required: '',
    gender_preference: '',
    cultural_preference: '',
    personality_desired: [] as string[],
    caregiver_personality_preference: '',
    continuity_preference: '',
    communication_frequency: '',
    hourly_rate_max: '',
    background_check_required: '',
    client_data_authorization: false,
  })

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleArr<K extends keyof typeof form>(key: K, value: string) {
    const arr = form[key] as unknown as string[]
    const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    setForm(f => ({ ...f, [key]: next as any }))
  }

  function toggleADL(adl: string) {
    const updated = { ...form.adls_needed }
    if (updated[adl]) { delete updated[adl] } else { updated[adl] = 'partial' }
    setField('adls_needed', updated)
  }

  function setADLLevel(adl: string, level: string) {
    setField('adls_needed', { ...form.adls_needed, [adl]: level })
  }

  function toggleShift(day: string, shift: string) {
    const key = day + '_' + shift
    setField('schedule_grid', { ...form.schedule_grid, [key]: !form.schedule_grid[key] })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    const payload: Record<string, unknown> = { ...form }
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
        if (res.status === 412 && err.error === 'consent_required') {
          setShowConsentModal(true)
          setSubmitting(false)
          return
        }
        throw new Error(err.error || 'Failed to create client')
      }
      const data = await res.json()
      router.push(`/agency/clients/${data.client.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setSubmitting(false)
    }
  }

  const canSubmit = form.client_first_name && form.primary_condition && form.city && form.state && form.client_data_authorization

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      {showConsentModal && consentsLoaded && (
        <ConsentModal
          onAccept={async () => {
            setSavingConsent(true)
            try {
              const res = await fetch('/api/agency/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consents: ['agency_platform_role', 'agency_employer_responsibility'] }),
              })
              if (res.ok) setShowConsentModal(false)
            } finally { setSavingConsent(false) }
          }}
          acknowledgedPlatform={acknowledgedPlatform}
          setAcknowledgedPlatform={setAcknowledgedPlatform}
          acknowledgedEmployer={acknowledgedEmployer}
          setAcknowledgedEmployer={setAcknowledgedEmployer}
          saving={savingConsent}
        />
      )}

      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '0 0 8px 0' }}>New Client</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Every field improves match accuracy. The more detail, the better the results.</p>

      {/* SECTION 1: Identity */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Client identity</h2>
        <p style={sectionSubtitle}>Basic information for file management. Not shown to caregivers.</p>
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

      {/* SECTION 2: Diagnoses */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Diagnoses & condition</h2>
        <p style={sectionSubtitle}>Matched against caregiver diagnosis experience. Select all that apply.</p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Primary diagnosis <span style={{ color: '#EF4444' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DIAGNOSES.map(d => (
              <Pill key={d} label={d} active={form.primary_condition === d} onClick={() => setField('primary_condition', form.primary_condition === d ? '' : d)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Secondary diagnoses (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DIAGNOSES.filter(d => d !== form.primary_condition).map(d => (
              <Pill key={d} label={d} active={form.secondary_conditions.includes(d)} onClick={() => toggleArr('secondary_conditions', d)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Cognitive status</label>
            <select style={inputStyle} value={form.cognitive_status} onChange={e => setField('cognitive_status', e.target.value)}>
              <option value="">Select...</option>
              <option value="alert">Alert and oriented</option>
              <option value="mild">Mild impairment</option>
              <option value="moderate">Moderate impairment</option>
              <option value="severe">Severe impairment</option>
              <option value="non_verbal">Non-verbal</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mobility level</label>
            <select style={inputStyle} value={form.mobility_level} onChange={e => setField('mobility_level', e.target.value)}>
              <option value="">Select...</option>
              <option value="independent">Independent</option>
              <option value="assistance">Needs assistance</option>
              <option value="wheelchair">Wheelchair</option>
              <option value="bedbound">Bedbound</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Behaviours present (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BEHAVIOURS.map(b => (
              <Pill key={b} label={b} active={form.behaviours.includes(b)} onClick={() => toggleArr('behaviours', b)} color="red" />
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.medications_complex} onChange={e => setField('medications_complex', e.target.checked)} />
            <span style={{ fontSize: 14, color: '#0D1B3E' }}>Complex medication management required</span>
          </label>
        </div>
      </div>

      {/* SECTION 3: ADL Needs */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Care needs</h2>
        <p style={sectionSubtitle}>Select each task needed and the level of assistance required. Matched directly to caregiver ADL experience.</p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Equipment in home</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPMENT.map(e => (
              <Pill key={e} label={e} active={form.equipment_in_home.includes(e)} onClick={() => toggleArr('equipment_in_home', e)} />
            ))}
          </div>
        </div>

        <label style={{ ...labelStyle, marginBottom: 12 }}>ADLs required</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADLS.map(adl => {
            const selected = !!form.adls_needed[adl]
            return (
              <div key={adl} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                border: '1px solid ' + (selected ? COLORS.gold : COLORS.border),
                background: selected ? '#FDF6EC' : 'white',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox" checked={selected} onChange={() => toggleADL(adl)}
                    style={{ accentColor: COLORS.gold, width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? '#92400E' : COLORS.navy }}>{adl}</span>
                </label>
                {selected && (
                  <select
                    value={form.adls_needed[adl] || 'partial'}
                    onChange={e => setADLLevel(adl, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid ' + COLORS.border, marginLeft: 12 }}
                  >
                    {ADL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 4: Schedule */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Schedule needed</h2>
        <p style={sectionSubtitle}>Matched against caregiver availability grid.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Placement type</label>
            <select style={inputStyle} value={form.placement_type} onChange={e => setField('placement_type', e.target.value)}>
              <option value="">Select...</option>
              {['Permanent placement','Live-in care','Regular part-time','Overnight care','Casual / relief shifts','Respite care'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Hours per week</label>
            <input style={inputStyle} type="number" value={form.hours_per_week} onChange={e => setField('hours_per_week', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Start date</label>
            <input style={inputStyle} type="date" value={form.start_date} onChange={e => setField('start_date', e.target.value)} />
          </div>
        </div>

        <label style={{ ...labelStyle, marginBottom: 12 }}>Weekly schedule (select all needed shifts)</label>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: 8 }}></th>
                {SHIFTS.map(s => (
                  <th key={s.key} style={{ padding: 8, fontSize: 11, color: '#94A3B8', fontWeight: 600, textAlign: 'center' }}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{ padding: 8, fontSize: 13, fontWeight: 500, color: '#374151', width: 60 }}>{day}</td>
                  {SHIFTS.map(shift => {
                    const key = day + '_' + shift.key
                    const active = !!form.schedule_grid[key]
                    return (
                      <td key={key} style={{ padding: 4, textAlign: 'center' }}>
                        <button
                          type="button" onClick={() => toggleShift(day, shift.key)}
                          style={{
                            width: 40, height: 40, borderRadius: 8,
                            border: active ? 'none' : '1px solid ' + COLORS.border,
                            background: active ? COLORS.gold : 'white',
                            color: active ? COLORS.navy : '#94A3B8',
                            fontWeight: active ? 800 : 400,
                            cursor: 'pointer', fontSize: 16,
                          }}
                        >{active ? '✓' : ''}</button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
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
            <label style={labelStyle}>Duration expected</label>
            <input style={inputStyle} placeholder="e.g. 6 months, ongoing" value={form.duration_expected} onChange={e => setField('duration_expected', e.target.value)} />
          </div>
        </div>
      </div>

      {/* SECTION 5: Location */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Location</h2>
        <p style={sectionSubtitle}>Used for distance matching against caregiver service areas.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>City <span style={{ color: '#EF4444' }}>*</span></label>
            <input style={inputStyle} value={form.city} onChange={e => setField('city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>State/Province <span style={{ color: '#EF4444' }}>*</span></label>
            <input style={inputStyle} value={form.state} onChange={e => setField('state', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Postal code</label>
            <input style={inputStyle} value={form.postal_code} onChange={e => setField('postal_code', e.target.value)} />
          </div>
        </div>
      </div>

      {/* SECTION 6: Home Environment */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Home environment</h2>
        <p style={sectionSubtitle}>Matched against caregiver comfort preferences.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Pets present</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Dogs','Cats','Birds','Other pets'].map(p => (
              <Pill key={p} label={p} active={form.pets_present.includes(p)} onClick={() => toggleArr('pets_present', p)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}>
              <input type="checkbox" checked={form.smoking_household} onChange={e => setField('smoking_household', e.target.checked)} />
              <span style={{ fontSize: 14, color: '#0D1B3E' }}>Smoking household</span>
            </label>
          </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Family involvement level</label>
            <select style={inputStyle} value={form.family_involvement} onChange={e => setField('family_involvement', e.target.value)}>
              <option value="">Select...</option>
              <option value="very_involved">Very involved — daily contact</option>
              <option value="moderate">Moderate</option>
              <option value="hands_off">Hands-off</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Communication frequency expected</label>
            <select style={inputStyle} value={form.communication_frequency} onChange={e => setField('communication_frequency', e.target.value)}>
              <option value="">Select...</option>
              <option value="daily">Daily updates</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As needed only</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 7: Caregiver Preferences */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Caregiver preferences</h2>
        <p style={sectionSubtitle}>Used for personality and mutual fit matching.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
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
          <div>
            <label style={labelStyle}>Cultural preference</label>
            <input style={inputStyle} placeholder="Optional" value={form.cultural_preference} onChange={e => setField('cultural_preference', e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Preferred caregiver personality</label>
          <select style={inputStyle} value={form.caregiver_personality_preference} onChange={e => setField('caregiver_personality_preference', e.target.value)}>
            <option value="">No preference</option>
            <option value="warm_talkative">Warm and talkative</option>
            <option value="calm_quiet">Calm and quiet</option>
            <option value="professional_efficient">Professional and efficient</option>
            <option value="nurturing">Nurturing and gentle</option>
            <option value="assertive">Assertive and structured</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Continuity preference</label>
          <select style={inputStyle} value={form.continuity_preference} onChange={e => setField('continuity_preference', e.target.value)}>
            <option value="">No preference</option>
            <option value="same_always">Same caregiver always preferred</option>
            <option value="small_team">Small consistent team OK</option>
            <option value="flexible">Flexible — coverage is priority</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Client personality traits (helps match communication style)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PERSONALITY_TRAITS.map(t => (
              <Pill key={t} label={t} active={form.personality_desired.includes(t)} onClick={() => toggleArr('personality_desired', t)} />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 8: Budget & Compliance */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Budget & compliance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Max hourly rate</label>
            <input style={inputStyle} type="number" step="0.01" placeholder="e.g. 28.00" value={form.hourly_rate_max} onChange={e => setField('hourly_rate_max', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Background check level required</label>
            <select style={inputStyle} value={form.background_check_required} onChange={e => setField('background_check_required', e.target.value)}>
              <option value="">Standard</option>
              <option value="standard">Standard criminal check</option>
              <option value="vulnerable_sector">Vulnerable sector check</option>
              <option value="enhanced">Enhanced background check</option>
            </select>
          </div>
        </div>
      </div>

      {/* Authorization */}
      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={form.client_data_authorization}
            onChange={e => setField('client_data_authorization' as any, e.target.checked as any)}
            style={{ marginTop: 3 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
              Client authorization confirmation <span style={{ color: '#DC2626' }}>*</span>
            </div>
            <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>
              I confirm I have obtained informed authorization from the client (or their legally authorized representative)
              to input their care requirements, including health-related information, into Careified for the purpose of finding a caregiver.
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 12, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={() => router.push('/agency/clients')} style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', color: '#0D1B3E', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: FONT_SANS }}>
          Cancel
        </button>
        <button
          onClick={handleSubmit} disabled={!canSubmit || submitting}
          style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: canSubmit && !submitting ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : '#E2E8F0', color: '#0D1B3E', fontSize: 14, fontWeight: 700, cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed', fontFamily: FONT_SANS }}
        >
          {submitting ? 'Creating…' : 'Create Client & Find Matches'}
        </button>
      </div>
    </div>
  )
}

function Pill({ label, active, onClick, color = 'gold' }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  const borderColor = active ? (color === 'red' ? '#DC2626' : '#C9973A') : '#E2E8F0'
  const bg = active ? (color === 'red' ? '#FEF2F2' : '#FDF6EC') : 'white'
  const textColor = active ? (color === 'red' ? '#DC2626' : '#92400E') : '#64748B'
  return (
    <button onClick={onClick} type="button" style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: FONT_SANS }}>
      {label}
    </button>
  )
}

function ConsentModal({ onAccept, acknowledgedPlatform, setAcknowledgedPlatform, acknowledgedEmployer, setAcknowledgedEmployer, saving }: {
  onAccept: () => void; acknowledgedPlatform: boolean; setAcknowledgedPlatform: (v: boolean) => void
  acknowledgedEmployer: boolean; setAcknowledgedEmployer: (v: boolean) => void; saving: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 40 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#0D1B3E', margin: '0 0 8px 0' }}>Before you add a client</h2>
        <p style={{ color: '#64748B', marginBottom: 24, fontSize: 14 }}>Please acknowledge how Careified works. These are one-time acknowledgments.</p>
        {[
          { checked: acknowledgedPlatform, set: setAcknowledgedPlatform, title: 'Platform, not recommender.', body: 'I acknowledge that Careified organizes and displays information provided by caregivers and third parties. Careified does NOT recommend, vouch for, endorse, or employ any caregiver. All hiring decisions are solely my responsibility.' },
          { checked: acknowledgedEmployer, set: setAcknowledgedEmployer, title: 'Employer responsibility.', body: 'If I engage any caregiver through Careified, I (or my agency) am the employer or engaging party and am solely responsible for background checks, qualification verification, employment law compliance, supervision, insurance, and healthcare regulation compliance.' },
        ].map(({ checked, set, title, body }) => (
          <div key={title} style={{ background: '#F7F4F0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={checked} onChange={e => set(e.target.checked)} style={{ marginTop: 3 }} />
              <div style={{ fontSize: 13, color: '#0D1B3E', lineHeight: 1.6 }}>
                <strong>{title}</strong> {body}
              </div>
            </label>
          </div>
        ))}
        <button onClick={onAccept} disabled={!acknowledgedPlatform || !acknowledgedEmployer || saving} style={{ width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none', background: acknowledgedPlatform && acknowledgedEmployer && !saving ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : '#E2E8F0', color: '#0D1B3E', fontSize: 14, fontWeight: 700, cursor: acknowledgedPlatform && acknowledgedEmployer && !saving ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif" }}>
          {saving ? 'Saving…' : 'I acknowledge and continue'}
        </button>
      </div>
    </div>
  )
}
