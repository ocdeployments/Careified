'use client';

import { CaregiverSearchResult } from '@/lib/types/search';
import { CaregiverCard } from './CaregiverCard';
import { Loader2, Search } from 'lucide-react';

interface SearchResultsProps {
 results: CaregiverSearchResult[];
 loading: boolean;
 page: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

export function SearchResults({
 results, loading, page, totalPages, onPageChange
}: SearchResultsProps) {

 if (loading) {
 return (
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
 <div style={{ textAlign: 'center' }}>
 <Loader2 size={32} color="#C9973A" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
 <p style={{ fontSize: '13px', color: '#94A3B8' }}>Finding caregivers...</p>
 </div>
 </div>
 );
 }

 if (results.length === 0) {
 return (
 <div style={{ textAlign: 'center', padding: '80px 0' }}>
 <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
 <Search size={28} color="#94A3B8" />
 </div>
 <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 8px' }}>
 No caregivers match your filters
 </h3>
 <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
 Try expanding your search criteria
 </p>
 </div>
 );
 }

 return (
 <div>
 {/* Cards grid */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
 {results.map(caregiver => (
 <CaregiverCard key={caregiver.id} caregiver={caregiver} />
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
 <button
 onClick={() => onPageChange(page - 1)}
 disabled={page === 1}
 style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 600, color: '#64748B', backgroundColor: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
 >
 ← Previous
 </button>
 <span style={{ fontSize: '13px', color: '#64748B', padding: '0 8px' }}>
 Page {page} of {totalPages}
 </span>
 <button
 onClick={() => onPageChange(page + 1)}
 disabled={page === totalPages}
 style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 600, color: '#64748B', backgroundColor: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
 >
 Next →
 </button>
 </div>
 )}
 </div>
 );
}
