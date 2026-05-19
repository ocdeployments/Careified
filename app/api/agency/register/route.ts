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
    if (!body.businessType) {
      errors.businessType = 'Business type is required'
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
    if (!body.contactPhone?.trim()) {
      errors.contactPhone = 'Phone is required'
    }
    if (!body.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!body.state && !body.province) {
      errors.province = 'Province is required'
    }
    if (!body.streetAddress?.trim()) {
      errors.streetAddress = 'Street address is required'
    }
    if (!body.postalCode?.trim()) {
      errors.postalCode = 'Postal code is required'
    }
    if (!body.serviceAreas || body.serviceAreas.length === 0) {
      errors.serviceAreas = 'Select at least one service area'
    }
    if (!body.careTypes || body.careTypes.length === 0) {
      errors.careTypes = 'Select at least one care type'
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

    // Insert into agencies table with pending status
    const result = await pool.query(
      `INSERT INTO agencies (
        id, clerk_user_id, name, display_name, business_type, license_number,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        street, city, state, postal_code,
        brand_color, tagline, website_url,
        service_areas, care_types, coordinator_count,
        recruitment_methods, current_tools,
        business_registration, insurance_carrier, insurance_policy,
        background_check_provider,
        status, created_at, updated_at
      ) VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,'pending',NOW(),NOW())
      RETURNING id`,
      [
        userId,
        body.agencyName,
        body.displayName || body.agencyName,
        body.businessType || null,
        body.licenseNumber || null,
        body.contactFirstName,
        body.contactLastName,
        body.contactEmail,
        body.contactPhone,
        body.streetAddress || null,
        body.city,
        body.state || body.province,
        body.postalCode || null,
        body.brandColor || '#0D1B3E',
        body.tagline || null,
        body.websiteUrl || null,
        body.serviceAreas || [],
        body.careTypes || [],
        body.coordinatorCount || null,
        body.recruitmentMethods || [],
        body.currentTools || [],
        body.businessRegistration || null,
        body.insuranceCarrier || null,
        body.insurancePolicy || null,
        body.backgroundCheckProvider || null,
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
