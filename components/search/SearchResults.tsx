'use client';

import { CaregiverSearchResult } from '@/lib/types/search';
import { CaregiverCard } from './CaregiverCard';
import { Loader2 } from 'lucide-react';

interface SearchResultsProps {
 results: CaregiverSearchResult[];
 loading: boolean;
 page: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

export function SearchResults({ 
 results, 
 loading, 
 page, 
 totalPages, 
 onPageChange 
}: SearchResultsProps) {
 
 if (loading) {
  return (
   <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
   </div>
  );
 }
 
 if (results.length === 0) {
  return (
   <div className="text-center py-20">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
     <span className="text-3xl">🔍</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">
     No caregivers match your filters
    </h3>
    <p className="text-sm text-slate-600 mb-6">
     Try expanding your search criteria
    </p>
   </div>
  );
 }
 
 return (
  <div>
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    {results.map(caregiver => (
     <CaregiverCard key={caregiver.id} caregiver={caregiver} />
    ))}
   </div>
 
   {totalPages > 1 && (
    <div className="flex items-center justify-center gap-2">
     <button
      onClick={() => onPageChange(page - 1)}
      disabled={page === 1}
      className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
     >
      ← Previous
     </button>
 
     <span className="text-sm text-slate-600">
      Page {page} of {totalPages}
     </span>
 
     <button
      onClick={() => onPageChange(page + 1)}
      disabled={page === totalPages}
      className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
     >
      Next →
     </button>
    </div>
   )}
  </div>
 );
}
