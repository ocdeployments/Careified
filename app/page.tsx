'use client'

import Link from 'next/link'
import { UserCheck, Search, Shield } from 'lucide-react'
import CareifiedHero from '@/components/CareifiedHero'

export default function HomePage() {
  return (
    <div className="font-sans bg-[#F7F4F0]">

        {/* ── Hero (dark navy) ── */}
        <CareifiedHero />

        {/* AI Assistant CTA */}
        <div style={{ textAlign: 'center', padding: '8px 0 32px', background: '#F7F4F0' }}>
          <Link
            href="/demo/assistant"
            style={{
              color: '#C9973A',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '2px solid #C9973A',
              paddingBottom: '2px'
            }}
          >
            Try our AI assistant →
          </Link>
        </div>

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
                Caregivers. Agencies. Clients. An engine built to serve all three.
              </h2>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: '#64748B', margin: '0 auto', maxWidth: '480px', lineHeight: 1.6 }}>
                The caregiving industry runs on gut feel and incomplete information. Not anymore.
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

            {/* NEW: CSS Grid Engine Layout */}
            <div style={{ background: '#0D1B3E', borderRadius: '20px', padding: '40px 24px', marginBottom: '32px' }}>
              <style>{`
                @keyframes ring-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes eng-cw    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes eng-ccw   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
                .ring-wrap-c { position:absolute; inset:0; border-radius:50%; animation:ring-spin 4s linear infinite; }
                .ring-face-c { width:100%; height:100%; border-radius:50%;
                  background: conic-gradient(
                    from 0deg,
                    rgba(201,151,58,0.2)   0deg,
                    rgba(201,151,58,0.2)   180deg,
                    rgba(201,151,58,0.4)   220deg,
                    rgba(232,184,109,0.75) 250deg,
                    rgba(255,220,140,1.0)  268deg,
                    rgba(255,255,255,0.95) 275deg,
                    rgba(255,220,140,1.0)  282deg,
                    rgba(232,184,109,0.75) 310deg,
                    rgba(201,151,58,0.2)   360deg
                  );
                  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px), white 100%, transparent 0);
                  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px), white 100%, transparent 0);
                }
                .eng-svg-c { position:absolute; inset:0; width:100%; height:100%; }
                .eng-outer-c { transform-origin:170px 170px; animation:eng-cw 12s linear infinite; }
                .eng-inner-c { transform-origin:170px 170px; animation:eng-ccw 8s linear infinite; }
              `}</style>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 340px 1fr', gridTemplateRows:'auto 340px auto', gap:'16px', alignItems:'center', justifyItems:'center', maxWidth:'800px', margin:'0 auto' }}>

                {/* TOP — Caregiver */}
                <div style={{ gridColumn:2, gridRow:1, width:'100%', background:'rgba(201,151,58,0.1)', border:'1.5px solid rgba(201,151,58,0.5)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#E8B86D', marginBottom:'8px' }}>Caregiver</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'17px', color:'#fff', lineHeight:1.35, marginBottom:'4px' }}>Verified profile.</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'14px', color:'rgba(255,255,255,0.45)', lineHeight:1.35 }}>Ready to be found.</div>
                </div>

                {/* CENTRE */}
                <div style={{ gridColumn:2, gridRow:2, position:'relative', width:'340px', height:'340px' }}>
                  <div className="ring-wrap-c"><div className="ring-face-c"></div></div>
                  <svg className="eng-svg-c" viewBox="0 0 340 340">
                    <g className="eng-outer-c">
                      <circle cx="170" cy="170" r="82" fill="none" stroke="rgba(201,151,58,0.12)" strokeWidth="1" strokeDasharray="3 6"/>
                      <line x1="170" y1="88"  x2="170" y2="104" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="228" y1="101" x2="220" y2="115" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="252" y1="170" x2="236" y2="170" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="228" y1="239" x2="220" y2="225" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="170" y1="252" x2="170" y2="236" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="112" y1="239" x2="120" y2="225" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="88"  y1="170" x2="104" y2="170" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <line x1="112" y1="101" x2="120" y2="115" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      <circle cx="170" cy="88"  r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="228" cy="101" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="252" cy="170" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="228" cy="239" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="170" cy="252" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="112" cy="239" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="88"  cy="170" r="4" fill="#C9973A" opacity="0.85"/>
                      <circle cx="112" cy="101" r="4" fill="#C9973A" opacity="0.85"/>
                    </g>
                    <g className="eng-inner-c">
                      <circle cx="170" cy="170" r="60" fill="none" stroke="rgba(201,151,58,0.08)" strokeWidth="0.5" strokeDasharray="2 8"/>
                      <line x1="170" y1="110" x2="170" y2="124" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="212" y1="128" x2="204" y2="138" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="230" y1="170" x2="216" y2="170" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="212" y1="212" x2="204" y2="202" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="170" y1="230" x2="170" y2="216" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="128" y1="212" x2="136" y2="202" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="110" y1="170" x2="124" y2="170" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="128" y1="128" x2="136" y2="138" stroke="rgba(201,151,58,0.45)" strokeWidth="1" strokeLinecap="round"/>
                    </g>
                    <line x1="170" y1="122" x2="170" y2="88"  stroke="rgba(201,151,58,0.08)" strokeWidth="1" strokeDasharray="3 4"/>
                    <line x1="218" y1="170" x2="252" y2="170" stroke="rgba(201,151,58,0.08)" strokeWidth="1" strokeDasharray="3 4"/>
                    <line x1="170" y1="218" x2="170" y2="252" stroke="rgba(201,151,58,0.08)" strokeWidth="1" strokeDasharray="3 4"/>
                    <line x1="122" y1="170" x2="88"  y2="170" stroke="rgba(201,151,58,0.08)" strokeWidth="1" strokeDasharray="3 4"/>
                    <circle cx="170" cy="170" r="50" fill="#0D1B3E" stroke="rgba(201,151,58,0.5)" strokeWidth="1.5"/>
                    <text fontFamily="'DM Serif Display',Georgia,serif" fontSize="15" fill="#E8B86D" textAnchor="middle" x="170" y="164">Careified</text>
                    <text fontFamily="'DM Serif Display',Georgia,serif" fontSize="15" fill="#E8B86D" textAnchor="middle" x="170" y="182">Engine</text>
                  </svg>
                </div>

                {/* BOTTOM — Client */}
                <div style={{ gridColumn:2, gridRow:3, width:'100%', background:'rgba(180,83,9,0.3)', border:'1.5px solid rgba(217,119,6,0.5)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#FCD34D', marginBottom:'8px' }}>Client</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'17px', color:'#fff', lineHeight:1.35, marginBottom:'4px' }}>The right caregiver.</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'14px', color:'rgba(255,255,255,0.45)', lineHeight:1.35 }}>Every time.</div>
                </div>

                {/* LEFT — Agency Recruit */}
                <div style={{ gridColumn:1, gridRow:2, width:'100%', background:'rgba(30,58,138,0.5)', border:'1.5px solid rgba(37,99,235,0.5)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#93C5FD', marginBottom:'8px' }}>Agency — Recruit</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'17px', color:'#fff', lineHeight:1.35, marginBottom:'8px' }}>Find and build your bench.</div>
                  <div style={{ fontSize:'11px', color:'rgba(147,197,253,0.6)', lineHeight:1.4 }}>Profiles verified.</div>
                </div>

                {/* RIGHT — Agency Place */}
                <div style={{ gridColumn:3, gridRow:2, width:'100%', background:'rgba(30,58,138,0.5)', border:'1.5px solid rgba(37,99,235,0.5)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#93C5FD', marginBottom:'8px' }}>Agency — Place</div>
                  <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:'17px', color:'#fff', lineHeight:1.35, marginBottom:'8px' }}>Match bench to client need.</div>
                  <div style={{ fontSize:'11px', color:'rgba(147,197,253,0.6)', lineHeight:1.4 }}>Engine finds the fit.</div>
                </div>

              </div>

              <p style={{ textAlign:'center', fontFamily:'"DM Serif Display",serif', fontSize:'22px', color:'#E8B86D', marginTop:'24px' }}>
                Make informed decisions.
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
