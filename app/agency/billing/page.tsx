'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const MODULES = [
  { id: 'core', label: 'Core', price: 'XX', desc: 'Dashboard, caregiver search, match algorithm, client intake, shortlist', required: true, color: '#1D4ED8' },
  { id: 'intelligence', label: 'Intelligence', price: 'XX', desc: 'AI command bar, gap analysis, verify-in-call list, match scoring', required: false, color: '#7C3AED' },
  { id: 'airecruit', label: 'AIRecruit', price: 'XX', desc: 'Outbound AI screening calls, reference calls, employer verification', required: false, color: '#0F766E', usage: '$0.12/min Vapi usage' },
  { id: 'receptionist', label: 'Receptionist', price: 'XX', desc: 'Inbound AI call handler — answers, qualifies, routes, logs', required: false, color: '#B45309', usage: '$0.12/min Vapi usage', badge: 'Coming soon' },
  { id: 'family_portal', label: 'Family Portal', price: 'XX', desc: 'Client-facing portal with schedule, care notes, shift tracker, billing visibility', required: false, color: '#BE185D', usage: '$XX/mo per active client' },
  { id: 'white_label', label: 'White Label', price: 'XX', desc: 'Agency branding on all communications, custom domain', required: false, color: '#4B5563' },
]

export default function BillingPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/agency/profile-completion')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const activeModules: string[] = data?.modules || ['core']
  const trialDays = data?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 30

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 4px' }}>Plan & billing</h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Manage your modules and subscription</p>
          </div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 16px', textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>Trial period</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: N }}>{trialDays} days</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>remaining</div>
          </div>
        </div>

        {/* Pricing coming soon banner */}
        <div style={{ background: N, borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8' }}>Pricing launching soon</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>All features are free during your trial. We will notify you before billing begins.</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(201,151,58,0.2)', color: G, border: '1px solid rgba(201,151,58,0.3)', flexShrink: 0 }}>
            PAYMENTS_ENABLED=false
          </span>
        </div>

        {/* Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MODULES.map(mod => {
            const active = activeModules.includes(mod.id)
            return (
              <div key={mod.id} style={{
                background: 'white', borderRadius: 14,
                border: active ? `2px solid ${mod.color}` : '1px solid #E2E8F0',
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: mod.color, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: N }}>{mod.label}</span>
                      {mod.required && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: '#F1F5F9', color: '#64748B' }}>Required</span>}
                      {mod.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: '#F0FDF4', color: '#16A34A' }}>{mod.badge}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: mod.usage ? 4 : 0 }}>{mod.desc}</div>
                    {mod.usage && <div style={{ fontSize: 11, color: '#94A3B8' }}>+ {mod.usage}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: N }}>${mod.price}<span style={{ fontSize: 12, fontWeight: 400, color: '#94A3B8' }}>/mo</span></div>
                  <div style={{ marginTop: 6 }}>
                    {active ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: active ? `${mod.color}15` : '#F1F5F9', color: mod.color, border: `1px solid ${mod.color}40` }}>Active</span>
                    ) : (
                      <button style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${G}, #E8B86D)`, color: N, cursor: 'pointer' }}>
                        Add module
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 24 }}>
          Pricing in CAD. USD pricing coming soon. Questions? <Link href="/agency/support" style={{ color: G }}>Contact us</Link>
        </p>
      </div>
    </div>
  )
}
