'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { pool } from '@/lib/db'
import Link from 'next/link'
import CommandBar from '@/components/agency/CommandBar'
import ProfileNudge from '@/components/agency/ProfileNudge'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

type DashboardData = {
  stats: {
    roster_total: number
    roster_claimed: number
    roster_pending: number
    shortlist_total: number
    clients_total: number
    clients_unmatched: number
    airecruit_active: number
  }
  action_items: { priority: string; title: string; cta_href: string }[]
  pipeline: { discovered: number; contacted: number; interviewing: number; placed: number; inactive: number } | null
  recent_activity: { action: string; timestamp: string; detail?: string }[]
  top_matches: { id: string; first_name: string; last_name: string; aggregate_score: number | null; photo_url: string | null; role: string | null }[]
  expiring_credentials: { caregiver_id: string; caregiver_name: string; certification: string; expiry_date: string }[]
}

async function getAgencyData(userId: string) {
  try {
    const [agency, clients, shortlist, stats, recentReviews, recentMatches] = await Promise.all([
      pool.query('SELECT id, name FROM agencies WHERE clerk_user_id = $1', [userId]),
      pool.query(`SELECT id, client_first_name, primary_condition, status, created_at, matched_caregiver_id FROM client_needs WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1) ORDER BY created_at DESC LIMIT 5`, [userId]),
      pool.query(`SELECT COUNT(*) FROM agency_shortlist WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1)`, [userId]),
      pool.query(`SELECT
        (SELECT COUNT(*) FROM client_needs WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1) AND status != 'closed') as active_clients,
        (SELECT COUNT(*) FROM client_needs WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1) AND matched_caregiver_id IS NOT NULL) as matched_clients,
        (SELECT COUNT(*) FROM placement_reviews WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1)) as total_reviews,
        (SELECT COUNT(*) FROM placement_reviews WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1) AND would_re_engage = true) as positive_reviews`),
      pool.query(`SELECT pr.id, pr.would_re_engage, pr.created_at, c.first_name, c.last_name
       FROM placement_reviews pr
       JOIN caregivers c ON pr.caregiver_id = c.id
       WHERE pr.agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1)
       ORDER BY pr.created_at DESC LIMIT 3`),
      pool.query(`SELECT cn.client_first_name, cn.primary_condition, cn.matched_caregiver_id, cn.updated_at,
       c.first_name as caregiver_first_name, c.last_name as caregiver_last_name
       FROM client_needs cn
       LEFT JOIN caregivers c ON cn.matched_caregiver_id = c.id
       WHERE cn.agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1) AND cn.matched_caregiver_id IS NOT NULL
       ORDER BY cn.updated_at DESC LIMIT 3`),
    ])
    return {
      agency: agency.rows[0] || null,
      clients: clients.rows,
      shortlistCount: parseInt(shortlist.rows[0]?.count || '0'),
      stats: stats.rows[0] || {},
      recentReviews: recentReviews.rows,
      recentMatches: recentMatches.rows,
    }
  } catch { return { agency: null, clients: [], shortlistCount: 0, stats: {}, recentReviews: [], recentMatches: [] } }
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

function Skeleton({ width = 60, height = 32 }: { width?: number; height?: number }) {
  return (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '468px 100%',
      animation: 'shimmer 1.2s ease-in-out infinite',
      borderRadius: 4,
      display: 'inline-block'
    }} />
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 16px' }}>
      {[0, 0.15, 0.3].map((delay, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: G,
          animation: 'dotBounce 1.4s ease-in-out infinite',
          animationDelay: `${delay}s`
        }} />
      ))}
    </div>
  )
}

function AiAssistantPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(msg?: string) {
    const text = msg || input
    if (!text.trim() || loading) return

    const userMsg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/agency/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = ['Roster status', 'Unmatched clients', 'AIRecruit results', "Who's in interviewing?"]

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: N, padding: '14px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8' }}>Careified Assistant</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Ask about your roster, clients, or campaigns</div>
      </div>

      {/* Messages */}
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '12px 0' }}>
        {messages.length === 0 && !loading && (
          <div style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 20,
                  border: '1px solid #E2E8F0', background: 'transparent', color: N,
                  cursor: 'pointer', fontFamily: S,
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            padding: '4px 18px', marginBottom: 4
          }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
              background: m.role === 'user' ? G : 'white', color: m.role === 'user' ? N : '#475569',
              fontSize: 13, border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        {error && (
          <div style={{ padding: '8px 18px', color: '#DC2626', fontSize: 12 }}>{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask about your data..."
          rows={1}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
            fontSize: 13, fontFamily: S, resize: 'none', outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: input.trim() && !loading ? G : '#E2E8F0',
            color: input.trim() && !loading ? N : '#94A3B8',
            fontSize: 12, fontWeight: 700, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontFamily: S,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default function AgencyDashboard() {
  const { userId, isLoaded } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [legacyData, setLegacyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    Promise.all([
      fetch('/api/agency/dashboard', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      getAgencyData(userId).then(d => d)
    ]).then(([dash, legacy]) => {
      setDashboardData(dash)
      setLegacyData(legacy)
      setLoading(false)
    })
  }, [userId])

  if (!userId) return null

  const { agency, clients, shortlistCount, stats, recentReviews, recentMatches } = legacyData || {}
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const unmatched = clients?.filter((c: any) => !c.matched_caregiver_id) || []
  const matchRate = stats?.active_clients > 0 ? Math.round((stats.matched_clients / stats.active_clients) * 100) : 0
  const satisfaction = stats?.total_reviews > 0 ? Math.round((stats.positive_reviews / stats.total_reviews) * 100) : null

  // Pipeline chart calculations
  const pipeline = dashboardData?.pipeline
  const pipelineTotal = pipeline ? (pipeline.discovered + pipeline.contacted + pipeline.interviewing + pipeline.placed + pipeline.inactive) : 0
  const getPipelineWidth = (val: number) => pipelineTotal > 0 ? Math.max((val / pipelineTotal) * 100, 5) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
        @keyframes urgentPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.15); } 50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); } }
      `}</style>

      {/* Hero */}
      <div style={{ background: N, padding: '40px 32px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{greeting}</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#F5F0E8', margin: '0 0 24px' }}>
            {agency?.name || 'Your Agency'}
          </h1>

          {/* Action items strip */}
          {dashboardData?.action_items && dashboardData.action_items.length > 0 && (
            <div style={{ display: 'flex', gap: 12, padding: '4px 0', marginBottom: 20, overflowX: 'auto' }}>
              {dashboardData.action_items.map((item, i) => (
                <Link key={i} href={item.cta_href} style={{
                  minWidth: 220, padding: 16, borderRadius: 12, background: 'white',
                  border: '1px solid #E2E8F0', borderLeft: `4px solid ${
                    item.priority === 'urgent' ? '#DC2626' : item.priority === 'high' ? G : '#1E3A8A'
                  }`,
                  textDecoration: 'none',
                  animation: item.priority === 'urgent' ? 'urgentPulse 2s infinite' : 'none',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{item.title}</div>
                </Link>
              ))}
            </div>
          )}
          {dashboardData?.action_items && dashboardData.action_items.length === 0 && (
            <div style={{ padding: '12px 0', marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: G }}>&#10003; Everything is up to date.</span>
            </div>
          )}

          {/* Priority alert */}
          {unmatched.length > 0 && (
            <div style={{ background: 'rgba(201,151,58,0.15)', border: '1px solid rgba(201,151,58,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: G }}>
                  {unmatched.length} client{unmatched.length > 1 ? 's' : ''} without a matched caregiver
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
                  {unmatched.map((c: any) => c.client_first_name).join(', ')}
                </span>
              </div>
              <Link href="/agency/clients" style={{ fontSize: 12, fontWeight: 700, color: G, textDecoration: 'none', background: 'rgba(201,151,58,0.15)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(201,151,58,0.3)' }}>
                View clients →
              </Link>
            </div>
          )}

          {/* Command bar */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>
              Tell me what you need — I will find the right caregiver
            </p>
            <CommandBar />
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: 'Find a caregiver', desc: 'Search and filter all profiles', href: '/agency/search', primary: true },
              { label: 'Agency Roster', desc: 'Add and manage your caregivers', href: '/agency/roster', primary: true },
              { label: 'New client intake', desc: 'Add a client and run matches', href: '/agency/clients/new', primary: false },
              { label: 'My clients', desc: `${clients?.length || 0} active`, href: '/agency/clients', primary: false },
              { label: 'Shortlist', desc: `${shortlistCount || 0} saved`, href: '/agency/shortlist', primary: false },
              { label: 'AIRecruit', desc: 'Run AI screening calls', href: '/agency/airecruit', primary: false },
              { label: 'Settings', desc: 'Agency profile, team, compliance', href: '/agency/settings', primary: false },
              { label: 'Billing', desc: 'Plan and payments', href: '/agency/billing', primary: false },
            ].map(action => (
              <Link key={action.href} href={action.href} style={{
                display: 'block', padding: '16px 18px', borderRadius: 12, textDecoration: 'none',
                background: action.primary ? `linear-gradient(135deg, ${G}, #E8B86D)` : 'rgba(255,255,255,0.06)',
                border: action.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: action.primary ? N : '#F5F0E8', marginBottom: 3 }}>{action.label}</div>
                <div style={{ fontSize: 12, color: action.primary ? 'rgba(13,27,62,0.7)' : 'rgba(255,255,255,0.45)' }}>{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {/* Caregivers */}
          <Link href="/agency/roster" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="stat-card" style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Caregivers</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: N, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? <Skeleton width={50} height={32} /> : (dashboardData?.stats?.roster_total || 0)}
              </div>
              <div style={{ fontSize: 12, color: '#16A34A' }}>
                {loading ? '' : `${dashboardData?.stats?.roster_claimed || 0} active`}
              </div>
            </div>
          </Link>

          {/* Pending Claims */}
          <Link href="/agency/roster" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending Claims</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: N, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? <Skeleton width={50} height={32} /> : (dashboardData?.stats?.roster_pending || 0)}
              </div>
              {(dashboardData?.stats?.roster_pending || 0) > 0 && (
                <div style={{ fontSize: 12, color: G }}>Need follow-up</div>
              )}
            </div>
          </Link>

          {/* Clients */}
          <Link href="/agency/clients" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Clients</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: N, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? <Skeleton width={50} height={32} /> : (dashboardData?.stats?.clients_total || 0)}
              </div>
              {(dashboardData?.stats?.clients_unmatched || 0) > 0 && (
                <div style={{ fontSize: 12, color: G }}>{dashboardData?.stats?.clients_unmatched} need matching</div>
              )}
            </div>
          </Link>

          {/* Shortlist */}
          <Link href="/agency/shortlist" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Shortlist</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: N, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? <Skeleton width={50} height={32} /> : (dashboardData?.stats?.shortlist_total || 0)}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>saved</div>
            </div>
          </Link>

          {/* AIRecruit */}
          <Link href="/agency/airecruit" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>AIRecruit</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: N, fontFamily: "'DM Serif Display', serif" }}>
                {loading ? <Skeleton width={50} height={32} /> : (dashboardData?.stats?.airecruit_active || 0)}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>active campaigns</div>
            </div>
          </Link>

          {/* Pipeline */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pipeline</div>
            {pipeline && pipelineTotal > 0 ? (
              <>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${getPipelineWidth(pipeline.discovered)}%`, background: '#E2E8F0' }} />
                  <div style={{ width: `${getPipelineWidth(pipeline.contacted)}%`, background: '#93C5FD' }} />
                  <div style={{ width: `${getPipelineWidth(pipeline.interviewing)}%`, background: G }} />
                  <div style={{ width: `${getPipelineWidth(pipeline.placed)}%`, background: '#2D6A4F' }} />
                  <div style={{ width: `${getPipelineWidth(pipeline.inactive)}%`, background: '#F3F4F6' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B' }}>
                  <span>{pipeline.discovered} disc</span>
                  <span>{pipeline.contacted} cont</span>
                  <span>{pipeline.interviewing} int</span>
                  <span>{pipeline.placed} placed</span>
                  <span>{pipeline.inactive} off</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 24, color: '#94A3B8' }}>—</div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* AI Assistant */}
            <AiAssistantPanel />

            {/* Recent clients */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Recent clients</span>
                <Link href="/agency/clients/new" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 600 }}>+ New client</Link>
              </div>
              {clients?.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                  No clients yet — <Link href="/agency/clients/new" style={{ color: G }}>add your first</Link>
                </div>
              ) : (
                clients?.map((c: any) => (
                  <Link key={c.id} href={`/agency/clients/${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F9FAFB', textDecoration: 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{c.client_first_name}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{c.primary_condition}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: c.matched_caregiver_id ? '#F0FDF4' : '#FEF3C7', color: c.matched_caregiver_id ? '#16A34A' : '#D97706' }}>
                      {c.matched_caregiver_id ? 'Matched' : 'Needs match'}
                    </span>
                  </Link>
                ))
              )}
            </div>

            {/* How to use */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 16 }}>How to find the right caregiver</div>
              {[
                { step: '1', text: 'Add a client with their clinical needs and schedule', href: '/agency/clients/new' },
                { step: '2', text: 'View ranked caregiver matches automatically generated', href: '/agency/clients' },
                { step: '3', text: 'Check the "Verify in your call" list before you dial', href: '/agency/clients' },
                { step: '4', text: 'Shortlist top candidates and compare side by side', href: '/agency/shortlist' },
                { step: '5', text: 'Or browse all caregivers manually with search filters', href: '/agency/search' },
              ].map(s => (
                <Link key={s.step} href={s.href} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, textDecoration: 'none' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: N, flexShrink: 0 }}>{s.step}</span>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{s.text}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Activity feed */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', height: 'fit-content' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Recent activity</span>
              </div>
              <div style={{ padding: '8px 0', maxHeight: 280, overflow: 'auto' }}>
                {(dashboardData?.recent_activity?.length === 0 && recentMatches?.length === 0 && recentReviews?.length === 0) || (loading && !dashboardData?.recent_activity?.length) ? (
                  <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                    No recent activity
                  </div>
                ) : (
                  <>
                    {dashboardData?.recent_activity?.slice(0, 5).map((a, i) => (
                      <div key={`a-${i}`} style={{ padding: '10px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          <strong>{a.action}</strong>
                          <span style={{ color: '#94A3B8', marginLeft: 4 }}>{formatRelativeTime(a.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                    {recentMatches?.map((m: any, i: number) => (
                      <div key={`m-${i}`} style={{ padding: '10px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          <strong>{m.caregiver_first_name}</strong> matched
                        </div>
                      </div>
                    ))}
                    {recentReviews?.map((r: any, i: number) => (
                      <div key={`r-${i}`} style={{ padding: '10px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.would_re_engage ? '#16A34A' : '#DC2626', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          Review: {r.would_re_engage ? 'positive' : 'negative'}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Credential alerts */}
            {dashboardData?.expiring_credentials && dashboardData.expiring_credentials.length > 0 && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', borderTop: '3px solid #DC2626', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>Credential Alerts</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {dashboardData.expiring_credentials.slice(0, 5).map((c, i) => {
                    const daysUntil = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid #F9FAFB' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{c.caregiver_name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{c.certification}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                            background: daysUntil < 14 ? '#FEE2E2' : '#FEF3C7',
                            color: daysUntil < 14 ? '#DC2626' : '#D97706'
                          }}>
                            {daysUntil}d
                          </span>
                          <Link href={`/profile/${c.caregiver_id}`} style={{ fontSize: 11, color: G, textDecoration: 'none' }}>View</Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Profile completion + billing nudge */}
      <ProfileNudge />
    </div>
  )
}