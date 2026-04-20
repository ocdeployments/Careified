// Careified — ID Card Reveal
// Full-screen overlay shown after profile submission
// Pure CSS 3D flip animation — no new packages

'use client'

import { useState, useEffect } from 'react'
import { Shield, MapPin, ExternalLink, Share2 } from 'lucide-react'

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
      <div
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 font-sans"
        style={{
          background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 100%)',
          animation: 'overlayFadeIn 0.4s ease forwards',
        }}
      >

        {/* Stars background decoration */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            background: 'rgba(255,255,255,' + (Math.random() * 0.3 + 0.1) + ')',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
          }} />
        ))}

        {/* Headline */}
        <div
          className={`text-center mb-8 ${phase !== 'enter' ? 'text-rise' : ''}`}
          style={{ opacity: phase === 'enter' ? 0 : 1 }}
        >
          <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold mb-2">
            Careified Verified
          </div>
          <h1 className="text-[28px] font-black text-white m-0 tracking-tight">
            Your professional identity.
          </h1>
        </div>

        {/* ID Card */}
        <div
          className={`relative w-80 mb-8 [transform-style:preserve-3d] ${phase !== 'enter' ? 'id-card-flip' : ''}`}
          style={{ opacity: phase === 'enter' ? 0 : 1 }}
        >
          {/* Card */}
          <div
            className="rounded-[20px] p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0D1B3E 0%, #1E2D5E 50%, #0D1B3E 100%)',
              border: '1px solid rgba(201,151,58,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,151,58,0.1)',
            }}
          >

            {/* Shimmer sweep */}
            {(phase === 'shimmer' || phase === 'complete') && (
              <div
                className="shimmer-sweep absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
              />
            )}

            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-gold">
                Careified
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold tracking-[0.1em] uppercase text-white/40">
                <Shield size={10} className="text-white/40" />
                Verified Professional
              </div>
            </div>

            {/* Avatar + identity */}
            <div className="flex gap-4 items-start mb-5">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-[22px] font-black text-navy shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  boxShadow: '0 4px 12px rgba(201,151,58,0.3)',
                }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-black text-white m-0 mb-1 tracking-tight">
                  {displayName || 'Care Professional'}
                </h2>
                {caregiverData.jobTitle && (
                  <p className="text-[11px] text-white/50 m-0 mb-1.5">
                    {caregiverData.jobTitle}
                  </p>
                )}
                {caregiverData.credentials?.[0] && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
                    style={{
                      background: 'rgba(201,151,58,0.15)',
                      color: '#E8B86D',
                      border: '1px solid rgba(201,151,58,0.2)',
                    }}
                  >
                    {caregiverData.credentials[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {caregiverData.city && (
              <div className="flex items-center gap-[5px] text-[11px] text-white/40 mb-4">
                <MapPin size={11} />
                {caregiverData.city}{caregiverData.state ? `, ${caregiverData.state}` : ''}
              </div>
            )}

            {/* Divider */}
            <div
              className="h-px mb-4"
              style={{ background: 'linear-gradient(90deg, rgba(201,151,58,0.3), transparent)' }}
            />

            {/* ID code */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[8px] font-bold tracking-[0.1em] uppercase text-white/30 mb-[3px]">
                  Caregiver ID
                </div>
                <div className="text-xs font-bold text-white/70 tracking-[0.05em] font-mono">
                  {idCode}
                </div>
              </div>

              {/* QR placeholder */}
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="w-7 h-7"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 5'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M0 0h2v2H0zM3 0h2v2H3zM1 1h1v1H1zM3 1h1v1H3zM0 3h2v2H0zM1 4h1v1H1zM3 3h1v1H3zM4 4h1v1H4zM2 2h1v1H2z'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                  }}
                />
              </div>
            </div>

            {/* Gold accent line at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, #C9973A, #E8B86D)' }}
            />
          </div>

          {/* Verified badge — pops in */}
          {(phase === 'shimmer' || phase === 'complete') && (
            <div
              className="badge-pop absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                boxShadow: '0 4px 16px rgba(201,151,58,0.5)',
              }}
            >
              <Shield size={22} color="#0D1B3E" fill="#0D1B3E" />
            </div>
          )}
        </div>

        {/* Submitted message + buttons */}
        {phase === 'complete' && (
          <div className="buttons-fade text-center">
            <p className="text-[13px] text-white/50 mb-5 leading-[1.5]">
              Your profile has been submitted for review.<br />
              Agencies can find you once it&apos;s approved.
            </p>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <button
                onClick={onViewProfile}
                className="flex items-center gap-1.5 px-6 py-3 rounded-[10px] text-[13px] font-bold text-navy border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)' }}
              >
                <ExternalLink size={14} />
                View your profile
              </button>
              <button
                onClick={onDismiss}
                className="flex items-center gap-1.5 px-6 py-3 rounded-[10px] text-[13px] font-semibold text-white/70 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
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
