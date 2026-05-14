import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { analyseProfile } from '@/lib/airecruit/profile-analysis'
import { checkCallAllowed } from '@/lib/airecruit/consent-gate'
import { isWithinCallingHours } from '@/lib/airecruit/calling-hours'
import { initiateReferenceCall } from '@/lib/airecruit/reference-vapi'
import { initiateEmployerCall } from '@/lib/airecruit/employer-vapi'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { caregiver_id, call_types, auto_sequence } = body

    if (!caregiver_id || !call_types || !Array.isArray(call_types)) {
      return NextResponse.json(
        { error: 'Missing required fields: caregiver_id, call_types array' },
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

    // Check ownership
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

    // Run profile analysis
    const analysis = await analyseProfile(caregiver_id)

    const calls_initiated: string[] = []
    const calls_queued: string[] = []
    const calls_skipped: { call_type: string; reason: string }[] = []

    // Get caregiver and reference/employer details
    const { rows: cgRows } = await pool.query(
      `SELECT first_name, last_name, locale FROM caregivers WHERE id = $1`,
      [caregiver_id]
    )
    const caregiver = cgRows[0]

    // Determine call order
    let callsToRun = call_types
    if (auto_sequence && analysis.recommended_calls.length > 0) {
      const recommendedTypes = analysis.recommended_calls.map(rc => rc.call_type)
      callsToRun = call_types.filter(ct => recommendedTypes.includes(ct))
      // Add any not in recommended
      call_types.forEach(ct => {
        if (!callsToRun.includes(ct)) callsToRun.push(ct)
      })
    }

    for (const call_type of callsToRun) {
      try {
        if (call_type === 'reference_calls') {
          // Get unverified references
          const { rows: refRows } = await pool.query(
            `SELECT id, name, phone FROM caregiver_references
             WHERE caregiver_id = $1 AND (verified = false OR verified IS NULL)`,
            [caregiver_id]
          )

          for (const ref of refRows) {
            if (!ref.phone) continue

            // Consent check
            const consentGate = await checkCallAllowed({
              caregiverId: caregiver_id,
              consentType: 'reference_calls',
              targetPhone: ref.phone,
              callPurpose: 'Reference verification call'
            })
            if (!consentGate.allowed) {
              calls_skipped.push({ call_type: 'reference_calls', reason: 'Consent not granted' })
              continue
            }

            // Compliance hours check
            const hoursCheck = isWithinCallingHours(ref.phone)
            if (!hoursCheck.allowed) {
              calls_skipped.push({ call_type: 'reference_calls', reason: 'Outside calling hours' })
              continue
            }

            // Fire call
            const cleanPhone = (raw: string) => {
              const digits = raw.replace(/\D/g, '')
              if (digits.length >= 12) return `+${digits}`
              if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
              if (digits.length === 10) return `+1${digits}`
              return `+1${digits}`
            }

            const result = await initiateReferenceCall({
              caregiverFirstName: caregiver.first_name,
              caregiverLastName: caregiver.last_name,
              referenceName: ref.name,
              referencePhone: cleanPhone(ref.phone),
              agencyName: agency.name,
              caregiverId: caregiver_id,
              referenceId: ref.id
            })

            if (result.success) {
              // Insert reference_calls record
              await pool.query(
                `INSERT INTO reference_calls
                  (caregiver_id, reference_id, agency_id, vapi_call_id, status, initiated_by_clerk_id)
                 VALUES ($1, $2, $3, $4, 'initiated', $5)`,
                [caregiver_id, ref.id, agency.id, result.vapiCallId, userId]
              )
              calls_initiated.push(`reference:${ref.id}`)
            }
          }
        } else if (call_type === 'past_employer_calls') {
          // For now, try to get employer from work history if exists
          // In a full implementation, would need work history table
          const { rows: empRows } = await pool.query(
            `SELECT id, employer_name, supervisor_name, employer_phone, job_title
             FROM caregiver_references
             WHERE caregiver_id = $1 AND relationship = 'Employer'
             LIMIT 1`,
            [caregiver_id]
          )

          for (const emp of empRows) {
            if (!emp.employer_phone) continue

            const consentGate = await checkCallAllowed({
              caregiverId: caregiver_id,
              consentType: 'past_employer_calls',
              targetPhone: emp.employer_phone,
              callPurpose: 'Past employer verification call'
            })
            if (!consentGate.allowed) {
              calls_skipped.push({ call_type: 'past_employer_calls', reason: 'Consent not granted' })
              continue
            }

            const hoursCheck = isWithinCallingHours(emp.employer_phone)
            if (!hoursCheck.allowed) {
              calls_skipped.push({ call_type: 'past_employer_calls', reason: 'Outside calling hours' })
              continue
            }

            const cleanPhone = (raw: string) => {
              const digits = raw.replace(/\D/g, '')
              if (digits.length >= 12) return `+${digits}`
              if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
              if (digits.length === 10) return `+1${digits}`
              return `+1${digits}`
            }

            const result = await initiateEmployerCall({
              caregiverFirstName: caregiver.first_name,
              caregiverLastName: caregiver.last_name,
              employerName: emp.employer_name,
              employerPhone: cleanPhone(emp.employer_phone),
              supervisorName: emp.supervisor_name || 'HR',
              agencyName: agency.name,
              caregiverId: caregiver_id,
              employmentId: emp.id,
              jobTitle: emp.job_title || 'Caregiver',
              startDate: 'unknown',
              endDate: 'present'
            })

            if (result.success) {
              await pool.query(
                `INSERT INTO employment_verifications
                  (caregiver_id, agency_id, employment_record_id, employer_name, supervisor_name, employer_phone, job_title, vapi_call_id, status, initiated_by_clerk_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'initiated', $9)`,
                [caregiver_id, agency.id, emp.id, emp.employer_name, emp.supervisor_name, cleanPhone(emp.employer_phone), emp.job_title, result.vapiCallId, userId]
              )
              calls_initiated.push(`employer:${emp.id}`)
            }
          }
        }
      } catch (callError) {
        console.error('Error initiating call:', callError)
        calls_skipped.push({ call_type, reason: 'Call initiation failed' })
      }
    }

    // Calculate estimated completion
    const estimated_completion = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    return NextResponse.json({
      campaign_id: null, // No campaigns table yet
      calls_initiated: calls_initiated.length,
      calls_queued: calls_queued.length,
      calls_skipped,
      estimated_completion,
      analysis
    })

  } catch (error) {
    console.error('Campaign from profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}