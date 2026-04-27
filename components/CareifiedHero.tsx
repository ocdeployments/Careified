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
  image: string
  imageAlt: string
}

const CARDS: Card[] = [
  {
    id: 'caregivers',
    number: '01',
    label: 'For Caregivers',
    headline: 'Build once.\nBe seen forever.',
    href: '/for-caregivers',
    stat: '9.7M',
    statLabel: 'jobs by 2034',
    image: '/images/caregivers-hero.jpg',
    imageAlt: 'Professional caregivers',
  },
  {
    id: 'agencies',
    number: '02',
    label: 'For Agencies',
    headline: 'Recruit without\nthe legwork.',
    href: '/for-agencies',
    stat: '75%',
    statLabel: 'annual turnover',
    image: '/images/agencies-hero.jpg',
    imageAlt: 'Agency staff in conversation',
  },
  {
    id: 'families',
    number: '03',
    label: 'For Families',
    headline: 'Professional care.\nProperly verified.',
    href: '/for-families',
    stat: '15+',
    statLabel: 'cities live',
    image: '/images/families-hero.jpg',
    imageAlt: 'Caregiver with senior client',
  },
]

const GOLD = '#C9973A'
const GOLD_SOFT = 'rgba(201, 151, 58, 0.5)'
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
          <div
            className="mb-4 text-[14px] font-medium uppercase tracking-[0.28em]"
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              color: CREAM,
            }}
          >
            Caregiving is a profession.
          </div>
          <div
            className="mx-auto mb-6 h-[1px] w-12"
            style={{ background: GOLD }}
          />
          <h1
            className="mx-auto max-w-5xl leading-[1.0] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(44px, 6vw, 92px)',
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
          className="mx-auto mb-12 max-w-2xl text-center text-[15px] leading-[1.7]"
          style={{ color: 'rgba(245,240,232,0.6)' }}
        >
          For caregivers who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>recognition</em>.
          Agencies who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>credibility</em>.
          Families who demand <em style={{ color: GOLD, fontStyle: 'italic' }}>visibility</em>.
        </p>

        {/* Divider */}
        <div className="mb-14 flex items-center justify-center gap-3">
          <span className="h-[1px] w-12" style={{ background: 'rgba(245,240,232,0.2)' }} />
          <span
            className="text-[10px] font-medium uppercase tracking-[0.32em]"
            style={{ color: 'rgba(245,240,232,0.45)' }}
          >
            This platform was built for you
          </span>
          <span className="h-[1px] w-12" style={{ background: 'rgba(245,240,232,0.2)' }} />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {CARDS.map((card, idx) => (
            <PhotoCard key={card.id} card={card} index={idx} total={CARDS.length} />
          ))}
        </div>

        {/* Bottom ledger */}
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-[10px] uppercase tracking-[0.28em]"
          style={{
            borderColor: 'rgba(245,240,232,0.08)',
            color: 'rgba(245,240,232,0.4)',
          }}
        >
          <span>
            <span style={{ color: GOLD }}>●</span> Live in 15+ cities
          </span>
          <span className="hidden md:inline">
            Caregiving is a profession · Careified is its standard
          </span>
          <span>Est. 2026 — Frisco, TX → North America</span>
        </div>
      </div>
    </section>
  )
}

function PhotoCard({
  card,
  index,
  total,
}: {
  card: Card
  index: number
  total: number
}) {
  const [active, setActive] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <a
        href={card.href}
        className="relative block h-[520px] overflow-hidden rounded-2xl"
        style={{
          border: active ? `1px solid ${GOLD}` : '1px solid rgba(245,240,232,0.08)',
          boxShadow: active
            ? `0 30px 60px -15px rgba(0,0,0,0.6), 0 0 60px -20px ${GOLD}66`
            : '0 12px 30px -12px rgba(0,0,0,0.4)',
          transform: active ? 'translateY(-8px)' : 'translateY(0)',
          transition:
            'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1), border-color 300ms ease',
        }}
      >
        {/* Photo — luminous */}
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          style={{
            opacity: active ? 0.95 : 0.78,
            transform: active ? 'scale(1.04)' : 'scale(1.0)',
            transition:
              'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          priority={index === 0}
        />

        {/* Gradient scrim — dark bottom for legibility, transparent top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(13,27,62,0.20) 0%, rgba(13,27,62,0.55) 55%, rgba(13,27,62,0.92) 100%)',
          }}
        />

        {/* Large faded number — bottom-right corner */}
        <div
          className="pointer-events-none absolute select-none"
          style={{
            right: '-1%',
            bottom: '-12%',
            fontSize: 'clamp(200px, 22vw, 300px)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontFamily: "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
            color: GOLD,
            opacity: active ? 0.22 : 0.13,
            transition: 'opacity 600ms ease',
            mixBlendMode: 'screen',
          }}
        >
          {card.number}
        </div>

        {/* Top hairline */}
        <div
          className="absolute left-7 top-7 h-[1px] transition-all duration-500"
          style={{
            width: active ? '64px' : '24px',
            background: GOLD,
          }}
        />

        {/* Gold label */}
        <div
          className="absolute left-7 top-11 text-[10px] font-medium uppercase tracking-[0.28em]"
          style={{ color: GOLD }}
        >
          {card.label}
        </div>

        {/* Checkmark indicator top-right */}
        <div
          className="absolute right-7 top-7 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500"
          style={{
            border: `1px solid ${active ? GOLD : `${GOLD}50`}`,
            background: active ? GOLD : 'transparent',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M2 5.5L4.5 8L9 3"
              stroke={active ? NAVY : GOLD}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Headline bottom-left — over photo */}
        <div className="absolute bottom-7 left-7 z-10 max-w-[78%]">
          <div
            style={{
              fontFamily:
                "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(28px, 2.4vw, 36px)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: CREAM,
              whiteSpace: 'pre-line',
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}
          >
            {card.headline}
          </div>
        </div>

        {/* Stat bottom-right */}
        <div className="absolute bottom-7 right-7 z-10 text-right">
          <div
            style={{
              fontFamily:
                "var(--font-dm-serif), 'DM Serif Display', Georgia, serif",
              color: GOLD,
              fontSize: 'clamp(28px, 2.2vw, 36px)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {card.stat}
          </div>
          <div
            className="mt-1 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(245,240,232,0.7)' }}
          >
            {card.statLabel}
          </div>
        </div>
      </a>
    </div>
  )
}