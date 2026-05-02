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

const AVAILABILITY_STATUSES = [
  { value: 'available_now', label: 'Available Now' },
  { value: 'available_soon', label: 'Available Soon (within 2 weeks)' },
  { value: 'unavailable', label: 'Unavailable (employed)' },
  { value: 'open_to_opportunities', label: 'Open to opportunities' }
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHIFTS = [
  { key: 'morning', label: 'Morning 6am–12pm' },
  { key: 'afternoon', label: 'Afternoon 12pm–6pm' },
  { key: 'evening', label: 'Evening 6pm–11pm' },
  { key: 'overnight', label: 'Overnight 11pm–6am' }
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'casual', label: 'Casual/On-call' },
  { value: 'contract', label: 'Contract' },
  { value: 'open_to_any', label: 'Open to any' }
]

const PLACEMENT_TYPES = [
  'Live-in', 'Live-out', 'Overnight', 'Respite', 'Temporary', 'Permanent'
]

const NOTICE_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
  { value: 'negotiable', label: 'Currently employed — negotiable' }
]

const AGE_GROUPS = [
  { value: 'no_preference', label: 'No preference' },
  { value: 'children', label: 'Children (0–17)' },
  { value: 'adults', label: 'Adults (18–64)' },
  { value: 'seniors', label: 'Seniors (65+)' },
  { value: 'any_age', label: 'Any age' }
]

const CARE_SETTINGS = [
  'Private home', 'Retirement residence', 'Assisted living',
  'Long-term care', 'Hospital', 'Group home', 'Day program'
]

const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  inputFocus: {
    borderColor: '#C9973A',
    boxShadow: '0 0 0 3px rgba(201,151,58,0.15)',
  },
  inputError: {
    border: '2px solid #DC2626',
    backgroundColor: '#FEF2F2',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  },
  errorText: {
    fontSize: '12px',
    color: '#DC2626',
    marginTop: '4px',
  },
  section: {
    marginBottom: '32px',
  },
}

export default function Step3Availability() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [focused, setFocused] = useState<string | null>(null)

  const availabilityStatus = formData.availabilityStatus || ''
  const weeklyGrid = formData.weeklyGrid || {}
  const minHours = formData.minHoursPerWeek
  const maxHours = formData.maxHoursPerWeek
  const placementTypes = formData.placementTypes || []
  const employmentType = formData.employmentType
  const hourlyRate = formData.hourlyRateMin
  const hourlyRateMax = formData.hourlyRateMax
  const preferredAgeGroup = formData.preferredAgeGroup
  const preferredSettings = formData.preferredSettings || []
  const yearsInPreferredSettings = (formData as any).yearsInPreferredSettings

  const getInputStyle = (field: string) => {
    let s = { ...styles.input }
    if (focused === field) s = { ...s, ...styles.inputFocus }
    if (touched[field] && errors[field]) s = { ...s, ...styles.inputError }
    return s
  }

  const handleChange = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: any, required?: boolean) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (required && !value) {
      setErrors(prev => ({ ...prev, [field]: 'This field is required' }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
    saveField(field as any, value)
  }, [saveField])

  const toggleGridCell = (day: string, shift: string) => {
    const key = `${day}_${shift}`
    const currentValue = weeklyGrid[key]
    const currentArray: string[] = Array.isArray(currentValue) ? currentValue : []
    const updated = { ...weeklyGrid }
    if (currentArray.includes(shift)) {
      updated[key] = currentArray.filter(s => s !== shift)
    } else {
      updated[key] = [...currentArray, shift]
    }
    saveField('weeklyGrid', updated)
  }

  const isGridCellActive = (day: string, shift: string): boolean => {
    const key = `${day}_${shift}`
    const cellValue = weeklyGrid[key]
    return Array.isArray(cellValue) && cellValue.includes(shift)
  }

  const toggleAllShift = (shift: string) => {
    const updated = { ...weeklyGrid }
    const shouldSelect = !DAYS.some(day => isGridCellActive(day, shift))
    DAYS.forEach(day => {
      const key = `${day}_${shift}`
      if (shouldSelect) { updated[key] = [shift] } else { delete updated[key] }
    })
    saveField('weeklyGrid', updated)
  }

  const toggleAllDay = (day: string) => {
    const updated = { ...weeklyGrid }
    const shouldSelect = !SHIFTS.some(s => isGridCellActive(day, s.key))
    SHIFTS.forEach(shift => {
      const key = `${day}_${shift.key}`
      if (shouldSelect) { updated[key] = [shift.key] } else { delete updated[key] }
    })
    saveField('weeklyGrid', updated)
  }

  const togglePlacement = (type: string) => {
    const updated = placementTypes.includes(type)
      ? placementTypes.filter((t: string) => t !== type)
      : [...placementTypes, type]
    saveField('placementTypes', updated)
  }

  const toggleSettings = (setting: string) => {
    const updated = preferredSettings.includes(setting)
      ? preferredSettings.filter((s: string) => s !== setting)
      : [...preferredSettings, setting]
    saveField('preferredSettings', updated)
  }

  const validateHours = () => {
    if (minHours && maxHours && maxHours < minHours) {
      setErrors(prev => ({ ...prev, maxHoursPerWeek: 'Max hours must be >= min hours' }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.maxHoursPerWeek; return n })
    }
  }

  const validateRate = () => {
    if (hourlyRate && hourlyRateMax && hourlyRateMax < hourlyRate) {
      setErrors(prev => ({ ...prev, hourlyRateMax: 'Max rate must be >= min rate' }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.hourlyRateMax; return n })
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#0D1B3E' }}>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Availability Status</div>
        <select
          value={availabilityStatus}
          style={getInputStyle('availabilityStatus')}
          onChange={e => handleChange('availabilityStatus', e.target.value)}
          onFocus={() => setFocused('availabilityStatus')}
          onBlur={e => handleBlur('availabilityStatus', e.target.value, true)}
        >
          <option value="">Select availability status</option>
          {AVAILABILITY_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {touched.availabilityStatus && errors.availabilityStatus && (
          <div style={styles.errorText}>{errors.availabilityStatus}</div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Weekly Availability Grid</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px' }}></th>
                {SHIFTS.map(shift => (
                  <th key={shift.key} style={{ padding: '8px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textAlign: 'center' }}>
                    <button type="button" onClick={() => toggleAllShift(shift.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                      {shift.label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{ padding: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', width: '80px' }}>
                    <button type="button" onClick={() => toggleAllDay(day)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                      {day}
                    </button>
                  </td>
                  {SHIFTS.map(shift => {
                    const isActive = isGridCellActive(day, shift.key)
                    return (
                      <td key={day + '_' + shift.key} style={{ padding: '4px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleGridCell(day, shift.key)}
                          style={{
                            width: 40, height: 40, borderRadius: '8px',
                            border: isActive ? 'none' : '1px solid #E2E8F0',
                            background: isActive ? '#C9973A' : 'white',
                            color: isActive ? '#0D1B3E' : '#94A3B8',
                            fontWeight: isActive ? 800 : 400,
                            cursor: 'pointer', fontSize: '16px',
                          }}
                        >
                          {isActive ? '✓' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Hours & Placement</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={styles.label}>Min hours/week</label>
            <input
              type="number" min="1" max="80"
              value={minHours || ''}
              placeholder="1"
              style={getInputStyle('minHoursPerWeek')}
              onChange={e => handleChange('minHoursPerWeek', parseInt(e.target.value) || 0)}
              onFocus={() => setFocused('minHoursPerWeek')}
              onBlur={e => handleBlur('minHoursPerWeek', e.target.value)}
            />
          </div>
          <div>
            <label style={styles.label}>Max hours/week</label>
            <input
              type="number" min="1" max="80"
              value={maxHours || ''}
              placeholder="80"
              style={getInputStyle('maxHoursPerWeek')}
              onChange={e => handleChange('maxHoursPerWeek', parseInt(e.target.value) || 0)}
              onFocus={() => setFocused('maxHoursPerWeek')}
              onBlur={e => { handleBlur('maxHoursPerWeek', e.target.value); validateHours() }}
            />
            {touched.maxHoursPerWeek && errors.maxHoursPerWeek && (
              <div style={styles.errorText}>{errors.maxHoursPerWeek}</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Employment type</label>
          <select
            value={employmentType || ''}
            style={getInputStyle('employmentType')}
            onChange={e => handleChange('employmentType', e.target.value)}
            onFocus={() => setFocused('employmentType')}
            onBlur={e => handleBlur('employmentType', e.target.value)}
          >
            <option value="">Select employment type</option>
            {EMPLOYMENT_TYPES.map(emp => (
              <option key={emp.value} value={emp.value}>{emp.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Placement types</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {PLACEMENT_TYPES.map(type => {
              const selected = placementTypes.includes(type)
              return (
                <button
                  key={type} type="button"
                  onClick={() => togglePlacement(type)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    border: selected ? '2px solid #0D1B3E' : '1px solid #E2E8F0',
                    backgroundColor: selected ? '#EFF6FF' : 'white',
                    color: selected ? '#0D1B3E' : '#64748B',
                  }}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(formData as any).openToUrgent || false}
              onChange={e => handleChange('openToUrgent', e.target.checked)}
              style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>Available for urgent/emergency placements</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.holidayAvailable || false}
              onChange={e => handleChange('holidayAvailable', e.target.checked)}
              style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>Available on holidays</span>
          </label>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Notice Period</div>
        <select
          value={formData.noticePeriod || ''}
          style={getInputStyle('noticePeriod')}
          onChange={e => handleChange('noticePeriod', e.target.value)}
          onFocus={() => setFocused('noticePeriod')}
          onBlur={e => handleBlur('noticePeriod', e.target.value)}
        >
          <option value="">Select notice period</option>
          {NOTICE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Client Preferences</div>
        <div>
          <label style={styles.label}>Preferred age group</label>
          <select
            value={preferredAgeGroup || ''}
            style={getInputStyle('preferredAgeGroup')}
            onChange={e => handleChange('preferredAgeGroup', e.target.value)}
            onFocus={() => setFocused('preferredAgeGroup')}
            onBlur={e => handleBlur('preferredAgeGroup', e.target.value)}
          >
            <option value="">Select preferred age group</option>
            {AGE_GROUPS.map(age => (
              <option key={age.value} value={age.value}>{age.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Preferred care settings</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {CARE_SETTINGS.map(setting => {
              const selected = preferredSettings.includes(setting)
              return (
                <button
                  key={setting} type="button"
                  onClick={() => toggleSettings(setting)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0',
                    backgroundColor: selected ? '#FDF6EC' : 'white',
                    color: selected ? '#92400E' : '#64748B',
                  }}
                >
                  {setting}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Years of experience in preferred settings</label>
          <input
            type="number" min="0" max="50"
            value={yearsInPreferredSettings || ''}
            placeholder="e.g. 5"
            style={getInputStyle('yearsInPreferredSettings')}
            onChange={e => handleChange('yearsInPreferredSettings', parseInt(e.target.value) || 0)}
            onFocus={() => setFocused('yearsInPreferredSettings')}
            onBlur={e => handleBlur('yearsInPreferredSettings', e.target.value)}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>Hourly Rate Range (CAD/USD)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={styles.label}>Minimum desired rate</label>
            <input
              type="number" min="15" max="200"
              value={hourlyRate || ''}
              placeholder="25"
              style={getInputStyle('hourlyRateMin')}
              onChange={e => handleChange('hourlyRateMin', parseInt(e.target.value) || 0)}
              onFocus={() => setFocused('hourlyRateMin')}
              onBlur={e => handleBlur('hourlyRateMin', e.target.value)}
            />
          </div>
          <div>
            <label style={styles.label}>Maximum desired rate</label>
            <input
              type="number" min="15" max="200"
              value={hourlyRateMax || ''}
              placeholder="50"
              style={getInputStyle('hourlyRateMax')}
              onChange={e => handleChange('hourlyRateMax', parseInt(e.target.value) || 0)}
              onFocus={() => setFocused('hourlyRateMax')}
              onBlur={e => { handleBlur('hourlyRateMax', e.target.value); validateRate() }}
            />
            {touched.hourlyRateMax && errors.hourlyRateMax && (
              <div style={styles.errorText}>{errors.hourlyRateMax}</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
