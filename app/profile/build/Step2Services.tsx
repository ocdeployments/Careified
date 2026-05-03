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

const CLIENT_TYPES = [
  'Elderly/Seniors', 'Adults with Disabilities', 'Children with Special Needs',
  'Post-surgical Recovery', 'Palliative/Hospice', 'Brain Injury',
  'Acquired Disability', 'Mental Health Needs', 'Bariatric Care', 'Veterans'
]

const SERVICE_CATEGORIES = [
  {
    category: 'Personal Care',
    services: ['Bathing & Grooming', 'Dressing Assistance', 'Toileting & Continence Care',
      'Mobility Assistance', 'Transfer & Positioning', 'Feeding Assistance']
  },
  {
    category: 'Health Support',
    services: ['Medication Reminders', 'Vital Signs Monitoring', 'Wound Care Support',
      'Post-operative Care', 'Catheter Care', 'Ostomy Care', 'Tube Feeding Support']
  },
  {
    category: 'Cognitive & Emotional',
    services: ['Dementia Care', "Alzheimer's Care", 'Companionship', 'Mental Health Support',
      'Behaviour Support', 'Validation Therapy']
  },
  {
    category: 'Household',
    services: ['Light Housekeeping', 'Meal Preparation', 'Grocery Shopping', 'Laundry',
      'Errands & Transportation', 'Pet Care']
  },
  {
    category: 'Specialized',
    services: ['Palliative Care', 'Respite Care', 'Overnight Care', 'Live-in Care',
      'Paediatric Care', 'Brain Injury Rehabilitation Support']
  }
]

const SKILL_LEVELS = [
  { value: 'learning', label: 'Learning' },
  { value: 'competent', label: 'Competent' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'specialist', label: 'Specialist' }
]

const DIETARY_OPTIONS = [
  'Diabetic-friendly', 'Low sodium', 'Pureed/soft foods', 'Halal', 'Kosher',
  'Vegetarian', 'Vegan', 'Gluten-free', 'Allergen-aware', 'Cultural/ethnic cuisine',
  'Tube feeding support'
]

const UNWILLING_TASKS = [
  'Bathing opposite gender', 'Catheter care', 'Ostomy care',
  'Wound care', 'Bowel care', 'Tube feeding', 'Heavy lifting (50+ lbs)',
  'Driving clients', 'Smoking household', 'Pet households', 'Night shifts',
  'Behaviour support'
]

const DIAGNOSES = [
  "Alzheimer's/Dementia", "Parkinson's", 'Stroke Recovery', 'Diabetes',
  'Mobility/Fall Risk', 'Hospice/Palliative', 'Post-Surgical',
  'Incontinence Care', 'Mental Health', 'Spinal Cord Injury',
  'Developmental Disability', 'Pediatric/Special Needs'
]

const DIAGNOSIS_YEARS = [
  { value: 'lt1', label: 'Less than 1 year' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5+', label: '5+ years' },
]

const ADLS = [
  'Bathing', 'Dressing', 'Grooming', 'Toileting', 'Incontinence care',
  'Transfers (bed/chair)', 'Ambulation/walking', 'Feeding', 'Meal preparation',
  'Medication reminders', 'Repositioning', 'Range of motion',
  'Wound care observation', 'Oxygen monitoring', 'Hoyer lift operation',
  'Gait belt use', 'Two-person transfers', 'Catheter care'
]

const ADL_FREQUENCY = [
  { value: 'every_shift', label: 'Every shift' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Few times/week' },
  { value: 'occasional', label: 'Occasionally' },
]

const TECHNIQUES = [
  'Dementia redirection', 'Sundowning management', 'Wandering supervision',
  'Behaviour de-escalation', 'Thickened liquids', 'Diabetic meal prep',
  'Special diets', 'EVV/digital charting', 'Electronic documentation',
  'Palliative comfort care', 'Post-op wound observation', 'Fall prevention protocols'
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
  inputError: {
    border: '2px solid ' + COLORS.red,
    backgroundColor: COLORS.errorBg,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  },
  required: { color: COLORS.red, marginLeft: '3px' },
  errorText: { fontSize: '12px', color: COLORS.red, marginTop: '4px' },
  section: { marginBottom: '32px' },
  helperText: { fontSize: '12px', color: '#94A3B8', marginBottom: '12px' },
}

export default function Step2Services() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  const services = formData.services || []
  const skillRatings = formData.skillRatings || {}
  const clientTypes = formData.clientTypes || []
  const dietaryCooking = formData.dietaryCooking || []
  const unwillingTasks = formData.unwillingTasks || []
  const diagnosisExperience: Record<string, string> = (formData as any).diagnosisExperience || {}
  const adlsPerformed: Record<string, string> = (formData as any).adlsPerformed || {}
  const specializedTechniques: string[] = (formData as any).specializedTechniques || []

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

  const toggleCategory = useCallback((id: string) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const toggleService = useCallback((service: string) => {
    const updated = services.includes(service)
      ? services.filter((s: string) => s !== service)
      : [...services, service]
    saveField('services', updated)
    setTouched(prev => ({ ...prev, services: true }))
    if (updated.length === 0) {
      setErrors(prev => ({ ...prev, services: 'Select at least one service' }))
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.services; return n })
    }
  }, [services, saveField])

  const setSkillRating = useCallback((service: string, level: string) => {
    saveField('skillRatings', { ...skillRatings, [service]: level })
  }, [skillRatings, saveField])

  const toggleClientType = useCallback((type: string) => {
    const updated = clientTypes.includes(type)
      ? clientTypes.filter((t: string) => t !== type)
      : [...clientTypes, type]
    saveField('clientTypes', updated)
  }, [clientTypes, saveField])

  const toggleDietary = useCallback((option: string) => {
    const updated = dietaryCooking.includes(option)
      ? dietaryCooking.filter((d: string) => d !== option)
      : [...dietaryCooking, option]
    saveField('dietaryCooking', updated)
  }, [dietaryCooking, saveField])

  const toggleUnwilling = useCallback((task: string) => {
    const updated = unwillingTasks.includes(task)
      ? unwillingTasks.filter((t: string) => t !== task)
      : [...unwillingTasks, task]
    saveField('unwillingTasks', updated)
  }, [unwillingTasks, saveField])

  const toggleDiagnosis = useCallback((diagnosis: string) => {
    const updated = { ...diagnosisExperience }
    if (updated[diagnosis]) {
      delete updated[diagnosis]
    } else {
      updated[diagnosis] = '1-2'
    }
    saveField('diagnosisExperience' as any, updated)
  }, [diagnosisExperience, saveField])

  const setDiagnosisYears = useCallback((diagnosis: string, years: string) => {
    saveField('diagnosisExperience' as any, { ...diagnosisExperience, [diagnosis]: years })
  }, [diagnosisExperience, saveField])

  const toggleADL = useCallback((adl: string) => {
    const updated = { ...adlsPerformed }
    if (updated[adl]) {
      delete updated[adl]
    } else {
      updated[adl] = 'every_shift'
    }
    saveField('adlsPerformed' as any, updated)
  }, [adlsPerformed, saveField])

  const setADLFrequency = useCallback((adl: string, freq: string) => {
    saveField('adlsPerformed' as any, { ...adlsPerformed, [adl]: freq })
  }, [adlsPerformed, saveField])

  const toggleTechnique = useCallback((technique: string) => {
    const updated = specializedTechniques.includes(technique)
      ? specializedTechniques.filter((t: string) => t !== technique)
      : [...specializedTechniques, technique]
    saveField('specializedTechniques' as any, updated)
  }, [specializedTechniques, saveField])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>

      {/* SECTION: Experience Level */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Experience Level</div>
        <label style={styles.label}>
          Years of caregiving experience<span style={styles.required}>*</span>
        </label>
        <input
          type="number" min="0" max="50"
          value={formData.yearsExperience || ''}
          placeholder="0"
          style={getInputStyle('yearsExperience')}
          onChange={e => handleChange('yearsExperience', parseInt(e.target.value) || 0)}
          onFocus={() => setFocused('yearsExperience')}
          onBlur={e => handleBlur('yearsExperience', e.target.value, true)}
        />
        {touched.yearsExperience && errors.yearsExperience && (
          <div style={styles.errorText}>{errors.yearsExperience}</div>
        )}
      </div>

      {/* SECTION: Client Types */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Client Types</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CLIENT_TYPES.map(type => {
            const selected = clientTypes.includes(type)
            return (
              <button key={type} type="button" onClick={() => toggleClientType(type)} style={{
                padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: selected ? '2px solid ' + COLORS.navy : '2px solid ' + COLORS.border,
                backgroundColor: selected ? '#EFF6FF' : 'white',
                color: selected ? COLORS.navy : COLORS.slate,
              }}>
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECTION: Diagnosis Experience */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Diagnosis Experience</div>
        <p style={styles.helperText}>Select diagnoses you have hands-on experience with. Agencies match by this.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DIAGNOSES.map(diagnosis => {
            const selected = !!diagnosisExperience[diagnosis]
            return (
              <div key={diagnosis} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                border: selected ? '1px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                background: selected ? '#FDF6EC' : 'white',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleDiagnosis(diagnosis)}
                    style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: selected ? 600 : 400, color: selected ? '#92400E' : COLORS.navy }}>
                    {diagnosis}
                  </span>
                </label>
                {selected && (
                  <select
                    value={diagnosisExperience[diagnosis] || '1-2'}
                    onChange={e => setDiagnosisYears(diagnosis, e.target.value)}
                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid ' + COLORS.border, marginLeft: '12px' }}
                  >
                    {DIAGNOSIS_YEARS.map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION: ADLs Performed */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>ADLs Performed</div>
        <p style={styles.helperText}>Select tasks you perform routinely. Agencies filter placements by this.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ADLS.map(adl => {
            const selected = !!adlsPerformed[adl]
            return (
              <div key={adl} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                border: selected ? '1px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                background: selected ? '#FDF6EC' : 'white',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleADL(adl)}
                    style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: selected ? 600 : 400, color: selected ? '#92400E' : COLORS.navy }}>
                    {adl}
                  </span>
                </label>
                {selected && (
                  <select
                    value={adlsPerformed[adl] || 'every_shift'}
                    onChange={e => setADLFrequency(adl, e.target.value)}
                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid ' + COLORS.border, marginLeft: '12px' }}
                  >
                    {ADL_FREQUENCY.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION: Specialized Techniques */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Specialized Techniques</div>
        <p style={styles.helperText}>Select any specialized skills or techniques you use.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TECHNIQUES.map(technique => {
            const selected = specializedTechniques.includes(technique)
            return (
              <button key={technique} type="button" onClick={() => toggleTechnique(technique)} style={{
                padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: selected ? '2px solid ' + COLORS.gold : '2px solid ' + COLORS.border,
                backgroundColor: selected ? '#FDF6EC' : 'white',
                color: selected ? '#92400E' : COLORS.slate,
              }}>
                {technique}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECTION: Services Offered */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Services Offered</div>
        {SERVICE_CATEGORIES.map(cat => {
          const catId = cat.category.toLowerCase().replace(/[^a-z]/g, '')
          const isOpen = openCategories[catId]
          const selectedInCat = cat.services.filter(s => services.includes(s)).length
          return (
            <div key={cat.category} style={{ border: '1px solid ' + COLORS.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <button type="button" onClick={() => toggleCategory(catId)} style={{
                width: '100%', padding: '12px 16px',
                backgroundColor: selectedInCat > 0 ? '#FAFDF7' : 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.navy }}>{cat.category}</span>
                  {selectedInCat > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#FDF6EC', color: '#92400E' }}>
                      {selectedInCat}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '14px', color: COLORS.slate }}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cat.services.map(service => {
                    const selected = services.includes(service)
                    const currentRating = skillRatings[service]
                    return (
                      <div key={service} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: '8px',
                        backgroundColor: selected ? '#FDF6EC' : 'white',
                        border: selected ? '1px solid ' + COLORS.gold : '1px solid transparent',
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleService(service)}
                            style={{ accentColor: COLORS.gold, width: '14px', height: '14px' }}
                          />
                          <span style={{ fontSize: '13px', color: selected ? '#92400E' : COLORS.navy, fontWeight: selected ? 600 : 400 }}>
                            {service}
                          </span>
                        </label>
                        {selected && (
                          <select
                            value={currentRating || ''}
                            onChange={e => setSkillRating(service, e.target.value)}
                            style={{ width: '180px', marginLeft: '12px', fontSize: '13px', padding: '4px 8px', borderRadius: '6px', border: '1px solid ' + COLORS.border }}
                          >
                            <option value="">Rate skill</option>
                            {SKILL_LEVELS.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {touched.services && errors.services && (
          <div style={styles.errorText}>{errors.services}</div>
        )}
      </div>

      {/* SECTION: Dietary */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Dietary & Nutrition Support</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DIETARY_OPTIONS.map(option => {
            const selected = dietaryCooking.includes(option)
            return (
              <button key={option} type="button" onClick={() => toggleDietary(option)} style={{
                padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: selected ? '2px solid ' + COLORS.gold : '2px solid ' + COLORS.border,
                backgroundColor: selected ? '#FDF6EC' : 'white',
                color: selected ? '#92400E' : COLORS.slate,
              }}>
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECTION: Unwilling Tasks */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Tasks you prefer not to perform</div>
        <p style={styles.helperText}>Agencies value honesty — select tasks you prefer not to perform (optional)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {UNWILLING_TASKS.map(task => {
            const selected = unwillingTasks.includes(task)
            return (
              <button key={task} type="button" onClick={() => toggleUnwilling(task)} style={{
                padding: '7px 13px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: selected ? '2px solid ' + COLORS.red : '2px solid ' + COLORS.border,
                backgroundColor: selected ? '#FEF2F2' : 'white',
                color: selected ? COLORS.red : COLORS.slate,
              }}>
                {task}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
