'use client'
import { useState, useEffect } from 'react'

const N = '#0D1B3E'
const G = '#C9973A'
const S = 'system-ui, sans-serif'

const BUILT = [
  { cat: 'Auth', items: ['Clerk auth agency + caregiver', 'Role-locked signup', 'Agency approval flow', 'Admin console', 'Audit logging'] },
  { cat: 'Profile Builder', items: ['Step 0 consent + resume upload (LLM)', 'Step 1 Identity', 'Step 2 Services + diagnoses + ADLs', 'Step 3 Availability grid', 'Step 4 Location + travel radius + Leaflet map', 'Step 5 Credentials', 'Step 6 Compliance + red flags', 'Step 7 Personality (7 scenarios)', 'Step 8 Work history', 'Step 9 References + verification invites', 'Step 10 Open questions', 'ProfileFormContext + useProfileSave (3-layer)', 'LiveProfilePreview ghost-to-live'] },
  { cat: 'Profile Page', items: ['Agency-facing scorecard design', 'Verification tier framework (Tier 1-4)', 'Hiring scorecard (5 dimensions)', 'Verified reference badges', 'Red flag disclosure', 'Working style (behavioural)', 'Non-recommender disclaimer', '/profile/demo with Maria Santos'] },
  { cat: 'Search & Match', items: ['20+ filter parameters', '15 demo caregivers', 'Match ranking API', 'Alignment score + confidence weighting', 'Browse mode (show all)', 'Shortlist'] },
  { cat: 'Client Intake', items: ['Client list /agency/clients', 'Intake form (8 sections)', 'Client detail + ranked matches', 'Gap analysis engine (verify-in-call)', '5 demo clients seeded'] },
  { cat: 'Consent System', items: ['6 consent types', '/settings/communications', 'Consent gate in builder', 'AIRecruit consent gate'] },
  { cat: 'Reference Verification', items: ['Invite API + token URLs', 'Public reference form /reference/[token]', 'Verified badges on profile'] },
  { cat: 'AIRecruit', items: ['Phases 1-6 complete', 'Vapi integration + webhook', 'Scoring via OpenRouter', 'TCPA/CRTC compliance', 'Campaign UI + dashboard'] },
  { cat: 'ID System', items: ['Format CRF-[COUNTRY]-[STATE]-[YEAR]-[5CHAR]', '/id/[caregiverId] + /verify/[slug]', 'Apple Wallet structure', 'Google Wallet JWT'] },
  { cat: 'Demo Environment', items: ['/demo landing page', '/demo/dashboard', '/demo/search', '/demo/clients list', '/demo/clients/[id] detail', 'Demo banner + navigation', 'Try Demo link in navbar'] },
  { cat: 'Navigation', items: ['3-panel dropdown navbar', 'Footer with Privacy/Terms/Contact', 'My clients + Profile demo links', 'Try Demo link'] },
]

const PENDING = [
  // Security - Critical
  { priority: 'CRITICAL', label: 'Webhook no signature verification', desc: 'AIRecruit webhook accepts fake data - add HMAC' },
  { priority: 'CRITICAL', label: 'SQL injection risk lib/db.ts', desc: 'Column names not validated - validate against allowlist' },
  // Security - High
  { priority: 'HIGH', label: 'Reference tokens not UUID', desc: 'Sequential tokens predictable - use gen_random_uuid()' },
  { priority: 'HIGH', label: 'No rate limiting', desc: 'APIs vulnerable to abuse - add rate limiting' },
  { priority: 'HIGH', label: 'XSS in admin/caregivers', desc: 'dangerouslySetInnerHTML line 217 - remove' },
  { priority: 'HIGH', label: 'SSL cert for Render DB', desc: 'Currently rejectUnauthorized: false' },
  { priority: 'HIGH', label: 'Lawyer review lib/legal/text.ts', desc: 'All consent text needs legal review' },
  // Pre-Launch
  { priority: 'HIGH', label: 'Copy session', desc: 'ALL page text is placeholder' },
  { priority: 'HIGH', label: 'Clerk production upgrade', desc: 'Switch pk_test_ to pk_live_ — dev banner showing' },
  // Features - Pending
  { priority: 'MED', label: 'AIRecruit Session B', desc: 'Consent flow for all agent types' },
  { priority: 'MED', label: 'AIRecruit Session C', desc: 'Profile analysis + reference agent' },
  { priority: 'MED', label: 'AIRecruit Session D', desc: 'SMS, retry logic, cron, bulk actions' },
  { priority: 'MED', label: 'Rating system', desc: 'NOT BUILT - rating form post-placement' },
  { priority: 'MED', label: 'Family portal Phase 1', desc: '8 features, PWA' },
  { priority: 'LOW', label: 'US Vercel deployment', desc: 'Second project NEXT_PUBLIC_LOCALE=US' },
  { priority: 'LOW', label: 'Apple Developer account', desc: '$99/yr for Wallet passes' },
  { priority: 'LOW', label: 'Phone OTP via Clerk', desc: '' },
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

const SECURITY = {
  lastAudit: 'May 6 2026',
  criticalIssues: 2,
  highIssues: 4,
  mediumIssues: 1,
  brokenLinks: 0,
  status: 'FAIL',
  currentPriority: 'Fix XSS in admin/caregivers page',
}

type LiveData = {
  db: { caregivers: number; agencies: number; clients: number; verifiedRefs: number; tables: string[] }
  env: { key: string; set: boolean; isProd: boolean | null }[]
  git: { commit: string; message: string; branch: string }
  timestamp: string
}

type QAData = {
  report: {
    id: number
    audit_date: string
    audit_by: string
    total_passing: number
    total_failing: number
    total_warnings: number
    issues: any[]
  }
  history: any[]
}

export default function StatusPage() {
  const [tab, setTab] = useState<'pending'|'built'|'vapi'|'live'|'security'|'audit'|'qa'>('pending')
  const [live, setLive] = useState<LiveData | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [qaData, setQaData] = useState<QAData | null>(null)
  const [qaLoading, setQaLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ critical: true, high: true })

  useEffect(() => {
    setLiveLoading(true)
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(d => { setLive(d); setLiveLoading(false) })
      .catch(() => setLiveLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'qa') {
      setQaLoading(true)
      fetch('/api/qa/report')
        .then(r => r.json())
        .then(d => { setQaData(d); setQaLoading(false) })
        .catch(() => setQaLoading(false))
    }
  }, [tab])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const markFixed = async (issueId: number) => {
    await fetch('/api/qa/report', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_id: issueId, status: 'fixed' }),
    })
    // Refresh QA data
    fetch('/api/qa/report')
      .then(r => r.json())
      .then(d => setQaData(d))
  }

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'built', label: 'Built & Live' },
    { id: 'security', label: 'Security Audit' },
    { id: 'audit', label: 'Architecture Audit' },
    { id: 'qa', label: 'QA Report' },
    { id: 'vapi', label: 'AIRecruit Agents' },
    { id: 'live', label: 'Live Data' },
  ] as const

  // Architecture Audit - May 6 2026
  const ORPHAN_PAGES = [
    { path: '/agency/pending-approval', risk: 'LOW', reason: 'Redirect-only (expected)' },
    { path: '/agency/sitemap', risk: 'LOW', reason: 'Internal tool' },
    { path: '/admin/status', risk: 'LOW', reason: 'Linked from admin/agencies' },
    { path: '/admin/sitemap', risk: 'LOW', reason: 'Internal tool' },
    { path: '/id/[caregiverId]', risk: 'LOW', reason: 'Wallet/QR link only - intentional' },
    { path: '/verify/[slug]', risk: 'LOW', reason: 'External verification link - intentional' },
  ]

  const PUBLIC_UNLINKED = [
    { path: '/for-agencies', reason: 'In navbar dropdown (fixed May 5)' },
    { path: '/for-caregivers', reason: 'In navbar dropdown (fixed May 5)' },
    { path: '/for-families', reason: 'In navbar dropdown (fixed May 5)' },
    { path: '/opportunities', reason: 'Navbar dropdown (fixed May 5)' },
  ]

  const pc = (p: string) =>
    p === 'CRITICAL' ? { bg: '#7F1D1D', color: '#FFFFFF', border: '#991B1B' } :
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

        {tab === 'audit' && (
          <div>
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0369A1', marginBottom: 4 }}>Architecture Audit — May 6 2026</div>
              <div style={{ fontSize: 13, color: '#0C4A6E' }}>Total pages: 53 | Orphan pages: {ORPHAN_PAGES.length} | Public unlinked: {PUBLIC_UNLINKED.length}</div>
              <div style={{ fontSize: 12, color: '#0369A1', marginTop: 8 }}>Auth: proxy.ts protects /admin/* and /agency/* routes</div>
            </div>

            {/* Orphan Pages */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: N, marginBottom: 12 }}>Orphan Pages (No Navigation Link)</h3>
              {ORPHAN_PAGES.map((p, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: 13, color: N, fontWeight: 600 }}>{p.path}</code>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: p.risk === 'HIGH' ? '#FEF2F2' : p.risk === 'MEDIUM' ? '#FFFBEB' : '#F8FAFC', color: p.risk === 'HIGH' ? '#DC2626' : p.risk === 'MEDIUM' ? '#D97706' : '#64748B' }}>{p.risk}</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{p.reason}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Public Unlinked */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: N, marginBottom: 12 }}>Public Pages Without Nav Links</h3>
              {PUBLIC_UNLINKED.map((p, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <code style={{ fontSize: 13, color: N }}>{p.path}</code>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{p.reason}</span>
                </div>
              ))}
            </div>

            {/* Fixes Applied */}
            <div style={{ marginTop: 20, padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 8 }}>Fixes Applied</div>
              <ul style={{ fontSize: 13, color: '#166534', margin: 0, paddingLeft: 20 }}>
                <li>Added /admin/badges, /admin/reviews, /admin/references to admin dashboard quick links</li>
                <li>Added /agency/settings, /agency/billing to agency dashboard quick actions</li>
                <li>Shortlist was already linked (confirmed)</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'qa' && (
          <div>
            {qaLoading && <p style={{ color: '#64748B' }}>Loading QA data...</p>}
            {qaData && (
              <>
                {/* Header */}
                <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Last Audit</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: N }}>{new Date(qaData.report.audit_date).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>By: {qaData.report.audit_by}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ background: '#F0FDF4', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>{qaData.report.total_passing}</div>
                        <div style={{ fontSize: 11, color: '#16A34A' }}>Passing</div>
                      </div>
                      <div style={{ background: '#FEF2F2', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>{qaData.report.total_failing}</div>
                        <div style={{ fontSize: 11, color: '#DC2626' }}>Failing</div>
                      </div>
                      <div style={{ background: '#FFFBEB', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#D97706' }}>{qaData.report.total_warnings}</div>
                        <div style={{ fontSize: 11, color: '#D97706' }}>Warnings</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group issues by severity */}
                {['critical', 'high', 'medium', 'warning', 'passing'].map(severity => {
                  const issues = qaData.report.issues.filter((i: any) => i.severity === severity)
                  if (issues.length === 0) return null
                  const isOpen = severity !== 'passing'
                  const borderColor = severity === 'critical' ? '#DC2626' : severity === 'high' ? '#F97316' : severity === 'medium' ? '#D97706' : severity === 'warning' ? '#64748B' : '#16A34A'
                  return (
                    <div key={severity} style={{ marginBottom: 16 }}>
                      <button
                        onClick={() => toggleSection(severity)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          background: 'white',
                          border: `2px solid ${borderColor}`,
                          borderRadius: 12,
                          cursor: 'pointer',
                          marginBottom: expandedSections[severity] !== false ? 8 : 0,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700, color: borderColor, textTransform: 'uppercase' }}>
                          {severity} ({issues.length})
                        </span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{expandedSections[severity] !== false ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections[severity] !== false && issues.map((issue: any) => (
                        <div key={issue.id} style={{
                          background: 'white',
                          border: `1px solid #E2E8F0`,
                          borderLeft: `4px solid ${borderColor}`,
                          borderRadius: 8,
                          padding: '12px 16px',
                          marginBottom: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, color: N, fontWeight: 500 }}>{issue.description}</div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{issue.page_affected} · {issue.category}</div>
                          </div>
                          {issue.status === 'open' && isOpen && (
                            <button
                              onClick={() => markFixed(issue.id)}
                              style={{
                                padding: '6px 12px',
                                fontSize: 11,
                                fontWeight: 600,
                                background: '#F0FDF4',
                                color: '#16A34A',
                                border: '1px solid #BBF7D0',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Mark Fixed
                            </button>
                          )}
                          {issue.status === 'fixed' && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '4px 8px', borderRadius: 4 }}>
                              Fixed
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}

                {/* History */}
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: N, marginBottom: 12 }}>History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {qaData.history.map((h, i) => (
                      <div key={h.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{new Date(h.audit_date).toLocaleDateString()}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>By: {h.audit_by}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                          <span style={{ color: '#16A34A' }}>+{h.total_passing}</span>
                          <span style={{ color: '#DC2626' }}>-{h.total_failing}</span>
                          <span style={{ color: '#D97706' }}>~{h.total_warnings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'security' && (
          <div>
            {/* Security Status Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Last Audit</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: N }}>{SECURITY.lastAudit}</div>
              </div>
              <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '16px 20px', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 11, color: '#DC2626', marginBottom: 4 }}>Critical</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{SECURITY.criticalIssues}</div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '16px 20px', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 11, color: '#D97706', marginBottom: 4 }}>High</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>{SECURITY.highIssues}</div>
              </div>
              <div style={{ background: SECURITY.status === 'PASS' ? '#F0FDF4' : '#FEF2F2', borderRadius: 12, padding: '16px 20px', border: `1px solid ${SECURITY.status === 'PASS' ? '#BBF7D0' : '#FECACA'}` }}>
                <div style={{ fontSize: 11, color: SECURITY.status === 'PASS' ? '#16A34A' : '#DC2626', marginBottom: 4 }}>Security Status</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: SECURITY.status === 'PASS' ? '#16A34A' : '#DC2626' }}>{SECURITY.status}</div>
              </div>
            </div>

            {/* Current Priority */}
            <div style={{ background: '#7F1D1D', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: 'white' }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>CURRENT PRIORITY ACTION</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{SECURITY.currentPriority}</div>
            </div>

            {/* Critical Issues */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>Critical Issues (2)</h3>
              {[
                { label: 'No webhook signature verification', file: 'app/api/airecruit/webhook/route.ts' },
                { label: 'SQL injection risk in lib/db.ts', file: 'lib/db.ts lines 56-68' },
              ].map((issue, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: N }}>{issue.label}</span>
                  <code style={{ fontSize: 11, color: '#64748B' }}>{issue.file}</code>
                </div>
              ))}
            </div>

            {/* High Issues */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#D97706', marginBottom: 12 }}>High Priority (4)</h3>
              {[
                { label: 'Reference tokens not UUID', file: 'app/api/references/invite' },
                { label: 'No rate limiting', file: 'All API routes' },
                { label: 'XSS: dangerouslySetInnerHTML', file: 'app/admin/caregivers/page.tsx:217' },
                { label: 'SSL cert for Render DB', file: 'lib/db.ts rejectUnauthorized: false' },
              ].map((issue, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: N }}>{issue.label}</span>
                  <code style={{ fontSize: 11, color: '#64748B' }}>{issue.file}</code>
                </div>
              ))}
            </div>

            {/* FIXED - Admin Auth */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 12 }}>Fixed Issues</h3>
              {[
                { label: 'Admin pages unprotected', file: 'FIXED May 6 2026 - proxy.ts has ADMIN_CLERK_USER_ID check', reason: 'proxy.ts (/api/auth/protect) now enforces admin access' },
                { label: 'middleware.ts missing', file: 'FIXED May 6 2026', reason: 'Renamed to proxy.ts with full auth' },
                { label: 'zod version conflict', file: 'FIXED May 6 2026', reason: 'Upgraded to zod 3.25+' },
                { label: 'Broken link: /settings', file: 'FIXED', reason: 'Redirects to /settings/communications' },
                { label: 'Broken link: /agency/support', file: 'FIXED', reason: 'Support page exists' },
                { label: 'Broken link: /profile/start', file: 'FIXED', reason: 'Changed to /profile/build' },
              ].map((issue, i) => (
                <div key={i} style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px 14px', marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>{issue.label}</span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{issue.file} — {issue.reason}</span>
                </div>
              ))}
            </div>
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
