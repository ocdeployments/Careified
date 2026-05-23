import { pool } from '@/lib/db'
import { deriveTier, deriveTierLabel, type EvidenceRow } from './derive-tier'

export interface VerifiedClaim {
  claimRef: string
  kind: 'reference' | 'employment' | 'certification' | 'disclosure'
  label: string
  detail: string
  tier: number
  tierLabel: string
  evidence: EvidenceRow[]
}

function mapSource(source: string | null): string {
  if (source === 'ai_call') return 'reference_call'
  if (source === 'agency_confirmation') return 'agency_confirmation'
  if (source === 'background_check_api') return 'background_check_api'
  if (source === 'document_upload') return 'document_upload'
  return 'reference_call'
}

export async function getCaregiverVerification(caregiverId: string): Promise<VerifiedClaim[]> {
  if (!caregiverId) return []

  // 1. caregiver_references
  const refsResult = await pool.query(
    `SELECT id, name, relationship, verified, verification_source, verified_at
     FROM caregiver_references WHERE caregiver_id = $1`,
    [caregiverId]
  )

  // 2. employment_verifications
  const empResult = await pool.query(
    `SELECT id, employer_name, job_title, employment_confirmed, completed_at
     FROM employment_verifications WHERE caregiver_id = $1`,
    [caregiverId]
  )

  // 3. caregiver_certifications
  const certResult = await pool.query(
    `SELECT id, certification, issuing_org, expiry_date, status
     FROM caregiver_certifications WHERE caregiver_id = $1`,
    [caregiverId]
  )

  // 4. caregiver_disclosures
  const discResult = await pool.query(
    `SELECT question_key, answer, detail, attested_at
     FROM caregiver_disclosures WHERE caregiver_id = $1`,
    [caregiverId]
  )

  // 5. verification_evidence
  const evidenceResult = await pool.query(
    `SELECT claim_ref, source, verified_at, expires_at, verified_by, method_note
     FROM verification_evidence WHERE caregiver_id = $1`,
    [caregiverId]
  )

  // Group verification_evidence by claim_ref
  const evidenceByClaim: Record<string, EvidenceRow[]> = {}
  for (const row of evidenceResult.rows) {
    const claimRef = row.claim_ref
    if (!evidenceByClaim[claimRef]) {
      evidenceByClaim[claimRef] = []
    }
    evidenceByClaim[claimRef].push({
      source: row.source,
      verified_at: row.verified_at,
      expires_at: row.expires_at,
    })
  }

  const claims: VerifiedClaim[] = []

  // Process references
  for (const ref of refsResult.rows) {
    const claimRef = `reference:${ref.id}`
    const intrinsicEvidence: EvidenceRow[] = ref.verified
      ? [{ source: mapSource(ref.verification_source), verified_at: ref.verified_at, expires_at: null }]
      : [{ source: 'self_attestation', verified_at: null, expires_at: null }]

    const combined = [...intrinsicEvidence, ...(evidenceByClaim[claimRef] || [])]
    const tier = deriveTier(combined)

    claims.push({
      claimRef,
      kind: 'reference',
      label: `${ref.relationship} Reference`,
      detail: ref.name || ref.relationship,
      tier,
      tierLabel: deriveTierLabel(tier),
      evidence: combined,
    })
  }

  // Process employment
  for (const emp of empResult.rows) {
    const claimRef = `employment:${emp.id}`
    const intrinsicEvidence: EvidenceRow[] = emp.employment_confirmed
      ? [{ source: 'reference_call', verified_at: emp.completed_at, expires_at: null }]
      : [{ source: 'self_attestation', verified_at: null, expires_at: null }]

    const combined = [...intrinsicEvidence, ...(evidenceByClaim[claimRef] || [])]
    const tier = deriveTier(combined)

    claims.push({
      claimRef,
      kind: 'employment',
      label: emp.job_title || 'Employment',
      detail: emp.employer_name,
      tier,
      tierLabel: deriveTierLabel(tier),
      evidence: combined,
    })
  }

  // Process certifications
  for (const cert of certResult.rows) {
    const claimRef = `certification:${cert.id}`
    const intrinsicEvidence: EvidenceRow[] = [{
      source: 'self_attestation',
      verified_at: null,
      expires_at: cert.expiry_date,
    }]

    const combined = [...intrinsicEvidence, ...(evidenceByClaim[claimRef] || [])]
    const tier = deriveTier(combined)

    claims.push({
      claimRef,
      kind: 'certification',
      label: cert.certification,
      detail: cert.issuing_org || '',
      tier,
      tierLabel: deriveTierLabel(tier),
      evidence: combined,
    })
  }

  // Process disclosures
  for (const disc of discResult.rows) {
    const claimRef = `disclosure:${disc.question_key}`
    const intrinsicEvidence: EvidenceRow[] = [{
      source: 'self_attestation',
      verified_at: disc.attested_at,
      expires_at: null,
    }]

    const combined = [...intrinsicEvidence, ...(evidenceByClaim[claimRef] || [])]
    const tier = deriveTier(combined)

    claims.push({
      claimRef,
      kind: 'disclosure',
      label: disc.question_key,
      detail: disc.answer || disc.detail || '',
      tier,
      tierLabel: deriveTierLabel(tier),
      evidence: combined,
    })
  }

  return claims
}