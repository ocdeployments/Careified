import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import { ClientSearch } from '@/components/search/ClientSearch'
import { SearchFilters } from '@/lib/types/search'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

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

export default async function CaregiverSearchPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Check agency approval status
  const { rows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  // No agency record — redirect to onboarding
  if (rows.length === 0) {
    redirect('/onboarding')
  }

  // Pending or rejected — redirect to pending page
  if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }

  // Agency is approved — render the client component
  return <ClientSearch initialFilters={DEFAULT_FILTERS} />
}
