'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, Target, Calendar, FileText, ArrowRight } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

export default function AIRecruitPage() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <AgencyShell title="AIRecruit" subtitle="AI-Powered Hiring">
      {/* Hero Band */}
      <div style={{
        background: '#0D1B3E',
        padding: '48px 24px',
        marginBottom: '32px'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Left side */}
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid #C9A84C',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '11px',
              color: '#C9A84C',
              fontWeight: 600,
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              BETA
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'white',
              marginBottom: '12px'
            }}>
              AIRecruit
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6
            }}>
              Screen caregiver candidates automatically with AI voice interviews
            </p>
          </div>

          {/* Right side - stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '4px'
              }}>
                0
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Calls Made
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '4px'
              }}>
                0
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Candidates Screened
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Four Feature Cards */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 48px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Phone size={24} color="#C9A84C" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '8px'
            }}>
              AI Voice Screening
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Automated phone interviews for caregiver candidates
            </p>
            <span style={{
              display: 'inline-block',
              background: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Coming Soon
            </span>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Target size={24} color="#C9A84C" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '8px'
            }}>
              Candidate Scoring
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Every call scored against your open role requirements
            </p>
            <span style={{
              display: 'inline-block',
              background: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Coming Soon
            </span>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Calendar size={24} color="#C9A84C" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '8px'
            }}>
              Smart Scheduling
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Top candidates auto-booked into your calendar
            </p>
            <span style={{
              display: 'inline-block',
              background: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Coming Soon
            </span>
          </div>

          {/* Card 4 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <FileText size={24} color="#C9A84C" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              color: '#0D1B3E',
              marginBottom: '8px'
            }}>
              Interview Summaries
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Full transcripts and insights delivered to your dashboard
            </p>
            <span style={{
              display: 'inline-block',
              background: '#C9A84C',
              color: 'white',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: '#F5F3EE',
        padding: '64px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '32px',
            color: '#0D1B3E',
            marginBottom: '48px'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr',
            gap: isDesktop ? '16px' : '32px',
            alignItems: 'start'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                Select candidates
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                From your Careified shortlist
              </p>
            </div>

            {/* Arrow */}
            {isDesktop && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                <ArrowRight size={20} color="#C9A84C" />
              </div>
            )}

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                AIRecruit calls
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Each candidate automatically
              </p>
            </div>

            {/* Arrow */}
            {isDesktop && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                <ArrowRight size={20} color="#C9A84C" />
              </div>
            )}

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                AI interviews
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Conducts structured screening
              </p>
            </div>

            {/* Arrow */}
            {isDesktop && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
                <ArrowRight size={20} color="#C9A84C" />
              </div>
            )}

            {/* Step 4 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#0D1B3E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                4
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0D1B3E',
                marginBottom: '8px'
              }}>
                You receive results
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5
              }}>
                Scores, transcripts, next steps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#0D1B3E',
            marginBottom: '12px'
          }}>
            Ready to automate your hiring?
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#0D1B3E',
            opacity: 0.8,
            marginBottom: '24px'
          }}>
            AIRecruit is currently in beta. Join the waitlist to be notified when it launches for your account.
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#0D1B3E',
              color: 'white',
              borderRadius: '9999px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </AgencyShell>
  )
}