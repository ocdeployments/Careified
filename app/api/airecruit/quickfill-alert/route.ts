import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateQuickFillAlert } from '@/lib/airecruit/quickfill-vapi'
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
      caregiver_ids,
      shift_date,
      shift_time,
      shift_location,
      hourly_rate,
      requirements_match,
      blast_id
    } = body

    if (!caregiver_ids || !Array.isArray(caregiver_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields: caregiver_ids array' },
        { status: 400 }
      )
    }

    if (caregiver_ids.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 caregivers per blast' },
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

    const results: { caregiver_id: string; status: string; error?: string }[] = []
    const blastId = blast_id || `blast_${Date.now()}`

    for (const caregiver_id of caregiver_ids) {
      try {
        // Get caregiver details
        const { rows: cgRows } = await pool.query(
          `SELECT first_name, last_name, phone FROM caregivers WHERE id = $1`,
          [caregiver_id]
        )
        const caregiver = cgRows[0]

        if (!caregiver || !caregiver.phone) {
          results.push({ caregiver_id, status: 'skipped', error: 'No phone number' })
          continue
        }

        // Consent check - match_time_calls
        const consentGate = await checkCallAllowed({
          caregiverId: caregiver_id,
          consentType: 'match_time_calls',
          targetPhone: caregiver.phone,
          callPurpose: 'QuickFill opportunity alert call'
        })
        if (!consentGate.allowed) {
          results.push({ caregiver_id, status: 'skipped', error: 'Consent not granted' })
          continue
        }

        // Compliance hours check - strict for opportunity calls
        const hoursCheck = isWithinCallingHours(caregiver.phone)
        if (!hoursCheck.allowed) {
          // Queue for later if outside hours
          results.push({ caregiver_id, status: 'queued', error: 'Outside calling hours' })
          continue
        }

        // Normalize phone
        const cleanPhone = (raw: string) => {
          const digits = raw.replace(/\D/g, '')
          if (digits.length >= 12) return `+${digits}`
          if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
          if (digits.length === 10) return `+1${digits}`
          return `+1${digits}`
        }

        // Fire QuickFill alert call
        const result = await initiateQuickFillAlert({
          caregiverFirstName: caregiver.first_name,
          caregiverPhone: cleanPhone(caregiver.phone),
          agencyName: agency.name,
          shiftDate: shift_date,
          shiftTime: shift_time,
          shiftLocation: shift_location,
          hourlyRate: hourly_rate,
          requirementsMatch: requirements_match,
          caregiverId: caregiver_id,
          blastId
        })

        if (result.success) {
          results.push({ caregiver_id, status: 'initiated' })

          // Log to call_retry_queue for tracking (optional)
          await pool.query(
            `INSERT INTO call_retry_queue
              (call_type, target_phone, target_id, caregiver_id, agency_id, call_params, attempt_number, max_attempts, scheduled_for, status)
             VALUES ('quickfill', $1, $2, $3, $4, $5, 1, 1, NOW(), 'completed')`,
            [cleanPhone(caregiver.phone), blastId, caregiver_id, agency.id, JSON.stringify({ shift_date, shift_time, shift_location })]
          )
        } else {
          results.push({ caregiver_id, status: 'failed', error: result.error })
        }
      } catch (caregiverError) {
        results.push({
          caregiver_id,
          status: 'failed',
          error: caregiverError instanceof Error ? caregiverError.message : 'Unknown error'
        })
      }
    }

    const initiated = results.filter(r => r.status === 'initiated').length
    const queued = results.filter(r => r.status === 'queued').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      blast_id: blastId,
      summary: { initiated, queued, skipped, failed },
      results
    })

  } catch (error) {
    console.error('QuickFill alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}