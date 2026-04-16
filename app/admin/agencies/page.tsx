'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react'

interface Agency {
  id: string
  clerk_user_id: string
  name: string | null
  contact_first_name: string | null
  contact_last_name: string | null
  contact_email: string | null
  business_type: string | null
  city: string | null
  state: string | null
  status: string
  created_at: string
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/agencies')
      .then(r => r.json())
      .then(data => {
        if (data.success) setAgencies(data.agencies)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (agencyId: string, status: string) => {
    setUpdating(agencyId)
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, status }),
      })
      if (res.ok) {
        setAgencies(prev => prev.map(a =>
          a.id === agencyId ? { ...a, status } : a
        ))
      }
    } finally {
      setUpdating(null)
    }
  }

  const statusColour = (s: string) => {
    if (s === 'approved') return '#16A34A'
    if (s === 'rejected') return '#DC2626'
    return '#D97706'
  }

  const statusBg = (s: string) => {
    if (s === 'approved') return '#F0FDF4'
    if (s === 'rejected') return '#FEF2F2'
    return '#FFFBEB'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      padding: '32px 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', marginBottom: '32px',
        }}>
          <Building2 style={{ width: '24px', height: '24px', color: '#C9973A' }} />
          <div>
            <h1 style={{
              fontSize: '24px', fontWeight: 900,
              color: '#0D1B3E', margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Agency Approvals
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
              {agencies.filter(a => a.status === 'pending').length} pending review
            </p>
          </div>
        </div>

        {loading && (
          <p style={{ color: '#64748B', fontSize: '14px' }}>Loading...</p>
        )}

        {!loading && agencies.length === 0 && (
          <div style={{
            background: 'white', borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '60px 40px', textAlign: 'center',
          }}>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              No agencies registered yet.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agencies.map((agency) => (
            <div key={agency.id} style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>

              {/* Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0D1B3E, #1E3A8A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Building2 style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '15px', fontWeight: 700,
                  color: '#0D1B3E', marginBottom: '2px',
                }}>
                  {agency.name || 'Unnamed Agency'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {agency.contact_first_name} {agency.contact_last_name}
                  {agency.contact_email && ` · ${agency.contact_email}`}
                </div>
                {(agency.city || agency.state) && (
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    {[agency.city, agency.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div style={{
                padding: '4px 10px', borderRadius: '20px',
                background: statusBg(agency.status),
                border: `1px solid ${statusColour(agency.status)}30`,
                display: 'flex', alignItems: 'center', gap: '5px',
                flexShrink: 0,
              }}>
                {agency.status === 'approved' && (
                  <CheckCircle style={{ width: '11px', height: '11px', color: statusColour(agency.status) }} />
                )}
                {agency.status === 'rejected' && (
                  <XCircle style={{ width: '11px', height: '11px', color: statusColour(agency.status) }} />
                )}
                {agency.status === 'pending' && (
                  <Clock style={{ width: '11px', height: '11px', color: statusColour(agency.status) }} />
                )}
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: statusColour(agency.status),
                  textTransform: 'capitalize' as const,
                }}>
                  {agency.status}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {agency.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(agency.id, 'approved')}
                    disabled={updating === agency.id}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                      color: 'white', fontSize: '12px', fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                      opacity: updating === agency.id ? 0.6 : 1,
                    }}
                  >
                    Approve
                  </button>
                )}
                {agency.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(agency.id, 'rejected')}
                    disabled={updating === agency.id}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: '1.5px solid #E2E8F0',
                      background: 'white', color: '#94A3B8',
                      fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer',
                      opacity: updating === agency.id ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
