'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchFilters, SearchResponse } from '@/lib/types/search';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchResults } from '@/components/search/SearchResults';
import { SlidersHorizontal, X } from 'lucide-react';

const DEFAULT_FILTERS: SearchFilters = {
 specialties: [],
 credentials: [],
 placementTypes: [],
 languages: [],
 daysAvailable: [],
 shiftTypes: [],
 liftExperience: [],
 sortBy: 'score',
 page: 1,
 limit: 20,
};

export default function CaregiverSearchPage() {
 const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
 const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
 const [loading, setLoading] = useState(true);
 const [showFilters, setShowFilters] = useState(false);

 const executeSearch = useCallback(async (f: SearchFilters) => {
 setLoading(true);
 try {
 const response = await fetch('/api/caregivers/search', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(f),
 });
 const data = await response.json();
 setSearchResponse(data);
 } catch (error) {
 console.error('Search failed:', error);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 executeSearch(filters);
 }, [filters, executeSearch]);

 const handleFilterChange = (newFilters: SearchFilters) => {
 setFilters({ ...newFilters, page: 1 });
 };

 const handlePageChange = (page: number) => {
 setFilters(prev => ({ ...prev, page }));
 window.scrollTo({ top: 0, behavior: 'smooth' });
 };

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
 ? `${searchResponse.totalCount} verified caregiver${searchResponse.totalCount !== 1 ? 's' : ''} match your search`
 : 'Search verified caregiver profiles'}
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
 {/* Results header */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
 <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
 {loading ? 'Searching...' : `${searchResponse?.totalCount || 0} caregivers found`}
 </p>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <label style={{ fontSize: '12px', color: '#64748B' }}>Sort by</label>
 <select
 value={filters.sortBy}
 onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
 style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', backgroundColor: 'white', color: '#0D1B3E' }}
 >
 <option value="score">Trust score</option>
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
 );
}
