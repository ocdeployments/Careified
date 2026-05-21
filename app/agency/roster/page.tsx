// Careified — Agency Roster Page (Phase 2)

import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import RosterClient from './RosterClient'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

async function getApprovedAgency(): Promise<{ id: string; name: string } | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return null

    const result = await pool.query(
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status IN ('approved', 'active')",
      [userId]
    )

    if (result.rows.length === 0) return null
    return { id: result.rows[0].id, name: result.rows[0].name }
  } catch {
    return null
  }
}

export default async function AgencyRosterPage() {
  const agency = await getApprovedAgency()
  if (!agency) redirect('/agency/pending-approval')

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <RosterClient agencyId={agency.id} agencyName={agency.name} />
    </div>
  )
}