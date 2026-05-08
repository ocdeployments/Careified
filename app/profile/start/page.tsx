'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSignUp } from '@clerk/nextjs'
import { Check } from 'lucide-react'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldLight: '#E8B86D',
  warmWhite: '#F7F4F0',
  goldTint: '#FDF6EC',
  slate: '#64748B',
  error: '#DC2626',
  success: '#16A34A',
  border: '#E2E8F0',
}

export default function ProfileStartPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signUp, isLoaded: signUpLoaded } = useSignUp() as any
  
  const [phone, setPhone] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otpInputsRef: any = []

  const isSignedIn = isLoaded && user
  const isVerified = isSignedIn && user.emailAddresses[0]?.verification?.status === 'verified'
  const canProceed = phoneVerified && ageConfirmed

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    if (digits && digits.length < 10) {
      setPhoneError('Please enter a 10-digit number')
    } else {
      setPhoneError('')
    }
    setPhoneVerified(false)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setPhoneError('Please enter a 10-digit number')
      return
    }
    if (/^(\d)\1{9}$/.test(digits)) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    if (!signUpLoaded || !signUp) {
      setPhoneError('Authentication not ready. Please try again.')
      return
    }

    setOtpLoading(true)
    setOtpError('')

    try {
      // Start phone verification with Clerk
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code', phoneNumber: `+1${digits}` })
      setOtpSent(true)
      setResendTimer(60)
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100)
    } catch (err: any) {
      console.error('Send OTP error:', err)
      setPhoneError(err.errors?.[0]?.message || 'Failed to send code. Please try again.')
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

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }

    if (newCode.every(d => d) && newCode.join('').length === 6) {
      verifyOTP(newCode.join(''))
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  const verifyOTP = async (code: string) => {
    if (!signUpLoaded || !signUp) return

    setOtpLoading(true)
    setOtpError('')

    try {
      await signUp.attemptPhoneNumberVerification({ strategy: 'phone_code', code })
      setPhoneVerified(true)
    } catch (err: any) {
      console.error('Verify OTP error:', err)
      setOtpError(err.errors?.[0]?.message || 'Incorrect code. Please try again.')
      setOtpCode(['', '', '', '', '', ''])
      otpInputsRef.current[0]?.focus()
    } finally {
      setOtpLoading(false)
    }
  }

  const handleContinue = () => {
    if (!canProceed) return
    router.push(`/sign-up?role=caregiver&phone=${encodeURIComponent(phone)}`)
  }

  const scrollToCTA = () => {
    const ctaSection = document.getElementById('cta-section')
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${COLORS.gold}`,
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    background: 'white',
    color: COLORS.navy,
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.warmWhite, fontFamily: "'DM Sans', sans-serif", color: COLORS.navy }}>
      {/* Section 1: Hero */}
      <section style={{ padding: '48px 24px 32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: COLORS.gold, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
          For Professional Caregivers
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', lineHeight: 1.3, color: COLORS.navy, marginBottom: '16px' }}>
          You've spent years earning your reputation. Every time you move agencies, you leave it behind. Careified fixes that.
        </h1>
        <p style={{ fontSize: '15px', color: COLORS.slate, maxWidth: '60ch', margin: '0 auto', lineHeight: 1.6 }}>
          This is not a resume. It's a verified professional identity — built once, updated as you grow, visible only to caregiving agencies that are actively hiring.
        </p>
      </section>

      {/* Section 2: Trust Pills */}
      <section style={{ padding: '0 24px 32px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
        {['15 minutes to go live', 'Private until you\'re ready', 'Edit anytime', 'Always free for caregivers'].map((pill, i) => (
          <span key={i} style={{
            border: `1px solid ${COLORS.gold}`,
            background: COLORS.goldTint,
            borderRadius: '999px',
            padding: '8px 20px',
            fontSize: '14px',
            color: COLORS.navy,
          }}>
            {pill}
          </span>
        ))}
      </section>

      {/* Section 3: Product Screenshot Mockup */}
      <section style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '15px', color: COLORS.slate, marginBottom: '32px', fontFamily: "'DM Sans', sans-serif" }}>
          This is what agencies see when they find you.
        </div>

        {/* Browser Chrome Mockup */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(13,27,62,0.25)',
          overflow: 'hidden',
          maxWidth: '780px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Top Bar */}
          <div style={{
            background: '#2d2d44',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '8px'
          }}>
            {/* Three Dots */}
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28CA41' }} />

            {/* URL Bar */}
            <div style={{
              background: '#3d3d5c',
              borderRadius: '6px',
              flex: 1,
              height: '20px',
              marginLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px'
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                careified.vercel.app/profile/demo
              </span>
            </div>
          </div>

          {/* Screenshot Image */}
          <div style={{ position: 'relative' }}>
            <img
              src="/images/profile-demo-preview.png"
              alt="Maria Santos Careified profile"
              style={{ width: '100%', display: 'block' }}
            />
            {/* Fade Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, transparent, #F7F4F0)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

        {/* Body Copy Below Mockup */}
        <div style={{ marginTop: '32px', fontFamily: "'DM Sans', sans-serif", color: COLORS.navy }}>
          <p style={{ fontSize: '16px', maxWidth: '480px', margin: '0 auto 8px', lineHeight: 1.5 }}>
            Your name. Your credentials. Your working style. Your trust score.
          </p>
          <p style={{ fontSize: '16px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
            All verified. All in one place.
          </p>
        </div>

        {/* Side-by-side Links */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>
          <a href="/profile/demo" target="_blank" style={{ fontSize: '15px', color: COLORS.navy, textDecoration: 'underline' }}>
            See the full profile →
          </a>
          <span style={{ fontSize: '14px', color: COLORS.slate }}>or</span>
          <button onClick={scrollToCTA} style={{ fontSize: '15px', color: COLORS.gold, textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            start building yours
          </button>
        </div>
      </section>

      {/* Section 4: What Happens Next */}
      <section style={{ padding: '0 24px 60px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: COLORS.navy, marginBottom: '24px' }}>
          What happens next
        </h2>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          {['Your identity — name, photo, location, languages', 'Your experience — services, skills, work history', 'Your credentials — certifications, availability, compliance', 'Go live — the more complete your profile, the higher you appear in agency searches'].map((item, i) => (
            <li key={i} style={{ fontSize: '16px', color: COLORS.navy, marginBottom: '12px', lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ol>
      </section>

      {/* Section 5: Reassurance */}
      <section style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: COLORS.slate, maxWidth: '50ch', margin: '0 auto' }}>
          You don't need everything ready today. Start with your name and experience — you can add credentials and references anytime.
        </p>
      </section>

      {/* Section 6: Pre-CTA Gate or CTA */}
      <section id="cta-section" style={{ padding: '0 24px 80px', textAlign: 'center' }}>
        {isSignedIn && isVerified ? (
          <a href="/profile/build" style={{
            background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            color: COLORS.navy,
            fontWeight: 700,
            padding: '16px 48px',
            borderRadius: '999px',
            fontSize: '18px',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Let's Build Your Profile
          </a>
        ) : (
          <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: COLORS.navy, marginBottom: '8px' }}>
              Before we get started
            </div>
            <p style={{ fontSize: '14px', color: COLORS.slate, marginBottom: '20px' }}>
              Verify your phone number to create your secure profile.
            </p>

            {/* Phone Input */}
            <div style={{ marginBottom: '16px' }}>
              {phoneVerified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                  <Check size={18} color={COLORS.success} />
                  <span style={{ color: COLORS.success, fontWeight: 500 }}>{formatPhone(phone)}</span>
                  <span style={{ fontSize: 12, color: COLORS.slate }}>Verified</span>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.slate, fontSize: 15 }}>+1</span>
                    <input
                      type="tel"
                      placeholder="(416) 555-1234"
                      value={formatPhone(phone)}
                      onChange={(e) => validatePhone(e.target.value)}
                      disabled={otpSent}
                      style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                  </div>
                  {phoneError && <div style={{ fontSize: '12px', color: COLORS.error, marginTop: '4px' }}>{phoneError}</div>}
                  
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={phone.replace(/\D/g, '').length !== 10 || otpLoading}
                      style={{
                        marginTop: 12,
                        padding: '10px 20px',
                        background: phone.replace(/\D/g, '').length === 10 ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})` : COLORS.border,
                        color: phone.replace(/\D/g, '').length === 10 ? COLORS.navy : COLORS.slate,
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: phone.replace(/\D/g, '').length === 10 ? 'pointer' : 'not-allowed',
                        opacity: otpLoading ? 0.7 : 1,
                      }}
                    >
                      {otpLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  )}

                  {/* OTP Input */}
                  {otpSent && !phoneVerified && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 13, color: COLORS.slate, marginBottom: 8 }}>Enter 6-digit code</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
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
                      {otpError && <div style={{ fontSize: 12, color: COLORS.error, marginTop: 8, textAlign: 'center' }}>{otpError}</div>}
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        {resendTimer > 0 ? (
                          <span style={{ fontSize: 13, color: COLORS.slate }}>Resend in {resendTimer}s</span>
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
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={{ marginTop: '3px', accentColor: COLORS.gold, width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px', color: COLORS.navy }}>
                I confirm I am 18 years of age or older
              </span>
            </label>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canProceed}
              style={{
                background: canProceed ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})` : '#E2E8F0',
                color: canProceed ? COLORS.navy : '#94A3B8',
                fontWeight: 700,
                padding: '16px 48px',
                borderRadius: '999px',
                fontSize: '18px',
                border: 'none',
                cursor: canProceed ? 'pointer' : 'not-allowed',
                width: '100%',
              }}
            >
              Continue
            </button>
            <p style={{ fontSize: '13px', color: COLORS.slate, textAlign: 'center', marginTop: '16px' }}>
              Your information is never sold or shared with third parties.
            </p>
          </div>
        )}
        {!isSignedIn && (
          <div style={{ fontSize: '13px', color: COLORS.slate, textAlign: 'center', marginTop: '20px' }}>
            No credit card. No catch. Your data stays yours.
          </div>
        )}
      </section>
    </div>
  )
}
