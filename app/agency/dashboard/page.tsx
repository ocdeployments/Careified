'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Design tokens
const N = '#0D1B3E'
const G = '#C9973A'
const GL = '#FEF3E2'
const W = '#FFFFFF'
const S = '#F8F9FC'
const B = '#E2E8F0'
const M = '#64748B'
const MT = '#94A3B8'
const R = '#E24B4A'
const RL = '#FEF2F2'
const GR = '#22C55E'
const GRL = '#F0FDF4'

type DashboardData = {
  stats: {
    roster_total: number
    roster_claimed: number
    roster_pending: number
    shortlist_total: number
    clients_total: number
    clients_unmatched: number
    airecruit_active: number
    profile_completion?: number
    plan_tier?: string
    subscription_status?: string
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

export default function AgencyDashboard() {
  const router = useRouter()
  const { userId } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Zone 1: Top Status Bar
  const planBadge = stats?.plan_tier ? `${stats.plan_tier} · ${stats.subscription_status || 'Active'}` : 'Growth · Trial'
  const profilePct = stats?.profile_completion || 0

  // Zone 2: Alert strip
  const alerts: { type: string; count: number; accent: string; icon: string; text: string; href: string }[] = []
  if (stats?.clients_unmatched && stats.clients_unmatched > 0) {
    alerts.push({ type: 'unmatched_clients', count: stats.clients_unmatched, accent: R, icon: '⚠', text: `${stats.clients_unmatched} clients need coverage`, href: '/agency/clients?tab=unmatched' })
  }
  if (stats?.airecruit_active && stats.airecruit_active > 0) {
    alerts.push({ type: 'airecruit_results', count: stats.airecruit_active, accent: G, icon: '📋', text: `${stats.airecruit_active} AIRecruit results ready`, href: '/agency/airecruit' })
  }
  if (dashboardData?.expiring_credentials && dashboardData.expiring_credentials.length > 0) {
    alerts.push({ type: 'expiring_credentials', count: dashboardData.expiring_credentials.length, accent: '#F59E0B', icon: '⏰', text: `${dashboardData.expiring_credentials.length} credentials expiring soon`, href: '/agency/roster?tab=credentials' })
  }
  const showAllClear = alerts.length === 0

  return (
    <div style={{ minHeight: '100vh', background: S, fontFamily: "'DM Sans', sans-serif" }}>
      {/* ZONE 1: TOP STATUS BAR */}
      <div style={{ background: W, borderBottom: `1px solid ${B}`, padding: '12px 32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: N }}>Your Agency</span>
          <span style={{ border: `1px solid ${G}`, color: G, fontSize: 11, padding: '2px 8px', borderRadius: 12, marginLeft: 12 }}>{planBadge}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 11, color: M }}>CAREGIVERS <b style={{ color: N }}>{stats?.roster_total || 0}</b></span>
            <span style={{ fontSize: 11, color: M }}>PLACEMENTS <b style={{ color: N }}>{pipeline?.placed || 0}</b></span>
            <span style={{ fontSize: 11, color: M }}>SHORTLISTED <b style={{ color: N }}>{stats?.shortlist_total || 0}</b></span>
            <span style={{ fontSize: 11, color: M }}>AIRECRUIT <b style={{ color: N }}>{stats?.airecruit_active || 0}</b></span>
          </div>
          <span style={{ fontSize: 12, color: G, cursor: 'pointer' }} onClick={() => router.push('/agency/settings')}>Profile {profilePct}% complete →</span>
        </div>
      </div>

      {/* ZONE 2: ALERT STRIP */}
      <div style={{ background: S, borderBottom: `1px solid ${B}`, padding: '12px 32px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {showAllClear ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: W, borderRadius: 8, padding: '10px 14px', minWidth: 220, cursor: 'default' }}>
            <div style={{ width: 3, height: '100%', minHeight: 32, background: GR, borderRadius: '3px 0 0 3px' }} />
            <span style={{ color: GR }}>✓</span>
            <span style={{ fontSize: 13, color: N }}>Everything is on track today</span>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <Link key={i} href={alert.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: W, borderRadius: 8, padding: '10px 14px', minWidth: 220, border: `1px solid ${B}`, cursor: 'pointer', textDecoration: 'none', marginRight: 12 }}>
              <div style={{ width: 3, height: '100%', minHeight: 32, background: alert.accent, borderRadius: '3px 0 0 3px' }} />
              <span style={{ color: alert.accent }}>{alert.icon}</span>
              <span style={{ fontSize: 13, color: N }}>{alert.text}</span>
            </Link>
          ))
        )}
      </div>

      {/* ZONE 3: THREE WORKFLOW COLUMNS */}
      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: 24 }}>

        {/* COLUMN 1: CLIENTS & COVERAGE */}
        <div style={{ background: W, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: N }}>Clients & Coverage</span>
            <Link href="/agency/clients" style={{ fontSize: 13, color: G, textDecoration: 'none' }}>View all →</Link>
          </div>

          {unmatchedClients.length > 0 ? (
            <>
              {unmatchedClients.slice(0, 4).map((client, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? `1px solid ${B}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, color: N, fontWeight: 500 }}>{client.first_name}</div>
                    <div style={{ fontSize: 11, color: M }}>{client.care_level}</div>
                  </div>
                  <button onClick={() => router.push(`/agency/clients/${client.id}`)} style={{ background: G, color: W, border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Find coverage →</button>
                </div>
              ))}
              {unmatchedClients.length > 4 && (
                <Link href="/agency/clients?tab=unmatched" style={{ fontSize: 12, color: G, textDecoration: 'none', display: 'block', marginTop: 8 }}>View {unmatchedClients.length - 4} more →</Link>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: GR }}>
              <span>✓</span>
              <span style={{ fontSize: 13 }}>All clients have coverage</span>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${B}`, marginTop: 16, paddingTop: 16 }}>
            <div style={{ fontSize: 13, color: N, marginBottom: 8 }}>Available on your roster</div>
            <div style={{ fontSize: 12, color: M }}>{stats?.roster_claimed || 0} active caregivers</div>
            <Link href="/agency/roster" style={{ fontSize: 12, color: G, textDecoration: 'none' }}>View available →</Link>
          </div>
        </div>

        {/* COLUMN 2: RECRUITMENT PIPELINE */}
        <div style={{ background: W, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: N }}>Recruitment Pipeline</span>
            <Link href="/agency/shortlist" style={{ fontSize: 13, color: G, textDecoration: 'none' }}>View shortlist →</Link>
          </div>

          {/* Pipeline bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Discovered', count: pipeline?.discovered || 0, bg: '#E6F1FB', color: '#185FA5' },
              { label: 'Contacted', count: pipeline?.contacted || 0, bg: '#E6F1FB', color: '#185FA5' },
              { label: 'Interviewing', count: pipeline?.interviewing || 0, bg: GL, color: G },
              { label: 'Placed', count: pipeline?.placed || 0, bg: GRL, color: '#16A34A' },
              { label: 'Inactive', count: pipeline?.inactive || 0, bg: '#F1F5F9', color: M },
            ].map((stage, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', background: stage.bg, borderRadius: 12, padding: '3px 8px' }}>
                <div style={{ fontSize: 11, color: stage.color }}>{stage.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: stage.color }}>{stage.count}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${B}`, paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 8 }}>AIRecruit</div>
            {stats?.airecruit_active && stats.airecruit_active > 0 ? (
              <div style={{ fontSize: 12, color: M }}>{stats.airecruit_active} active campaigns</div>
            ) : (
              <div style={{ fontSize: 12, color: M }}>No campaigns yet</div>
            )}
            <Link href="/agency/airecruit/new" style={{ fontSize: 12, color: G, textDecoration: 'none' }}>Start new campaign →</Link>
          </div>
        </div>

        {/* COLUMN 3: AI ASSISTANT */}
        <div style={{ background: W, border: `1px solid ${B}`, borderRadius: 12, padding: 24, position: 'sticky', top: 20, height: 'fit-content' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: N }}>Careified AI</span>
            <div style={{ fontSize: 12, color: M }}>Your operations co-pilot</div>
          </div>
          <MiniAssistant />
        </div>
      </div>

      {/* ZONE 4: ROSTER + ACTIVITY */}
      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* LEFT: Roster health */}
        <div style={{ background: W, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: N }}>Roster Health</span>
            <Link href="/agency/roster" style={{ fontSize: 13, color: G, textDecoration: 'none' }}>View roster →</Link>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: M }}>Total <b style={{ color: N }}>{stats?.roster_total || 0}</b></span>
            <span style={{ fontSize: 12, color: M }}>Active <b style={{ color: N }}>{stats?.roster_claimed || 0}</b></span>
            <span style={{ fontSize: 12, color: M }}>Incomplete <b style={{ color: N }}>{stats?.roster_pending || 0}</b></span>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/agency/roster/add" style={{ fontSize: 12, color: G, textDecoration: 'none' }}>Add caregiver →</Link>
            <Link href="/agency/roster/import" style={{ fontSize: 12, color: G, textDecoration: 'none' }}>Import CSV →</Link>
          </div>
        </div>

        {/* RIGHT: Recent activity */}
        <div style={{ background: W, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: N }}>Recent Activity</span>
          </div>

          {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
            dashboardData.recent_activity.slice(0, 5).map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < 4 ? `1px solid ${B}` : 'none' }}>
                <span style={{ fontSize: 11, color: MT }}>{formatRelativeTime(activity.timestamp)}</span>
                <span style={{ fontSize: 12, color: N }}>{activity.action}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: MT }}>Activity will appear here as your team uses the platform.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mini AI Assistant component (inline)
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
            <button key={i} onClick={() => sendMessage(s)} style={{ background: '#F1F5F9', border: `1px solid ${B}`, borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: N, margin: 2 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.role === 'user' ? G : '#F1F5F9', color: m.role === 'user' ? W : N, fontSize: 12 }}>
          {m.content}
        </div>
      ))}

      {loading && (
        <div style={{ fontSize: 11, color: M }}>Thinking...</div>
      )}

      <div ref={messagesEndRef} />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about your roster..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${B}`, fontSize: 12, outline: 'none' }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: input.trim() && !loading ? G : B, color: input.trim() && !loading ? W : M, fontSize: 12, cursor: input.trim() && !loading ? 'pointer' : 'default' }}>
          →
        </button>
      </div>
    </div>
  )
}

import React from 'react'