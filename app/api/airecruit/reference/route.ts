import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateReferenceCall } from '@/lib/airecruit/reference-vapi'
import { checkCallAllowed } from '@/lib/airecruit/consent-gate'
import { isWithinCallingHours } from '@/lib/airecruit/calling-hours'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { caregiver_id, reference_id } = body

    if (!caregiver_id || !reference_id) {
      return NextResponse.json(
        { error: 'Missing required fields: caregiver_id, reference_id' },
        { status: 400 }
      )
    }

    // Get agency
    const { rows: agencyRows } = await pool.query(
      `SELECT id, name FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
      [userId]
    )
    const agency = agencyRows[0]
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check agency is approved
    const { rows: agencyCheck } = await pool.query(
      `SELECT status FROM agencies WHERE id = $1`,
      [agency.id]
    )
    if (agencyCheck[0]?.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your agency account is not approved' },
        { status: 403 }
      )
    }

    // Check ownership - caregiver in roster or shortlist
    const { rows: ownershipRows } = await pool.query(
      `SELECT id FROM caregivers
       WHERE id = $1
       AND (created_by_agency_id = $2 OR source_agency_id = $2)
       UNION
       SELECT caregiver_id FROM agency_shortlist
       WHERE caregiver_id = $1 AND agency_id = $2`,
      [caregiver_id, agency.id]
    )
    if (ownershipRows.length === 0) {
      return NextResponse.json(
        { error: 'This caregiver is not in your roster or shortlist' },
        { status: 403 }
      )
    }

    // Get reference details
    const { rows: refRows } = await pool.query(
      `SELECT name, phone, relationship, caregiver_id
       FROM caregiver_references
       WHERE id = $1 AND caregiver_id = $2`,
      [reference_id, caregiver_id]
    )
    const reference = refRows[0]
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference not found' },
        { status: 404 }
      )
    }
    if (!reference.phone) {
      return NextResponse.json(
        { error: 'This reference does not have a phone number on file' },
        { status: 400 }
      )
    }

    // Get caregiver details
    const { rows: cgRows } = await pool.query(
      `SELECT first_name, last_name, locale FROM caregivers WHERE id = $1`,
      [caregiver_id]
    )
    const caregiver = cgRows[0]
    if (!caregiver) {
      return NextResponse.json(
        { error: 'Caregiver not found' },
        { status: 404 })
    }

    // Consent check
    const consentGate = await checkCallAllowed({
      caregiverId: caregiver_id,
      consentType: 'reference_calls',
      targetPhone: reference.phone,
      callPurpose: 'Reference verification call'
    })
    if (!consentGate.allowed) {
      return NextResponse.json(
        {
          error: 'This caregiver has not consented to reference verification calls',
          resolution: 'They can enable this in their communication settings at /settings/communications'
        },
        { status: 403 }
      )
    }

    // Compliance hours check
    const hoursCheck = isWithinCallingHours(reference.phone)
    if (!hoursCheck.allowed) {
      return NextResponse.json(
        {
          error: hoursCheck.reason || 'Outside calling hours for this locale',
          next_available: hoursCheck.retryAfter
        },
        { status: 409 }
      )
    }

    // Rate limit check - 3 reference calls per caregiver per agency per 24 hours
    const { rows: rateRows } = await pool.query(
      `SELECT COUNT(*) as count FROM reference_calls
       WHERE caregiver_id = $1
       AND agency_id = $2
       AND initiated_at > NOW() - INTERVAL '24 hours'`,
      [caregiver_id, agency.id]
    )
    if (parseInt(rateRows[0].count) >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 reference calls per caregiver per 24 hours' },
        { status: 429 }
      )
    }

    // Normalize phone
    const cleanPhone = (raw: string) => {
      if (!raw) return null
      const digits = raw.replace(/\D/g, '')
      if (digits.length >= 12) return `+${digits}`
      if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
      if (digits.length === 10) return `+1${digits}`
      return `+1${digits}`
    }

    // Fire Vapi call
    const result = await initiateReferenceCall({
      caregiverFirstName: caregiver.first_name,
      caregiverLastName: caregiver.last_name,
      referenceName: reference.name,
      referencePhone: cleanPhone(reference.phone) || reference.phone,
      agencyName: agency.name,
      caregiverId: caregiver_id,
      referenceId: reference_id
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to initiate call: ' + result.error },
        { status: 500 }
      )
    }

    // Insert reference_calls record
    const { rows: insertRows } = await pool.query(
      `INSERT INTO reference_calls
        (caregiver_id, reference_id, agency_id, vapi_call_id, status, initiated_by_clerk_id)
       VALUES ($1, $2, $3, $4, 'initiated', $5)
       RETURNING id`,
      [caregiver_id, reference_id, agency.id, result.vapiCallId, userId]
    )
    const referenceCallId = insertRows[0].id

    // Audit log
    await pool.query(
      `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
      [
        'reference_call_initiated',
        'reference_call',
        referenceCallId,
        JSON.stringify({ caregiver_id, reference_id, reference_name: reference.name, agency_id: agency.id })
      ]
    )

    return NextResponse.json({
      success: true,
      call_id: referenceCallId,
      vapi_call_id: result.vapiCallId,
      status: 'initiated',
      reference_name: reference.name,
      message: 'Reference call initiated. Results will appear on the caregiver profile when complete.'
    })

  } catch (error) {
    console.error('Reference call API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
