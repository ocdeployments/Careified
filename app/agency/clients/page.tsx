'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, MapPin } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

type ClientSummary = {
  id: string
  client_first_name: string | null
  client_age: number | null
  primary_condition: string | null
  placement_type: string | null
  city: string | null
  state: string | null
  language_required: string | null
  status: string
  created_at: string
  matched_caregiver_id: string | null
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active:  { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E', border: 'rgba(34,197,94,0.3)' },
  matched: { bg: 'rgba(99,102,241,0.15)',  color: '#818CF8', border: 'rgba(99,102,241,0.3)' },
  pending: { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  closed:  { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
}

export default function ClientsListPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agency/clients')
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const d = await res.json()
      setClients(d.clients || [])
    } catch {
      setError('Failed to load clients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  return (
    <AgencyShell
      title="Your Clients"
      subtitle="Manage client needs and find matching caregivers"
    >
      {/* Header actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
          {loading ? 'Loading...' : `${clients.length} client${clients.length !== 1 ? 's' : ''}`}
        </p>
        <Link
          href="/agency/clients/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E', fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <Plus size={15} />
          Add Client
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 96, borderRadius: 16, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} aria-hidden="true" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#E24B4A', marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchClients}
            style={{ padding: '10px 20px', borderRadius: 12, background: '#1E3A8A', color: '#F5F0E8', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && clients.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F5F0E8', marginBottom: 8 }}>No clients yet</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 24, maxWidth: 280 }}>
            Add your first client to start finding matched caregivers.
          </p>
          <Link
            href="/agency/clients/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} />
            Add First Client
          </Link>
        </div>
      )}

      {/* Client list */}
      {!loading && !error && clients.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clients.map(c => {
            const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.pending
            const location = [c.city, c.state].filter(Boolean).join(', ')
            return (
              <div
                key={c.id}
                style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '16px 20px', display: 'flex',
                  alignItems: 'center', gap: 16,
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="rgba(255,255,255,0.3)" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#F5F0E8' }}>
                      {c.client_first_name || 'Unnamed client'}
                      {c.client_age ? `, age ${c.client_age}` : ''}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px', marginTop: 4 }}>
                    {c.primary_condition && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{c.primary_condition}</span>}
                    {c.placement_type && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{c.placement_type}</span>}
                    {location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                        <MapPin size={10} />
                        {location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {c.matched_caregiver_id ? (
                    <Link
                      href={`/profile/${c.matched_caregiver_id}`}
                      style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      View Match
                    </Link>
                  ) : (
                    <Link
                      href={`/agency/search?clientId=${c.id}`}
                      style={{ padding: '7px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                    >
                      Find Match
                    </Link>
                  )}
                  <Link
                    href={`/agency/clients/${c.id}`}
                    style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AgencyShell>
  )
}