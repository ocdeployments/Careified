'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { useLocale } from '@/lib/locale/useLocale'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

const IMMUNISATIONS = [
  { key: 'covid', label: 'COVID-19' },
  { key: 'influenza', label: 'Influenza (annual)' },
  { key: 'hep_b', label: 'Hepatitis B' },
  { key: 'tb_mantoux', label: 'TB/Mantoux Test' },
  { key: 'mmr', label: 'MMR (Measles/Mumps/Rubella)' },
  { key: 'tdap', label: 'Tdap (Tetanus/Diphtheria/Pertussis)' },
  { key: 'varicella', label: 'Varicella (Chickenpox)' },
]

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
  consentBlock: {
    background: '#F8FAFC',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
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
  const [uncomfortableLocal, setUncomfortableLocal] = useState<string>((formData as any).uncomfortableSituations || '')
  const [rfTerminated, setRfTerminated] = useState<string>((formData as any).rfTerminated || '')
  const [rfTerminatedDetail, setRfTerminatedDetail] = useState<string>((formData as any).rfTerminatedDetail || '')
  const [rfComplaint, setRfComplaint] = useState<string>((formData as any).rfComplaint || '')
  const [rfComplaintDetail, setRfComplaintDetail] = useState<string>((formData as any).rfComplaintDetail || '')
  const [rfPhysicalLimitation, setRfPhysicalLimitation] = useState<string>((formData as any).rfPhysicalLimitation || '')
  const [rfPhysicalDetail, setRfPhysicalDetail] = useState<string>((formData as any).rfPhysicalDetail || '')
  const [rfBackground, setRfBackground] = useState<string>((formData as any).rfBackground || '')
  const [rfBackgroundDetail, setRfBackgroundDetail] = useState<string>((formData as any).rfBackgroundDetail || '')
  const [vscFileName, setVscFileName] = useState<string>('')

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

  const toggleBackgroundConsent = () => {
    const newValue = !backgroundConsent
    saveField('backgroundConsent', newValue)
    if (newValue) saveField('backgroundConsentDate', new Date().toISOString().split('T')[0])
  }

  const toggleDeclaration = () => {
    const newValue = !declarationAccurate
    saveField('declarationAccurate', newValue)
    if (newValue) saveField('declarationDate', new Date().toISOString().split('T')[0])
  }

  const toggleImmunisation = (key: string) => {
    saveField('immunisationRecords', { ...immunisationRecords, [key]: !immunisationRecords[key] })
  }

  const handleVscUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVscFileName(file.name)
    saveField('vscDocumentName' as any, file.name)
  }

  const sectionLabel = locale === 'CA' ? 'Vulnerable Sector Screen' : 'Criminal Background Declaration'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>

      {/* SECTION: Background Check Consent */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Background Check Consent</div>
        <div style={{
          ...styles.consentBlock,
          border: backgroundConsent === false ? '2px solid ' + COLORS.red : '1px solid ' + COLORS.border,
          background: backgroundConsent === false ? COLORS.errorBg : '#F8FAFC',
        }}>
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

      {/* SECTION: VSC / Criminal History */}
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
                : 'I have completed a state/federal background check'}
            </span>
          </label>

          {/* VSC Upload — shown when checked */}
          {vulnerableSectorCheck && (
            <div style={{ marginTop: '12px', marginLeft: '24px' }}>
              <label style={styles.label}>
                Upload your {locale === 'CA' ? 'VSC document' : 'background check document'} (PDF or image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleVscUpload}
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: COLORS.slate,
                  marginBottom: '4px',
                }}
              />
              {vscFileName && (
                <p style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px' }}>
                  {vscFileName} attached
                </p>
              )}
              <p style={styles.helperText}>Document is stored securely and shared only with agencies you apply to.</p>
            </div>
          )}
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

        {!criminalDeclaration && (
          <div style={{ marginTop: '12px', marginLeft: '24px' }}>
            <label style={styles.label}>Please provide details (this does not automatically disqualify you)</label>
            <textarea
              value={criminalDeclarationDetail || ''}
              onChange={e => handleChange('criminalDeclarationDetail', e.target.value)}
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
              <span style={{ fontSize: '14px', color: COLORS.navy }}>I consent to a driving record check</span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION: Health & Safety */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Health & Safety</div>

        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>TB clearance date (if applicable)</label>
          <input
            type="month"
            value={tbClearanceDate || ''}
            onFocus={() => setFocused('tbClearanceDate')}
            onBlur={e => handleBlur('tbClearanceDate', e.target.value)}
            style={{ ...getInputStyle('tbClearanceDate'), width: 'auto' }}
          />
          <p style={styles.helperText}>Leave blank if not required for your role</p>
        </div>

        <div>
          <label style={{ ...styles.label, marginBottom: '12px' }}>Immunisation records</label>
          {IMMUNISATIONS.map(imm => (
            <div key={imm.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
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
        <label style={styles.label}>
          Are there any work environments or situations you would not be comfortable entering? (optional)
        </label>
        <textarea
          value={uncomfortableLocal}
          onChange={e => setUncomfortableLocal(e.target.value)}
          onBlur={e => handleBlur('uncomfortableSituations', e.target.value)}
          onFocus={() => setFocused('uncomfortableSituations')}
          placeholder="Examples: homes with certain hazards, specific behavioural challenges, etc."
          maxLength={500}
          rows={3}
          style={{ ...getInputStyle('uncomfortableSituations'), resize: 'vertical', minHeight: '100px' }}
        />
        <p style={styles.helperText}>This helps agencies match you appropriately.</p>
      </div>

      {/* SECTION: Red Flag Self-Disclosure */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Honesty Declaration</div>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
          Agencies ask these questions in every screening call. Answering honestly here saves time and builds trust. Your answers are visible to agencies only after you apply to a placement.
        </p>

        {[
          {
            question: 'Have you ever left or been let go from a role due to attendance, conduct, or safety concerns?',
            state: rfTerminated, setState: setRfTerminated, field: 'rfTerminated',
            detailState: rfTerminatedDetail, setDetailState: setRfTerminatedDetail, detailField: 'rfTerminatedDetail',
          },
          {
            question: 'Have you ever received a formal complaint or disciplinary action in a caregiving role?',
            state: rfComplaint, setState: setRfComplaint, field: 'rfComplaint',
            detailState: rfComplaintDetail, setDetailState: setRfComplaintDetail, detailField: 'rfComplaintDetail',
          },
          {
            question: 'Do you have any physical limitations that could affect safe care delivery?',
            state: rfPhysicalLimitation, setState: setRfPhysicalLimitation, field: 'rfPhysicalLimitation',
            detailState: rfPhysicalDetail, setDetailState: setRfPhysicalDetail, detailField: 'rfPhysicalDetail',
          },
          {
            question: 'Anything in your background a vulnerable client's family should know about?',
            state: rfBackground, setState: setRfBackground, field: 'rfBackground',
            detailState: rfBackgroundDetail, setDetailState: setRfBackgroundDetail, detailField: 'rfBackgroundDetail',
          },
        ].map(({ question, state, setState, field, detailState, setDetailState, detailField }) => (
          <div key={field} style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: state === 'yes' ? '#FEF2F2' : '#F8FAFC' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0D1B3E', marginBottom: '10px' }}>{question}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: state === 'yes' ? '12px' : '0' }}>
              {['no', 'yes'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setState(val)
                    saveField(field as any, val)
                    if (val === 'no') {
                      setDetailState('')
                      saveField(detailField as any, '')
                    }
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    border: state === val ? '2px solid ' + (val === 'yes' ? '#DC2626' : '#16A34A') : '1px solid #E2E8F0',
                    background: state === val ? (val === 'yes' ? '#FEF2F2' : '#F0FDF4') : 'white',
                    color: state === val ? (val === 'yes' ? '#DC2626' : '#16A34A') : '#64748B',
                  }}
                >
                  {val === 'yes' ? 'Yes — I'd like to explain' : 'No'}
                </button>
              ))}
            </div>
            {state === 'yes' && (
              <textarea
                value={detailState}
                onChange={e => setDetailState(e.target.value)}
                onBlur={e => saveField(detailField as any, e.target.value)}
                placeholder="Please provide context — this does not automatically disqualify you..."
                maxLength={300}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* SECTION: Declaration */}
      <div style={{
        background: '#FDF9EC',
        border: '1px solid ' + COLORS.gold,
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: COLORS.navy, marginBottom: '8px' }}>
          Declaration of Accuracy
        </div>
        <p style={{ fontSize: '12px', color: COLORS.slate, lineHeight: 1.7, marginBottom: '16px' }}>
          {config.complianceDeclaration}
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
            Declaration signed {declarationDate || new Date().toLocaleDateString()}
          </p>
        )}
      </div>

    </div>
  )
}
