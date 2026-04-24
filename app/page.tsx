'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UserCheck, Search, Shield } from 'lucide-react'

const cardData = [
  {
    id: 'caregivers',
    label: 'For Caregivers',
    headline: 'Free. Always. Build once.',
    cta: 'Build free profile →',
    href: '/for-caregivers',
    popup: {
      hook: "You don't need another app.",
      sub: "You need a platform that sees you, values you, and treats you like the professional you are.",
      follow: "CareShepherds is built for caregivers who are done being invisible.",
      cta: 'Start your free profile',
      ctaHref: '/for-caregivers',
    }
  },
  {
    id: 'agencies',
    label: 'For Agencies',
    headline: 'Search verified profiles.',
    cta: 'Start hiring →',
    href: '/agency',
    popup: {
      hook: "Stop hiring blind.",
      sub: "Every caregiver on Careified has a verified record — credentials, placements, and peer ratings you can trust.",
      follow: "Make confident hiring decisions from day one.",
      cta: 'Start searching now',
      ctaHref: '/agency',
    }
  },
  {
    id: 'families',
    label: 'For Families',
    headline: 'Know who is caring.',
    cta: 'Learn more →',
    href: '/families',
    popup: {
      hook: "Your family deserves more than a resume.",
      sub: "See real credentials, verified work history, and ratings from other families — before you decide.",
      follow: "Because who cares for your family matters more than anything.",
      cta: 'Find a caregiver',
      ctaHref: '/families',
    }
  }
]

export default function HomePage() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <div className="font-sans bg-[#F7F4F0]">

        {/* ── Hero (dark navy) ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#0D1B3E] pt-24 pb-20">

          {/* Logo — large, centered, impactful */}
          <div className="mb-16 flex justify-center">
            <img
              src="/careified-logo.svg"
              alt="Careified — Qualified. Recognized. Verified."
              className="h-28 md:h-36 w-auto"
            />
          </div>

          {/* Cards row — with hover popup */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cardData.map((card) => (
                <div
                  key={card.id}
                  className="relative group"
                  onMouseEnter={() => setActiveCard(card.id)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  {/* Main card */}
                  <a
                    href={card.href}
                    className="block bg-[#0D1B3E] border border-[#C9A84C]/30 rounded-2xl p-8 min-h-[200px] flex flex-col justify-between transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(201,168,76,0.15)]"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div>
                      <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">
                        {card.label}
                      </p>
                      <h3 className="text-white text-xl font-bold mb-4 leading-snug">
                        {card.headline}
                      </h3>
                    </div>
                    <span className="text-[#C9A84C] text-sm font-medium">{card.cta}</span>
                  </a>

                  {/* Hover popup — appears to the right */}
                  <div
                    className={`
                      absolute top-0 ${card.id === 'families' ? 'right-[calc(100%+16px)]' : 'left-[calc(100%+16px)]'} w-80 z-50
                      bg-[#0A1628] border border-[#C9A84C]/40 rounded-2xl p-7
                      shadow-[0_16px_48px_rgba(0,0,0,0.6)]
                      backdrop-blur-sm
                      transition-all duration-300 ease-out
                      ${activeCard === card.id
                        ? 'opacity-100 translate-x-0 pointer-events-auto'
                        : 'opacity-0 -translate-x-2 pointer-events-none'
                      }
                    `}
                  >
                    {/* Gold accent line top */}
                    <div className="w-8 h-0.5 bg-[#C9A84C] mb-5" />

                    {/* Hook headline */}
                    <h4 className="text-white text-xl font-bold mb-3 leading-tight">
                      {card.popup.hook}
                    </h4>

                    {/* Sub-headline */}
                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                      {card.popup.sub}
                    </p>

                    {/* Follow-up line */}
                    <p className="text-[#C9A84C]/80 text-xs leading-relaxed mb-6 italic">
                      {card.popup.follow}
                    </p>

                    {/* CTA button */}
                    <a
                      href={card.popup.ctaHref}
                      className="inline-block w-full text-center px-5 py-3 bg-[#C9A84C] text-[#0D1B3E] text-sm font-bold rounded-lg hover:bg-[#b8973b] transition-colors"
                    >
                      {card.popup.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── Stats bar (very dark) ── */}
        <section className="bg-[#080F1E] px-6 py-5" aria-label="Industry statistics">
          <div className="max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-4">
            {[
              { n: '75%',    l: 'Annual turnover'   },
              { n: '4 in 5', l: 'Leave 100 days'    },
              { n: '9.7M',   l: 'Jobs by 2034'      },
              { n: '15+',    l: 'Live in TX'         },
            ].map(stat => (
              <div key={stat.n} className="p-3">
                <div className="font-serif text-[22px] font-bold text-white">{stat.n}</div>
                <div className="text-[11px] text-white/70 mt-1 leading-tight">{stat.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works (cream) ── */}
        <section className="bg-[#F7F4F0] px-6 py-20" aria-label="How Careified works">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[38px] text-[#0D1B3E] leading-tight mb-10">
              A reputation system<br />caregiving has never had
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <UserCheck size={24} className="text-[#0D1B3E]" />,
                  num: '01',
                  title: 'Build your profile',
                  desc: '7 steps. Your complete professional record — credentials, experience, references.',
                },
                {
                  icon: <Search size={24} className="text-[#0D1B3E]" />,
                  num: '02',
                  title: 'Get placed',
                  desc: 'Agencies search by match score, availability, and specialization.',
                },
                {
                  icon: <Shield size={24} className="text-[#0D1B3E]" />,
                  num: '03',
                  title: 'Earn your score',
                  desc: 'Verified badges and ratings no one can take away.',
                },
              ].map(step => (
                <div key={step.num} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="font-serif text-2xl font-bold text-[#C9973A] mb-3">{step.num}</div>
                  <div className="mb-3">{step.icon}</div>
                  <div className="text-[15px] font-semibold text-[#0D1B3E] mb-2">{step.title}</div>
                  <div className="text-[13px] text-slate-600 leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA (dark gradient) ── */}
        <section
          className="px-6 py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 100%)' }}
          aria-label="Call to action"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-[44px] font-bold text-white leading-tight mb-3">
              The information problem<br />in caregiving ends here
            </h2>
            <p className="text-sm text-white/80 mb-9 leading-relaxed">
              75% annual turnover. Every hire starts blind. Not anymore.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up?role=agency"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-br from-[#C9973A] to-[#E8B86D] text-[#0D1B3E] text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                I'm an agency
              </Link>
              <Link
                href="/sign-up?role=caregiver"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
              >
                I'm a caregiver — it's free
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-[#0D1B3E] px-6 pt-12 pb-8">
          <div className="max-w-[960px] mx-auto">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-[6px] bg-gradient-to-br from-[#C9973A] to-[#E8B86D] flex items-center justify-center">
                <span className="font-extrabold text-[#0D1B3E] text-xs">C</span>
              </div>
              <span className="text-[13px] font-semibold text-white">Careified</span>
            </div>
            <p className="text-xs text-white/60 max-w-[200px] leading-relaxed mb-8">
              Verified reputations for the caregiving profession. Texas-first.
            </p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
              {[
                { href: '/for-agencies',   label: 'Agencies'   },
                { href: '/for-caregivers', label: 'Caregivers' },
                { href: '/for-families',   label: 'Families'   },
                { href: '/about',          label: 'About'      },
                { href: '/contact',        label: 'Contact'    },
                { href: '/privacy',        label: 'Privacy'    },
                { href: '/terms',          label: 'Terms'      },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-white/60 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none rounded"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
    </div>
  )
}