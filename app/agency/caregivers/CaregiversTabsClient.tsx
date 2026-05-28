'use client'

import { useState, useEffect } from 'react'
import { ClientSearch } from '@/components/search/ClientSearch'
import { SearchFilters } from '@/lib/types/search'

const DEFAULT_FILTERS: SearchFilters = {
  specialties: [],
  credentials: [],
  placementTypes: [],
  languages: [],
  daysAvailable: [],
  shiftTypes: [],
  liftExperience: [],
  sortBy: 'score',
  page: 1,
  limit: 20,
}

const N = '#0D1B3E'
const G = '#C9973A'
const W = '#FFFFFF'
const S = '#F8F9FC'
const B = '#E2E8F0'
const M = '#64748B'
const G_LIGHT = '#22C55E'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
  photo_url?: string
  specializations?: string[]
  city?: string
  availability_status?: string
  claim_status?: string
  profile_status?: string
  updated_at?: string
}

interface TopMatch {
  id: string
  first_name: string
  last_name: string
  aggregate_score?: number
  photo_url?: string
  role?: string
}

export default function CaregiversTabsClient() {
  const [activeTab, setActiveTab] = useState<'search' | 'available' | 'placed' | 'atrisk'>('search')
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [topMatches, setTopMatches] = useState<TopMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'available' || activeTab === 'atrisk') {
      setLoading(true)
      fetch('/api/roster/list')
        .then(r => r.json())
        .then(data => {
          setCaregivers(data.caregivers || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    if (activeTab === 'placed') {
      setLoading(true)
      fetch('/api/agency/dashboard')
        .then(r => r.json())
        .then(data => {
          setTopMatches(data.top_matches || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [activeTab])

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Unknown'
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  const getInitials = (first?: string, last?: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
  }

  const availableCaregivers = caregivers.filter(cg => {
    const isActive = cg.profile_status === 'active' || cg.claim_status === 'claimed'
    const isAvailable = cg.availability_status === 'available' || cg.availability_status === 'open_to_work'
    return isActive && isAvailable
  })

  const atRiskCaregivers = caregivers.filter(cg => {
    if (!cg.updated_at || cg.profile_status !== 'active') return false
    const diff = Date.now() - new Date(cg.updated_at).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days > 14
  })

  const renderTabContent = () => {
    if (activeTab === 'search') {
      return <ClientSearch initialFilters={DEFAULT_FILTERS} />
    }

    if (activeTab === 'available') {
      if (loading) {
        return <div style={{ padding: 48, textAlign: 'center', color: M }}>Loading...</div>
      }
      if (availableCaregivers.length === 0) {
        return (
          <div style={{ padding: 48, textAlign: 'center', background: W, borderRadius: 12, border: `1px solid ${B}` }}>
            <div style={{ fontSize: 14, color: M }}>No caregivers available right now — check back after your roster is active</div>
          </div>
        )
      }
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          {availableCaregivers.map(cg => (
            <div key={cg.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: W, borderRadius: 12, border: `1px solid ${B}` }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: S, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: N, flexShrink: 0, overflow: 'hidden' }}>
                {cg.photo_url ? (
                  <img src={cg.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(cg.first_name, cg.last_name)
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: N }}>{cg.first_name} {cg.last_name}</div>
                <div style={{ fontSize: 12, color: M }}>{cg.specializations?.slice(0, 2).join(' · ') || 'No specialty'}</div>
                <div style={{ fontSize: 12, color: M }}>{cg.city || 'Location unknown'}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#DCFCE7', color: '#16A34A' }}>
                {cg.availability_status === 'open_to_work' ? 'Open to work' : 'Available'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`/profile/${cg.id}`} style={{ fontSize: 13, color: G, textDecoration: 'none', fontWeight: 500 }}>View profile →</a>
                <a href="/agency/clients" style={{ fontSize: 13, color: N, textDecoration: 'none', fontWeight: 500 }}>Place with client →</a>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'placed') {
      if (loading) {
        return <div style={{ padding: 48, textAlign: 'center', color: M }}>Loading...</div>
      }
      if (topMatches.length === 0) {
        return (
          <div style={{ padding: 48, textAlign: 'center', background: W, borderRadius: 12, border: `1px solid ${B}` }}>
            <div style={{ fontSize: 14, color: M }}>No previous placements on record yet</div>
          </div>
        )
      }
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          {topMatches.map(cg => (
            <div key={cg.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: W, borderRadius: 12, border: `1px solid ${B}` }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: S, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: N, flexShrink: 0, overflow: 'hidden' }}>
                {cg.photo_url ? (
                  <img src={cg.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(cg.first_name, cg.last_name)
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: N }}>{cg.first_name} {cg.last_name}</div>
                <div style={{ fontSize: 12, color: M }}>{cg.role || 'Caregiver'}</div>
              </div>
              <a href={`/agency/airecruit/new?caregiver=${cg.id}`} style={{ fontSize: 13, color: G, textDecoration: 'none', fontWeight: 500 }}>Re-engage →</a>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'atrisk') {
      if (loading) {
        return <div style={{ padding: 48, textAlign: 'center', color: M }}>Loading...</div>
      }
      if (atRiskCaregivers.length === 0) {
        return (
          <div style={{ padding: 48, textAlign: 'center', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: 14, color: G_LIGHT, fontWeight: 500 }}>✓ All your active caregivers are engaged</span>
          </div>
        )
      }
      return (
        <div style={{ background: W, borderRadius: 12, border: `1px solid ${B}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: S, borderBottom: `1px solid ${B}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: M, textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: M, textTransform: 'uppercase' }}>Last active</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: M, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: M, textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {atRiskCaregivers.map(cg => (
                <tr key={cg.id} style={{ borderBottom: `1px solid ${B}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: N }}>{cg.first_name} {cg.last_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: M }}>{formatRelativeTime(cg.updated_at)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: M }}>{cg.profile_status}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <a href={`/profile/${cg.id}`} style={{ fontSize: 13, color: G, textDecoration: 'none', fontWeight: 500 }}>Reach out →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: S, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: N, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: W, margin: '0 0 8px' }}>Caregivers</h1>
          <p style={{ fontSize: 13, color: M, margin: 0 }}>Search the platform or manage your bench</p>
        </div>
      </div>

      <div style={{ background: W, borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0 }}>
          {[
            { key: 'search', label: 'Search' },
            { key: 'available', label: 'Available now' },
            { key: 'placed', label: 'Previously placed' },
            { key: 'atrisk', label: 'At risk' },
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
                color: activeTab === tab.key ? '#C9973A' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {renderTabContent()}
      </div>
    </div>
  )
}
