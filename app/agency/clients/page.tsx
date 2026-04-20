'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, MapPin, Clock } from 'lucide-react'
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

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-green-50 text-green-700 border-green-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  matched:  'bg-blue-50 text-blue-700 border-blue-200',
  closed:   'bg-slate-100 text-slate-500 border-slate-200',
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading...' : `${clients.length} client${clients.length !== 1 ? 's' : ''}`}
        </p>
        <Link
          href="/agency/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <Plus size={15} />
          Add Client
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchClients}
            className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
          <Users size={32} className="text-slate-300 mb-4" />
          <h2 className="text-base font-bold text-navy mb-2">No clients yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Add your first client to start finding matched caregivers.
          </p>
          <Link
            href="/agency/clients/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-gold to-gold-warm text-navy text-sm font-bold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <Plus size={15} />
            Add First Client
          </Link>
        </div>
      )}

      {/* Client list */}
      {!loading && !error && clients.length > 0 && (
        <div className="flex flex-col gap-3">
          {clients.map(c => {
            const statusCls = STATUS_STYLES[c.status] ?? STATUS_STYLES.pending
            const location = [c.city, c.state].filter(Boolean).join(', ')
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold/30 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-slate-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-navy">
                      {c.client_first_name || 'Unnamed client'}
                      {c.client_age ? `, age ${c.client_age}` : ''}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${statusCls}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {c.primary_condition && (
                      <span className="text-xs text-slate-500">{c.primary_condition}</span>
                    )}
                    {c.placement_type && (
                      <span className="text-xs text-slate-500">{c.placement_type}</span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={10} />
                        {location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                  {c.matched_caregiver_id ? (
                    <Link
                      href={`/profile/${c.matched_caregiver_id}`}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    >
                      View Match
                    </Link>
                  ) : (
                    <Link
                      href={`/agency/search?clientId=${c.id}`}
                      className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    >
                      Find Match
                    </Link>
                  )}
                  <Link
                    href={`/agency/clients/${c.id}`}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
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
