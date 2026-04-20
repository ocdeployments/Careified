'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { User, Mail, MapPin, Upload, Camera, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { generateBio } from '@/lib/profile-templates'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
}

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
    <div className="mb-2">
      <label className="block text-[13px] font-semibold text-navy">
        {label} {required && <span className="text-red-500 ml-[3px]">*</span>}
      </label>
      <p className={`text-[11px] min-h-[18px] mt-0.5 ${hint ? 'text-slate-400' : 'text-transparent'}`}>
        {hint || '\u200E'}
      </p>
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1 mt-[5px]">
      <AlertCircle size={12} className="text-red-500" />
      <span className="text-[11px] text-red-500">{message}</span>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-[28px] font-black text-navy m-0 mb-1 flex items-center gap-2 tracking-tight leading-tight">
        {icon} {title}
      </h3>
      {subtitle && <p className="text-[15px] text-slate-500 m-0 leading-relaxed">{subtitle}</p>}
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

  const handleGenerateBio = useCallback(() => {
    const generated = generateBio({
      jobTitle: formData.jobTitle,
      specializations: formData.specializations || [],
      yearsExperience: formData.yearsExperience || 0,
      certifications: []
    })
    handleChange('bio', generated)
  }, [formData.jobTitle, formData.specializations, formData.yearsExperience, handleChange])

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

  // Returns Tailwind border class based on validation state
  const inputBorderClass = (field: string) =>
    touched[field] && errors[field]
      ? 'border-red-400'
      : touched[field]
      ? 'border-green-500'
      : 'border-slate-200'

  const baseInputClass = 'w-full px-4 py-3 rounded-xl border-[1.5px] bg-white text-[13px] text-navy outline-none box-border'

  const inputClass = (field: string) => `${baseInputClass} ${inputBorderClass(field)}`

  const bioWordCount = (formData.bio || '').trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="font-sans">
      {/* Info banner */}
      <div className="bg-[#FDF6EC] border border-gold/20 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
        <User size={18} className="text-gold shrink-0 mt-[1px]" />
        <div>
          <p className="text-[13px] font-bold text-navy m-0 mb-[3px]">Your professional identity</p>
          <p className="text-xs text-slate-500 m-0">All fields marked * are required. Everything saves automatically.</p>
        </div>
      </div>

      {/* Profile photo */}
      <div className="mb-9">
        <SectionHeader icon={<Camera size={16} className="text-gold" />} title="Profile photo" subtitle="Profiles with photos get 4× more views." />
        <div className="flex items-center gap-5">
          <div
            onClick={handlePhotoClick}
            className={[
              'w-24 h-24 rounded-full flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden shrink-0',
              photoPreview ? 'border-[3px] border-gold' : 'border-2 border-dashed border-slate-300',
            ].join(' ')}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              : <Upload size={24} className="text-slate-400" />
            }
          </div>
          <div>
            <button
              type="button"
              onClick={handlePhotoClick}
              className="block mb-1.5 px-4 py-2 rounded-[10px] text-xs font-bold bg-white border-[1.5px] border-slate-200 text-navy cursor-pointer"
            >
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <p className="text-[11px] text-slate-400 m-0">JPG or PNG · Square · At least 400×400px · Max 5MB</p>
            {errors.photo && <FieldError message={errors.photo} />}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
        </div>
      </div>

      {/* Name */}
      <div className="mb-9">
        <SectionHeader icon={<User size={16} className="text-gold" />} title="Your name" subtitle="Use your legal name as it appears on your ID." />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <FieldLabel label="First name" required />
            <input type="text" value={formData.firstName || ''} placeholder="Sarah" onChange={e => handleChange('firstName', e.target.value)} onBlur={e => handleBlur('firstName', e.target.value, true)} className={inputClass('firstName')} />
            {touched.firstName && errors.firstName && <FieldError message={errors.firstName} />}
          </div>
          <div>
            <FieldLabel label="Middle name" />
            <input type="text" value={formData.middleName || ''} placeholder="Marie" onChange={e => handleChange('middleName', e.target.value)} className={inputClass('middleName')} />
          </div>
          <div>
            <FieldLabel label="Last name" required />
            <input type="text" value={formData.lastName || ''} placeholder="Johnson" onChange={e => handleChange('lastName', e.target.value)} onBlur={e => handleBlur('lastName', e.target.value, true)} className={inputClass('lastName')} />
            {touched.lastName && errors.lastName && <FieldError message={errors.lastName} />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Preferred name" hint="What you like to be called" />
            <input type="text" value={formData.preferredName || ''} placeholder="Sarah" onChange={e => handleChange('preferredName', e.target.value)} className={inputClass('preferredName')} />
          </div>
          <div>
            <FieldLabel label="Job title" hint="e.g. Personal Support Worker" />
            <input type="text" value={formData.jobTitle || ''} placeholder="Personal Support Worker" onChange={e => handleChange('jobTitle', e.target.value)} className={inputClass('jobTitle')} />
          </div>
        </div>
      </div>

      {/* DOB + Gender */}
      <div className="mb-9">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Date of birth" required hint="Must be 18 or older" />
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              onBlur={e => {
                handleBlur('dateOfBirth', e.target.value, true)
                if (e.target.value && !isOver18(e.target.value))
                  setErrors(prev => ({ ...prev, dateOfBirth: 'You must be 18 or older' }))
              }}
              className={inputClass('dateOfBirth')}
            />
            {touched.dateOfBirth && errors.dateOfBirth && <FieldError message={errors.dateOfBirth} />}
          </div>
          <div>
            <FieldLabel label="Gender" required />
            <select
              value={formData.gender || ''}
              onChange={e => handleChange('gender', e.target.value)}
              onBlur={e => handleBlur('gender', e.target.value, true)}
              className={`${inputClass('gender')} appearance-none`}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            {touched.gender && errors.gender && <FieldError message={errors.gender} />}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mb-9">
        <SectionHeader icon={<Mail size={16} className="text-gold" />} title="Contact information" subtitle="Your phone is private." />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Phone number" required hint="SMS-capable" />
            <input
              type="tel"
              value={formData.phone || ''}
              placeholder="(555) 123-4567"
              onChange={e => handleChange('phone', formatPhone(e.target.value))}
              onBlur={e => {
                handleBlur('phone', e.target.value, true)
                if (e.target.value && e.target.value.replace(/\D/g, '').length < 10)
                  setErrors(prev => ({ ...prev, phone: 'Enter a valid 10-digit number' }))
              }}
              className={inputClass('phone')}
            />
            {touched.phone && errors.phone && <FieldError message={errors.phone} />}
          </div>
          <div>
            <FieldLabel label="Work authorisation" required />
            <select
              value={formData.workAuthorisation === true ? 'yes' : formData.workAuthorisation === false ? 'no' : ''}
              onChange={e => handleChange('workAuthorisation', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined)}
              onBlur={e => handleBlur('workAuthorisation', e.target.value, true)}
              className={`${inputClass('workAuthorisation')} appearance-none`}
            >
              <option value="">Are you authorised to work?</option>
              <option value="yes">Yes — I am legally authorised</option>
              <option value="no">No — I need authorisation</option>
            </select>
            {touched.workAuthorisation && errors.workAuthorisation && <FieldError message={errors.workAuthorisation} />}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-9">
        <SectionHeader icon={<MapPin size={16} className="text-gold" />} title="Location" subtitle="ZIP code auto-fills city and state." />
        <div className="grid gap-4" style={{ gridTemplateColumns: '140px 1fr 100px' }}>
          <div>
            <FieldLabel label="ZIP code" required />
            <input
              type="text"
              value={formData.postalCode || ''}
              placeholder="75034"
              maxLength={10}
              onChange={e => handleChange('postalCode', e.target.value)}
              onBlur={e => handleZipBlur(e.target.value)}
              className={inputClass('postalCode')}
            />
            {zipLooking && <p className="text-[11px] text-gold mt-1">Looking up...</p>}
          </div>
          <div>
            <FieldLabel label="City" required />
            <input type="text" value={formData.city || ''} placeholder="Frisco" onChange={e => handleChange('city', e.target.value)} onBlur={e => handleBlur('city', e.target.value, true)} className={inputClass('city')} />
            {touched.city && errors.city && <FieldError message={errors.city} />}
          </div>
          <div>
            <FieldLabel label="State" required />
            <input type="text" value={formData.state || ''} placeholder="TX" maxLength={2} onChange={e => handleChange('state', e.target.value.toUpperCase())} onBlur={e => handleBlur('state', e.target.value, true)} className={inputClass('state')} />
            {touched.state && errors.state && <FieldError message={errors.state} />}
          </div>
        </div>
      </div>

      {/* Languages */}
      <motion.div
        ref={languagesRef}
        initial="hidden"
        animate={languagesInView ? 'visible' : 'hidden'}
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-9"
      >
        <SectionHeader icon={null} title="Languages spoken" subtitle="Select all that apply. Then set your fluency level." />
        <div className="flex flex-wrap gap-2 mb-4">
          {LANGUAGES.map(lang => {
            const selected = (formData.languages || []).includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={[
                  'px-[14px] py-[7px] rounded-full text-xs font-medium cursor-pointer border-2',
                  selected
                    ? 'border-gold bg-[#FDF6EC] text-amber-900'
                    : 'border-slate-200 bg-white text-slate-500',
                ].join(' ')}
              >
                {lang}
              </button>
            )
          })}
        </div>
        {(formData.languages || []).length > 0 && (
          <div className="flex flex-col gap-2">
            {(formData.languages || []).map(lang => (
              <div key={lang} className="flex items-center justify-between px-[14px] py-2.5 rounded-[10px] bg-slate-50 border border-slate-200">
                <span className="text-[13px] font-semibold text-navy">{lang}</span>
                <div className="flex gap-1.5">
                  {FLUENCY_LEVELS.map(level => {
                    const active = (formData.languageFluency || {})[lang] === level
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFluency(lang, level)}
                        className={[
                          'px-2.5 py-1 rounded-md text-[11px] cursor-pointer border-[1.5px]',
                          active
                            ? 'font-bold border-gold bg-[#FDF6EC] text-amber-900'
                            : 'font-medium border-slate-200 bg-white text-slate-500',
                        ].join(' ')}
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
      </motion.div>

      {/* Bio */}
      <div className="mb-9">
        <FieldLabel label="Professional bio" hint="150–300 words recommended." />
        {!formData.bio && (
          <button
            onClick={handleGenerateBio}
            className="bg-sky-50 text-sky-700 px-4 py-2.5 rounded-lg border border-sky-200 text-sm font-medium cursor-pointer mb-2.5"
          >
            ✨ Generate professional bio
          </button>
        )}
        <textarea
          value={formData.bio || ''}
          placeholder="Tell agencies who you are..."
          rows={5}
          onChange={e => handleChange('bio', e.target.value)}
          onBlur={e => handleBlur('bio', e.target.value)}
          className={`${inputClass('bio')} resize-y leading-relaxed !py-[14px]`}
        />
        <div className="flex justify-between mt-[5px]">
          <span className={`text-[11px] ${bioWordCount < 50 ? 'text-slate-400' : bioWordCount <= 300 ? 'text-green-600' : 'text-red-500'}`}>
            {bioWordCount} words {bioWordCount < 50 && '— aim for at least 150'}
          </span>
        </div>
      </div>

      {/* Emergency contact */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setEmergencyOpen(prev => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-[10px] border border-slate-200 bg-white cursor-pointer"
        >
          <span className="text-[13px] font-semibold text-navy">
            Emergency contact{' '}
            <span className="text-[11px] font-normal text-slate-400 ml-2">(optional)</span>
          </span>
          {emergencyOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>
        {emergencyOpen && (
          <div className="px-5 py-5 border border-slate-200 border-t-0 rounded-b-[10px] bg-[#FAFAFA]">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel label="Full name" />
                <input type="text" value={(formData.emergencyContact as any)?.name || ''} placeholder="Jane Johnson" onChange={e => updateEmergency('name', e.target.value)} className={inputClass('emergencyName')} />
              </div>
              <div>
                <FieldLabel label="Phone number" />
                <input type="tel" value={(formData.emergencyContact as any)?.phone || ''} placeholder="(555) 123-4567" onChange={e => updateEmergency('phone', formatPhone(e.target.value))} className={inputClass('emergencyPhone')} />
              </div>
            </div>
            <div>
              <FieldLabel label="Relationship" />
              <select
                value={(formData.emergencyContact as any)?.relationship || ''}
                onChange={e => updateEmergency('relationship', e.target.value)}
                className={`${inputClass('emergencyRelationship')} appearance-none max-w-[240px]`}
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
