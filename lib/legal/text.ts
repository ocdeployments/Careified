// lib/legal/text.ts
//
// LEGAL TEXT VERSIONING
// =====================
// Every consent capture records the legal_text_version below.
// NEVER MUTATE existing versions — add a new version when text changes.
// Hash of text at consent time stored in DB for tamper evidence.
//
// ⚠️ LAWYER REVIEW REQUIRED BEFORE PRODUCTION
// All text below is first-pass placeholder. A qualified attorney must
// review before any real user consents. Do not launch until replaced
// with legal-reviewed text.

import { createHash } from 'crypto'

export const CURRENT_VERSIONS = {
  caregiver_display: '2026-04-v1',
  caregiver_verification: '2026-04-v1',
  caregiver_reference: '2026-04-v1',
  caregiver_rating: '2026-04-v1',
  caregiver_data_rights: '2026-04-v1',
  agency_platform_role: '2026-04-v1',
  agency_employer_responsibility: '2026-04-v1',
  agency_no_warranty: '2026-04-v1',
  agency_data_usage: '2026-04-v1',
  client_data_authorization: '2026-04-v1',
} as const

export type ConsentType = keyof typeof CURRENT_VERSIONS

export const LEGAL_TEXT: Record<ConsentType, string> = {
  caregiver_display: `
I understand that the profile information I provide will be visible to
agencies using Careified. I am solely responsible for the accuracy and
completeness of what I disclose. I understand Careified does not verify
my self-reported claims except where explicitly indicated through
third-party verification sources.
`.trim(),

  caregiver_verification: `
I authorize Careified and its verification partners to review documents
I upload (certifications, identification, licenses). I understand that
the results of any checks will be displayed to agencies with the source
attributed. Careified does not verify my qualifications and makes
no representation as to their validity.
`.trim(),

  caregiver_reference: `
I authorize Careified to contact the references I have provided. I
understand their responses will be displayed to agencies exactly as
submitted, with the reference's name and relationship attached.
Careified does not verify the content or accuracy of reference
responses. I may remove references from my profile at any time.
`.trim(),

  caregiver_rating: `
I understand that agencies that engage me through Careified may submit
ratings or notes about our working relationship. These ratings will be
displayed on my profile attributed to the rating agency. I have the
right to respond to any rating and to request review of content I
believe is defamatory or inaccurate.
`.trim(),

  caregiver_data_rights: `
I understand I have the right to export my data, correct inaccuracies,
and request deletion of my account and personal information at any time
by contacting Careified. Certain audit records may be retained as
required by law.
`.trim(),

  agency_platform_role: `
I acknowledge that Careified is a platform that organizes and displays
information provided by caregivers and third parties. Careified does
NOT recommend, vouch for, endorse, or employ any caregiver listed on
the platform. All hiring decisions are solely my responsibility.

The "criteria alignment" score and ranking displayed by Careified is a
user-interface convenience to help organize caregiver disclosures
against stated requirements. It is not a recommendation and does not
constitute an endorsement of any caregiver's suitability for any
specific role or client.
`.trim(),

  agency_employer_responsibility: `
I acknowledge that if I engage any caregiver introduced through
Careified, I (or my agency) am the employer or engaging party and am
solely responsible for:
 - Conducting any additional background checks I deem necessary
 - Verifying qualifications and credentials independently
 - Employment law compliance (wages, taxes, worker's compensation,
 benefits, termination, non-discrimination)
 - Supervision, training, and direction of the caregiver
 - Obtaining appropriate insurance coverage
 - Compliance with healthcare regulations applicable to my operation
 (HIPAA, state privacy laws, licensing requirements)

Careified bears no employer or agency relationship with any caregiver.
`.trim(),

  agency_no_warranty: `
I understand that Careified makes no warranty, express or implied,
regarding:
 - The identity, qualifications, character, or fitness of any caregiver
 - The accuracy or completeness of caregiver disclosures
 - The suitability of any match or ranking for any specific role
 - The outcome of any placement or engagement

All information is provided "as is" and I use the platform at my own
risk and professional judgment.
`.trim(),

  agency_data_usage: `
I will use caregiver information accessed through Careified solely for
the purpose of evaluating potential placements for my clients. I will
not: resell or redistribute caregiver data; use the information for
marketing unrelated to placement; scrape or bulk-export data; or share
access credentials with unauthorized parties.
`.trim(),

  client_data_authorization: `
I confirm that I have obtained informed authorization from the client
(or their legally authorized representative) to input their care
requirements, including any health-related information, into Careified
for the sole purpose of identifying a suitable caregiver. I acknowledge
that my agency is the covered entity (or equivalent) responsible for
the handling of this information under applicable privacy law (HIPAA,
state privacy laws, PIPEDA, or other applicable regulation), and that
Careified processes this information as my agency's service provider.
`.trim(),
}

/**
 * Get the SHA-256 hash of the legal text at a specific version.
 * Stored with each consent for tamper evidence.
 */
export function hashLegalText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * Get legal text + its current version + hash for consent capture.
 */
export function getLegalTextForConsent(consentType: ConsentType): {
  text: string
  version: string
  hash: string
} {
  const text = LEGAL_TEXT[consentType]
  const version = CURRENT_VERSIONS[consentType]
  return { text, version, hash: hashLegalText(text) }
}
