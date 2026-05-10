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
    'SELECT id, status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (!rows.length) {
    // Check if user is a team member
    const teamMember = await pool.query(
      `SELECT tm.role FROM agency_team_members tm
       JOIN agencies a ON a.id = tm.agency_id
       WHERE tm.clerk_user_id = $1 AND tm.status = 'active' AND a.status = 'approved'`,
      [userId]
    )

    if (teamMember.rows.length === 0) {
      redirect('/onboarding')
    }

    // Team member - allow access
    return <>{children}</>
  }

  // Agency owner
  if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }

  return <>{children}</>
}