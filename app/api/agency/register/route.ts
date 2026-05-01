import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      agencyName,
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

    // Validate required fields
    if (!agencyName || !contactFirstName || !contactLastName || !contactEmail || !contactPhone || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Insert into agencies table with pending status
    const result = await pool.query(
      `INSERT INTO agencies (
        name, business_type, license_number,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        street, city, state, postal_code,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW(), NOW())
      RETURNING id`,
      [
        agencyName,
        businessType || null,
        licenseNumber || null,
        contactFirstName,
        contactLastName,
        contactEmail,
        contactPhone,
        streetAddress,
        city,
        state,
        postalCode,
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
