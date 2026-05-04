'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const MODULE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  core:          { label: 'Core', desc: 'Search, match, clients', color: '#1D4ED8' },
  intelligence:  { label: 'Intelligence', desc: 'AI command bar, gap analysis', color: '#7C3AED' },
  airecruit:     { label: 'AIRecruit', desc: 'Outbound screening calls', color: '#0F766E' },
  receptionist:  { label: 'Receptionist', desc: 'Inbound AI call handler', color: '#B45309' },
  family_portal: { label: 'Family Portal', desc: 'Client-facing portal', color: '#BE185D' },
  white_label:   { label: 'White Label', desc: 'Agency branding', color: '#4B5563' },
}

export default function ProfileNudge() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/agency/profile-completion')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  const trialDays = data.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 32px', fontFamily: S }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Profile completion */}
        {data.pct < 100 && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: N }}>Agency profile</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Complete to improve caregiver trust</div>
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: data.pct >= 80 ? '#16A34A' : data.pct >= 50 ? G : '#DC2626' }}>
                {data.pct}%
              </div>
            </div>
            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${data.pct}%`, background: data.pct >= 80 ? '#16A34A' : data.pct >= 50 ? G : '#DC2626' }} />
            </div>
            {data.incomplete?.slice(0, 3).map((s: any) => (
              <Link key={s.id} href="/agency/settings" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, marginBottom: 6, background: '#F8FAFC', textDecoration: 'none', border: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Missing: {s.missingFields.slice(0, 2).join(', ')}{s.missingFields.length > 2 ? ` +${s.missingFields.length - 2} more` : ''}</div>
                </div>
                <span style={{ fontSize: 12, color: G }}>→</span>
              </Link>
            ))}
            <Link href="/agency/settings" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 8, background: `linear-gradient(135deg, ${G}, #E8B86D)`, color: N, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 8 }}>
              Complete profile
            </Link>
          </div>
        )}

        {/* Plan & modules */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: N }}>Your plan</div>
              <div style={{ fontSize: 12, color: '#64748B', textTransform: 'capitalize' as const }}>
                {data.plan_tier || 'Starter'} · <span style={{ color: G, fontWeight: 600 }}>{data.subscription_status === 'trial' ? 'Trial' : 'Active'}</span>
              </div>
            </div>
            {trialDays !== null && data.subscription_status === 'trial' && (
              <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: trialDays <= 7 ? '#FEF2F2' : '#FFFBEB', color: trialDays <= 7 ? '#DC2626' : '#D97706', border: `1px solid ${trialDays <= 7 ? '#FECACA' : '#FDE68A'}` }}>
                {trialDays}d left
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Active modules</div>
            {(data.modules || ['core']).map((m: string) => {
              const mod = MODULE_LABELS[m]
              if (!mod) return null
              return (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: mod.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: N }}>{mod.label}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{mod.desc}</span>
                </div>
              )
            })}
          </div>
          <Link href="/agency/billing" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 8, border: `1.5px solid ${G}`, color: G, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Manage plan
          </Link>
        </div>

      </div>
    </div>
  )
}
