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

// Constants per spec
const TRAVEL_RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 30, label: '30 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km+' },
  { value: 999, label: 'No limit' }
]

const COMMON_AREAS = [
  'Downtown', 'North York', 'Scarborough', 'Etobicoke', 'Mississauga',
  'Brampton', 'Oakville', 'Markham', 'Richmond Hill', 'Vaughan',
  'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'
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
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  inputFocus: {
    borderColor: COLORS.gold,
    boxShadow: '0 0 0 3px rgba(201,151,58,0.15)',
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
  section: {
    marginBottom: '32px',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#F1F5F9',
    border: '1px solid #E2E8F0',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    gap: '6px',
    margin: '4px',
  },
  tagRemove: {
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '16px',
    border: 'none',
    background: 'none',
    padding: '0',
    lineHeight: 1,
  },
}

export default function Step4Location() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [focused, setFocused] = useState<string | null>(null)
  const [customArea, setCustomArea] = useState('')

  const serviceAreas = formData.serviceAreas || []
  const travelRadius = formData.travelRadius
  const hasDriversLicense = formData.hasDriversLicense
  const hasVehicle = formData.hasVehicle
  const willingToTransport = formData.willingToTransport
  const willingClientVehicle = formData.willingClientVehicle
  const transitAccessible = formData.transitAccessible

  const getInputStyle = (field: string) => {
    let s = { ...styles.input }
    if (focused === field) {
      s = { ...s, ...styles.inputFocus }
    }
    return s
  }

  const handleChange = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const addServiceArea = (area: string) => {
    if (!area.trim()) return
    if (!serviceAreas.includes(area.trim())) {
      saveField('serviceAreas', [...serviceAreas, area.trim()])
    }
    setCustomArea('')
  }

  const removeServiceArea = (area: string) => {
    saveField('serviceAreas', serviceAreas.filter(a => a !== area))
  }

  const addSuggestedArea = (area: string) => {
    if (!serviceAreas.includes(area)) {
      saveField('serviceAreas', [...serviceAreas, area])
    }
  }

  const cityFromStep1 = formData.city || ''

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* SECTION: Service Area */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Areas you are willing to work in</div>
        
        {/* Show current areas as tags */}
        {serviceAreas.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {serviceAreas.map(area => (
              <span key={area} style={styles.tag}>
                {area}
                <button type="button" onClick={() => removeServiceArea(area)} style={styles.tagRemove}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggestion buttons based on city from Step 1 */}
        {cityFromStep1 && !serviceAreas.includes(cityFromStep1) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '6px' }}>
              Based on your city:
            </div>
            <button
              type="button"
              onClick={() => addSuggestedArea(cityFromStep1)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid ' + COLORS.gold,
                backgroundColor: '#FDF6EC',
                color: '#92400E',
              }}
            >
              + Add {cityFromStep1}
            </button>
          </div>
        )}

        {/* Common areas */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '6px' }}>
            Popular areas:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {COMMON_AREAS.filter(a => !serviceAreas.includes(a)).map(area => (
              <button
                key={area}
                type="button"
                onClick={() => addSuggestedArea(area)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: '1px solid ' + COLORS.border,
                  backgroundColor: 'white',
                  color: COLORS.slate,
                }}
              >
                + {area}
              </button>
            ))}
          </div>
        </div>

        {/* Custom area input */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={customArea}
              placeholder="Add custom area..."
              style={getInputStyle('customArea')}
              onChange={e => setCustomArea(e.target.value)}
              onFocus={() => setFocused('customArea')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addServiceArea(customArea)
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => addServiceArea(customArea)}
            disabled={!customArea.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: customArea.trim() ? 'pointer' : 'not-allowed',
              border: 'none',
              backgroundColor: customArea.trim() ? COLORS.navy : '#E2E8F0',
              color: customArea.trim() ? 'white' : '#94A3B8',
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* SECTION: Travel */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Maximum travel distance from home</div>
        <select
          value={travelRadius || ''}
          style={getInputStyle('travelRadius')}
          onChange={e => handleChange('travelRadius', parseInt(e.target.value) || 0)}
          onFocus={() => setFocused('travelRadius')}
          onBlur={e => handleBlur('travelRadius', e.target.value)}
        >
          <option value="">Select travel radius</option>
          {TRAVEL_RADIUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={styles.helperText}>
          Agencies filter by this — be accurate
        </div>
      </div>

      {/* SECTION: Driving & Vehicle */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Driving & Vehicle</div>
        
        <label style={{ ...styles.checkboxLabel, marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={hasDriversLicense || false}
            onChange={e => handleChange('hasDriversLicense', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>I have a valid driver's licence</span>
        </label>

        {/* Conditional: drivers_license_class */}
        {hasDriversLicense && (
          <div style={{ marginLeft: '24px', marginBottom: '16px' }}>
            <label style={styles.label}>Licence class</label>
            <input
              type="text"
              value={(formData as any).driversLicenseClass || ''}
              placeholder="e.g. G, G2, Class 5"
              style={getInputStyle('driversLicenseClass')}
              onChange={e => handleChange('driversLicenseClass', e.target.value)}
              onFocus={() => setFocused('driversLicenseClass')}
              onBlur={e => handleBlur('driversLicenseClass', e.target.value)}
            />
          </div>
        )}

        <label style={{ ...styles.checkboxLabel, marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={hasVehicle || false}
            onChange={e => handleChange('hasVehicle', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>I have a personal vehicle</span>
        </label>

        <label style={{ ...styles.checkboxLabel, marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={willingToTransport || false}
            onChange={e => handleChange('willingToTransport', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>Willing to drive clients to appointments</span>
        </label>

        <label style={{ ...styles.checkboxLabel, marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={willingClientVehicle || false}
            onChange={e => handleChange('willingClientVehicle', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>Willing to use client's vehicle</span>
        </label>
      </div>

      {/* SECTION: Transit */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Transit</div>
        
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={transitAccessible || false}
            onChange={e => handleChange('transitAccessible', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>I can reliably commute by public transit</span>
        </label>
      </div>
    </div>
  )
}