'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import TriageNarrative from '@/components/agency/TriageNarrative'
import {
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Briefcase,
  ClipboardList,
  Zap,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Design tokens
const COLORS = {
  pageBg: '#0A0F1E',
  cardBg: '#111827',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardHoverBorder: 'rgba(255,255,255,0.15)',
  gold: '#C9973A',
  goldLight: '#E8B86D',
  goldGradient: 'linear-gradient(135deg, #C9973A, #E8B86D)',
  goldTint: 'rgba(201,151,58,0.15)',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#E24B4A',
  purple: '#818CF8',
  textPrimary: '#F8FAFC',
  textMuted: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.3)',
  inputBg: 'rgba(255,255,255,0.05)',
}

const FONTS = {
  serif: "'DM Serif Display', Georgia, serif",
  sans: "'Plus Jakarta Sans', sans-serif",
}

const skeletonStyle = {
  background: 'linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '6px',
}

type DashboardStats = {
  total_clients: number
  unmatched_clients: number
  total_caregivers: number
  roster_claimed: number
  pipeline_count: number
  airecruit_results: number
  agency_name?: string
}

type UnmatchedClient = {
  id: string
  first_name: string
  care_level: string
  created_at: string
}

type ExpiringCredential = {
  caregiver_id: string
  caregiver_name: string
  certification: string
  expiry_date: string
}

type AvailableCaregiver = {
  id: string
  first_name: string
  last_name: string
  role: string
  specializations: string[]
  aggregate_score: number | null
}

type BenchStrength = {
  dementia: number
  french: number
  livein: number
  wound: number
  available: number
  claimed: number
}

type DashboardData = {
  stats: DashboardStats
  unmatched_clients: UnmatchedClient[]
  expiring_credentials: ExpiringCredential[]
  top_matches: AvailableCaregiver[]
  bench_strength: BenchStrength | null
}

type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export default function AgencyDashboardV2() {
  const router = useRouter()
  const { user, isLoaded: clerkLoaded } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!clerkLoaded) return

    Promise.all([
      fetch('/api/agency/dashboard', { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch('/api/agency/clients', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ clients: [] })),
    ]).then(([dashResp, clientsResp]) => {
      setData({
        stats: dashResp.stats || {},
        unmatched_clients: dashResp.unmatched_clients || [],
        expiring_credentials: dashResp.expiring_credentials || [],
        top_matches: dashResp.top_matches || [],
        bench_strength: dashResp.bench_strength || null,
      })
      setLoading(false)
    }).catch((e) => {
      console.error('Dashboard fetch error:', e)
      setLoading(false)
    })
  }, [clerkLoaded])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [assistantMessages])

  const isMobile = windowWidth < 768
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const stats = data?.stats
  const unmatchedClients = data?.unmatched_clients || []
  const credentials = data?.expiring_credentials || []
  const availableCaregivers = data?.top_matches || []
  const benchStrength = data?.bench_strength

  // Build priorities
  const priorities: { type: 'unmatched' | 'credential' | 'airecruit'; title: string; action: string; color: string }[] = []

  if (unmatchedClients.length > 0) {
    const mostUrgent = unmatchedClients[0]
    const daysWaiting = Math.floor((now.getTime() - new Date(mostUrgent.created_at).getTime()) / (1000 * 60 * 60 * 24))
    priorities.push({
      type: 'unmatched',
      title: `${mostUrgent.first_name} — ${mostUrgent.care_level || 'Standard care'}, ${daysWaiting} days unmatched`,
      action: 'Find match →',
      color: COLORS.red,
    })
  }

  if (credentials.length > 0) {
    const soonestExpiring = credentials[0]
    const daysUntil = Math.ceil((new Date(soonestExpiring.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    priorities.push({
      type: 'credential',
      title: `${soonestExpiring.caregiver_name} — ${soonestExpiring.certification} expires in ${daysUntil} days`,
      action: 'Send reminder →',
      color: daysUntil < 7 ? COLORS.red : COLORS.amber,
    })
  }

  if ((stats?.airecruit_results || 0) > 0) {
    priorities.push({
      type: 'airecruit',
      title: `AIRecruit — ${stats?.airecruit_results} results ready to review`,
      action: 'Review now →',
      color: COLORS.purple,
    })
  }

  const sendAssistantMessage = async () => {
    if (!assistantInput.trim() || assistantLoading) return

    const userMsg: AssistantMessage = { role: 'user', content: assistantInput }
    setAssistantMessages(prev => [...prev, userMsg])
    setAssistantInput('')
    setAssistantLoading(true)

    try {
      const res = await fetch('/api/agency/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: assistantInput, context: { unmatched_count: unmatchedClients.length, available_count: availableCaregivers.length, airecruit_results: stats?.airecruit_results || 0 } }),
      })
      const data = await res.json()
      const assistantMsg: AssistantMessage = { role: 'assistant', content: data.response || data.message || 'I understand. How can I help?' }
      setAssistantMessages(prev => [...prev, assistantMsg])
    } catch (e) {
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setAssistantLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const renderSkeleton = (height: string, width: string = '100%') => (
    <div style={{ ...skeletonStyle, height, width }} />
  )

  if (loading || !clerkLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.pageBg, padding: isMobile ? '16px' : '24px', fontFamily: FONTS.sans }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .hover-card:hover { border-color: ${COLORS.cardHoverBorder} !important; }
          .hover-row:hover { background: rgba(255,255,255,0.03) !important; }
          .clickable { cursor: pointer; transition: all 150ms ease; }
        `}</style>

        {/* Topbar skeleton */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {renderSkeleton('20px', '280px')}
            {renderSkeleton('11px', '160px')}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {renderSkeleton('32px', '60px')}
            {renderSkeleton('36px', '36px')}
          </div>
        </div>

        {/* Gap banner skeleton */}
        {renderSkeleton('80px')}
        <div style={{ height: 16 }} />

        {/* Priorities skeleton */}
        {renderSkeleton('120px')}
        <div style={{ height: 16 }} />

        {/* Stats cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[1,2,3].map(i => renderSkeleton('100px'))}
        </div>

        {/* Ops columns skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {renderSkeleton('300px')}
          {renderSkeleton('300px')}
        </div>
      </div>
    )
  }

  const agencyName = stats?.agency_name || user?.firstName || 'Agency'

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pageBg, padding: isMobile ? '16px' : '24px', fontFamily: FONTS.sans }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .hover-card:hover { border-color: ${COLORS.cardHoverBorder} !important; }
        .hover-row:hover { background: rgba(255,255,255,0.03) !important; }
        .clickable { cursor: pointer; transition: all 150ms ease; }
      `}</style>

      {/* ZONE 1: TOPBAR */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.textPrimary }}>
            Good {greeting}, {agencyName}.
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            {dateStr} at {timeStr}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Alert pill */}
          {(stats?.airecruit_results || 0) > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: COLORS.goldTint, borderRadius: 20, border: `1px solid ${COLORS.gold}33`,
            }}>
              <Zap size={14} style={{ color: COLORS.gold }} />
              <span style={{ fontSize: 12, color: COLORS.gold }}>{stats?.airecruit_results} results</span>
            </div>
          )}
          {/* Notification bell */}
          <div className="clickable" style={{ position: 'relative', padding: 8 }}>
            <Bell size={20} color={COLORS.textMuted} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: COLORS.red, borderRadius: '50%' }} />
          </div>
          {/* Agency avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: COLORS.goldGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: COLORS.pageBg,
          }}>
            {getInitials(agencyName)}
          </div>
          {/* Co-pilot toggle */}
          {!isMobile && (
            <div
              className="clickable"
              onClick={() => setCopilotOpen(!copilotOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                background: copilotOpen ? COLORS.goldTint : 'transparent',
                borderRadius: 20, border: `1px solid ${copilotOpen ? COLORS.gold : COLORS.cardBorder}`,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.gold }} />
              <span style={{ fontSize: 12, color: COLORS.textPrimary }}>Co-pilot</span>
              {copilotOpen ? <ChevronUp size={14} color={COLORS.textMuted} /> : <ChevronDown size={14} color={COLORS.textMuted} />}
            </div>
          )}
        </div>
      </div>

      {/* ZONE 2: GAP BANNER */}
      {(stats?.unmatched_clients || 0) > 0 ? (
        <div style={{
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
          padding: isMobile ? 16 : 20, marginBottom: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.textPrimary }}>
              <span style={{ color: COLORS.gold }}>{stats?.unmatched_clients}</span> client{stats?.unmatched_clients !== 1 ? 's' : ''} need{stats?.unmatched_clients === 1 ? 's' : ''} coverage
            </div>
            {unmatchedClients.length > 0 && (
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                Most urgent: <span style={{ color: COLORS.textPrimary }}>{unmatchedClients[0].first_name}</span> — {unmatchedClients[0].care_level || 'Standard care'}, {Math.floor((now.getTime() - new Date(unmatchedClients[0].created_at).getTime()) / (1000 * 60 * 60 * 24))} days waiting
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/agency/clients" className="clickable" style={{
              padding: '8px 16px', fontSize: 13, color: COLORS.textMuted, textDecoration: 'none',
              border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8,
            }}>
              View all clients
            </Link>
            <Link href="/agency/clients?tab=unmatched" className="clickable" style={{
              padding: '8px 16px', fontSize: 13, color: COLORS.pageBg, textDecoration: 'none',
              background: COLORS.goldGradient, borderRadius: 8, fontWeight: 500,
            }}>
              Find coverage now →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
          padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.green }} />
          <span style={{ fontSize: 14, color: COLORS.textPrimary }}>All clients covered</span>
        </div>
      )}

      {/* ZONE 3: TODAY'S PRIORITIES */}
      {priorities.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 12 }}>
            Today&apos;s Priorities
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {priorities.map((p, i) => (
              <div key={i} className="clickable hover-card" style={{
                background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
                padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 14, color: COLORS.textPrimary }}>{p.title}</span>
                </div>
                <span style={{ fontSize: 13, color: p.color, fontWeight: 500 }}>{p.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZONE 4: THREE WORLDS + OPS COLUMNS */}
      <div style={{ marginBottom: 16 }}>
        {/* Row A: 3 Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {/* Caregivers Card */}
          <Link href="/agency/caregivers" className="clickable hover-card" style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
            padding: 20, textDecoration: 'none', display: 'block',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: COLORS.gold, borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>CAREGIVERS</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {stats?.roster_claimed || 0}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
              {stats?.total_caregivers || 0} in platform
            </div>
            {benchStrength && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: (benchStrength.available || 0) > 0 ? COLORS.green : COLORS.textTertiary }} />
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{benchStrength.available} available</span>
              </div>
            )}
          </Link>

          {/* Operations Card */}
          <Link href="/agency/shortlist" className="clickable hover-card" style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
            padding: 20, textDecoration: 'none', display: 'block',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: COLORS.purple, borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>OPERATIONS</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {stats?.pipeline_count || 0}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>in pipeline</div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpRight size={12} color={(stats?.unmatched_clients || 0) > 0 ? COLORS.red : COLORS.green} />
              <span style={{ fontSize: 11, color: (stats?.unmatched_clients || 0) > 0 ? COLORS.red : COLORS.green }}>
                {(stats?.unmatched_clients || 0) > 0 ? `${stats?.unmatched_clients} unmatched` : 'Stable'}
              </span>
            </div>
          </Link>

          {/* Clients Card */}
          <Link href="/agency/clients" className="clickable hover-card" style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
            padding: 20, textDecoration: 'none', display: 'block',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: COLORS.green, borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>CLIENTS</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {stats?.total_clients || 0}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>total active</div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: (stats?.unmatched_clients || 0) > 0 ? COLORS.red : COLORS.green }} />
              <span style={{ fontSize: 11, color: (stats?.unmatched_clients || 0) > 0 ? COLORS.red : COLORS.green }}>
                {(stats?.unmatched_clients || 0) > 0 ? `${stats?.unmatched_clients} need coverage` : 'All covered'}
              </span>
            </div>
          </Link>
        </div>

        {/* Row B: Ops Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {/* Clients needing coverage */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 16 }}>
              Clients needing coverage
            </div>
            {unmatchedClients.length > 0 ? (
              <div>
                {unmatchedClients.slice(0, 5).map((client, i) => {
                  const daysWaiting = Math.floor((now.getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))
                  const urgencyPct = Math.min((daysWaiting / 30) * 100, 100)
                  return (
                    <Link
                      key={client.id}
                      href={`/agency/clients/${client.id}`}
                      className="clickable hover-row"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                        borderBottom: i < 4 ? `1px solid ${COLORS.cardBorder}` : 'none',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: COLORS.textPrimary }}>{client.first_name}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{client.care_level || 'Standard care'}</div>
                      </div>
                      <div style={{ width: 60, marginRight: 8 }}>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${urgencyPct}%`, background: daysWaiting > 14 ? COLORS.red : COLORS.amber, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: daysWaiting > 14 ? COLORS.red : COLORS.amber, minWidth: 45, textAlign: 'right' }}>
                        {daysWaiting}d
                      </div>
                      <ChevronRight size={14} color={COLORS.textTertiary} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>No clients waiting</div>
              </div>
            )}
          </div>

          {/* Available caregivers */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 16 }}>
              Available caregivers
            </div>
            {availableCaregivers.length > 0 ? (
              <div>
                {availableCaregivers.slice(0, 5).map((cgiver, i) => (
                  <Link
                    key={cgiver.id}
                    href={`/agency/caregivers/${cgiver.id}`}
                    className="clickable hover-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                      borderBottom: i < 4 ? `1px solid ${COLORS.cardBorder}` : 'none',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: COLORS.textPrimary }}>{cgiver.first_name} {cgiver.last_name?.[0]}.</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{cgiver.role || cgiver.specializations?.[0] || 'Caregiver'}</div>
                    </div>
                    {cgiver.aggregate_score && (
                      <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cgiver.aggregate_score}%`, background: COLORS.purple, borderRadius: 2 }} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>No available caregivers</div>
                <Link href="/agency/airecruit/new" style={{ fontSize: 12, color: COLORS.gold, textDecoration: 'none' }}>
                  Recruit →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ZONE 5: INTELLIGENCE ROW */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
          {/* Triage narrative */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.gold}33`, borderRadius: 12, padding: 20, gridColumn: isMobile ? '1' : 'span 1' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 12 }}>
              Triage Narrative
            </div>
            <TriageNarrative />
          </div>

          {/* Credentials expiring */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.amber }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: COLORS.textTertiary, textTransform: 'uppercase' }}>
                Credentials Expiring
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {credentials.length}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>next 60 days</div>
          </div>

          {/* AIRecruit results */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.purple }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: COLORS.textTertiary, textTransform: 'uppercase' }}>
                AIRecruit Results
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {stats?.airecruit_results || 0}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>ready to review</div>
          </div>

          {/* Fill rate */}
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: COLORS.textTertiary, textTransform: 'uppercase' }}>
                Fill Rate
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, fontFamily: FONTS.serif }}>
              {stats?.total_clients ? Math.round(((stats.total_clients - (stats.unmatched_clients || 0)) / stats.total_clients) * 100) : 0}%
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>of clients filled</div>
          </div>
        </div>
      </div>

      {/* CO-PILOT PANEL (Desktop) */}
      {!isMobile && copilotOpen && (
        <div style={{
          position: 'fixed', right: 24, top: 80, width: 320, maxHeight: 'calc(100vh - 120px)',
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ padding: 16, borderBottom: `1px solid ${COLORS.cardBorder}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>Careified Co-pilot</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Aware of your current dashboard</div>
          </div>

          {/* Context strip */}
          <div style={{ padding: '8px 16px', borderBottom: `1px solid ${COLORS.cardBorder}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {unmatchedClients.length > 0 && (
              <span style={{ fontSize: 10, padding: '2px 8px', background: COLORS.red + '22', color: COLORS.red, borderRadius: 10 }}>
                {unmatchedClients.length} unmatched
              </span>
            )}
            {availableCaregivers.length > 0 && (
              <span style={{ fontSize: 10, padding: '2px 8px', background: COLORS.green + '22', color: COLORS.green, borderRadius: 10 }}>
                {availableCaregivers.length} available
              </span>
            )}
            {(stats?.airecruit_results || 0) > 0 && (
              <span style={{ fontSize: 10, padding: '2px 8px', background: COLORS.purple + '22', color: COLORS.purple, borderRadius: 10 }}>
                {stats?.airecruit_results} results
              </span>
            )}
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>
            {assistantMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <MessageSquare size={32} color={COLORS.textTertiary} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                  Ask me anything about your agency operations
                </div>
              </div>
            ) : (
              assistantMessages.map((msg, i) => (
                <div key={i} style={{
                  padding: 10, borderRadius: 8, fontSize: 13, lineHeight: 1.5,
                  background: msg.role === 'user' ? COLORS.goldTint : 'rgba(255,255,255,0.05)',
                  color: COLORS.textPrimary, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}>
                  {msg.content}
                </div>
              ))
            )}
            {assistantLoading && (
              <div style={{ padding: 10, borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {assistantMessages.length === 0 && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {unmatchedClients.length > 0 && (
                <button
                  className="clickable"
                  onClick={() => setAssistantInput(`Find someone for ${unmatchedClients[0].first_name}`)}
                  style={{
                    fontSize: 11, padding: '4px 10px', background: 'transparent', border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 12, color: COLORS.textMuted, whiteSpace: 'nowrap',
                  }}
                >
                  Find match for {unmatchedClients[0].first_name}
                </button>
              )}
              <button
                className="clickable"
                onClick={() => setAssistantInput('Show expiring credentials')}
                style={{
                  fontSize: 11, padding: '4px 10px', background: 'transparent', border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 12, color: COLORS.textMuted, whiteSpace: 'nowrap',
                }}
              >
                Expiring credentials
              </button>
              {(stats?.airecruit_results || 0) > 0 && (
                <button
                  className="clickable"
                  onClick={() => setAssistantInput('Review AIRecruit results')}
                  style={{
                    fontSize: 11, padding: '4px 10px', background: 'transparent', border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 12, color: COLORS.textMuted, whiteSpace: 'nowrap',
                  }}
                >
                  Review results
                </button>
              )}
            </div>
          )}

          {/* Input bar */}
          <div style={{ padding: 12, borderTop: `1px solid ${COLORS.cardBorder}`, display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAssistantMessage()}
              placeholder="Ask anything..."
              style={{
                flex: 1, padding: '8px 12px', background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8, color: COLORS.textPrimary, fontSize: 13, outline: 'none', fontFamily: FONTS.sans,
              }}
            />
            <button
              className="clickable"
              onClick={sendAssistantMessage}
              disabled={assistantLoading}
              style={{
                padding: 8, background: COLORS.goldGradient, border: 'none', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={16} color={COLORS.pageBg} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile floating co-pilot button */}
      {isMobile && (
        <Link
          href="/agency/assistant"
          className="clickable"
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%',
            background: COLORS.goldGradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(201,151,58,0.4)',
          }}
        >
          <MessageSquare size={24} color={COLORS.pageBg} />
        </Link>
      )}
    </div>
  )
}