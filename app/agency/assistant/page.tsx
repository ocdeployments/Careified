import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import AgencyAssistantClient from './AgencyAssistantClient'

export default async function AgencyAssistantPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Check agency approval status
  const { rows } = await pool.query(
    'SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status = $2',
    [userId, 'approved']
  )

  if (rows.length === 0) {
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
  }

  const agencyName = rows[0]?.name || 'Your Agency'

  return <AgencyAssistantClient agencyName={agencyName} />
}