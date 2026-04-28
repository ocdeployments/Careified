'use client'

import React, { useState } from 'react'
import Image from 'next/image'

type Card = {
  id: 'caregivers' | 'agencies' | 'families'
  number: string
  label: string
  headline: string
  href: string
  stat: string
  statLabel: string
  gradient: string
  image: string
  imageAlt: string
  popup: {
    hook: string
    sub: string
    follow: string
    cta: string
  }
}

const CARDS: Card[] = [
  {
    id: 'caregivers',
    number: '01',
    label: 'For Caregivers',
    headline: "You don't need another app.\nBuild once. Be seen forever.",
    href: '/profile/start',
    stat: '9.7M',
    statLabel: 'jobs by 2034',
    gradient: 'linear-gradient(160deg, #0D1B3E 0%, #0F1F3D 45%, #1A1530 100%)',
    image: '/images/caregivers-hero.jpg',
    imageAlt: 'Professional caregivers',
    popup: {
      hook: "You don't need another app.",
      sub: 'A platform built to recognize what you\'ve earned, showcase who you are, and put your career exactly where it belongs — front and centre.',
      follow: 'Your record. Your reputation. Your profession.',
      cta: 'Claim your profile — free →',
    },
  },
  {
    id: 'agencies',
    number: '02',
    label: 'For Agencies',
    headline: 'Recruit without\nthe legwork.',
    href: '/for-agencies',
    stat: '75%',
    statLabel: 'annual turnover',
    gradient: 'linear-gradient(160deg, #0D1B3E 0%, #0C1A38 50%, #0A1628 100%)',
    image: '/images/agencies-hero.jpg',
    imageAlt: 'Agency staff in conversation',
    popup: {
      hook: 'Stop hiring blind.',
      sub: 'Careified screens candidates, handles scheduling, and delivers interview-ready professionals — so your team focuses on people, not paperwork.',
      follow: 'Source. Screen. Schedule. Done.',
      cta: 'See how it works →',
    },
  },
  {
    id: 'families',
    number: '03',
    label: 'For Families',
    headline: 'Professional care.\nProperly verified.',
    href: '/for-families',
    stat: '15+',
    statLabel: 'cities live',
    gradient: 'linear-gradient(160deg, #0D1B3E 0%, #13203F 45%, #1D1A30 100%)',
    image: '/images/families-hero.jpg',
    imageAlt: 'Caregiver with senior client',
    popup: {
      hook: 'Your family deserves more than a resume.',
      sub: "Your loved one deserves someone professionally trained, verified, and screened. We match your family's needs to agencies who meet that standard — every time.",
      follow: 'Clarity. Confidence. Care.',
      cta: 'Tell us what you need →',
    },
  },
]

const GOLD = '#C9A84C'
const GOLD_SOFT = 'rgba(201, 168, 76, 0.5)'
const NAVY = '#0D1B3E'
const CREAM = '#F5F0E8'

export default function CareifiedHero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: NAVY, color: CREAM }}
    >
      {/* Atmospheric glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${GOLD_SOFT.replace('0.5', '0.10')}, transparent 70%)`,
        }}
      />
      {/* Hairline at top */}
      <div
        className="absolute left-0 right-0 top-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}, transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-20 pb-16 md:px-12 md:pt-28">
        {/* Eyebrow */}
        <div className="mb-8 flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em]"
            style={{
              borderColor: `${GOLD}40`,
              background: `${GOLD}0D`,
              color: GOLD,
            }}
          >
            <span style={{ color: GOLD }}>●</span>
            The Professional Standard for Caregiving
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6 text-center">
          <h1
            className="mx-auto max-w-4xl leading-[1.0] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(40px, 4.5vw, 72px)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: GOLD,
            }}
          >
            Caregiving is a profession.
          </h1>
          <h1
            className="mx-auto max-w-4xl leading-[1.0] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(40px, 4.5vw, 72px)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: GOLD,
            }}
          >
            It's time the world knew it.
          </h1>
        </div>

        {/* Subhead */}
        <p
          className="mx-auto mb-16 max-w-2xl text-center text-[15px] leading-[1.7]"
          style={{ color: 'rgba(245,240,232,0.6)' }}
        >
          For caregivers who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>recognition</em>.
          Agencies who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>credibility</em>.
          Families who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>visibility</em>.
        </p>

        {/* Card grid */}
        <>
          <AccordionRow />
          <MobileCardStack />
        </>

        {/* Bottom ledger */}
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-[10px] uppercase tracking-[0.28em]"
          style={{
            borderColor: 'rgba(245,240,232,0.08)',
            color: 'rgba(245,240,232,0.4)',
          }}
        >
          <span>CAREGIVING IS A PROFESSION</span>
          <span className="hidden md:inline">VERIFIED. RECOGNIZED. TRUSTED.</span>
          <span>BUILT FOR CAREGIVERS · AGENCIES · FAMILIES</span>
          <span>YOUR CAREER. YOUR REPUTATION. YOUR RECORD.</span>
        </div>
      </div>
    </section>
  )
}

function AccordionRow() {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const activeIndex = activeCard
    ? CARDS.findIndex((c) => c.id === activeCard)
    : -1

  return (
    <div
      className="hidden md:flex w-full overflow-hidden rounded-2xl"
      style={{ height: '420px', gap: '8px' }}
      onMouseLeave={() => setActiveCard(null)}
    >
      {CARDS.map((card, idx) => (
        <AccordionCard
          key={card.id}
          card={card}
          index={idx}
          activeIndex={activeIndex}
          isActive={activeCard === card.id}
          isDimmed={activeCard !== null && activeCard !== card.id}
          onEnter={() => setActiveCard(card.id)}
          onLeave={() => setActiveCard(null)}
        />
      ))}
    </div>
  )
}

function AccordionCard({
  card,
  index,
  activeIndex,
  isActive,
  isDimmed,
  onEnter,
  onLeave,
}: {
  card: Card
  index: number
  activeIndex: number
  isActive: boolean
  isDimmed: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const flexValue = isActive ? 2.8 : isDimmed ? 0.4 : 1

  const labelSlideX =
    activeIndex === -1 ? 0 : index < activeIndex ? 24 : index > activeIndex ? -24 : 0

  const labelOpacity = isActive ? 0 : isDimmed ? 0 : 1

  return (
    <a
      href={card.href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative block overflow-hidden rounded-2xl"
      style={{
        flex: flexValue,
        minWidth: '72px',
        background: card.gradient,
        border: isActive
          ? `1px solid ${GOLD}`
          : '1px solid rgba(245, 240, 232, 0.08)',
        boxShadow: isActive
          ? `0 30px 60px -15px rgba(0,0,0,0.6), 0 0 80px -20px ${GOLD}66`
          : '0 12px 30px -12px rgba(0,0,0,0.4)',
        opacity: isDimmed ? 0.5 : 1,
        transition:
          'flex 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease, border-color 300ms ease, box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Photo */}
      <Image
        src={card.image}
        alt={card.imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
        style={{
          opacity: isActive ? 0.75 : isDimmed ? 0.3 : 0.55,
          transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        priority={index === 0}
      />

      {/* Gradient scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isActive
            ? 'linear-gradient(180deg, rgba(13,27,62,0.20) 0%, rgba(13,27,62,0.45) 55%, rgba(13,27,62,0.88) 100%)'
            : 'linear-gradient(180deg, rgba(13,27,62,0.30) 0%, rgba(13,27,62,0.50) 55%, rgba(13,27,62,0.85) 100%)',
          transition: 'background 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Top gold hairline */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}, transparent)`,
          opacity: isActive ? 1 : 0.4,
          transition: 'opacity 500ms ease',
        }}
      />

      {/* Horizontal label */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '28px',
          top: '28px',
          opacity: labelOpacity,
          transform: `translateX(${labelSlideX}px)`,
          transition:
            'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: '24px',
            height: '1px',
            background: GOLD,
            marginBottom: '10px',
          }}
        />
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: GOLD,
            whiteSpace: 'nowrap',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {card.label}
        </span>
      </div>

      {/* Expanded content */}
      <div
        className="absolute inset-0 z-10"
        style={{
          opacity: isActive ? 1 : 0,
          transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isActive ? 'auto' : 'none',
        }}
      >
        <div className="absolute left-7 top-7">
          <div
            style={{
              width: '32px',
              height: '1px',
              background: GOLD,
              marginBottom: '12px',
            }}
          />
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            {card.label}
          </div>
        </div>

        <div
          className="absolute right-7 top-7 flex items-center justify-center rounded-full transition-all duration-500"
          style={{
            width: '30px',
            height: '30px',
            border: `1px solid ${GOLD}`,
            background: 'transparent',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 6H11M11 6L6 1M11 6L6 11"
              stroke={GOLD}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute select-none"
          style={{
            right: '-2%',
            bottom: '-12%',
            fontSize: '200px',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontFamily:
              "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
            color: GOLD,
            opacity: 0.12,
          }}
        >
          {card.number}
        </div>

        <div
          className="absolute z-10"
          style={{
            left: '28px',
            bottom: '28px',
            maxWidth: '70%',
            transform: isActive ? 'translateY(-52px)' : 'translateY(0)',
            transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              fontFamily:
                "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2rem, 2.5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: CREAM,
              whiteSpace: 'pre-line',
            }}
          >
            {card.headline}
          </div>
        </div>

        <div
          className="absolute z-10 text-right"
          style={{
            right: '28px',
            bottom: '28px',
            opacity: isActive ? 0 : 1,
            transition: 'opacity 400ms ease',
          }}
        >
          <div
            style={{
              color: GOLD,
              fontSize: '1.8rem',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontFamily:
                "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
            }}
          >
            {card.stat}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '0.58rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(245, 240, 232, 0.5)',
            }}
          >
            {card.statLabel}
          </div>
        </div>

        <div
          className="absolute left-0 right-0 bottom-0 z-20"
          style={{
            background:
              'linear-gradient(to top, rgba(201, 168, 76, 0.15), transparent)',
            borderTop: '1px solid rgba(201, 168, 76, 0.2)',
            padding: '18px 26px',
            transform: isActive ? 'translateY(0)' : 'translateY(100%)',
            opacity: isActive ? 1 : 0,
            transition:
              'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
          }}
        >
          <p
            style={{
              fontSize: '0.78rem',
              lineHeight: 1.55,
              color: 'rgba(245, 240, 232, 0.72)',
              margin: 0,
              marginBottom: '10px',
            }}
          >
            {card.popup.sub}
          </p>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: GOLD,
            }}
          >
            {card.popup.cta} →
          </span>
        </div>
      </div>
    </a>
  )
}

function MobileCardStack() {
  return (
    <div className="md:hidden flex flex-col gap-4">
      {CARDS.map((card) => (
        <a
          key={card.id}
          href={card.href}
          className="relative block overflow-hidden rounded-2xl"
          style={{
            height: '260px',
            background: card.gradient,
            border: '1px solid rgba(245, 240, 232, 0.08)',
          }}
        >
          {/* Photo */}
          <Image
            src={card.image}
            alt={card.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ opacity: 0.4 }}
          />

          {/* Gradient scrim */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(13,27,62,0.45) 0%, rgba(13,27,62,0.7) 50%, rgba(13,27,62,0.95) 100%)',
            }}
          />

          <div className="absolute left-6 top-6">
            <div
              style={{
                width: '32px',
                height: '1px',
                background: GOLD,
                marginBottom: '10px',
              }}
            />
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              {card.label}
            </div>
          </div>

          <div
            className="pointer-events-none absolute select-none"
            style={{
              right: '-2%',
              bottom: '-10%',
              fontSize: '160px',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontFamily:
                "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              color: GOLD,
              opacity: 0.12,
            }}
          >
            {card.number}
          </div>

          <div className="absolute left-6 bottom-20 z-10 max-w-[80%]">
            <div
              style={{
                fontFamily:
                  "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
                fontSize: '1.6rem',
                fontWeight: 800,
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
                color: CREAM,
                whiteSpace: 'pre-line',
              }}
            >
              {card.headline}
            </div>
          </div>

          <div className="absolute left-6 right-6 bottom-6 z-10 flex items-end justify-between">
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: GOLD,
              }}
            >
              {card.popup.cta} →
            </span>
            <div className="text-right">
              <div
                style={{
                  color: GOLD,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  fontFamily:
                    "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
                }}
              >
                {card.stat}
              </div>
              <div
                style={{
                  marginTop: '2px',
                  fontSize: '0.55rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'rgba(245, 240, 232, 0.5)',
                }}
              >
                {card.statLabel}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}