'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

// Design system colors
const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

// Constants
const RELATIONSHIP_OPTIONS = [
  'Former Supervisor', 'Current Supervisor', 'Colleague',
  'Former Client', 'Current Client', 'Client Family Member',
  'Teacher/Instructor', 'Mentor', 'Volunteer Coordinator',
  'Community Leader', 'Personal (non-family)', 'Other Professional'
]

const YEARS_KNOWN = ['Less than 1 year', '1–2 years', '3–5 years', '5+ years']

// Styles
const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  section: {
    marginBottom: '32px',
  },
  referenceBlock: {
    background: '#F8FAFC',
    border: '1px solid ' + COLORS.border,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative' as const,
  },
  blockBadge: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: '#E2E8F0',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '12px',
    color: COLORS.slate,
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
  const { saveField, saveStep } = useProfileSave()
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const references = formData.references || []
  const addLater = (formData as any).addReferencesLater || false

  const getInputStyle = (field: string): React.CSSProperties => {
    let s: React.CSSProperties = { ...styles.input }
    if (focused === field) {
      s = { ...s, borderColor: COLORS.gold, boxShadow: '0 0 0 3px rgba(201,151,58,0.15)' }
    }
    return s
  }

  const handleChange = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const addReference = () => {
    if (references.length >= 6) return
    const newRef = {
      id: generateId(),
      name: '',
      relationshipType: '',
      organisation: '',
      duration: '',
      contactMethod: '',
      email: '',
      phone: '',
      consentKnows: false,
      consentAgreed: false,
      consentUnderstands: false,
    }
    saveField('references', [...references, newRef])
  }

  const updateReference = (index: number, field: string, value: any) => {
    const updated = [...references]
    updated[index] = { ...updated[index], [field]: value }
    saveField('references', updated)
  }

  const removeReference = (index: number) => {
    const updated = references.filter((_, i) => i !== index)
    saveField('references', updated)
  }

  const handlePhoneBlur = (index: number, value: string) => {
    const formatted = formatPhone(value)
    updateReference(index, 'phone', formatted)
  }

  const handleEmailBlur = (index: number, value: string) => {
    if (value && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, [`email_${index}`]: 'Please enter a valid email' }))
    } else {
      setErrors(prev => {
        const next = { ...prev }
        delete next[`email_${index}`]
        return next
      })
    }
    updateReference(index, 'email', value)
  }

  const isClientReference = (relationship: string) => {
    return relationship === 'Former Client' || relationship === 'Current Client'
  }

  const hasSupervisorReference = references.some((ref: any) => {
    const rel = ref.relationshipType || ''
    return rel.includes('Supervisor') || rel.includes('Employer')
  })

  const validateReferences = () => {
    const newErrors: Record<string, string> = {}
    
    if (references.length < 3 && !addLater) {
      newErrors.minRefs = 'Minimum 3 references required'
    }
    
    if (references.length >= 3 && !hasSupervisorReference && !addLater) {
      newErrors.supervisorRef = 'At least one reference must be a former or current supervisor/employer'
    }

    references.forEach((ref: any, i: number) => {
      if (!ref.phone && !ref.email) {
        newErrors[`contact_${i}`] = 'At least phone or email required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* SECTION: References */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>References</div>
        <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
          Minimum 3 references required. At least one must be a former supervisor or employer.
        </p>

        {/* Add Later Option */}
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
          <div style={{ ...styles.clientNote, marginBottom: '16px' }}>
            Your profile will show 'References Pending' until at least 3 are added
          </div>
        )}

        {/* Reference Blocks */}
        {!addLater && references.map((ref: any, index: number) => {
          const showClientNote = isClientReference(ref.relationshipType)
          
          return (
            <div key={ref.id} style={styles.referenceBlock}>
              <div style={styles.blockBadge}>Reference {index + 1}</div>
              <button
                type="button"
                onClick={() => removeReference(index)}
                style={{ position: 'absolute', top: '16px', right: '100px', color: COLORS.red, fontSize: '13px', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Remove
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '8px' }}>
                <div>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    value={ref.name?.split(' ')[0] || ''}
                    onChange={e => {
                      const last = ref.name?.split(' ').slice(1).join(' ') || ''
                      updateReference(index, 'name', e.target.value + (last ? ' ' + last : ''))
                    }}
                    onBlur={e => handleBlur('references', references)}
                    style={getInputStyle('firstName' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>
                    Last Name {showClientNote && '(shown as initial)'}
                  </label>
                  <input
                    type="text"
                    value={ref.name?.split(' ').slice(1).join(' ') || ''}
                    onChange={e => {
                      const first = ref.name?.split(' ')[0] || ''
                      updateReference(index, 'name', first + ' ' + e.target.value)
                    }}
                    onBlur={e => handleBlur('references', references)}
                    style={getInputStyle('lastName' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Relationship to You</label>
                  <select
                    value={ref.relationshipType || ''}
                    onChange={e => updateReference(index, 'relationshipType', e.target.value)}
                    onBlur={e => handleBlur('references', references)}
                    style={getInputStyle('rel' + index)}
                  >
                    <option value="">Select...</option>
                    {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {showClientNote && (
                <div style={styles.clientNote}>
                  Client references show first name and last initial only
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={styles.label}>Company / Organization (optional)</label>
                  <input
                    type="text"
                    value={ref.organisation || ''}
                    onChange={e => updateReference(index, 'organisation', e.target.value)}
                    onBlur={e => handleBlur('references', references)}
                    style={getInputStyle('org' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Phone Number (optional)</label>
                  <input
                    type="tel"
                    value={ref.phone || ''}
                    onChange={e => updateReference(index, 'phone', e.target.value)}
                    onBlur={e => handlePhoneBlur(index, e.target.value)}
                    placeholder="(XXX) XXX-XXXX"
                    style={getInputStyle('phone' + index)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Email Address (optional)</label>
                  <input
                    type="email"
                    value={ref.email || ''}
                    onChange={e => updateReference(index, 'email', e.target.value)}
                    onBlur={e => handleEmailBlur(index, e.target.value)}
                    style={{ ...getInputStyle('email' + index), borderColor: errors[`email_${index}`] ? COLORS.red : undefined }}
                  />
                  {errors[`email_${index}`] && (
                    <p style={{ fontSize: '12px', color: COLORS.red, marginTop: '4px' }}>{errors[`email_${index}`]}</p>
                  )}
                </div>
              </div>

              {errors[`contact_${index}`] && (
                <p style={{ fontSize: '12px', color: COLORS.red, marginTop: '8px' }}>{errors[`contact_${index}`]}</p>
              )}

              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>How long have you known this person?</label>
                <select
                  value={ref.duration || ''}
                  onChange={e => updateReference(index, 'duration', e.target.value)}
                  onBlur={e => handleBlur('references', references)}
                  style={getInputStyle('duration' + index)}
                >
                  <option value="">Select...</option>
                  {YEARS_KNOWN.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Consent Block */}
              <div style={styles.consentBlock}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={ref.consentAgreed || false}
                    onChange={e => updateReference(index, 'consentAgreed', e.target.checked)}
                    style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: COLORS.navy }}>I consent to this person being contacted for a reference check</span>
                </label>
                <label style={{ ...styles.checkboxLabel, marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={ref.consentKnows || false}
                    onChange={e => updateReference(index, 'consentKnows', e.target.checked)}
                    style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: COLORS.navy }}>I confirm this person is aware they are listed as a reference</span>
                </label>
                <label style={{ ...styles.checkboxLabel, marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={ref.consentUnderstands || false}
                    onChange={e => updateReference(index, 'consentUnderstands', e.target.checked)}
                    style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: COLORS.navy }}>I confirm this reference information is accurate and truthful</span>
                </label>

                {!ref.consentAgreed && (
                  <div style={styles.warning}>
                    References without contact consent will be marked as unverifiable
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Validation Errors */}
        {errors.minRefs && (
          <p style={{ fontSize: '13px', color: COLORS.red, marginTop: '8px' }}>{errors.minRefs}</p>
        )}
        {errors.supervisorRef && (
          <p style={{ fontSize: '13px', color: COLORS.red, marginTop: '8px' }}>{errors.supervisorRef}</p>
        )}

        {/* Add Button */}
        {!addLater && references.length < 6 && (
          <button type="button" onClick={addReference} style={styles.addButton}>
            + Add Reference
          </button>
        )}
      </div>
    </div>
  )
}