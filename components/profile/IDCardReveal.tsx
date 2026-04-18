// Careified — ID Card Reveal
// Full-screen overlay shown after profile submission
// Pure CSS 3D flip animation — no new packages

'use client'

import { useState, useEffect } from 'react'
import { Shield, MapPin, Star, ExternalLink, Share2 } from 'lucide-react'

const FONT_SERIF = "'Inter', sans-serif"
const FONT_SANS = "'Inter', sans-serif"

interface IDCardRevealProps {
  caregiverData: {
    firstName?: string
    lastName?: string
    preferredName?: string
    jobTitle?: string
    city?: string
    state?: string
    credentials?: string[]
    caregiverCode?: string
  }
  onViewProfile?: () => void
  onDismiss?: () => void
}

export default function IDCardReveal({
  caregiverData,
  onViewProfile,
  onDismiss,
}: IDCardRevealProps) {

  const [phase, setPhase] = useState<'enter' | 'flip' | 'shimmer' | 'complete'>('enter')

  const displayName = caregiverData.preferredName
    ? `${caregiverData.preferredName} ${caregiverData.lastName || ''}`.trim()
    : `${caregiverData.firstName || ''} ${caregiverData.lastName || ''}`.trim()

  const initials = `${caregiverData.firstName?.[0] || ''}${caregiverData.lastName?.[0] || ''}`.toUpperCase()

  const idCode = caregiverData.caregiverCode || 'CRF-US-TX-2026-?????'

  useEffect(() => {
    // Sequence the animation
    const t1 = setTimeout(() => setPhase('flip'), 400)
    const t2 = setTimeout(() => setPhase('shimmer'), 1200)
    const t3 = setTimeout(() => setPhase('complete'), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardFlipIn {
          0% { transform: perspective(1000px) rotateY(-90deg) scale(0.8); opacity: 0; }
          60% { transform: perspective(1000px) rotateY(8deg) scale(1.02); opacity: 1; }
          80% { transform: perspective(1000px) rotateY(-3deg) scale(1.0); }
          100% { transform: perspective(1000px) rotateY(0deg) scale(1.0); opacity: 1; }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes textRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes buttonsFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .id-card-flip {
          animation: cardFlipIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .shimmer-sweep {
          animation: shimmerSweep 0.6s ease forwards;
        }
        .badge-pop {
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .text-rise {
          animation: textRise 0.5s ease forwards;
        }
        .buttons-fade {
          animation: buttonsFadeIn 0.4s ease forwards;
        }
      `}</style>

      {/* Full-screen overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'overlayFadeIn 0.4s ease forwards',
        fontFamily: FONT_SANS,
      }}>

        {/* Stars background decoration */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,' + (Math.random() * 0.3 + 0.1) + ')',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
          }} />
        ))}

        {/* Headline */}
        <div
          className={phase !== 'enter' ? 'text-rise' : ''}
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            textAlign: 'center', marginBottom: '32px',
          }}
        >
          <div style={{
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#C9973A', marginBottom: '8px',
          }}>
            Careified Verified
          </div>
          <h1 style={{
            fontFamily: FONT_SERIF,
            fontSize: '28px', fontWeight: 900,
            color: 'white', margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Your professional identity.
          </h1>
        </div>

        {/* ID Card */}
        <div
          className={phase !== 'enter' ? 'id-card-flip' : ''}
          style={{
            opacity: phase === 'enter' ? 0 : 1,
            position: 'relative',
            width: '320px',
            marginBottom: '32px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0D1B3E 0%, #1E2D5E 50%, #0D1B3E 100%)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(201,151,58,0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,151,58,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>

            {/* Shimmer sweep */}
            {phase === 'shimmer' || phase === 'complete' ? (
              <div
                className="shimmer-sweep"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                  pointerEvents: 'none',
                }}
              />
            ) : null}

            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '11px', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#C9973A',
                fontFamily: FONT_SERIF,
              }}>
                Careified
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                <Shield size={10} color="rgba(255,255,255,0.4)" />
                Verified Professional
              </div>
            </div>

            {/* Avatar + identity */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 900, color: '#0D1B3E',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(201,151,58,0.3)',
              }}>
                {initials}
              </div>
              <div>
                <h2 style={{
                  fontFamily: FONT_SERIF,
                  fontSize: '18px', fontWeight: 900,
                  color: 'white', margin: '0 0 4px',
                  letterSpacing: '-0.01em',
                }}>
                  {displayName || 'Care Professional'}
                </h2>
                {caregiverData.jobTitle && (
                  <p style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                    margin: '0 0 6px',
                  }}>
                    {caregiverData.jobTitle}
                  </p>
                )}
                {caregiverData.credentials?.[0] && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '5px',
                    background: 'rgba(201,151,58,0.15)',
                    color: '#E8B86D',
                    border: '1px solid rgba(201,151,58,0.2)',
                  }}>
                    {caregiverData.credentials[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {caregiverData.city && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                marginBottom: '16px',
              }}>
                <MapPin size={11} />
                {caregiverData.city}{caregiverData.state ? `, ${caregiverData.state}` : ''}
              </div>
            )}

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, rgba(201,151,58,0.3), transparent)',
              marginBottom: '16px',
            }} />

            {/* ID code */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontSize: '8px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)', marginBottom: '3px',
                }}>
                  Caregiver ID
                </div>
                <div style={{
                  fontSize: '12px', fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.05em',
                  fontFamily: 'monospace',
                }}>
                  {idCode}
                </div>
              </div>

              {/* QR placeholder */}
              <div style={{
                width: '44px', height: '44px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 5'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M0 0h2v2H0zM3 0h2v2H3zM1 1h1v1H1zM3 1h1v1H3zM0 3h2v2H0zM1 4h1v1H1zM3 3h1v1H3zM4 4h1v1H4zM2 2h1v1H2z'/%3E%3C/svg%3E")`,
                  backgroundSize: 'cover',
                }} />
              </div>
            </div>

            {/* Gold accent line at bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
            }} />
          </div>

          {/* Verified badge — pops in */}
          {(phase === 'shimmer' || phase === 'complete') && (
            <div
              className="badge-pop"
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(201,151,58,0.5)',
              }}
            >
              <Shield size={22} color="#0D1B3E" fill="#0D1B3E" />
            </div>
          )}
        </div>

        {/* Submitted message + buttons */}
        {phase === 'complete' && (
          <div
            className="buttons-fade"
            style={{ textAlign: 'center' }}
          >
            <p style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.5)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}>
              Your profile has been submitted for review.<br />
              Agencies can find you once it's approved.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={onViewProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '12px 24px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  color: '#0D1B3E', border: 'none',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: FONT_SANS,
                }}
              >
                <ExternalLink size={14} />
                View your profile
              </button>
              <button
                onClick={onDismiss}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '12px 24px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT_SANS,
                }}
              >
                <Share2 size={14} />
                Share your ID
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
