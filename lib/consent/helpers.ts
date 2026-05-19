// Careified — Consent helper functions
// All consent reads/writes go through these — never query the table directly

import { Pool } from 'pg'
import { ConsentTypeId, ConsentMethod, getConsentType } from './types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export interface ConsentRecord {
  id: string
  caregiverId: string
  consentType: string
  consentVersion: number
  granted: boolean
  grantedAt: Date
  revokedAt: Date | null
  consentMethod: string
  specificTarget: string | null
}

export interface ConsentRequestMeta {
  ipAddress?: string
  userAgent?: string
  method: ConsentMethod
  specificTarget?: string
  notes?: string
}

export async function grantConsent(
  caregiverId: string,
  type: ConsentTypeId,
  meta: ConsentRequestMeta
): Promise<void> {
  const consentType = getConsentType(type)
  await pool.query(
    `INSERT INTO caregiver_communication_consents
     (caregiver_id, consent_type, consent_version, granted, ip_address, user_agent, consent_method, specific_target, notes)
     VALUES ($1, $2, $3, true, $4, $5, $6, $7, $8)`,
    [caregiverId, type, consentType.version, meta.ipAddress || null, meta.userAgent || null, meta.method, meta.specificTarget || null, meta.notes || null]
  )
}

export async function revokeConsent(
  caregiverId: string,
  type: ConsentTypeId,
  specificTarget?: string
): Promise<void> {
  await pool.query(
    `UPDATE caregiver_communication_consents
     SET revoked_at = NOW()
     WHERE caregiver_id = $1 AND consent_type = $2
     AND ($3::text IS NULL OR specific_target = $3)
     AND revoked_at IS NULL`,
    [caregiverId, type, specificTarget || null]
  )
}

export async function hasActiveConsent(
  caregiverId: string,
  type: ConsentTypeId,
  specificTarget?: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM caregiver_communication_consents
     WHERE caregiver_id = $1 AND consent_type = $2 AND granted = true AND revoked_at IS NULL
     AND ($3::text IS NULL OR specific_target = $3 OR specific_target IS NULL)
     LIMIT 1`,
    [caregiverId, type, specificTarget || null]
  )
  return result.rows.length > 0
}

export async function getCaregiverConsents(caregiverId: string): Promise<ConsentRecord[]> {
  const result = await pool.query(
    `SELECT id, caregiver_id, consent_type, consent_version, granted, granted_at, revoked_at, consent_method, specific_target
     FROM caregiver_communication_consents
     WHERE caregiver_id = $1
     ORDER BY granted_at DESC`,
    [caregiverId]
  )
  return result.rows.map(r => ({
    id: r.id,
    caregiverId: r.caregiver_id,
    consentType: r.consent_type,
    consentVersion: r.consent_version,
    granted: r.granted,
    grantedAt: r.granted_at,
    revokedAt: r.revoked_at,
    consentMethod: r.consent_method,
    specificTarget: r.specific_target,
  }))
}

export async function requireConsent(
  caregiverId: string,
  type: ConsentTypeId,
  specificTarget?: string
): Promise<void> {
  const allowed = await hasActiveConsent(caregiverId, type, specificTarget)
  if (!allowed) {
    throw new Error(`Consent missing for ${type}${specificTarget ? ` (target: ${specificTarget})` : ''}`)
  }
}
