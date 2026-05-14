// Careified — Agency Roster Record Consent
// Records caregiver consent when they accept T+C on claim page

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const runtime = 'nodejs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { caregiverId, consentVersion } = body

    if (!caregiverId) {
      return NextResponse.json({ error: 'Caregiver ID required' }, { status: 400 })
    }

    // Get request headers for IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'

    // Record consent
    await pool.query(
      `UPDATE caregivers SET 
        claimed_at = NOW(),
        profile_status = 'incomplete'
      WHERE id = $1`,
      [caregiverId]
    )

    // In a full implementation, we'd also store consent records in a separate table
    // For now, we just update the caregiver record

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('roster-consent error:', err)
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 })
  }
}
