'use client'

import { useState, useRef, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { useLocale } from '@/lib/locale/useLocale'

// Design system colors
const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  warmWhite: '#F7F4F0',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

// Constants
const LANGUAGES = ['English', 'French', 'Spanish', 'Tagalog', 'Mandarin', 'Cantonese', 'Hindi', 'Punjabi', 'Arabic', 'Portuguese', 'Other']
const FLUENCY_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native']
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const WORK_AUTH_OPTIONS = ['Citizen', 'Permanent Resident', 'Work Permit', 'Study Permit', 'Other']
const EMERGENCY_RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']

// Helper functions
function isOver18(dob: string): boolean {
  if (!dob) return false
  const birth = new Date(dob)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  return age > 18 || (age === 18 && m >= 0)
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3)
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6)
}

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
  required: {
    color: COLORS.red,
    marginLeft: '3px',
  },
  errorText: {
    fontSize: '12px',
    color: COLORS.red,
    marginTop: '4px',
  },
  section: {
    marginBottom: '32px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  tripleRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 100px',
    gap: '16px',
  },
}

export default function Step1Identity() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const { locale, config } = useLocale()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [zipLooking, setZipLooking] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photoUrl || null)
  const [focused, setFocused] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const provinceLabel = config?.provinceStateLabel || 'Province/State'
  const postalPlaceholder = config?.postalCodePlaceholder || '75034'
  const provinceOptions = config?.provinceStateOptions || []

  const getInputStyle = (field: string) => {
    let s = { ...styles.input }
    if (focused === field) {
      s = { ...s, ...styles.inputFocus }
    }
    if (touched[field] && errors[field]) {
      s = { ...s, ...styles.inputError }
    }
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

  const handleZipBlur = useCallback(async (zip: string) => {
    setTouched(prev => ({ ...prev, postalCode: true }))
    saveField('postalCode', zip)
    const clean = zip.replace(/\D/g, '')
    if (clean.length === 5) {
      setZipLooking(true)
      try {
        const res = await fetch('https://api.zippopotam.us/us/' + clean)
        if (res.ok) {
          const data = await res.json()
          if (data.places?.[0]) {
            saveField('city', data.places[0]['place name'])
            saveField('state', data.places[0]['state abbreviation'])
          }
        } else {
          setErrors(prev => ({ ...prev, postalCode: 'Invalid ZIP code' }))
        }
      } catch (e) {
        setErrors(prev => ({ ...prev, postalCode: 'Could not verify ZIP code' }))
      }
      finally { setZipLooking(false) }
    }
  }, [saveField])

  const handlePhotoClick = () => { fileInputRef.current?.click() }
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, photo: 'Please upload an image file' })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Photo must be under 5MB' })); return }
    const reader = new FileReader()
    reader.onload = (ev) => { 
      const dataUrl = ev.target?.result as string
      setPhotoPreview(dataUrl)
      saveField('photoUrl', dataUrl)
      // TODO: POST to /api/profile/upload-photo (route does not exist yet)
    }
    reader.readAsDataURL(file)
  }

  const toggleLanguage = useCallback((lang: string) => {
    const current = formData.languages || []
    saveField('languages', current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang])
  }, [formData.languages, saveField])

  const setFluency = useCallback((lang: string, level: string) => {
    saveField('languageFluency', { ...(formData.languageFluency || {}), [lang]: level })
  }, [formData.languageFluency, saveField])

  const updateEmergency = useCallback((field: string, value: string) => {
    saveField('emergencyContact', { ...(formData.emergencyContact || {}), [field]: value })
  }, [formData.emergencyContact, saveField])

  const bioCharCount = (formData.bio || '').length

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* SECTION: Personal Info */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Personal Info</div>
        <div style={styles.row}>
          <div>
            <label style={styles.label}>First name<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.firstName || ''}
              placeholder="Sarah"
              style={getInputStyle('firstName')}
              onChange={e => handleChange('firstName', e.target.value)}
              onFocus={() => setFocused('firstName')}
              onBlur={e => handleBlur('firstName', e.target.value, true)}
            />
            {touched.firstName && errors.firstName && <div style={styles.errorText}>{errors.firstName}</div>}
          </div>
          <div>
            <label style={styles.label}>Last name<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.lastName || ''}
              placeholder="Johnson"
              style={getInputStyle('lastName')}
              onChange={e => handleChange('lastName', e.target.value)}
              onFocus={() => setFocused('lastName')}
              onBlur={e => handleBlur('lastName', e.target.value, true)}
            />
            {touched.lastName && errors.lastName && <div style={styles.errorText}>{errors.lastName}</div>}
          </div>
        </div>
        <div style={{ ...styles.row, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>Preferred name</label>
            <input
              type="text"
              value={formData.preferredName || ''}
              placeholder="Sarah"
              style={getInputStyle('preferredName')}
              onChange={e => handleChange('preferredName', e.target.value)}
              onFocus={() => setFocused('preferredName')}
              onBlur={e => handleBlur('preferredName', e.target.value)}
            />
          </div>
          <div>
            <label style={styles.label}>Job title<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.jobTitle || ''}
              placeholder="Personal Support Worker"
              style={getInputStyle('jobTitle')}
              onChange={e => handleChange('jobTitle', e.target.value)}
              onFocus={() => setFocused('jobTitle')}
              onBlur={e => handleBlur('jobTitle', e.target.value, true)}
            />
            {touched.jobTitle && errors.jobTitle && <div style={styles.errorText}>{errors.jobTitle}</div>}
          </div>
        </div>
        <div style={{ ...styles.row, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>Gender</label>
            <select
              value={formData.gender || ''}
              style={getInputStyle('gender')}
              onChange={e => handleChange('gender', e.target.value)}
              onFocus={() => setFocused('gender')}
              onBlur={e => handleBlur('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Date of birth<span style={styles.required}>*</span></label>
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              style={getInputStyle('dateOfBirth')}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              onFocus={() => setFocused('dateOfBirth')}
              onBlur={e => handleBlur('dateOfBirth', e.target.value, true)}
            />
            {touched.dateOfBirth && errors.dateOfBirth && <div style={styles.errorText}>{errors.dateOfBirth}</div>}
          </div>
        </div>
      </div>

      {/* SECTION: Photo */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            onClick={handlePhotoClick}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer',
              overflow: 'hidden',
              border: photoPreview ? '3px solid ' + COLORS.gold : '2px dashed #CBD5E1',
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', color: '#94A3B8' }}>+</span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handlePhotoClick}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                color: COLORS.navy,
                cursor: 'pointer',
                marginBottom: '4px',
              }}
            >
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>JPG or PNG · Max 5MB</div>
            {errors.photo && <div style={styles.errorText}>{errors.photo}</div>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>
      </div>

      {/* SECTION: Contact & Location */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Contact & Location</div>
        <div style={styles.row}>
          <div>
            <label style={styles.label}>Phone<span style={styles.required}>*</span></label>
            <input
              type="tel"
              value={formData.phone || ''}
              placeholder="(555) 123-4567"
              style={getInputStyle('phone')}
              onChange={e => handleChange('phone', formatPhone(e.target.value))}
              onFocus={() => setFocused('phone')}
              onBlur={e => handleBlur('phone', e.target.value, true)}
            />
            {touched.phone && errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
          </div>
          <div>
            <label style={styles.label}>Province/State<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.state || ''}
              placeholder="TX"
              style={getInputStyle('state')}
              onChange={e => handleChange('state', e.target.value.toUpperCase())}
              onFocus={() => setFocused('state')}
              onBlur={e => handleBlur('state', e.target.value, true)}
            />
            {touched.state && errors.state && <div style={styles.errorText}>{errors.state}</div>}
          </div>
        </div>
        <div style={{ ...styles.row, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>City<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.city || ''}
              placeholder="Frisco"
              style={getInputStyle('city')}
              onChange={e => handleChange('city', e.target.value)}
              onFocus={() => setFocused('city')}
              onBlur={e => handleBlur('city', e.target.value, true)}
            />
            {touched.city && errors.city && <div style={styles.errorText}>{errors.city}</div>}
          </div>
          <div>
            <label style={styles.label}>Postal code<span style={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.postalCode || ''}
              placeholder="75034"
              maxLength={10}
              style={getInputStyle('postalCode')}
              onChange={e => handleChange('postalCode', e.target.value)}
              onFocus={() => setFocused('postalCode')}
              onBlur={e => handleZipBlur(e.target.value)}
            />
            {zipLooking && <div style={{ fontSize: '12px', color: COLORS.gold, marginTop: '4px' }}>Looking up...</div>}
            {touched.postalCode && errors.postalCode && <div style={styles.errorText}>{errors.postalCode}</div>}
          </div>
        </div>
      </div>

      {/* SECTION: Bio */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Bio</div>
        <label style={styles.label}>Professional bio<span style={styles.required}>*</span></label>
        <textarea
          value={formData.bio || ''}
          placeholder="Tell agencies who you are..."
          rows={4}
          maxLength={500}
          style={{ ...getInputStyle('bio'), resize: 'vertical', minHeight: '100px' }}
          onChange={e => handleChange('bio', e.target.value)}
          onFocus={() => setFocused('bio')}
          onBlur={e => handleBlur('bio', e.target.value, true)}
          spellCheck={true}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: bioCharCount > 450 ? COLORS.red : '#94A3B8' }}>
            {bioCharCount}/500 characters
          </span>
        </div>
        {touched.bio && errors.bio && <div style={styles.errorText}>{errors.bio}</div>}
      </div>

      {/* SECTION: Languages */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Languages</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {LANGUAGES.map(lang => {
            const selected = (formData.languages || []).includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: selected ? '2px solid ' + COLORS.gold : '2px solid #E2E8F0',
                  backgroundColor: selected ? '#FDF6EC' : 'white',
                  color: selected ? '#92400E' : '#64748B',
                }}
              >
                {lang}
              </button>
            )
          })}
        </div>
        {(formData.languages || []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(formData.languages || []).map(lang => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: COLORS.navy }}>{lang}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {FLUENCY_LEVELS.map(level => {
                    const active = (formData.languageFluency || {})[lang] === level
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFluency(lang, level)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          border: active ? '1.5px solid ' + COLORS.gold : '1.5px solid #E2E8F0',
                          backgroundColor: active ? '#FDF6EC' : 'white',
                          color: active ? '#92400E' : '#64748B',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: Work Authorisation */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Work Authorisation</div>
        <select
          value={String(formData.workAuthorisation || '')}
          style={getInputStyle('workAuthorisation')}
          onChange={e => handleChange('workAuthorisation', e.target.value)}
          onFocus={() => setFocused('workAuthorisation')}
          onBlur={e => handleBlur('workAuthorisation', e.target.value, true)}
        >
          <option value="">Select authorization status</option>
          {WORK_AUTH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {touched.workAuthorisation && errors.workAuthorisation && <div style={styles.errorText}>{errors.workAuthorisation}</div>}
      </div>

      {/* SECTION: Sponsorship */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Work Sponsorship</div>
        <select
          value={String((formData as any).sponsorshipNeeded || '')}
          style={getInputStyle('sponsorshipNeeded')}
          onChange={e => handleChange('sponsorshipNeeded', e.target.value)}
          onFocus={() => setFocused('sponsorshipNeeded')}
          onBlur={e => handleBlur('sponsorshipNeeded', e.target.value)}
        >
          <option value="">Select...</option>
          <option value="No — I am fully authorised to work independently">No — I am fully authorised to work independently</option>
          <option value="Yes — I may require sponsorship in the future">Yes — I may require sponsorship in the future</option>
          <option value="Yes — I currently require sponsorship">Yes — I currently require sponsorship</option>
        </select>
        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
          Will you now or in the future require sponsorship or support to work in {locale === 'CA' ? 'Canada' : 'the USA'}?
        </p>
      </div>

      {/* SECTION: Emergency Contact (collapsible) */}
      <div style={styles.section}>
        <button
          type="button"
          onClick={() => setEmergencyOpen(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: COLORS.navy,
          }}
        >
          <span>Emergency contact <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optional)</span></span>
          <span style={{ fontSize: '18px', color: '#64748B' }}>{emergencyOpen ? '−' : '+'}</span>
        </button>
        {emergencyOpen && (
          <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#FAFAFA' }}>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={(formData.emergencyContact as any)?.name || ''}
                  placeholder="Jane Johnson"
                  style={getInputStyle('emergencyName')}
                  onChange={e => updateEmergency('name', e.target.value)}
                  onFocus={() => setFocused('emergencyName')}
                  onBlur={e => handleBlur('emergencyName', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  value={(formData.emergencyContact as any)?.phone || ''}
                  placeholder="(555) 123-4567"
                  style={getInputStyle('emergencyPhone')}
                  onChange={e => updateEmergency('phone', formatPhone(e.target.value))}
                  onFocus={() => setFocused('emergencyPhone')}
                  onBlur={e => handleBlur('emergencyPhone', e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Relationship</label>
              <select
                value={(formData.emergencyContact as any)?.relationship || ''}
                style={{ ...getInputStyle('emergencyRelationship'), maxWidth: '240px' }}
                onChange={e => updateEmergency('relationship', e.target.value)}
                onFocus={() => setFocused('emergencyRelationship')}
                onBlur={e => handleBlur('emergencyRelationship', e.target.value)}
              >
                <option value="">Select relationship</option>
                {EMERGENCY_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}