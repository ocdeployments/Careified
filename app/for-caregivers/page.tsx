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
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Hero */}
      <section style={{ padding: '140px 20px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            background: '#FDF6EC', 
            borderRadius: '100px', 
            marginBottom: '24px',
            border: '1px solid #E8B86D'
          }}>
            <span style={{ fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
              For Healthcare Professionals
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Find Your Perfect<br />
            <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Care Placement
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Create your free profile, showcase your skills, and connect with 
            agencies looking for talented caregivers like you.
          </p>
          
          <Link 
            href="/profile/build"
            style={{ 
              display: 'inline-block',
              padding: '16px 32px', 
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: 700,
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(201, 151, 58, 0.4)'
            }}
          >
            Build Your Profile Free →
          </Link>
        </div>
      </section>

      {/* Story Section - Organic Editorial Layout */}
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

      {/* Benefits */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', textAlign: 'center', marginBottom: '48px' }}>
            Why Caregivers Love Careified
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Free Profile Builder', desc: 'Create a professional profile that highlights your skills and experience.', icon: '📝' },
              { title: 'Get Discovered', desc: 'Agencies search our database to find and recruit caregivers like you.', icon: '👀' },
              { title: 'Build Your Reputation', desc: 'Earn ratings from agencies to showcase your reliability and quality.', icon: '⭐' },
              { title: 'Find Better Fits', desc: 'Match with agencies that align with your schedule, location, and preferences.', icon: '🎯' },
              { title: 'Track Your Shifts', desc: 'Keep a record of all your work history in one convenient place.', icon: '📊' },
              { title: 'Grow Your Career', desc: 'Access resources and opportunities to advance your healthcare career.', icon: '📈' },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: '24px', 
                background: '#F7F4F0',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ 
        padding: '80px 20px', 
        background: '#0D1B3E',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Create your free profile in just 10 minutes.
          </p>
          <Link 
            href="/profile/build"
            style={{ 
              display: 'inline-block',
              padding: '18px 40px', 
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: 700,
              fontSize: '18px'
            }}
          >
            Build Your Profile →
          </Link>
        </div>
      </section>
    </div>
  )
}