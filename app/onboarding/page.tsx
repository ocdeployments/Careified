'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'

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
  phoneNumber: string
  phoneVerified: boolean
  ageConfirmed: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  otp?: string
  ageConfirmed?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { userId, isLoaded: authLoaded } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    phoneVerified: false,
    ageConfirmed: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [devCode, setDevCode] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otpInputsRef: any = []

  // Redirect if not logged in
  useEffect(() => {
    if (authLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [authLoaded, userId, router])

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  // Validation helpers
  const isValidName = (name: string) => /^[A-Za-z]{2,}$/.test(name)
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    return digits.length === 10 && !/^(\d)\1{9}$/.test(digits) && !digits.startsWith('55500')
  }

  const canContinue = formData.firstName && formData.lastName && formData.phoneVerified && formData.ageConfirmed

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

  const validatePhone = (value: string) => {
    if (!value) return 'Phone number is required'
    const digits = value.replace(/\D/g, '')
    if (digits.length !== 10) return 'Please enter a 10-digit number'
    if (/^(\d)\1{9}$/.test(digits)) return 'Please enter a valid phone number'
    if (digits.startsWith('55500')) return 'Please enter a real phone number'
    return undefined
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleChange('phoneNumber', formatted)
  }

  const handleSendOTP = async () => {
    const phoneError = validatePhone(formData.phoneNumber)
    if (phoneError) {
      setErrors(prev => ({ ...prev, phoneNumber: phoneError }))
      return
    }

    setOtpLoading(true)
    setOtpError('')
    setDevCode(null)

    try {
      const res = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors(prev => ({ ...prev, phoneNumber: data.error }))
        return
      }

      setOtpSent(true)
      setResendTimer(60)

      // In dev mode, show the code
      if (data.devCode) {
        setDevCode(data.devCode)
      }

      // Focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100)
    } catch {
      setErrors(prev => ({ ...prev, phoneNumber: 'Failed to send code. Please try again.' }))
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)
    setOtpError('')

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newCode.every(d => d) && newCode.join('').length === 6) {
      verifyOTP(newCode.join(''))
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setOtpCode(newCode)
      verifyOTP(pasted)
    }
  }

  const verifyOTP = async (code: string) => {
    setOtpLoading(true)
    setOtpError('')

    try {
      const res = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error || 'Verification failed')
        setOtpCode(['', '', '', '', '', ''])
        otpInputsRef.current[0]?.focus()
        return
      }

      handleChange('phoneVerified', true)
    } catch {
      setOtpError('Failed to verify. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate all fields
    const firstNameError = validateName('firstName', formData.firstName)
    const lastNameError = validateName('lastName', formData.lastName)
    const phoneError = validatePhone(formData.phoneNumber)

    if (firstNameError || lastNameError || phoneError) {
      setErrors({ firstName: firstNameError, lastName: lastNameError, phoneNumber: phoneError })
      setTouched({ firstName: true, lastName: true, phoneNumber: true })
      return
    }

    if (!formData.phoneVerified) {
      setOtpError('Please verify your phone number')
      return
    }

    if (!formData.ageConfirmed) {
      setErrors(prev => ({ ...prev, ageConfirmed: 'You must be 18 or older to create a Careified profile' }))
      return
    }

    // Save to caregiver record
    try {
      const res = await fetch('/api/caregivers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: `+1${formData.phoneNumber.replace(/\D/g, '')}`,
          phoneVerified: true,
          ageConfirmed: true,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }

      router.push('/profile/build?step=1')
    } catch {
      setErrors(prev => ({ ...prev, ageConfirmed: 'Failed to save. Please try again.' }))
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

          {/* Phone Section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.navy, marginBottom: 12 }}>Phone Number</div>

            {formData.phoneVerified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <Check size={18} color={COLORS.success} />
                <span style={{ color: COLORS.success, fontWeight: 500 }}>{formData.phoneNumber}</span>
                <span style={{ fontSize: 12, color: COLORS.gray }}>Verified</span>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.gray, fontSize: 15 }}>+1</span>
                  <input
                    type="tel"
                    placeholder="(416) 555-1234"
                    value={formData.phoneNumber}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, phoneNumber: true }))}
                    disabled={otpSent}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      border: `1.5px solid ${touched.phoneNumber && errors.phoneNumber ? COLORS.error : COLORS.border}`,
                      borderRadius: 8,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {touched.phoneNumber && errors.phoneNumber && (
                  <p style={{ fontSize: 12, color: COLORS.error, margin: '6px 0 0' }}>{errors.phoneNumber}</p>
                )}

                {/* Send Code button */}
                {!otpSent && (
                  <button
                    onClick={handleSendOTP}
                    disabled={!isValidPhone(formData.phoneNumber) || otpLoading}
                    style={{
                      marginTop: 12,
                      padding: '10px 20px',
                      background: isValidPhone(formData.phoneNumber) ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})` : COLORS.border,
                      color: isValidPhone(formData.phoneNumber) ? COLORS.navy : COLORS.gray,
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isValidPhone(formData.phoneNumber) ? 'pointer' : 'not-allowed',
                      opacity: otpLoading ? 0.7 : 1,
                    }}
                  >
                    {otpLoading ? 'Sending...' : 'Send Code'}
                  </button>
                )}

                {/* OTP Input */}
                {otpSent && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 8 }}>Enter 6-digit code</div>

                    {/* Dev mode code display */}
                    {devCode && (
                      <div style={{ padding: '8px 12px', background: '#FEF3C7', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#92400E' }}>
                        Dev code: <strong>{devCode}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handleOTPPaste}>
                      {otpCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpInputsRef.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOTPChange(i, e.target.value)}
                          onKeyDown={e => handleOTPKeyDown(i, e)}
                          style={{
                            width: 44,
                            height: 52,
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 600,
                            border: `1.5px solid ${otpError ? COLORS.error : COLORS.border}`,
                            borderRadius: 8,
                            outline: 'none',
                          }}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p style={{ fontSize: 12, color: COLORS.error, margin: '12px 0 0', textAlign: 'center' }}>{otpError}</p>
                    )}

                    {/* Resend */}
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      {resendTimer > 0 ? (
                        <span style={{ fontSize: 13, color: COLORS.gray }}>Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          onClick={handleSendOTP}
                          style={{ background: 'none', border: 'none', color: COLORS.gold, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
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
            disabled={!canContinue}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: canContinue ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})` : COLORS.border,
              color: canContinue ? COLORS.navy : COLORS.gray,
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Continue
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