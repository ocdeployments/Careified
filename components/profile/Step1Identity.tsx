'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { User, Mail, Phone, MapPin, Upload, Camera, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const fadeInUp = {
 hidden: { opacity: 0, y: 24 },
 visible: { opacity: 1, y: 0 }
};

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Tagalog', 'Hindi', 'Punjabi', 'Arabic', 'Portuguese', 'Vietnamese', 'Polish', 'Sign Language', 'Other']
const FLUENCY_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native']
const GENDER_OPTIONS = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Non-binary', label: 'Non-binary' }, { value: 'Prefer not to say', label: 'Prefer not to say' }]
const EMERGENCY_RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']

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

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', fontFamily: FONT_SANS }}>
        {label} {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>
      <p style={{ fontSize: '11px', color: hint ? '#94A3B8' : 'transparent', minHeight: '18px', marginTop: '2px', fontFamily: FONT_SANS }}>{hint || '‎'}</p>
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
      <AlertCircle size={12} color="#EF4444" />
      <span style={{ fontSize: '11px', color: '#EF4444', fontFamily: FONT_SANS }}>{message}</span>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#0D1B3E', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_SERIF, letterSpacing: '-0.02em' }}>{icon} {title}</h3>
      {subtitle && <p style={{ fontSize: '15px', color: '#64748B', margin: 0, fontFamily: FONT_SANS, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  )
}

export default function Step1Identity() {
  const { formData } = useProfileForm()
  const { saveField, saveStep, saveStatus } = useProfileSave()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [zipLooking, setZipLooking] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(formData.photoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Animation refs for scroll-triggered fade-in
  const languagesRef = useRef(null)
  const languagesInView = useInView(languagesRef, { once: true, margin: '-100px' })

  const handleChange = useCallback((field: string, value: any) => { saveField(field as any, value) }, [saveField])
  const handleBlur = useCallback((field: string, value: any, required?: boolean) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (required && !value) setErrors(prev => ({ ...prev, [field]: 'This field is required' }))
    else setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
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
        }
      } catch (e) { /* silent */ }
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
    reader.onload = (ev) => { const dataUrl = ev.target?.result as string; setPhotoPreview(dataUrl); saveField('photoUrl', dataUrl) }
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

  const inputStyle = (field: string) => ({
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid ' + (touched[field] && errors[field] ? '#EF4444' : touched[field] ? '#22C55E' : '#E2E8F0'),
    backgroundColor: 'white', fontSize: '13px', color: '#0D1B3E', outline: 'none', fontFamily: FONT_SANS, boxSizing: 'border-box' as const,
  })

  const HelperText = ({ children }: { children?: string }) => (
    <p style={{ fontSize: '12px', color: children ? '#64748B' : 'transparent', minHeight: '18px', marginBottom: '8px' }}>
      {children || '‎'}
    </p>
  )

  const bioWordCount = (formData.bio || '').trim().split(/\s+/).filter(Boolean).length

  return (
    <div style={{ fontFamily: FONT_SANS }}>
      <div style={{ backgroundColor: '#FDF6EC', border: '1px solid rgba(201,151,58,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <User size={18} color="#C9973A" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 3px' }}>Your professional identity</p>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>All fields marked * are required. Everything saves automatically.</p>
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon={<Camera size={16} color="#C9973A" />} title="Profile photo" subtitle="Profiles with photos get 4× more views." />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div onClick={handlePhotoClick} style={{ width: '96px', height: '96px', borderRadius: '50%', border: photoPreview ? '3px solid #C9973A' : '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
            {photoPreview ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={24} color="#94A3B8" />}
          </div>
          <div>
            <button type="button" onClick={handlePhotoClick} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, backgroundColor: 'white', border: '1.5px solid #E2E8F0', color: '#0D1B3E', cursor: 'pointer', fontFamily: FONT_SANS, display: 'block', marginBottom: '6px' }}>
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>JPG or PNG · Square · At least 400×400px · Max 5MB</p>
            {errors.photo && <FieldError message={errors.photo} />}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon={<User size={16} color="#C9973A" />} title="Your name" subtitle="Use your legal name as it appears on your ID." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <FieldLabel label="First name" required />
            <input type="text" value={formData.firstName || ''} placeholder="Sarah" onChange={e => handleChange('firstName', e.target.value)} onBlur={e => handleBlur('firstName', e.target.value, true)} style={inputStyle('firstName')} />
            {touched.firstName && errors.firstName && <FieldError message={errors.firstName} />}
          </div>
          <div>
            <FieldLabel label="Middle name" />
            <input type="text" value={formData.middleName || ''} placeholder="Marie" onChange={e => handleChange('middleName', e.target.value)} style={inputStyle('middleName')} />
          </div>
          <div>
            <FieldLabel label="Last name" required />
            <input type="text" value={formData.lastName || ''} placeholder="Johnson" onChange={e => handleChange('lastName', e.target.value)} onBlur={e => handleBlur('lastName', e.target.value, true)} style={inputStyle('lastName')} />
            {touched.lastName && errors.lastName && <FieldError message={errors.lastName} />}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <FieldLabel label="Preferred name" hint="What you like to be called" />
            <input type="text" value={formData.preferredName || ''} placeholder="Sarah" onChange={e => handleChange('preferredName', e.target.value)} style={inputStyle('preferredName')} />
          </div>
          <div>
            <FieldLabel label="Job title" hint="e.g. Personal Support Worker" />
            <input type="text" value={formData.jobTitle || ''} placeholder="Personal Support Worker" onChange={e => handleChange('jobTitle', e.target.value)} style={inputStyle('jobTitle')} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <FieldLabel label="Date of birth" required hint="Must be 18 or older" />
            <input type="date" value={formData.dateOfBirth || ''} onChange={e => handleChange('dateOfBirth', e.target.value)} onBlur={e => { handleBlur('dateOfBirth', e.target.value, true); if (e.target.value && !isOver18(e.target.value)) setErrors(prev => ({ ...prev, dateOfBirth: 'You must be 18 or older' })) }} style={inputStyle('dateOfBirth')} />
            {touched.dateOfBirth && errors.dateOfBirth && <FieldError message={errors.dateOfBirth} />}
          </div>
          <div>
            <FieldLabel label="Gender" required />
            <select value={formData.gender || ''} onChange={e => handleChange('gender', e.target.value)} onBlur={e => handleBlur('gender', e.target.value, true)} style={{ ...inputStyle('gender'), appearance: 'none' as const }}>
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            {touched.gender && errors.gender && <FieldError message={errors.gender} />}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon={<Mail size={16} color="#C9973A" />} title="Contact information" subtitle="Your phone is private." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <FieldLabel label="Phone number" required hint="SMS-capable" />
            <input type="tel" value={formData.phone || ''} placeholder="(555) 123-4567" onChange={e => handleChange('phone', formatPhone(e.target.value))} onBlur={e => { handleBlur('phone', e.target.value, true); if (e.target.value && e.target.value.replace(/\D/g, '').length < 10) setErrors(prev => ({ ...prev, phone: 'Enter a valid 10-digit number' })) }} style={inputStyle('phone')} />
            {touched.phone && errors.phone && <FieldError message={errors.phone} />}
          </div>
          <div>
            <FieldLabel label="Work authorisation" required />
            <select value={formData.workAuthorisation === true ? 'yes' : formData.workAuthorisation === false ? 'no' : ''} onChange={e => handleChange('workAuthorisation', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)} onBlur={e => handleBlur('workAuthorisation', e.target.value, true)} style={{ ...inputStyle('workAuthorisation'), appearance: 'none' as const }}>
              <option value="">Are you authorised to work?</option>
              <option value="yes">Yes — I am legally authorised</option>
              <option value="no">No — I need authorisation</option>
            </select>
            {touched.workAuthorisation && errors.workAuthorisation && <FieldError message={errors.workAuthorisation} />}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon={<MapPin size={16} color="#C9973A" />} title="Location" subtitle="ZIP code auto-fills city and state." />
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: '16px' }}>
          <div>
            <FieldLabel label="ZIP code" required />
            <input type="text" value={formData.postalCode || ''} placeholder="75034" maxLength={10} onChange={e => handleChange('postalCode', e.target.value)} onBlur={e => handleZipBlur(e.target.value)} style={inputStyle('postalCode')} />
            {zipLooking && <p style={{ fontSize: '11px', color: '#C9973A', marginTop: '4px' }}>Looking up...</p>}
          </div>
          <div>
            <FieldLabel label="City" required />
            <input type="text" value={formData.city || ''} placeholder="Frisco" onChange={e => handleChange('city', e.target.value)} onBlur={e => handleBlur('city', e.target.value, true)} style={inputStyle('city')} />
            {touched.city && errors.city && <FieldError message={errors.city} />}
          </div>
          <div>
            <FieldLabel label="State" required />
            <input type="text" value={formData.state || ''} placeholder="TX" maxLength={2} onChange={e => handleChange('state', e.target.value.toUpperCase())} onBlur={e => handleBlur('state', e.target.value, true)} style={inputStyle('state')} />
            {touched.state && errors.state && <FieldError message={errors.state} />}
          </div>
        </div>
      </div>

      <motion.div ref={languagesRef} initial="hidden" animate={languagesInView ? "visible" : "hidden"} variants={fadeInUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: '36px' }}>
        <SectionHeader icon={null} title="Languages spoken" subtitle="Select all that apply. Then set your fluency level." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {LANGUAGES.map(lang => {
            const selected = (formData.languages || []).includes(lang)
            return (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, border: selected ? '2px solid #C9973A' : '2px solid #E2E8F0', backgroundColor: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS }}>
                {lang}
              </button>
            )
          })}
        </div>
        {(formData.languages || []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(formData.languages || []).map(lang => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E', fontFamily: FONT_SANS }}>{lang}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {FLUENCY_LEVELS.map(level => {
                    const active = (formData.languageFluency || {})[lang] === level
                    return (
                      <button key={level} type="button" onClick={() => setFluency(lang, level)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: active ? 700 : 500, border: active ? '1.5px solid #C9973A' : '1.5px solid #E2E8F0', backgroundColor: active ? '#FDF6EC' : 'white', color: active ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS }}>
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div style={{ marginBottom: '36px' }}>
        <FieldLabel label="Professional bio" hint="150–300 words recommended." />
        <textarea value={formData.bio || ''} placeholder="Tell agencies who you are..." rows={5} onChange={e => handleChange('bio', e.target.value)} onBlur={e => handleBlur('bio', e.target.value)} style={{ ...inputStyle('bio'), resize: 'vertical', lineHeight: 1.6, padding: '14px 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontSize: '11px', color: bioWordCount < 50 ? '#94A3B8' : bioWordCount <= 300 ? '#16A34A' : '#EF4444', fontFamily: FONT_SANS }}>
            {bioWordCount} words {bioWordCount < 50 && '— aim for at least 150'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button type="button" onClick={() => setEmergencyOpen(prev => !prev)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer', fontFamily: FONT_SANS }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>Emergency contact <span style={{ fontSize: '11px', fontWeight: 400, color: '#94A3B8', marginLeft: '8px' }}>(optional)</span></span>
          {emergencyOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
        </button>
        {emergencyOpen && (
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 10px 10px', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <FieldLabel label="Full name" />
                <input type="text" value={(formData.emergencyContact as any)?.name || ''} placeholder="Jane Johnson" onChange={e => updateEmergency('name', e.target.value)} style={inputStyle('emergencyName')} />
              </div>
              <div>
                <FieldLabel label="Phone number" />
                <input type="tel" value={(formData.emergencyContact as any)?.phone || ''} placeholder="(555) 123-4567" onChange={e => updateEmergency('phone', formatPhone(e.target.value))} style={inputStyle('emergencyPhone')} />
              </div>
            </div>
            <div>
              <FieldLabel label="Relationship" />
              <select value={(formData.emergencyContact as any)?.relationship || ''} onChange={e => updateEmergency('relationship', e.target.value)} style={{ ...inputStyle('emergencyRelationship'), appearance: 'none' as const, maxWidth: '240px' }}>
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
