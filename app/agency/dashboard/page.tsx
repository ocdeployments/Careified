'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Zap,
  MoreHorizontal,
  X,
  ChevronRight,
} from 'lucide-react'

const PAGE_BG = '#080F1E'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const CARD_BORDER_GOLD = 'rgba(201,151,58,0.35)'
const GOLD = '#C9973A'
const GL = '#E8B86D'
const GLX = 'rgba(201,151,58,0.15)'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_MUTED = 'rgba(255,255,255,0.55)'
const TEXT_TERTIARY = 'rgba(255,255,255,0.3)'
const RED = '#E24B4A'
const AMBER = '#F59E0B'
const GREEN = '#22C55E'
const NAV_BG = '#0D1B3E'
const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'DM Sans', sans-serif"

type DashboardStats = {
  total_clients: number
  unmatched_clients: number
  total_caregivers: number
  roster_claimed: number
  pipeline_count: number
  airecruit_results: number
  agency_name?: string
  plan_tier?: string
  subscription_status?: string
}

type ActionItem = {
  priority: string
  title: string
  cta_href: string
}

type Client = {
  id: string
  client_first_name: string
  service_type: string
  created_at: string
  matched_caregiver_id?: string
}

type DashboardData = {
  stats: DashboardStats
  action_items: ActionItem[]
  clients?: Client[]
  expiring_credentials?: { expiry_date: string }[]
}

export default function AgencyDashboard() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [rosterSkills, setRosterSkills] = useState<{
    dementia: number
    french: number
    livein: number
    wound: number
  }>({ dementia: 0, french: 0, livein: 0, wound: 0 })
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
      fetch('/api/agency/dashboard', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/agency/clients', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ clients: [] })),
      fetch('/api/roster/list', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ caregivers: [] })),
    ]).then(([dashResp, clientsResp, rosterResp]) => {
      setData({ ...dashResp, clients: clientsResp.clients || [] })

      // Compute bench strength from roster
      if (rosterResp.caregivers) {
        const skills = { dementia: 0, french: 0, livein: 0, wound: 0 }
        rosterResp.caregivers.forEach((c: any) => {
          const specs = c.specializations || []
          const langs = c.languages || []
          const avail = c.availability_status
          if (specs.some((s: string) => s.toLowerCase().includes('dementia'))) skills.dementia++
          if (langs.some((l: string) => l.toLowerCase().includes('french'))) skills.french++
          if (avail === 'live_in' || avail === 'live-in') skills.livein++
          if (specs.some((s: string) => s.toLowerCase().includes('wound'))) skills.wound++
        })
        setRosterSkills(skills)
      }

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isLoaded])

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', background: PAGE_BG, padding: '24px 32px' }}>
        <div style={{ display: 'grid', gap: 40 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: CARD_BG, borderRadius: 12, height: 60 }} />
          ))}
        </div>
      </div>
    )
  }

  const firstName = user?.firstName || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const stats = data?.stats
  const clients = data?.clients || []
  const credentials = data?.expiring_credentials || []

  const isMobile = windowWidth < 768

  // Triage cards logic
  const hasUnmatched = (stats?.unmatched_clients || 0) > 0
  const hasCredentials = (credentials?.length || 0) > 0
  const hasAIRecruit = (stats?.airecruit_results || 0) > 0

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, padding: isMobile ? '16px' : '24px 32px', fontFamily: SANS }}>
      <style>{`
        @media (max-width: 768px) {
          .zone { margin-bottom: 32px !important; }
          .stat-cards { grid-template-columns: 1fr 1fr !important; }
          .two-cols { grid-template-columns: 1fr !important; }
          .chips-scroll { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ZONE 1: MORNING BRIEFING */}
      <div className="zone" style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, color: TEXT_PRIMARY }}>{greeting}, {firstName}.</div>
          <div style={{ fontSize: 15, color: TEXT_MUTED, marginTop: 4 }}>Here's your triage for today.</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {hasUnmatched && (
            <Link href="/agency/clients?tab=unmatched" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 10, fontSize: 13, cursor: 'pointer', textDecoration: 'none',
              background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.4)', color: TEXT_PRIMARY
            }}>
              <span style={{ color: RED }}>{stats?.unmatched_clients}</span> clients without coverage
              <ChevronRight size={14} />
            </Link>
          )}
          {hasCredentials && (
            <Link href="/agency/roster?tab=credentials" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 10, fontSize: 13, cursor: 'pointer', textDecoration: 'none',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', color: TEXT_PRIMARY
            }}>
              <span style={{ color: AMBER }}>{credentials.length}</span> credentials expiring soon
              <ChevronRight size={14} />
            </Link>
          )}
          {hasAIRecruit && (
            <Link href="/agency/airecruit?tab=results" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 10, fontSize: 13, cursor: 'pointer', textDecoration: 'none',
              background: GLX, border: '1px solid rgba(201,151,58,0.4)', color: TEXT_PRIMARY
            }}>
              <span style={{ color: GOLD }}>{stats?.airecruit_results}</span> AIRecruit results ready
              <ChevronRight size={14} />
            </Link>
          )}
          {!hasUnmatched && !hasCredentials && !hasAIRecruit && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 10, fontSize: 13, cursor: 'pointer', textDecoration: 'none',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: TEXT_PRIMARY
            }}>
              <span style={{ color: GREEN }}>All caught up</span>
            </div>
          )}
        </div>
      </div>

      {/* ZONE 2: AGENCY SNAPSHOT */}
      <div className="zone" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: TEXT_TERTIARY, textTransform: 'uppercase', marginBottom: 12 }}>AGENCY SNAPSHOT</div>

        <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Link href="/agency/clients" style={{ textDecoration: 'none' }}>
            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: '20px 24px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}>
              <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500, marginBottom: 8 }}>Clients</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: SERIF }}>{stats?.total_clients || 0}</div>
              <div style={{ fontSize: 12, color: (stats?.unmatched_clients || 0) > 0 ? RED : TEXT_MUTED, marginTop: 4 }}>
                {(stats?.unmatched_clients || 0) > 0 ? `${stats?.unmatched_clients} need coverage` : 'All covered'}
              </div>
            </div>
          </Link>

          <Link href="/agency/caregivers" style={{ textDecoration: 'none' }}>
            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: '20px 24px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}>
              <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500, marginBottom: 8 }}>Caregivers</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: SERIF }}>{stats?.roster_claimed || 0}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{stats?.total_caregivers || 0} in platform</div>
            </div>
          </Link>

          <Link href="/agency/shortlist" style={{ textDecoration: 'none' }}>
            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: '20px 24px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}>
              <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500, marginBottom: 8 }}>Pipeline</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: SERIF }}>{stats?.pipeline_count || 0}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>shortlisted</div>
            </div>
          </Link>

          <Link href="/agency/airecruit" style={{ textDecoration: 'none' }}>
            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: '20px 24px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}>
              <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500, marginBottom: 8 }}>AIRecruit</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: SERIF }}>{stats?.airecruit_results || 0}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>results ready</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ZONE 3: TWO-WORLD VIEW */}
      <div className="zone" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: TEXT_TERTIARY, textTransform: 'uppercase', marginBottom: 16 }}>OPERATIONS</div>

        <div className="two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* LEFT: CLIENTS */}
          <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16 }}>Clients</div>

            {clients.length > 0 ? (
              <div>
                {clients.slice(0, 5).map((client, i) => {
                  const created = new Date(client.created_at)
                  const now = new Date()
                  const daysOld = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
                  const hasCaregiver = !!client.matched_caregiver_id

                  let statusColor = GREEN
                  let statusText = 'Active'
                  if (!hasCaregiver && daysOld > 14) {
                    statusColor = RED
                    statusText = '14d unmatched'
                  } else if (!hasCaregiver && daysOld > 7) {
                    statusColor = AMBER
                    statusText = '7d unmatched'
                  }

                  return (
                    <Link key={client.id} href={`/agency/clients/${client.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${CARD_BORDER}` : 'none', textDecoration: 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: TEXT_PRIMARY }}>{client.client_first_name}</div>
                        <div style={{ fontSize: 12, color: TEXT_MUTED }}>{client.service_type || 'Standard care'}</div>
                      </div>
                      <div style={{ fontSize: 12, color: statusColor }}>{statusText}</div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 8 }}>No active clients yet</div>
                <Link href="/agency/clients/new" style={{ fontSize: 12, color: GL, textDecoration: 'none' }}>Add client</Link>
              </div>
            )}
          </div>

          {/* RIGHT: BENCH STRENGTH */}
          <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16 }}>Bench Strength</div>

            {[
              { label: 'Dementia Care', count: rosterSkills.dementia, key: 'dementia' },
              { label: 'French-Speaking', count: rosterSkills.french, key: 'french' },
              { label: 'Live-in Available', count: rosterSkills.livein, key: 'livein' },
              { label: 'Wound Care', count: rosterSkills.wound, key: 'wound' },
            ].map(skill => {
              const pct = stats?.roster_claimed ? Math.min((skill.count / stats.roster_claimed) * 100, 100) : 0

              return (
                <div key={skill.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>{skill.label}</span>
                    <span style={{ fontSize: 12, color: skill.count > 0 ? GOLD : TEXT_TERTIARY, background: skill.count > 0 ? GLX : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>{skill.count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: GOLD, width: `${pct}%`, transition: 'width 0.3s' }} />
                  </div>
                  {skill.count === 0 && (
                    <Link href="/agency/airecruit/new" style={{ fontSize: 12, color: GL, textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>Recruit now</Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ZONE 4: OVERNIGHT TRIAGE NARRATIVE */}
      <div className="zone" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: TEXT_TERTIARY, textTransform: 'uppercase', marginBottom: 16 }}>OVERNIGHT TRIAGE</div>

        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER_GOLD}`, borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 15, color: TEXT_PRIMARY, lineHeight: 1.65 }}>
            Triage ran overnight. <strong>{stats?.airecruit_results || 0}</strong> caregivers were screened via AIRecruit — <strong>0</strong> scored above threshold. <strong>{stats?.unmatched_clients || 0}</strong> client placements are pending review.
          </div>
        </div>
      </div>

      {/* ZONE 5: COMING UP */}
      <div className="zone" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: TEXT_TERTIARY, textTransform: 'uppercase', marginBottom: 16 }}>COMING UP - NEXT 7 DAYS</div>

        <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {credentials.length > 0 && (
            <Link href="/agency/roster?tab=credentials" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 20, fontSize: 13, border: '1px solid rgba(245,158,11,0.4)',
              background: 'rgba(245,158,11,0.12)', color: TEXT_PRIMARY, textDecoration: 'none'
            }}>
              <span style={{ color: AMBER }}>{credentials.length}</span> credential renewals due
            </Link>
          )}
          {(stats?.airecruit_results || 0) > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 20, fontSize: 13, border: '1px solid rgba(201,151,58,0.4)',
              background: GLX, color: TEXT_PRIMARY
            }}>
              <span style={{ color: GOLD }}>AIRecruit</span> results batch ready
            </div>
          )}
          {(stats?.pipeline_count || 0) === 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 20, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: TEXT_MUTED
            }}>
              No placements ending this week
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
