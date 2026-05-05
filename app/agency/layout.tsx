import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/agency')
  }

  // Check agency exists and is approved
  const { rows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (!rows.length) {
    redirect('/onboarding')
  }

  if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }

  return <>{children}</>
}