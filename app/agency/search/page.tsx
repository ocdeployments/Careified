'use client';

import { useState, useEffect } from 'react';
import { SearchFilters, SearchResponse } from '@/lib/types/search';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchResults } from '@/components/search/SearchResults';

export default function CaregiverSearchPage() {
 
 const [filters, setFilters] = useState<SearchFilters>({
  specialties: [],
  credentials: [],
  placementTypes: [],
  sortBy: 'score',
  page: 1,
  limit: 20,
 });
 
 const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
 const [loading, setLoading] = useState(false);
 
 useEffect(() => {
  executeSearch();
 }, [filters]);
 
 const executeSearch = async () => {
  setLoading(true);
  try {
   const response = await fetch('/api/caregivers/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
   });
   
   const data = await response.json();
   setSearchResponse(data);
  } catch (error) {
   console.error('Search failed:', error);
  } finally {
   setLoading(false);
  }
 };
 
 const handlePageChange = (page: number) => {
  setFilters(prev => ({ ...prev, page }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
 };
 
 return (
  <div className="min-h-screen bg-slate-50 py-8 px-4">
   <div className="max-w-7xl mx-auto">
 
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-slate-900 mb-2">
      Find Caregivers
     </h1>
     <p className="text-slate-600">
      Search verified caregiver profiles by specialty, location, and availability
     </p>
    </div>
 
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
     <div className="lg:col-span-1">
      <FilterPanel
       filters={filters}
       onChange={setFilters}
       resultCount={searchResponse?.totalCount || 0}
      />
     </div>
 
     <div className="lg:col-span-3">
      {searchResponse && (
       <SearchHeader
        filters={filters}
        onChange={setFilters}
        totalCount={searchResponse.totalCount}
       />
      )}
 
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
 );
}
