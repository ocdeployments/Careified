// Careified — Caregiver Trust Score Engine
// Calculates CTS from events with recency weighting

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// =============================================================================
// Constants (per spec)
// =============================================================================

const WEIGHTS = {
  reliability: 0.35,
  referenceQuality: 0.25,
  clinicalCredibility: 0.20,
  tenureSignal: 0.12,
  professionalism: 0.08,
}

const EVENT_WEIGHTS: Record<string, { dimension: string; baseWeight: number }> = {
  // Reliability (35%)
  show_up: { dimension: 'reliability', baseWeight: 1.0 },
  cancellation: { dimension: 'reliability', baseWeight: -0.8 },
  late_arrival: { dimension: 'reliability', baseWeight: -0.5 },
  no_show: { dimension: 'reliability', baseWeight: -1.0 },
  shift_completed: { dimension: 'reliability', baseWeight: 0.8 },

  // Reference Quality (25%)
  reference_completed: { dimension: 'referenceQuality', baseWeight: 0.6 },
  reference_rehire_yes: { dimension: 'referenceQuality', baseWeight: 1.0 },
  reference_rehire_no: { dimension: 'referenceQuality', baseWeight: -0.5 },

  // Clinical Credibility (20%)
  credential_added: { dimension: 'clinicalCredibility', baseWeight: 0.7 },
  training_completed: { dimension: 'clinicalCredibility', baseWeight: 0.5 },
  certification_renewed: { dimension: 'clinicalCredibility', baseWeight: 0.6 },

  // Tenure Signal (12%)
  placement_started: { dimension: 'tenureSignal', baseWeight: 0.3 },
  placement_completed: { dimension: 'tenureSignal', baseWeight: 0.4 },
  placement_extended: { dimension: 'tenureSignal', baseWeight: 0.5 },

  // Professionalism (8%)
  document_submitted: { dimension: 'professionalism', baseWeight: 0.4 },
  response_quick: { dimension: 'professionalism', baseWeight: 0.5 },
  response_slow: { dimension: 'professionalism', baseWeight: -0.3 },
}

const RECENCY_DECAY = {
  months6: 0.5,   // 50% weight
  months12: 0.2,  // 20% weight
  months18: 0,    // archived, removed
}

const TIER_THRESHOLDS = {
  platinum: 90,
  gold: 75,
  silver: 60,
}

const MIN_SHIFTS_FOR_DISPLAY = 5

// =============================================================================
// Types
// =============================================================================

export interface ScoreEvent {
  id: string
  caregiver_id: string
  event_type: string
  weight: number
  adjusted_weight: number | null
  agency_id: string | null
  placement_id: string | null
  notes: string | null
  disputed: boolean
  dispute_status: string | null
  created_at: Date
}

export interface ScoreSnapshot {
  id: string
  caregiver_id: string
  reliability: number
  reference_quality: number
  clinical_credibility: number
  tenure_signal: number
  professionalism: number
  total_score: number
  tier: string
  shift_count: number
  calculated_at: Date
}

export interface ScoreResult {
  caregiverId: string
  reliability: number
  referenceQuality: number
  clinicalCredibility: number
  tenureSignal: number
  professionalism: number
  totalScore: number
  tier: string
  shiftCount: number
  eligibleForDisplay: boolean
  message?: string
}

// =============================================================================
// Helper Functions
// =============================================================================

function calculateRecencyMultiplier(eventAgeMonths: number): number {
  if (eventAgeMonths < 6) return 1.0
  if (eventAgeMonths < 12) return RECENCY_DECAY.months6
  if (eventAgeMonths < 18) return RECENCY_DECAY.months12
  return RECENCY_DECAY.months18 // archived
}

function getEventAgeMonths(createdAt: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  return diffMs / (1000 * 60 * 60 * 24 * 30)
}

function calculateDimensionScore(events: ScoreEvent[], dimension: string): number {
  const relevantEvents = events.filter(e => {
    const config = EVENT_WEIGHTS[e.event_type]
    return config?.dimension === dimension && !e.disputed
  })

  if (relevantEvents.length === 0) return 50 // neutral

  let totalWeight = 0
  let weightedSum = 0

  for (const event of relevantEvents) {
    const config = EVENT_WEIGHTS[event.event_type]
    const ageMonths = getEventAgeMonths(event.created_at)
    const recencyMult = calculateRecencyMultiplier(ageMonths)
    const adjustedWeight = config.baseWeight * recencyMult

    totalWeight += Math.abs(adjustedWeight)
    weightedSum += adjustedWeight
  }

  // Convert to 0-100 scale
  // Base 50 + weighted average of event impacts
  const score = 50 + (weightedSum / (totalWeight || 1)) * 50
  return Math.max(0, Math.min(100, score))
}

function determineTier(score: number): string {
  if (score >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (score >= TIER_THRESHOLDS.gold) return 'gold'
  if (score >= TIER_THRESHOLDS.silver) return 'silver'
  return 'needs_review'
}

// =============================================================================
// Main Functions
// =============================================================================

export async function calculateCaregiverScore(caregiverId: string): Promise<ScoreResult> {
  // Fetch all non-archived events
  const { rows: events } = await pool.query<ScoreEvent>(
    `SELECT * FROM caregiver_score_events
     WHERE caregiver_id = $1
     AND created_at > NOW() - INTERVAL '18 months'
     ORDER BY created_at DESC`,
    [caregiverId]
  )

  // Count verified shifts (for eligibility)
  const shiftEvents = events.filter(e =>
    ['show_up', 'shift_completed', 'placement_started', 'placement_completed'].includes(e.event_type)
  )
  const shiftCount = shiftEvents.length

  // Calculate each dimension
  const reliability = calculateDimensionScore(events, 'reliability')
  const referenceQuality = calculateDimensionScore(events, 'referenceQuality')
  const clinicalCredibility = calculateDimensionScore(events, 'clinicalCredibility')
  const tenureSignal = calculateDimensionScore(events, 'tenureSignal')
  const professionalism = calculateDimensionScore(events, 'professionalism')

  // Weighted total
  const totalScore = Math.round(
    reliability * WEIGHTS.reliability +
    referenceQuality * WEIGHTS.referenceQuality +
    clinicalCredibility * WEIGHTS.clinicalCredibility +
    tenureSignal * WEIGHTS.tenureSignal +
    professionalism * WEIGHTS.professionalism
  )

  const tier = determineTier(totalScore)

  // Check eligibility
  const eligibleForDisplay = shiftCount >= MIN_SHIFTS_FOR_DISPLAY

  let message: string | undefined
  if (!eligibleForDisplay) {
    message = `${MIN_SHIFTS_FOR_DISPLAY - shiftCount} more verified shifts needed before score is displayed`
  }

  return {
    caregiverId,
    reliability: Math.round(reliability),
    referenceQuality: Math.round(referenceQuality),
    clinicalCredibility: Math.round(clinicalCredibility),
    tenureSignal: Math.round(tenureSignal),
    professionalism: Math.round(professionalism),
    totalScore,
    tier,
    shiftCount,
    eligibleForDisplay,
    message,
  }
}

export async function saveScoreSnapshot(result: ScoreResult): Promise<void> {
  await pool.query(
    `INSERT INTO caregiver_score_snapshots (
      caregiver_id, reliability, reference_quality, clinical_credibility,
      tenure_signal, professionalism, total_score, tier, shift_count, calculated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (caregiver_id) DO UPDATE SET
      reliability = EXCLUDED.reliability,
      reference_quality = EXCLUDED.reference_quality,
      clinical_credibility = EXCLUDED.clinical_credibility,
      tenure_signal = EXCLUDED.tenure_signal,
      professionalism = EXCLUDED.professionalism,
      total_score = EXCLUDED.total_score,
      tier = EXCLUDED.tier,
      shift_count = EXCLUDED.shift_count,
      calculated_at = NOW()`,
    [
      result.caregiverId,
      result.reliability,
      result.referenceQuality,
      result.clinicalCredibility,
      result.tenureSignal,
      result.professionalism,
      result.totalScore,
      result.tier,
      result.shiftCount,
    ]
  )
}

export async function getCaregiverScore(caregiverId: string): Promise<ScoreResult | null> {
  // Try snapshot first (faster)
  const { rows: snapshots } = await pool.query<ScoreSnapshot>(
    `SELECT * FROM caregiver_score_snapshots WHERE caregiver_id = $1`,
    [caregiverId]
  )

  if (snapshots.length > 0) {
    const s = snapshots[0]
    return {
      caregiverId: s.caregiver_id,
      reliability: s.reliability,
      referenceQuality: s.reference_quality,
      clinicalCredibility: s.clinical_credibility,
      tenureSignal: s.tenure_signal,
      professionalism: s.professionalism,
      totalScore: s.total_score,
      tier: s.tier,
      shiftCount: s.shift_count,
      eligibleForDisplay: s.shift_count >= MIN_SHIFTS_FOR_DISPLAY,
    }
  }

  // Calculate if no snapshot
  return calculateCaregiverScore(caregiverId)
}

export { pool }