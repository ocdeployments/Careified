// Careified — AIRecruit consent gate
// All Vapi calls must pass through checkCallAllowed before dialing

import { Pool } from 'pg'
import { hasActiveConsent, requireConsent } from '@/lib/consent/helpers'
import { ConsentTypeId, requiresPerCallConfirmation } from '@/lib/consent/types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export interface CallGateRequest {
  caregiverId: string
  consentType: ConsentTypeId
  targetPhone: string
  callPurpose: string
}

export interface CallGateResult {
  allowed: boolean
  reason?: string
  requiresPerCallConfirm?: boolean
}

export async function checkCallAllowed(req: CallGateRequest): Promise<CallGateResult> {
  const hasGeneral = await hasActiveConsent(req.caregiverId, req.consentType)

  if (!hasGeneral) {
    await logBlockedCall(req, 'no_general_consent')
    return { allowed: false, reason: 'Caregiver has not granted consent for this call type' }
  }

  if (requiresPerCallConfirmation(req.consentType)) {
    const hasPerCall = await hasActiveConsent(req.caregiverId, req.consentType, req.targetPhone)
    if (!hasPerCall) {
      return {
        allowed: false,
        requiresPerCallConfirm: true,
        reason: 'Per-call confirmation required for high-risk calls',
      }
    }
  }

  return { allowed: true }
}

export async function requireCallAllowed(req: CallGateRequest): Promise<void> {
  const result = await checkCallAllowed(req)
  if (!result.allowed) {
    throw new Error(result.reason || 'Call not allowed — consent missing')
  }
}

async function logBlockedCall(req: CallGateRequest, reason: string): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
      [
        'call_blocked_no_consent',
        'caregiver',
        req.caregiverId,
        JSON.stringify({ consentType: req.consentType, callPurpose: req.callPurpose, blockReason: reason }),
      ]
    )
  } catch (err) {
    console.error('Failed to log blocked call:', err)
  }
}
