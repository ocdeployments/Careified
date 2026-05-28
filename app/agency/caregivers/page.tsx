import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import CaregiversTabsClient from './CaregiversTabsClient'

export default async function AgencyCaregiversPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { rows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (rows.length === 0) {
    redirect('/onboarding')
  }

  if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }

  return <CaregiversTabsClient />
}
