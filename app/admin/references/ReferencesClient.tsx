'use client'
import { useState } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const S = "'DM Sans', sans-serif"

type ReferenceRequest = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  reference_name: string
  reference_email: string
  relationship: string
  status: string
  sent_at: string | null
  completed_at: string | null
  would_rehire: string | null
  reliability_rating: number | null
  professionalism_rating: number | null
}

export default function ReferencesClient({
  pending,
  completed,
}: {
  pending: ReferenceRequest[]
  completed: ReferenceRequest[]
}) {
  const [tab, setTab] = useState<'pending' | 'completed'>('pending')

  return (
    <div style={{ fontFamily: S, color: N, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
          ← Back to admin
        </Link>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, margin: '8px 0 4px' }}>Reference Verification</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Monitor and manage reference requests</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #E2E8F0' }}>
        <button
          onClick={() => setTab('pending')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: tab === 'pending' ? `2px solid #C9973A` : '2px solid transparent',
            color: tab === 'pending' ? N : '#64748B',
            fontWeight: tab === 'pending' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -1,
          }}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: tab === 'completed' ? `2px solid #C9973A` : '2px solid transparent',
            color: tab === 'completed' ? N : '#64748B',
            fontWeight: tab === 'completed' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -1,
          }}
        >
          Completed ({completed.length})
        </button>
      </div>

      {tab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
              No pending references
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {pending.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: N }}>
                        {r.caregiver_first_name} {r.caregiver_last_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        Reference: {r.reference_name} ({r.relationship}) · {r.reference_email}
                      </div>
                    </div>
                    <div style={{
                      background: r.status === 'sent' ? '#FEF3C7' : '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      color: r.status === 'sent' ? '#D97706' : '#64748B',
                    }}>
                      {r.status.toUpperCase()}
                    </div>
                  </div>
                  {r.sent_at && (
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                      Sent: {r.sent_at.slice(0, 10)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'completed' && (
        <div>
          {completed.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
              No completed references
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {completed.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: N }}>
                        {r.caregiver_first_name} {r.caregiver_last_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        Reference: {r.reference_name} ({r.relationship})
                      </div>
                    </div>
                    <div style={{
                      background: '#F0FDF4',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#16A34A',
                    }}>
                      COMPLETED
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <div style={{ background: '#F7F4F0', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: r.would_rehire === 'yes' ? '#16A34A' : '#DC2626' }}>
                        {r.would_rehire || '—'}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Would Rehire</div>
                    </div>
                    <div style={{ background: '#F7F4F0', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: N }}>{r.reliability_rating || '—'}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Reliability</div>
                    </div>
                    <div style={{ background: '#F7F4F0', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: N }}>{r.professionalism_rating || '—'}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Professionalism</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}