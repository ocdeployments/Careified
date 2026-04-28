'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Briefcase, Eye, Star, TrendingUp } from 'lucide-react'

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

      {/* Story Section - Two Column Layout */}
      <section 
        id="story"
        style={{ 
          padding: '80px 20px', 
          background: 'white',
          display: 'grid',
          gridTemplateColumns: isDesktop ? '55fr 45fr' : '1fr',
          gap: '64px',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Left Column - Conversational Story */}
        <div>
          {/* Section Label */}
          <div style={{ 
            fontSize: '12px', 
            color: '#C9A84C', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            01 / FOR CAREGIVERS
          </div>

          {/* Main Headline */}
          <h2 style={{ 
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(32px, 4vw, 40px)',
            color: '#1B2A4A',
            lineHeight: 1.15,
            marginBottom: '24px'
          }}>
            Your career deserves
            <br />to be seen.
          </h2>

          {/* Lead Paragraph */}
          <p style={{ 
            fontSize: '18px',
            color: '#4A4A4A',
            lineHeight: 1.7,
            marginBottom: '24px'
          }}>
            You've spent years showing up, caring deeply, and building real
            skills. But when the shift ends — none of that lives anywhere.
            No record. No reputation. No proof of what you've built.
          </p>

          {/* Gold Divider */}
          <div style={{ 
            width: '48px', 
            height: '2px', 
            background: '#C9A84C',
            marginBottom: '24px'
          }} />

          {/* Second Paragraph */}
          <p style={{ 
            fontSize: '18px',
            color: '#4A4A4A',
            lineHeight: 1.7,
            marginBottom: '32px'
          }}>
            Careified changes that. Build your profile once — your
            certifications, your experience, your specialties — and carry
            it with you for your entire career. Agencies find you.
            Families trust you. Your work finally speaks for itself.
          </p>

          {/* Pain Point Cards - 2x2 Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { icon: Briefcase, title: "You Own It", body: "Not trapped in agency files. Your profile lives with you, not with them." },
              { icon: Eye, title: "Be Seen", body: "Agencies searching for exactly your skills find you directly — multiple opportunities at once." },
              { icon: Star, title: "Get Recognized", body: "Your reliability is public and provable. No more starting from scratch with every new employer." },
              { icon: TrendingUp, title: "Better Matches", body: "Specialized skills mean better pay and work you actually want to do." },
            ].map((card, i) => (
              <div key={i} style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <card.icon size={20} color="#C9A84C" style={{ marginBottom: '12px' }} />
                <h3 style={{ 
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '16px',
                  color: '#1B2A4A',
                  marginBottom: '8px'
                }}>
                  {card.title}
                </h3>
                <p style={{ 
                  fontSize: '14px',
                  color: '#6B7280',
                  lineHeight: 1.5
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link 
            href="/profile/start"
            style={{ 
              display: 'inline-block',
              padding: '14px 32px',
              background: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px'
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

        {/* Right Column - Photo */}
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          minHeight: isDesktop ? '520px' : '320px',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden'
        }}>
          <Image
            src="/3Caregivers.jpg"
            alt="Caregivers who use Careified"
            fill
            style={{ objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
          />
        </div>
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