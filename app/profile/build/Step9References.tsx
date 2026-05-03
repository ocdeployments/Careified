'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

const RELATIONSHIP_OPTIONS = [
  'Former Supervisor', 'Current Supervisor', 'Colleague',
  'Former Client', 'Current Client', 'Client Family Member',
  'Teacher/Instructor', 'Mentor', 'Volunteer Coordinator',
  'Community Leader', 'Personal (non-family)', 'Other Professional'
]

const RELATIONSHIP_MAP: Record<string, string> = {
  'Former Supervisor': 'direct_supervisor',
  'Current Supervisor': 'direct_supervisor',
  'Colleague': 'colleague',
  'Former Client': 'client_family',
  'Current Client': 'client_family',
  'Client Family Member': 'client_family',
  'Teacher/Instructor': 'other',
  'Mentor': 'other',
  'Volunteer Coordinator': 'agency_coordinator',
  'Community Leader': 'other',
  'Personal (non-family)': 'other',
  'Other Professional': 'other',
}

const YEARS_KNOWN = ['Less than 1 year', '1–2 years', '3–5 years', '5+ years']

const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  section: { marginBottom: '32px' },
  referenceBlock: {
    background: '#F8FAFC',
    border: '1px solid ' + COLORS.border,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  consentBlock: {
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '12px',
  },
  warning: {
    background: '#FEF3C7',
    border: '1px solid #D97706',
    color: '#92400E',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    marginTop: '8px',
  },
  clientNote: {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#1E40AF',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    marginTop: '8px',
  },
  addButton: {
    border: '2px dashed ' + COLORS.gold,
    background: 'transparent',
    color: COLORS.gold,
    borderRadius: '8px',
    padding: '12px',
    width: '100%',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3)
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Step9References() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inviteStatus, setInviteStatus] = useState<Record<number, 'idle' | 'sending' | 'sent' | 'error'>>({})
  const [inviteUrls, setInviteUrls] = useState<Record<number, string>>({})
  const [copied, setCopied] = useState<Record<number, boolean>>({})

  const references = formData.references || []
  const addLater = (formData as any).addReferencesLater || false

  const getInputStyle = (field: string): React.CSSProperties => {
    let s: React.CSSProperties = { ...styles.input }
    if (focused === field) {
      s = { ...s, borderColor: COLORS.gold, boxShadow: '0 0 0 3px rgba(201,151,58,0.15)' }
    }
    return s
  }

  const handleChange = useCallback((field: string, value: unknown) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: unknown) => {
    saveField(field as any, value)
  }, [saveField])

  const addReference = () => {
    if (references.length >= 6) return
    saveField('references', [...references, {
      id: generateId(), name: '', relationshipType: '', organisation: '',
      duration: '', contactMethod: '', email: '', phone: '',
      consentKnows: false, consentAgreed: false, consentUnderstands: false,
    }])
  }

  const updateReference = (index: number, field: string, value: unknown) => {
    const updated = [...references]
    updated[index] = { ...updated[index], [field]: value }
    saveField('references', updated)
  }

  const removeReference = (index: number) => {
    saveField('references', references.filter((_: unknown, i: number) => i !== index))
  }

  const handlePhoneBlur = (index: number, value: string) => {
    updateReference(index, 'phone', formatPhone(value))
  }

  const handleEmailBlur = (index: number, value: string) => {
    if (value && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, [`email_${index}`]: 'Please enter a valid email' }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n[`email_${index}`]; return n })
    }
    updateReference(index, 'email', value)
  }

  const sendVerificationInvite = async (index: number, ref: any) => {
    if (!ref.name || (!ref.email && !ref.phone)) return
    setInviteStatus(prev => ({ ...prev, [index]: 'sending' }))
    try {
      const res = await fetch('/api/references/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceName: ref.name,
          referenceEmail: ref.email || null,
          referencePhone: ref.phone || null,
          relationship: RELATIONSHIP_MAP[ref.relationshipType] || 'other',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInviteStatus(prev => ({ ...prev, [index]: 'sent' }))
      setInviteUrls(prev => ({ ...prev, [index]: data.responseUrl }))
    } catch {
      setInviteStatus(prev => ({ ...prev, [index]: 'error' }))
    }
  }

  const copyLink = (index: number) => {
    navigator.clipboard.writeText(inviteUrls[index])
    setCopied(prev => ({ ...prev, [index]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [index]: false })), 2000)
  }

  const isClientReference = (relationship: string) =>
    relationship === 'Former Client' || relationship === 'Current Client'

  const hasSupervisorReference = references.some((ref: any) =>
    (ref.relationshipType || '').includes('Supervisor') || (ref.relationshipType || '').includes('Employer')
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>References</div>
        <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
          Minimum 3 references required. At least one must be a former supervisor or employer.
          Send each reference a verification link — completed responses appear as verified badges on your profile.
        </p>

        <label style={{ ...styles.checkboxLabel, marginBottom: '16px' }}>
          <input
            type="checkbox"
            checked={addLater || false}
            onChange={e => handleChange('addReferencesLater', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: COLORS.navy }}>I'll add references later</span>
        </label>

        {addLater && (
          <div style={styles.clientNote}>Your profile will show 'References Pending' until at least 3 are added</div>
        )}

        {!addLater && references.map((ref: any, index: number) => {
          const status = inviteStatus[index] || 'idle'
          const url = inviteUrls[index]
          const canInvite = ref.name && (ref.email || ref.phone) && ref.consentAgreed

          return (
            <div key={ref.id} style={styles.referenceBlock}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.navy }}>Reference {index + 1}</span>
                <button
                  type="button" onClick={() => removeReference(index)}
                  style={{ color: COLORS.red, fontSize: '13px', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    value={ref.name?.split(' ')[0] || ''}
                    onChange={e => {
                      const last = ref.name?.split(' ').slice(1).join(' ') || ''
                      updateReference(index, 'name', e.target.value + (last ? ' ' + last : ''))
                    }}
                    onFocus={() => setFocused('firstName' + index)}
                    onBlur={() => handleBlur('references', references)}
                    style={getInputStyle('firstName' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Last Name {isClientReference(ref.relationshipType) && '(shown as initial)'}</label>
                  <input
                    type="text"
                    value={ref.name?.split(' ').slice(1).join(' ') || ''}
                    onChange={e => {
                      const first = ref.name?.split(' ')[0] || ''
                      updateReference(index, 'name', first + ' ' + e.target.value)
                    }}
                    onFocus={() => setFocused('lastName' + index)}
                    onBlur={() => handleBlur('references', references)}
                    style={getInputStyle('lastName' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Relationship</label>
                  <select
                    value={ref.relationshipType || ''}
                    onChange={e => updateReference(index, 'relationshipType', e.target.value)}
                    onBlur={() => handleBlur('references', references)}
                    style={getInputStyle('rel' + index)}
                  >
                    <option value="">Select...</option>
                    {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {isClientReference(ref.relationshipType) && (
                <div style={styles.clientNote}>Client references show first name and last initial only</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={styles.label}>Organization (optional)</label>
                  <input
                    type="text" value={ref.organisation || ''}
                    onChange={e => updateReference(index, 'organisation', e.target.value)}
                    onFocus={() => setFocused('org' + index)}
                    onBlur={() => handleBlur('references', references)}
                    style={getInputStyle('org' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Phone (optional)</label>
                  <input
                    type="tel" value={ref.phone || ''}
                    onChange={e => updateReference(index, 'phone', e.target.value)}
                    onFocus={() => setFocused('phone' + index)}
                    onBlur={e => handlePhoneBlur(index, e.target.value)}
                    placeholder="(XXX) XXX-XXXX"
                    style={getInputStyle('phone' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Email (optional)</label>
                  <input
                    type="email" value={ref.email || ''}
                    onChange={e => updateReference(index, 'email', e.target.value)}
                    onFocus={() => setFocused('email' + index)}
                    onBlur={e => handleEmailBlur(index, e.target.value)}
                    style={{ ...getInputStyle('email' + index), borderColor: errors[`email_${index}`] ? COLORS.red : undefined }}
                  />
                  {errors[`email_${index}`] && (
                    <p style={{ fontSize: '12px', color: COLORS.red, marginTop: '4px' }}>{errors[`email_${index}`]}</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>How long have you known this person?</label>
                <select
                  value={ref.duration || ''}
                  onChange={e => updateReference(index, 'duration', e.target.value)}
                  onBlur={() => handleBlur('references', references)}
                  style={getInputStyle('duration' + index)}
                >
                  <option value="">Select...</option>
                  {YEARS_KNOWN.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Consent block */}
              <div style={styles.consentBlock}>
                {[
                  { field: 'consentAgreed', text: 'I consent to this person being contacted for a reference check' },
                  { field: 'consentKnows', text: 'I confirm this person is aware they are listed as a reference' },
                  { field: 'consentUnderstands', text: 'I confirm this reference information is accurate and truthful' },
                ].map(({ field, text }) => (
                  <label key={field} style={{ ...styles.checkboxLabel, marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={ref[field] || false}
                      onChange={e => updateReference(index, field, e.target.checked)}
                      style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: COLORS.navy }}>{text}</span>
                  </label>
                ))}
                {!ref.consentAgreed && (
                  <div style={styles.warning}>References without contact consent will be marked as unverifiable</div>
                )}
              </div>

              {/* Verification invite section */}
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: status === 'sent' ? '#F0FDF4' : '#FAFAFA', border: '1px solid ' + (status === 'sent' ? '#BBF7D0' : COLORS.border) }}>
                {status === 'idle' && (
                  <div>
                    <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '10px' }}>
                      Send {ref.name ? ref.name.split(' ')[0] : 'this reference'} a verification link — they fill out a 4-minute form and it appears as a verified badge on your profile.
                    </p>
                    <button
                      type="button"
                      onClick={() => sendVerificationInvite(index, ref)}
                      disabled={!canInvite}
                      style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        border: 'none', cursor: canInvite ? 'pointer' : 'not-allowed',
                        background: canInvite ? COLORS.navy : '#E2E8F0',
                        color: canInvite ? 'white' : '#94A3B8',
                      }}
                    >
                      Send verification link
                    </button>
                    {!canInvite && (
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                        Add name, email or phone, and tick consent first
                      </p>
                    )}
                  </div>
                )}

                {status === 'sending' && (
                  <p style={{ fontSize: '13px', color: COLORS.slate }}>Generating link...</p>
                )}

                {status === 'sent' && url && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A' }}>Verification link ready</span>
                    </div>
                    <p style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '10px' }}>
                      Share this link with {ref.name ? ref.name.split(' ')[0] : 'your reference'} via email, text, or copy it below.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        readOnly value={url}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid ' + COLORS.border, borderRadius: '8px', fontSize: '12px', background: 'white', color: COLORS.slate }}
                      />
                      <button
                        type="button" onClick={() => copyLink(index)}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                          background: copied[index] ? '#16A34A' : COLORS.navy,
                          color: 'white',
                        }}
                      >
                        {copied[index] ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                      Once they submit, a verified badge appears on your profile automatically.
                    </p>
                  </div>
                )}

                {status === 'error' && (
                  <div>
                    <p style={{ fontSize: '13px', color: COLORS.red, marginBottom: '8px' }}>Failed to generate link. Please try again.</p>
                    <button
                      type="button" onClick={() => setInviteStatus(prev => ({ ...prev, [index]: 'idle' }))}
                      style={{ fontSize: '12px', color: COLORS.navy, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>

              {errors[`contact_${index}`] && (
                <p style={{ fontSize: '12px', color: COLORS.red, marginTop: '8px' }}>{errors[`contact_${index}`]}</p>
              )}
            </div>
          )
        })}

        {errors.minRefs && <p style={{ fontSize: '13px', color: COLORS.red, marginTop: '8px' }}>{errors.minRefs}</p>}
        {errors.supervisorRef && <p style={{ fontSize: '13px', color: COLORS.red, marginTop: '8px' }}>{errors.supervisorRef}</p>}

        {!addLater && references.length < 6 && (
          <button type="button" onClick={addReference} style={styles.addButton}>
            + Add Reference
          </button>
        )}
      </div>
    </div>
  )
}
