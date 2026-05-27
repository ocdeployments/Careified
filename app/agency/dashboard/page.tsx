'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import CommandBar from '@/components/agency/CommandBar'
import ProfileNudge from '@/components/agency/ProfileNudge'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const N = '#0D1B3E'
const G = '#C9973A'
const GL = '#E8B86D'
const M = '#64748B'
const BG = '#F8F9FC'
const B = '#E2E8F0'
const S = "'DM Sans', sans-serif"
const SERIF = "'DM Serif Display', Georgia, serif"

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
  profileCompletion?: number
  currentPlan?: { name: string; daysRemaining: number; modules: string[] }
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

function CounterAnimation({ value, duration = 600 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const stepDuration = duration / steps
    let current = 0
    const interval = setInterval(() => {
      current++
      const progress = current / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))
      if (current >= steps) clearInterval(interval)
    }, stepDuration)
    return () => clearInterval(interval)
  }, [value, duration])

  return <span>{displayValue}</span>
}

function FadeInSection({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {children}
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

  const agency = { name: dashboardData?.stats?.roster_total ? 'Your Agency' : null }
  const clients: any[] = []
  const shortlistCount = dashboardData?.stats?.shortlist_total || 0
  const stats = { active_clients: dashboardData?.stats?.clients_total || 0, matched_clients: 0, total_reviews: 0, positive_reviews: 0 }
  const recentReviews: any[] = []
  const recentMatches: any[] = []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const unmatched = clients?.filter((c: any) => !c.matched_caregiver_id) || []

  const pipeline = dashboardData?.pipeline
  const pipelineTotal = pipeline ? (pipeline.discovered + pipeline.contacted + pipeline.interviewing + pipeline.placed + pipeline.inactive) : 0
  const getPipelineWidth = (val: number) => pipelineTotal > 0 ? Math.max((val / pipelineTotal) * 100, 5) : 0

  const cardShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)'

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: S }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
      `}</style>

      {/* COMMAND BAR */}
      <FadeInSection delay={0}>
        <div style={{
          background: '#0A1628',
          padding: '20px 32px',
          borderBottom: `2px solid ${G}`,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{greeting}</p>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, color: '#F5F0E8', margin: '0 0 24px' }}>
              {agency?.name || 'Your Agency'}
            </h1>

            <div style={{
              background: '#0D1B3E',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid rgba(201,151,58,0.3)',
            }}>
              <input
                type="text"
                placeholder="Ask anything — find a caregiver, check your roster, review pipeline..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F5F0E8',
                  fontSize: 15,
                  fontFamily: S,
                }}
              />
            </div>
            <button style={{
              marginTop: 12,
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: G,
              color: N,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: S,
            }}>
              Send
            </button>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['Roster status', 'Unmatched clients', 'AIRecruit results', "Who's in interviewing?"].map(s => (
                <span key={s} style={{
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 16,
                  background: 'rgba(201,151,58,0.15)',
                  color: GL,
                  cursor: 'pointer',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* HERO STATS ROW */}
      <FadeInSection delay={100}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'CAREGIVERS', value: dashboardData?.stats?.roster_total || 0 },
              { label: 'PLACEMENTS', value: pipeline?.placed || 0 },
              { label: 'SHORTLISTED', value: dashboardData?.stats?.shortlist_total || 0 },
              { label: 'AIRECRUIT', value: dashboardData?.stats?.airecruit_active || 0 },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: 16,
                boxShadow: cardShadow,
                padding: 20,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: G,
                }} />
                <div style={{
                  fontSize: 11,
                  color: M,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: N,
                  lineHeight: 1,
                }}>
                  {loading ? <Skeleton width={80} height={48} /> : <CounterAnimation value={stat.value} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* TWO-COLUMN SECTION */}
      <FadeInSection delay={200}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 24px', display: 'grid', gridTemplateColumns: '70% 30%', gap: 24 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Action Items */}
            <div style={{ background: 'white', borderRadius: 16, boxShadow: cardShadow, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${B}` }}>
                <span style={{ fontFamily: SERIF, fontSize: 18, color: N }}>What needs attention</span>
              </div>
              <div>
                {dashboardData?.action_items && dashboardData.action_items.length > 0 ? (
                  dashboardData.action_items.map((item, i) => (
                    <Link key={i} href={item.cta_href} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: `1px solid ${B}`,
                      borderLeft: `4px solid ${item.priority === 'high' || item.priority === 'urgent' ? G : N}`,
                      textDecoration: 'none',
                      background: 'transparent',
                      transition: 'background 0.15s',
                    }}>
                      <span style={{ fontSize: 14, color: N, fontWeight: 500 }}>{item.title}</span>
                      <span style={{ color: G, fontSize: 18 }}>→</span>
                    </Link>
                  ))
                ) : (
                  <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                    <span style={{ color: '#16A34A', fontSize: 14 }}>✓ Everything is up to date</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div style={{ background: 'white', borderRadius: 16, boxShadow: cardShadow, padding: 20 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: N, marginBottom: 16 }}>Pipeline</div>
              {pipeline && pipelineTotal > 0 ? (
                <>
                  <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${getPipelineWidth(pipeline.discovered)}%`, background: 'linear-gradient(90deg, #0D1B3E, #1E3A8A)' }} />
                    <div style={{ width: `${getPipelineWidth(pipeline.contacted)}%`, background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)' }} />
                    <div style={{ width: `${getPipelineWidth(pipeline.interviewing)}%`, background: GL }} />
                    <div style={{ width: `${getPipelineWidth(pipeline.placed)}%`, background: G }} />
                    <div style={{ width: `${getPipelineWidth(pipeline.inactive)}%`, background: '#E2E8F0' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: M }}>
                    <span>{pipeline.discovered} discovered</span>
                    <span>{pipeline.contacted} contacted</span>
                    <span>{pipeline.interviewing} interviewing</span>
                    <span>{pipeline.placed} placed</span>
                    <span>{pipeline.inactive} inactive</span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 24, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>—</div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: 16, boxShadow: cardShadow, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${B}` }}>
                <span style={{ fontFamily: SERIF, fontSize: 18, color: N }}>Recent activity</span>
              </div>
              <div style={{ maxHeight: 280, overflow: 'auto' }}>
                {(dashboardData?.recent_activity?.length === 0 && recentMatches?.length === 0 && recentReviews?.length === 0) || (loading && !dashboardData?.recent_activity?.length) ? (
                  <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                    No activity yet
                  </div>
                ) : (
                  <>
                    {dashboardData?.recent_activity?.slice(0, 5).map((a, i) => (
                      <div key={`a-${i}`} style={{ padding: '10px 20px', borderBottom: `1px solid ${B}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: N }}>
                          <strong>{a.action}</strong>
                          <span style={{ color: M, marginLeft: 4 }}>{formatRelativeTime(a.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                'Search Caregivers',
                'Add Client',
                'Start AIRecruit',
                'View Roster',
              ].map((label, i) => (
                <button
                  key={label}
                  onMouseEnter={e => e.currentTarget.style.borderColor = G}
                  onMouseLeave={e => e.currentTarget.style.borderColor = B}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1px solid ${B}`,
                    background: 'white',
                    color: N,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: S,
                    transition: 'border-color 0.15s',
                    textAlign: 'center',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* BOTTOM ROW */}
      <FadeInSection delay={300}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Agency Profile Completion */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: cardShadow, padding: 20 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: N, marginBottom: 16 }}>Agency Profile</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: M, marginBottom: 8 }}>
                <span>Profile completion</span>
                <span>{dashboardData?.profileCompletion || 0}%</span>
              </div>
              <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${dashboardData?.profileCompletion || 0}%`,
                  height: '100%',
                  background: G,
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
            <button style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${G}`,
              background: 'transparent',
              color: G,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: S,
            }}>
              Complete your profile
            </button>
          </div>

          {/* Plan Status */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: cardShadow, padding: 20 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: N, marginBottom: 16 }}>Plan Status</div>
            <div style={{ fontSize: 14, color: N, fontWeight: 600, marginBottom: 8 }}>
              {dashboardData?.currentPlan?.name || 'Professional Plan'}
            </div>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 16,
              background: 'rgba(201,151,58,0.15)',
              color: G,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}>
              {dashboardData?.currentPlan?.daysRemaining || 14} days remaining
            </div>
            <div style={{ fontSize: 13, color: M }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Active modules:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(dashboardData?.currentPlan?.modules || ['Roster', 'Matching', 'AIRecruit', 'Analytics']).map((mod, i) => (
                  <span key={i} style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: '#F1F5F9',
                    color: N,
                    fontSize: 12,
                  }}>
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Profile completion + billing nudge */}
      <ProfileNudge />
    </div>
  )
}