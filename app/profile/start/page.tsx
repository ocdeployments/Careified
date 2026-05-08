'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldLight: '#E8B86D',
  warmWhite: '#F7F4F0',
  goldTint: '#FDF6EC',
  slate: '#64748B',
}

const MARIA_DATA = {
  name: 'Maria Santos',
  credential: 'PSW',
  jobTitle: 'Personal Support Worker',
  city: 'Toronto',
  state: 'Ontario',
  workingStyleTags: ['Calm under pressure', 'Emotionally attuned', 'Adapts to change'],
  tier: 'Verified',
}

export default function ProfileStartPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const isSignedIn = isLoaded && user
  const isVerified = isSignedIn && user.emailAddresses[0]?.verification?.status === 'verified'

  const canProceed = ageConfirmed && email.trim() && phone.trim().length >= 10

  const validateEmail = (value: string) => {
    setEmail(value)
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email')
    } else {
      setEmailError('')
    }
  }

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setPhone(digits)
    if (digits && digits.length < 10) {
      setPhoneError('Please enter a 10-digit number')
    } else {
      setPhoneError('')
    }
  }

  const handleContinue = () => {
    if (!canProceed) return
    router.push(`/sign-up?role=caregiver&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`)
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
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: COLORS.gold, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
          For Professional Caregivers
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px', lineHeight: 1.2, color: COLORS.navy, marginBottom: '24px' }}>
          You've spent years earning your reputation.<br />
          Every time you move agencies, you leave it behind.<br />
          Careified fixes that.
        </h1>
        <p style={{ fontSize: '17px', color: COLORS.slate, maxWidth: '60ch', margin: '0 auto', lineHeight: 1.6 }}>
          This is not a resume. It's a verified professional identity — built once, updated as you grow, visible only to caregiving agencies that are actively hiring.
        </p>
      </section>

      {/* Section 2: Trust Pills */}
      <section style={{ padding: '0 24px 60px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
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

      {/* Section 3: Profile Preview Card */}
      <section style={{ padding: '0 24px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '20px' }}>
          This is a snippet of what agencies see when they find you.
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', textAlign: 'left' }}>
          {/* Identity Card */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: COLORS.goldTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: COLORS.navy, flexShrink: 0 }}>
              MS
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: COLORS.navy, marginBottom: '4px' }}>
                {MARIA_DATA.name}
              </div>
              <div style={{ fontSize: '14px', color: COLORS.slate, marginBottom: '8px' }}>
                {MARIA_DATA.credential} — {MARIA_DATA.jobTitle}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '12px' }}>
                {MARIA_DATA.city}, {MARIA_DATA.state}
              </div>
              {/* Working Style Tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {MARIA_DATA.workingStyleTags.map((tag, i) => (
                  <span key={i} style={{
                    background: COLORS.goldTint,
                    border: `1px solid ${COLORS.gold}`,
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: COLORS.navy,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              {/* Tier Badge */}
              <span style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#16A34A',
              }}>
                {MARIA_DATA.tier}
              </span>
            </div>
          </div>
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
      <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
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
              We need a few details to create your account and keep your profile secure.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                style={inputStyle}
              />
              {emailError && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{emailError}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="tel"
                placeholder="10-digit Canadian number"
                value={phone}
                onChange={(e) => validatePhone(e.target.value)}
                style={inputStyle}
              />
              {phoneError && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{phoneError}</div>}
            </div>
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