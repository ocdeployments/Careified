// Careified — Communication consent registry
// Single source of truth for all caregiver call-type consents
// Add new consent types here — UI, helpers, and AIRecruit gate read from this

export type RiskLevel = 'low' | 'medium' | 'high'
export type ConsentMethod = 'signup_form' | 'settings_page' | 'per_call_modal'

export interface ConsentType {
  id: string
  label: string
  description: string
  defaultGranted: boolean
  riskLevel: RiskLevel
  requiresPerCall: boolean
  warningText?: string
  version: number
  required: boolean
}

export const CONSENT_TYPES = {
  recruit_calls: {
    id: 'recruit_calls',
    label: 'Calls about recruiting opportunities',
    description: 'Careified may call me about caregiving opportunities matching my profile.',
    defaultGranted: true,
    riskLevel: 'low' as RiskLevel,
    requiresPerCall: false,
    version: 1,
    required: true,
  },
  reference_calls: {
    id: 'reference_calls',
    label: 'Calls to my references',
    description: 'Careified may contact references I list to verify my work.',
    defaultGranted: true,
    riskLevel: 'low' as RiskLevel,
    requiresPerCall: false,
    version: 1,
    required: false,
  },
  past_employer_calls: {
    id: 'past_employer_calls',
    label: 'Calls to past employers',
    description: 'Careified may contact past employers I list to verify employment dates and role.',
    defaultGranted: true,
    riskLevel: 'low' as RiskLevel,
    requiresPerCall: false,
    version: 1,
    required: false,
  },
  current_employer_calls: {
    id: 'current_employer_calls',
    label: 'Calls to my current employer',
    description: 'Careified may contact my current employer to verify availability.',
    defaultGranted: false,
    riskLevel: 'high' as RiskLevel,
    requiresPerCall: true,
    warningText: 'Calling your current employer can put your current job at risk. They will learn you are seeking new work. Only enable this if you have already given notice or are comfortable with them knowing.',
    version: 1,
    required: false,
  },
  regulatory_calls: {
    id: 'regulatory_calls',
    label: 'Calls to regulatory bodies',
    description: 'Careified may contact licensing bodies to verify my credentials.',
    defaultGranted: true,
    riskLevel: 'low' as RiskLevel,
    requiresPerCall: false,
    version: 1,
    required: false,
  },
  match_time_calls: {
    id: 'match_time_calls',
    label: 'Calls to agencies on my behalf',
    description: 'When I apply for placements, Careified may call the agency to ask qualifying questions for me.',
    defaultGranted: true,
    riskLevel: 'medium' as RiskLevel,
    requiresPerCall: false,
    version: 1,
    required: false,
  },
} as const

export type ConsentTypeId = keyof typeof CONSENT_TYPES

export function getConsentType(id: ConsentTypeId): ConsentType {
  return CONSENT_TYPES[id]
}

export function getAllConsentTypes(): ConsentType[] {
  return Object.values(CONSENT_TYPES)
}

export function requiresPerCallConfirmation(id: ConsentTypeId): boolean {
  return CONSENT_TYPES[id].requiresPerCall
}

export function isRequiredConsent(id: ConsentTypeId): boolean {
  return CONSENT_TYPES[id].required
}
