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

// Immunisation options per spec
const IMMUNISATIONS = [
  { key: 'covid', label: 'COVID-19' },
  { key: 'influenza', label: 'Influenza (annual)' },
  { key: 'hep_b', label: 'Hepatitis B' },
  { key: 'tb_mantoux', label: 'TB/Mantoux Test' },
  { key: 'mmr', label: 'MMR (Measles/Mumps/Rubella)' },
  { key: 'tdap', label: 'Tdap (Tetanus/Diphtheria/Pertussis)' },
  { key: 'varicella', label: 'Varicella (Chickenpox)' },
]

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
  sectionSubheader: {
    fontSize: '15px',
    fontWeight: 800,
    color: COLORS.navy,
    marginBottom: '4px',
  },
  section: {
    marginBottom: '32px',
  },
  consentBlock: {
    background: '#F8FAFC',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  declarationBlock: {
    background: '#FEF9EC',
    border: '1px solid COLORS.gold',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
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
  helperText: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '4px',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}

export default function Step6Compliance() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const { locale, config } = useLocale()
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const backgroundConsent = formData.backgroundConsent
  const vulnerableSectorCheck = formData.vulnerableSectorCheck
  const drivingRecordCheck = formData.drivingRecordCheck
  const criminalDeclaration = formData.criminalDeclaration
  const criminalDeclarationDetail = formData.criminalDeclarationDetail
  const tbClearanceDate = formData.tbClearanceDate
  const immunisationRecords = formData.immunisationRecords || {}
  const bondedInsured = formData.bondedInsured
  const declarationAccurate = formData.declarationAccurate
  const declarationDate = formData.declarationDate
  const hasDriversLicense = formData.hasDriversLicense
  const uncomfortableSituations = (formData as any).uncomfortableSituations || ''

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

  const toggleBackgroundConsent = () => {
    const newValue = !backgroundConsent
    saveField('backgroundConsent', newValue)
    if (newValue) {
      saveField('backgroundConsentDate', new Date().toISOString().split('T')[0])
    }
  }

  const toggleDeclaration = () => {
    const newValue = !declarationAccurate
    saveField('declarationAccurate', newValue)
    if (newValue) {
      saveField('declarationDate', new Date().toISOString().split('T')[0])
    }
  }

  const toggleImmunisation = (key: string) => {
    saveField('immunisationRecords', { ...immunisationRecords, [key]: !immunisationRecords[key] })
  }

  const sectionLabel = locale === 'CA' ? 'Vulnerable Sector Screen' : 'Criminal Background Declaration'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* SECTION: Background Check Consent */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Background Check Consent</div>
        
        <div style={{ ...styles.consentBlock, border: backgroundConsent === false ? '2px solid ' + COLORS.red : '1px solid ' + COLORS.border, background: backgroundConsent === false ? COLORS.errorBg : '#F8FAFC' }}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={backgroundConsent || false}
              onChange={toggleBackgroundConsent}
              style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.navy }}>
              {config.backgroundCheckLabel}
            </span>
          </label>
          <p style={{ fontSize: '12px', color: COLORS.slate, marginTop: '8px', marginLeft: '24px' }}>
            {config.backgroundCheckDescription}
          </p>
        </div>
      </div>

      {/* SECTION: Vulnerable Sector / Criminal History */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>{sectionLabel}</div>
        
        <div style={styles.consentBlock}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vulnerableSectorCheck || false}
              onChange={() => handleChange('vulnerableSectorCheck', !vulnerableSectorCheck)}
              style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', color: COLORS.navy }}>
              {locale === 'CA' 
                ? 'I have a current Vulnerable Sector Check (within 3 years)'
                : 'I have completed a state/federal background check'
              }
            </span>
          </label>
        </div>

        <div style={styles.consentBlock}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={criminalDeclaration || false}
              onChange={() => handleChange('criminalDeclaration', !criminalDeclaration)}
              style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', color: COLORS.navy }}>
              I declare that I have no criminal convictions that would affect my ability to work with vulnerable populations
            </span>
          </label>
        </div>

        {/* Conditional: show detail when criminalDeclaration is UNCHECKED */}
        {!criminalDeclaration && (
          <div style={{ marginTop: '12px', marginLeft: '24px' }}>
            <label style={styles.label}>Please provide details (this does not automatically disqualify you)</label>
            <textarea
              value={criminalDeclarationDetail || ''}
              onBlur={e => handleBlur('criminalDeclarationDetail', e.target.value)}
              placeholder="Describe the nature and circumstances..."
              maxLength={500}
              rows={3}
              style={{ ...getInputStyle('criminalDeclarationDetail'), resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        )}
      </div>

      {/* SECTION: Driving Record (conditional) */}
      {hasDriversLicense && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Driving Record</div>
          
          <div style={styles.consentBlock}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={drivingRecordCheck || false}
                onChange={() => handleChange('drivingRecordCheck', !drivingRecordCheck)}
                style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: COLORS.navy }}>
                I consent to a driving record check
              </span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION: Health & Safety */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Health & Safety</div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>TB Clearance Date (if applicable)</label>
          <input
            type="date"
            value={tbClearanceDate || ''}
            onBlur={e => handleBlur('tbClearanceDate', e.target.value)}
            style={{ ...getInputStyle('tbClearanceDate'), width: 'auto' }}
          />
          <p style={styles.helperText}>Leave blank if not required for your role</p>
        </div>

        <div>
          <label style={{ ...styles.label, marginBottom: '12px' }}>Immunisation records</label>
          {IMMUNISATIONS.map(imm => (
            <div key={imm.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={immunisationRecords[imm.key] || false}
                  onChange={() => toggleImmunisation(imm.key)}
                  style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: COLORS.navy }}>{imm.label}</span>
              </label>
            </div>
          ))}
        </div>

        <div style={{ ...styles.consentBlock, marginTop: '16px' }}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={bondedInsured || false}
              onChange={() => handleChange('bondedInsured', !bondedInsured)}
              style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', color: COLORS.navy }}>I am bonded and/or insured</span>
          </label>
        </div>
      </div>

      {/* SECTION: Work Environment Comfort */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Work Environment Comfort</div>
        
        <label style={styles.label}>Are there any work environments or situations you would not be comfortable entering? (optional)</label>
        <textarea
          value={uncomfortableSituations}
          onBlur={e => handleBlur('uncomfortableSituations', e.target.value)}
          placeholder="Examples: homes with certain hazards, specific behavioural challenges, etc."
          maxLength={500}
          rows={3}
          style={{ ...getInputStyle('uncomfortableSituations'), resize: 'vertical', minHeight: '100px' }}
        />
        <p style={styles.helperText}>This helps agencies match you appropriately.</p>
      </div>

      {/* SECTION: Declaration of Accuracy */}
      <div style={styles.declarationBlock}>
        <div style={styles.sectionSubheader}>Declaration of Accuracy</div>
        
        <p style={{ fontSize: '12px', color: COLORS.slate, lineHeight: 1.7, marginBottom: '16px' }}>
          I declare that all information provided in this profile is true, accurate and complete to the best of my knowledge.
        </p>

        <label style={{ ...styles.checkboxLabel, marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={declarationAccurate || false}
            onChange={toggleDeclaration}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.navy }}>
            I confirm the above declaration is true and accurate
          </span>
        </label>

        {declarationAccurate && (
          <p style={{ fontSize: '12px', color: '#16A34A', marginTop: '8px' }}>
            Declaration signed {declarationDate || 'today'}
          </p>
        )}
      </div>
    </div>
  )
}