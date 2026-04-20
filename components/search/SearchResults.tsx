'use client'
import { CaregiverSearchResult } from '@/lib/types/search'
import { CaregiverCard } from './CaregiverCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { Search } from 'lucide-react'

interface SearchResultsProps {
  results: CaregiverSearchResult[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SearchResults({
  results, loading, page, totalPages, onPageChange
}: SearchResultsProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Search size={28} className="text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-navy mb-2">No caregivers match your filters</h3>
        <p className="text-sm text-slate-500">Try expanding your search criteria</p>
      </div>
    )
  }

  return (
    <div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {results.map(caregiver => (
          <CaregiverCard key={caregiver.id} caregiver={caregiver} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            ← Previous
          </button>
          <span className="text-[13px] text-slate-500 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
