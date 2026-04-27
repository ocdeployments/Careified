'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PopupContent {
  hook: string;
  sub: string;
  follow: string;
  cta: string;
}

interface CardData {
  id: string;
  number: string;
  label: string;
  headline: React.ReactNode;
  href: string;
  stat: string;
  statLabel: string;
  gradient: string;
  accent: string;
  image: string;
  popup: PopupContent;
}

function Logo() {
  return (
    <div className="flex justify-center mb-16">
      <img
        src="/careified-logo.svg"
        alt="Careified — Qualified. Recognized. Verified."
        className="h-28 md:h-36 w-auto"
      />
    </div>
  )
}

function AudienceCard({
  card,
  index,
  isActive,
  isDimmed,
  onEnter,
  totalCards,
}: {
  card: CardData;
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  totalCards: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      onMouseEnter={onEnter}
      style={{
        flex: isActive ? '2.8' : isDimmed ? '0.4' : '1',
        minWidth: '72px',
        border: isActive
          ? '1px solid #C9A84C'
          : '1px solid rgba(245,240,232,0.08)',
        boxShadow: isActive
          ? '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 80px -20px rgba(201,168,76,0.35)'
          : '0 12px 30px -12px rgba(0,0,0,0.5)',
        opacity: isDimmed ? 0.5 : 1,
        transition:
          'flex 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease',
      }}
    >
      {/* PHOTO BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${card.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isActive ? 'scale(1.06)' : 'scale(1.0)',
          transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* DARK NAVY OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? 'linear-gradient(to top, rgba(13,27,62,0.94) 0%, rgba(13,27,62,0.5) 55%, rgba(13,27,62,0.25) 100%)'
            : 'linear-gradient(to top, rgba(13,27,62,0.98) 0%, rgba(13,27,62,0.85) 100%)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* VERTICAL LABEL — shows only when compressed */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: isActive ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <span
          style={{
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          {card.label}
        </span>
      </div>

      {/* CARD CONTENT — shows only when expanded */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-7"
        style={{
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.35s ease 0.1s',
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        {/* TOP ROW */}
        <div className="flex items-start justify-between">
          <div>
            <div
              style={{
                height: '1px',
                width: '32px',
                background: '#C9A84C',
                marginBottom: '10px',
              }}
            />
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#C9A84C',
              }}
            >
              {card.label}
            </span>
          </div>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 6H11M11 6L6 1M11 6L6 11"
                stroke="#C9A84C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* LARGE FADED NUMBER */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            right: '-2%',
            bottom: '-10%',
            fontSize: 'clamp(140px, 18vw, 220px)',
            fontWeight: 800,
            lineHeight: 1,
            color: '#C9A84C',
            opacity: 0.12,
            fontFamily: 'inherit',
          }}
        >
          {card.number}
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative z-10">
          {/* Headline — slides up on hover to reveal message */}
          <div
            style={{
              transform: isActive ? 'translateY(-54px)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1.8rem, 2.2vw, 2.8rem)',
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: '#F5F0E8',
                marginBottom: '12px',
              }}
            >
              {card.headline}
            </div>
            {/* Stat */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.7rem',
                  fontWeight: 800,
                  color: '#C9A84C',
                  lineHeight: 1,
                }}
              >
                {card.stat}
              </div>
              <div
                style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.5)',
                  marginTop: '2px',
                }}
              >
                {card.statLabel}
              </div>
            </div>
          </div>

          {/* SLIDE-UP MESSAGE PANEL */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              transform: isActive ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              borderTop: '1px solid rgba(201,168,76,0.2)',
              paddingTop: '14px',
              background:
                'linear-gradient(to top, rgba(201,168,76,0.12), transparent)',
            }}
          >
            <p
              style={{
                fontSize: '0.78rem',
                color: 'rgba(245,240,232,0.75)',
                lineHeight: 1.55,
                marginBottom: '10px',
              }}
            >
              {card.popup.sub}
            </p>
            <a
              href={card.href}
              style={{
                fontSize: '0.7rem',
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
}

export default function CareifiedHero() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const cards: CardData[] = [
    {
      id: 'caregivers',
      number: '01',
      label: 'For Caregivers',
      headline: (
        <>
          Free. Always.<br />Build once.
        </>
      ),
      href: '/for-caregivers',
      stat: '100%',
      statLabel: 'Free forever',
      gradient: 'from-[#0D1B3E] to-[#1E3A8A]',
      accent: '#C9A84C',
      image: '/caregivers-hero.jpg',
      popup: {
        hook: "You don't need another app.",
        sub: "You need a platform that sees you, values you, and treats you like the professional you are.",
        follow: "Careified is built for caregivers who are done being invisible.",
        cta: 'Start your free profile',
      },
    },
    {
      id: 'agencies',
      number: '02',
      label: 'For Agencies',
      headline: (
        <>
          Search verified<br />profiles.
        </>
      ),
      href: '/agency',
      stat: '9.7M',
      statLabel: 'Jobs by 2034',
      gradient: 'from-[#0D1B3E] to-[#1E3A8A]',
      accent: '#C9A84C',
      image: '/agencies-hero.jpg',
      popup: {
        hook: "Stop hiring blind.",
        sub: "Every caregiver on Careified has a verified record — credentials, placements, and peer ratings you can trust.",
        follow: "Make confident hiring decisions from day one.",
        cta: 'Start searching now',
      },
    },
    {
      id: 'families',
      number: '03',
      label: 'For Families',
      headline: (
        <>
          Know who<br />is caring.
        </>
      ),
      href: '/families',
      stat: '15+',
      statLabel: 'Cities live',
      gradient: 'from-[#0D1B3E] to-[#1E3A8A]',
      accent: '#C9A84C',
      image: '/families-hero.jpg',
      popup: {
        hook: "Your family deserves more than a resume.",
        sub: "See real credentials, verified work history, and ratings from other families — before you decide.",
        follow: "Because who cares for your family matters more than anything.",
        cta: 'Find a caregiver',
      },
    },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#0D1B3E] pt-24 pb-20">
      <Logo />

      <div
        className="relative mt-16 w-full max-w-[1400px] md:mt-20"
        onMouseLeave={() => setActiveCard(null)}
      >
        <div
          className="hidden md:flex gap-4"
          style={{ height: '440px' }}
        >
          {cards.map((card, idx) => (
            <AudienceCard
              key={card.id}
              card={card}
              index={idx}
              isActive={activeCard === card.id}
              isDimmed={activeCard !== null && activeCard !== card.id}
              onEnter={() => setActiveCard(card.id)}
              totalCards={cards.length}
            />
          ))}
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-col gap-4 md:hidden mt-16">
          {cards.map((card, idx) => (
            <AudienceCard
              key={card.id}
              card={card}
              index={idx}
              isActive={true}
              isDimmed={false}
              onEnter={() => {}}
              totalCards={cards.length}
            />
          ))}
        </div>

        {/* Footer ledger line */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.22em] text-white/35">
          <span><span style={{ color: '#C9A84C' }}>●</span> Live in 15+ cities</span>
          <span className="hidden md:inline">Verified credentials · Peer ratings · Agency-grade trust</span>
          <span>EST. 2026 — Frisco, TX → North America</span>
        </div>
      </div>
    </section>
  )
}