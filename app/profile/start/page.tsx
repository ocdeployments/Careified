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

      {/* SECTION 3 — Blurred Lock Treatment */}
      <section style={{ padding: '0 24px' }}>
        <p style={{ fontSize: '14px', color: COLORS.slate, textAlign: 'center', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          Your profile looks like this — visible only to verified agencies.
        </p>
        
        {/* Blurred lock treatment */}
        <div style={{
          position: 'relative',
          maxWidth: '780px',
          margin: '0 auto',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(201,151,58,0.2)',
        }}>
          {/* Blurred placeholder — suggests a real profile exists */}
          <div style={{
            background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 50%, #0D1B3E 100%)',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px 24px',
          }}>
            {/* Fake blurred profile shape */}
            <div style={{
              width: '100%',
              maxWidth: '500px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '24px',
              filter: 'blur(4px)',
              pointerEvents: 'none',
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(201,151,58,0.3)' }}/>
                <div>
                  <div style={{ width: '160px', height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginBottom: '8px' }}/>
                  <div style={{ width: '100px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}/>
                </div>
                <div style={{ marginLeft: 'auto', width: '80px', height: '32px', background: 'rgba(201,151,58,0.3)', borderRadius: '6px' }}/>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[120, 90, 110].map((w, i) => (
                  <div key={i} style={{ width: w, height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}/>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Lock overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'rgba(13,27,62,0.6)',
            backdropFilter: 'blur(2px)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(201,151,58,0.15)',
              border: '1px solid rgba(201,151,58,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9973A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: '18px',
              color: '#fff',
              textAlign: 'center',
            }}>
              See what agencies see.
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.55)',
              textAlign: 'center',
              maxWidth: '280px',
              lineHeight: 1.5,
            }}>
              Full profiles are visible to verified caregivers and approved agencies only.
            </div>
            <a href="/sign-up?role=caregiver" style={{
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 28px',
              borderRadius: '999px',
              textDecoration: 'none',
              marginTop: '4px',
            }}>
              Create your free profile
            </a>
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
