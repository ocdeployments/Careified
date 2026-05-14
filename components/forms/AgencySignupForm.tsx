'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronRight, ChevronLeft, Upload } from 'lucide-react'
import { toast } from 'sonner'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const CA_PROVINCES = [
  'Alberta','British Columbia','Manitoba','New Brunswick',
  'Newfoundland and Labrador','Nova Scotia','Ontario',
  'Prince Edward Island','Quebec','Saskatchewan',
  'Northwest Territories','Nunavut','Yukon'
]

const BUSINESS_TYPES = [
  'Home Health Agency','Staffing Agency','Registry',
  'Private Duty Agency','Hospice Agency','Other'
]

const CARE_TYPES = [
  'Home care','Live-in care','Palliative/Hospice','Dementia care',
  'Pediatric care','Acquired disability','Mental health support',
  'Post-surgical recovery','Respite care','Overnight care'
]

const RECRUITMENT_METHODS = [
  'Indeed','LinkedIn','Word of mouth','Agency networks',
  'School partnerships','Other job boards','Careified (new)'
]

const CURRENT_TOOLS = [
  'AlayaCare','ClearCare','WellSky','HHAeXchange',
  'Hireology','Google Sheets','Paper-based','Other'
]

const CA_CITIES = [
  'Toronto','Vancouver','Montreal','Calgary','Edmonton',
  'Ottawa','Mississauga','Brampton','Hamilton','London',
  'Markham','Vaughan','Kitchener','Windsor','Richmond Hill',
  'Oakville','Burlington','Saskatoon','Regina','Halifax'
]

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', fontSize: 14, color: N,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: S,
  background: 'white',
}

const inputErrorStyle = {
  ...inputStyle,
  border: '1px solid #DC2626',
}

const labelStyle = {
  display: 'block' as const, fontSize: 13, fontWeight: 500,
  color: N, marginBottom: 6,
}

interface FormData {
  // Step 1 — Identity
  agencyName: string
  displayName: string
  businessType: string
  tagline: string
  websiteUrl: string
  brandColor: string
  // Step 2 — Operations
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
  streetAddress: string
  city: string
  province: string
  postalCode: string
  serviceAreas: string[]
  careTypes: string[]
  // Step 3 — Team
  coordinatorCount: string
  recruitmentMethods: string[]
  currentTools: string[]
  // Step 4 — Compliance
  businessRegistration: string
  licenseNumber: string
  insuranceCarrier: string
  insurancePolicy: string
  backgroundCheckProvider: string
  acceptedTerms: boolean
  acceptedEmployer: boolean
}

const EMPTY: FormData = {
  agencyName: '', displayName: '', businessType: '', tagline: '',
  websiteUrl: '', brandColor: '#0D1B3E',
  contactFirstName: '', contactLastName: '', contactEmail: '',
  contactPhone: '', streetAddress: '', city: '', province: '',
  postalCode: '', serviceAreas: [], careTypes: [],
  coordinatorCount: '', recruitmentMethods: [], currentTools: [],
  businessRegistration: '', licenseNumber: '', insuranceCarrier: '',
  insurancePolicy: '', backgroundCheckProvider: '',
  acceptedTerms: false, acceptedEmployer: false,
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

function Chip({ label, active, onClick, color = G }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', fontFamily: S,
      border: active ? `2px solid ${color}` : '1.5px solid #E2E8F0',
      background: active ? '#FDF6EC' : 'white',
      color: active ? '#92400E' : '#64748B',
    }}>{label}</button>
  )
}

function Field({ label, required, error, children, fieldKey }: { label: string; required?: boolean; error?: string; children: React.ReactNode; fieldKey?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}</label>
      {fieldKey && error ? (
        <div data-error="true">{children}</div>
      ) : (
        <>{children}</>
      )}
      {error && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export function AgencySignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  function validate(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!form.agencyName.trim()) e.agencyName = 'Agency name is required'
      if (!form.businessType) e.businessType = 'Business type is required'
    }
    if (s === 2) {
      if (!form.contactFirstName.trim()) e.contactFirstName = 'Required'
      if (!form.contactLastName.trim()) e.contactLastName = 'Required'
      if (!form.contactEmail.trim()) e.contactEmail = 'Required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email'
      if (!form.contactPhone.trim()) e.contactPhone = 'Required'
      else {
        // Phone validation - strip non-numeric and check 10 digits
        const phoneDigits = form.contactPhone.replace(/\D/g, '')
        if (phoneDigits.length !== 10) {
          e.contactPhone = 'Please enter a valid 10-digit phone number'
        }
      }
      if (!form.streetAddress.trim()) e.streetAddress = 'Required'
      if (!form.city.trim()) e.city = 'Required'
      if (!form.province) e.province = 'Required'
      if (!form.postalCode.trim()) e.postalCode = 'Required'
      if (form.serviceAreas.length === 0) e.serviceAreas = 'Select at least one service area'
      if (form.careTypes.length === 0) e.careTypes = 'Select at least one care type'
    }
    if (s === 4) {
      if (!form.acceptedTerms) e.acceptedTerms = 'Required'
      if (!form.acceptedEmployer) e.acceptedEmployer = 'Required'
    }
    setErrors(e)

    // Scroll to first error
    if (Object.keys(e).length > 0) {
      const firstErrorKey = Object.keys(e)[0]
      setTimeout(() => {
        const el = document.querySelector(`[data-error="true"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }

    return Object.keys(e).length === 0
  }

  function next() {
    if (validate(step)) setStep(s => Math.min(s + 1, 4))
  }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  async function handleSubmit() {
    if (!validate(4)) return
    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch('/api/agency/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyName: form.agencyName,
          displayName: form.displayName || form.agencyName,
          businessType: form.businessType,
          tagline: form.tagline,
          websiteUrl: form.websiteUrl,
          brandColor: form.brandColor,
          contactFirstName: form.contactFirstName,
          contactLastName: form.contactLastName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          streetAddress: form.streetAddress,
          city: form.city,
          state: form.province,
          postalCode: form.postalCode,
          serviceAreas: form.serviceAreas,
          careTypes: form.careTypes,
          coordinatorCount: form.coordinatorCount ? parseInt(form.coordinatorCount) : null,
          recruitmentMethods: form.recruitmentMethods,
          currentTools: form.currentTools,
          businessRegistration: form.businessRegistration,
          licenseNumber: form.licenseNumber,
          insuranceCarrier: form.insuranceCarrier,
          insurancePolicy: form.insurancePolicy,
          backgroundCheckProvider: form.backgroundCheckProvider,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
          toast.error('Please fix the errors below')
        } else {
          throw new Error(data.error || 'Registration failed')
        }
        return
      }
      toast.success('Application submitted! We will review and notify you within 24 hours.')
      router.push('/agency/pending-approval')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Operations' },
    { num: 3, label: 'Your team' },
    { num: 4, label: 'Compliance' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '40px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 8px' }}>
            Join Careified as an Agency
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            Takes 5 minutes. We review applications within 24 hours.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: step >= s.num ? N : '#E2E8F0',
                color: step >= s.num ? 'white' : '#94A3B8',
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: 12, color: step >= s.num ? N : '#94A3B8', fontWeight: step === s.num ? 700 : 400 }}>
                {s.label}
              </span>
              {s.num < 4 && <div style={{ width: 24, height: 1, background: '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32 }}>

          {/* STEP 1 — Identity */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: N, margin: '0 0 24px' }}>Tell us about your agency</h2>
              <Field label="Legal agency name" required error={errors.agencyName} fieldKey="agencyName">
                <input style={errors.agencyName ? inputErrorStyle : inputStyle} value={form.agencyName} onChange={e => set('agencyName', e.target.value)} placeholder="ABC Home Care Inc." />
              </Field>
              <Field label="Display name (shown to caregivers)" error={errors.displayName}>
                <input style={inputStyle} value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="Same as legal name if blank" />
              </Field>
              <Field label="Agency type" required error={errors.businessType} fieldKey="businessType">
                <select style={errors.businessType ? inputErrorStyle : inputStyle} value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                  <option value="">Select...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Tagline (one sentence shown to caregivers)" error={errors.tagline}>
                <input style={inputStyle} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Caring for seniors across the GTA since 2010" />
              </Field>
              <Field label="Website URL" error={errors.websiteUrl}>
                <input style={inputStyle} value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://youragency.ca" />
              </Field>
              <Field label="Brand colour (used in your communications)">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={form.brandColor} onChange={e => set('brandColor', e.target.value)}
                    style={{ width: 44, height: 44, borderRadius: 8, border: '1.5px solid #E2E8F0', cursor: 'pointer', padding: 2 }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={form.brandColor} onChange={e => set('brandColor', e.target.value)} placeholder="#0D1B3E" />
                </div>
              </Field>
            </div>
          )}

          {/* STEP 2 — Operations */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: N, margin: '0 0 24px' }}>Operations & contact</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" required error={errors.contactFirstName} fieldKey="contactFirstName">
                  <input style={errors.contactFirstName ? inputErrorStyle : inputStyle} value={form.contactFirstName} onChange={e => set('contactFirstName', e.target.value)} />
                </Field>
                <Field label="Last name" required error={errors.contactLastName} fieldKey="contactLastName">
                  <input style={errors.contactLastName ? inputErrorStyle : inputStyle} value={form.contactLastName} onChange={e => set('contactLastName', e.target.value)} />
                </Field>
              </div>
              <Field label="Contact email" required error={errors.contactEmail} fieldKey="contactEmail">
                <input style={errors.contactEmail ? inputErrorStyle : inputStyle} type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
              </Field>
              <Field label="Contact phone" required error={errors.contactPhone} fieldKey="contactPhone">
                <input style={errors.contactPhone ? inputErrorStyle : inputStyle} type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="(416) 555-0100" />
              </Field>
              <Field label="Street address" required error={errors.streetAddress} fieldKey="streetAddress">
                <input style={errors.streetAddress ? inputErrorStyle : inputStyle} value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <Field label="City" required error={errors.city} fieldKey="city">
                  <input style={errors.city ? inputErrorStyle : inputStyle} value={form.city} onChange={e => set('city', e.target.value)} />
                </Field>
                <Field label="Province" required error={errors.province} fieldKey="province">
                  <select style={errors.province ? inputErrorStyle : inputStyle} value={form.province} onChange={e => set('province', e.target.value)}>
                    <option value="">Select...</option>
                    {CA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Postal code" required error={errors.postalCode} fieldKey="postalCode">
                  <input style={errors.postalCode ? inputErrorStyle : inputStyle} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="M5V 2T6" />
                </Field>
              </div>
              <Field label="Service areas — cities you place caregivers in" required error={errors.serviceAreas}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CA_CITIES.map(c => (
                    <Chip key={c} label={c} active={form.serviceAreas.includes(c)} onClick={() => set('serviceAreas', toggle(form.serviceAreas, c))} />
                  ))}
                </div>
              </Field>
              <Field label="Care types your agency offers" required error={errors.careTypes}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CARE_TYPES.map(t => (
                    <Chip key={t} label={t} active={form.careTypes.includes(t)} onClick={() => set('careTypes', toggle(form.careTypes, t))} />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 3 — Team */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: N, margin: '0 0 8px' }}>Your team & tools</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>This helps us tailor the platform to your workflow. All optional.</p>
              <Field label="Number of care coordinators">
                <select style={inputStyle} value={form.coordinatorCount} onChange={e => set('coordinatorCount', e.target.value)}>
                  <option value="">Select...</option>
                  {['1','2-3','4-5','6-10','10+'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="How do you currently recruit caregivers?">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {RECRUITMENT_METHODS.map(m => (
                    <Chip key={m} label={m} active={form.recruitmentMethods.includes(m)} onClick={() => set('recruitmentMethods', toggle(form.recruitmentMethods, m))} />
                  ))}
                </div>
              </Field>
              <Field label="Scheduling or ATS software you currently use">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CURRENT_TOOLS.map(t => (
                    <Chip key={t} label={t} active={form.currentTools.includes(t)} onClick={() => set('currentTools', toggle(form.currentTools, t))} />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 4 — Compliance */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: N, margin: '0 0 8px' }}>Compliance & acknowledgment</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>Steps 3-4 can be completed after approval from your agency settings.</p>
              <Field label="Business registration number">
                <input style={inputStyle} value={form.businessRegistration} onChange={e => set('businessRegistration', e.target.value)} placeholder="Ontario Business #123456789" />
              </Field>
              <Field label="Professional license number (if applicable)">
                <input style={inputStyle} value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
              </Field>
              <Field label="Liability insurance carrier">
                <input style={inputStyle} value={form.insuranceCarrier} onChange={e => set('insuranceCarrier', e.target.value)} placeholder="e.g. Intact Insurance" />
              </Field>
              <Field label="Insurance policy number">
                <input style={inputStyle} value={form.insurancePolicy} onChange={e => set('insurancePolicy', e.target.value)} />
              </Field>
              <Field label="Background check provider you use">
                <input style={inputStyle} value={form.backgroundCheckProvider} onChange={e => set('backgroundCheckProvider', e.target.value)} placeholder="e.g. Certn, Sterling, in-house" />
              </Field>

              <div style={{ background: '#F7F4F0', borderRadius: 12, padding: 20, marginTop: 8 }}>
                <label style={{ display: 'flex', gap: 12, cursor: 'pointer', marginBottom: 16, alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={form.acceptedTerms} onChange={e => set('acceptedTerms', e.target.checked)} style={{ marginTop: 3, accentColor: G, width: 16, height: 16 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: N, marginBottom: 3 }}>Platform acknowledgment <span style={{ color: '#EF4444' }}>*</span></div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                      I acknowledge that Careified organizes and displays caregiver information. Careified does NOT recommend, vouch for, or employ any caregiver. All hiring decisions are solely my responsibility.
                    </div>
                  </div>
                </label>
                {errors.acceptedTerms && <p style={{ fontSize: 12, color: '#DC2626', margin: '-8px 0 8px 28px' }}>{errors.acceptedTerms}</p>}

                <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={form.acceptedEmployer} onChange={e => set('acceptedEmployer', e.target.checked)} style={{ marginTop: 3, accentColor: G, width: 16, height: 16 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: N, marginBottom: 3 }}>Employer responsibility <span style={{ color: '#EF4444' }}>*</span></div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                      I confirm that my agency is the employer or engaging party for any caregiver placed through Careified, and we are solely responsible for compliance, insurance, supervision, and applicable employment law.
                    </div>
                  </div>
                </label>
                {errors.acceptedEmployer && <p style={{ fontSize: 12, color: '#DC2626', margin: '-8px 0 0 28px' }}>{errors.acceptedEmployer}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #F1F5F9' }}>
            {step > 1 ? (
              <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', color: N, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: S }}>
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 24px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${G}, #E8B86D)`, color: N, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: S }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: submitting ? '#E2E8F0' : `linear-gradient(135deg, ${G}, #E8B86D)`, color: submitting ? '#94A3B8' : N, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: S }}>
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
          Already have an account? <a href="/sign-in" style={{ color: G }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}
