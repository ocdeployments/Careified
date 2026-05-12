import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string } | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

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

async function sendClaimEmail(email: string, claimUrl: string, firstName: string, agencyName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — email skipped')
    return
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Careified <noreply@careified.vercel.app>',
      to: email,
      subject: `${agencyName} created a Careified profile for you — claim it now`,
      html: `
        <p>Hi ${firstName},</p>
        <p>${agencyName} added you to Careified — the reputation platform for professional caregivers.</p>
        <p>We've created a basic profile for you with the information we have on file. Claim it now to:</p>
        <ul>
          <li>Add your own details and photo</li>
          <li>Make your credentials visible to agencies</li>
          <li>Build your portable professional reputation</li>
        </ul>
        <p><a href="${claimUrl}">Claim your profile</a></p>
        <p>This link expires in 30 days.</p>
        <p>The Careified Team</p>
      `,
    })
  } catch (err) {
    console.error('Failed to send claim email:', err)
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const claimUrl = `${appUrl}/claim/${token}`

    await sendClaimEmail(caregiver.email, claimUrl, caregiver.first_name, agency.agencyName)

    return NextResponse.json({ token, email_sent_to: caregiver.email }, { status: 201 })
  } catch (err) {
    console.error('Error in /api/roster/regenerate-token:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to regenerate token' }, { status: 500 })
  } finally {
    pool.end()
  }
}