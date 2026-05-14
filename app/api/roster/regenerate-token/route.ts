import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { sendClaimEmail } from '@/lib/email/send-claim-email'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string } | null> {
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
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return { agencyId: result.rows[0].id, agencyName: result.rows[0].name }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json({ error: 'unauthorized', message: 'Only approved agencies can regenerate tokens' }, { status: 403 })
    }

    const body = await request.json()
    const { caregiver_id } = body

    if (!caregiver_id) {
      return NextResponse.json({ error: 'validation_error', message: 'caregiver_id required' }, { status: 400 })
    }

    // Check caregiver exists and belongs to this agency
    const caregiverResult = await pool.query(
      'SELECT id, first_name, email, claim_status FROM caregivers WHERE id = $1 AND source_agency_id = $2',
      [caregiver_id, agency.agencyId]
    )

    if (caregiverResult.rows.length === 0) {
      return NextResponse.json({ error: 'not_found', message: 'Caregiver not found in your roster' }, { status: 404 })
    }

    const caregiver = caregiverResult.rows[0]

    // Check not already claimed
    if (caregiver.claim_status === 'claimed') {
      return NextResponse.json({ error: 'already_claimed', message: 'Caregiver has already claimed their profile' }, { status: 409 })
    }

    // Expire all existing pending tokens for this caregiver + agency
    await pool.query(
      "UPDATE caregiver_claim_tokens SET status = 'expired' WHERE caregiver_id = $1 AND agency_id = $2 AND status = 'pending'",
      [caregiver_id, agency.agencyId]
    )

    // Create new token
    const tokenResult = await pool.query(
      `INSERT INTO caregiver_claim_tokens (caregiver_id, agency_id, email_sent_to)
       VALUES ($1, $2, $3)
       RETURNING token`,
      [caregiver_id, agency.agencyId, caregiver.email]
    )

    const token = tokenResult.rows[0].token

    // Send claim email
    await sendClaimEmail({ to: caregiver.email, firstName: caregiver.first_name, agencyName: agency.agencyName, token })

    return NextResponse.json({ token, email_sent_to: caregiver.email }, { status: 201 })
  } catch (err) {
    console.error('Error in /api/roster/regenerate-token:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to regenerate token' }, { status: 500 })
  } finally {
    pool.end()
  }
}