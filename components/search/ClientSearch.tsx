'use client'

import { useState, useEffect, useCallback, useDeferredValue } from 'react'
import { SearchFilters, SearchResponse, CaregiverSearchResult } from '@/lib/types/search'
import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchResults } from '@/components/search/SearchResults'
import { AlignmentDisclaimerBanner } from '@/components/matching/AlignmentBadge'
import { X } from 'lucide-react'

interface ClientSearchProps {
  initialFilters: SearchFilters
}

export function ClientSearch({ initialFilters }: ClientSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [excludedCount, setExcludedCount] = useState(0)
  const [disclaimer, setDisclaimer] = useState('')

  // Debounce: defer filter changes by 300ms before firing search
  const deferredFilters = useDeferredValue(filters)

  const executeSearch = useCallback(async (f: SearchFilters) => {
    setLoading(true)
    setError(null)
    try {
      const need = {
        city: f.city,
        state: f.state,
        primary_condition: f.specialties?.[0] || undefined,
        placement_type: f.placementTypes?.[0] || undefined,
        language_required: f.languages?.[0] || undefined,
      }
      const response = await fetch('/api/match/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need }),
      })
      if (!response.ok) throw new Error(`Search failed: ${response.status}`)
      const data = await response.json()

      const mappedResults: CaregiverSearchResult[] = (data.results || []).map((r: any) => ({
        id: r.caregiver_id,
        firstName: r.first_name,
        lastName: r.last_name,
        credentials: [],
        specialties: r.specializations || [],
        languages: r.languages || [],
        yearsExperience: r.years_experience || 0,
        clientsServedCount: 0,
        score: r.alignment_score ?? r.match?.overall_score ?? 0,
        alignment_score: r.alignment_score ?? r.match?.alignment_score ?? null,
        overall_confidence: r.overall_confidence ?? r.match?.overall_confidence ?? null,
        hasReferences: false,
        hasBackgroundCheck: false,
        city: r.city,
        state: r.state,
        availabilityStatus: 'available_now',
        availabilityLabel: 'Available',
        placementTypes: [],
        willingLiveIn: false,
        hasVehicle: false,
        openToUrgent: false,
        employmentType: 'full-time',
        certificationCount: 0,
        profileCompletionPct: 0,
        hourlyRate: r.hourly_rate,
      }))

      setSearchResponse({ results: mappedResults, totalCount: data.matched_count || 0, page: 1, totalPages: 1, filters: f })
      setExcludedCount(data.excluded_count || 0)
      setDisclaimer(data.disclaimer || '')
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fire search when deferred filters change (300ms debounce via useDeferredValue)
  useEffect(() => {
    executeSearch(deferredFilters)
  }, [deferredFilters, executeSearch])

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Active filter pills
  const activePills: { label: string; onRemove: () => void }[] = [
    ...(filters.city ? [{ label: `City: ${filters.city}`, onRemove: () => setFilters(f => ({ ...f, city: undefined })) }] : []),
    ...(filters.state ? [{ label: `State: ${filters.state}`, onRemove: () => setFilters(f => ({ ...f, state: undefined })) }] : []),
    ...(filters.specialties || []).map(s => ({ label: s, onRemove: () => setFilters(f => ({ ...f, specialties: (f.specialties || []).filter(x => x !== s) })) })),
    ...(filters.languages || []).map(l => ({ label: l, onRemove: () => setFilters(f => ({ ...f, languages: (f.languages || []).filter(x => x !== l) })) })),
    ...(filters.placementTypes || []).map(p => ({ label: p, onRemove: () => setFilters(f => ({ ...f, placementTypes: (f.placementTypes || []).filter(x => x !== p) })) })),
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-navy px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight mb-1">
            Find Caregivers
          </h1>
          <p className="text-sm text-white/50">
            {loading
              ? 'Searching...'
              : searchResponse
                ? `${searchResponse.totalCount} caregiver${searchResponse.totalCount !== 1 ? 's' : ''} match your search${excludedCount > 0 ? ` (${excludedCount} excluded)` : ''}`
                : 'Search caregiver profiles'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-6 items-start">

          {/* Filter sidebar */}
          <div className="md:sticky md:top-6">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              resultCount={searchResponse?.totalCount || 0}
            />
          </div>

          {/* Results */}
          <div>
            {disclaimer && (
              <div className="mb-4">
                <AlignmentDisclaimerBanner disclaimer={disclaimer} compact />
              </div>
            )}

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activePills.map(pill => (
                  <button
                    key={pill.label}
                    onClick={pill.onRemove}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/8 border border-navy/15 text-navy text-xs font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    aria-label={`Remove filter: ${pill.label}`}
                  >
                    {pill.label}
                    <X size={11} />
                  </button>
                ))}
              </div>
            )}

            {/* Sort + count row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-slate-500">
                {loading ? 'Searching...' : `${searchResponse?.totalCount || 0} caregivers found`}
                {excludedCount > 0 && (
                  <span className="ml-2 text-slate-400">({excludedCount} excluded)</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-slate-500">Sort by</label>
                <select
                  id="sort-select"
                  value={filters.sortBy}
                  onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  <option value="score">Alignment score</option>
                  <option value="experience">Experience</option>
                  <option value="recent">Recently active</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => executeSearch(filters)}
                  className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  Try again
                </button>
              </div>
            )}

            {!error && (
              <SearchResults
                results={searchResponse?.results || []}
                loading={loading}
                page={filters.page}
                totalPages={searchResponse?.totalPages || 1}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
