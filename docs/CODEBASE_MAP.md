# CODEBASE MAP — AUTO-GENERATED. Do not hand-edit. Regenerate via this script.
Generated: Sun 31 May 2026 02:09:52 EDT

## FILE TREE (app, lib, components — depth 3, no node_modules)
```
app/about/page.tsx
app/admin/agencies/page.tsx
app/admin/badges/BadgesClient.tsx
app/admin/badges/page.tsx
app/admin/caregivers/page.tsx
app/admin/DemoAgenciesList.tsx
app/admin/layout.tsx
app/admin/page.tsx
app/admin/references/page.tsx
app/admin/references/ReferencesClient.tsx
app/admin/reviews/page.tsx
app/admin/reviews/ReviewsClient.tsx
app/admin/status/page.tsx
app/admin/tickets/page.tsx
app/agency/AgencyLayoutClient.tsx
app/agency/airecruit/[campaignId]/[callId]/page.tsx
app/agency/airecruit/[campaignId]/page.tsx
app/agency/airecruit/new/page.tsx
app/agency/airecruit/page.tsx
app/agency/assistant/AgencyAssistantClient.tsx
app/agency/assistant/page.tsx
app/agency/billing/page.tsx
app/agency/caregivers/CaregiversTabsClient.tsx
app/agency/caregivers/page.tsx
app/agency/clients/[id]/page.tsx
app/agency/clients/[id]/review/page.tsx
app/agency/clients/[id]/review/ReviewForm.tsx
app/agency/clients/new/page.tsx
app/agency/clients/page.tsx
app/agency/dashboard/page.tsx
app/agency/intelligence/IntelligenceClient.tsx
app/agency/intelligence/page.tsx
app/agency/join/[token]/page.tsx
app/agency/layout.tsx
app/agency/pending-approval/page.tsx
app/agency/reviews/new/page.tsx
app/agency/roster/add/page.tsx
app/agency/roster/import/page.tsx
app/agency/roster/page.tsx
app/agency/roster/RosterClient.tsx
app/agency/search/page.tsx
app/agency/settings/page.tsx
app/agency/shortlist/page.tsx
app/agency/signup/page.tsx
app/agency/support/page.tsx
app/api/admin/agencies/[id]/route.ts
app/api/admin/agencies/route.ts
app/api/admin/badges/route.ts
app/api/admin/caregivers/route.ts
app/api/admin/demo/wipe/[agencyId]/route.ts
app/api/admin/field-discovery/route.ts
app/api/admin/reviews/[id]/route.ts
app/api/admin/status/route.ts
app/api/agency/assistant/route.ts
app/api/agency/clients/[id]/interested/route.ts
app/api/agency/clients/[id]/route.ts
app/api/agency/clients/route.ts
app/api/agency/command/route.ts
app/api/agency/consent-status/route.ts
app/api/agency/consent/route.ts
app/api/agency/contact-request/route.ts
app/api/agency/dashboard/route.ts
app/api/agency/nav-counts/route.ts
app/api/agency/profile-completion/route.ts
app/api/agency/register/route.ts
app/api/agency/review/route.ts
app/api/agency/roster/consent/route.ts
app/api/agency/roster/create/route.ts
app/api/agency/roster/invite/route.ts
app/api/agency/roster/upload/route.ts
app/api/agency/searches/[id]/route.ts
app/api/agency/searches/route.ts
app/api/agency/settings/route.ts
app/api/agency/shortlist/pipeline/route.ts
app/api/agency/shortlist/route.ts
app/api/agency/team/invite/route.ts
app/api/agency/team/remove/route.ts
app/api/agency/team/route.ts
app/api/airecruit/analyse/[caregiverId]/route.ts
app/api/airecruit/campaigns/bulk/route.ts
app/api/airecruit/campaigns/from-profile/route.ts
app/api/airecruit/campaigns/route.ts
app/api/airecruit/employer/route.ts
app/api/airecruit/quickfill-alert/route.ts
app/api/airecruit/reference/route.ts
app/api/airecruit/webhook/route.ts
app/api/auth/role-redirect/route.ts
app/api/auth/send-phone-otp/route.ts
app/api/auth/verify-phone-otp/route.ts
app/api/caregiver/badges/route.ts
app/api/caregiver/dispute/route.ts
app/api/caregiver/disputes/route.ts
app/api/caregiver/score/event/route.ts
app/api/caregiver/score/route.ts
app/api/caregivers/me/route.ts
app/api/caregivers/search/route.ts
app/api/claim/[token]/route.ts
app/api/cron/process-call-queue/route.ts
app/api/data-rights/request/route.ts
app/api/data-rights/requests/route.ts
app/api/demo/airecruit/results/route.ts
app/api/demo/assistant/route.ts
app/api/demo/session/route.ts
app/api/gate/verify/route.ts
app/api/health/route.ts
app/api/match/rank/route.ts
app/api/notifications/count/route.ts
app/api/notifications/nudge/route.ts
app/api/notifications/read/route.ts
app/api/notifications/route.ts
app/api/onboarding/family-waitlist/route.ts
app/api/onboarding/set-role/route.ts
app/api/opportunities/[id]/dismiss/route.ts
app/api/opportunities/[id]/interest/route.ts
app/api/opportunities/route.ts
app/api/profile/consents/route.ts
app/api/profile/load/route.ts
app/api/profile/parse-resume/route.ts
app/api/profile/save-field/route.ts
app/api/profile/save-step/route.ts
app/api/profile/strength/route.ts
app/api/profile/upload-photo/route.ts
app/api/qa/report/route.ts
app/api/references/invite/route.ts
app/api/references/manage/route.ts
app/api/references/respond/route.ts
app/api/references/send/route.ts
app/api/reviews/badges/route.ts
app/api/reviews/caregiver/[id]/route.ts
app/api/reviews/self/route.ts
app/api/reviews/submit/route.ts
app/api/roster/add/route.ts
app/api/roster/import/confirm/route.ts
app/api/roster/import/route.ts
app/api/roster/list/route.ts
app/api/roster/regenerate-token/route.ts
app/api/roster/template/route.ts
app/api/tickets/[id]/route.ts
app/api/tickets/create/route.ts
app/api/tickets/list/route.ts
app/api/waitlist/route.ts
app/api/wallet/apple/route.ts
app/caregiver/notifications/page.tsx
app/caregiver/support/page.tsx
app/claim/[token]/ClaimForm.tsx
app/claim/[token]/complete/page.tsx
app/claim/[token]/page.tsx
app/contact/ContactForm.tsx
app/contact/page.tsx
app/demo/airecruit/page.tsx
app/demo/assistant/page.tsx
app/demo/login/page.tsx
app/for-agencies/ForAgenciesClient.tsx
app/for-agencies/page.tsx
app/for-caregivers/ForCaregiversClient.tsx
app/for-caregivers/page.tsx
app/for-families/page.tsx
app/gate/layout.tsx
app/gate/page.tsx
app/id/[caregiverId]/page.tsx
app/layout.tsx
app/not-found.tsx
app/onboarding/OnboardingForm.tsx
app/onboarding/page.tsx
app/opportunities/page.tsx
app/page.tsx
app/privacy/page.tsx
app/profile/[id]/page.tsx
app/profile/build/page.tsx
app/profile/build/review/page.tsx
app/profile/build/Step0ResumeUpload.tsx
app/profile/build/Step10OpenQuestions.tsx
app/profile/build/Step11Consent.tsx
app/profile/build/Step2Services.tsx
app/profile/build/Step3Availability.tsx
app/profile/build/Step4Location.tsx
app/profile/build/Step5Credentials.tsx
app/profile/build/Step6Compliance.tsx
app/profile/build/Step6Review.tsx
app/profile/build/Step7Personality.tsx
app/profile/build/Step8WorkHistory.tsx
app/profile/build/Step9References.tsx
app/profile/dispute/[id]/DisputeForm.tsx
app/profile/dispute/[id]/page.tsx
app/profile/start/page.tsx
app/profile/strength/page.tsx
app/reference/[token]/page.tsx
app/settings/communications/page.tsx
app/settings/data-rights/page.tsx
app/settings/page.tsx
app/sign-in/[[...sign-in]]/page.tsx
app/sign-up/[[...sign-up]]/page.tsx
app/sitemap.ts
app/terms/page.tsx
app/verify/[slug]/page.tsx
app/waitlist/layout.tsx
app/waitlist/page.tsx
components/agency/AddToRosterModal.tsx
components/agency/BenchStrengthWidget.tsx
components/agency/CommandBar.tsx
components/agency/PrivateRelationshipPanel.tsx
components/agency/ProfileNudge.tsx
components/agency/RatingModal.tsx
components/agency/ShiftLogModal.tsx
components/BrandLogo.tsx
components/caregiver/RatingsDisplay.tsx
components/CareifiedHero.tsx
components/ErrorBoundary.tsx
components/forms/AgencySignupForm.tsx
components/id/QRCodeDisplay.tsx
components/matching/AlignmentBadge.tsx
components/matching/DimensionBreakdown.tsx
components/nav/AgencySidebar.tsx
components/nav/Navbar.tsx
components/nav/NavbarWrapper.tsx
components/notifications/NotificationBell.tsx
components/profile/CaregiverProfileDemo.tsx
components/profile/CommunicationConsents.tsx
components/profile/ContactCard.tsx
components/profile/GhostProfileModal.tsx
components/profile/IDCardReveal.tsx
components/profile/LiveBanner.tsx
components/profile/MobilePreviewToggle.tsx
components/profile/PhotoUpload.tsx
components/profile/PhotoUploadEditor.tsx
components/profile/ProfilePhoto.tsx
components/profile/ProfilePreviewCard.tsx
components/profile/Step1Identity.tsx
components/profile/TravelRadiusMap.tsx
components/profile/WorkingStyleTags.tsx
components/ratings/BadgeDisplay.tsx
components/ratings/SuitabilityCard.tsx
components/search/CaregiverCard.tsx
components/search/ClientSearch.tsx
components/search/FilterPanel.tsx
components/search/SearchHeader.tsx
components/search/SearchResults.tsx
components/search/ShortlistButton.tsx
components/shells/AgencyShell.tsx
components/ui/Badge.tsx
components/ui/Button.tsx
components/ui/Card.tsx
components/ui/Checkbox.tsx
components/ui/CheckboxSimple.tsx
components/ui/EmptyState.tsx
components/ui/Input.tsx
components/ui/LoadingSkeleton.tsx
components/ui/Select.tsx
components/ui/Skeleton.tsx
components/ui/Tooltip.tsx
lib/actions/profile.ts
lib/airecruit/calling-hours.ts
lib/airecruit/consent-gate.ts
lib/airecruit/employer-vapi.ts
lib/airecruit/profile-analysis.ts
lib/airecruit/quickfill-vapi.ts
lib/airecruit/reference-vapi.ts
lib/airecruit/retry.ts
lib/airecruit/score-employer.ts
lib/airecruit/score-reference.ts
lib/airecruit/scoring.ts
lib/airecruit/vapi.ts
lib/attributes/index.ts
lib/audit/log.ts
lib/caregiver-trust-score/badges.ts
lib/caregiver-trust-score/calculate.ts
lib/consent/capture.ts
lib/consent/helpers.ts
lib/consent/types.ts
lib/context/ProfileFormContext.tsx
lib/data-rights/delete.ts
lib/data-rights/export.ts
lib/db.ts
lib/demo.ts
lib/email/resend-client.ts
lib/email/send-agency-approval-email.ts
lib/email/send-claim-email.ts
lib/encryption/phi.ts
lib/enrichment/bestFitProfile.ts
lib/enrichment/index.ts
lib/enrichment/tagsAndScore.ts
lib/enrichment/types.ts
lib/hooks/useProfileSave.ts
lib/intelligence/field-discovery.ts
lib/legal/text.ts
lib/locale/config.ts
lib/locale/get-locale.ts
lib/locale/useLocale.ts
lib/matching/caregiver-loader.ts
lib/matching/dimension-meta.ts
lib/matching/dimensions.ts
lib/matching/gap-analysis.ts
lib/matching/gates.ts
lib/matching/index.ts
lib/matching/persistence.ts
lib/matching/score.ts
lib/matching/types.ts
lib/notifications.ts
lib/notifications/create.ts
lib/notifications/nudge.ts
lib/npi/fetchNPI.ts
lib/opportunities/discover.ts
lib/personality/working-style.ts
lib/profile-strength/analyze.ts
lib/profile-templates.ts
lib/rateLimit.ts
lib/ratings/compute-suitability.ts
lib/ratings/compute-trust-score.ts
lib/ratings/recompute-caregiver-score.ts
lib/resume/parse-csv.ts
lib/resume/parse-resume.ts
lib/security/audit.ts
lib/services/caregiver-search.ts
lib/tickets.ts
lib/types/search.ts
lib/types/shortlist.ts
lib/utils/generate-caregiver-code.ts
lib/utils/profile-completion.ts
lib/validations/agency-signup.ts
lib/verification/derive-tier.ts
lib/verification/get-caregiver-verification.ts
lib/wallet/apple-wallet.ts
```

## ROUTES (app pages + api)
```
app/about/page.tsx
app/admin/agencies/page.tsx
app/admin/badges/page.tsx
app/admin/caregivers/page.tsx
app/admin/page.tsx
app/admin/references/page.tsx
app/admin/reviews/page.tsx
app/admin/status/page.tsx
app/admin/tickets/page.tsx
app/agency/airecruit/[campaignId]/[callId]/page.tsx
app/agency/airecruit/[campaignId]/page.tsx
app/agency/airecruit/new/page.tsx
app/agency/airecruit/page.tsx
app/agency/assistant/page.tsx
app/agency/billing/page.tsx
app/agency/caregivers/page.tsx
app/agency/clients/[id]/page.tsx
app/agency/clients/[id]/review/page.tsx
app/agency/clients/new/page.tsx
app/agency/clients/page.tsx
app/agency/dashboard/page.tsx
app/agency/intelligence/page.tsx
app/agency/join/[token]/page.tsx
app/agency/pending-approval/page.tsx
app/agency/reviews/new/page.tsx
app/agency/roster/add/page.tsx
app/agency/roster/import/page.tsx
app/agency/roster/page.tsx
app/agency/search/page.tsx
app/agency/settings/page.tsx
app/agency/shortlist/page.tsx
app/agency/signup/page.tsx
app/agency/support/page.tsx
app/api/admin/agencies/[id]/route.ts
app/api/admin/agencies/route.ts
app/api/admin/badges/route.ts
app/api/admin/caregivers/route.ts
app/api/admin/demo/wipe/[agencyId]/route.ts
app/api/admin/field-discovery/route.ts
app/api/admin/reviews/[id]/route.ts
app/api/admin/status/route.ts
app/api/agency/assistant/route.ts
app/api/agency/clients/[id]/interested/route.ts
app/api/agency/clients/[id]/route.ts
app/api/agency/clients/route.ts
app/api/agency/command/route.ts
app/api/agency/consent-status/route.ts
app/api/agency/consent/route.ts
app/api/agency/contact-request/route.ts
app/api/agency/dashboard/route.ts
app/api/agency/nav-counts/route.ts
app/api/agency/profile-completion/route.ts
app/api/agency/register/route.ts
app/api/agency/review/route.ts
app/api/agency/roster/consent/route.ts
app/api/agency/roster/create/route.ts
app/api/agency/roster/invite/route.ts
app/api/agency/roster/upload/route.ts
app/api/agency/searches/[id]/route.ts
app/api/agency/searches/route.ts
app/api/agency/settings/route.ts
app/api/agency/shortlist/pipeline/route.ts
app/api/agency/shortlist/route.ts
app/api/agency/team/invite/route.ts
app/api/agency/team/remove/route.ts
app/api/agency/team/route.ts
app/api/airecruit/analyse/[caregiverId]/route.ts
app/api/airecruit/campaigns/bulk/route.ts
app/api/airecruit/campaigns/from-profile/route.ts
app/api/airecruit/campaigns/route.ts
app/api/airecruit/employer/route.ts
app/api/airecruit/quickfill-alert/route.ts
app/api/airecruit/reference/route.ts
app/api/airecruit/webhook/route.ts
app/api/auth/role-redirect/route.ts
app/api/auth/send-phone-otp/route.ts
app/api/auth/verify-phone-otp/route.ts
app/api/caregiver/badges/route.ts
app/api/caregiver/dispute/route.ts
app/api/caregiver/disputes/route.ts
app/api/caregiver/score/event/route.ts
app/api/caregiver/score/route.ts
app/api/caregivers/me/route.ts
app/api/caregivers/search/route.ts
app/api/claim/[token]/route.ts
app/api/cron/process-call-queue/route.ts
app/api/data-rights/request/route.ts
app/api/data-rights/requests/route.ts
app/api/demo/airecruit/results/route.ts
app/api/demo/assistant/route.ts
app/api/demo/session/route.ts
app/api/gate/verify/route.ts
app/api/health/route.ts
app/api/match/rank/route.ts
app/api/notifications/count/route.ts
app/api/notifications/nudge/route.ts
app/api/notifications/read/route.ts
app/api/notifications/route.ts
app/api/onboarding/family-waitlist/route.ts
app/api/onboarding/set-role/route.ts
app/api/opportunities/[id]/dismiss/route.ts
app/api/opportunities/[id]/interest/route.ts
app/api/opportunities/route.ts
app/api/profile/consents/route.ts
app/api/profile/load/route.ts
app/api/profile/parse-resume/route.ts
app/api/profile/save-field/route.ts
app/api/profile/save-step/route.ts
app/api/profile/strength/route.ts
app/api/profile/upload-photo/route.ts
app/api/qa/report/route.ts
app/api/references/invite/route.ts
app/api/references/manage/route.ts
app/api/references/respond/route.ts
app/api/references/send/route.ts
app/api/reviews/badges/route.ts
app/api/reviews/caregiver/[id]/route.ts
app/api/reviews/self/route.ts
app/api/reviews/submit/route.ts
app/api/roster/add/route.ts
app/api/roster/import/confirm/route.ts
app/api/roster/import/route.ts
app/api/roster/list/route.ts
app/api/roster/regenerate-token/route.ts
app/api/roster/template/route.ts
app/api/tickets/[id]/route.ts
app/api/tickets/create/route.ts
app/api/tickets/list/route.ts
app/api/waitlist/route.ts
app/api/wallet/apple/route.ts
app/caregiver/notifications/page.tsx
app/caregiver/support/page.tsx
app/claim/[token]/complete/page.tsx
app/claim/[token]/page.tsx
app/contact/page.tsx
app/demo/airecruit/page.tsx
app/demo/assistant/page.tsx
app/demo/login/page.tsx
app/for-agencies/page.tsx
app/for-caregivers/page.tsx
app/for-families/page.tsx
app/gate/page.tsx
app/id/[caregiverId]/page.tsx
app/onboarding/page.tsx
app/opportunities/page.tsx
app/page.tsx
app/privacy/page.tsx
app/profile/[id]/page.tsx
app/profile/build/page.tsx
app/profile/build/review/page.tsx
app/profile/dispute/[id]/page.tsx
app/profile/start/page.tsx
app/profile/strength/page.tsx
app/reference/[token]/page.tsx
app/settings/communications/page.tsx
app/settings/data-rights/page.tsx
app/settings/page.tsx
app/sign-in/[[...sign-in]]/page.tsx
app/sign-up/[[...sign-up]]/page.tsx
app/terms/page.tsx
app/verify/[slug]/page.tsx
app/waitlist/page.tsx
```

## lib EXPORTS (file : exported symbol)
```
lib/actions/profile.ts  ::  async function getProfileData()
lib/actions/profile.ts  ::  async function saveStep1(data:
lib/actions/profile.ts  ::  async function saveStep2(data:
lib/actions/profile.ts  ::  async function saveStep3(data:
lib/actions/profile.ts  ::  async function saveStep4(certifications: Array
lib/actions/profile.ts  ::  async function saveStep5(references: Array
lib/actions/profile.ts  ::  async function submitProfile()
lib/airecruit/calling-hours.ts  ::  function detectRegion(phoneNumber: string): PhoneRegion
lib/airecruit/calling-hours.ts  ::  function isWithinCallingHours(
lib/airecruit/calling-hours.ts  ::  type PhoneRegion
lib/airecruit/consent-gate.ts  ::  async function checkCallAllowed(req: CallGateRequest): Promise
lib/airecruit/consent-gate.ts  ::  async function requireCallAllowed(req: CallGateRequest): Promise
lib/airecruit/consent-gate.ts  ::  interface CallGateRequest
lib/airecruit/consent-gate.ts  ::  interface CallGateResult
lib/airecruit/employer-vapi.ts  ::  async function initiateEmployerCall(
lib/airecruit/employer-vapi.ts  ::  function buildEmployerCallConfig(params: EmployerCallParams): VapiCallParams
lib/airecruit/employer-vapi.ts  ::  interface EmployerCallParams
lib/airecruit/profile-analysis.ts  ::  async function analyseProfile(caregiverId: string): Promise
lib/airecruit/profile-analysis.ts  ::  interface ProfileAnalysis
lib/airecruit/profile-analysis.ts  ::  interface ProfileGap
lib/airecruit/profile-analysis.ts  ::  interface RecommendedCall
lib/airecruit/profile-analysis.ts  ::  interface RiskFlag
lib/airecruit/quickfill-vapi.ts  ::  async function initiateQuickFillAlert(
lib/airecruit/quickfill-vapi.ts  ::  function buildQuickFillAlertConfig(params: QuickFillAlertParams): VapiCallParams
lib/airecruit/quickfill-vapi.ts  ::  interface QuickFillAlertParams
lib/airecruit/reference-vapi.ts  ::  async function initiateReferenceCall(
lib/airecruit/reference-vapi.ts  ::  function buildReferenceCallConfig(params: ReferenceCallParams): VapiCallParams
lib/airecruit/reference-vapi.ts  ::  interface ReferenceCallParams
lib/airecruit/retry.ts  ::  async function cancelRetries(caregiverId: string, callType: string): Promise
lib/airecruit/retry.ts  ::  async function getPendingRetries(limit: number
lib/airecruit/retry.ts  ::  async function markRetryCompleted(retryId: string): Promise
lib/airecruit/retry.ts  ::  async function markRetryFailed(retryId: string, error: string): Promise
lib/airecruit/retry.ts  ::  async function scheduleRetry(
lib/airecruit/retry.ts  ::  interface RetryConfig
lib/airecruit/score-employer.ts  ::  async function scoreEmployerCall(
lib/airecruit/score-employer.ts  ::  interface EmployerScore
lib/airecruit/score-reference.ts  ::  async function scoreReferenceCall(
lib/airecruit/score-reference.ts  ::  interface ReferenceScore
lib/airecruit/scoring.ts  ::  async function scoreTranscript(
lib/airecruit/scoring.ts  ::  interface QuestionScore
lib/airecruit/scoring.ts  ::  interface ScoringResult
lib/airecruit/vapi.ts  ::  async function initiateVapiCall(
lib/airecruit/vapi.ts  ::  interface VapiCallParams
lib/airecruit/vapi.ts  ::  interface VapiCallResult
lib/attributes/index.ts  ::  async function getAttribute(
lib/attributes/index.ts  ::  async function getAttributeMap(
lib/attributes/index.ts  ::  async function loadCaregiverAttributes(
lib/attributes/index.ts  ::  async function upsertAttribute(
lib/attributes/index.ts  ::  const TIER_LABELS: Record
lib/attributes/index.ts  ::  function tierToConfidence(tier: AttributeTier): number
lib/attributes/index.ts  ::  type AttributeInput
lib/attributes/index.ts  ::  type AttributeStatus
lib/attributes/index.ts  ::  type AttributeTier
lib/attributes/index.ts  ::  type CaregiverAttribute
lib/audit/log.ts  ::  async function logAudit(pool: Pool, event: AuditEvent): Promise
lib/audit/log.ts  ::  type AuditActorType
lib/audit/log.ts  ::  type AuditEvent
lib/caregiver-trust-score/badges.ts  ::  function computeBadges(
lib/caregiver-trust-score/badges.ts  ::  interface Badge
lib/caregiver-trust-score/badges.ts  ::  interface PlacementReview
lib/caregiver-trust-score/calculate.ts  :: 
lib/caregiver-trust-score/calculate.ts  ::  async function calculateCaregiverScore(caregiverId: string): Promise
lib/caregiver-trust-score/calculate.ts  ::  async function getCaregiverScore(caregiverId: string): Promise
lib/caregiver-trust-score/calculate.ts  ::  async function saveScoreSnapshot(result: ScoreResult): Promise
lib/caregiver-trust-score/calculate.ts  ::  interface ScoreEvent
lib/caregiver-trust-score/calculate.ts  ::  interface ScoreResult
lib/caregiver-trust-score/calculate.ts  ::  interface ScoreSnapshot
lib/consent/capture.ts  ::  async function hasCurrentAgencyConsent(
lib/consent/capture.ts  ::  async function hasCurrentCaregiverConsent(
lib/consent/capture.ts  ::  async function recordAgencyConsent(
lib/consent/capture.ts  ::  async function recordCaregiverConsent(
lib/consent/capture.ts  ::  async function recordClientDataConsent(
lib/consent/capture.ts  ::  type ConsentCapture
lib/consent/helpers.ts  ::  async function getCaregiverConsents(caregiverId: string): Promise
lib/consent/helpers.ts  ::  async function grantConsent(
lib/consent/helpers.ts  ::  async function hasActiveConsent(
lib/consent/helpers.ts  ::  async function requireConsent(
lib/consent/helpers.ts  ::  async function revokeConsent(
lib/consent/helpers.ts  ::  interface ConsentRecord
lib/consent/helpers.ts  ::  interface ConsentRequestMeta
lib/consent/types.ts  ::  const CONSENT_TYPES
lib/consent/types.ts  ::  function getAllConsentTypes(): ConsentType[]
lib/consent/types.ts  ::  function getConsentType(id: ConsentTypeId): ConsentType
lib/consent/types.ts  ::  function isRequiredConsent(id: ConsentTypeId): boolean
lib/consent/types.ts  ::  function requiresPerCallConfirmation(id: ConsentTypeId): boolean
lib/consent/types.ts  ::  interface ConsentType
lib/consent/types.ts  ::  type ConsentMethod
lib/consent/types.ts  ::  type ConsentTypeId
lib/consent/types.ts  ::  type RiskLevel
lib/data-rights/delete.ts  ::  async function deleteAgencyData(
lib/data-rights/delete.ts  ::  async function deleteCaregiverData(
lib/data-rights/delete.ts  ::  type DeletionResult
lib/data-rights/export.ts  ::  async function exportAgencyData(
lib/data-rights/export.ts  ::  async function exportCaregiverData(
lib/data-rights/export.ts  ::  type ExportBundle
lib/db.ts  :: 
lib/db.ts  ::  const prisma
lib/db.ts  ::  const sslConfig
lib/demo.ts  ::  const DEMO_AGENCY
lib/demo.ts  ::  const DEMO_BADGES
lib/demo.ts  ::  const DEMO_BANNER
lib/demo.ts  ::  const DEMO_CLIENTS
lib/demo.ts  ::  const DEMO_MODE
lib/demo.ts  ::  const DEMO_REVIEWS
lib/email/resend-client.ts  ::  function getResendClient(): Resend | null
lib/email/send-agency-approval-email.ts  ::  async function sendAgencyApprovalEmail(params:
lib/email/send-claim-email.ts  ::  async function sendClaimEmail(params:
lib/encryption/phi.ts  ::  function decryptPHI(buf: Buffer | null | undefined): string | null
lib/encryption/phi.ts  ::  function decryptPHIJson
lib/encryption/phi.ts  ::  function encryptPHI(plaintext: string | null | undefined): Buffer | null
lib/encryption/phi.ts  ::  function encryptPHIJson(value: unknown): Buffer | null
lib/enrichment/bestFitProfile.ts  ::  const generateBestFitProfile
lib/enrichment/bestFitProfile.ts  ::  function generateDisclosedPreferences(
lib/enrichment/index.ts  :: 
lib/enrichment/index.ts  ::  * from './types'
lib/enrichment/index.ts  ::  async function enrichAndPersist(
lib/enrichment/index.ts  ::  function enrichCaregiver(
lib/enrichment/tagsAndScore.ts  ::  function computeProfileStrength(
lib/enrichment/tagsAndScore.ts  ::  function extractMatchingTags(
lib/enrichment/types.ts  ::  type AgeRangeKey
lib/enrichment/types.ts  ::  type BestFitProfile
lib/enrichment/types.ts  ::  type CaregiverDisclosedPreferences
lib/enrichment/types.ts  ::  type CaregiverForEnrichment
lib/enrichment/types.ts  ::  type CareStyle
lib/enrichment/types.ts  ::  type ClientPreferences
lib/enrichment/types.ts  ::  type EnrichmentResult
lib/enrichment/types.ts  ::  type EnvironmentComfort
lib/enrichment/types.ts  ::  type EnvValue
lib/enrichment/types.ts  ::  type MatchingTag
lib/enrichment/types.ts  ::  type Motivation
lib/hooks/useProfileSave.ts  ::  function useProfileSave()
lib/intelligence/field-discovery.ts  ::  async function recordUnknownFields(params:
lib/legal/text.ts  ::  const CURRENT_VERSIONS
lib/legal/text.ts  ::  const LEGAL_TEXT: Record
lib/legal/text.ts  ::  function getLegalTextForConsent(consentType: ConsentType):
lib/legal/text.ts  ::  function hashLegalText(text: string): string
lib/legal/text.ts  ::  type ConsentType
lib/locale/config.ts  ::  const localeConfig
lib/locale/config.ts  ::  function getLocaleConfig(locale: Locale): LocaleConfig
lib/locale/config.ts  ::  type Locale
lib/locale/config.ts  ::  type LocaleConfig
lib/locale/get-locale.ts  ::  const LOCALE_CA
lib/locale/get-locale.ts  ::  const LOCALE_US
lib/locale/get-locale.ts  ::  function getLocale(): string
lib/locale/useLocale.ts  ::  function useLocale():
lib/matching/caregiver-loader.ts  ::  async function loadAllApprovedCaregiversV2(
lib/matching/caregiver-loader.ts  ::  async function loadCaregiverForMatchingV2(
lib/matching/caregiver-loader.ts  ::  function lowestConfidenceFor(
lib/matching/caregiver-loader.ts  ::  type CaregiverWithProvenance
lib/matching/dimension-meta.ts  ::  const DIMENSION_META: Record
lib/matching/dimension-meta.ts  ::  const DIMENSION_ORDER: DimensionKey[]
lib/matching/dimension-meta.ts  ::  function confidenceLabel(multiplier: number): string
lib/matching/dimension-meta.ts  ::  function tierFromMultiplier(multiplier: number): 1 | 2 | 3 | 4
lib/matching/dimension-meta.ts  ::  type DimensionMeta
lib/matching/dimensions.ts  ::  function scoreClinicalFit(
lib/matching/dimensions.ts  ::  function scoreCulturalLanguageFit(
lib/matching/dimensions.ts  ::  function scoreEnvironmentFit(
lib/matching/dimensions.ts  ::  function scoreLogisticsMatch(
lib/matching/dimensions.ts  ::  function scorePersonalityCompatibility(
lib/matching/dimensions.ts  ::  function scoreReliability(
lib/matching/dimensions.ts  ::  function scoreRetentionSignal(
lib/matching/gap-analysis.ts  ::  function generateGapAnalysis(
lib/matching/gap-analysis.ts  ::  interface GapItem
lib/matching/gates.ts  ::  function runGates(
lib/matching/gates.ts  ::  type GateResult
lib/matching/index.ts  :: 
lib/matching/index.ts  ::  * from './types'
lib/matching/index.ts  ::  type
lib/matching/persistence.ts  ::  async function getCachedMatchScore(
lib/matching/persistence.ts  ::  async function loadAllApprovedCaregivers(
lib/matching/persistence.ts  ::  async function loadCaregiverForMatching(
lib/matching/persistence.ts  ::  async function persistMatchScore(
lib/matching/score.ts  ::  function computeMatchScore(
lib/matching/types.ts  ::  const ALIGNMENT_DISCLAIMER
lib/matching/types.ts  ::  const BASE_WEIGHTS
lib/matching/types.ts  ::  type
lib/matching/types.ts  ::  type CaregiverForMatching
lib/matching/types.ts  ::  type Confidence
lib/matching/types.ts  ::  type DimensionKey
lib/matching/types.ts  ::  type DimensionScore
lib/matching/types.ts  ::  type MatchNeed
lib/matching/types.ts  ::  type MatchResult
lib/matching/types.ts  ::  type MatchScope
lib/notifications.ts  ::  async function notifyBadgeEarned(caregiverEmail: string, caregiverName: string, badgeLabel: string): Promise
lib/notifications.ts  ::  async function notifyReviewSubmitted(caregiverEmail: string, caregiverName: string, agencyName: string): Promise
lib/notifications.ts  ::  async function sendNotification(payload: NotificationPayload): Promise
lib/notifications.ts  ::  interface NotificationPayload
lib/notifications/create.ts  ::  async function createNotification(params: CreateNotificationParams): Promise
lib/notifications/create.ts  ::  const NotificationTemplates
lib/notifications/create.ts  ::  type NotificationType
lib/notifications/nudge.ts  ::  async function nudgeAllIncompleteCaregivers(): Promise
lib/notifications/nudge.ts  ::  async function sendProfileNudge(caregiverId: string): Promise
lib/npi/fetchNPI.ts  ::  async function fetchNPIProviders(params:
lib/npi/fetchNPI.ts  ::  interface NPIProvider
lib/opportunities/discover.ts  ::  async function discoverOpportunities(
lib/opportunities/discover.ts  ::  type Opportunity
lib/personality/working-style.ts  ::  const WORKING_STYLE_TAGS
lib/personality/working-style.ts  ::  function deriveWorkingStyle(answers: Record
lib/personality/working-style.ts  ::  type WorkingStyleTag
lib/profile-strength/analyze.ts  ::  async function analyzeProfileStrength(
lib/profile-strength/analyze.ts  ::  type StrengthGap
lib/profile-strength/analyze.ts  ::  type StrengthReport
lib/profile-templates.ts  ::  function generateBio(profile: ProfileData): string
lib/profile-templates.ts  ::  function generateOpenQuestion(questionType: string, profile: ProfileData): string
lib/profile-templates.ts  ::  function generateWorkingStyle(profile: ProfileData): string
lib/rateLimit.ts  ::  function checkRateLimit(ip: string, limit: number
lib/rateLimit.ts  ::  function getClientIp(req: NextRequest): string
lib/ratings/compute-suitability.ts  ::  async function generateSuitabilityNarrative(
lib/ratings/compute-suitability.ts  ::  function computeSuitabilityScores(
lib/ratings/compute-suitability.ts  ::  interface CaregiverProfile
lib/ratings/compute-suitability.ts  ::  interface SuitabilityScores
lib/ratings/compute-trust-score.ts  ::  function computeTrustScore(reviews: PlacementReview[]): TrustScoreResult
lib/ratings/compute-trust-score.ts  ::  interface PlacementReview
lib/ratings/compute-trust-score.ts  ::  interface TrustScoreResult
lib/ratings/recompute-caregiver-score.ts  ::  async function recomputeCaregiverScore(caregiverId: string): Promise
lib/resume/parse-csv.ts  ::  async function mapCsvColumns(
lib/resume/parse-csv.ts  ::  function extractUnknownFields(
lib/resume/parse-csv.ts  ::  function normalizeCsvRow(
lib/resume/parse-csv.ts  ::  interface CsvColumnMap
lib/resume/parse-resume.ts  ::  async function parseResume(
lib/resume/parse-resume.ts  ::  interface ParsedResume
lib/security/audit.ts  ::  async function getAuditLogs(limit
lib/security/audit.ts  ::  async function logAdminAction({
lib/security/audit.ts  ::  interface AuditLogParams
lib/services/caregiver-search.ts  ::  class CaregiverSearchService
lib/tickets.ts  :: 
lib/tickets.ts  ::  async function generateTicketNumber(pool: Pool): Promise
lib/tickets.ts  ::  function getSLADueDate(type: string): Date | null
lib/tickets.ts  ::  function validateTicketStatus(from: string, to: string): boolean
lib/tickets.ts  ::  function validateTicketType(type: string): boolean
lib/types/search.ts  ::  const AVAILABILITY_STATUS_OPTIONS
lib/types/search.ts  ::  const CANADIAN_PROVINCES
lib/types/search.ts  ::  const CREDENTIAL_OPTIONS
lib/types/search.ts  ::  const DAYS_OF_WEEK
lib/types/search.ts  ::  const EMPLOYMENT_TYPE_OPTIONS
lib/types/search.ts  ::  const LANGUAGE_OPTIONS
lib/types/search.ts  ::  const LIFT_EXPERIENCE_OPTIONS
lib/types/search.ts  ::  const PET_TOLERANCE_OPTIONS
lib/types/search.ts  ::  const PLACEMENT_TYPE_OPTIONS
lib/types/search.ts  ::  const SHIFT_TYPE_OPTIONS
lib/types/search.ts  ::  const SPECIALTY_OPTIONS
lib/types/search.ts  ::  const TECHNOLOGY_COMFORT_OPTIONS
lib/types/search.ts  ::  const US_STATES
lib/types/search.ts  ::  interface CaregiverSearchResult
lib/types/search.ts  ::  interface SearchFilters
lib/types/search.ts  ::  interface SearchResponse
lib/types/shortlist.ts  ::  interface ShortlistEntry
lib/types/shortlist.ts  ::  interface ShortlistResponse
lib/utils/generate-caregiver-code.ts  ::  function generateCaregiverCode(
lib/utils/profile-completion.ts  ::  function calculateProfileCompletion(input: CompletionInput): CompletionResult
lib/utils/profile-completion.ts  ::  function getTierColor(tier: string): string
lib/utils/profile-completion.ts  ::  interface CompletionInput
lib/utils/profile-completion.ts  ::  interface CompletionResult
lib/validations/agency-signup.ts  ::  const agencySignupSchema
lib/validations/agency-signup.ts  ::  type AgencySignupData
lib/verification/derive-tier.ts  ::  function deriveTier(evidence: EvidenceRow[], now: Date
lib/verification/derive-tier.ts  ::  function deriveTierLabel(tier: AttributeTier): string
lib/verification/derive-tier.ts  ::  type EvidenceRow
lib/verification/get-caregiver-verification.ts  ::  async function getCaregiverVerification(caregiverId: string): Promise
lib/verification/get-caregiver-verification.ts  ::  interface VerifiedClaim
lib/wallet/apple-wallet.ts  ::  async function generateAppleWalletPass(
lib/wallet/apple-wallet.ts  ::  const PASS_STRUCTURE
lib/wallet/apple-wallet.ts  ::  interface CaregiverPassData
lib/wallet/apple-wallet.ts  ::  interface PassGenerationResult
```

## DB TABLES + COLUMNS (information_schema — ground truth)
```
=== AIRecruitCall ===
  id : text
  campaignId : text
  caregiverId : text ?
  status : text
  phoneNumber : text
  vapiCallId : text ?
  transcript : text ?
  rawScore : double precision ?
  scoreBreakdown : jsonb ?
  recommendation : text ?
  duration : integer ?
  startedAt : timestamp without time zone ?
  completedAt : timestamp without time zone ?
  createdAt : timestamp without time zone
  updatedAt : timestamp without time zone
  callStatus : text ?
  callbackNotes : text ?
  callbackRequestedAt : text ?
  candidateEmail : text ?
  candidateFirstName : text ?
  candidateLastName : text ?
  candidateNotes : text ?
  call_type : character varying ?
=== AIRecruitCampaign ===
  id : text
  agencyId : text
  title : text
  roleDescription : text
  screeningQuestions : ARRAY ?
  status : text
  totalCandidates : integer
  callsCompleted : integer
  callsPending : integer
  callsFailed : integer
  createdAt : timestamp without time zone
  updatedAt : timestamp without time zone
=== AIRecruitSuppression ===
  id : text
  phoneNumber : text
  reason : text
  addedBy : text
  agencyId : text ?
  createdAt : timestamp without time zone
  updatedAt : timestamp without time zone
=== AIRecruitWaitlist ===
  id : text
  agencyId : text
  email : text
  createdAt : timestamp without time zone
=== AuditLog ===
  id : text
  adminId : text
  action : text
  recordId : text ?
  table : text
  previousValue : jsonb ?
  newValue : jsonb ?
  createdAt : timestamp without time zone
=== agencies ===
  id : character varying
  name : character varying
  business_type : character varying ?
  license_number : character varying ?
  contact_first_name : character varying ?
  contact_last_name : character varying ?
  contact_email : character varying ?
  contact_phone : character varying ?
  street : character varying ?
  city : character varying ?
  state : character varying ?
  postal_code : character varying ?
  status : character varying ?
  rating_count : integer ?
  aggregate_score : numeric ?
  created_at : timestamp without time zone ?
  updated_at : timestamp without time zone ?
  clerk_user_id : character varying ?
  vapiAssistantId : text ?
  vapiPhoneNumberId : text ?
  service_areas : ARRAY ?
  care_types : ARRAY ?
  provinces : ARRAY ?
  coordinator_count : integer ?
  current_tools : ARRAY ?
  display_name : character varying ?
  logo_url : text ?
  brand_color : character varying ?
  tagline : text ?
  website_url : text ?
  hours_of_operation : jsonb ?
  recruitment_methods : ARRAY ?
  business_registration : character varying ?
  insurance_carrier : character varying ?
  insurance_policy : character varying ?
  background_check_provider : character varying ?
  profile_complete : boolean ?
  onboarding_step : integer ?
  modules_enabled : ARRAY ?
  plan_tier : character varying ?
  subscription_status : character varying ?
  trial_ends_at : timestamp with time zone ?
  stripe_customer_id : character varying ?
  stripe_subscription_id : character varying ?
  locale : text ?
  is_demo : boolean
=== agency_caregiver_relationships ===
  id : character varying
  agency_id : character varying ?
  caregiver_id : character varying ?
  relationship_type : character varying ?
  status : character varying ?
  notes : text ?
  created_at : timestamp without time zone ?
  updated_at : timestamp without time zone ?
=== agency_ratings ===
  id : character varying
  agency_id : character varying ?
  caregiver_id : character varying ?
  reliability : integer ?
  punctuality : integer ?
  warmth : integer ?
  dignity : integer ?
  hygiene : integer ?
  skills_match : integer ?
  would_reengage : boolean ?
  public_comment : text ?
  created_at : timestamp without time zone ?
=== agency_saved_searches ===
  id : character varying
  agency_id : character varying ?
  name : character varying ?
  filters : jsonb ?
  created_at : timestamp without time zone ?
=== agency_shortlist ===
  id : uuid
  agency_clerk_id : character varying
  caregiver_id : character varying
  notes : text ?
  created_at : timestamp without time zone ?
  pipeline_status : character varying ?
=== agency_team_members ===
  id : uuid
  agency_id : character varying
  clerk_user_id : text ?
  email : text
  first_name : text ?
  last_name : text ?
  role : text ?
  status : text ?
  invite_token : text ?
  invited_at : timestamp without time zone ?
  accepted_at : timestamp without time zone ?
  created_at : timestamp without time zone ?
=== airecruit_call_results ===
  id : uuid
  campaign_id : uuid ?
  candidate_name : text
  candidate_phone : text
  overall_score : integer
  recommendation : text
  summary : text
  disclaimer : text
  called_at : timestamp without time zone ?
  created_at : timestamp without time zone ?
=== airecruit_campaigns ===
  id : uuid
  agency_id : text
  name : text
  status : text
  created_at : timestamp without time zone ?
  updated_at : timestamp without time zone ?
=== call_retry_queue ===
  id : uuid
  call_type : character varying
  target_phone : character varying
  target_id : character varying
  caregiver_id : character varying
  agency_id : character varying
  call_params : jsonb
  attempt_number : integer ?
  max_attempts : integer ?
  scheduled_for : timestamp without time zone
  status : character varying ?
  last_error : text ?
  created_at : timestamp without time zone ?
  processed_at : timestamp without time zone ?
  processing_at : timestamp without time zone ?
=== caregiver_attributes ===
  id : uuid
  caregiver_id : character varying
  field_name : character varying
  value : jsonb ?
  source : character varying
  tier : integer
  status : character varying
  verified_at : timestamp with time zone ?
  created_at : timestamp with time zone ?
=== caregiver_badges ===
  id : uuid
  caregiver_id : character varying
  badge_name : character varying
  trigger_condition : text ?
  status : character varying ?
  earned_at : timestamp without time zone ?
=== caregiver_certifications ===
  id : character varying
  caregiver_id : character varying ?
  certification : character varying ?
  issuing_org : character varying ?
  cert_number : character varying ?
  issue_date : date ?
  expiry_date : date ?
  status : character varying ?
  created_at : timestamp without time zone ?
=== caregiver_claim_tokens ===
  id : uuid
  caregiver_id : character varying
  agency_id : character varying
  token : uuid
  email_sent_to : character varying
  expires_at : timestamp without time zone
  claimed_at : timestamp without time zone ?
  status : character varying
=== caregiver_communication_consents ===
  id : uuid
  caregiver_id : character varying
  consent_type : text
  consent_version : integer
  granted : boolean
  granted_at : timestamp with time zone ?
  revoked_at : timestamp with time zone ?
  ip_address : text ?
  user_agent : text ?
  consent_method : text
  specific_target : text ?
  notes : text ?
=== caregiver_disclosures ===
  id : character varying
  caregiver_id : character varying
  question_key : character varying
  answer : boolean
  detail : text ?
  attested_at : timestamp without time zone
  attestation_ip : character varying ?
=== caregiver_notifications ===
  id : uuid
  caregiver_id : character varying
  type : character varying
  title : character varying
  message : text
  action_url : character varying ?
  metadata : jsonb ?
  read_at : timestamp without time zone ?
  created_at : timestamp without time zone ?
=== caregiver_recovery_plans ===
  id : character varying
  caregiver_id : character varying
  status : character varying ?
  trigger_score : double precision
  actions : jsonb ?
  progress : double precision ?
  created_at : timestamp with time zone ?
  completed_at : timestamp with time zone ?
  expires_at : timestamp with time zone ?
=== caregiver_references ===
  id : character varying
  caregiver_id : character varying ?
  name : character varying ?
  relationship : character varying ?
  organisation : character varying ?
  duration : character varying ?
  contact_method : character varying ?
  email : character varying ?
  phone : character varying ?
  created_at : timestamp without time zone ?
  consent_knows : boolean ?
  consent_agreed : boolean ?
  consent_understands : boolean ?
  reference_type : character varying ?
  verified : boolean ?
  verification_source : character varying ?
  verification_tier : integer ?
  would_reengage : boolean ?
  ai_summary : text ?
  verified_at : timestamp without time zone ?
=== caregiver_score_events ===
  id : character varying
  caregiver_id : character varying
  event_type : character varying
  weight : double precision
  adjusted_weight : double precision ?
  agency_id : character varying ?
  placement_id : character varying ?
  notes : character varying ?
  disputed : boolean ?
  dispute_status : character varying ?
  created_at : timestamp with time zone ?
=== caregiver_score_snapshots ===
  id : character varying
  caregiver_id : character varying
  reliability : double precision
  reference_quality : double precision
  clinical_credibility : double precision
  tenure_signal : double precision
  professionalism : double precision
  total_score : double precision
  tier : character varying
  shift_count : integer ?
  calculated_at : timestamp with time zone ?
=== caregiver_shifts ===
  id : character varying
  relationship_id : character varying ?
  caregiver_id : character varying ?
  agency_id : character varying ?
  date : date ?
  start_time : time without time zone ?
  end_time : time without time zone ?
  hours : numeric ?
  status : character varying ?
  notes : text ?
  created_at : timestamp without time zone ?
=== caregiver_suitability ===
  id : uuid
  caregiver_id : character varying
  dementia_alzheimers : integer ?
  parkinsons : integer ?
  palliative_end_of_life : integer ?
  post_surgical_recovery : integer ?
  acquired_brain_injury : integer ?
  developmental_disability : integer ?
  companion_social : integer ?
  high_acuity_medical : integer ?
  pediatric : integer ?
  mental_health_support : integer ?
  suitability_summary : text ?
  credibility_narrative : text ?
  best_match_types : ARRAY ?
  caution_types : ARRAY ?
  computed_at : timestamp without time zone ?
  review_count_at_computation : integer ?
  score_version : integer ?
=== caregivers ===
  id : character varying
  user_id : character varying ?
  first_name : character varying ?
  last_name : character varying ?
  preferred_name : character varying ?
  phone : character varying ?
  email : character varying ?
  gender : character varying ?
  date_of_birth : date ?
  city : character varying ?
  state : character varying ?
  postal_code : character varying ?
  address : text ?
  status : character varying ?
  availability_status : character varying ?
  services : ARRAY ?
  specializations : ARRAY ?
  credentials : ARRAY ?
  placement_types : ARRAY ?
  willing_live_in : boolean ?
  willing_overnight : boolean ?
  has_vehicle : boolean ?
  travel_radius : integer ?
  hourly_rate : numeric ?
  bio : text ?
  photo_url : text ?
  years_experience : integer ?
  rating_count : integer ?
  aggregate_score : numeric ?
  created_at : timestamp without time zone ?
  updated_at : timestamp without time zone ?
  languages : ARRAY ?
  days_available : ARRAY ?
  shift_times : jsonb ?
  open_to_urgent : boolean ?
  min_hours_per_week : integer ?
  max_hours_per_week : integer ?
  holiday_available : boolean ?
  has_drivers_license : boolean ?
  willing_client_vehicle : boolean ?
  transit_accessible : boolean ?
  willing_to_transport : boolean ?
  pet_tolerance : character varying ?
  smoker_household : boolean ?
  technology_comfort : character varying ?
  employment_type : character varying ?
  lift_experience : ARRAY ?
  medicare_certified : boolean ?
  vulnerable_sector_check : character varying ?
  driving_record_check : character varying ?
  bonded_insured : boolean ?
  provincial_registry_number : character varying ?
  job_title : character varying ?
  clients_served_count : integer ?
  profile_completion_pct : numeric ?
  hobbies : ARRAY ?
  dietary_cooking : ARRAY ?
  personality_profile : jsonb ?
  caregiver_code : character varying ?
  verify_slug : character varying ?
  country : character varying ?
  language_fluency : jsonb ?
  work_authorisation : boolean ?
  emergency_contact : jsonb ?
  skill_ratings : jsonb ?
  client_types : ARRAY ?
  unwilling_tasks : ARRAY ?
  weekly_grid : jsonb ?
  earliest_start_date : date ?
  notice_period : character varying ?
  preferred_age_group : character varying ?
  preferred_settings : ARRAY ?
  hourly_rate_max : numeric ?
  service_areas : ARRAY ?
  education : jsonb ?
  currently_enrolled : boolean ?
  background_consent : boolean ?
  background_consent_date : timestamp with time zone ?
  criminal_declaration : boolean ?
  criminal_declaration_detail : text ?
  immunisation_records : jsonb ?
  tb_clearance_date : date ?
  declaration_accurate : boolean ?
  declaration_date : timestamp with time zone ?
  work_history : jsonb ?
  volunteer_experience : boolean ?
  volunteer_description : text ?
  family_care_experience : boolean ?
  family_care_description : text ?
  professional_memberships : ARRAY ?
  open_q1 : text ?
  open_q2 : text ?
  open_q3 : text ?
  profile_phase : integer ?
  certifications : jsonb ?
  client_preferences : jsonb ?
  environment_comfort : jsonb ?
  motivation : jsonb ?
  reliability_metrics : jsonb ?
  best_fit_profile : jsonb ?
  profile_strength_score : integer ?
  claim_token : character varying ?
  claimed : boolean ?
  license_source : character varying ?
  npi_number : character varying ?
  profile_status : character varying ?
  verification_tier : integer ?
  badges : jsonb ?
  photo_x : numeric ?
  photo_y : numeric ?
  photo_scale : numeric ?
  phone_verified : boolean ?
  age_confirmed : boolean ?
  created_by_agency_id : uuid ?
  claim_token_expires_at : timestamp without time zone ?
  claimed_at : timestamp without time zone ?
  resume_url : text ?
  locale : text ?
  claim_status : character varying ?
  source_agency_id : character varying ?
  referred_by : character varying ?
  is_demo : boolean
  adls_performed : ARRAY ?
=== client_needs ===
  id : uuid
  agency_id : uuid
  client_first_name : text ?
  client_age : integer ?
  primary_condition : text ?
  secondary_conditions : ARRAY ?
  mobility_level : text ?
  medications_complex : boolean ?
  services_needed : ARRAY ?
  care_intensity : text ?
  placement_type : text ?
  hours_per_week : integer ?
  start_date : date ?
  duration_expected : text ?
  city : text ?
  state : text ?
  postal_code : text ?
  pets_present : ARRAY ?
  smoking_household : boolean ?
  home_condition : text ?
  family_dynamics : text ?
  language_required : text ?
  gender_preference : text ?
  cultural_preference : text ?
  personality_desired : ARRAY ?
  hourly_rate_max : numeric ?
  status : text ?
  matched_caregiver_id : uuid ?
  created_at : timestamp with time zone ?
  updated_at : timestamp with time zone ?
  locale : text ?
=== contact_requests ===
  id : uuid
  agency_id : uuid
  caregiver_id : uuid
  message : text ?
  status : text
  created_at : timestamp without time zone
=== employment_verifications ===
  id : uuid
  caregiver_id : character varying
  agency_id : character varying
  employment_record_id : uuid ?
  employer_name : character varying
  supervisor_name : character varying ?
  employer_phone : character varying ?
  job_title : character varying ?
  start_date : date ?
  end_date : date ?
  vapi_call_id : character varying ?
  status : character varying ?
  employment_confirmed : boolean ?
  re_engage : boolean ?
  departure_reason : text ?
  additional_notes : text ?
  ai_summary : text ?
  confidence : character varying ?
  overall_sentiment : character varying ?
  initiated_at : timestamp without time zone ?
  completed_at : timestamp without time zone ?
  duration_seconds : integer ?
  transcript : text ?
  initiated_by_clerk_id : character varying ?
  verification_tier : integer ?
  created_at : timestamp without time zone ?
=== match_scores ===
  id : uuid
  caregiver_id : uuid
  client_needs_id : uuid
  overall_score : integer ?
  clinical_fit : integer ?
  reliability : integer ?
  logistics_match : integer ?
  personality_compatibility : integer ?
  cultural_language_fit : integer ?
  retention_likelihood : integer ?
  environment_fit : integer ?
  strong_fits : ARRAY ?
  gaps : ARRAY ?
  created_at : timestamp with time zone ?
=== placement_outcomes ===
  id : uuid
  caregiver_id : uuid
  agency_id : uuid
  client_needs_id : uuid ?
  start_date : date ?
  end_date : date ?
  duration_days : integer ?
  completion_rate : numeric ?
  no_show_count : integer ?
  reason_ended : text ?
  agency_rating : jsonb ?
  would_place_again : boolean ?
  private_notes : text ?
  created_at : timestamp with time zone ?
=== placement_reviews ===
  id : uuid
  caregiver_id : character varying
  agency_id : character varying
  client_id : character varying ?
  reviewer_type : character varying
  reviewer_id : character varying ?
  placement_start_date : date
  placement_end_date : date ?
  review_submitted_at : timestamp without time zone ?
  professional_reliability_score : numeric ?
  human_qualities_score : numeric ?
  personal_care_hygiene_score : numeric ?
  beyond_the_call_score : numeric ?
  skills_match_score : numeric ?
  communication_conduct_score : numeric ?
  would_reengage : boolean ?
  positive_feedback : text ?
  improvement_feedback : text ?
  status : character varying ?
  admin_override_notes : text ?
  created_at : timestamp without time zone ?
  updated_at : timestamp without time zone ?
=== qa_issues ===
  id : integer
  report_id : integer ?
  severity : character varying ?
  category : character varying ?
  description : text ?
  page_affected : character varying ?
  status : character varying ?
  fixed_in_commit : character varying ?
  fixed_at : timestamp with time zone ?
  fixed_by : character varying ?
  created_at : timestamp with time zone ?
=== qa_reports ===
  id : integer
  audit_date : timestamp with time zone ?
  audit_by : character varying ?
  total_passing : integer ?
  total_failing : integer ?
  total_warnings : integer ?
  commit_hash : character varying ?
  report_json : jsonb ?
  created_at : timestamp with time zone ?
=== reference_calls ===
  id : uuid
  caregiver_id : character varying
  reference_id : character varying
  agency_id : character varying
  vapi_call_id : character varying ?
  status : character varying ?
  initiated_at : timestamp without time zone ?
  completed_at : timestamp without time zone ?
  duration_seconds : integer ?
  transcript : text ?
  would_reengage : boolean ?
  overall_sentiment : character varying ?
  ai_summary : text ?
  reliability_notes : text ?
  client_interaction_notes : text ?
  strengths : text ?
  additional_notes : text ?
  confidence : character varying ?
  human_handoff_requested : boolean ?
  initiated_by_clerk_id : character varying ?
  created_at : timestamp without time zone ?
=== reference_verification_requests ===
  id : uuid
  caregiver_id : character varying
  reference_name : text
  reference_email : text ?
  reference_phone : text ?
  relationship : text
  token : uuid
  status : text
  sent_at : timestamp with time zone ?
  completed_at : timestamp with time zone ?
  would_rehire : text ?
  reliability_rating : integer ?
  professionalism_rating : integer ?
  comment : text ?
  years_known : text ?
  ip_address : text ?
=== support_tickets ===
  id : uuid
  ticket_number : character varying
  submitter_id : character varying
  submitter_type : character varying
  agency_id : character varying ?
  caregiver_id : character varying ?
  type : character varying
  priority : character varying
  status : character varying
  subject : character varying
  description : text
  admin_notes : text ?
  assigned_to : character varying ?
  sla_due_at : timestamp without time zone ?
  created_at : timestamp without time zone
  updated_at : timestamp without time zone
  resolved_at : timestamp without time zone ?
  closed_at : timestamp without time zone ?
=== ticket_messages ===
  id : uuid
  ticket_id : uuid
  sender_id : character varying
  sender_type : character varying
  message : text
  internal : boolean
  created_at : timestamp without time zone
=== users ===
  instance_id : uuid ?
  id : character varying
  id : uuid
  email : character varying
  password_hash : character varying ?
  aud : character varying ?
  role : character varying ?
  role : character varying ?
  is_active : boolean ?
  email : character varying ?
  created_at : timestamp without time zone ?
  encrypted_password : character varying ?
  updated_at : timestamp without time zone ?
  email_confirmed_at : timestamp with time zone ?
  invited_at : timestamp with time zone ?
  confirmation_token : character varying ?
  confirmation_sent_at : timestamp with time zone ?
  recovery_token : character varying ?
  recovery_sent_at : timestamp with time zone ?
  email_change_token_new : character varying ?
  email_change : character varying ?
  email_change_sent_at : timestamp with time zone ?
  last_sign_in_at : timestamp with time zone ?
  raw_app_meta_data : jsonb ?
  raw_user_meta_data : jsonb ?
  is_super_admin : boolean ?
  created_at : timestamp with time zone ?
  updated_at : timestamp with time zone ?
  phone : text ?
  phone_confirmed_at : timestamp with time zone ?
  phone_change : text ?
  phone_change_token : character varying ?
  phone_change_sent_at : timestamp with time zone ?
  confirmed_at : timestamp with time zone ?
  email_change_token_current : character varying ?
  email_change_confirm_status : smallint ?
  banned_until : timestamp with time zone ?
  reauthentication_token : character varying ?
  reauthentication_sent_at : timestamp with time zone ?
  is_sso_user : boolean
  deleted_at : timestamp with time zone ?
  is_anonymous : boolean
=== verification_evidence ===
  id : character varying
  caregiver_id : character varying
  claim_ref : character varying
  source : character varying
  verified_by : character varying ?
  verified_at : timestamp without time zone ?
  expires_at : timestamp without time zone ?
  artifact_ref : jsonb ?
  method_note : text ?
  created_at : timestamp without time zone
```

## ENV VARS REFERENCED (names only, no values)
```
ADMIN_CLERK_USER_ID
BETA_PASSWORD
CRON_SECRET
DATABASE_URL
NEXT_PUBLIC_ADMIN_CLERK_USER_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_CLARITY_ID
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_LOCALE
NEXT_PUBLIC_YBUG_ID
NODE_ENV
NOTIFICATION_WEBHOOK_URL
OPENROUTER_API_KEY
PHI_ENCRYPTION_KEY
RESEND_API_KEY
VAPI_API_KEY
VAPI_ASSISTANT_ID
VAPI_PHONE_NUMBER_ID
VAPI_WEBHOOK_SECRET
VERCEL_GIT_COMMIT_MESSAGE
VERCEL_GIT_COMMIT_REF
VERCEL_GIT_COMMIT_SHA
```

## PACKAGE DEPENDENCIES (top-level, no versions)
```
@clerk/nextjs
@clerk/testing
@hookform/resolvers
@playwright/test
@prisma/adapter-pg
@prisma/client
@radix-ui/react-accordion
@radix-ui/react-checkbox
@radix-ui/react-label
@radix-ui/react-select
@radix-ui/react-tooltip
@tailwindcss/postcss
@testing-library/jest-dom
@types/canvas-confetti
@types/leaflet
@types/node
@types/qrcode
@types/react
@types/react-dom
@vercel/blob
@vercel/postgres
@vitejs/plugin-react
canvas-confetti
csv-parse
dotenv
eslint
eslint-config-next
framer-motion
husky
jsdom
leaflet
lucide-react
mammoth
next
pg
prisma
qrcode
react
react-dom
react-hook-form
react-leaflet
resend
sonner
tailwindcss
tsx
typescript
unpdf
vitest
zod
```
