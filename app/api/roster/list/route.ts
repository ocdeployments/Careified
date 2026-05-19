import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

async function checkApprovedAgency(): Promise<string | null> {
  let userId: string | null | undefined
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch (e: any) {
    if (e?.message?.includes('NEXT_REDIRECT') || e?.code === 'NEXT_REDIRECT') {
      return null
    }
    console.error('Auth error:', e)
    return null
  }

  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return null

    const result = await pool.query(
      "SELECT id FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return result.rows[0].id
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const agencyId = await checkApprovedAgency()
    if (!agencyId) {
      return NextResponse.json({ error: 'unauthorized', message: 'Only approved agencies can list caregivers' }, { status: 403 })
    }

    const result = await pool.query(
      `SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.claim_status,
        c.created_at,
        ct.token,
        ct.expires_at,
        ct.claimed_at,
        ct.status as token_status
       FROM caregivers c
       LEFT JOIN caregiver_claim_tokens ct
         ON ct.caregiver_id = c.id
         AND ct.agency_id = $1
         AND ct.status = 'pending'
       WHERE c.source_agency_id = $1
       ORDER BY c.created_at DESC`,
      [agencyId]
    )

    const caregivers = result.rows.map((row) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      claim_status: row.claim_status,
      created_at: row.created_at,
      token: row.token,
      expires_at: row.expires_at,
      claimed_at: row.claimed_at,
      token_status: row.token_status,
    }))

    return NextResponse.json({ caregivers })
  } catch (err) {
    console.error('Error in /api/roster/list:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to list caregivers' }, { status: 500 })
  } finally {
    pool.end()
  }
}