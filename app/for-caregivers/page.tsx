'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function ForCaregiversPage() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      {/* SECTION 1 — Hero */}
      <section style={{ 
        position: 'relative', 
        paddingTop: '96px', 
        paddingBottom: '80px', 
        background: '#1B2A4A',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Grain texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.4, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          {/* Gold badge */}
          <div style={{ 
            display: 'inline-block', 
            border: '1px solid #C9A84C', 
            color: '#C9A84C', 
            borderRadius: '9999px',
            padding: '6px 16px', 
            fontSize: '11px', 
            letterSpacing: '0.12em',
            marginBottom: '24px'
          }}>
            FOR CAREGIVERS
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            color: '#C9A84C', 
            textAlign: 'center',
            lineHeight: 1.2,
            margin: 0
          }}>
            You've earned this.
            <br />It's time the world knew it.
          </h1>

          {/* Subtext */}
          <p style={{ 
            color: 'rgba(255,255,255,0.75)', 
            fontSize: '18px',
            maxWidth: '560px', 
            margin: '24px auto 0', 
            textAlign: 'center', 
            lineHeight: 1.7
          }}>
            Agencies are searching for caregivers like you right now.
            A Careified profile puts your verified credentials, experience,
            and reputation exactly where they're looking.
          </p>
        </div>
      </section>

      {/* SECTION 2 — Story section (KEEP AS-IS - existing two-column layout) */}
      <section style={{
        position: 'relative',
        backgroundColor: '#F5F3EE',
        overflow: 'hidden',
        minHeight: '600px',
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
        alignItems: 'stretch',
      }}>
        {/* LEFT COLUMN — text story */}
        <div style={{
          padding: isDesktop ? '80px 64px 100px 64px' : '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '24px',
        }}>
          {/* Small label */}
          <div style={{ 
            fontSize: '12px', 
            color: '#C9A84C', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}>
            FOR CAREGIVERS
          </div>

          {/* Section number */}
          <div style={{ 
            fontSize: '14px', 
            color: '#C9A84C',
            fontFamily: "'DM Serif Display', Georgia, serif",
            marginBottom: '-8px'
          }}>
            01/
          </div>

          {/* Large headline */}
          <h2 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '42px',
            color: '#1B2A4A',
            lineHeight: 1.2,
            margin: 0
          }}>
            Your career deserves
            <br />to be seen.
          </h2>

          {/* Gold divider */}
          <div style={{ width: '48px', height: '2px', backgroundColor: '#C9A84C' }} />

          {/* Paragraph 1 */}
          <p style={{ 
            fontSize: '17px', 
            color: '#4A5568', 
            lineHeight: 1.75,
            margin: 0
          }}>
            You've spent years showing up — caring deeply, building real
            skills, earning the trust of every family you've served.
            But when the shift ends, none of that lives anywhere.
            It's locked in someone else's filing system, or worse,
            it simply disappears.
          </p>

          {/* Paragraph 2 */}
          <p style={{ 
            fontSize: '17px', 
            color: '#4A5568', 
            lineHeight: 1.75,
            margin: 0
          }}>
            Careified gives your career a permanent home. Your
            certifications, your experience, your specialties — all in
            one verified profile that you own and carry with you.
            Agencies find you directly. Families trust you on sight.
            Your work finally speaks for itself.
          </p>

          {/* Paragraph 3 */}
          <p style={{ 
            fontSize: '15px', 
            color: '#6B7280', 
            lineHeight: 1.75,
            margin: 0
          }}>
            You own your record. You own your reputation.
            No starting over. No proving yourself from scratch.
          </p>

          {/* CTA Button */}
          <Link 
            href="/profile/start"
            style={{ 
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#C9A84C',
              color: '#FFFFFF',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px',
              width: 'fit-content'
            }}
          >
            Build My Profile — Free →
          </Link>

          {/* Sub-label */}
          <div style={{ 
            fontSize: '13px', 
            color: '#9CA3AF', 
            marginTop: '8px'
          }}>
            Takes 15 minutes. Lasts your entire career.
          </div>
        </div>

        {/* RIGHT COLUMN — photo bleeds to edge */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          height: isDesktop ? '100%' : '360px',
          minHeight: isDesktop ? 'auto' : '360px',
        }}>
          <Image
            src="/3Caregivers.jpg"
            alt="Caregivers"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
        </div>

        {/* CURVED BOTTOM — navy wave (desktop only) */}
        {isDesktop && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            lineHeight: 0,
            zIndex: 2,
          }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg"
                 style={{ display: 'block', width: '100%' }}>
              <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
                    fill="#1B2A4A"/>
            </svg>
          </div>
        )}
      </section>

      {/* SECTION 3 — What You Get (3 outcome cards) */}
      <section style={{
        background: '#FFFFFF',
        paddingTop: '80px',
        paddingBottom: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          {/* Section label */}
          <div style={{ 
            fontSize: '12px', 
            color: '#C9A84C', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            WHAT YOU GET
          </div>

          {/* Section headline */}
          <h2 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '36px',
            color: '#1B2A4A',
            marginBottom: '48px'
          }}>
            Three things that change your career.
          </h2>

          {/* Three cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
            gap: '24px'
          }}>
            {/* Card 1 */}
            <div style={{ 
              background: '#F5F3EE', 
              borderRadius: '16px', 
              padding: '40px 32px',
              textAlign: 'left',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '48px',
                color: '#C9A84C',
                marginBottom: '16px'
              }}>
                01
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Agencies come to you.
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Your profile is searchable by hundreds of agencies.
                Instead of applying and waiting, you get contacted directly
                for roles that match your skills and schedule.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{ 
              background: '#F5F3EE', 
              borderRadius: '16px', 
              padding: '40px 32px',
              textAlign: 'left',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '48px',
                color: '#C9A84C',
                marginBottom: '16px'
              }}>
                02
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Your credentials are trusted.
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Careified verifies your certifications, experience,
                and references. Agencies see a vetted professional —
                not just a resume. No more proving yourself from scratch.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{ 
              background: '#F5F3EE', 
              borderRadius: '16px', 
              padding: '40px 32px',
              textAlign: 'left',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '48px',
                color: '#C9A84C',
                marginBottom: '16px'
              }}>
                03
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Your profile is yours forever.
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Unlike agency records that disappear when you leave,
                your Careified profile travels with you. Every job, every
                rating, every credential — permanently yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — How it works (3 steps) */}
      <section style={{
        background: '#F5F3EE',
        paddingTop: '80px',
        paddingBottom: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          {/* Section label */}
          <div style={{ 
            fontSize: '12px', 
            color: '#C9A84C', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            HOW IT WORKS
          </div>

          {/* Section headline */}
          <h2 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '36px',
            color: '#1B2A4A',
            marginBottom: '48px'
          }}>
            15 minutes. Your entire career.
          </h2>

          {/* Three steps */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
            gap: isDesktop ? '16px' : '32px',
            alignItems: 'start'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-block',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Step 1
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Tell us about yourself
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Your name, location, specialties, and the type of
                care you provide. Simple questions, no guesswork.
              </p>
            </div>

            {/* Arrow separator (desktop only) */}
            {isDesktop && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%'
              }}>
                <span style={{ color: '#C9A84C', fontSize: '24px' }}>→</span>
              </div>
            )}

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-block',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Step 2
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Add your credentials
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Upload certifications, list your experience, and
                add references. We verify what matters most to agencies.
              </p>
            </div>

            {/* Arrow separator (desktop only) */}
            {isDesktop && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%'
              }}>
                <span style={{ color: '#C9A84C', fontSize: '24px' }}>→</span>
              </div>
            )}

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-block',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                Step 3
              </div>
              <h3 style={{ 
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '20px',
                color: '#1B2A4A',
                marginBottom: '12px'
              }}>
                Go live and get found
              </h3>
              <p style={{ 
                fontSize: '15px',
                color: '#4A5568',
                lineHeight: 1.6
              }}>
                Your profile is instantly searchable. Agencies
                in your area can find, shortlist, and contact you directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Trust line */}
      <section style={{
        background: '#1B2A4A',
        paddingTop: '60px',
        paddingBottom: '60px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
          <p style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: 'italic',
            color: 'white',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            margin: 0
          }}>
            Caregivers on Careified get contacted by agencies
            within days of going live.
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '13px',
            marginTop: '16px'
          }}>
            — Based on caregiver profile activity
          </p>
        </div>
      </section>

      {/* SECTION 6 — Final CTA */}
      <section style={{
        background: '#F5F3EE',
        paddingTop: '80px',
        paddingBottom: '100px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '40px',
            color: '#1B2A4A',
            marginBottom: '16px'
          }}>
            Your profile is free.
            <br />Your career is priceless.
          </h2>

          <p style={{ 
            color: '#6B7280', 
            fontSize: '17px',
            marginBottom: '40px'
          }}>
            Join caregivers who've stopped being invisible.
          </p>

          <Link 
            href="/profile/start"
            style={{ 
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '17px'
            }}
          >
            Build My Profile — Free →
          </Link>

          <p style={{ 
            fontSize: '13px', 
            color: '#9CA3AF', 
            marginTop: '12px'
          }}>
            Takes 15 minutes. No credit card. No commitment.
          </p>
        </div>
      </section>
    </div>
  )
}