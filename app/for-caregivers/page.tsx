'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"

const C = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldWarm: '#E8B86D',
  cream: '#F7F4F0',
  white: '#FFFFFF',
  border: '#E2E8F0',
  fg: '#4A5568',
}

export default function ForCaregiversPage() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const cardStyle = (idx: number) => ({
    background: C.cream,
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'left' as const,
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    transform: hoveredCard === idx ? 'translateY(-6px)' : 'none',
    boxShadow: hoveredCard === idx ? '0 12px 40px rgba(201, 151, 58, 0.25)' : '0 2px 16px rgba(0,0,0,0.06)',
    borderColor: hoveredCard === idx ? '#C9973A' : '#E2E8F0',
  })

  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      {/* SECTION 1 — Hero */}
      <section style={{
        position: 'relative',
        paddingTop: '96px',
        paddingBottom: '80px',
        background: C.navy,
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.4, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'inline-block',
            border: '1px solid #C9A84C',
            color: '#C9A84C',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '11px',
            letterSpacing: '0.12em',
            marginBottom: '24px',
            fontFamily: SANS,
            fontWeight: 600,
          }}>
            FOR CAREGIVERS
          </div>

          <h1 style={{
            fontFamily: SERIF,
            fontSize: 'clamp(2.5rem, 5vw, 3rem)',
            color: C.gold,
            textAlign: 'center',
            lineHeight: 1.2,
            margin: 0
          }}>
            For Professional Caregivers
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '18px',
            fontFamily: SANS,
            maxWidth: '560px',
            margin: '24px auto 0',
            textAlign: 'center',
            lineHeight: 1.7
          }}>
            You don't need another app. Build once. Be seen forever.
          </p>

          <Link
            href="/sign-up?role=caregiver&redirect_url=/profile/build"
            style={{
              display: 'inline-block',
              marginTop: '32px',
              padding: '16px 40px',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldWarm})`,
              color: C.navy,
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '16px',
              fontFamily: SANS,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Build My Profile
          </Link>
        </div>
      </section>

      {/* SECTION 2 — Cards (2 cards only) */}
      <section style={{
        background: C.white,
        paddingTop: '80px',
        paddingBottom: '80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
            gap: '24px'
          }}>
            {/* Card 1 */}
            <div
              style={cardStyle(0)}
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 style={{
                fontFamily: SERIF,
                fontSize: '20px',
                color: C.navy,
                marginBottom: '12px'
              }}>
                Why Should I Build My Profile?
              </h3>
              <p style={{
                fontSize: '15px',
                fontFamily: SANS,
                color: C.fg,
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                Your verified reputation travels with you. Agencies discover you based on credentials, experience, and verified references — not keyword searches. Get matched to opportunities that actually fit your skills and schedule.
              </p>
              <Link
                href="#why-build"
                style={{
                  fontSize: '14px',
                  fontFamily: SANS,
                  fontWeight: 600,
                  color: C.gold,
                  textDecoration: 'none',
                }}
              >
                Learn More →
              </Link>
            </div>

            {/* Card 2 */}
            <div
              style={cardStyle(1)}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 style={{
                fontFamily: SERIF,
                fontSize: '20px',
                color: C.navy,
                marginBottom: '12px'
              }}>
                Browse Opportunities
              </h3>
              <p style={{
                fontSize: '15px',
                fontFamily: SANS,
                color: C.fg,
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                See open roles matched to your skills, availability, and location. New opportunities that fit what you're looking for, delivered directly.
              </p>
              <Link
                href="/opportunities"
                style={{
                  fontSize: '14px',
                  fontFamily: SANS,
                  fontWeight: 600,
                  color: C.gold,
                  textDecoration: 'none',
                }}
              >
                View Opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Why Build (Profile Demo) */}
      <section id="why-build" style={{
        background: C.cream,
        paddingTop: '80px',
        paddingBottom: '80px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              fontSize: '12px',
              color: C.gold,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: SANS,
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              WHY BUILD YOUR PROFILE
            </div>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: '36px',
              color: C.navy,
              margin: 0
            }}>
              See what agencies see.
            </h2>
          </div>

          {/* Demo Profile Card */}
          <div style={{
            background: C.white,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            {/* Header */}
            <div style={{
              background: C.navy,
              padding: '24px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontFamily: SERIF,
                    fontSize: '28px',
                    color: C.white,
                  }}>
                    Maria Santos
                  </span>
                  <span style={{
                    background: 'rgba(22,163,74,0.15)',
                    color: '#16A34A',
                    fontSize: '11px',
                    fontFamily: SANS,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                  }}>
                    Verified
                  </span>
                </div>
                <div style={{
                  fontFamily: SANS,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  Personal Support Worker · Toronto, ON
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: SERIF,
                  fontSize: '32px',
                  color: C.gold,
                }}>
                  4.8
                </div>
                <div style={{
                  fontFamily: SANS,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  Trust Score
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderBottom: '1px solid #E2E8F0',
            }}>
              {[
                { label: 'Years Experience', value: '8' },
                { label: 'Profile Complete', value: '94%' },
                { label: 'References', value: 'Verified' },
                { label: 'Availability', value: 'Now' },
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRight: i < 3 ? '1px solid #E2E8F0' : 'none',
                }}>
                  <div style={{
                    fontFamily: SERIF,
                    fontSize: '20px',
                    color: C.navy,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: SANS,
                    fontSize: '11px',
                    color: '#64748B',
                    marginTop: '4px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Info sections */}
            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div>
                  <div style={{
                    fontFamily: SANS,
                    fontSize: '11px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}>
                    Specializations
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Elder Care', 'Dementia', 'Medication Admin', 'Mobility Assistance'].map((tag, i) => (
                      <span key={i} style={{
                        fontFamily: SANS,
                        fontSize: '12px',
                        background: '#F1F5F9',
                        color: C.navy,
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontFamily: SANS,
                    fontSize: '11px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}>
                    Languages
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontFamily: SANS, fontSize: '14px', color: C.navy }}>
                    <span>English (Native)</span>
                    <span>Portuguese (Fluent)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              padding: '20px 32px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
            }}>
              <Link
                href="/sign-up?role=caregiver"
                style={{
                  fontFamily: SANS,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: C.gold,
                  textDecoration: 'none',
                }}
              >
                Build Your Profile — It's Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Trust line */}
      <section style={{
        background: C.navy,
        paddingTop: '60px',
        paddingBottom: '60px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
          <p style={{
            fontFamily: SERIF,
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
            fontFamily: SANS,
            marginTop: '16px'
          }}>
            — Based on caregiver profile activity
          </p>
        </div>
      </section>

      {/* SECTION 5 — Final CTA */}
      <section style={{
        background: C.cream,
        paddingTop: '80px',
        paddingBottom: '100px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: '40px',
            color: C.navy,
            marginBottom: '16px'
          }}>
            Your profile is free.
            <br />Your career is priceless.
          </h2>

          <p style={{
            color: '#6B7280',
            fontSize: '17px',
            fontFamily: SANS,
            marginBottom: '40px'
          }}>
            Join caregivers who've stopped being invisible.
          </p>

          <Link
            href="/sign-up?role=caregiver&redirect_url=/profile/build"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldWarm})`,
              color: C.navy,
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '17px',
              fontFamily: SANS,
            }}
          >
            Build My Profile
          </Link>

          <p style={{
            fontSize: '13px',
            fontFamily: SANS,
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