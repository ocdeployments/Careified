'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlignmentScoreBadge, AlignmentDisclaimerBanner } from '@/components/matching/AlignmentBadge'
import { DimensionBreakdown } from '@/components/matching/DimensionBreakdown'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type ClientNeed = {
  id: string
  client_first_name: string | null
  client_age: number | null
  primary_condition: string | null
  secondary_conditions: string[] | null
  services_needed: string[] | null
  care_intensity: string | null
  placement_type: string | null
  hours_per_week: number | null
  start_date: string | null
  duration_expected: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  pets_present: string[] | null
  smoking_household: boolean | null
  home_condition: string | null
  family_dynamics: string | null
  language_required: string | null
  gender_preference: string | null
  personality_desired: string[] | null
  hourly_rate_max: number | null
  mobility_level: string | null
  medications_complex: boolean | null
  status: string
}

type MatchRow = {
  caregiver_id: string
  first_name: string
  last_name: string
  city: string | null
  state: string | null
  specializations: string[] | null
  languages: string[] | null
  years_experience: number | null
  hourly_rate: number | null
  alignment_score: number | null
  overall_confidence: number | null
  alignment: {
    alignment_score: number | null
    overall_confidence: number | null
    scope: string
    criteria_aligned: string[]
    criteria_not_aligned: string[]
    unknowns: string[]
    gates_passed: boolean
    disclaimer: string
    dimensions: Record<string, {
      score: number | null
      confidence: string
      confidence_multiplier: number
      attributes_used: string[]
    }>
  }
  // deprecated aliases for backcompat
  match?: any
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [client, setClient] = useState<ClientNeed | null>(null)
  const [results, setResults] = useState<MatchRow[]>([])
  const [excluded, setExcluded] = useState(0)
  const [disclaimer, setDisclaimer] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!params.id) return

    async function load() {
      const cr = await fetch(`/api/agency/clients/${params.id}`)
      if (!cr.ok) {
        setLoading(false)
        return
      }
      const cd = await cr.json()
      setClient(cd.client)

      // Build need payload from client
      const need = { ...cd.client }
      delete need.id
      delete need.agency_id
      delete need.status
      delete need.matched_caregiver_id
      delete need.created_at
      delete need.updated_at

      const rr = await fetch('/api/match/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need, clientNeedsId: params.id, limit: 20 }),
      })
      if (rr.ok) {
        const rd = await rr.json()
        setResults(rd.results || [])
        setExcluded(rd.excluded_count || 0)
        setDisclaimer(rd.disclaimer || '')
      }
      setLoading(false)
    }

    load()
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/agency/clients/${params.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/agency/clients')
    else setDeleting(false)
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: FONT_SANS, color: '#64748B' }}>Loading…</div>
  }

  if (!client) {
    return (
      <div style={{ padding: 40, fontFamily: FONT_SANS }}>
        <h1 style={{ color: '#0D1B3E' }}>Client not found</h1>
        <Link href="/agency/clients" style={{ color: '#C9973A' }}>Back to clients</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 32 }}>
        <div>
          <Link href="/agency/clients" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
            ← All clients
          </Link>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '8px 0 4px 0' }}>
            {client.client_first_name || 'Unnamed'}
            {client.client_age ? `, ${client.client_age}` : ''}
          </h1>
          <p style={{ color: '#64748B', margin: 0 }}>
            {[client.primary_condition, client.placement_type, client.city && `${client.city}, ${client.state}`]
              .filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1.5px solid #FCA5A5',
            background: 'white',
            color: '#DC2626',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: FONT_SANS,
          }}
        >
          {deleting ? 'Deleting…' : 'Delete client'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Client summary sidebar */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 24,
          height: 'fit-content',
          position: 'sticky',
          top: 24,
        }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 18, color: '#0D1B3E', margin: '0 0 16px 0' }}>
            Client details
          </h3>
          <DetailRow label="Care intensity" value={client.care_intensity} />
          <DetailRow label="Hours/week" value={client.hours_per_week} />
          <DetailRow label="Start date" value={client.start_date} />
          <DetailRow label="Duration" value={client.duration_expected} />
          <DetailRow label="Language required" value={client.language_required} />
          <DetailRow label="Gender preference" value={client.gender_preference} />
          <DetailRow label="Home condition" value={client.home_condition} />
          <DetailRow label="Family" value={client.family_dynamics} />
          <DetailRow label="Max rate" value={client.hourly_rate_max ? `$${client.hourly_rate_max}/hr` : null} />
          {client.pets_present && client.pets_present.length > 0 && (
            <DetailRow label="Pets" value={client.pets_present.join(', ')} />
          )}
          {client.personality_desired && client.personality_desired.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Desired personality</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {client.personality_desired.map(p => (
                  <span key={p} style={{ fontSize: 11, background: '#F1F5F9', color: '#0D1B3E', padding: '4px 8px', borderRadius: 12 }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Match results */}
        <div>
          {disclaimer && (
            <div style={{ marginBottom: 16 }}>
              <AlignmentDisclaimerBanner disclaimer={disclaimer} compact />
            </div>
          )}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, color: '#0D1B3E', margin: 0 }}>
              Matched caregivers ({results.length})
            </h2>
            {excluded > 0 && (
              <span style={{ fontSize: 12, color: '#64748B' }}>
                {excluded} excluded by hard filters
              </span>
            )}
          </div>

          {results.length === 0 && (
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 48,
              textAlign: 'center',
              color: '#64748B',
            }}>
              No caregivers match. Try relaxing your requirements.
            </div>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {results.map(r => <CaregiverMatchCard key={r.caregiver_id} row={r} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ color: '#0D1B3E', fontWeight: 500, textTransform: 'capitalize' }}>{String(value).replace(/_/g, ' ')}</span>
    </div>
  )
}

function CaregiverMatchCard({ row }: { row: MatchRow }) {
  const score = row.alignment_score ?? row.alignment?.alignment_score ?? row.match?.overall_score ?? null
  const confidence = row.overall_confidence ?? row.alignment?.overall_confidence ?? row.match?.overall_confidence ?? null
  const aligned = row.alignment?.criteria_aligned ?? row.match?.strong_fits ?? []
  const notAligned = row.alignment?.criteria_not_aligned ?? row.match?.gaps ?? []
  const unknowns = row.alignment?.unknowns ?? row.match?.unknowns ?? []
  const dimensions = row.alignment?.dimensions ?? null

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: 24,
        transition: 'all 150ms ease',
      }}
    >
      <Link
        href={`/profile/${row.caregiver_id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#0D1B3E' }}>
                {row.first_name} {row.last_name}
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {row.city}, {row.state} · {row.years_experience} yrs
                {row.hourly_rate && ` · $${row.hourly_rate}/hr`}
              </div>
            </div>

            {aligned.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Criteria aligned
                </div>
                <div style={{ fontSize: 13, color: '#0D1B3E' }}>
                  {aligned.slice(0, 3).join(' · ')}
                </div>
              </div>
            )}

            {notAligned.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Criteria not aligned
                </div>
                <div style={{ fontSize: 13, color: '#B45309' }}>
                  {notAligned.slice(0, 2).join(' · ')}
                </div>
              </div>
            )}

            {unknowns.length > 0 && (
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                Data unavailable: {unknowns.map(u => u.replace(/_/g, ' ')).join(', ')}
              </div>
            )}
          </div>

          <AlignmentScoreBadge score={score} confidence={confidence} size="md" />
        </div>
      </Link>

      {dimensions && (
        <div style={{ marginTop: 12, borderTop: '1px solid #F1F5F9', paddingTop: 4 }}>
          <DimensionBreakdown dimensions={dimensions as any} />
        </div>
      )}
    </div>
  )
}
