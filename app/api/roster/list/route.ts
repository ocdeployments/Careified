import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
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
        c.profile_status,
        c.created_at,
        c.updated_at,
        c.availability_status,
        c.days_available,
        ct.token,
        ct.expires_at,
        ct.claimed_at,
        ct.status as token_status,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'certification', cc.certification,
              'expiry_date', cc.expiry_date
            )
          ) FILTER (WHERE cc.certification IS NOT NULL),
          '[]'
        ) as certifications
       FROM caregivers c
       LEFT JOIN caregiver_claim_tokens ct
         ON ct.caregiver_id = c.id
         AND ct.agency_id = $1
         AND ct.status = 'pending'
       LEFT JOIN caregiver_certifications cc
         ON cc.caregiver_id = c.id
       WHERE c.source_agency_id = $1
       GROUP BY c.id, ct.id
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
      profile_status: row.profile_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      availability_status: row.availability_status,
      days_available: row.days_available,
      token: row.token,
      expires_at: row.expires_at,
      claimed_at: row.claimed_at,
      token_status: row.token_status,
      certifications: row.certifications || [],
    }))

    return NextResponse.json({ caregivers })
  } catch (err) {
    console.error('Error in /api/roster/list:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to list caregivers' }, { status: 500 })
  } finally {
    pool.end()
  }
}