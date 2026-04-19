// lib/consent/capture.ts
import { Pool } from 'pg'
import { getLegalTextForConsent, type ConsentType } from '@/lib/legal/text'

export type ConsentCapture = {
  consentType: ConsentType
  granted: boolean
  ipAddress?: string
  userAgent?: string
}

export async function recordCaregiverConsent(
  pool: Pool,
  caregiverId: string,
  input: ConsentCapture
): Promise<string> {
  const { text, version, hash } = getLegalTextForConsent(input.consentType)
  const { rows } = await pool.query(
    `INSERT INTO caregiver_consents (
      caregiver_id, consent_type, legal_text_version, legal_text_hash,
      granted, ip_address, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id`,
    [
      caregiverId, input.consentType, version, hash,
      input.granted, input.ipAddress || null, input.userAgent || null,
    ]
  )
  return rows[0].id
}

export async function recordAgencyConsent(
  pool: Pool,
  agencyId: string,
  clerkUserId: string,
  input: ConsentCapture
): Promise<string> {
  const { version, hash } = getLegalTextForConsent(input.consentType)
  const { rows } = await pool.query(
    `INSERT INTO agency_consents (
      agency_id, clerk_user_id, consent_type, legal_text_version, legal_text_hash,
      granted, ip_address, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id`,
    [
      agencyId, clerkUserId, input.consentType, version, hash,
      input.granted, input.ipAddress || null, input.userAgent || null,
    ]
  )
  return rows[0].id
}

export async function recordClientDataConsent(
  pool: Pool,
  agencyId: string,
  clerkUserId: string,
  clientNeedsId: string | null,
  authorizationConfirmed: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const { version, hash } = getLegalTextForConsent('client_data_authorization')
  const { rows } = await pool.query(
    `INSERT INTO client_data_consents (
      agency_id, client_needs_id, clerk_user_id,
      authorization_confirmed, legal_text_version, legal_text_hash,
      ip_address, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING id`,
    [
      agencyId, clientNeedsId, clerkUserId,
      authorizationConfirmed, version, hash,
      ipAddress || null, userAgent || null,
    ]
  )
  return rows[0].id
}

/**
 * Check whether a caregiver has granted a given consent type
 * at the current legal text version.
 */
export async function hasCurrentCaregiverConsent(
  pool: Pool,
  caregiverId: string,
  consentType: ConsentType
): Promise<boolean> {
  const { version } = getLegalTextForConsent(consentType)
  const { rows } = await pool.query(
    `SELECT 1 FROM caregiver_consents
    WHERE caregiver_id = $1 AND consent_type = $2
    AND legal_text_version = $3 AND granted = true
    AND revoked_at IS NULL
    LIMIT 1`,
    [caregiverId, consentType, version]
  )
  return rows.length > 0
}

export async function hasCurrentAgencyConsent(
  pool: Pool,
  agencyId: string,
  consentType: ConsentType
): Promise<boolean> {
  const { version } = getLegalTextForConsent(consentType)
  const { rows } = await pool.query(
    `SELECT 1 FROM agency_consents
    WHERE agency_id = $1 AND consent_type = $2
    AND legal_text_version = $3 AND granted = true
    AND revoked_at IS NULL
    LIMIT 1`,
    [agencyId, consentType, version]
  )
  return rows.length > 0
}
