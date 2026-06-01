'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import BenchStrengthWidget from '@/components/agency/BenchStrengthWidget'
import TriageNarrative from '@/components/agency/TriageNarrative'
import {
  Bell,
  AlertTriangle,
  ChevronRight,
  Flame,
  HeartHandshake,
  Building2,
  Home,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react'

const PAGE_BG = '#080F1E'
const CARD_BG = '#111827'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const CARD_HOVER_BORDER = 'rgba(255,255,255,0.15)'
const GOLD = '#C9973A'
const GOLD_LIGHT = '#E8B86D'
const GOLD_GRADIENT = 'linear-gradient(135deg, #C9973A, #E8B86D)'
const TEXT_PRIMARY = '#F8FAFC'
const TEXT_MUTED = 'rgba(255,255,255,0.55)'
const TEXT_TERTIARY = 'rgba(255,255,255,0.3)'
const RED = '#E24B4A'
const AMBER = '#F59E0B'
const GREEN = '#22C55E'
const PURPLE = '#818CF8'
const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'Plus Jakarta Sans', sans-serif"

type DashboardStats = {
  total_clients: number
  unmatched_clients: number
  total_caregivers: number
  available_caregivers?: number
  roster_claimed: number
  pipeline_count: number
  shortlisted_count?: number
  airecruit_results: number
  expiring_credentials?: number
  agency_name?: string
  plan_tier?: string
  subscription_status?: string
}

type Client = {
  id: string
  client_first_name: string
  service_type: string
  created_at: string
  matched_caregiver_id?: string
}

type UnmatchedClient = {
  id: string
  first_name: string
  care_level: string
  created_at: string
}

type DashboardData = {
  stats: DashboardStats
  action_items: any[]
  clients?: Client[]
  unmatched_clients?: UnmatchedClient[]
  expiring_credentials?: { expiry_date: string; caregiver_name?: string; certification?: string }[]
  bench_strength?: {
    dementia: number
    french: number
    livein: number
    wound: number
    available: number
    claimed: number
  }
  top_matches?: { id: string; first_name: string; last_name?: string; role?: string; specializations?: string[]; aggregate_score?: number }[]
}

export default function AgencyDashboard() {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    Promise.all([
      fetch('/api/agency/dashboard', { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch('/api/agency/clients', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ clients: [] })),
    ]).then(([dashResp, clientsResp]) => {
      setData({ ...dashResp, clients: clientsResp.clients || [] })
      setLoading(false)
    }).catch((e) => {
      console.error('Dashboard fetch error:', e)
      setLoading(false)
    })
  }, [isLoaded])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const stats = data?.stats
  const credentials = data?.expiring_credentials || []
  const clients = data?.clients || []
  const unmatchedClients = data?.unmatched_clients || []
  const availableCaregivers = data?.top_matches || []
  const isMobile = windowWidth < 768

  const getInitials = (name: string) => {
    if (!name) return 'AG'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatCareLevel = (raw: string | null | undefined): string => {
    if (!raw) return 'Standard care'
    return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  // Skeleton loading state
  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', background: PAGE_BG, padding: isMobile ? '16px' : '24px 32px', fontFamily: SANS }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .skeleton { background: linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 6px; }
          .hover-row:hover { background: rgba(255,255,255,0.03) !important; cursor: pointer; }
          .hover-card:hover { border-color: rgba(255,255,255,0.15) !important; }
        `}</style>

        <div style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ height: 22, width: 280, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, width: 160 }} />
        </div>
        <div className="skeleton" style={{ height: 80, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 120, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          <div className="skeleton" style={{ height: 100 }} />
          <div className="skeleton" style={{ height: 100 }} />
          <div className="skeleton" style={{ height: 100 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div className="skeleton" style={{ height: 300 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    )
  }

  const agencyName = stats?.agency_name || user?.firstName || 'Agency'
  const expiringCredCount = credentials.length

  // Build priorities
  const priorities: { type: string; title: string; meta: string; action: string; actionHref: string; color: string; bg: string }[] = []

  if (unmatchedClients.length > 0) {
    const mostUrgent = unmatchedClients[0]
    const daysWaiting = mostUrgent.created_at ? Math.floor((now.getTime() - new Date(mostUrgent.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
    priorities.push({
      type: 'unmatched',
      title: `${mostUrgent.first_name} — ${formatCareLevel(mostUrgent.care_level)}, ${daysWaiting} days unmatched`,
      meta: `${stats?.total_caregivers || 0} caregivers in platform`,
      action: 'Find match →',
      actionHref: '/agency/caregivers',
      color: RED,
      bg: 'rgba(226,75,74,0.18)',
    })
  }

  if (expiringCredCount > 0) {
    priorities.push({
      type: 'credential',
      title: `${expiringCredCount} credential${expiringCredCount !== 1 ? 's' : ''} expiring this month`,
      meta: 'Review and send renewal reminders',
      action: 'Review →',
      actionHref: '/agency/roster',
      color: AMBER,
      bg: 'rgba(245,158,11,0.15)',
    })
  }

  if ((stats?.airecruit_results || 0) > 0) {
    priorities.push({
      type: 'airecruit',
      title: `AIRecruit — ${stats?.airecruit_results} results ready to review`,
      meta: 'Screening calls completed overnight',
      action: 'Review now →',
      actionHref: '/agency/airecruit',
      color: PURPLE,
      bg: 'rgba(129,140,248,0.15)',
    })
  }

  const hasPriorities = priorities.length > 0

  // Calculate fill rate
  const totalClients = stats?.total_clients || 0
  const unmatchedClientsCount = stats?.unmatched_clients || 0
  const fillRate = totalClients > 0 ? Math.round(((totalClients - unmatchedClientsCount) / totalClients) * 100) : 0
  const availableCount = data?.bench_strength?.available || 0

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, padding: isMobile ? '16px' : '24px 32px', fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton { background: linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 6px; }
        .hover-row:hover { background: rgba(255,255,255,0.03) !important; cursor: pointer; }
        .hover-card:hover { border-color: ${CARD_HOVER_BORDER} !important; transition: border-color 150ms ease; }
      `}</style>

      {/* ZONE 1: TOPBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: TEXT_PRIMARY }}>
            Good {greeting}, {agencyName}.
          </div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>
            {dateStr} · {timeStr}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {expiringCredCount > 0 && (
            <Link href="/agency/roster?tab=credentials" className="hover-row" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'rgba(245,158,11,0.12)', borderRadius: 20, textDecoration: 'none',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              <AlertTriangle size={14} color={AMBER} />
              <span style={{ fontSize: 12, color: AMBER, fontWeight: 500 }}>{expiringCredCount} creds</span>
            </Link>
          )}
          <div style={{ position: 'relative', padding: 6, cursor: 'pointer' }}>
            <Bell size={18} color={TEXT_MUTED} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: RED, borderRadius: '50%' }} />
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: GOLD_GRADIENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#0D1728',
          }}>
            {getInitials(agencyName)}
          </div>
        </div>
      </div>

      {/* ZONE 2: GAP BANNER */}
      {unmatchedClientsCount > 0 ? (
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderLeft: '3px solid #E24B4A',
          borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 24, display: 'flex',
          flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: TEXT_PRIMARY }}>
              <span style={{ color: GOLD }}>{unmatchedClientsCount}</span> client{unmatchedClientsCount !== 1 ? 's' : ''} need{unmatchedClientsCount === 1 ? 's' : ''} coverage
            </div>
            {unmatchedClients.length > 0 && (
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                Most urgent: <span style={{ color: TEXT_PRIMARY }}>{unmatchedClients[0].first_name}</span> — {formatCareLevel(unmatchedClients[0].care_level)}, {unmatchedClients[0].created_at ? Math.floor((now.getTime() - new Date(unmatchedClients[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0} days waiting
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/agency/clients" className="hover-row" style={{
              padding: '8px 16px', fontSize: 13, color: TEXT_MUTED, textDecoration: 'none',
              border: `1px solid ${CARD_BORDER}`, borderRadius: 8,
            }}>
              View all clients
            </Link>
            <Link href="/agency/clients?tab=unmatched" className="hover-row" style={{
              padding: '8px 16px', fontSize: 13, color: '#0D1728', textDecoration: 'none',
              background: GOLD_GRADIENT, borderRadius: 8, fontWeight: 500,
            }}>
              Find coverage →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderLeft: '3px solid #22C55E',
          borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN }} />
          <span style={{ fontSize: 14, color: TEXT_PRIMARY }}>All clients covered</span>
        </div>
      )}

      {/* ZONE 3: TODAY'S PRIORITIES */}
      {hasPriorities && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: GOLD, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={12} color={GOLD} />
            Today&apos;s priorities
          </div>
          <div style={{
            background: 'rgba(226,75,74,0.03)', border: '1px solid rgba(226,75,74,0.12)',
            borderRadius: 12, padding: isMobile ? 12 : 16,
          }}>
            {priorities.map((p, i) => (
              <Link
                key={p.type}
                href={p.actionHref}
                className="hover-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: i < priorities.length - 1 ? `1px solid ${CARD_BORDER}` : 'none',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: p.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: p.color,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TEXT_PRIMARY }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{p.meta}</div>
                </div>
                <span style={{ fontSize: 11, color: GOLD, fontWeight: 500 }}>{p.action}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ZONE 4A: THREE WORLD CARDS */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {/* Caregivers */}
          <Link href="/agency/roster" className="hover-card" style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12,
            padding: '16px 18px', textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <HeartHandshake size={14} color={GOLD} />
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Caregivers</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: TEXT_PRIMARY }}>{stats?.total_caregivers || 0}</div>
              <div style={{ fontSize: 10, color: TEXT_TERTIARY }}>on roster</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Available now</span>
                <span style={{ color: (stats?.available_caregivers || 0) > 0 ? GREEN : TEXT_MUTED, fontWeight: 500 }}>{stats?.available_caregivers || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Shortlisted</span>
                <span style={{ color: PURPLE, fontWeight: 500 }}>{stats?.shortlisted_count || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Creds expiring</span>
                <span style={{ color: expiringCredCount > 0 ? RED : TEXT_MUTED, fontWeight: 500 }}>{stats?.expiring_credentials || 0}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: GOLD, marginTop: 14 }}>Manage roster →</div>
          </Link>

          {/* Operations */}
          <Link href="/agency/intelligence" className="hover-card" style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12,
            padding: '16px 18px', textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Building2 size={14} color={PURPLE} />
              <span style={{ fontSize: 10, color: PURPLE, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Operations</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: TEXT_PRIMARY }}>{stats?.pipeline_count || 0}</div>
              <div style={{ fontSize: 10, color: TEXT_TERTIARY }}>shortlisted</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>AIRecruit campaigns</span>
                <span style={{ color: PURPLE, fontWeight: 500 }}>{stats?.airecruit_results || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Fill rate</span>
                <span style={{ color: fillRate > 50 ? GREEN : AMBER, fontWeight: 500 }}>{fillRate || '—'}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Unmatched clients</span>
                <span style={{ color: unmatchedClientsCount > 0 ? RED : TEXT_MUTED, fontWeight: 500 }}>{unmatchedClientsCount}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: PURPLE, marginTop: 14 }}>View intelligence →</div>
          </Link>

          {/* Clients */}
          <Link href="/agency/clients" className="hover-card" style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12,
            padding: '16px 18px', textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Home size={14} color={GREEN} />
              <span style={{ fontSize: 10, color: GREEN, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Clients</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: TEXT_PRIMARY }}>{stats?.total_clients || 0}</div>
              <div style={{ fontSize: 10, color: TEXT_TERTIARY }}>active</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Covered</span>
                <span style={{ color: GREEN, fontWeight: 500 }}>{totalClients - unmatchedClientsCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Unmatched</span>
                <span style={{ color: unmatchedClientsCount > 0 ? RED : TEXT_MUTED, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {unmatchedClientsCount > 0 && <ArrowUpRight size={12} color={RED} />}
                  {unmatchedClientsCount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: TEXT_MUTED }}>Avg wait</span>
                <span style={{ color: unmatchedClientsCount > 0 ? AMBER : TEXT_MUTED, fontWeight: 500 }}>
                  {unmatchedClients.length > 0 ? `${Math.round(unmatchedClients.reduce((sum, c) => sum + (c.created_at ? Math.floor((now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0), 0) / unmatchedClients.length)}d` : '—'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: GREEN, marginTop: 14 }}>View all clients →</div>
          </Link>
        </div>
      </div>

      {/* ZONE 4B: OPS COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Left: Clients needing coverage */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16 }}>
            Clients needing coverage
          </div>
          {unmatchedClients.length > 0 ? (
            <div>
              {unmatchedClients.slice(0, 5).map((client, i) => {
                const daysWaiting = client.created_at ? Math.floor((now.getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
                const urgencyPct = Math.min((daysWaiting / 30) * 100, 100)
                return (
                  <Link
                    key={client.id}
                    href={`/agency/clients/${client.id}`}
                    className="hover-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                      borderBottom: i < 4 ? `1px solid ${CARD_BORDER}` : 'none',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY }}>{client.first_name}</div>
                      <div style={{ fontSize: 11, color: TEXT_MUTED }}>{formatCareLevel(client.care_level)} · {daysWaiting}d</div>
                    </div>
                    <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginRight: 8 }}>
                      <div style={{ height: '100%', width: `${urgencyPct}%`, background: daysWaiting > 14 ? RED : AMBER, borderRadius: 2 }} />
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4,
                      background: daysWaiting > 14 ? 'rgba(226,75,74,0.18)' : 'rgba(245,158,11,0.15)',
                      color: daysWaiting > 14 ? RED : AMBER,
                    }}>
                      {daysWaiting > 14 ? 'Urgent' : 'Review'}
                    </div>
                    <ChevronRight size={14} color={TEXT_TERTIARY} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 0' }}>
              <CheckCircle size={16} color={GREEN} />
              <span style={{ fontSize: 13, color: TEXT_MUTED }}>No clients waiting</span>
            </div>
          )}
        </div>

        {/* Right: Available caregivers */}
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16 }}>
            Available caregivers
          </div>
          {availableCaregivers.length > 0 ? (
            <div>
              {availableCaregivers.slice(0, 5).map((cgiver, i) => (
                <Link
                  key={cgiver.id}
                  href={`/agency/caregivers`}
                  className="hover-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: i < 4 ? `1px solid ${CARD_BORDER}` : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: GOLD_GRADIENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: '#0D1728',
                  }}>
                    {getInitials(cgiver.first_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY }}>{cgiver.first_name} {cgiver.last_name?.[0]}.</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{cgiver.role || cgiver.specializations?.[0] || 'Caregiver'}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px 0' }}>
              <span style={{ fontSize: 13, color: TEXT_MUTED, display: 'block', marginBottom: 8 }}>No available caregivers</span>
              <Link href="/agency/airecruit/new" style={{ fontSize: 12, color: GOLD, textDecoration: 'none' }}>Recruit →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Bench Strength Widget */}
      <div style={{ marginBottom: 24, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${CARD_BORDER}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: SERIF }}>Bench strength</span>
          <Link href="/agency/intelligence" style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>View full analysis →</Link>
        </div>
        <div style={{ maxHeight: 200, overflow: 'hidden' }}>
          <BenchStrengthWidget compact={true} />
        </div>
        {data?.bench_strength && (
          <Link href="/agency/caregivers" style={{
            display: 'block', padding: '10px 18px', fontSize: 11, color: GOLD,
            textDecoration: 'none', borderTop: `1px solid ${CARD_BORDER}`,
            background: 'rgba(201,151,58,0.04)',
          }}>
            View all skill categories →
          </Link>
        )}
      </div>

      {/* ZONE 5: INTELLIGENCE + TRIAGE */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Triage narrative */}
          <div style={{
            background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.15)',
            borderRadius: 12, padding: 20, gridColumn: isMobile ? '1' : 'span 1',
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: GOLD, textTransform: 'uppercase', marginBottom: 12 }}>
              Overnight triage
            </div>
            <TriageNarrative />
          </div>

          {/* Credentials expiring */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: TEXT_PRIMARY }}>{expiringCredCount}</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>Credentials expiring (60d)</div>
          </div>

          {/* AIRecruit results */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: PURPLE }}>{stats?.airecruit_results || 0}</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>AIRecruit results ready</div>
          </div>

          {/* Fill rate */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: fillRate > 50 ? GREEN : AMBER }}>{fillRate}%</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>Placement fill rate (30d)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
