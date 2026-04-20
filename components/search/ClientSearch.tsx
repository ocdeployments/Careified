'use client'

import { useState, useEffect, useCallback } from 'react'
import { SearchFilters, SearchResponse, CaregiverSearchResult } from '@/lib/types/search'
import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchResults } from '@/components/search/SearchResults'
import { AlignmentDisclaimerBanner } from '@/components/matching/AlignmentBadge'

interface ClientSearchProps {
  initialFilters: SearchFilters
}

export function ClientSearch({ initialFilters }: ClientSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [excludedCount, setExcludedCount] = useState(0)
  const [disclaimer, setDisclaimer] = useState('')

  const executeSearch = useCallback(async (f: SearchFilters) => {
    setLoading(true)
    try {
      // Build MatchNeed from filters
      const need = {
        city: f.city,
        state: f.state,
        primary_condition: f.specialties?.[0] || undefined,
        placement_type: f.placementTypes?.[0] || undefined,
        language_required: f.languages?.[0] || undefined,
        care_intensity: undefined,
      }

      const response = await fetch('/api/match/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need }),
      })
      const data = await response.json()
      
      // Map rank API results to CaregiverSearchResult shape
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
      
      setSearchResponse({ results: mappedResults, totalCount: data.matched_count || 0, page: 1, totalPages: 1, filters })
      setExcludedCount(data.excluded_count || 0)
      setDisclaimer(data.disclaimer || '')
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    executeSearch(filters)
  }, [filters, executeSearch])

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F4F0' }}>
      {/* Page header */}
      <div style={{ backgroundColor: '#0D1B3E', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Find Caregivers
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {searchResponse
              ? `${searchResponse.totalCount} caregiver${searchResponse.totalCount !== 1 ? 's' : ''} match your search${excludedCount > 0 ? ` (${excludedCount} excluded)` : ''}`
              : 'Search caregiver profiles'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Filter sidebar */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              resultCount={searchResponse?.totalCount || 0}
            />
          </div>

          {/* Results */}
          <div>
            {disclaimer && (
              <div style={{ marginBottom: '16px' }}>
                <AlignmentDisclaimerBanner disclaimer={disclaimer} compact />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                {loading ? 'Searching...' : `${searchResponse?.totalCount || 0} caregivers found`}
                {excludedCount > 0 && <span style={{ marginLeft: '8px', color: '#94A3B8' }}>({excludedCount} excluded by filters)</span>}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#64748B' }}>Sort by</label>
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', backgroundColor: 'white', color: '#0D1B3E' }}
                >
                  <option value="score">Alignment score</option>
                  <option value="experience">Experience</option>
                  <option value="recent">Recently active</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            <SearchResults
              results={searchResponse?.results || []}
              loading={loading}
              page={filters.page}
              totalPages={searchResponse?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
