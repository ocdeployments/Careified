'use client'

import { useState, useEffect, useCallback, useDeferredValue, useMemo } from 'react'
import { SearchFilters, SearchResponse, CaregiverSearchResult } from '@/lib/types/search'
import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchResults } from '@/components/search/SearchResults'
import { AlignmentDisclaimerBanner } from '@/components/matching/AlignmentBadge'
import { X } from 'lucide-react'

// Demo/mock data for /demo/* routes
const DEMO_CAREGIVERS: CaregiverSearchResult[] = [
  {
    id: 'demo-1',
    firstName: 'Maria',
    lastName: 'Santos',
    credentials: ['CNA', 'HHA'],
    specialties: ['Dementia / Alzheimer\'s', 'Post-hospital recovery', 'Medication management'],
    languages: ['Spanish', 'English'],
    yearsExperience: 8,
    clientsServedCount: 24,
    score: 94,
    alignment_score: 94,
    overall_confidence: 0.92,
    hasReferences: true,
    hasBackgroundCheck: true,
    city: 'Toronto',
    state: 'Ontario',
    availabilityStatus: 'available_now',
    availabilityLabel: 'Available now',
    placementTypes: ['Permanent placement', 'Respite care'],
    willingLiveIn: true,
    hasVehicle: true,
    openToUrgent: true,
    employmentType: 'full-time',
    certificationCount: 3,
    profileCompletionPct: 98,
    hourlyRate: 32,
  },
  {
    id: 'demo-2',
    firstName: 'James',
    lastName: 'Wilson',
    credentials: ['RN'],
    specialties: ['Complex personal care', 'Wound care', 'Vital signs monitoring'],
    languages: ['English'],
    yearsExperience: 12,
    clientsServedCount: 45,
    score: 89,
    alignment_score: 89,
    overall_confidence: 0.87,
    hasReferences: true,
    hasBackgroundCheck: true,
    city: 'Mississauga',
    state: 'Ontario',
    availabilityStatus: 'available_now',
    availabilityLabel: 'Available now',
    placementTypes: ['Permanent placement', 'Overnight care'],
    willingLiveIn: false,
    hasVehicle: true,
    openToUrgent: false,
    employmentType: 'full-time',
    certificationCount: 5,
    profileCompletionPct: 100,
    hourlyRate: 45,
  },
  {
    id: 'demo-3',
    firstName: 'Priya',
    lastName: 'Patel',
    credentials: ['PSW'],
    specialties: ['Palliative / end of life', 'Mobility and transfer', 'Behavioural support'],
    languages: ['English', 'Gujarati', 'Hindi'],
    yearsExperience: 5,
    clientsServedCount: 18,
    score: 86,
    alignment_score: 86,
    overall_confidence: 0.84,
    hasReferences: true,
    hasBackgroundCheck: true,
    city: 'Brampton',
    state: 'Ontario',
    availabilityStatus: 'available_soon',
    availabilityLabel: 'Available in 2 weeks',
    placementTypes: ['Permanent placement', 'Part-time'],
    willingLiveIn: true,
    hasVehicle: true,
    openToUrgent: true,
    employmentType: 'part-time',
    certificationCount: 2,
    profileCompletionPct: 92,
    hourlyRate: 28,
  },
  {
    id: 'demo-4',
    firstName: 'Robert',
    lastName: 'Chen',
    credentials: ['CNA'],
    specialties: ['Stroke recovery', 'Diabetes management', 'Mental health support'],
    languages: ['English', 'Cantonese', 'Mandarin'],
    yearsExperience: 6,
    clientsServedCount: 15,
    score: 82,
    alignment_score: 82,
    overall_confidence: 0.79,
    hasReferences: true,
    hasBackgroundCheck: true,
    city: 'Scarborough',
    state: 'Ontario',
    availabilityStatus: 'available_now',
    availabilityLabel: 'Available now',
    placementTypes: ['Permanent placement', 'Weekend specialist'],
    willingLiveIn: false,
    hasVehicle: false,
    openToUrgent: false,
    employmentType: 'full-time',
    certificationCount: 2,
    profileCompletionPct: 88,
    hourlyRate: 30,
  },
  {
    id: 'demo-5',
    firstName: 'Grace',
    lastName: 'Nkomo',
    credentials: ['HHA', 'CNA'],
    specialties: ['Paediatric care', 'Acquired brain injury', 'Behavioural redirection'],
    languages: ['English', 'French'],
    yearsExperience: 9,
    clientsServedCount: 31,
    score: 78,
    alignment_score: 78,
    overall_confidence: 0.75,
    hasReferences: true,
    hasBackgroundCheck: true,
    city: 'Ottawa',
    state: 'Ontario',
    availabilityStatus: 'open_to_offers',
    availabilityLabel: 'Open to offers',
    placementTypes: ['Casual / relief shifts', 'Respite care'],
    willingLiveIn: true,
    hasVehicle: true,
    openToUrgent: true,
    employmentType: 'casual',
    certificationCount: 4,
    profileCompletionPct: 95,
    hourlyRate: 29,
  },
]

interface ClientSearchProps {
  initialFilters: SearchFilters
  isDemo?: boolean
}

export function ClientSearch({ initialFilters, isDemo = false }: ClientSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [excludedCount, setExcludedCount] = useState(0)
  const [disclaimer, setDisclaimer] = useState('')

  // Debounce: defer filter changes by 300ms before firing search
  const deferredFilters = useDeferredValue(filters)

  // Filter demo caregivers based on search filters
  const filteredDemoResults = useMemo(() => {
    let results = [...DEMO_CAREGIVERS]

    // Filter by state
    if (filters.state) {
      results = results.filter(cg => cg.state === filters.state)
    }

    // Filter by specialties
    if (filters.specialties?.length) {
      results = results.filter(cg =>
        filters.specialties!.some(s => cg.specialties.includes(s))
      )
    }

    // Filter by credentials
    if (filters.credentials?.length) {
      results = results.filter(cg =>
        filters.credentials!.some(c => cg.credentials.includes(c))
      )
    }

    // Filter by placement types
    if (filters.placementTypes?.length) {
      results = results.filter(cg =>
        filters.placementTypes!.some(p => cg.placementTypes.includes(p))
      )
    }

    // Filter by languages
    if (filters.languages?.length) {
      results = results.filter(cg =>
        filters.languages!.some(l => cg.languages.includes(l))
      )
    }

    // Sort results
    switch (filters.sortBy) {
      case 'experience':
        results.sort((a, b) => b.yearsExperience - a.yearsExperience)
        break
      case 'score':
      default:
        results.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    return results
  }, [filters])

  const executeSearch = useCallback(async (f: SearchFilters) => {
    setLoading(true)
    setError(null)

    // Use demo data for demo mode
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
      setSearchResponse({
        results: filteredDemoResults,
        totalCount: filteredDemoResults.length,
        page: f.page || 1,
        totalPages: 1,
        filters: f,
      })
      setExcludedCount(0)
      setDisclaimer('Demo data only. Sign up to see real caregiver matches.')
      setLoading(false)
      return
    }

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
  }, [isDemo, filteredDemoResults])

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
                  <option value="all">Show all caregivers</option>
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
