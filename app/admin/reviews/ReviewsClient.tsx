'use client'
import { useState } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

type SpotCheckReview = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  agency_name: string
  engagement_start: string
  engagement_end: string
  would_re_engage: boolean
  punctuality: number
  reliability: number
  warmth: number
  personal_hygiene: number
  comms_agency: number
  admin_flagged: boolean
  created_at: string
}

type DisputeReview = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  agency_name: string
  dispute_reason: string
  status: string
  dispute_deadline: string
  created_at: string
}

export default function ReviewsClient({
  spotChecks,
  disputes,
}: {
  spotChecks: SpotCheckReview[]
  disputes: DisputeReview[]
}) {
  const [tab, setTab] = useState<'spotcheck' | 'disputes'>('spotcheck')
  const [flagNote, setFlagNote] = useState('')
  const [overrideNote, setOverrideNote] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAction(
    reviewId: string,
    action: 'approve' | 'flag' | 'uphold' | 'override',
    note?: string
  ) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Action failed')
      } else {
        window.location.reload()
      }
    } catch (e) {
      alert('Action failed')
    }
    setLoading(false)
  }

  function calcScore(r: SpotCheckReview): number {
    const vals = [r.punctuality, r.reliability, r.warmth, r.personal_hygiene, r.comms_agency]
    const valid = vals.filter(v => v > 0)
    if (valid.length === 0) return 0
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 20)
  }

  return (
    <div style={{ fontFamily: S, color: N, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
          ← Back to admin
        </Link>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, margin: '8px 0 4px' }}>Review Queue</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Spot check flagged reviews and manage disputes</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #E2E8F0' }}>
        <button
          onClick={() => setTab('spotcheck')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: tab === 'spotcheck' ? `2px solid ${G}` : '2px solid transparent',
            color: tab === 'spotcheck' ? N : '#64748B',
            fontWeight: tab === 'spotcheck' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -1,
          }}
        >
          Spot Check Queue ({spotChecks.length})
        </button>
        <button
          onClick={() => setTab('disputes')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: tab === 'disputes' ? `2px solid ${G}` : '2px solid transparent',
            color: tab === 'disputes' ? N : '#64748B',
            fontWeight: tab === 'disputes' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: -1,
          }}
        >
          Disputes ({disputes.length})
        </button>
      </div>

      {/* Spot Check Tab */}
      {tab === 'spotcheck' && (
        <div>
          {spotChecks.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
              No reviews pending spot check.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {spotChecks.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: N }}>
                        {r.caregiver_first_name} {r.caregiver_last_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {r.agency_name} · {r.engagement_start?.slice(0, 10)} to {r.engagement_end?.slice(0, 10)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: r.would_re_engage ? '#16A34A' : '#DC2626',
                      }}>
                        {r.would_re_engage ? 'Would Rehire' : 'Would Not Rehire'}
                      </span>
                      <div style={{
                        background: '#F7F4F0',
                        borderRadius: 8,
                        padding: '8px 12px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: G }}>{calcScore(r)}%</div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>score</div>
                      </div>
                    </div>
                  </div>

                  {selectedId === r.id && (
                    <div style={{ marginTop: 16, padding: 12, background: '#F7F4F0', borderRadius: 8 }}>
                      <input
                        type="text"
                        placeholder="Add a note (optional)..."
                        value={flagNote}
                        onChange={e => setFlagNote(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          fontSize: 13,
                          marginBottom: 12,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {selectedId === r.id ? (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'flag', flagNote)}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            color: '#DC2626',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Confirm Flag
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'approve')}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: 8,
                            color: '#16A34A',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelectedId(null); setFlagNote('') }}
                          style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            color: '#64748B',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedId(r.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            color: N,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Flag
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'approve')}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                            border: 'none',
                            borderRadius: 8,
                            color: N,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disputes Tab */}
      {tab === 'disputes' && (
        <div>
          {disputes.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
              No disputed reviews.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {disputes.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: N }}>
                        {r.caregiver_first_name} {r.caregiver_last_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {r.agency_name}
                      </div>
                    </div>
                    <div style={{
                      background: '#FEF2F2',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#DC2626',
                    }}>
                      DISPUTED
                    </div>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
                    "{r.dispute_reason || 'No reason provided'}"
                  </div>

                  <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>
                    Deadline: {r.dispute_deadline?.slice(0, 10)} · Submitted: {r.created_at?.slice(0, 10)}
                  </div>

                  {selectedId === r.id && (
                    <div style={{ marginTop: 16, padding: 12, background: '#F7F4F0', borderRadius: 8 }}>
                      <input
                        type="text"
                        placeholder="Override note (required)..."
                        value={overrideNote}
                        onChange={e => setOverrideNote(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          fontSize: 13,
                          marginBottom: 12,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {selectedId === r.id ? (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'override', overrideNote)}
                          disabled={loading || !overrideNote}
                          style={{
                            padding: '8px 16px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            color: '#DC2626',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading || !overrideNote ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Confirm Override
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'uphold')}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: 8,
                            color: '#16A34A',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Uphold Dispute
                        </button>
                        <button
                          onClick={() => { setSelectedId(null); setOverrideNote('') }}
                          style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            color: '#64748B',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedId(r.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            color: '#DC2626',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Override
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'uphold')}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: 8,
                            color: '#16A34A',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Uphold
                        </button>
                      </>
                    )}
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