import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Look up token
    const tokenResult = await pool.query(
      `SELECT ct.caregiver_id, ct.agency_id, ct.expires_at, ct.status, ct.claimed_at,
              c.first_name, c.last_name, c.email, c.phone, c.city, c.province_state,
              c.years_experience, c.claim_status, c.specializations,
              a.name as agency_name
       FROM caregiver_claim_tokens ct
       JOIN caregivers c ON c.id = ct.caregiver_id
       LEFT JOIN agencies a ON a.id = c.source_agency_id
       WHERE ct.token = $1`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'invalid_token', message: 'Invalid claim link' }, { status: 404 })
    }

    const record = tokenResult.rows[0]

    // Check if already claimed
    if (record.status === 'claimed') {
      return NextResponse.json({ error: 'already_claimed', message: 'This profile has already been claimed' }, { status: 409 })
    }

    // Check if expired
    if (new Date(record.expires_at) < new Date()) {
      // Mark as expired
      await pool.query(
        "UPDATE caregiver_claim_tokens SET status = 'expired' WHERE token = $1",
        [token]
      )
      return NextResponse.json({ error: 'token_expired', message: 'This claim link has expired' }, { status: 410 })
    }

    // Return valid token info
    return NextResponse.json({
      caregiver_id: record.caregiver_id,
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      agency_name: record.agency_name,
      caregiver: {
        first_name: record.first_name,
        last_name: record.last_name,
        email: record.email,
        phone: record.phone,
        city: record.city,
        province_state: record.province_state,
        years_experience: record.years_experience,
        role: record.specializations?.[0] || null,
        agency_name: record.agency_name,
      },
    })
  } catch (err) {
    console.error('Error in GET /api/claim/[token]:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to validate token' }, { status: 500 })
  } finally {
    pool.end()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate limit: 5 requests per IP per hour
  const clientIp = getClientIp(request)
  if (!checkRateLimit(clientIp, 5)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const { token } = await params
    const body = await request.json()
    const { clerk_user_id } = body

    if (!clerk_user_id) {
      return NextResponse.json({ error: 'validation_error', message: 'clerk_user_id required' }, { status: 400 })
    }

    // Validate token
    const tokenResult = await pool.query(
      `SELECT ct.id as token_id, ct.caregiver_id, ct.agency_id, ct.expires_at, ct.status
       FROM caregiver_claim_tokens ct
       WHERE ct.token = $1`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'invalid_token', message: 'Invalid claim link' }, { status: 404 })
    }

    const record = tokenResult.rows[0]

    // Check if already claimed
    if (record.status === 'claimed') {
      return NextResponse.json({ error: 'already_claimed', message: 'This profile has already been claimed' }, { status: 409 })
    }

    // Check if expired
    if (new Date(record.expires_at) < new Date()) {
      await pool.query(
        "UPDATE caregiver_claim_tokens SET status = 'expired' WHERE token = $1",
        [token]
      )
      return NextResponse.json({ error: 'token_expired', message: 'This claim link has expired' }, { status: 410 })
    }

    // Check clerk_user_id not already linked
    const existingClerk = await pool.query(
      'SELECT id FROM caregivers WHERE clerk_id = $1',
      [clerk_user_id]
    )

    if (existingClerk.rows.length > 0) {
      return NextResponse.json(
        { error: 'clerk_id_in_use', message: 'This account is already linked to another profile' },
        { status: 409 }
      )
    }

    // Claim the profile
    await pool.query(
      "UPDATE caregivers SET clerk_id = $1, claim_status = 'claimed' WHERE id = $2",
      [clerk_user_id, record.caregiver_id]
    )

    // Mark token as claimed
    await pool.query(
      "UPDATE caregiver_claim_tokens SET status = 'claimed', claimed_at = NOW() WHERE token = $1",
      [token]
    )

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (action, actor_clerk_id, target_id, metadata)
       VALUES ('profile_claimed', $1, $2, $3)`,
      [
        clerk_user_id,
        record.caregiver_id,
        JSON.stringify({ token, agency_id: record.agency_id, source: 'claim_link' })
      ]
    )

    return NextResponse.json({
      caregiver_id: record.caregiver_id,
      redirect: '/profile/build?step=0&claimed=true',
    })
  } catch (err) {
    console.error('Error in POST /api/claim/[token]:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to claim profile' }, { status: 500 })
  } finally {
    pool.end()
  }
}