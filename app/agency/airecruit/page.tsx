'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Phone,
  PhoneCall,
  UserCheck,
  Building2,
  Zap,
  ChevronRight,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
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

type Campaign = {
  id: string
  title: string
  status: string
  totalCandidates: number
  callsCompleted: number
  callsPending: number
  createdAt: string
}

type PipelineCandidate = {
  id: string
  name: string
  role: string
  score?: number
  recommendation?: string
  call_id?: string
  campaign_id?: string
  created_at?: string
}

type Pipeline = {
  shortlisted: PipelineCandidate[]
  screened: PipelineCandidate[]
  references: PipelineCandidate[]
  ready: PipelineCandidate[]
}

export default function AIRecruitPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/airecruit/campaigns', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ campaigns: [] })),
      fetch('/api/agency/airecruit/pipeline', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ shortlisted: [], screened: [], references: [], ready: [] })),
    ]).then(([campaignsResp, pipelineResp]) => {
      setCampaigns(campaignsResp.campaigns || campaignsResp || [])
      setPipeline(pipelineResp)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const isMobile = windowWidth < 768

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Toronto'
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', border: 'rgba(99,102,241,0.3)' }
      case 'completed': return { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' }
      default: return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return GOLD
    if (score >= 60) return AMBER
    return RED
  }

  // Calculate stats
  const totalCalls = campaigns.reduce((sum, c) => sum + (c.callsCompleted || 0), 0)
  const advanceCount = (pipeline?.ready || []).length
  const advanceRate = totalCalls > 0 ? Math.round((advanceCount / totalCalls) * 100) : 0
  const awaitingReview = (pipeline?.screened || []).length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: PAGE_BG, padding: isMobile ? '16px' : '24px 32px', fontFamily: SANS }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .skeleton { background: linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 6px; }
          .hover-row:hover { background: rgba(255,255,255,0.03) !important; cursor: pointer; }
          .hover-card:hover { border-color: ${CARD_HOVER_BORDER} !important; }
        `}</style>
        <div className="skeleton" style={{ height: 60, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
        <div className="skeleton" style={{ height: 200, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      </div>
    )
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active')

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, padding: isMobile ? '16px' : '24px 32px', fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .hover-row:hover { background: rgba(255,255,255,0.03) !important; cursor: pointer; }
        .hover-card:hover { border-color: ${CARD_HOVER_BORDER} !important; transition: border-color 150ms ease; }
      `}</style>

      {/* ZONE 1: HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: TEXT_PRIMARY }}>AIRecruit</div>
          <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>AI-powered hiring intelligence</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '8px 14px', fontSize: 12, color: TEXT_MUTED, background: 'transparent',
            border: `1px solid ${CARD_BORDER}`, borderRadius: 8, cursor: 'pointer',
          }}>
            Call history
          </button>
          <Link href="/agency/airecruit/new" style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 500, color: '#0D1728', background: GOLD_GRADIENT,
            border: 'none', borderRadius: 8, textDecoration: 'none', cursor: 'pointer',
          }}>
            + New campaign
          </Link>
        </div>
      </div>

      {/* CAPABILITY PILLS ROW */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: TEXT_MUTED, marginRight: 4 }}>Active:</span>
        {[
          { label: 'Screening calls', active: true },
          { label: 'Reference checks', active: true },
          { label: 'Employer verification', active: true },
          { label: 'QuickFill alerts', active: true },
        ].map((cap, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
            background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.2)', borderRadius: 99,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
            <span style={{ fontSize: 10, color: TEXT_MUTED }}>{cap.label}</span>
          </div>
        ))}
      </div>

      {/* STATS STRIP */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Campaigns', value: campaigns.length },
          { label: 'Calls made', value: totalCalls },
          { label: 'Advance', value: advanceCount },
          { label: 'Advance rate', value: `${advanceRate}%` },
          { label: 'Awaiting review', value: awaitingReview },
        ].map((stat, i) => (
          <div key={i} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ZONE 2: ACTIVE CAMPAIGNS */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: SERIF }}>Active campaigns</span>
          <Link href="#" style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>View all →</Link>
        </div>
        {activeCampaigns.length === 0 ? (
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 12 }}>No campaigns yet</div>
            <Link href="/agency/airecruit/new" style={{
              display: 'inline-block', padding: '8px 16px', fontSize: 12, fontWeight: 500, color: '#0D1728',
              background: GOLD_GRADIENT, borderRadius: 6, textDecoration: 'none',
            }}>
              Create your first campaign →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            {activeCampaigns.slice(0, 4).map(campaign => {
              const statusStyle = getStatusColor(campaign.status)
              const progress = campaign.totalCandidates > 0 ? (campaign.callsCompleted / campaign.totalCandidates) * 100 : 0
              return (
                <div key={campaign.id} className="hover-card" style={{
                  background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 16,
                  textDecoration: 'none', display: 'block',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>{campaign.title}</div>
                      <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>{formatDate(campaign.createdAt)}</div>
                    </div>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', fontSize: 10, fontWeight: 600,
                      background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                      borderRadius: 99, textTransform: 'capitalize',
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: TEXT_MUTED }}>Progress</span>
                      <span style={{ color: TEXT_PRIMARY }}>{campaign.callsCompleted} / {campaign.totalCandidates}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: PURPLE, borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, color: GREEN }}>Advance: {Math.round(progress)}%</span>
                      <span style={{ fontSize: 10, color: AMBER }}>Review: {campaign.callsPending}</span>
                    </div>
                    <Link href={`/agency/airecruit/${campaign.id}`} style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>
                      View results →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ZONE 3: HIRING PIPELINE */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: SERIF }}>Hiring pipeline</span>
          <Link href="/agency/shortlist" style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>View all candidates →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {/* SHORTLISTED */}
          <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shortlisted</span>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED }}>{(pipeline?.shortlisted || []).length}</span>
              </div>
            </div>
            {(pipeline?.shortlisted || []).length === 0 ? (
              <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>Shortlist caregivers to see them here</div>
            ) : (
              <div>
                {(pipeline?.shortlisted || []).slice(0, 3).map((cand, i) => (
                  <Link key={cand.id} href={`/profile/${cand.id}`} className="hover-row" style={{
                    display: 'block', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${CARD_BORDER}` : 'none', textDecoration: 'none',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY }}>{cand.name}</div>
                    <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>{cand.role}</div>
                  </Link>
                ))}
                {(pipeline?.shortlisted || []).length > 3 && (
                  <Link href="/agency/shortlist" style={{ fontSize: 10, color: GOLD, display: 'block', marginTop: 8, textDecoration: 'none' }}>
                    View all {pipeline?.shortlisted.length} →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* AI SCREENED */}
          <div style={{ background: CARD_BG, border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Screened</span>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: PURPLE }}>{(pipeline?.screened || []).length}</span>
              </div>
            </div>
            {(pipeline?.screened || []).length === 0 ? (
              <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>Run a screening campaign to start</div>
            ) : (
              <div>
                {(pipeline?.screened || []).slice(0, 3).sort((a, b) => (b.score || 0) - (a.score || 0)).map((cand, i) => (
                  <Link key={cand.call_id} href={`/agency/airecruit/${cand.campaign_id}`} className="hover-row" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${CARD_BORDER}` : 'none', textDecoration: 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY }}>{cand.name}</div>
                      <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>{cand.role}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: getScoreColor(cand.score || 0) }}>
                      {cand.score}
                    </div>
                  </Link>
                ))}
                {(pipeline?.screened || []).length > 3 && (
                  <Link href="/agency/airecruit" style={{ fontSize: 10, color: GOLD, display: 'block', marginTop: 8, textDecoration: 'none' }}>
                    View all {pipeline?.screened.length} →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* REFERENCES */}
          <div style={{ background: CARD_BG, border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>References</span>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: AMBER }}>0</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>
              Trigger reference checks from candidate profiles
            </div>
          </div>

          {/* READY TO HIRE */}
          <div style={{ background: CARD_BG, border: `1px solid rgba(34,197,94,0.2)`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready to hire</span>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: GREEN }}>{(pipeline?.ready || []).length}</span>
              </div>
            </div>
            {(pipeline?.ready || []).length === 0 ? (
              <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center', padding: '20px 0' }}>
                Top candidates will appear here
              </div>
            ) : (
              <div>
                {(pipeline?.ready || []).slice(0, 3).map((cand, i) => (
                  <div key={cand.call_id} style={{
                    padding: '8px 0', borderBottom: i < 2 ? `1px solid ${CARD_BORDER}` : 'none',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY }}>{cand.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: GREEN }}>All checks passed</span>
                      <span style={{ fontSize: 10, color: GOLD }}>{cand.score}</span>
                    </div>
                  </div>
                ))}
                {(pipeline?.ready || []).length > 3 && (
                  <div style={{ fontSize: 10, color: GOLD, marginTop: 8 }}>
                    View all {pipeline?.ready.length} →
                  </div>
                )}
                <div style={{ fontSize: 10, color: AMBER, marginTop: 8 }}>
                  Schedule interview →
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ZONE 4: AI CAPABILITIES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: SERIF }}>AI capabilities</span>
          <span style={{ fontSize: 10, color: TEXT_MUTED }}>All 4 active on your plan</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { icon: PhoneCall, name: 'Screening calls', desc: 'AI-powered voice interviews', color: GOLD, active: true, link: '/agency/airecruit/new' },
            { icon: UserCheck, name: 'Reference checks', desc: 'Automated reference verification', color: PURPLE, active: true, link: '/agency/caregivers' },
            { icon: Building2, name: 'Employer verification', desc: 'Past employment validation', color: AMBER, active: true, link: '/agency/caregivers' },
            { icon: Zap, name: 'QuickFill alerts', desc: 'Instant client-caregiver matching', color: GREEN, active: true, link: '/agency/airecruit/new?type=quickfill' },
          ].map((cap, i) => (
            <div key={i} className="hover-card" style={{
              background: CARD_BG, border: '1px solid rgba(201,151,58,0.2)', borderRadius: 12, padding: 16,
              textDecoration: 'none', display: 'block',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: `${cap.color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <cap.icon size={20} color={cap.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{cap.name}</span>
                    {cap.active && (
                      <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(34,197,94,0.15)', color: GREEN, borderRadius: 99, fontWeight: 600 }}>
                        active
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED }}>{cap.desc}</div>
                </div>
              </div>
              <Link href={cap.link} style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>
                {cap.name === 'QuickFill alerts' ? 'Create QuickFill →' : `New ${cap.name.toLowerCase().replace('checks', 'check').replace('verification', 'verify').replace('alerts', 'alert')} →`}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}