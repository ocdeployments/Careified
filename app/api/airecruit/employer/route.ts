import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateEmployerCall } from '@/lib/airecruit/employer-vapi'
import { checkCallAllowed } from '@/lib/airecruit/consent-gate'
import { isWithinCallingHours } from '@/lib/airecruit/calling-hours'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      caregiver_id,
      employer_name,
      supervisor_name,
      employer_phone,
      job_title,
      start_date,
      end_date,
      employment_record_id
    } = body

    if (!caregiver_id || !employer_name || !supervisor_name || !employer_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: caregiver_id, employer_name, supervisor_name, employer_phone' },
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
      consentType: 'past_employer_calls',
      targetPhone: employer_phone,
      callPurpose: 'Past employer verification call'
    })
    if (!consentGate.allowed) {
      return NextResponse.json(
        {
          error: 'This caregiver has not consented to past employer verification calls',
          resolution: 'They can enable this in their communication settings at /settings/communications'
        },
        { status: 403 }
      )
    }

    // Compliance hours check
    const hoursCheck = isWithinCallingHours(employer_phone)
    if (!hoursCheck.allowed) {
      return NextResponse.json(
        {
          error: hoursCheck.reason || 'Outside calling hours for this locale',
          next_available: hoursCheck.retryAfter
        },
        { status: 409 }
      )
    }

    // Rate limit check - 2 employer calls per caregiver per agency per 24 hours
    const { rows: rateRows } = await pool.query(
      `SELECT COUNT(*) as count FROM employment_verifications
       WHERE caregiver_id = $1
       AND agency_id = $2
       AND initiated_at > NOW() - INTERVAL '24 hours'`,
      [caregiver_id, agency.id]
    )
    if (parseInt(rateRows[0].count) >= 2) {
      return NextResponse.json(
        { error: 'Maximum 2 employer verification calls per caregiver per 24 hours' },
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

    const employmentId = employment_record_id || `emp_${Date.now()}`

    // Fire Vapi call
    const result = await initiateEmployerCall({
      caregiverFirstName: caregiver.first_name,
      caregiverLastName: caregiver.last_name,
      employerName: employer_name,
      employerPhone: cleanPhone(employer_phone) || employer_phone,
      supervisorName: supervisor_name,
      agencyName: agency.name,
      caregiverId: caregiver_id,
      employmentId,
      jobTitle: job_title || 'Caregiver',
      startDate: start_date || 'unknown',
      endDate: end_date || 'present'
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to initiate call: ' + result.error },
        { status: 500 }
      )
    }

    // Insert employment_verifications record
    const { rows: insertRows } = await pool.query(
      `INSERT INTO employment_verifications
        (caregiver_id, agency_id, employment_record_id, employer_name, supervisor_name, employer_phone, job_title, start_date, end_date, vapi_call_id, status, initiated_by_clerk_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'initiated', $11)
       RETURNING id`,
      [caregiver_id, agency.id, employment_record_id, employer_name, supervisor_name, cleanPhone(employer_phone), job_title, start_date, end_date, result.vapiCallId, userId]
    )
    const employmentVerificationId = insertRows[0].id

    // Audit log
    await pool.query(
      `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
      [
        'employer_call_initiated',
        'employment_verification',
        employmentVerificationId,
        JSON.stringify({ caregiver_id, employer_name, supervisor_name, agency_id: agency.id })
      ]
    )

    return NextResponse.json({
      success: true,
      call_id: employmentVerificationId,
      vapi_call_id: result.vapiCallId,
      status: 'initiated',
      employer_name,
      supervisor_name,
      message: 'Employer verification call initiated. Results will appear on the caregiver profile when complete.'
    })

  } catch (error) {
    console.error('Employer call API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}