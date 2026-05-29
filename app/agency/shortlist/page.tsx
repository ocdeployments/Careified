'use client'

import { useEffect, useState } from 'react'
import { Bookmark, User, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import AgencyShell from '@/components/shells/AgencyShell'

interface ShortlistedCaregiver {
  id: string
  caregiver_id: string
  first_name: string
  last_name: string
  job_title: string
  photo_url: string | null
  aggregate_score: number
  city: string
  state: string
  availability_status: string
  years_experience: number
  specializations: string[]
  notes: string | null
  pipeline_status: string
  created_at: string
}

const PIPELINE_STAGES = [
  { value: 'discovered', label: 'Discovered', color: 'rgba(255,255,255,0.55)' },
  { value: 'contacted', label: 'Contacted', color: '#818CF8' },
  { value: 'interviewing', label: 'Interviewing', color: '#C9973A' },
  { value: 'placed', label: 'Placed', color: '#22C55E' },
  { value: 'inactive', label: 'Inactive', color: '#EF4444' },
]

const MUTED = 'rgba(255,255,255,0.55)'
const B = 'rgba(255,255,255,0.08)'
const C = 'rgba(255,255,255,0.04)'

function getStageInfo(status: string) {
  return PIPELINE_STAGES.find(s => s.value === status) || PIPELINE_STAGES[0]
}

export default function ShortlistPage() {
  const [caregivers, setCaregivers] = useState<ShortlistedCaregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  const fetchShortlist = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agency/shortlist/pipeline')
      if (!res.ok) throw new Error(`Failed to load shortlist: ${res.status}`)
      const data = await res.json()
      if (data.success) setCaregivers(data.caregivers)
      else throw new Error(data.error || 'Unknown error')
    } catch (err) {
      setError('Failed to load your shortlist. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchShortlist() }, [])

  const updatePipelineStatus = async (caregiverId: string, newStatus: string) => {
    if (updatingIds.has(caregiverId)) return
    setUpdatingIds(prev => new Set(prev).add(caregiverId))
    try {
      const res = await fetch('/api/agency/shortlist/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId, pipelineStatus: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setCaregivers(prev => prev.map(c =>
        c.caregiver_id === caregiverId ? { ...c, pipeline_status: newStatus } : c
      ))
      toast.success(`Status updated to ${getStageInfo(newStatus).label}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(caregiverId); return s })
    }
  }

  const remove = async (caregiverId: string, name: string) => {
    if (removingIds.has(caregiverId)) return
    setRemovingIds(prev => new Set(prev).add(caregiverId))
    try {
      const res = await fetch('/api/agency/shortlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })
      if (!res.ok) throw new Error('Remove failed')
      setCaregivers(prev => prev.filter(c => c.caregiver_id !== caregiverId))
      toast.success(`${name} removed from shortlist`)
    } catch {
      toast.error('Failed to remove — please try again')
    } finally {
      setRemovingIds(prev => { const s = new Set(prev); s.delete(caregiverId); return s })
    }
  }

  return (
    <AgencyShell
      title="Shortlist"
      subtitle={loading ? 'Loading...' : `${caregivers.length} saved ${caregivers.length === 1 ? 'caregiver' : 'caregivers'}`}
    >
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 96, borderRadius: 16, background: C, animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#EF4444', marginBottom: 16 }}>{error}</p>
          <button onClick={fetchShortlist} style={{ padding: '10px 20px', borderRadius: 12, background: '#0D1B3E', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && caregivers.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center', background: C, borderRadius: 16, border: `1px solid ${B}` }}>
          <Bookmark size={32} color={MUTED} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F5F0E8', marginBottom: 8 }}>No caregivers shortlisted yet</h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 24, maxWidth: 280 }}>
            Browse caregivers and click the bookmark icon to save them here.
          </p>
          <Link href="/agency/search" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Browse Caregivers
          </Link>
        </div>
      )}

      {!loading && !error && caregivers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {caregivers.map(c => {
            const isPending = removingIds.has(c.caregiver_id)
            const isUpdating = updatingIds.has(c.caregiver_id)
            const fullName = `${c.first_name} ${c.last_name}`
            const stageInfo = getStageInfo(c.pipeline_status || 'discovered')
            return (
              <div key={c.caregiver_id} style={{ background: C, borderRadius: 16, border: `1px solid ${B}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} color={MUTED} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                      {[c.job_title, c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state].filter(Boolean).join(' · ')}
                    </div>
                    {c.aggregate_score > 0 && (
                      <div style={{ fontSize: 12, color: '#C9973A', fontWeight: 600, marginTop: 4 }}>{Number(c.aggregate_score || 0).toFixed(1)} alignment</div>
                    )}
                    {c.specializations.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {c.specializations.slice(0, 3).map(s => (
                          <span key={s} style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: MUTED, fontSize: 11, fontWeight: 500 }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <select
                      value={c.pipeline_status || 'discovered'}
                      onChange={(e) => updatePipelineStatus(c.caregiver_id, e.target.value)}
                      disabled={isUpdating}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer', backgroundColor: stageInfo.color + '20', color: stageInfo.color }}
                    >
                      {PIPELINE_STAGES.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Link href={`/profile/${c.caregiver_id}`} style={{ padding: '8px 16px', borderRadius: 12, background: '#0D1B3E', color: 'white', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      View Profile
                    </Link>
                    <button
                      onClick={() => remove(c.caregiver_id, fullName)}
                      disabled={isPending}
                      aria-label={`Remove ${fullName} from shortlist`}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, border: `1px solid ${isPending ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'}`, color: isPending ? 'rgba(255,255,255,0.3)' : MUTED, fontSize: 12, fontWeight: 600, background: 'transparent', cursor: isPending ? 'not-allowed' : 'pointer' }}
                    >
                      <Trash2 size={12} />
                      {isPending ? 'Removing' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AgencyShell>
  )
}
