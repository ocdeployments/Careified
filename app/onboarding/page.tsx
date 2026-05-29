import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string

  if (role === 'agency') {
    const { rows } = await pool.query(
      'SELECT status, name FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )
    if (rows.length === 0 || !rows[0].name || rows[0].name.trim() === '') {
      redirect('/agency/signup')
    }
    if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
      redirect('/agency/pending-approval')
    }
    redirect('/agency/dashboard')
  }

  // Only caregivers reach here
  return <OnboardingForm />
}