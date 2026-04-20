'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserCheck, Search, Shield } from 'lucide-react'
import IntroAnimation from '@/components/IntroAnimation'

export default function HomePage() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      {/* Intro animation — fixed overlay, z-index 100 */}
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      {/* Landing page — pre-renders beneath intro, fades in on complete */}
      <div
        style={{
          opacity: introComplete ? 1 : 0,
          pointerEvents: introComplete ? 'auto' : 'none',
          transition: introComplete ? 'opacity 0.8s ease' : 'none',
        }}
        className="font-sans bg-[#F7F4F0]"
      >

        {/* ── Hero (dark navy) ── */}
        <section className="relative bg-[#0D1B3E] pt-20 pb-[72px] px-6 overflow-hidden">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(rgba(201,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative max-w-[960px] mx-auto z-[2]">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-[14px] py-[5px] mb-7"
              style={{ background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#C9973A]">
                Caregiving&apos;s trust layer
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[58px] leading-[1.0] tracking-tight text-white mb-1.5">
              Verified reputations.
            </h1>
            <h1 className="font-serif text-[58px] leading-[1.0] tracking-tight text-[#C9973A] italic mb-6">
              Built on real work.
            </h1>

            {/* Subtext */}
            <p className="text-[15px] text-white/70 leading-[1.7] max-w-[480px] mb-12 font-light">
              The platform where caregivers earn credibility and agencies hire with confidence.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[700px]">
              {/* Agencies */}
              <div
                className="relative p-5 rounded-[14px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800 to-blue-500" />
                <div className="text-[13px] font-semibold text-white mb-1">For Agencies</div>
                <div className="text-[11px] text-white/70 leading-[1.5] mb-3.5">Search verified profiles.</div>
                <Link href="/sign-up?role=agency" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Start hiring →
                </Link>
              </div>

              {/* Caregivers */}
              <div
                className="relative p-5 rounded-[14px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C9973A] to-[#E8B86D]" />
                <div className="text-[13px] font-semibold text-white mb-1">For Caregivers</div>
                <div className="text-[11px] text-white/70 leading-[1.5] mb-3.5">Free. Always. Build once.</div>
                <Link href="/sign-up?role=caregiver" className="text-[11px] font-bold text-[#C9973A] hover:text-[#E8B86D] transition-colors">
                  Build free profile →
                </Link>
              </div>

              {/* Families */}
              <div
                className="relative p-5 rounded-[14px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-700 to-amber-500" />
                <div className="text-[13px] font-semibold text-white mb-1">For Families</div>
                <div className="text-[11px] text-white/70 leading-[1.5] mb-3.5">Know who is caring.</div>
                <Link href="/for-families" className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
                  Learn more →
                </Link>
              </div>
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
                I&apos;m an agency
              </Link>
              <Link
                href="/sign-up?role=caregiver"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-all focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
              >
                I&apos;m a caregiver — it&apos;s free
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
    </>
  )
}
