'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
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

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
]

const BUSINESS_TYPES = [
  'Home Health Agency','Staffing Agency','Registry',
  'Private Duty Agency','Hospice Agency','Other'
]

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
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
  agencyName: string
  businessType: string
  websiteUrl: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
  city: string
  province: string
  acceptedTerms: boolean
  acceptedEmployer: boolean
}

const EMPTY: FormData = {
  agencyName: '',
  businessType: '',
  websiteUrl: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  city: '',
  province: '',
  acceptedTerms: false,
  acceptedEmployer: false,
}

export function AgencySignupForm() {
  const router = useRouter()
  const { user, isLoaded: userLoaded } = useUser()
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill email from Clerk
  useEffect(() => {
    if (userLoaded && user?.primaryEmailAddress) {
      const email = user.primaryEmailAddress.emailAddress
      if (!form.contactEmail) {
        set('contactEmail', email)
      }
    }
  }, [userLoaded, user])

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = {...e}; delete n[key]; return n })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.agencyName.trim()) e.agencyName = 'Agency name is required'
    if (!form.contactFirstName.trim()) e.contactFirstName = 'First name is required'
    if (!form.contactLastName.trim()) e.contactLastName = 'Last name is required'
    if (!form.contactEmail.trim()) e.contactEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email'
    if (form.contactPhone) {
      const phoneDigits = form.contactPhone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        e.contactPhone = 'Please enter a valid 10-digit phone number'
      }
    }
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.province) e.province = 'Province/State is required'
    if (!form.acceptedTerms) e.acceptedTerms = 'Required'
    if (!form.acceptedEmployer) e.acceptedEmployer = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch('/api/agency/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyName: form.agencyName,
          displayName: form.agencyName,
          businessType: form.businessType || null,
          websiteUrl: form.websiteUrl || null,
          contactFirstName: form.contactFirstName,
          contactLastName: form.contactLastName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || null,
          city: form.city,
          state: form.province,
          serviceAreas: [form.city],
          careTypes: [],
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

  const allProvinces = [...CA_PROVINCES, ...US_STATES].sort()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '40px 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 8px' }}>
            Join Careified as an Agency
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            Takes 2 minutes. We review applications within 24 hours.
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: N, margin: '0 0 24px' }}>Agency details</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Agency name <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              style={errors.agencyName ? inputErrorStyle : inputStyle}
              value={form.agencyName}
              onChange={e => set('agencyName', e.target.value)}
              placeholder="ABC Home Care Inc."
            />
            {errors.agencyName && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.agencyName}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Agency type <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              style={errors.businessType ? inputErrorStyle : inputStyle}
              value={form.businessType}
              onChange={e => set('businessType', e.target.value)}
            >
              <option value="">Select...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.businessType && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.businessType}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Website (optional)</label>
            <input
              style={inputStyle}
              value={form.websiteUrl}
              onChange={e => set('websiteUrl', e.target.value)}
              placeholder="https://youragency.ca"
            />
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: N, margin: '32px 0 24px' }}>Contact person</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>First name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                style={errors.contactFirstName ? inputErrorStyle : inputStyle}
                value={form.contactFirstName}
                onChange={e => set('contactFirstName', e.target.value)}
              />
              {errors.contactFirstName && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.contactFirstName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Last name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                style={errors.contactLastName ? inputErrorStyle : inputStyle}
                value={form.contactLastName}
                onChange={e => set('contactLastName', e.target.value)}
              />
              {errors.contactLastName && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.contactLastName}</p>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              style={errors.contactEmail ? inputErrorStyle : inputStyle}
              type="email"
              value={form.contactEmail}
              onChange={e => set('contactEmail', e.target.value)}
              placeholder="you@agency.com"
            />
            {errors.contactEmail && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.contactEmail}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone number</label>
            <input
              style={errors.contactPhone ? inputErrorStyle : inputStyle}
              type="tel"
              value={form.contactPhone}
              onChange={e => set('contactPhone', e.target.value)}
              placeholder="(416) 555-0100"
            />
            {errors.contactPhone && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.contactPhone}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>City <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              style={errors.city ? inputErrorStyle : inputStyle}
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="Toronto"
            />
            {errors.city && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.city}</p>}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Province/State <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              style={errors.province ? inputErrorStyle : inputStyle}
              value={form.province}
              onChange={e => set('province', e.target.value)}
            >
              <option value="">Select...</option>
              {allProvinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.province}</p>}
          </div>

          {/* Acknowledgments */}
          <div style={{ background: '#F7F4F0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 10,
              border: 'none',
              background: submitting ? '#E2E8F0' : `linear-gradient(135deg, ${G}, #E8B86D)`,
              color: submitting ? '#94A3B8' : N,
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: S,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
          Already have an account? <a href="/sign-in" style={{ color: G, textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}
