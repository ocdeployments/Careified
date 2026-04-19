// lib/matching/caregiver-loader.ts
import { Pool } from 'pg'
import { getAttributeMap, tierToConfidence, type AttributeTier } from '@/lib/attributes'
import type { CaregiverForMatching } from './types'

/**
 * Per-field source + tier info, used when computing dimension confidence.
 */
export type CaregiverWithProvenance = CaregiverForMatching & {
  _provenance: Record<string, { source: string; tier: AttributeTier; confidence: number }>
}

/**
 * Load a caregiver for matching, merging data from caregivers row + attributes table.
 * Attributes table is the source of truth when present; caregivers row is fallback.
 * Provenance map records tier/source/confidence per field.
 */
export async function loadCaregiverForMatchingV2(
  pool: Pool,
  caregiverId: string
): Promise<CaregiverWithProvenance | null> {
  // Load base row (for fields not yet migrated or for shape compatibility)
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name,
      specializations, credentials, placement_types, languages,
      years_experience, hourly_rate, hourly_rate_max, gender,
      city, state, postal_code, travel_radius,
      has_vehicle, willing_live_in, willing_overnight,
      availability_status,
      client_preferences, environment_comfort, motivation,
      reliability_metrics
    FROM caregivers WHERE id = $1 AND status = 'approved'`,
    [caregiverId]
  )
  if (rows.length === 0) return null
  const base = rows[0] as CaregiverForMatching

  // Load attributes
  const attrMap = await getAttributeMap(pool, caregiverId)

  const provenance: Record<string, { source: string; tier: AttributeTier; confidence: number }> = {}

  // Override base fields with attribute values where present, record provenance.
  const merged: CaregiverForMatching = { ...base }

  const overridableFields: (keyof CaregiverForMatching)[] = [
    'specializations', 'credentials', 'placement_types', 'languages',
    'years_experience', 'hourly_rate', 'hourly_rate_max', 'gender',
    'city', 'state', 'postal_code', 'travel_radius',
    'has_vehicle', 'willing_live_in', 'willing_overnight',
    'availability_status',
    'client_preferences', 'environment_comfort', 'motivation',
    'reliability_metrics',
  ]

  for (const field of overridableFields) {
    const attr = attrMap[field as string]
    if (attr) {
      ;(merged as Record<string, unknown>)[field] = attr.value
      provenance[field as string] = {
        source: attr.source,
        tier: attr.tier,
        confidence: tierToConfidence(attr.tier),
      }
    } else if (base[field] != null) {
      // Fallback: base column exists but no attribute row — treat as Tier 4 self-reported
      provenance[field as string] = {
        source: 'caregivers_table_fallback',
        tier: 4,
        confidence: tierToConfidence(4),
      }
    }
  }

  return { ...merged, _provenance: provenance }
}

export async function loadAllApprovedCaregiversV2(
  pool: Pool
): Promise<CaregiverWithProvenance[]> {
  const { rows } = await pool.query(
    `SELECT id FROM caregivers WHERE status = 'approved'`
  )
  const result: CaregiverWithProvenance[] = []
  for (const { id } of rows) {
    const cg = await loadCaregiverForMatchingV2(pool, id)
    if (cg) result.push(cg)
  }
  return result
}

/**
 * Get provenance for specific fields. Returns lowest confidence found
 * (pessimistic — a dimension is only as strong as its weakest input).
 */
export function lowestConfidenceFor(
  cg: CaregiverWithProvenance,
  fields: string[]
): { confidence: number; tier: AttributeTier; source: string; attributes_used: string[] } {
  let minConfidence = 1.0
  let minTier: AttributeTier = 1
  const sourceAgg: string[] = []
  const attrsUsed: string[] = []

  for (const f of fields) {
    const p = cg._provenance[f]
    if (!p) continue
    attrsUsed.push(f)
    if (p.confidence < minConfidence) {
      minConfidence = p.confidence
      minTier = p.tier
    }
    if (!sourceAgg.includes(p.source)) sourceAgg.push(p.source)
  }

  return {
    confidence: attrsUsed.length > 0 ? minConfidence : 0,
    tier: minTier,
    source: sourceAgg.join('+') || 'none',
    attributes_used: attrsUsed,
  }
}
