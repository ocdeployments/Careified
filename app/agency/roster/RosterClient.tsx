'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Upload, RefreshCw, Eye, Loader2 } from 'lucide-react'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  claim_status: string
  profile_status?: string
  created_at: string
  updated_at?: string
  availability_status?: string
  days_available?: string
  token?: string
  expires_at?: string
  claimed_at?: string
  token_status?: string
  certifications: { certification: string; expiry_date: string }[]
}

interface Certification {
  certification: string
  expiry_date: string
}

interface RosterClientProps {
  agencyId: string
  agencyName: string
}

const N = '#0D1B3E'
const G = '#C9973A'
const G_LIGHT = '#E8B86D'
const WHITE = '#FFFFFF'
const GREY = '#6B7280'
const GREEN = '#16A34A'
const S = "'DM Sans', sans-serif"

export default function RosterClient({ agencyId, agencyName }: RosterClientProps) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'onboarding' | 'credentials' | 'availability'>('all')

  useEffect(() => {
    fetchRoster()
  }, [agencyId])

  const fetchRoster = async () => {
    try {
      const res = await fetch('/api/roster/list')
      if (res.ok) {
        const data = await res.json()
        setCaregivers(data.caregivers || [])
      }
    } catch (err) {
      console.error('Failed to fetch roster:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvite = async (caregiverId: string) => {
    setActionLoading(caregiverId)
    setSuccess(null)
    try {
      const res = await fetch('/api/roster/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiver_id: caregiverId }),
      })
      if (res.ok) {
        setSuccess('Invite sent successfully')
        fetchRoster()
      } else {
        const data = await res.json()
        setSuccess(data.message || 'Failed to send invite')
      }
    } catch (err) {
      setSuccess('Failed to send invite')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string, tokenStatus?: string) => {
    const isPending = status === 'agency_built' || tokenStatus === 'pending'
    const isClaimed = status === 'claimed'

    if (isClaimed) {
      return { label: 'Profile Claimed', bg: GREEN, color: WHITE }
    }
    if (isPending) {
      return { label: 'Invite Sent', bg: G, color: WHITE }
    }
    return { label: 'Link Expired', bg: GREY, color: WHITE }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const isOnboarding = (cg: Caregiver) => {
    const ps = cg.profile_status
    return ps === 'stub' || ps === 'invited' || ps === 'incomplete'
  }

  const hasExpiringCerts = (cg: Caregiver) => {
    return cg.certifications && cg.certifications.length > 0
  }

  const hasRecentAvailabilityChange = (cg: Caregiver) => {
    if (!cg.updated_at) return false
    const updated = new Date(cg.updated_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return updated > sevenDaysAgo
  }

  const getOnboardingChecklist = (cg: Caregiver) => {
    const isComplete = cg.claim_status === 'claimed'
    const profilePct = isComplete ? '100%' : '25%'
    const vsc = 'missing'
    const refs = 0
    const ready = isComplete ? 'yes' : 'no'
    return { profile: profilePct, vsc, refs, ready }
  }

  const getCertExpiryInfo = (cg: Caregiver) => {
    if (!cg.certifications || cg.certifications.length === 0) return []
    return cg.certifications.map(cert => ({
      name: cert.certification,
      expiry: cert.expiry_date,
      days: daysUntil(cert.expiry_date)
    })).sort((a, b) => a.days - b.days)
  }

  const getCertColor = (days: number) => {
    if (days < 14) return '#E24B4A' // red
    if (days < 30) return '#F59E0B' // amber
    return '#16A34A' // green
  }

  const getAvailabilityChange = (cg: Caregiver) => {
    if (!cg.updated_at) return null
    const what = cg.availability_status || cg.days_available ? `Changed: ${cg.availability_status || cg.days_available}` : 'Updated'
    return { what, when: formatDate(cg.updated_at) }
  }

  const handleNudge = async (caregiverId: string) => {
    setActionLoading(caregiverId)
    try {
      const res = await fetch('/api/roster/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiver_id: caregiverId }),
      })
      if (res.ok) {
        setSuccess('Nudge sent successfully')
      }
    } catch {
      setSuccess('Failed to send nudge')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <>
        <div style={{ background: N, padding: '32px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#F5F0E8', margin: '0 0 8px' }}>
              Your Roster
            </h1>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: G, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } }
      `}</style>

      {/* Header */}
      <div style={{ background: N, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#F5F0E8', margin: '0 0 8px' }}>
            Your Roster
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
            Manage your caregivers and track their profile claims
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href="/agency/roster/add"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                color: N,
                textDecoration: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Plus size={18} />
              Add Caregiver
            </a>
            <a
              href="/agency/roster/import"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'transparent',
                color: WHITE,
                textDecoration: 'none',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              <Upload size={18} />
              Import CSV
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'onboarding', label: 'Onboarding' },
            { key: 'credentials', label: 'Credentials' },
            { key: 'availability', label: 'Availability changes' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: S,
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

        {success && (
          <div style={{
            padding: '12px 16px',
            background: GREEN,
            color: WHITE,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
          }}>
            {success}
          </div>
        )}

        {caregivers.length === 0 ? (
          <div style={{
            background: WHITE,
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
          }}>
            <Users size={48} style={{ color: '#CBD5E1', marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: N, margin: '0 0 8px' }}>
              No caregivers yet
            </h2>
            <p style={{ color: GREY, fontSize: 14, margin: '0 0 24px' }}>
              Add your first caregiver or import your existing roster.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a
                href="/agency/roster/add"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                  color: N,
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <Plus size={18} />
                Add Caregiver
              </a>
              <a
                href="/agency/roster/import"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: 'transparent',
                  color: N,
                  textDecoration: 'none',
                  borderRadius: 8,
                  border: `1px solid ${N}`,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                <Upload size={18} />
                Import CSV
              </a>
            </div>
          </div>
        ) : (
          <div style={{ background: WHITE, borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Added</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: GREY, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {caregivers.filter(cg => {
                  if (activeTab === 'all') return true
                  if (activeTab === 'onboarding') return isOnboarding(cg)
                  if (activeTab === 'credentials') return hasExpiringCerts(cg)
                  if (activeTab === 'availability') return hasRecentAvailabilityChange(cg)
                  return true
                }).map((cg) => {
                  const badge = getStatusBadge(cg.claim_status, cg.token_status)
                  return (
                    <tr key={cg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: N, fontSize: 14 }}>
                          {cg.first_name} {cg.last_name}
                        </div>
                        <div style={{ fontSize: 12, color: GREY }}>{cg.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#475569' }}>
                        {cg.claim_status === 'claimed' ? 'Active' : 'Pending'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: GREY }}>
                        {formatDate(cg.created_at)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {cg.claim_status === 'claimed' ? (
                          <a
                            href={`/profile/${cg.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              fontSize: 13,
                              color: N,
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                          >
                            <Eye size={16} />
                            View Profile
                          </a>
                        ) : (
                          <button
                            onClick={() => handleResendInvite(cg.id)}
                            disabled={actionLoading === cg.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              fontSize: 13,
                              color: G,
                              background: 'transparent',
                              border: 'none',
                              cursor: actionLoading === cg.id ? 'not-allowed' : 'pointer',
                              fontWeight: 500,
                              opacity: actionLoading === cg.id ? 0.6 : 1,
                            }}
                          >
                            {actionLoading === cg.id ? (
                              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                            Resend Invite
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}