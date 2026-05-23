import type { AttributeTier } from '@/lib/attributes'
import { TIER_LABELS } from '@/lib/attributes'

export type EvidenceRow = {
  source: string // verification_evidence.source values
  verified_at: Date | string | null
  expires_at: Date | string | null
}

const SOURCE_TIER: Record<string, AttributeTier> = {
  hscpoa_register: 1,
  cno_register: 1,
  id_verification_api: 1,
  background_check_api: 1,
  document_upload: 2,
  reference_call: 3,
  agency_confirmation: 3,
  self_attestation: 4,
}

export function deriveTier(evidence: EvidenceRow[], now: Date = new Date()): AttributeTier {
  const valid = evidence.filter(e => {
    if (e.verified_at == null) return false
    if (e.expires_at == null) return true
    return new Date(e.expires_at) > now
  })

  if (valid.length === 0) return 4

  // strongest tier = lowest number
  return valid.reduce<AttributeTier>((best, e) => {
    const t = SOURCE_TIER[e.source] ?? 4
    return t < best ? t : best
  }, 4)
}

export function deriveTierLabel(tier: AttributeTier): string {
  return TIER_LABELS[tier]
}