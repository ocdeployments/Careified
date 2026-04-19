// lib/matching/gates.ts
import type { CaregiverForMatching, MatchNeed } from './types'

export type GateResult = {
  passed: boolean
  failed: string[] // which gates failed
}

/**
 * Run hard filter gates. If any fail, caregiver is excluded entirely.
 * These are CAN-THEY-DO-THIS-JOB checks, not weighted.
 */
export function runGates(
  caregiver: CaregiverForMatching,
  need: MatchNeed
): GateResult {
  const failed: string[] = []

  // ── Gate 1: Approval status ──
  // (Caller should have filtered on status='approved' before reaching here,
  // but we double-check by requiring basic fields present.)
  if (!caregiver.id || !caregiver.first_name) {
    failed.push('incomplete_caregiver_record')
  }

  // ── Gate 2: Required language ──
  if (need.language_required) {
    const langs = caregiver.languages || []
    const hasLanguage = langs.some(
      l => l.toLowerCase() === need.language_required!.toLowerCase()
    )
    if (!hasLanguage) {
      failed.push(`language_required:${need.language_required}`)
    }
  }

  // ── Gate 3: Gender preference ──
  if (need.gender_preference && need.gender_preference !== 'any' && caregiver.gender) {
    if (caregiver.gender.toLowerCase() !== need.gender_preference.toLowerCase()) {
      failed.push(`gender_preference:${need.gender_preference}`)
    }
  }

  // ── Gate 4: Placement type match ──
  // If client needs live-in and caregiver isn't willing to do live-in, fail.
  if (need.placement_type) {
    const wants = need.placement_type.toLowerCase()

    if (/live-in/.test(wants) && caregiver.willing_live_in === false) {
      failed.push('placement_type:live_in_not_supported')
    }
    if (/overnight/.test(wants) && caregiver.willing_overnight === false) {
      failed.push('placement_type:overnight_not_supported')
    }

    // Check if caregiver's placement_types includes this type
    const cgTypes = (caregiver.placement_types || []).map(t => t.toLowerCase())
    if (cgTypes.length > 0) {
      // If caregiver has explicit types and none match, fail
      const typeMatch = cgTypes.some(t => {
        if (/live-in/.test(wants) && /live-in/.test(t)) return true
        if (/overnight/.test(wants) && /overnight/.test(t)) return true
        if (/permanent/.test(wants) && /permanent/.test(t)) return true
        if (/part-time/.test(wants) && /part-time/.test(t)) return true
        if (/casual|relief/.test(wants) && /casual|relief/.test(t)) return true
        if (/respite/.test(wants) && /respite/.test(t)) return true
        if (/weekend/.test(wants) && /weekend/.test(t)) return true
        if (/block/.test(wants) && /block/.test(t)) return true
        return false
      })
      if (!typeMatch) {
        failed.push(`placement_type:${need.placement_type}_not_offered`)
      }
    }
  }

  // ── Gate 5: Availability ──
  // If caregiver is explicitly 'not_available', fail.
  if (caregiver.availability_status === 'not_available') {
    failed.push('availability:not_available')
  }

  // ── Gate 6: Location — same state, city proximity ──
  // If state doesn't match, fail (we don't do cross-state placements).
  if (need.state && caregiver.state) {
    if (need.state.toLowerCase() !== caregiver.state.toLowerCase()) {
      failed.push(`state_mismatch:need=${need.state},caregiver=${caregiver.state}`)
    }
  }

  // City/postal-code travel radius check would require geocoding.
  // For now, treat same-city as pass, different-city as a soft signal (handled in logistics scoring).

  // ── Gate 7: Rate ceiling ──
  // If client has a rate ceiling and caregiver's MINIMUM rate exceeds it, fail.
  if (need.hourly_rate_max != null && caregiver.hourly_rate != null) {
    if (Number(caregiver.hourly_rate) > Number(need.hourly_rate_max)) {
      failed.push(`rate_exceeds_max:caregiver=$${caregiver.hourly_rate}/hr,max=$${need.hourly_rate_max}/hr`)
    }
  }

  return {
    passed: failed.length === 0,
    failed,
  }
}
