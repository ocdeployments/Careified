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
  created_at: string
  token?: string
  expires_at?: string
  claimed_at?: string
  token_status?: string
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
                {caregivers.map((cg) => {
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