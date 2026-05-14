import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  // Check for demo session first
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('careified_demo_session')

  if (demoSession) {
    // Verify it's a demo agency
    const { rows } = await pool.query(
      "SELECT id, status, name FROM agencies WHERE id = $1 AND is_demo = true",
      [demoSession.value]
    )

    if (rows.length > 0 && (rows[0].status === 'approved' || rows[0].status === 'active')) {
      // Demo session valid - allow access
      return <>{children}</>
    }
  }

  // Normal Clerk auth flow
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