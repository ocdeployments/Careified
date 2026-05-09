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

export default function ProfileStartPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  const isSignedIn = isLoaded && user
  const isVerified = isSignedIn && user.emailAddresses[0]?.verification?.status === 'verified'
  const canProceed = ageConfirmed

  const handleContinue = () => {
    if (!canProceed) return
    router.push('/sign-up?role=caregiver')
  }

  const scrollToCTA = () => {
    const ctaSection = document.getElementById('cta-section')
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.warmWhite, fontFamily: "'DM Sans', sans-serif", color: COLORS.navy }}>
      {/* SECTION 1 — Hero */}
      <section style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: COLORS.gold, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
          For Professional Caregivers
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '38px', lineHeight: 1.3, color: COLORS.navy, margin: '0 auto 20px', maxWidth: '720px' }}>
          You've spent years earning your reputation. Every time you move agencies, you leave it behind.
        </h1>
        <p style={{ fontSize: '20px', fontWeight: 700, color: COLORS.gold, marginBottom: '24px' }}>
          Careified fixes that.
        </p>
      </section>

      {/* SECTION 2 — Trust Pills */}
      <section style={{ padding: '0 24px 40px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
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

      {/* SECTION 3 — Mockup + Two Column */}
      <section style={{ padding: '0 24px' }}>
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
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28CA41' }} />
            <div style={{ background: '#3d3d5c', borderRadius: '6px', flex: 1, height: '20px', marginLeft: '12px', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                careified.vercel.app/profile/demo
              </span>
            </div>
          </div>
          {/* Screenshot */}
          <div style={{ position: 'relative' }}>
            <img src="/images/profile-demo-preview.png" alt="Maria Santos Careified profile" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, transparent, #F7F4F0)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center', maxWidth: '900px', margin: '40px auto 0', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Right Column — CTA Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(13,27,62,0.10)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 700, color: COLORS.navy, marginBottom: '8px' }}>
              Start building your profile
            </h3>
            <p style={{ fontSize: '14px', color: COLORS.slate, marginBottom: '24px' }}>
              Free for caregivers. Always.
            </p>
            <button
              onClick={scrollToCTA}
              style={{
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                color: COLORS.navy,
                fontWeight: 700,
                padding: '14px 32px',
                borderRadius: '999px',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-block',
              }}
            >
              Claim Your Profile
            </button>
            <div style={{ marginTop: '16px' }}>
              <a href="/profile/demo" style={{ fontSize: '13px', color: COLORS.slate, textDecoration: 'underline' }}>
                See a sample profile →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — What Happens Next (2x2 Grid) */}
      <section style={{ padding: '60px 24px', background: COLORS.goldTint, maxWidth: '640px', margin: '0 auto', borderRadius: '16px', marginTop: '48px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: COLORS.navy, marginBottom: '24px', textAlign: 'center' }}>
          What happens next
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { num: '1', title: 'Identity', desc: 'name, photo, location, languages' },
            { num: '2', title: 'Experience', desc: 'services, skills, work history' },
            { num: '3', title: 'Credentials', desc: 'certifications, availability, compliance' },
            { num: '4', title: 'Go live', desc: 'the more complete, the higher you appear' },
          ].map((card) => (
            <div key={card.num} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS.gold, color: 'white', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.num}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.navy }}>{card.title}</span>
              </div>
              <span style={{ fontSize: '12px', color: COLORS.slate }}>{card.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — CTA Gate (Dark) */}
      <section id="cta-section" style={{ padding: '60px 24px 80px', background: COLORS.navy, textAlign: 'center' }}>
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
          <>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', color: 'white', marginBottom: '12px' }}>
              Ready to be found?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
              It takes 15 minutes. It lasts your entire career.
            </p>
            <div style={{ maxWidth: '360px', margin: '0 auto', padding: '32px', borderRadius: '16px', background: 'white' }}>
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
              <p style={{ fontSize: '13px', color: COLORS.slate, marginTop: '16px', textAlign: 'center' }}>
                Your information is never sold or shared.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
