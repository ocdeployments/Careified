// Field Discovery Admin API
// Returns all discovered fields for admin review

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

interface FieldDiscovery {
  id: string
  field_name: string
  field_label: string
  sample_values: string[]
  agency_count: number
  caregiver_count: number
  first_seen_at: string
  last_seen_at: string
  source: string
  status: string
  notes: string | null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query<FieldDiscovery>(
      `SELECT id, field_name, field_label, sample_values, agency_count,
              caregiver_count, first_seen_at, last_seen_at, source, status, notes
       FROM field_discovery
       ORDER BY agency_count DESC, caregiver_count DESC`
    )

    return NextResponse.json({ fields: result.rows })
  } catch (err) {
    console.error('Error fetching field discovery:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch field discovery data' },
      { status: 500 }
    )
  }
}