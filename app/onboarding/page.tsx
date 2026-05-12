'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldLight: '#E8B86D',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#16A34A',
  gray: '#64748B',
  border: '#E2E8F0',
}

interface FormData {
  firstName: string
  lastName: string
  ageConfirmed: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  ageConfirmed?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { userId, isLoaded: authLoaded } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    ageConfirmed: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (authLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [authLoaded, userId, router])

  const canContinue = formData.firstName && formData.lastName && formData.ageConfirmed

  // Handlers
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))

    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateName = (field: 'firstName' | 'lastName', value: string) => {
    if (!value) return `${field === 'firstName' ? 'First' : 'Last'} name is required`
    if (value.length < 2) return 'Please enter at least 2 characters'
    if (!/^[A-Za-z]+$/.test(value)) return 'Please enter a valid name (letters only)'
    return undefined
  }

  const handleSubmit = async () => {
    // Validate name fields
    const firstNameError = validateName('firstName', formData.firstName)
    const lastNameError = validateName('lastName', formData.lastName)

    if (firstNameError || lastNameError) {
      setErrors({ firstName: firstNameError, lastName: lastNameError })
      setTouched({ firstName: true, lastName: true })
      return
    }

    if (!formData.ageConfirmed) {
      setErrors(prev => ({ ...prev, ageConfirmed: 'You must be 18 or older to create a Careified profile' }))
      return
    }

    setLoading(true)

    // Save to caregiver record (phone will be collected in profile builder Step 1)
    try {
      const res = await fetch('/api/caregivers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          ageConfirmed: true,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }

      router.push('/profile/build?step=1')
    } catch {
      setErrors(prev => ({ ...prev, ageConfirmed: 'Failed to save. Please try again.' }))
    } finally {
      setLoading(false)
    }
  }

  if (!authLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: COLORS.white }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.navy, padding: '40px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: COLORS.white, margin: '0 0 8px' }}>
            Welcome to Careified
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: 0 }}>
            Let's get your profile set up
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: COLORS.white, borderRadius: 16, padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {/* Name Section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.navy, marginBottom: 12 }}>Your Name</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1.5px solid ${touched.firstName && errors.firstName ? COLORS.error : COLORS.border}`,
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {touched.firstName && errors.firstName && (
                  <p style={{ fontSize: 12, color: COLORS.error, margin: '6px 0 0' }}>{errors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `1.5px solid ${touched.lastName && errors.lastName ? COLORS.error : COLORS.border}`,
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {touched.lastName && errors.lastName && (
                  <p style={{ fontSize: 12, color: COLORS.error, margin: '6px 0 0' }}>{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Age Confirmation */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.ageConfirmed}
                onChange={e => handleChange('ageConfirmed', e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2, accentColor: COLORS.gold }}
              />
              <span style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.5 }}>
                I confirm I am 18 years of age or older
              </span>
            </label>
            {touched.ageConfirmed && errors.ageConfirmed && (
              <p style={{ fontSize: 12, color: COLORS.error, margin: '8px 0 0 32px' }}>{errors.ageConfirmed}</p>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit}
            disabled={!canContinue || loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: canContinue && !loading ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})` : COLORS.border,
              color: canContinue && !loading ? COLORS.navy : COLORS.gray,
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: canContinue && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 24 }}>
          Your email is already verified through Clerk
        </p>
      </div>
    </div>
  )
}