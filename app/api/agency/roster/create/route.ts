// Careified — Agency Roster Create Stub Caregiver
// Creates a stub caregiver record for agency to invite

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
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
      'SELECT id, name, locale FROM agencies WHERE clerk_user_id = $1',
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
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      yearsExperience,
      jobTitle,
      resumeUrl,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Generate claim token
    const claimToken = crypto.randomUUID()
    const claimTokenExpiresAt = new Date()
    claimTokenExpiresAt.setDate(claimTokenExpiresAt.getDate() + 30)

    // Create stub caregiver record
    const { rows: caregiverRows } = await pool.query(
      `INSERT INTO caregivers (
        first_name,
        last_name,
        email,
        phone,
        city,
        years_experience,
        job_title,
        resume_url,
        profile_status,
        created_by_agency_id,
        claim_token,
        claim_token_expires_at,
        locale,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'stub', $9, $10, $11, $12, 'incomplete', NOW(), NOW())
      RETURNING id`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        city || null,
        yearsExperience || null,
        jobTitle || null,
        resumeUrl || null,
        agency.id,
        claimToken,
        claimTokenExpiresAt,
        agency.locale || 'CA',
      ]
    )

    const caregiverId = caregiverRows[0].id

    return NextResponse.json({
      success: true,
      caregiverId,
      claimToken,
      firstName,
      lastName,
      email,
    })
  } catch (err) {
    console.error('roster-create error:', err)
    return NextResponse.json({ error: 'Failed to create caregiver' }, { status: 500 })
  }
}
