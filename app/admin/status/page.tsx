'use client'
import { useState, useEffect } from 'react'

const N = '#0D1B3E'
const G = '#C9973A'
const S = 'system-ui, sans-serif'

const BUILT = [
  { cat: 'Auth', items: ['Clerk auth agency + caregiver', 'Role-locked signup', 'Agency approval flow', 'Admin console', 'Audit logging'] },
  { cat: 'Profile Builder', items: ['Step 0 consent + resume upload (LLM)', 'Step 1 Identity', 'Step 2 Services + diagnoses + ADLs', 'Step 3 Availability grid', 'Step 4 Location + travel radius', 'Step 5 Credentials', 'Step 6 Compliance + red flags', 'Step 7 Personality (7 scenarios)', 'Step 8 Work history', 'Step 9 References + verification invites', 'Step 10 Open questions', 'ProfileFormContext + useProfileSave (3-layer)'] },
  { cat: 'Profile Page', items: ['Agency-facing scorecard design', 'Verification tier framework (Tier 1-4)', 'Hiring scorecard (5 dimensions)', 'Verified reference badges', 'Red flag disclosure', 'Working style (behavioural)', 'Non-recommender disclaimer', '/profile/demo with Maria Santos'] },
  { cat: 'Search & Match', items: ['20+ filter parameters', '15 demo caregivers', 'Match ranking API', 'Alignment score + confidence weighting', 'Browse mode (show all)', 'Shortlist'] },
  { cat: 'Client Intake', items: ['Client list /agency/clients', 'Intake form (8 sections)', 'Client detail + ranked matches', 'Gap analysis engine (verify-in-call)', '5 demo clients seeded'] },
  { cat: 'Consent System', items: ['6 consent types', '/settings/communications', 'Consent gate in builder', 'AIRecruit consent gate'] },
  { cat: 'Reference Verification', items: ['Invite API + token URLs', 'Public reference form /reference/[token]', 'Verified badges on profile'] },
  { cat: 'AIRecruit', items: ['Phases 1-6 complete', 'Vapi integration + webhook', 'Scoring via OpenRouter', 'TCPA/CRTC compliance', 'Campaign UI + dashboard'] },
  { cat: 'ID System', items: ['Format CRF-[COUNTRY]-[STATE]-[YEAR]-[5CHAR]', '/id/[caregiverId] + /verify/[slug]', 'Apple Wallet structure', 'Google Wallet JWT'] },
  { cat: 'Navigation', items: ['3-panel dropdown navbar', 'Footer with Privacy/Terms/Contact', 'My clients + Profile demo links'] },
]

const PENDING = [
  { priority: 'HIGH', label: 'Clerk production upgrade', desc: 'Switch pk_test_ to pk_live_ — dev banner showing' },
  { priority: 'HIGH', label: 'Copy session', desc: 'ALL page text is placeholder' },
  { priority: 'HIGH', label: 'UX debt — agency signup', desc: 'Silent failures on invalid fields' },
  { priority: 'HIGH', label: 'SSL cert for Render DB', desc: 'Currently rejectUnauthorized: false' },
  { priority: 'HIGH', label: 'Lawyer review lib/legal/text.ts', desc: 'All consent text needs legal review' },
  { priority: 'MED', label: 'LiveProfilePreview', desc: 'Ghost to live animation in builder' },
  { priority: 'MED', label: 'AIRecruit Session B', desc: 'Consent flow for all agent types' },
  { priority: 'MED', label: 'AIRecruit Session C', desc: 'Profile analysis + reference agent' },
  { priority: 'MED', label: 'AIRecruit Session D', desc: 'SMS, retry logic, cron, bulk actions' },
  { priority: 'MED', label: 'Rating system', desc: 'Post-placement ratings, trust score' },
  { priority: 'MED', label: 'Family portal Phase 1', desc: '8 features, PWA' },
  { priority: 'LOW', label: 'US Vercel deployment', desc: 'Second project NEXT_PUBLIC_LOCALE=US' },
  { priority: 'LOW', label: 'Apple Developer account', desc: '$99/yr for Wallet passes' },
  { priority: 'LOW', label: 'Phone OTP via Clerk', desc: '' },
  { priority: 'LOW', label: 'Map for travel radius', desc: 'Leaflet in Step 4' },
  { priority: 'LOW', label: 'E&O / Cyber / Liability insurance', desc: 'Required before real users' },
]

const VAPI = [
  { type: 'recruit_calls', label: 'Candidate screening', status: 'LIVE', note: 'Phases 1-6 complete' },
  { type: 'reference_calls', label: 'Reference calls', status: 'PENDING', note: 'Session B' },
  { type: 'past_employer_calls', label: 'Past employer calls', status: 'PENDING', note: 'Session C' },
  { type: 'current_employer_calls', label: 'Current employer calls', status: 'DROPPED', note: 'Too high legal risk' },
  { type: 'regulatory_calls', label: 'Regulatory calls', status: 'PENDING', note: 'Session D' },
  { type: 'match_time_calls', label: 'Match opportunity calls', status: 'PENDING', note: 'Session D' },
]

type LiveData = {
  db: { caregivers: number; agencies: number; clients: number; verifiedRefs: number; tables: string[] }
  env: { key: string; set: boolean; isProd: boolean | null }[]
  git: { commit: string; message: string; branch: string }
  timestamp: string
}

export default function StatusPage() {
  const [tab, setTab] = useState<'pending'|'built'|'vapi'|'live'>('pending')
  const [live, setLive] = useState<LiveData | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)

  useEffect(() => {
    setLiveLoading(true)
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(d => { setLive(d); setLiveLoading(false) })
      .catch(() => setLiveLoading(false))
  }, [])

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'built', label: 'Built & Live' },
    { id: 'vapi', label: 'AIRecruit Agents' },
    { id: 'live', label: 'Live Data' },
  ] as const

  const pc = (p: string) =>
    p === 'HIGH' ? { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' } :
    p === 'MED'  ? { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' } :
                   { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' }

  const sc = (s: string) =>
    s === 'LIVE' ? '#16A34A' : s === 'DROPPED' ? '#DC2626' : '#D97706'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: N, margin: '0 0 4px' }}>Careified Build Status</h1>
          {live && (
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              Commit <code style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>{live.git.commit}</code>
              {live.git.message && <> · {live.git.message}</>}
              {' · '}{new Date(live.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Live stats */}
        {live && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Approved caregivers', value: live.db.caregivers },
              { label: 'Agencies', value: live.db.agencies },
              { label: 'Clients', value: live.db.clients },
              { label: 'Verified references', value: live.db.verifiedRefs },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: N }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: tab === t.id ? N : 'white',
              color: tab === t.id ? 'white' : '#64748B',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PENDING.map((p, i) => {
              const c = pc(p.priority)
              return (
                <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: c.bg, color: c.color, border: `1px solid ${c.border}`, flexShrink: 0, marginTop: 2, height: 'fit-content' }}>{p.priority}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: N }}>{p.label}</div>
                    {p.desc && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{p.desc}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'built' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {BUILT.map(cat => (
              <div key={cat.cat} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 12 }}>{cat.cat}</div>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                    <span style={{ color: '#16A34A', flexShrink: 0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'vapi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: '#FDF6EC', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#92400E', marginBottom: 8 }}>
              Vapi assistant: fdd84833-80ef-4c50-8391-2d7b38e56ead · Each use case = separate assistant · All gated by consent
            </div>
            {VAPI.map((v, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: N }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{v.type} · {v.note}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, color: sc(v.status), background: v.status === 'LIVE' ? '#F0FDF4' : v.status === 'DROPPED' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${v.status === 'LIVE' ? '#BBF7D0' : v.status === 'DROPPED' ? '#FECACA' : '#FDE68A'}` }}>{v.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'live' && (
          <div>
            {liveLoading && <p style={{ color: '#64748B' }}>Loading live data...</p>}
            {live && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 12 }}>DB Tables ({live.db.tables.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {live.db.tables.map(t => (
                      <span key={t} style={{ fontSize: 11, fontFamily: 'monospace', padding: '3px 8px', background: '#F1F5F9', borderRadius: 6, color: N }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 12 }}>Environment Variables</div>
                  {live.env.map(e => (
                    <div key={e.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <code style={{ fontSize: 12, color: N }}>{e.key}</code>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {e.isProd === false && <span style={{ fontSize: 10, color: '#D97706', fontWeight: 700 }}>DEV KEYS</span>}
                        {e.isProd === true && <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 700 }}>PROD KEYS</span>}
                        <span style={{ fontSize: 11, fontWeight: 700, color: e.set ? '#16A34A' : '#DC2626' }}>{e.set ? 'SET' : 'MISSING'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
