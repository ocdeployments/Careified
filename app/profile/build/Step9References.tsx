'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { Plus, X, ShieldCheck, AlertCircle } from 'lucide-react'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type RefEntry = {
  id: string
  name: string
  relationshipType: string
  organisation: string
  duration: string
  contactMethod: string
  email: string
  phone: string
  consentKnows: boolean
  consentAgreed: boolean
  consentUnderstands: boolean
}

const RELATIONSHIP_TYPES = [
  'Former employer — agency',
  'Former employer — private family',
  'Current employer — agency',
  'Current employer — private family',
  'Direct supervisor',
  'Training supervisor / instructor',
  'Professional colleague',
  'Former client (self)',
  'Former client — family member',
  'Former client — legal guardian / POA',
  'Character reference — professional',
  'Character reference — community',
]

const DURATION_OPTIONS = [
  'Less than 1 year',
  '1–2 years',
  '2–5 years',
  '5+ years',
]

const CONTACT_METHODS = [
  { value: 'email', label: 'Email only' },
  { value: 'phone', label: 'Phone only' },
  { value: 'either', label: 'Email or phone' },
]

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  fontSize: '13px',
  color: '#0D1B3E',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: FONT_SANS,
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}

export default function Step9References() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()

  const [refs, setRefs] = useState<RefEntry[]>(() => {
    const saved = formData.references as RefEntry[] | undefined
    if (Array.isArray(saved) && saved.length > 0) return saved
    return [{
      id: String(Date.now()),
      name: '', relationshipType: '', organisation: '',
      duration: '', contactMethod: '', email: '', phone: '',
      consentKnows: false, consentAgreed: false, consentUnderstands: false,
    }]
  })

  const [expandedRef, setExpandedRef] = useState<number | null>(0)

  const addRef = () => {
    if (refs.length >= 5) return
    const newRef: RefEntry = {
      id: String(Date.now()),
      name: '', relationshipType: '', organisation: '', duration: '', contactMethod: '',
      email: '', phone: '', consentKnows: false,
      consentAgreed: false, consentUnderstands: false,
    }
    const updated = [...refs, newRef]
    setRefs(updated)
    setExpandedRef(updated.length - 1)
    saveField('references', updated)
  }

  const removeRef = (id: string) => {
    const updated = refs.filter(r => r.id !== id)
    setRefs(updated)
    saveField('references', updated)
  }

  const updateRef = (id: string, field: keyof RefEntry, value: unknown) => {
    const updated = refs.map(r => r.id === id ? { ...r, [field]: value } : r)
    setRefs(updated)
    saveField('references', updated)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }

  const isClientReference = (type: string) => type.includes('client')

  const allConsentsGiven = (ref: RefEntry) => ref.consentKnows && ref.consentAgreed && ref.consentUnderstands

  return (
    <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Intro note */}
      <div style={{ padding: '14px 16px', borderRadius: 12, background: '#FDF6EC', border: '1px solid rgba(201,151,58,0.2)', display: 'flex', alignItems: 'start', gap: 10 }}>
        <ShieldCheck size={16} color="#C9973A" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
          We send an automated reference request email to each referee. References are structured and take about 3 minutes to complete. Contact details are kept private — agencies only see them after shortlisting you.
        </p>
      </div>

      {/* Reference cards */}
      {refs.map((ref, idx) => {
        const isOpen = expandedRef === idx
        const hasName = !!ref.name
        const allConsents = allConsentsGiven(ref)

        return (
          <div key={ref.id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            {/* Card header */}
            <div onClick={() => setExpandedRef(isOpen ? null : idx)} style={{ padding: '14px 16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: allConsents ? '#D1FAE5' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={14} color={allConsents ? '#16A34A' : '#94A3B8'} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B3E' }}>
                    {hasName ? ref.name : `Reference ${idx + 1}`}
                    {idx === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#C9973A', marginLeft: 6 }}>(required)</span>}
                  </div>
                  {ref.relationshipType && <div style={{ fontSize: 11, color: '#64748B' }}>{ref.relationshipType}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {refs.length > 1 && (
                  <button type="button" onClick={e => { e.stopPropagation(); removeRef(ref.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded fields */}
            {isOpen && (
              <div style={{ padding: '20px 16px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Full name *</label>
                  <input type="text" value={ref.name || ''} onChange={e => updateRef(ref.id, 'name', e.target.value)} placeholder="First and last name" maxLength={60} style={inputStyle} />
                </div>

                {/* Relationship type */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Relationship *</label>
                  <select value={ref.relationshipType || ''} onChange={e => updateRef(ref.id, 'relationshipType', e.target.value)} style={selectStyle}>
                    <option value="">Select relationship...</option>
                    {RELATIONSHIP_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </select>
                </div>

                {/* Client reference note */}
                {isClientReference(ref.relationshipType) && (
                  <div style={{ padding: 12, borderRadius: 10, background: '#EFF6FF', border: '1px solid rgba(30,58,138,0.2)' }}>
                    <p style={{ fontSize: 11.5, color: '#1E3A8A', lineHeight: 1.6, margin: 0 }}>
                      Client references are displayed as first name + last initial only. Admin reviews all client references before they appear on your profile.
                    </p>
                  </div>
                )}

                {/* Organisation */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Organisation / agency name *</label>
                  <input type="text" value={ref.organisation || ''} onChange={e => updateRef(ref.id, 'organisation', e.target.value)} placeholder="e.g. Sunshine Home Care" maxLength={100} style={inputStyle} />
                </div>

                {/* Duration and contact method */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>How long known *</label>
                    <select value={ref.duration || ''} onChange={e => updateRef(ref.id, 'duration', e.target.value)} style={selectStyle}>
                      <option value="">Select...</option>
                      {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Preferred contact *</label>
                    <select value={ref.contactMethod || ''} onChange={e => updateRef(ref.id, 'contactMethod', e.target.value)} style={selectStyle}>
                      <option value="">Select...</option>
                      {CONTACT_METHODS.map(cm => <option key={cm.value} value={cm.value}>{cm.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Email — conditional */}
                {(ref.contactMethod === 'email' || ref.contactMethod === 'either') && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Email address *</label>
                    <input type="email" value={ref.email || ''} onChange={e => updateRef(ref.id, 'email', e.target.value)} placeholder="name@example.com" style={inputStyle} />
                  </div>
                )}

                {/* Phone — conditional */}
                {(ref.contactMethod === 'phone' || ref.contactMethod === 'either') && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Phone number *</label>
                    <input type="tel" value={ref.phone || ''} onChange={e => updateRef(ref.id, 'phone', formatPhone(e.target.value))} placeholder="(XXX) XXX-XXXX" maxLength={14} style={inputStyle} />
                  </div>
                )}

                {/* Consent section */}
                <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0D1B3E', margin: '0 0 10px' }}>Before we contact this reference:</p>
                  {[
                    { field: 'consentKnows' as const, text: `${ref.name || 'This person'} knows I am listing them as a reference on Careified` },
                    { field: 'consentAgreed' as const, text: 'They have agreed to be contacted by our platform for a structured reference request' },
                    { field: 'consentUnderstands' as const, text: 'I understand that providing false consent may result in profile suspension' },
                  ].map(consent => (
                    <label key={consent.field} style={{ display: 'flex', alignItems: 'start', gap: 10, marginBottom: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={ref[consent.field] || false} onChange={e => updateRef(ref.id, consent.field, e.target.checked)} style={{ accentColor: '#C9973A', width: 14, height: 14, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>{consent.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add reference button */}
      {refs.length < 5 && (
        <button type="button" onClick={addRef} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid #C9973A', background: 'white', color: '#C9973A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={16} />
          Add another reference
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>({5 - refs.length} remaining)</span>
        </button>
      )}

      {/* Validation */}
      {refs.length === 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF3C7', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={14} color="#D97706" />
          <span style={{ fontSize: 12, color: '#92400E' }}>Add at least one reference to continue</span>
        </div>
      )}
    </div>
  )
}