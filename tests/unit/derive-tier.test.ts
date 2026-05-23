import { describe, it, expect } from 'vitest'
import { deriveTier, deriveTierLabel, type EvidenceRow } from '@/lib/verification/derive-tier'

describe('deriveTier', () => {
  const baseDate = new Date('2026-01-01')

  it('[] -> 4', () => {
    expect(deriveTier([], baseDate)).toBe(4)
  })

  it('[self_attestation, verified] -> 4', () => {
    const evidence: EvidenceRow[] = [
      { source: 'self_attestation', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(4)
  })

  it('[document_upload, verified, no expiry] -> 2', () => {
    const evidence: EvidenceRow[] = [
      { source: 'document_upload', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(2)
  })

  it('[document_upload, verified, expired] -> 4', () => {
    const evidence: EvidenceRow[] = [
      { source: 'document_upload', verified_at: new Date('2024-06-01'), expires_at: new Date('2025-06-01') },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(4)
  })

  it('[reference_call, verified] -> 3', () => {
    const evidence: EvidenceRow[] = [
      { source: 'reference_call', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(3)
  })

  it('[background_check_api, verified] -> 1', () => {
    const evidence: EvidenceRow[] = [
      { source: 'background_check_api', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(1)
  })

  it('[document_upload + hscpoa_register both valid] -> 1', () => {
    const evidence: EvidenceRow[] = [
      { source: 'document_upload', verified_at: new Date('2025-06-01'), expires_at: null },
      { source: 'hscpoa_register', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(1)
  })

  it('[verified_at null] -> ignored -> 4', () => {
    const evidence: EvidenceRow[] = [
      { source: 'document_upload', verified_at: null, expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(4)
  })

  it('[hscpoa expired + document_upload valid] -> 2', () => {
    const evidence: EvidenceRow[] = [
      { source: 'hscpoa_register', verified_at: new Date('2024-06-01'), expires_at: new Date('2025-06-01') },
      { source: 'document_upload', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(2)
  })

  it('unknown source -> treated as 4', () => {
    const evidence: EvidenceRow[] = [
      { source: 'unknown_provider', verified_at: new Date('2025-06-01'), expires_at: null },
    ]
    expect(deriveTier(evidence, baseDate)).toBe(4)
  })
})

describe('deriveTierLabel', () => {
  it('returns correct labels', () => {
    expect(deriveTierLabel(1)).toBe('System verified')
    expect(deriveTierLabel(2)).toBe('Document on file')
    expect(deriveTierLabel(3)).toBe('Reference confirmed')
    expect(deriveTierLabel(4)).toBe('Self reported')
  })
})