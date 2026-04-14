import { NextRequest, NextResponse } from 'next/server';
import { CaregiverSearchService } from '@/lib/services/caregiver-search';
import { SearchFilters } from '@/lib/types/search';

export async function POST(request: NextRequest) {
 try {
  const filters: SearchFilters = await request.json();
  
  const results = await CaregiverSearchService.search(filters);
  
  return NextResponse.json(results);
 
 } catch (error) {
  console.error('Search error:', error);
  return NextResponse.json(
   { error: 'Search failed' },
   { status: 500 }
  );
 }
}
