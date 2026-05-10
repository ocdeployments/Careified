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
  { value: 'discovered', label: 'Discovered', color: '#64748B' },
  { value: 'contacted', label: 'Contacted', color: '#0D1B3E' },
  { value: 'interviewing', label: 'Interviewing', color: '#C9973A' },
  { value: 'placed', label: 'Placed', color: '#16A34A' },
  { value: 'inactive', label: 'Inactive', color: '#DC2626' },
]

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
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchShortlist}
            className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && caregivers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
          <Bookmark size={32} className="text-slate-300 mb-4" />
          <h2 className="text-base font-bold text-navy mb-2">No caregivers shortlisted yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Browse caregivers and click the bookmark icon to save them here.
          </p>
          <Link href="/agency/search" className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
            Browse Caregivers
          </Link>
        </div>
      )}

      {!loading && !error && caregivers.length > 0 && (
        <div className="flex flex-col gap-3">
          {caregivers.map(c => {
            const isPending = removingIds.has(c.caregiver_id)
            const isUpdating = updatingIds.has(c.caregiver_id)
            const fullName = `${c.first_name} ${c.last_name}`
            const stageInfo = getStageInfo(c.pipeline_status || 'discovered')
            return (
              <div
                key={c.caregiver_id}
                className={['bg-white rounded-2xl border border-slate-100 p-4 md:p-5', 'flex flex-col sm:flex-row sm:items-center gap-4', 'transition-opacity duration-200', isPending ? 'opacity-50' : ''].join(' ')}
              >
                <div className="w-13 h-13 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-navy truncate">{fullName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {[c.job_title, c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state].filter(Boolean).join(' · ')}
                  </div>
                  {c.aggregate_score > 0 && (
                    <div className="text-xs text-gold font-semibold mt-1">{c.aggregate_score.toFixed(1)} alignment</div>
                  )}
                  {c.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.specializations.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <select
                    value={c.pipeline_status || 'discovered'}
                    onChange={(e) => updatePipelineStatus(c.caregiver_id, e.target.value)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    style={{ backgroundColor: stageInfo.color + '15', color: stageInfo.color }}
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                  <Link href={`/profile/${c.caregiver_id}`} className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none">
                    View Profile
                  </Link>
                  <button
                    onClick={() => remove(c.caregiver_id, fullName)}
                    disabled={isPending}
                    aria-label={`Remove ${fullName} from shortlist`}
                    className={['flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all', 'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none', isPending ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 cursor-pointer'].join(' ')}
                  >
                    <Trash2 size={12} />
                    {isPending ? 'Removing' : 'Remove'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AgencyShell>
  )
}