'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface FormData {
  agencyName: string
  businessType: string
  licenseNumber: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  acceptedTerms: boolean
}

interface FormErrors {
  agencyName?: string
  contactFirstName?: string
  contactLastName?: string
  contactEmail?: string
  contactPhone?: string
  streetAddress?: string
  city?: string
  state?: string
  postalCode?: string
  acceptedTerms?: string
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const BUSINESS_TYPES = [
  'Home Health Agency',
  'Staffing Agency',
  'Registry',
  'Private Duty Agency',
  'Hospice Agency',
  'Other',
]

export function AgencySignupForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    agencyName: '',
    businessType: '',
    licenseNumber: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: 'TX',
    postalCode: '',
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }

  const validate = (data: FormData): FormErrors => {
    const e: FormErrors = {}
    if (!data.agencyName.trim()) e.agencyName = 'Agency name is required'
    if (!data.contactFirstName.trim()) e.contactFirstName = 'First name is required'
    if (!data.contactLastName.trim()) e.contactLastName = 'Last name is required'
    if (!data.contactEmail.trim()) e.contactEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) e.contactEmail = 'Invalid email address'
    if (!data.contactPhone.trim()) e.contactPhone = 'Phone is required'
    else if (data.contactPhone.replace(/\D/g,'').length < 10) e.contactPhone = 'Enter a valid 10-digit phone'
    if (!data.streetAddress.trim()) e.streetAddress = 'Street address is required'
    if (!data.city.trim()) e.city = 'City is required'
    if (!data.state) e.state = 'State is required'
    if (!data.postalCode.trim()) e.postalCode = 'ZIP code is required'
    else if (!/^\d{5}(-\d{4})?$/.test(data.postalCode)) e.postalCode = 'Invalid ZIP code'
    if (!data.acceptedTerms) e.acceptedTerms = 'You must accept the terms'
    return e
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const newErrors = validate({ ...formData, [field]: value })
      setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const newErrors = validate(formData)
    setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)
    const validationErrors = validate(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/agency/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setSubmitted(true)
      toast.success('Application submitted! We\'ll review it within 1–2 business days.')
      setTimeout(() => router.push('/agency/pending-approval'), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-serif text-2xl text-navy mb-2">Application submitted!</h1>
          <p className="text-sm text-slate-500">Redirecting to your status page…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-navy tracking-tight mb-2">
            Register your agency
          </h1>
          <p className="text-sm text-slate-500">
            Join Careified to access verified caregiver profiles and AI-powered matching.
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Agency info */}
          <FormSection title="Agency Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Agency name"
                required
                error={touched.agencyName ? errors.agencyName : undefined}
              >
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={e => handleChange('agencyName', e.target.value)}
                  onBlur={() => handleBlur('agencyName')}
                  placeholder="Sunrise Home Care"
                  className={inputCls(touched.agencyName && !!errors.agencyName)}
                />
              </Field>
              <Field label="Business type">
                <select
                  value={formData.businessType}
                  onChange={e => handleChange('businessType', e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="License number" className="md:col-span-2">
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={e => handleChange('licenseNumber', e.target.value)}
                  placeholder="Optional"
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </FormSection>

          {/* Contact info */}
          <FormSection title="Primary Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First name" required error={touched.contactFirstName ? errors.contactFirstName : undefined}>
                <input
                  type="text"
                  value={formData.contactFirstName}
                  onChange={e => handleChange('contactFirstName', e.target.value)}
                  onBlur={() => handleBlur('contactFirstName')}
                  className={inputCls(touched.contactFirstName && !!errors.contactFirstName)}
                />
              </Field>
              <Field label="Last name" required error={touched.contactLastName ? errors.contactLastName : undefined}>
                <input
                  type="text"
                  value={formData.contactLastName}
                  onChange={e => handleChange('contactLastName', e.target.value)}
                  onBlur={() => handleBlur('contactLastName')}
                  className={inputCls(touched.contactLastName && !!errors.contactLastName)}
                />
              </Field>
              <Field label="Email" required error={touched.contactEmail ? errors.contactEmail : undefined}>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => handleChange('contactEmail', e.target.value)}
                  onBlur={() => handleBlur('contactEmail')}
                  className={inputCls(touched.contactEmail && !!errors.contactEmail)}
                />
              </Field>
              <Field label="Phone" required error={touched.contactPhone ? errors.contactPhone : undefined}>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e => handleChange('contactPhone', formatPhone(e.target.value))}
                  onBlur={() => handleBlur('contactPhone')}
                  placeholder="(555) 000-0000"
                  className={inputCls(touched.contactPhone && !!errors.contactPhone)}
                />
              </Field>
            </div>
          </FormSection>

          {/* Address */}
          <FormSection title="Business Address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Street address" required error={touched.streetAddress ? errors.streetAddress : undefined} className="md:col-span-2">
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={e => handleChange('streetAddress', e.target.value)}
                  onBlur={() => handleBlur('streetAddress')}
                  className={inputCls(touched.streetAddress && !!errors.streetAddress)}
                />
              </Field>
              <Field label="City" required error={touched.city ? errors.city : undefined}>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={inputCls(touched.city && !!errors.city)}
                />
              </Field>
              <Field label="State" required error={touched.state ? errors.state : undefined}>
                <select
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  className={inputCls(touched.state && !!errors.state)}
                >
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="ZIP code" required error={touched.postalCode ? errors.postalCode : undefined}>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value)}
                  onBlur={() => handleBlur('postalCode')}
                  maxLength={10}
                  className={inputCls(touched.postalCode && !!errors.postalCode)}
                />
              </Field>
            </div>
          </FormSection>

          {/* Terms */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={e => handleChange('acceptedTerms', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-gold focus:ring-gold mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-navy underline hover:text-gold transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-navy underline hover:text-gold transition-colors">
                  Privacy Policy
                </a>
                . I confirm that I am authorized to register this agency.
              </span>
            </label>
            {touched.acceptedTerms && errors.acceptedTerms && (
              <p className="text-xs text-red-500 mt-2 ml-7">{errors.acceptedTerms}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all',
              'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
              isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-gold to-gold-warm text-navy hover:opacity-90 cursor-pointer',
            ].join(' ')}
          >
            {isSubmitting ? 'Submitting…' : (
              <>Submit Application <ChevronRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    'w-full px-3 py-2.5 rounded-xl border text-sm text-navy placeholder-slate-400 bg-white',
    'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none transition-colors',
    hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300',
  ].join(' ')
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h2 className="text-sm font-bold text-navy mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}
