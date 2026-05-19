// Careified — AIRecruit Retry Logic
// Intelligent backoff for failed Vapi calls

import { Pool } from 'pg'
import { isWithinCallingHours } from './calling-hours'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export interface RetryConfig {
  maxAttempts: number
  backoffMinutes: number[]
  callType: string
  targetPhone: string
  targetId: string
  caregiverId: string
  agencyId: string
  callParams: Record<string, unknown>
}

export async function scheduleRetry(
  config: RetryConfig,
  attemptNumber: number
): Promise<void> {
  const { maxAttempts, backoffMinutes, callType, targetPhone, targetId, caregiverId, agencyId, callParams } = config

  // Validate attempt number
  if (attemptNumber > maxAttempts) {
    console.warn('[RETRY] Max attempts reached:', { callType, targetId, attemptNumber })
    await pool.query(
      `UPDATE call_retry_queue
       SET status = 'failed', last_error = 'Max attempts reached'
       WHERE target_id = $1 AND call_type = $2`,
      [targetId, callType]
    )
    return
  }

  // Calculate scheduled time
  const backoffIndex = Math.min(attemptNumber - 1, backoffMinutes.length - 1)
  const baseDelayMinutes = backoffMinutes[backoffIndex] || 30
  let scheduledFor = new Date(Date.now() + baseDelayMinutes * 60 * 1000)

  // Check compliance hours for the scheduled time
  const compliance = isWithinCallingHours(targetPhone, scheduledFor)
  if (!compliance.allowed) {
    // Default to 9am next day
    scheduledFor = new Date()
    scheduledFor.setHours(9, 0, 0, 0)
    if (scheduledFor <= new Date()) {
      scheduledFor.setDate(scheduledFor.getDate() + 1)
    }
    // Try again - if still not compliant, add another day
    let checkCount = 0
    while (!isWithinCallingHours(targetPhone, scheduledFor).allowed && checkCount < 7) {
      scheduledFor.setDate(scheduledFor.getDate() + 1)
      checkCount++
    }
  }

  // Insert retry queue record
  await pool.query(
    `INSERT INTO call_retry_queue
      (call_type, target_phone, target_id, caregiver_id, agency_id, call_params, attempt_number, max_attempts, scheduled_for, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
     ON CONFLICT DO NOTHING`,
    [callType, targetPhone, targetId, caregiverId, agencyId, JSON.stringify(callParams), attemptNumber, maxAttempts, scheduledFor]
  )

  console.warn('[RETRY] Scheduled:', { callType, targetId, attemptNumber, scheduledFor: scheduledFor.toISOString() })
}

export async function cancelRetries(caregiverId: string, callType: string): Promise<void> {
  await pool.query(
    `UPDATE call_retry_queue
     SET status = 'cancelled'
     WHERE caregiver_id = $1 AND call_type = $2 AND status = 'pending'`,
    [caregiverId, callType]
  )
}

export async function getPendingRetries(limit: number = 10): Promise<any[]> {
  const { rows } = await pool.query(
    `SELECT id, call_type, target_phone, target_id, caregiver_id, agency_id, call_params, attempt_number, max_attempts
     FROM call_retry_queue
     WHERE status = 'pending' AND scheduled_for <= NOW()
     ORDER BY scheduled_for ASC
     LIMIT $1`,
    [limit]
  )
  return rows
}

export async function markRetryProcessing(retryId: string): Promise<void> {
  await pool.query(
    `UPDATE call_retry_queue SET status = 'processing' WHERE id = $1`,
    [retryId]
  )
}

export async function markRetryCompleted(retryId: string): Promise<void> {
  await pool.query(
    `UPDATE call_retry_queue SET status = 'completed', processed_at = NOW() WHERE id = $1`,
    [retryId]
  )
}

export async function markRetryFailed(retryId: string, error: string): Promise<void> {
  await pool.query(
    `UPDATE call_retry_queue SET status = 'failed', last_error = $1, processed_at = NOW() WHERE id = $2`,
    [error, retryId]
  )
}