'use client'

import { useState, useEffect } from 'react'

const N = '#0D1B3E'
const G = '#C9973A'
const W = '#F5F0E8'
const S = '#080F1E'
const B = 'rgba(255,255,255,0.08)'
const M = 'rgba(255,255,255,0.55)'
const C = 'rgba(255,255,255,0.04)'

interface DashboardData {
  stats: {
    total_caregivers?: number
    roster_claimed?: number
    total_clients?: number
    unmatched_clients?: number
    pipeline_count?: number
    airecruit_results?: number
  }
  pipeline?: { discovered?: number; contacted?: number; interviewing?: number; placed?: number; inactive?: number } | null
  expiring_credentials?: { caregiver_id: string; caregiver_name: string; certification: string; expiry_date: string }[]
}

export default function IntelligenceClient() {
  const [activeTab, setActiveTab] = useState<'roi' | 'placements' | 'learning' | 'trends'>('roi')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const stats = data?.stats || {}
  const pipeline = data?.pipeline
  const expiringCredentials = data?.expiring_credentials || []

  const pipelineTotal = (pipeline?.discovered || 0) + (pipeline?.contacted || 0) + (pipeline?.interviewing || 0)

  const renderTabContent = () => {
    if (activeTab === 'roi') {
      if (loading) {
        return <div style={{ padding: 48, textAlign: 'center', color: M }}>Loading...</div>
      }

      const signals = []
      if (expiringCredentials.length > 0) {
        signals.push(`⏰ ${expiringCredentials.length} credentials expiring in the next 60 days`)
      }
      const rosterPending = (stats.total_caregivers || 0) - (stats.roster_claimed || 0)
      if (rosterPending > 0) {
        signals.push(`${rosterPending} caregivers haven't claimed their profiles yet`)
      }
      if ((stats.unmatched_clients || 0) > 0) {
        signals.push(`${stats.unmatched_clients} clients currently unmatched`)
      }
      const isHealthy = signals.length === 0

      return (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Section A: Key numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: W }}>{stats.total_caregivers ?? 0}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: M, textTransform: 'uppercase', marginTop: 4 }}>Caregivers on platform</div>
            </div>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: W }}>{pipelineTotal}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: M, textTransform: 'uppercase', marginTop: 4 }}>Active pipeline</div>
            </div>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: W }}>{pipeline?.placed ?? 0}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: M, textTransform: 'uppercase', marginTop: 4 }}>Placements confirmed</div>
            </div>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: W }}>{stats.airecruit_results ?? 0}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: M, textTransform: 'uppercase', marginTop: 4 }}>AIRecruit campaigns</div>
            </div>
          </div>

          {/* Section B: What Careified caught */}
          <div style={{ background: C, borderRadius: 12, border: `1px solid ${B}`, borderLeft: `4px solid ${G}`, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: W, marginBottom: 16 }}>Careified is monitoring your roster</div>
            {isHealthy ? (
              <div style={{ fontSize: 13, color: '#22C55E', padding: '6px 0' }}>✓ Everything looks healthy — no issues detected</div>
            ) : (
              <div style={{ display: 'grid', gap: 4 }}>
                {signals.map((signal, i) => (
                  <div key={i} style={{ fontSize: 13, color: W, padding: '6px 0', borderBottom: i < signals.length - 1 ? `1px solid ${B}` : 'none' }}>{signal}</div>
                ))}
              </div>
            )}
          </div>

          {/* Section C: Platform usage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: W, marginBottom: 16 }}>Roster activity</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Total caregivers', value: stats.total_caregivers ?? 0 },
                  { label: 'Claimed profiles', value: stats.roster_claimed ?? 0 },
                  { label: 'Pending claim', value: (stats.total_caregivers || 0) - (stats.roster_claimed || 0) },
                  { label: 'Shortlisted', value: stats.pipeline_count ?? 0 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: M }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: W }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C, border: `1px solid ${B}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: W, marginBottom: 16 }}>Client activity</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Total clients', value: stats.total_clients ?? 0 },
                  { label: 'Unmatched', value: stats.unmatched_clients ?? 0 },
                  { label: 'AIRecruit campaigns', value: stats.airecruit_results ?? 0 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: M }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: W }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section D: Value statement */}
          <div style={{ background: N, borderRadius: 8, padding: '16px 24px', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: G }}>Every placement tracked here makes your next match smarter.</span>
          </div>
        </div>
      )
    }

    // Placeholder for other tabs
    return (
      <div style={{ padding: 64, textAlign: 'center', background: C, borderRadius: 12, border: `1px solid ${B}` }}>
        <div style={{ fontSize: 14, color: M }}>Coming soon</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: S, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: N, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: W, margin: '0 0 8px' }}>Intelligence</h1>
            <p style={{ fontSize: 13, color: M, margin: 0 }}>Your platform performance at a glance</p>
          </div>
          <a href="#" style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${G}`, color: G, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Share report →</a>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[
            { key: 'roi', label: 'ROI summary' },
            { key: 'placements', label: 'Placement outcomes' },
            { key: 'learning', label: 'Match learning' },
            { key: 'trends', label: 'Trends' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 500,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #C9973A' : '2px solid transparent',
                color: activeTab === tab.key ? '#C9973A' : M,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {renderTabContent()}
      </div>
    </div>
  )
}
