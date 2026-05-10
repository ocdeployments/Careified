// Careified — Agency Roster Invite Caregiver
// Sends claim invitation email to caregiver

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function POST(req: NextRequest) {
  // Auth check — requires approved agency
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify agency exists and is approved
    const { rows: agencyRows } = await pool.query(
      'SELECT id, name FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )

    if (agencyRows.length === 0) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const agency = agencyRows[0]
    if (agency.status !== 'approved' && agency.status !== 'active') {
      return NextResponse.json({ error: 'Agency not approved' }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { caregiverId } = body

    if (!caregiverId) {
      return NextResponse.json({ error: 'Caregiver ID required' }, { status: 400 })
    }

    // Verify caregiver belongs to this agency
    const { rows: caregiverRows } = await pool.query(
      `SELECT id, first_name, email, claim_token, claim_token_expires_at, profile_status
       FROM caregivers 
       WHERE id = $1 AND created_by_agency_id = $2`,
      [caregiverId, agency.id]
    )

    if (caregiverRows.length === 0) {
      return NextResponse.json({ error: 'Caregiver not found in your roster' }, { status: 404 })
    }

    const caregiver = caregiverRows[0]

    // Check if already claimed
    if (caregiver.claimed_at || caregiver.profile_status === 'complete' || caregiver.profile_status === 'active') {
      return NextResponse.json({ error: 'This profile has already been claimed' }, { status: 400 })
    }

    // Check if token expired
    if (new Date(caregiver.claim_token_expires_at) < new Date()) {
      // Generate new token
      const newToken = crypto.randomUUID()
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 30)

      await pool.query(
        `UPDATE caregivers SET claim_token = $1, claim_token_expires_at = $2 WHERE id = $3`,
        [newToken, newExpiry, caregiverId]
      )
      caregiver.claim_token = newToken
    }

    // Send email (console.log for now — real email = post-launch)
    const emailContent = {
      to: caregiver.email,
      subject: `${agency.name} started your Careified profile — complete it now`,
      body: `
Hi ${caregiver.first_name},

${agency.name} has started a professional profile for you on Careified.

Careified is the professional profile platform for caregivers. Build once. Be seen forever.

Your profile is 40% complete — click below to review what's been filled in and complete the rest. Takes about 15 minutes.

[Complete my profile →]
https://careified.ca/claim/${caregiver.claim_token}

This link expires in 30 days.

— The Careified Team
      `.trim(),
    }

    // Console log email for testing
    console.log('=== AGENCY ROSTER INVITE EMAIL ===')
    console.log('TO:', emailContent.to)
    console.log('SUBJECT:', emailContent.subject)
    console.log('BODY:', emailContent.body)
    console.log('===================================')

    // Update profile status to invited
    await pool.query(
      `UPDATE caregivers SET profile_status = 'invited' WHERE id = $1`,
      [caregiverId]
    )

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${caregiver.email}`,
      caregiverId,
    })
  } catch (err) {
    console.error('roster-invite error:', err)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
