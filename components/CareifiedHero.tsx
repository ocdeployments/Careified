'use client'

import React, { useState } from 'react'

interface PopupContent {
  hook: string
  sub: string
  follow: string
  cta: string
}

interface CardData {
  id: string
  number: string
  label: string
  headline: string[]
  href: string
  stat: string
  statLabel: string
  image: string
  popup: PopupContent
}

const cards: CardData[] = [
  {
    id: 'caregivers',
    number: '01',
    label: 'For Caregivers',
    headline: ["You don't need another app.", 'Build once. Be seen forever.'],
    href: '/for-caregivers',
    stat: '9.7M',
    statLabel: 'jobs by 2034',
    image: '/images/caregivers-hero.jpg',
    popup: {
      hook: "You don't need another app.",
      sub: "A platform built to recognize what you've earned, showcase who you are, and put your career exactly where it belongs — front and centre.",
      follow: "Your record. Your reputation. Your profession.",
      cta: "Claim your profile — free",
    },
  },
  {
    id: 'agencies',
    number: '02',
    label: 'For Agencies',
    headline: ['Recruit without', 'the legwork.'],
    href: '/agency',
    stat: '75%',
    statLabel: 'annual turnover',
    image: '/images/agencies-hero.jpg',
    popup: {
      hook: "Recruit without the legwork.",
      sub: "Careified screens candidates, handles scheduling, and delivers interview-ready professionals — so your team focuses on people, not paperwork.",
      follow: "Source. Screen. Schedule. Done.",
      cta: "See how it works",
    },
  },
  {
    id: 'families',
    number: '03',
    label: 'For Families',
    headline: ['Professional care.', 'Properly verified.'],
    href: '/families',
    stat: '15+',
    statLabel: 'cities live',
    image: '/images/families-hero.jpg',
    popup: {
      hook: "Professional care. Properly verified.",
      sub: "Your loved one deserves someone professionally trained, verified, and screened. We match your family's needs to agencies who meet that standard — every time.",
      follow: "Clarity. Confidence. Care.",
      cta: "Tell us what you need",
    },
  },
]

export default function CareifiedHero() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#0D1B3E',
        color: '#F5F0E8',
        overflow: 'hidden',
      }}
    >
      {/* Atmospheric radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.12), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Large logo watermark behind */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(320px, 55vw, 700px)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        <img
          src="/careified-logo.svg"
          alt=""
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.07,
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(245,240,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,1) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* === HERO SECTION === */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        {/* Gold pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: '32px',
            background: 'rgba(201,168,76,0.08)',
          }}
        >
          <span style={{ fontSize: '8px' }}>●</span>
          The Professional Standard for Caregiving
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          lineHeight: 1.05,
          marginBottom: '24px',
        }}>
          {/* Line 1 — Bold, caps, tracking */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#F5F0E8',
            marginBottom: '12px',
          }}>
            Caregiving is a profession.
          </span>

          {/* Thin gold rule */}
          <span style={{
            display: 'block',
            height: '1px',
            width: '48px',
            background: '#C9A84C',
            margin: '0 auto 16px',
          }} />

          {/* Line 2 — Large italic serif, gold */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
            fontWeight: 500,
            fontStyle: 'italic',
            color: '#C9A84C',
            letterSpacing: '-0.02em',
          }}>
            It's time the world knew it.
          </span>
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
            color: 'rgba(245,240,232,0.55)',
            maxWidth: '580px',
            lineHeight: 1.7,
            marginBottom: '48px',
            letterSpacing: '0.01em',
          }}
        >
          For caregivers who demand{' '}
          <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>recognition</span>.
          {' '}Agencies who demand{' '}
          <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>credibility</span>.
          {' '}Families who demand{' '}
          <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>visibility</span>.
        </p>

        {/* Divider lines with bridge text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div style={{ height: '1px', width: '60px', background: 'rgba(201,168,76,0.4)' }} />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.4)',
            }}
          >
            This platform was built for you
          </span>
          <div style={{ height: '1px', width: '60px', background: 'rgba(201,168,76,0.4)' }} />
        </div>
      </section>

      {/* === ACCORDION CARDS === */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 32px 80px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Desktop accordion row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            height: '460px',
          }}
          onMouseLeave={() => setActiveCard(null)}
        >
          {cards.map((card, idx) => {
            const isActive = activeCard === card.id
            const isDimmed = activeCard !== null && activeCard !== card.id

            return (
              <div
                key={card.id}
                onMouseEnter={() => setActiveCard(card.id)}
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  flex: isActive ? '2.8 0 0' : isDimmed ? '0.4 0 0' : '1 0 0',
                  minWidth: '72px',
                  border: isActive
                    ? '1px solid #C9A84C'
                    : '1px solid rgba(245,240,232,0.1)',
                  boxShadow: isActive
                    ? '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 60px -20px rgba(201,168,76,0.3)'
                    : '0 8px 24px rgba(0,0,0,0.4)',
                  opacity: isDimmed ? 0.45 : 1,
                  transition: 'flex 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease',
                }}
              >
                {/* Photo background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    transform: isActive ? 'scale(1.07)' : 'scale(1.0)',
                    transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />

                {/* Overlay — lighter when active to show photo */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isActive
                      ? 'linear-gradient(to top, rgba(13,27,62,0.92) 0%, rgba(13,27,62,0.45) 50%, rgba(13,27,62,0.2) 100%)'
                      : 'linear-gradient(to top, rgba(13,27,62,0.97) 0%, rgba(13,27,62,0.82) 100%)',
                    transition: 'background 0.5s ease',
                  }}
                />

                {/* COMPRESSED STATE: vertical label */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isActive ? 0 : 1,
                    transition: 'opacity 0.25s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      transform: 'rotate(-90deg)',
                      whiteSpace: 'nowrap',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                    }}
                  >
                    {card.label}
                  </span>
                </div>

                {/* EXPANDED STATE: full card content */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.3s ease 0.15s',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  {/* Top row: label + arrow */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ height: '1px', width: '28px', background: '#C9A84C', marginBottom: '10px' }} />
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C' }}>
                        {card.label}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid rgba(201,168,76,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Large faded number */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-2%',
                      bottom: '-8%',
                      fontSize: 'clamp(120px, 16vw, 200px)',
                      fontWeight: 800,
                      lineHeight: 1,
                      color: '#C9A84C',
                      opacity: 0.13,
                      userSelect: 'none',
                      pointerEvents: 'none',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {card.number}
                  </div>

                  {/* Bottom: headline + slide-up message */}
                  <div style={{ position: 'relative' }}>
                    {/* Headline slides up */}
                    <div
                      style={{
                        transform: isActive ? 'translateY(-60px)' : 'translateY(0)',
                        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'clamp(1.8rem, 2.4vw, 2.8rem)',
                          fontWeight: 800,
                          lineHeight: 0.95,
                          letterSpacing: '-0.03em',
                          color: '#F5F0E8',
                          marginBottom: '14px',
                        }}
                      >
                        {card.headline.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      {/* Stat */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C9A84C', lineHeight: 1 }}>
                          {card.stat}
                        </div>
                        <div style={{ fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', marginTop: '3px' }}>
                          {card.statLabel}
                        </div>
                      </div>
                    </div>

                    {/* Slide-up message panel */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(100%)',
                        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                        borderTop: '1px solid rgba(201,168,76,0.25)',
                        paddingTop: '14px',
                      }}
                    >
                      <p style={{ fontSize: '0.78rem', color: 'rgba(245,240,232,0.78)', lineHeight: 1.55, marginBottom: '10px' }}>
                        {card.popup.sub}
                      </p>
                      <a
                        href={card.href}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#C9A84C',
                          textDecoration: 'none',
                        }}
                      >
                        {card.popup.cta} →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer ledger line */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(245,240,232,0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.3)',
          }}
        >
          <span><span style={{ color: '#C9A84C' }}>●</span> Live in 15+ cities</span>
          <span>Caregiving is a profession · Careified is its standard</span>
          <span>Est. 2026 — Frisco, TX → North America</span>
        </div>
      </div>
    </div>
  )
}