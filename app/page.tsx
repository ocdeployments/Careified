'use client'

import Link from 'next/link'
import { UserCheck, Search, Shield } from 'lucide-react'
import CareifiedHero from '@/components/CareifiedHero'

export default function HomePage() {
  return (
    <div className="font-sans bg-[#F7F4F0]">

        {/* ── Hero (dark navy) ── */}
        <CareifiedHero />

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

            {/* Flywheel SVG */}
            <div style={{ background: '#0D1B3E', borderRadius: '20px', padding: '40px 24px', marginBottom: '32px' }}>
              <svg width="100%" viewBox="0 0 560 340" style={{ display: 'block', maxWidth: '560px', margin: '0 auto' }}>
                <defs>
                  <marker id="arr-fw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </marker>
                </defs>

                {/* Circular orbit ring */}
                <circle cx="280" cy="170" r="130" fill="none" stroke="rgba(201,151,58,0.2)" stroke-width="1" stroke-dasharray="8 5"/>

                {/* Curved clockwise arrows between nodes */}
                <path d="M 355 68 A 130 130 0 0 1 408 143" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-fw)" opacity="0.7"/>
                <path d="M 408 197 A 130 130 0 0 1 355 272" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-fw)" opacity="0.7"/>
                <path d="M 205 272 A 130 130 0 0 1 152 197" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-fw)" opacity="0.7"/>
                <path d="M 152 143 A 130 130 0 0 1 205 68" fill="none" stroke="#C9973A" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-fw)" opacity="0.7"/>

                {/* Node 1: Top — Caregiver Profile */}
                <rect x="180" y="22" width="200" height="48" rx="10" fill="rgba(201,151,58,0.15)" stroke="rgba(201,151,58,0.4)" stroke-width="1"/>
                <text font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="#E8B86D" text-anchor="middle" x="280" y="41" letter-spacing="0.08em">CAREGIVER PROFILE</text>
                <text font-family="'DM Sans',sans-serif" font-size="11" fill="rgba(255,255,255,0.55)" text-anchor="middle" x="280" y="58">Structured. Comparable. Portable.</text>

                {/* Node 2: Right — Client Intake */}
                <rect x="408" y="146" width="148" height="48" rx="10" fill="rgba(30,58,138,0.4)" stroke="rgba(37,99,235,0.4)" stroke-width="1"/>
                <text font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="#93C5FD" text-anchor="middle" x="482" y="165" letter-spacing="0.08em">CLIENT INTAKE</text>
                <text font-family="'DM Sans',sans-serif" font-size="11" fill="rgba(255,255,255,0.55)" text-anchor="middle" x="482" y="182">Needs + preferences</text>

                {/* Node 3: Bottom — Placement + Rating */}
                <rect x="180" y="282" width="200" height="48" rx="10" fill="rgba(180,83,9,0.25)" stroke="rgba(217,119,6,0.4)" stroke-width="1"/>
                <text font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="#FCD34D" text-anchor="middle" x="280" y="301" letter-spacing="0.08em">PLACEMENT + RATING</text>
                <text font-family="'DM Sans',sans-serif" font-size="11" fill="rgba(255,255,255,0.55)" text-anchor="middle" x="280" y="318">Agency decides. Score updates.</text>

                {/* Node 4: Left — Trust Score */}
                <rect x="4" y="146" width="148" height="48" rx="10" fill="rgba(201,151,58,0.12)" stroke="rgba(201,151,58,0.3)" stroke-width="1"/>
                <text font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="#E8B86D" text-anchor="middle" x="78" y="165" letter-spacing="0.08em">TRUST SCORE</text>
                <text font-family="'DM Sans',sans-serif" font-size="11" fill="rgba(255,255,255,0.55)" text-anchor="middle" x="78" y="182">Compounds over time</text>

                {/* Centre: Careified Engine */}
                <circle cx="280" cy="170" r="65" fill="#0D1B3E" stroke="rgba(201,151,58,0.35)" stroke-width="1.5"/>
                <text font-family="'DM Serif Display',Georgia,serif" font-size="14" fill="#E8B86D" text-anchor="middle" x="280" y="163">Careified</text>
                <text font-family="'DM Serif Display',Georgia,serif" font-size="14" fill="#E8B86D" text-anchor="middle" x="280" y="181">Engine</text>
                <text font-family="'DM Sans',sans-serif" font-size="10" fill="rgba(255,255,255,0.35)" text-anchor="middle" x="280" y="198">Criteria alignment</text>

                {/* Dashed spokes from centre to nodes */}
                <line x1="280" y1="105" x2="280" y2="70" stroke="rgba(201,151,58,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
                <line x1="344" y1="170" x2="408" y2="170" stroke="rgba(201,151,58,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
                <line x1="280" y1="235" x2="280" y2="282" stroke="rgba(201,151,58,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
                <line x1="216" y1="170" x2="156" y2="170" stroke="rgba(201,151,58,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
              </svg>

              <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: '20px' }}>
                ↻ Every placement improves the next match
              </p>
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
