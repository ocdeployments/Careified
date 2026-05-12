import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// Allowed roles per spec
const ALLOWED_ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

// Email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Phone validation - 10 digits
function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

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
    // Auth check
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json({ error: 'unauthorized', message: 'Only approved agencies can add caregivers' }, { status: 403 })
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, role, years_experience, city, province_state } = body

    // Validation
    const errors: string[] = []

    if (!first_name || first_name.length < 2 || first_name.length > 50) {
      errors.push('first_name: required, 2-50 characters')
    }
    if (!last_name || last_name.length < 2 || last_name.length > 50) {
      errors.push('last_name: required, 2-50 characters')
    }
    if (!email || !isValidEmail(email)) {
      errors.push('email: required, valid format')
    }
    if (!phone || !isValidPhone(phone)) {
      errors.push('phone: required, 10 digits')
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      errors.push(`role: required, one of: ${ALLOWED_ROLES.join(', ')}`)
    }
    if (years_experience !== undefined && (years_experience < 0 || years_experience > 50)) {
      errors.push('years_experience: 0-50')
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'validation_error', messages: errors }, { status: 400 })
    }

    // Check for duplicate email
    const existing = await pool.query(
      "SELECT id, claim_status FROM caregivers WHERE LOWER(email) = LOWER($1)",
      [email]
    )

    if (existing.rows.length > 0) {
      const existingStatus = existing.rows[0].claim_status
      if (existingStatus === 'self_built' || existingStatus === 'claimed') {
        return NextResponse.json(
          { error: 'duplicate_email', message: 'A caregiver with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Get agency locale
    const agencyResult = await pool.query('SELECT locale FROM agencies WHERE id = $1', [agency.agencyId])
    const locale = agencyResult.rows[0]?.locale || 'CA'

    // Insert caregiver
    const caregiverResult = await pool.query(
      `INSERT INTO caregivers
       (first_name, last_name, email, phone, claim_status, source_agency_id, availability_status, locale, years_experience, city, province_state)
       VALUES ($1, $2, $3, $4, 'agency_built', $5, 'available', $6, $7, $8, $9)
       RETURNING id`,
      [first_name, last_name, email, phone, agency.agencyId, locale, years_experience || null, city || null, province_state || null]
    )

    const caregiverId = caregiverResult.rows[0].id

    // Generate claim token
    const tokenResult = await pool.query(
      `INSERT INTO caregiver_claim_tokens (caregiver_id, agency_id, email_sent_to)
       VALUES ($1, $2, $3)
       RETURNING token`,
      [caregiverId, agency.agencyId, email]
    )

    const token = tokenResult.rows[0].token

    // Send claim email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const claimUrl = `${appUrl}/claim/${token}`

    await sendClaimEmail(email, claimUrl, first_name, agency.agencyName)

    return NextResponse.json(
      { caregiver_id: caregiverId, token, email_sent_to: email },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error in /api/roster/add:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to add caregiver' }, { status: 500 })
  } finally {
    pool.end()
  }
}