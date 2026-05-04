'use client'
import { useState } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

type Gap = { category: string; text: string; priority: string }
type Result = {
  caregiver_id: string
  first_name: string
  last_name: string
  city: string
  state: string
  years_experience: number
  hourly_rate: number
  alignment_score: number | null
  criteria_aligned: string[]
  gaps: Gap[]
}
type Response = {
  type: 'matches' | 'unknown'
  message?: string
  summary?: string
  client?: { id: string; name: string } | null
  client_name?: string | null
  client_found?: boolean
  results?: Result[]
}

const SUGGESTIONS = [
  'Find a caregiver for Eleanor',
  'Find someone with dementia experience in Toronto',
  'Find a live-in caregiver for Robert',
]

export default function CommandBar() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<Response | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/agency/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResponse(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s: number | null) =>
    !s ? '#94A3B8' : s >= 0.7 ? '#16A34A' : s >= 0.4 ? '#D97706' : '#DC2626'

  return (
    <div style={{ fontFamily: S }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Find a caregiver for Eleanor... or find someone with dementia experience in Toronto"
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 12,
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white', fontSize: 14, fontFamily: S, outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          style={{
            padding: '14px 24px', borderRadius: 12, border: 'none',
            background: query.trim() && !loading ? `linear-gradient(135deg, ${G}, #E8B86D)` : 'rgba(255,255,255,0.1)',
            color: query.trim() && !loading ? N : 'rgba(255,255,255,0.4)',
            fontSize: 14, fontWeight: 700, cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
            fontFamily: S, flexShrink: 0,
          }}
        >
          {loading ? 'Searching...' : 'Find'}
        </button>
      </div>

      {/* Suggestions */}
      {!response && !loading && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setQuery(s); }} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontFamily: S,
            }}>{s}</button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
          {error}
        </div>
      )}

      {/* Unknown intent */}
      {response?.type === 'unknown' && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {response.message}
        </div>
      )}

      {/* Client not found */}
      {response?.type === 'matches' && !response.client_found && response.client_name && (
        <div style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(201,151,58,0.12)', border: '1px solid rgba(201,151,58,0.3)', borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: '#E8B86D', margin: '0 0 10px', fontWeight: 600 }}>
            No client named "{response.client_name}" found in your records.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>
            A client profile is required for the system to generate accurate matches. The more clinical detail you provide, the better the results.
          </p>
          <Link href="/agency/clients/new" style={{
            display: 'inline-block', padding: '8px 16px', borderRadius: 8,
            background: G, color: N, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            Add {response.client_name} to intake form →
          </Link>
        </div>
      )}

      {/* Results */}
      {response?.type === 'matches' && response.results && response.results.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
            {response.summary} — top {response.results.length} matches
            {response.client && (
              <Link href={`/agency/clients/${response.client.id}`} style={{ color: G, marginLeft: 8, textDecoration: 'none' }}>
                View full match analysis →
              </Link>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {response.results.map(r => (
              <div key={r.caregiver_id} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '16px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8' }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.city}, {r.state} · {r.years_experience} yrs{r.hourly_rate ? ` · $${r.hourly_rate}/hr` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(r.alignment_score) }}>
                      {r.alignment_score ? Math.round(r.alignment_score * 100) : '--'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>match</div>
                  </div>
                </div>

                {/* Aligned */}
                {r.criteria_aligned.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    {r.criteria_aligned.map((a, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#86EFAC', marginBottom: 3 }}>✓ {a}</div>
                    ))}
                  </div>
                )}

                {/* Gaps */}
                {r.gaps.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {r.gaps.map((g, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#FCA5A5', marginBottom: 3 }}>→ {g.text}</div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/profile/${r.caregiver_id}`} style={{
                    flex: 1, display: 'block', padding: '7px 10px', borderRadius: 8, textAlign: 'center',
                    background: G, color: N, fontSize: 11, fontWeight: 700, textDecoration: 'none',
                  }}>View profile</Link>
                  <Link href="/agency/shortlist" style={{
                    flex: 1, display: 'block', padding: '7px 10px', borderRadius: 8, textAlign: 'center',
                    background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, textDecoration: 'none',
                  }}>Shortlist</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
