'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PAGE_BG = '#080F1E'
const NAV_BG = '#0D1B3E'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BG_HOVER = 'rgba(255,255,255,0.07)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const CARD_BORDER_GOLD = 'rgba(201,151,58,0.35)'
const G = '#C9973A'
const GL = '#E8B86D'
const GLX = 'rgba(201,151,58,0.15)'
const W = '#F5F0E8'
const M = 'rgba(255,255,255,0.55)'
const MT = 'rgba(255,255,255,0.3)'
const R = '#E24B4A'
const AM = '#F59E0B'
const GR = '#22C55E'
const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'DM Sans', sans-serif"

type DashboardData = {
  stats: {
    roster_total: number
    roster_claimed: number
    roster_pending: number
    shortlist_total: number
    clients_total: number
    clients_unmatched: number
    airecruit_active: number
    agency_name?: string
    plan_tier?: string
    subscription_status?: string
    profile_completion?: number
    trial_ends_at?: string
  }
  action_items: { priority: string; title: string; cta_href: string }[]
  pipeline: { discovered: number; contacted: number; interviewing: number; placed: number; inactive: number } | null
  recent_activity: { action: string; timestamp: string; detail?: string }[]
  top_matches: { id: string; first_name: string; last_name: string; aggregate_score: number | null; photo_url: string | null; role: string | null }[]
  expiring_credentials: { caregiver_id: string; caregiver_name: string; certification: string; expiry_date: string }[]
  unmatched_clients?: { id: string; first_name: string; care_level: string }[]
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCondition(condition: string): string {
  return condition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function AgencyDashboard() {
  const router = useRouter()
  const { userId } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'today'|'command'|'week'>('today')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_mode')
    if (saved === 'today' || saved === 'command' || saved === 'week') {
      setMode(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboard_mode', mode)
  }, [mode])

  useEffect(() => {
    if (!userId) return

    fetch('/api/agency/dashboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(dash => {
        setDashboardData(dash)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  if (!userId) return null

  const stats = dashboardData?.stats
  const pipeline = dashboardData?.pipeline
  const unmatchedClients = dashboardData?.unmatched_clients || []

  const planBadge = stats?.plan_tier ? `${stats.plan_tier} · ${stats.subscription_status || 'Active'}` : 'Growth · Trial'
  const profilePct = stats?.profile_completion || 0

  const alerts: { type: string; count: number; accent: string; icon: string; text: string; href: string }[] = []

  if (stats?.clients_unmatched && stats.clients_unmatched > 0) {
    alerts.push({ type: 'unmatched_clients', count: stats.clients_unmatched, accent: AM, icon: '⚠', text: `${stats.clients_unmatched} clients need coverage`, href: '/agency/clients?tab=unmatched' })
  }

  if (stats?.airecruit_active && stats.airecruit_active > 0) {
    alerts.push({ type: 'airecruit_results', count: stats.airecruit_active, accent: G, icon: '📋', text: `${stats.airecruit_active} AIRecruit results ready`, href: '/agency/airecruit' })
  }

  if (dashboardData?.expiring_credentials && dashboardData.expiring_credentials.length > 0) {
    const soonestExpiry = dashboardData.expiring_credentials[0]?.expiry_date
    const daysUntilExpiry = soonestExpiry ? Math.ceil((new Date(soonestExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 99
    const credentialAccent = daysUntilExpiry <= 7 ? R : AM
    alerts.push({ type: 'expiring_credentials', count: dashboardData.expiring_credentials.length, accent: credentialAccent, icon: '⏰', text: `${dashboardData.expiring_credentials.length} credentials expiring soon`, href: '/agency/roster?tab=credentials' })
  }

  const showAllClear = alerts.length === 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: SANS, lineHeight: 1.65 }}>
      <style>{`
        @media (max-width: 1024px) {
          .dash-cols { grid-template-columns: 1fr 1fr !important; }
          .dash-ai-col { display: none !important; }
          .dash-cmd-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .dash-cols { grid-template-columns: 1fr !important; }
          .dash-bottom { grid-template-columns: 1fr !important; }
          .dash-status-stats { display: none !important; }
          .dash-status-bar { flex-wrap: wrap !important; gap: 8px !important; padding: 10px 16px !important; }
          .dash-alert-strip { padding: 10px 16px !important; }
          .dash-cols { padding: 16px !important; }
          .dash-bottom { padding: 0 16px 16px !important; }
          .dash-mode-toggle { padding: 10px 16px !important; }
          .dash-cmd-grid { grid-template-columns: 1fr !important; padding: 16px !important; }
          .dash-greeting { padding: 0 16px 10px !important; }
        }
        @media (max-width: 480px) {
          .dash-profile-pct { display: none !important; }
          .dash-mode-toggle button { font-size: 11px !important; padding: 6px 10px !important; }
        }
      `}</style>

      {/* ZONE 1: STATUS BAR */}
      <div className="dash-status-bar" style={{ background: NAV_BG, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: SERIF, fontSize: 20, color: W }}>{stats?.agency_name || 'Your Agency'}</span>
          <span style={{ border: '1px solid rgba(201,151,58,0.4)', color: GL, fontSize: 11, padding: '2px 8px', borderRadius: 12, marginLeft: 12, background: 'rgba(201,151,58,0.1)' }}>{planBadge}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="dash-status-stats" style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 11, color: MT }}>CAREGIVERS <b style={{ color: GL }}>{stats?.roster_total || 0}</b></span>
            <span style={{ fontSize: 11, color: MT }}>PLACEMENTS <b style={{ color: GL }}>{pipeline?.placed || 0}</b></span>
            <span style={{ fontSize: 11, color: MT }}>SHORTLISTED <b style={{ color: GL }}>{stats?.shortlist_total || 0}</b></span>
            <span style={{ fontSize: 11, color: MT }}>AIRECRUIT <b style={{ color: GL }}>{stats?.airecruit_active || 0}</b></span>
          </div>
          <span className="dash-profile-pct" style={{ fontSize: 12, color: GL, cursor: 'pointer' }} onClick={() => router.push('/agency/settings')}>Profile {profilePct}% complete →</span>
        </div>
      </div>

      {/* ZONE 2: MODE TOGGLE */}
      <div className="dash-mode-toggle" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 32px', display: 'flex', gap: 8, alignItems: 'center' }}>
        {(['today', 'command', 'week'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '5px 16px',
              borderRadius: 20,
              border: mode === m ? '1px solid rgba(201,151,58,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: mode === m ? GLX : 'transparent',
              color: mode === m ? GL : MT,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {m}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: SERIF, fontSize: 13, color: MT, fontStyle: 'italic' }}>
          {greeting} — here's your agency at a glance
        </div>
      </div>

      {/* ZONE 3: ALERT STRIP */}
      <div className="dash-alert-strip" style={{ padding: '10px 32px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {showAllClear ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 14px', minWidth: 200, border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #22C55E' }}>
            <span style={{ color: GR, fontSize: 13 }}>✓</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Everything is on track today</span>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <Link key={i} href={alert.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 14px', minWidth: 200, border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${alert.accent}`, cursor: 'pointer', textDecoration: 'none', marginRight: 10 }}>
              <span style={{ color: alert.accent, fontSize: 12 }}>{alert.icon}</span>
              <span style={{ fontSize: 12, color: W }}>{alert.text}</span>
            </Link>
          ))
        )}
      </div>

      {/* MODE: TODAY */}
      {mode === 'today' && (
        <>
          <div className="dash-cols" style={{ padding: '20px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20 }}>

            {/* COLUMN 1: CLIENTS & COVERAGE */}
            <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: SERIF, fontSize: 17, color: W }}>Clients & Coverage</span>
                <Link href="/agency/clients" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>View all →</Link>
              </div>

              {unmatchedClients.length > 0 ? (
                <>
                  {unmatchedClients.slice(0, 4).map((client, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: GLX, border: '1px solid rgba(201,151,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: GL, flexShrink: 0 }}>
                        {client.first_name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: W }}>{client.first_name}</div>
                        <div style={{ fontSize: 11, color: MT }}>{formatCondition(client.care_level)}</div>
                      </div>
                      <button onClick={() => router.push(`/agency/clients/${client.id}`)} style={{ background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '5px 12px', fontSize: 11, color: GL, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Find coverage →</button>
                    </div>
                  ))}
                  {unmatchedClients.length > 4 && (
                    <Link href="/agency/clients?tab=unmatched" style={{ fontSize: 12, color: GL, textDecoration: 'none', display: 'block', marginTop: 8 }}>View {unmatchedClients.length - 4} more →</Link>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: GR, fontSize: 13 }}>
                  <span>✓</span>
                  <span>All clients have coverage</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: MT, marginBottom: 4 }}>Available on your roster</div>
                <div style={{ fontSize: 13, color: W, fontWeight: 500 }}>{stats?.roster_claimed || 0} active caregivers</div>
                <Link href="/agency/roster" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>See who's available →</Link>
              </div>
            </div>

            {/* COLUMN 2: RECRUITMENT PIPELINE */}
            <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: SERIF, fontSize: 17, color: W }}>Recruitment Pipeline</span>
                <Link href="/agency/shortlist" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>View shortlist →</Link>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'Discovered', count: pipeline?.discovered || 0, bg: 'rgba(30,58,138,0.5)', color: '#93C5FD' },
                  { label: 'Contacted', count: pipeline?.contacted || 0, bg: 'rgba(30,58,138,0.4)', color: '#A5B4FC' },
                  { label: 'Interviewing', count: pipeline?.interviewing || 0, bg: 'rgba(120,53,15,0.5)', color: GL },
                  { label: 'Placed', count: pipeline?.placed || 0, bg: 'rgba(20,83,45,0.5)', color: '#86EFAC' },
                  { label: 'Inactive', count: pipeline?.inactive || 0, bg: 'rgba(255,255,255,0.05)', color: MT },
                ].map((stage, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: 10, padding: '8px 6px', textAlign: 'center', background: stage.bg, cursor: 'pointer' }}>
                    <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1, marginBottom: 2, color: stage.color }}>{stage.count}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase', color: stage.color }}>{stage.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: GL, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AIRecruit</div>
                {stats?.airecruit_active && stats.airecruit_active > 0 ? (
                  <div style={{ fontSize: 12, color: M }}>{stats.airecruit_active} campaigns · results ready</div>
                ) : (
                  <div style={{ fontSize: 12, color: M }}>No campaigns yet</div>
                )}
                <Link href="/agency/airecruit/new" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>Start AI screening →</Link>
              </div>
            </div>

            {/* COLUMN 3: AI ASSISTANT */}
            <div className="dash-ai-col" style={{ background: 'rgba(201,151,58,0.05)', border: '1px solid rgba(201,151,58,0.2)', borderRadius: 16, padding: 20, position: 'sticky', top: 20, height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: NAV_BG }}>AI</div>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, color: W }}>Careified AI</div>
                  <div style={{ fontSize: 11, color: MT }}>Your operations co-pilot</div>
                </div>
              </div>
              <MiniAssistant />
            </div>
          </div>

          {/* ZONE 4: ROSTER + ACTIVITY */}
          <div className="dash-bottom" style={{ padding: '0 32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily: SERIF, fontSize: 17, color: W }}>Roster Health</span>
                <Link href="/agency/roster" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>View roster →</Link>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}><span style={{ color: MT }}>Total</span> <b style={{ color: W, fontWeight: 600 }}>{stats?.roster_total || 0}</b></span>
                <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}><span style={{ color: MT }}>Active</span> <b style={{ color: W, fontWeight: 600 }}>{stats?.roster_claimed || 0}</b></span>
                <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}><span style={{ color: MT }}>Incomplete</span> <b style={{ color: W, fontWeight: 600 }}>{stats?.roster_pending || 0}</b></span>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <Link href="/agency/roster/add" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>Add caregiver →</Link>
                <Link href="/agency/roster/import" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>Import CSV →</Link>
              </div>
            </div>

            <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: W, marginBottom: 14 }}>Recent Activity</div>

              {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                dashboardData.recent_activity.slice(0, 5).map((activity, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 11, color: MT, minWidth: 50 }}>{formatRelativeTime(activity.timestamp)}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 4, background: activity.action.includes('shortlist') ? GL : activity.action.includes('claimed') ? GR : activity.action.includes('import') ? '#93C5FD' : MT }} />
                    <span style={{ fontSize: 12, color: M }}>{activity.action}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: MT }}>Activity will appear here as your team uses the platform.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODE: COMMAND */}
      {mode === 'command' && (
        <div className="dash-cmd-grid" style={{ padding: '20px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>

          <div onClick={() => router.push('/agency/clients')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,151,58,0.1)', marginBottom: 14, fontSize: 22 }}>👥</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>Clients & Coverage</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>{stats?.clients_total || 0} active · {stats?.clients_unmatched || 0} need coverage</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>View clients →</button>
          </div>

          <div onClick={() => router.push('/agency/caregivers')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56,139,221,0.1)', marginBottom: 14, fontSize: 22 }}>🔍</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>Find Caregivers</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>Search {'>'}500 verified caregivers</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>Search now →</button>
          </div>

          <div onClick={() => router.push('/agency/roster')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.1)', marginBottom: 14, fontSize: 22 }}>📋</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>Your Roster</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>{stats?.roster_total || 0} caregivers · {stats?.roster_pending || 0} need attention</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>Manage roster →</button>
          </div>

          <div onClick={() => router.push('/agency/airecruit')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)', marginBottom: 14, fontSize: 22 }}>🤖</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>AIRecruit</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>{stats?.airecruit_active || 0} campaigns · calls tonight</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>View results →</button>
          </div>

          <div onClick={() => router.push('/agency/airecruit')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(226,75,74,0.1)', marginBottom: 14, fontSize: 22 }}>⚡</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>QuickFill</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>Emergency coverage blast</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>Send blast →</button>
          </div>

          <div onClick={() => router.push('/agency/intelligence')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(20,184,166,0.1)', marginBottom: 14, fontSize: 22 }}>📊</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>Intelligence</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>ROI summary · placement outcomes</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>View report →</button>
          </div>

          <div onClick={() => router.push('/agency/airecruit')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.1)', marginBottom: 14, fontSize: 22 }}>📞</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>References & Verify</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>AI calls references automatically</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>Start calls →</button>
          </div>

          <div onClick={() => router.push('/agency/roster?tab=credentials')} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C9973A, transparent)' }} />
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(226,75,74,0.08)', marginBottom: 14, fontSize: 22 }}>🛡️</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: W, marginBottom: 4 }}>Compliance Check</div>
            <div style={{ fontSize: 12, color: M, marginBottom: 14, lineHeight: 1.5 }}>{dashboardData?.expiring_credentials?.length || 0} credentials need attention</div>
            <button style={{ width: '100%', background: GLX, border: '1px solid rgba(201,151,58,0.3)', borderRadius: 8, padding: '9px', fontSize: 12, color: GL, cursor: 'pointer', fontWeight: 500 }}>Review now →</button>
          </div>

        </div>
      )}

      {/* MODE: WEEK */}
      {mode === 'week' && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 40 }}>
            <div style={{ fontFamily: SERIF, fontSize: 20, color: W, marginBottom: 12 }}>Week view</div>
            <div style={{ fontSize: 13, color: M, lineHeight: 1.7 }}>A 7-day coverage calendar, upcoming placement endings, and credential deadlines. Coming in the next update.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestions = ['Find caregivers with dementia experience', "Which clients don't have a caregiver yet?", 'Start a screening campaign', "Show me my AIRecruit results"]

  async function sendMessage(text?: string) {
    const msg = text || input
    if (!msg.trim() || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/agency/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages }),
      })
      const data = await res.json()
      if (res.ok && data.response) {
        const parsed = parseActionBlock(data.response)
        setMessages(prev => [...prev, { role: 'assistant', content: parsed.content }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI temporarily unavailable' }])
    } finally {
      setLoading(false)
    }
  }

  function parseActionBlock(text: string): { content: string } {
    const actionRegex = /<action>{"type":"navigate","url":"([^"]+)"}<\/action>/
    const match = text.match(actionRegex)
    if (match) {
      const url = match[1]
      setTimeout(() => router.push(url), 1500)
      return { content: text.replace(actionRegex, '').trim() }
    }
    return { content: text }
  }

  return (
    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: M, margin: 2 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.role === 'user' ? G : 'rgba(255,255,255,0.05)', color: m.role === 'user' ? NAV_BG : W, fontSize: 12 }}>
          {m.content}
        </div>
      ))}

      {loading && (
        <div style={{ fontSize: 11, color: MT }}>Thinking...</div>
      )}

      <div ref={messagesEndRef} />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about your roster..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.03)', color: W }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: input.trim() && !loading ? G : 'rgba(255,255,255,0.1)', color: input.trim() && !loading ? NAV_BG : MT, fontSize: 12, cursor: input.trim() && !loading ? 'pointer' : 'default' }}>
          →
        </button>
      </div>
    </div>
  )
}

import React from 'react'
