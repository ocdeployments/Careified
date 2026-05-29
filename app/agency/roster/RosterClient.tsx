'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Upload, RefreshCw, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'

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

interface RosterClientProps {
  agencyId: string
  agencyName: string
}

const PAGE_BG = '#080F1E'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const GOLD = '#C9973A'
const GOLD_LIGHT = '#E8B86D'
const NAVY = '#0D1B3E'
const TEXT = '#F5F0E8'
const MUTED = 'rgba(255,255,255,0.55)'
const FONT = "'DM Sans', sans-serif"
const SERIF = "'DM Serif Display', serif"

export default function RosterClient({ agencyId, agencyName }: RosterClientProps) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'onboarding' | 'credentials' | 'availability'>('all')

  useEffect(() => { fetchRoster() }, [agencyId])

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
    } catch {
      setSuccess('Failed to send invite')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string, tokenStatus?: string) => {
    const isPending = status === 'agency_built' || tokenStatus === 'pending'
    const isClaimed = status === 'claimed'
    if (isClaimed) return { label: 'Profile Claimed', bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' }
    if (isPending) return { label: 'Invite Sent', bg: 'rgba(201,151,58,0.15)', color: GOLD, border: 'rgba(201,151,58,0.3)' }
    return { label: 'Link Expired', bg: 'rgba(255,255,255,0.06)', color: MUTED, border: CARD_BORDER }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysUntil = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const isOnboarding = (cg: Caregiver) =>
    cg.profile_status === 'stub' || cg.profile_status === 'invited' || cg.profile_status === 'incomplete'

  const hasExpiringCerts = (cg: Caregiver) =>
    cg.certifications && cg.certifications.length > 0

  const hasRecentAvailabilityChange = (cg: Caregiver) => {
    if (!cg.updated_at) return false
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(cg.updated_at) > sevenDaysAgo
  }

  if (loading) {
    return (
      <div style={{ background: PAGE_BG, minHeight: '100vh', fontFamily: FONT }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '32px 24px', borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, margin: '0 0 8px' }}>Your Roster</h1>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: PAGE_BG, minHeight: '100vh', fontFamily: FONT }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '32px 24px', borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, margin: '0 0 8px' }}>Your Roster</h1>
          <p style={{ fontSize: 16, color: MUTED, margin: '0 0 20px' }}>
            Manage your caregivers and track their profile claims
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/agency/roster/add"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                color: NAVY, textDecoration: 'none', borderRadius: 8,
                fontWeight: 600, fontSize: 14,
              }}
            >
              <Plus size={18} />
              Add Caregiver
            </Link>
            <Link
              href="/agency/roster/import"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', background: 'transparent',
                color: TEXT, textDecoration: 'none', borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.2)`,
                fontWeight: 500, fontSize: 14,
              }}
            >
              <Upload size={18} />
              Import CSV
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${CARD_BORDER}`, marginBottom: 24 }}>
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
                padding: '12px 20px', fontSize: 14, fontWeight: 500,
                fontFamily: FONT, background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? `2px solid ${GOLD}` : '2px solid transparent',
                color: activeTab === tab.key ? GOLD : MUTED,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.15)',
            color: '#22C55E',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8, marginBottom: 20, fontSize: 14,
          }}>
            {success}
          </div>
        )}

        {caregivers.length === 0 ? (
          <div style={{
            background: CARD_BG, borderRadius: 16,
            padding: '48px 24px', textAlign: 'center',
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <Users size={48} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 16 }} />
            <h2 style={{ fontFamily: SERIF, fontSize: 20, color: TEXT, margin: '0 0 8px' }}>
              No caregivers yet
            </h2>
            <p style={{ color: MUTED, fontSize: 14, margin: '0 0 24px' }}>
              Add your first caregiver or import your existing roster.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                href="/agency/roster/add"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  color: NAVY, textDecoration: 'none', borderRadius: 8,
                  fontWeight: 600, fontSize: 14,
                }}
              >
                <Plus size={18} />
                Add Caregiver
              </Link>
              <Link
                href="/agency/roster/import"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', background: 'transparent',
                  color: TEXT, textDecoration: 'none', borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.2)`,
                  fontWeight: 500, fontSize: 14,
                }}
              >
                <Upload size={18} />
                Import CSV
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase' }}>Added</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: MUTED, textTransform: 'uppercase' }}>Actions</th>
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
                    <tr key={cg.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: TEXT, fontSize: 14 }}>
                          {cg.first_name} {cg.last_name}
                        </div>
                        <div style={{ fontSize: 12, color: MUTED }}>{cg.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                        {cg.claim_status === 'claimed' ? 'Active' : 'Pending'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: MUTED }}>
                        {formatDate(cg.created_at)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {cg.claim_status === 'claimed' ? (
                          <Link
                            href={`/profile/${cg.id}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', fontSize: 13,
                              color: GOLD, textDecoration: 'none', fontWeight: 500,
                            }}
                          >
                            <Eye size={16} />
                            View Profile
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleResendInvite(cg.id)}
                            disabled={actionLoading === cg.id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', fontSize: 13,
                              color: GOLD, background: 'transparent', border: 'none',
                              cursor: actionLoading === cg.id ? 'not-allowed' : 'pointer',
                              fontWeight: 500, opacity: actionLoading === cg.id ? 0.6 : 1,
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
    </div>
  )
}