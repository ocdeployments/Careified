// lib/matching/index.ts
export * from './types'
export { runGates } from './gates'
export type { GateResult } from './gates'
export {
  scoreClinicalFit,
  scoreReliability,
  scoreLogisticsMatch,
  scorePersonalityCompatibility,
  scoreCulturalLanguageFit,
  scoreRetentionSignal,
  scoreEnvironmentFit,
} from './dimensions'
export { computeMatchScore } from './score'
export {
  persistMatchScore,
  getCachedMatchScore,
  loadCaregiverForMatching,
  loadAllApprovedCaregivers,
} from './persistence'
