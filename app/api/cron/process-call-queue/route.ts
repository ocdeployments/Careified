import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getPendingRetries, markRetryProcessing, markRetryCompleted, markRetryFailed, scheduleRetry } from '@/lib/airecruit/retry'
import { initiateReferenceCall } from '@/lib/airecruit/reference-vapi'
import { initiateEmployerCall } from '@/lib/airecruit/employer-vapi'
import { initiateVapiCall } from '@/lib/airecruit/vapi'

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pending retries
    const pendingRetries = await getPendingRetries(10)

    let processed = 0
    let scheduled = 0
    let failed = 0

    for (const retry of pendingRetries) {
      try {
        await markRetryProcessing(retry.id)

        const { call_type, target_phone, target_id, caregiver_id, agency_id, call_params, attempt_number, max_attempts } = retry

        // Get caregiver details
        const { rows: cgRows } = await pool.query(
          `SELECT first_name, last_name FROM caregivers WHERE id = $1`,
          [caregiver_id]
        )
        const caregiver = cgRows[0]

        if (!caregiver) {
          await markRetryFailed(retry.id, 'Caregiver not found')
          failed++
          continue
        }

        // Get agency details
        const { rows: agencyRows } = await pool.query(
          `SELECT name FROM agencies WHERE id = $1`,
          [agency_id]
        )
        const agency = agencyRows[0]

        // Fire the appropriate call type
        let result: { success: boolean; vapiCallId?: string; error?: string } = { success: false, error: 'Unknown call type' }

        if (call_type === 'screening') {
          // Original screening call - need to reconstruct from call_params
          result = await initiateVapiCall({
            phoneNumber: target_phone,
            campaignId: call_params.campaignId || 'retry',
            callId: `retry_${Date.now()}`,
            ...call_params
          })
        } else if (call_type === 'reference') {
          // Need reference details from call_params
          result = await initiateReferenceCall({
            caregiverFirstName: caregiver.first_name,
            caregiverLastName: caregiver.last_name,
            referenceName: call_params.referenceName || 'Reference',
            referencePhone: target_phone,
            agencyName: agency?.name || 'Agency',
            caregiverId: caregiver_id,
            referenceId: target_id
          })
        } else if (call_type === 'employer') {
          result = await initiateEmployerCall({
            caregiverFirstName: caregiver.first_name,
            caregiverLastName: caregiver.last_name,
            employerName: call_params.employerName || 'Employer',
            employerPhone: target_phone,
            supervisorName: call_params.supervisorName || 'HR',
            agencyName: agency?.name || 'Agency',
            caregiverId: caregiver_id,
            employmentId: target_id,
            jobTitle: call_params.jobTitle || 'Caregiver',
            startDate: call_params.startDate || 'unknown',
            endDate: call_params.endDate || 'present'
          })
        } else {
          await markRetryFailed(retry.id, 'Unknown call type')
          failed++
          continue
        }

        if (result.success) {
          await markRetryCompleted(retry.id)
          processed++
        } else {
          // Schedule next retry if not max attempts
          if (attempt_number < max_attempts) {
            await scheduleRetry({
              maxAttempts: max_attempts,
              backoffMinutes: [30, 120, 1440],
              callType: call_type,
              targetPhone: target_phone,
              targetId: target_id,
              caregiverId: caregiver_id,
              agencyId: agency_id,
              callParams: call_params
            }, attempt_number + 1)
            await markRetryFailed(retry.id, 'Call failed, retry scheduled')
            scheduled++
          } else {
            await markRetryFailed(retry.id, 'Max attempts reached')
            failed++
          }
        }
      } catch (callError) {
        console.error('Cron call error:', callError)
        await markRetryFailed(retry.id, callError instanceof Error ? callError.message : 'Unknown error')
        failed++
      }
    }

    return NextResponse.json({
      processed,
      scheduled,
      failed,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron processor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}