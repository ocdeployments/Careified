'use client'

import { SearchFilters } from '@/lib/types/search'

interface SearchHeaderProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  totalCount: number
}

export function SearchHeader({ filters, onChange, totalCount }: SearchHeaderProps) {
  const updateSort = (sortBy: 'score' | 'experience' | 'recent') => {
    onChange({ ...filters, sortBy, page: 1 })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold text-navy">
            {totalCount} {totalCount === 1 ? 'caregiver' : 'caregivers'} found
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            All profiles verified and approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="search-sort" className="text-xs text-slate-500">Sort by</label>
          <select
            id="search-sort"
            value={filters.sortBy}
            onChange={e => updateSort(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <option value="score">Best match</option>
            <option value="experience">Most experienced</option>
            <option value="recent">Recently joined</option>
          </select>
        </div>
      </div>
    </div>
  )
}
