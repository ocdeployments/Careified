import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  try {
    // Rate limit: 10 requests per IP per hour
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp, 10)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const errors: Record<string, string> = {}

    // Validate required fields (matching client validation)
    if (!body.agencyName?.trim()) {
      errors.agencyName = 'Agency name is required'
    }
    if (!body.contactFirstName?.trim()) {
      errors.contactFirstName = 'First name is required'
    }
    if (!body.contactLastName?.trim()) {
      errors.contactLastName = 'Last name is required'
    }
    if (!body.contactEmail?.trim()) {
      errors.contactEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
      errors.contactEmail = 'Invalid email format'
    }
    if (!body.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!body.state && !body.province) {
      errors.province = 'Province is required'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const {
      businessType,
      licenseNumber,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      streetAddress,
      city,
      state,
      postalCode,
    } = body

    // Upsert agency record (may already exist from set-role)
    const result = await pool.query(
      `INSERT INTO agencies (
        id, clerk_user_id, name, display_name, business_type,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        city, state, website_url, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        'pending', NOW(), NOW()
      )
      ON CONFLICT (clerk_user_id) DO UPDATE SET
        name = EXCLUDED.name,
        display_name = EXCLUDED.display_name,
        business_type = EXCLUDED.business_type,
        contact_first_name = EXCLUDED.contact_first_name,
        contact_last_name = EXCLUDED.contact_last_name,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        website_url = EXCLUDED.website_url,
        updated_at = NOW()
      RETURNING id`,
      [
        userId,
        body.agencyName,
        body.displayName || body.agencyName,
        body.businessType || null,
        body.contactFirstName,
        body.contactLastName,
        body.contactEmail,
        body.contactPhone || null,
        body.city,
        body.state || body.province,
        body.websiteUrl || null,
      ]
    )

    return NextResponse.json({ 
      success: true, 
      agencyId: result.rows[0].id,
      message: 'Application submitted successfully' 
    })
  } catch (error) {
    console.error('AGENCY REGISTER ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
