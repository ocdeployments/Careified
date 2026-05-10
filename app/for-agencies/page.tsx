'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Shield, Star, Calendar, FileText, Headphones, Users, ArrowRight, CheckCircle } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'
const G_WARM = '#E8B86D'
const CREAM = '#F7F4F0'

export default function ForAgenciesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const benefits = [
    { title: 'Alignment-Based Search', desc: 'Filter by 20+ criteria. See alignment scores instantly. Every caregiver profile is a complete professional record.', icon: Search },
    { title: 'Agency Roster', desc: 'Add your existing caregivers to the platform. They claim their profiles. You own your bench.', icon: Users },
    { title: 'AIRecruit', desc: 'AI calls and screens candidates automatically. Reference checks done while you sleep. Only interview-ready candidates reach your desk.', icon: Shield },
    { title: 'Verified Credentials', desc: 'Every caregiver is verified — background checks, certifications, and references confirmed.', icon: CheckCircle },
    { title: 'Placement Ratings', desc: 'See performance ratings from past placements to make informed hiring decisions.', icon: Star },
    { title: 'Dedicated Support', desc: 'Our team is available to help you find the right fit for your agency.', icon: Headphones },
  ]

  const steps = [
    { step: '1', title: 'Join the Network', desc: 'Create your agency account in minutes. No credit card required.' },
    { step: '2', title: 'Search & Discover', desc: 'Browse verified caregivers filtered by specialty, location, and availability.' },
    { step: '3', title: 'Match & Place', desc: 'Review AI-ranked matches, shortlist candidates, and make placements.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      {/* Hero */}
      <section style={{
        padding: '140px 20px 80px',
        background: N,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          opacity: 0.5, pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(201, 151, 58, 0.15)',
            borderRadius: '100px',
            marginBottom: '24px',
            border: '1px solid rgba(201, 151, 58, 0.3)'
          }}>
            <span style={{ fontSize: '14px', color: G, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              For Home Health Agencies
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 52px)',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Recruit Without the<br />
            <span style={{ color: G }}>
              Legwork.
            </span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Stop screening 200 resumes. Start talking to the right caregivers.
          </p>

          <Link
            href="/agency/signup"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: `linear-gradient(135deg, ${G}, ${G_WARM})`,
              color: N,
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '16px',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 14px rgba(201, 151, 58, 0.4)'
            }}
          >
            Join the Careified Network →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '36px',
            color: N,
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Everything You Need to Succeed
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {benefits.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  style={{
                    padding: '28px',
                    background: CREAM,
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: hoveredCard === i ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredCard === i ? '0 12px 40px rgba(201, 151, 58, 0.15)' : 'none',
                    borderColor: hoveredCard === i ? G : '#E2E8F0',
                  }}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${G}, ${G_WARM})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Icon size={24} color={N} />
                  </div>
                  <h3 style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: N,
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748B',
                    lineHeight: 1.6,
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: CREAM }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '36px',
            color: N,
            marginBottom: '48px'
          }}>
            How It Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '28px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${G}, ${G_WARM})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '22px', fontWeight: 700, color: N,
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: N,
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#64748B',
                    fontFamily: "'DM Sans', sans-serif"
                  }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section style={{ padding: '60px 20px', background: N, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
          {[
            { value: '75%', label: 'Annual Turnover' },
            { value: '4 in 5', label: 'Leave in 100 Days' },
            { value: '9.7M', label: 'Jobs by 2034' },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '42px',
                color: G,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 20px',
        background: CREAM,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '36px',
            color: N,
            marginBottom: '16px'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748B',
            marginBottom: '32px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Join agencies who trust Careified for their hiring needs.
          </p>
          <Link
            href="/agency/signup"
            style={{
              display: 'inline-block',
              padding: '18px 40px',
              background: `linear-gradient(135deg, ${G}, ${G_WARM})`,
              color: N,
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '18px',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Create Free Account →
          </Link>
          <p style={{
            fontSize: '13px',
            color: '#94A3B8',
            marginTop: '16px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            No credit card required. Start your 14-day trial.
          </p>
        </div>
      </section>
    </div>
  )
}