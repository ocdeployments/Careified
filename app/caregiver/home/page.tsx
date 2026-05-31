'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useWindowSize } from '@/lib/hooks/useWindowSize'
import Link from 'next/link'
import {
  Eye, Bookmark, TrendingUp, ChevronRight,
  CheckCircle, AlertCircle, User
} from 'lucide-react'

const BG = '#080F1E'
const CARD = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'
const GOLD = '#C9973A'
const GOLD_L = '#E8B86D'
const TEXT = '#F5F0E8'
const MUTED = 'rgba(255,255,255,0.55)'
const TERTIARY = 'rgba(255,255,255,0.3)'
const RED = '#E24B4A'
const AMBER = '#F59E0B'
const GREEN = '#22C55E'

interface HomeData {
  caregiver: {
    first_name: string
    aggregate_score: number | null
    profile_completion_pct: number | null
    availability_status: string | null
    is_visible: boolean
  }
  activity: {
    views_7d: number
    shortlists_7d: number
    total_views: number
  }
  nudges: Array<{
    type: string
    message: string
    action_url: string
    priority: 'high' | 'medium' | 'low'
  }>
  recent_notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    read_at: string | null
    created_at: string
  }>
}

function getTierLabel(pct: number | null): { label: string; color: string; next: string | null } {
  if (!pct || pct < 50) return { label: 'Getting started', color: AMBER, next: 'Complete Steps 1–3 to go live' }
  if (pct < 68) return { label: 'Basic — Live in search', color: GREEN, next: 'Complete Steps 4–5 for Verified badge' }
  if (pct < 82) return { label: 'Verified', color: GOLD, next: 'Complete Steps 6–7 for Professional tier' }
  if (pct < 95) return { label: 'Professional', color: GOLD_L, next: 'Complete Steps 8–10 for Elite tier' }
  return { label: 'Elite', color: '#A78BFA', next: null }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CaregiverHomePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const { isMobile } = useWindowSize()
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingVisibility, setTogglingVisibility] = useState(false)

  useEffect(() => {
    if (isLoaded && !userId) router.push('/sign-in')
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (!userId) return
    fetch('/api/caregiver/home')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  async function toggleVisibility() {
    if (!data) return
    setTogglingVisibility(true)
    await fetch('/api/caregiver/visibility', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !data.caregiver.is_visible })
    })
    setData(prev => prev ? {
      ...prev,
      caregiver: { ...prev.caregiver, is_visible: !prev.caregiver.is_visible }
    } : prev)
    setTogglingVisibility(false)
  }

  const card = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: isMobile ? '16px' : '24px',
  }

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: MUTED, fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: MUTED, fontSize: 14 }}>Something went wrong. <Link href="/profile/build" style={{ color: GOLD }}>Go to profile</Link></div>
      </div>
    )
  }

  const { caregiver, activity, nudges, recent_notifications } = data
  const tier = getTierLabel(caregiver.profile_completion_pct)
  const pct = caregiver.profile_completion_pct || 0

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: isMobile ? 28 : 36, fontWeight: 400, color: TEXT, margin: 0 }}>
            {caregiver.first_name ? `Welcome back, ${caregiver.first_name}` : 'Your profile'}
          </h1>
          <p style={{ color: MUTED, fontSize: 14, margin: '8px 0 0' }}>
            Here's how your profile is performing
          </p>
        </div>

        {/* Profile status card */}
        <div style={{ ...card, marginBottom: 16, borderColor: `rgba(201,151,58,0.25)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile tier</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: tier.color }}>{tier.label}</div>
            </div>
            <button
              onClick={toggleVisibility}
              disabled={togglingVisibility}
              style={{
                background: caregiver.is_visible ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${caregiver.is_visible ? 'rgba(34,197,94,0.3)' : BORDER}`,
                borderRadius: 8,
                padding: '8px 16px',
                color: caregiver.is_visible ? GREEN : MUTED,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: caregiver.is_visible ? GREEN : MUTED }} />
              {caregiver.is_visible ? 'Visible in search' : 'Hidden from search'}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: MUTED }}>Profile completion</span>
              <span style={{ fontSize: 12, color: GOLD }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L})`, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {tier.next && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} color={GOLD} />
              <span style={{ fontSize: 13, color: MUTED }}>{tier.next}</span>
              <Link href="/profile/build" style={{ fontSize: 13, color: GOLD, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                Continue <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Activity stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Profile views', value: activity.views_7d, sub: 'last 7 days', icon: <Eye size={18} color={GOLD} /> },
            { label: 'Shortlisted', value: activity.shortlists_7d, sub: 'last 7 days', icon: <Bookmark size={18} color={GOLD} /> },
            { label: 'Total views', value: activity.total_views, sub: 'all time', icon: <User size={18} color={GOLD} /> },
          ].map(stat => (
            <div key={stat.label} style={{ ...card, textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: TEXT }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: GOLD, marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: TERTIARY }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Nudges */}
        {nudges.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 12 }}>Action needed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nudges.map((nudge, i) => (
                <Link key={i} href={nudge.action_url} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${nudge.priority === 'high' ? 'rgba(226,75,74,0.3)' : BORDER}` }}>
                  <AlertCircle size={16} color={nudge.priority === 'high' ? RED : AMBER} />
                  <span style={{ fontSize: 13, color: TEXT, flex: 1 }}>{nudge.message}</span>
                  <ChevronRight size={14} color={TERTIARY} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent notifications */}
        {recent_notifications.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>Recent activity</div>
              <Link href="/caregiver/notifications" style={{ fontSize: 12, color: GOLD, textDecoration: 'none' }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recent_notifications.slice(0, 5).map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.read_at ? TERTIARY : GOLD, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: n.read_at ? MUTED : TEXT }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: TERTIARY, marginTop: 2 }}>{formatRelativeTime(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Continue building profile', href: '/profile/build', desc: 'Add more details to strengthen your profile' },
            { label: 'View your public profile', href: '/profile/build/review', desc: 'See what agencies see when they find you' },
            { label: 'Notifications', href: '/caregiver/notifications', desc: 'View all activity and alerts' },
            { label: 'Privacy settings', href: '/settings/data-rights', desc: 'Manage your data and consent preferences' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none', ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{link.desc}</div>
              </div>
              <ChevronRight size={16} color={TERTIARY} style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
