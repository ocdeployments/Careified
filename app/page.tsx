'use client'

import Link from 'next/link'
import { UserCheck, Search, Shield } from 'lucide-react'
import LandingAnimation from '@/components/LandingAnimation'

export default function HomePage() {
  return (
    <div className="font-sans bg-[#F7F4F0]">

        {/* ── Hero (dark navy) ── */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 bg-[#0D1B3E] pt-24 pb-16">

          {/* Inline animation — plays once on load, stays visible */}
          <div className="w-full max-w-lg mx-auto mb-16 flex items-center justify-center">
            <LandingAnimation />
          </div>

          {/* Audience cards — Caregivers, Agencies, Families */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — For Caregivers */}
            <a
              href="/for-caregivers"
              className="group relative overflow-hidden bg-[#0D1B3E] border border-[#C9A84C]/30 rounded-2xl p-8 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(201,168,76,0.2)]"
            >
              {/* Default visible content */}
              <div className="transition-all duration-300 group-hover:-translate-y-2">
                <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-3">For Caregivers</p>
                <h3 className="text-white text-2xl font-bold mb-2">Free. Always.<br />Build once.</h3>
                <span className="text-[#C9A84C] text-sm font-medium">Build free profile →</span>
              </div>

              {/* Hover reveal message — slides up from bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#C9A84C]/10 border-t border-[#C9A84C]/30 px-8 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/80 text-sm leading-relaxed">
                  Build your verified professional profile once. Let your reputation speak for you across every agency you work with.
                </p>
              </div>
            </a>

            {/* Card 2 — For Agencies */}
            <a
              href="/agency"
              className="group relative overflow-hidden bg-[#0D1B3E] border border-[#C9A84C]/30 rounded-2xl p-8 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(201,168,76,0.2)]"
            >
              <div className="transition-all duration-300 group-hover:-translate-y-2">
                <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-3">For Agencies</p>
                <h3 className="text-white text-2xl font-bold mb-2">Search verified<br />profiles.</h3>
                <span className="text-[#C9A84C] text-sm font-medium">Start hiring →</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-[#C9A84C]/10 border-t border-[#C9A84C]/30 px-8 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/80 text-sm leading-relaxed">
                  Stop hiring blind. Search caregivers by match score, credentials, and verified placement history — all in one place.
                </p>
              </div>
            </a>

            {/* Card 3 — For Families */}
            <a
              href="/families"
              className="group relative overflow-hidden bg-[#0D1B3E] border border-[#C9A84C]/30 rounded-2xl p-8 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(201,168,76,0.2)]"
            >
              <div className="transition-all duration-300 group-hover:-translate-y-2">
                <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-3">For Families</p>
                <h3 className="text-white text-2xl font-bold mb-2">Know who<br />is caring.</h3>
                <span className="text-[#C9A84C] text-sm font-medium">Learn more →</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-[#C9A84C]/10 border-t border-[#C9A84C]/30 px-8 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/80 text-sm leading-relaxed">
                  Make confident care decisions. Access verified caregiver profiles with real credentials, ratings, and placement history.
                </p>
              </div>
            </a>

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