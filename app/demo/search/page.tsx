'use client'
import { ClientSearch } from '@/components/search/ClientSearch'
import { SearchFilters } from '@/lib/types/search'

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
}

export default function DemoSearchPage() {
  return (
    <div>
      <ClientSearch initialFilters={DEFAULT_FILTERS} isDemo={true} />
    </div>
  )
}