// Field Discovery - Capture unknown CSV columns for platform intelligence
// Records unknown fields to caregiver_attributes and field_discovery table

import { Pool, PoolClient } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

function slugifyFieldName(field: string): string {
  return field
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function getFieldLabel(field: string): string {
  // Convert slug back to readable label
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export async function recordUnknownFields(params: {
  unknownFields: Record<string, string>
  caregiverId: string
  agencyId: string
  source: 'csv' | 'resume'
  db: PoolClient
}): Promise<void> {
  const { unknownFields, caregiverId, agencyId, source, db } = params

  if (!unknownFields || Object.keys(unknownFields).length === 0) {
    return
  }

  for (const [fieldLabel, fieldValue] of Object.entries(unknownFields)) {
    const fieldName = slugifyFieldName(fieldLabel)

    // 1. Upsert caregiver_attributes using existing unique constraint
    // The table has (caregiver_id, field_name) as unique
    try {
      await db.query(
        `INSERT INTO caregiver_attributes (caregiver_id, agency_id, field_name, value, source)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (caregiver_id, field_name) DO UPDATE SET
           value = EXCLUDED.value,
           agency_id = COALESCE(caregiver_attributes.agency_id, EXCLUDED.agency_id)`,
        [caregiverId, agencyId, fieldName, JSON.stringify(fieldValue), source]
      )
    } catch (err) {
      console.error('Error inserting caregiver_attributes:', err)
      continue
    }

    // 2. Check if agency has seen this field before
    let isNewForAgency = false
    try {
      const checkResult = await db.query(
        `SELECT 1 FROM caregiver_attributes
         WHERE agency_id = $1 AND field_name = $2 AND caregiver_id != $3
         LIMIT 1`,
        [agencyId, fieldName, caregiverId]
      )
      isNewForAgency = checkResult.rows.length === 0
    } catch {
      isNewForAgency = true
    }

    // 3. Upsert field_discovery - use separate query (outside transaction)
    try {
      await pool.query(
        `INSERT INTO field_discovery
          (field_name, field_label, sample_values, agency_count, caregiver_count, source)
         VALUES ($1, $2, ARRAY[$3], $4, $5, $6)
         ON CONFLICT (field_name) DO UPDATE SET
           sample_values = (
             SELECT ARRAY(
               SELECT DISTINCT unnest(
                 field_discovery.sample_values || ARRAY[$3]
               ) LIMIT 5
             )
           ),
           agency_count = field_discovery.agency_count +
             CASE WHEN $7 THEN 1 ELSE 0 END,
           caregiver_count = field_discovery.caregiver_count + 1,
           last_seen_at = NOW()`,
        [
          fieldName,
          getFieldLabel(fieldName),
          fieldValue,
          isNewForAgency ? 1 : 0,
          1,
          source,
          fieldValue,
          isNewForAgency
        ]
      )
    } catch (err) {
      console.error('Error upserting field_discovery:', err)
    }
  }
}