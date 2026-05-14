'use client'
import { CaregiverSearchResult } from '@/lib/types/search'
import { CaregiverCard } from './CaregiverCard'
import { Search } from 'lucide-react'

interface SearchResultsProps {
  results: CaregiverSearchResult[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClearFilters?: () => void
}

export function SearchResults({
  results, loading, page, totalPages, onPageChange, onClearFilters
}: SearchResultsProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-slate-200 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Search size={28} color="#94A3B8" />
        </div>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#0D1B3E',
          marginBottom: 8,
        }}>
          No caregivers match those filters.
        </h3>
        <p style={{
          fontSize: 14,
          color: '#64748B',
          marginBottom: 24,
          maxWidth: 320,
          lineHeight: 1.6,
        }}>
          Try widening your search area or adjusting availability requirements.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
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
