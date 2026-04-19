// lib/attributes/index.ts
import { Pool } from 'pg'

export type AttributeTier = 1 | 2 | 3 | 4
export type AttributeStatus = 'active' | 'expired' | 'revoked' | 'pending'

export type CaregiverAttribute = {
  id: string
  caregiver_id: string
  field_name: string
  value: unknown
  source: string
  tier: AttributeTier
  verified_at: string
  expires_at: string | null
  status: AttributeStatus
  metadata: Record<string, unknown>
}

export type AttributeInput = {
  caregiverId: string
  fieldName: string
  value: unknown
  source: string
  tier: AttributeTier
  expiresAt?: Date | null
  metadata?: Record<string, unknown>
}

/**
 * Upsert an attribute. If an active attribute with the same field_name exists,
 * it is marked revoked and a new row is inserted. This preserves full history.
 */
export async function upsertAttribute(
  pool: Pool,
  input: AttributeInput
): Promise<CaregiverAttribute> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Revoke any active prior attributes for this field
    await client.query(
      `UPDATE caregiver_attributes
      SET status = 'revoked', updated_at = now()
      WHERE caregiver_id = $1 AND field_name = $2 AND status = 'active'`,
      [input.caregiverId, input.fieldName]
    )

    // Insert new
    const { rows } = await client.query(
      `INSERT INTO caregiver_attributes (
        caregiver_id, field_name, value, source, tier,
        expires_at, status, metadata
      ) VALUES ($1,$2,$3,$4,$5,$6,'active',$7)
      RETURNING *`,
      [
        input.caregiverId,
        input.fieldName,
        JSON.stringify(input.value),
        input.source,
        input.tier,
        input.expiresAt ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    )

    await client.query('COMMIT')
    return rows[0] as CaregiverAttribute
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Load all active attributes for a caregiver.
 */
export async function loadCaregiverAttributes(
  pool: Pool,
  caregiverId: string
): Promise<CaregiverAttribute[]> {
  const { rows } = await pool.query(
    `SELECT * FROM caregiver_attributes
    WHERE caregiver_id = $1 AND status = 'active'
    ORDER BY field_name`,
    [caregiverId]
  )
  return rows as CaregiverAttribute[]
}

/**
 * Get a single active attribute by field name.
 */
export async function getAttribute(
  pool: Pool,
  caregiverId: string,
  fieldName: string
): Promise<CaregiverAttribute | null> {
  const { rows } = await pool.query(
    `SELECT * FROM caregiver_attributes
    WHERE caregiver_id = $1 AND field_name = $2 AND status = 'active'
    LIMIT 1`,
    [caregiverId, fieldName]
  )
  return (rows[0] as CaregiverAttribute) ?? null
}

/**
 * Build a flat field→{value,source,tier} map for a caregiver.
 * Convenient for match score and UI consumption.
 */
export async function getAttributeMap(
  pool: Pool,
  caregiverId: string
): Promise<Record<string, { value: unknown; source: string; tier: AttributeTier; expires_at: string | null }>> {
  const attrs = await loadCaregiverAttributes(pool, caregiverId)
  const map: Record<string, { value: unknown; source: string; tier: AttributeTier; expires_at: string | null }> = {}
  for (const a of attrs) {
    map[a.field_name] = {
      value: a.value,
      source: a.source,
      tier: a.tier,
      expires_at: a.expires_at,
    }
  }
  return map
}

/**
 * Tier → confidence scalar for match score weighting.
 * Tier 1 = fully verified by automated source, Tier 4 = self-reported only.
 */
export function tierToConfidence(tier: AttributeTier): number {
  switch (tier) {
    case 1: return 1.0
    case 2: return 0.75
    case 3: return 0.55
    case 4: return 0.35
  }
}

/**
 * Human-readable tier labels for UI.
 */
export const TIER_LABELS: Record<AttributeTier, string> = {
  1: 'System verified',
  2: 'Document on file',
  3: 'Reference confirmed',
  4: 'Self reported',
}
