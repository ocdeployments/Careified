'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { useLocale } from '@/lib/locale/useLocale'

// Design system colors
const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

// Credential options per locale
const CREDENTIALS_BY_LOCALE = {
  CA: [
    { id: 'psw', label: 'PSW — Personal Support Worker' },
    { id: 'hsw', label: 'HSW — Health Support Worker' },
    { id: 'rpn', label: 'RPN — Registered Practical Nurse' },
    { id: 'rn', label: 'RN — Registered Nurse' },
    { id: 'lpn', label: 'LPN — Licensed Practical Nurse' },
    { id: 'dsw', label: 'DSW — Developmental Support Worker' },
    { id: 'ece', label: 'ECE — Early Childhood Educator' },
    { id: 'no_credential', label: 'No formal credential — experienced caregiver' },
    { id: 'other', label: 'Other (specify below)' },
  ],
  US: [
    { id: 'cna', label: 'CNA — Certified Nursing Assistant' },
    { id: 'hha', label: 'HHA — Home Health Aide' },
    { id: 'rn', label: 'RN — Registered Nurse' },
    { id: 'lpn', label: 'LPN — Licensed Practical Nurse' },
    { id: 'home_health_aide', label: 'Home Health Aide' },
    { id: 'personal_care_aide', label: 'Personal Care Aide' },
    { id: 'no_credential', label: 'No formal credential — experienced caregiver' },
    { id: 'other', label: 'Other (specify below)' },
  ],
}

const CERTIFICATION_TYPES = [
  'CPR / First Aid',
  'Nursing License (RN/LPN)',
  'Certified Nursing Assistant (CNA)',
  'Home Health Aide (HHA)',
  'PCA/PSW Certification',
  'OTA Certification',
  'PTA Certification',
  'Social Work License',
  'Medication Aide',
  'Food Handler Permit',
  'Driver License',
  'Background Check',
  'TB Screening',
  'Physical Exam',
  'Dementia Training',
  "Alzheimer's Certification",
  'Hospice Training',
]

const NO_CERT_REASONS = [
  'Currently in training / studying',
  'Just started career',
  'Waiting for certification exam',
  'Previously certified, let it expire',
  'Employer does not require',
  'Other reason',
]

// Styles
const styles = {
  sectionHeader: {
    fontSize: '15px',
    fontWeight: 800,
    color: COLORS.navy,
    marginBottom: '4px',
  },
  sectionSubheader: {
    fontSize: '12.5px',
    color: COLORS.slate,
    marginBottom: '16px',
  },
  section: {
    marginBottom: '24px',
  },
  card: {
    padding: '20px',
    background: '#FDF6EC',
    borderRadius: '16px',
    border: '1px solid rgba(201, 151, 58, 0.2)',
  },
  credentialButton: {
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'left' as const,
    cursor: 'pointer',
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
    fontSize: '11px',
    fontWeight: 600,
    color: COLORS.slate,
    marginBottom: '4px',
    display: 'block',
  },
}

export default function Step5Credentials() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const { locale, config } = useLocale()
  const [focused, setFocused] = useState<string | null>(null)
  const [hasNoCertReason, setHasNoCertReason] = useState(false)

  const credentials = CREDENTIALS_BY_LOCALE[locale]
  const selectedCredential = (formData as any).primaryCredential || ''
  const certifications = (formData as any).certifications || []
  const noCertReason = (formData as any).noCertReason || ''

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

  const handleCredentialSelect = (credId: string) => {
    saveField('primaryCredential', credId)
  }

  const addCertification = () => {
    const updated = [...certifications, { type: '', issuingBody: '', issueDate: '', noExpiry: false }]
    saveField('certifications', updated)
  }

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    saveField('certifications', updated)
  }

  const removeCertification = (index: number) => {
    const updated = certifications.filter((_: any, i: number) => i !== index)
    saveField('certifications', updated)
  }

  const handleNoCertReason = (reason: string) => {
    saveField('noCertReason', reason)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION 1: PRIMARY CREDENTIAL */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>1. Your Primary Credential ⭐</div>
        <div style={styles.sectionSubheader}>
          What best describes your professional role? This determines what certifications you need.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {credentials.map((cred) => (
            <button
              key={cred.id}
              type="button"
              onClick={() => handleCredentialSelect(cred.id)}
              style={{
                ...styles.credentialButton,
                border: selectedCredential === cred.id ? '2px solid ' + COLORS.gold : '2px solid ' + COLORS.border,
                background: selectedCredential === cred.id ? '#FDF6EC' : 'white',
                color: selectedCredential === cred.id ? '#92400E' : COLORS.navy,
              }}
            >
              {selectedCredential === cred.id && '✓ '} {cred.label}
            </button>
          ))}
        </div>

        {selectedCredential && (
          <p style={{ fontSize: '12px', color: COLORS.gold, marginTop: '12px' }}>
            ✓ Selected: {credentials.find(c => c.id === selectedCredential)?.label}
          </p>
        )}
      </div>

      {/* SECTION 2: SUPPORTING CERTIFICATIONS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>2. Supporting Certifications 🏆</div>
        <div style={styles.sectionSubheader}>
          Add any additional certifications, training, or licenses you hold.
        </div>

        {certifications.map((cert: any, i: number) => (
          <div key={i} style={{ padding: '16px', border: '1px solid ' + COLORS.border, borderRadius: '12px', marginBottom: '12px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.navy }}>Certification {i + 1}</span>
              <button type="button" onClick={() => removeCertification(i)} style={{ color: COLORS.red, background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              <div>
                <label style={styles.label}>Type</label>
                <select
                  value={cert.type || ''}
                  onChange={(e) => updateCertification(i, 'type', e.target.value)}
                  style={getInputStyle('certType' + i)}
                >
                  <option value="">Select...</option>
                  {CERTIFICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Issuing Body</label>
                <input
                  type="text"
                  value={cert.issuingBody || ''}
                  onChange={(e) => updateCertification(i, 'issuingBody', e.target.value)}
                  placeholder="e.g. American Red Cross"
                  style={getInputStyle('certBody' + i)}
                />
              </div>
              <div>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={cert.issueDate || ''}
                  onChange={(e) => updateCertification(i, 'issueDate', e.target.value)}
                  style={getInputStyle('certDate' + i)}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCertification}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px dashed ' + COLORS.gold,
            background: '#FDF6EC',
            color: '#92400E',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          + Add Certification
        </button>
      </div>

      {/* SECTION 3: NO CERT REASON */}
      <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid ' + COLORS.border }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={hasNoCertReason}
            onChange={(e) => {
              setHasNoCertReason(e.target.checked)
              if (!e.target.checked) {
                handleNoCertReason('')
              }
            }}
            style={{ accentColor: COLORS.gold, width: '18px', height: '18px' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.navy }}>I don't have certifications yet</span>
        </label>

        {hasNoCertReason && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '8px' }}>Why not?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {NO_CERT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleNoCertReason(reason)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: noCertReason === reason ? '2px solid ' + COLORS.gold : '2px solid ' + COLORS.border,
                    background: noCertReason === reason ? '#FDF6EC' : 'white',
                    color: noCertReason === reason ? '#92400E' : COLORS.slate,
                    cursor: 'pointer',
                  }}
                >
                  {noCertReason === reason && '✓ '} {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}