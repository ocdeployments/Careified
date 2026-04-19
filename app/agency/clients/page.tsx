'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function ClientsListPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#0D1B3E', margin: 0 }}>
            Your Clients
          </h1>
          <p style={{ color: '#64748B', marginTop: 8, marginBottom: 0 }}>
            Manage client needs and find matching caregivers.
          </p>
        </div>
        <Link
          href="/agency/clients/new"
          style={{
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            padding: '12px 24px',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          + New Client
        </Link>
      </div>

      {loading && <div style={{ color: '#64748B' }}>Loading…</div>}

      {!loading && clients.length === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 48,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, color: '#0D1B3E', marginBottom: 8 }}>No clients yet</div>
          <div style={{ color: '#64748B', marginBottom: 24 }}>
            Add a client to start finding matched caregivers.
          </div>
          <Link
            href="/agency/clients/new"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              padding: '12px 24px',
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Add first client
          </Link>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {clients.map(c => (
            <Link
              key={c.id}
              href={`/agency/clients/${c.id}`}
              style={{
                display: 'block',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 24,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#C9973A'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,151,58,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#0D1B3E' }}>
                    {c.client_first_name || 'Unnamed client'}
                    {c.client_age ? `, ${c.client_age}` : ''}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                    {[c.primary_condition, c.placement_type, c.city && c.state && `${c.city}, ${c.state}`]
                      .filter(Boolean).join(' · ')}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: '#FDF6EC', color: '#C9973A' },
    matched: { bg: '#DCFCE7', color: '#15803D' },
    filled: { bg: '#E0E7FF', color: '#4338CA' },
  }
  const s = styles[status] || { bg: '#F1F5F9', color: '#64748B' }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}