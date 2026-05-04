// Careified — POST Score Event API
// Agencies record reliability events for caregivers

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const VALID_EVENT_TYPES = [
  'show_up', 'cancellation', 'late_arrival', 'no_show', 'shift_completed',
  'reference_completed', 'reference_rehire_yes', 'reference_rehire_no',
  'credential_added', 'training_completed', 'certification_renewed',
  'placement_started', 'placement_completed', 'placement_extended',
  'document_submitted', 'response_quick', 'response_slow',
]

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID from user
    const { rows: agencyRows } = await pool.query(
      'SELECT id FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )

    if (agencyRows.length === 0) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 403 })
    }

    const agencyId = agencyRows[0].id

    const body = await req.json()
    const { caregiverId, eventType, placementId, notes } = body

    if (!caregiverId || !eventType) {
      return NextResponse.json({ error: 'caregiverId and eventType required' }, { status: 400 })
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // Get base weight for event
    const EVENT_WEIGHTS: Record<string, number> = {
      show_up: 1.0, cancellation: -0.8, late_arrival: -0.5, no_show: -1.0, shift_completed: 0.8,
      reference_completed: 0.6, reference_rehire_yes: 1.0, reference_rehire_no: -0.5,
      credential_added: 0.7, training_completed: 0.5, certification_renewed: 0.6,
      placement_started: 0.3, placement_completed: 0.4, placement_extended: 0.5,
      document_submitted: 0.4, response_quick: 0.5, response_slow: -0.3,
    }

    const baseWeight = EVENT_WEIGHTS[eventType] || 0.5

    // Insert event
    const { rows } = await pool.query(
      `INSERT INTO caregiver_score_events (
        caregiver_id, event_type, weight, agency_id, placement_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at`,
      [caregiverId, eventType, baseWeight, agencyId, placementId || null, notes || null]
    )

    return NextResponse.json({
      success: true,
      eventId: rows[0].id,
      message: 'Score event recorded',
    })
  } catch (error) {
    console.error('POST score event error:', error)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }
}