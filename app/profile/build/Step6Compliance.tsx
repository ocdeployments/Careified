'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { ShieldCheck, AlertCircle, Upload, CheckCircle } from 'lucide-react'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  fontSize: '13px',
  color: '#0D1B3E',
  width: '100%',
  boxSizing: 'border-box' as const,
  fontFamily: FONT_SANS,
}

const Toggle = ({ checked, onClick }: {
  checked: boolean | undefined
  onClick: () => void
}) => (
  <div
    onClick={onClick}
    style={{
      width: 44, height: 24, borderRadius: 999,
      background: checked ? '#C9973A' : '#E2E8F0',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.2s ease', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute',
      top: 3, left: checked ? 23 : 3,
      width: 18, height: 18,
      borderRadius: '50%', background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      transition: 'left 0.2s ease',
    }} />
  </div>
)

export default function Step6Compliance() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()

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

  const immunisations = [
    { key: 'covid', label: 'COVID-19 vaccinated' },
    { key: 'flu', label: 'Annual flu vaccination (current season)' },
    { key: 'hep_b', label: 'Hepatitis B vaccinated' },
    { key: 'tb_test', label: 'TB test completed' },
  ]

  return (
    <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SECTION 1: BACKGROUND CHECKS */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>Background checks</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>Agencies require background screening before placement. Your consent allows us to facilitate this process.</p>

        {/* Criminal background check */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '8px' }}>
          <ShieldCheck size={20} color="#1E3A8A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Criminal background check</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Standard criminal record check. Required by most agencies.</div>
          </div>
          <Toggle checked={backgroundConsent} onClick={() => {
            const nowConsented = !backgroundConsent
            saveField('backgroundConsent', nowConsented)
            if (nowConsented) {
              saveField('backgroundConsentDate', new Date().toISOString().split('T')[0])
            }
          }} />
        </div>

        {/* Vulnerable sector check */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '8px' }}>
          <ShieldCheck size={20} color="#1E3A8A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Vulnerable sector screening</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Required in Canada for anyone working with vulnerable adults or children. Recommended for US placements.</div>
          </div>
          <Toggle checked={vulnerableSectorCheck} onClick={() => saveField('vulnerableSectorCheck', !vulnerableSectorCheck)} />
        </div>

        {/* Driving record check - conditional on hasDriversLicense */}
        {hasDriversLicense && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="#1E3A8A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Driving record check</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Required if you will be transporting clients.</div>
            </div>
            <Toggle checked={drivingRecordCheck} onClick={() => saveField('drivingRecordCheck', !drivingRecordCheck)} />
          </div>
        )}

        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>Consenting here does not initiate a check. Your assigned agency will coordinate the screening process directly with you.</p>
      </div>

      {/* SECTION 2: CRIMINAL DECLARATION */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>Criminal offence declaration</h3>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>I have a criminal conviction or pending charge to declare</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>You are not required to disclose spent convictions. Declaring does not automatically disqualify you.</div>
          </div>
          <Toggle checked={criminalDeclaration} onClick={() => saveField('criminalDeclaration', !criminalDeclaration)} />
        </div>

        {criminalDeclaration && (
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '6px' }}>Please provide brief details</label>
            <textarea
              value={criminalDeclarationDetail || ''}
              onBlur={(e) => saveField('criminalDeclarationDetail', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Briefly describe the nature of the conviction and date. This is reviewed privately by admin only."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            />
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>This information is seen by platform admin only during profile review. It is never shared with agencies directly.</p>
          </div>
        )}
      </div>

      {/* SECTION 3: HEALTH CLEARANCES */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px 0' }}>Health clearances</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>Upload or declare health screening documents.</p>

        {/* TB Clearance */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '6px' }}>TB / Tuberculosis clearance date</label>
          <input
            type="date"
            value={tbClearanceDate || ''}
            onBlur={(e) => saveField('tbClearanceDate', e.target.value)}
            style={{ ...inputStyle, width: 'auto' }}
          />
          <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Enter the date of your most recent TB test or clearance.</p>
        </div>

        {/* Immunisation Records */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0D1B3E', marginBottom: '12px' }}>Immunisation status</label>

          {immunisations.map((imm) => (
            <div key={imm.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#0D1B3E' }}>{imm.label}</span>
              <Toggle checked={immunisationRecords[imm.key]} onClick={() => saveField('immunisationRecords', { ...immunisationRecords, [imm.key]: !immunisationRecords[imm.key] })} />
            </div>
          ))}

          {/* Upload area */}
          <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '12px' }}>
            <Upload size={20} color="#94A3B8" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>Upload immunisation records</p>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px' }}>PDF, JPG or PNG - Max 10MB</p>
            <p style={{ fontSize: '10px', color: '#94A3B8', margin: '4px 0 0' }}>Documents are encrypted and stored privately.</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: BONDED AND INSURED */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>I am bonded and/or insured</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Liability insurance or bonding through an agency or independently.</div>
          </div>
          <Toggle checked={bondedInsured} onClick={() => saveField('bondedInsured', !bondedInsured)} />
        </div>
      </div>

      {/* SECTION 5: DECLARATION OF ACCURACY */}
      <div style={{ background: '#FDF6EC', border: '1.5px solid rgba(201,151,58,0.3)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 8px 0' }}>Declaration of accuracy</h3>

        <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7, marginBottom: '16px' }}>
          I confirm that all information provided in this profile is accurate and complete to the best of my knowledge. I understand that providing false or misleading information may result in profile suspension and removal from the platform. I consent to Careified verifying my credentials and contacting my references as part of the onboarding process.
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} onClick={() => {
          saveField('declarationAccurate', !declarationAccurate)
          if (!declarationAccurate) {
            saveField('declarationDate', new Date().toISOString().split('T')[0])
          }
        }}>
          <input
            type="checkbox"
            checked={!!declarationAccurate}
            onChange={() => {}}
            style={{ accentColor: '#C9973A', width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}
          />
          <span style={{ fontSize: '12px', color: '#0D1B3E', fontWeight: 600, lineHeight: 1.5 }}>I confirm the above declaration is true and accurate</span>
        </div>

        {declarationAccurate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <CheckCircle size={16} color="#16A34A" />
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Declaration signed {declarationDate || 'today'}</span>
          </div>
        )}
      </div>

      {/* VALIDATION WARNING */}
      {!declarationAccurate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF3C7' }}>
          <AlertCircle size={14} color="#D97706" />
          <span style={{ fontSize: '12px', color: '#92400E' }}>Complete the declaration at the bottom of this step to continue to the next section</span>
        </div>
      )}
    </div>
  )
}
