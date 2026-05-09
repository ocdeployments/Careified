'use client'

import Link from 'next/link'
import { UserCheck, Search, Shield } from 'lucide-react'
import CareifiedHero from '@/components/CareifiedHero'

export default function HomePage() {
  return (
    <div className="font-sans bg-[#F7F4F0]">

        {/* ── Hero (dark navy) ── */}
        <CareifiedHero />

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

        {/* ── The Careified Engine (warm white) ── */}
        <section
          style={{ background: '#F7F4F0', padding: '80px 24px' }}
          aria-label="The Careified Engine"
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', color: '#C9973A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                How it works
              </div>
              <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '32px', color: '#0D1B3E', marginBottom: '16px', lineHeight: 1.2 }}>
                Three actors. One engine. A flywheel that compounds.
              </h2>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: '#64748B', margin: '0 auto', maxWidth: '480px', lineHeight: 1.6 }}>
                Every profile built, every placement made, every rating submitted makes the next match more accurate.
              </p>
            </div>

            {/* Three actor cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {/* Caregiver card */}
              <div style={{ background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.25)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '16px', color: '#C9973A', marginBottom: '12px' }}>Caregiver</div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  Builds a structured profile once. Credentials, availability, behavioural responses — all to the same standard.
                </p>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#C9973A' }}>
                  Reputation compounds. Never starts over.
                </div>
              </div>

              {/* Agency card */}
              <div style={{ background: 'rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.2)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '16px', color: '#1E3A8A', marginBottom: '12px' }}>Agency</div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  Enters client needs. Reviews aligned profiles. Makes all placement decisions.
                </p>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1E3A8A' }}>
                  Data-organised shortlists. No resume chaos.
                </div>
              </div>

              {/* Client card */}
              <div style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '16px', color: '#B45309', marginBottom: '12px' }}>Client</div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  Care needs, schedule, and preferences entered by the agency. Matched to the right caregiver — not just whoever's available.
                </p>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#B45309' }}>
                  Profile-driven match. Not a hunch.
                </div>
              </div>
            </div>

            {/* Flywheel visual */}
            <div style={{ background: '#0D1B3E', borderRadius: '20px', padding: '32px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Node 1: Caregiver profile */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201,151,58,0.15)', border: '2px solid #C9973A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ color: '#C9973A', fontSize: '11px' }}>01</span>
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#C9973A', fontWeight: 500 }}>Caregiver profile</div>
                </div>

                <div style={{ color: '#C9973A', fontSize: '18px', flexShrink: 0 }}>→</div>

                {/* Node 2: Client intake */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(30,58,138,0.15)', border: '2px solid #1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ color: '#1E3A8A', fontSize: '11px' }}>02</span>
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#1E3A8A', fontWeight: 500 }}>Client intake</div>
                </div>

                <div style={{ color: '#C9973A', fontSize: '18px', flexShrink: 0 }}>→</div>

                {/* Node 3: Careified Engine (center, larger) */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: '0 4px 20px rgba(201,151,58,0.4)' }}>
                    <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: '11px', color: '#0D1B3E', fontWeight: 'bold' }}>AI</span>
                  </div>
                  <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: '14px', color: '#C9973A', fontWeight: 'bold' }}>Careified Engine</div>
                </div>

                <div style={{ color: '#C9973A', fontSize: '18px', flexShrink: 0 }}>→</div>

                {/* Node 4: Placement + rating */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,83,9,0.15)', border: '2px solid #B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ color: '#B45309', fontSize: '11px' }}>04</span>
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#B45309', fontWeight: 500 }}>Placement + rating</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
                ↻ Every placement improves the next match
              </div>
            </div>

            {/* Compounding row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>1</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D1B3E', whiteSpace: 'nowrap' }}>More profiles</div>
                </div>
              </div>
              <div style={{ color: '#C9973A', fontSize: '14px' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>2</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D1B3E', whiteSpace: 'nowrap' }}>Better matches</div>
                </div>
              </div>
              <div style={{ color: '#C9973A', fontSize: '14px' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>3</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D1B3E', whiteSpace: 'nowrap' }}>More placements</div>
                </div>
              </div>
              <div style={{ color: '#C9973A', fontSize: '14px' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>4</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D1B3E', whiteSpace: 'nowrap' }}>Scores compound</div>
                </div>
              </div>
              <div style={{ color: '#C9973A', fontSize: '14px' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>∞</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D1B3E', whiteSpace: 'nowrap' }}>Accuracy</div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', maxWidth: '600px', margin: '24px auto 0', lineHeight: 1.5 }}>
              Careified organises and presents information submitted by caregivers and collected from third parties. All placement decisions rest with the agency. Careified does not certify, verify, or recommend any individual.
            </p>
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
