import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import ReviewForm from './ReviewForm'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

type ClientData = {
  id: string
  client_first_name: string | null
  city: string | null
  state: string | null
  matched_caregiver_id: string | null
}

async function getClient(clientId: string, userId: string): Promise<ClientData | null> {
  const { rows } = await pool.query(
    `SELECT id, client_first_name, city, state, matched_caregiver_id
     FROM client_needs
     WHERE id = $1 AND agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $2)`,
    [clientId, userId]
  )
  return rows[0] || null
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Check agency status
  const { rows: agencyRows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (agencyRows.length === 0) {
    redirect('/onboarding')
  }

  if (agencyRows[0].status !== 'approved' && agencyRows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }

  const { id: clientId } = await params
  const client = await getClient(clientId, userId)

  if (!client) {
    return (
      <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ color: '#0D1B3E' }}>Client not found</h1>
        <a href="/agency/clients" style={{ color: '#C9973A' }}>Back to clients</a>
      </div>
    )
  }

  if (!client.matched_caregiver_id) {
    return (
      <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ color: '#0D1B3E' }}>No matched caregiver</h1>
        <p style={{ color: '#64748B' }}>This client has no matched caregiver to review.</p>
        <a href={`/agency/clients/${clientId}`} style={{ color: '#C9973A' }}>Back to client</a>
      </div>
    )
  }

  return <ReviewForm client={client} />
}