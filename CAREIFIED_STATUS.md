# CAREIFIED — BUILD STATUS
# Last updated: May 3 2026
# Safe revert: 41c6b31

## LIVE
careified.vercel.app | Repo: ocdeployments/Careified (main)
Stack: Next.js 16.2.3, React 19, Tailwind v4, Prisma 7, pg Pool, Render PostgreSQL, Clerk 7.0.12

---

## BUILT AND LIVE

### Auth
- Clerk auth agency + caregiver signup flows
- Role-locked signup, agency approval flow, admin console
- Post-signin role-based routing, audit logging

### Navigation
- Three-panel dropdown navbar
- Footer with Privacy, Terms, Contact
- Settings links: Data rights, Communications
- Navbar: Build profile, Opportunities, Profile demo, My clients, Search, Shortlist

### Marketing Pages
- Landing page, /for-caregivers, /for-agencies, /for-families, /about, /contact, /privacy, /terms

### Profile Builder (Steps 0-10)
- Step 0: Communication consent gate + resume upload (LLM parsing via OpenRouter/Mistral)
- Step 1: Identity (name, photo, bio, languages, DOB)
- Step 2: Services, diagnosis experience + years, ADLs + frequency, specialized techniques
- Step 3: Availability grid, hours, placement types
- Step 4: Location, travel radius, vehicle, license class
- Step 5: Credentials, mutual exclusivity, conflict warnings
- Step 6: VSC, TB, immunizations, red flag self-disclosure (4 questions)
- Step 7: 7 forced-choice scenarios (patience, empathy, adaptability, communication, emergency response, problem solving, observation)
- Step 8: Work history
- Step 9: References with verification invite links
- Step 10: Open questions
- ProfileFormContext + useProfileSave (3-layer save: memory > localStorage > DB)

### Profile Page (/profile/[id])
- Agency-facing scorecard design
- Section order: Disclosure > Verification > Clinical > References > Availability > Scorecard > Working Style > Work History > Credentials > Open Questions > Disclaimer
- Hiring scorecard (5 dimension bars)
- Verified reference badges with ratings and quotes
- Verification tier framework (Tier 1-4 with confidence score)
- Red flag disclosure, weekly availability grid, rate differential, behavioural working style
- Non-recommender disclaimer
- /profile/demo — demo page with Maria Santos

### Caregiver ID System
- Format: CRF-[COUNTRY]-[STATE]-[YEAR]-[5CHAR]
- /id/[caregiverId], /verify/[slug]
- Apple Wallet .pkpass structure (needs Apple Developer account)
- Google Wallet JWT, IDCardReveal 3D flip animation

### Agency Search & Match
- /agency/search — 20+ filters, 15 demo caregivers
- Match ranking API (/api/match/rank POST)
- Alignment score, dimension breakdown, confidence weighting
- Browse mode (empty need = show all), Show all option in sort
- Agency shortlist (/agency/shortlist)

### Client Intake & Match Analysis
- /agency/clients — client list
- /agency/clients/new — intake form (8 sections)
- /agency/clients/[id] — ranked matches + verify-in-call gaps
- Match gap analysis engine (lib/matching/gap-analysis.ts)
- 5 demo clients: Eleanor, Robert, Margaret, James, Dorothy

### Communication Consent
- 6 consent types, /settings/communications, consent gate in builder
- DB: caregiver_communication_consents

### Reference Verification
- /api/references/invite, /api/references/respond
- /reference/[token] — public form (no auth)
- Verified badges on profile page
- DB: reference_verification_requests

### AIRecruit (Phases 1-6)
- Vapi assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Campaign UI, Vapi integration, webhook, scoring, dashboard
- TCPA/CRTC compliance, consent gate before any call

### Admin Console
- /admin, /admin/agencies, /admin/caregivers

### Locale System
- lib/locale/config.ts CA/US variants, NEXT_PUBLIC_LOCALE, geo-redirect via proxy.ts

---

## IN PROGRESS / PARTIALLY BUILT

- LiveProfilePreview: component exists but not built (must build with Romy)
- PHI encryption: structure exists, columns plain text for now (needs migration before launch)
- Match Gap Analysis: rule engine built, generates per caregiver-client pair

---

## PENDING (priority order)

### Pre-Launch Blockers
1. NEXT_PUBLIC_LOCALE=CA — add to Vercel env vars NOW
2. Redeploy Vercel after adding env vars
3. Copy session — ALL page text is placeholder
4. UX debt — agency signup silent failures, no inline errors
5. Clerk production upgrade (pk_test_ > pk_live_)
6. SSL cert for Render DB (currently rejectUnauthorized: false)
7. Lawyer review of lib/legal/text.ts
8. E&O / Cyber / General Liability insurance

### Infrastructure
9. US Vercel deployment (second project, NEXT_PUBLIC_LOCALE=US)
10. Apple Developer account ($99/yr) for Wallet passes
11. Phone OTP via Clerk

### Features Queued
12. Admin panel Phase 1 (content editor, build tracker, analytics, feature flags)
13. LiveProfilePreview (ghost to live animation in builder)
14. AIRecruit Session B (consent), C (profile analysis), D (SMS, retry, cron)
15. Rating system (post-placement ratings, trust score, honesty scoring)
16. Family portal Phase 1 (schedule, shift tracker, care notes, caregiver card — PWA)
17. Background check integration — Checkr (deferred Year 1)
18. PSV verification — Persona/Didit, Nursys (deferred Year 1)
19. Upload photo API
20. Map for travel radius (Leaflet)

---

## DATABASE TABLES

| Table | Status | Notes |
|-------|--------|-------|
| caregivers | LIVE | 15 approved demo records |
| agencies | LIVE | 9 records, 1 linked to your Clerk ID |
| caregiver_certifications | LIVE | |
| caregiver_references | LIVE | |
| caregiver_attributes | LIVE | Empty, graceful fallback |
| caregiver_communication_consents | LIVE | |
| client_needs | LIVE | 5 demo clients seeded |
| match_scores | LIVE | |
| reference_verification_requests | LIVE | |
| audit_log | LIVE | |

---

## ENV VARS

| Var | Status |
|-----|--------|
| DATABASE_URL | SET |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | SET (dev keys) |
| CLERK_SECRET_KEY | SET (dev keys) |
| NEXT_PUBLIC_LOCALE | MISSING FROM VERCEL |
| OPENROUTER_API_KEY | SET |
| PHI_ENCRYPTION_KEY | SET |
| VAPI_API_KEY | SET |
| VAPI_ASSISTANT_ID | SET |
| ADMIN_CLERK_USER_ID | SET |

---

## PRE-LAUNCH CHECKLIST

- [ ] NEXT_PUBLIC_LOCALE=CA in Vercel
- [ ] Clerk production upgrade
- [ ] All page copy written
- [ ] Lawyer review of lib/legal/text.ts
- [ ] E&O / Cyber / General Liability insurance
- [ ] Apple Developer account ($99/yr)
- [ ] SSL cert for Render DB
- [ ] US Vercel deployment
- [ ] UX debt fixes
- [ ] Admin panel built
- [ ] Incident response runbook

---

## DESIGN SYSTEM

Colors: Navy #0D1B3E, Gold #C9973A/#E8B86D, Royal #1E3A8A, Warm white #F7F4F0
Font: Inter (site-wide), 16px base
Cards: white, borderRadius 16px, border 1px solid #E2E8F0
Inline styles only — no Tailwind classes (v4 prod issues)
No green as primary. No emojis in UI.

---

## BUILD RULES

1. One file per commit
2. npx tsc --noEmit before every commit
3. git push origin main after every commit
4. Stop after each commit, wait for confirmation
5. No new packages without asking
6. NEVER npx vercel --prod
7. NEVER set Vercel env vars via CLI
8. Large files: use Python write, NOT str_replace

---

## KEY FILES

lib/consent/types.ts — consent registry
lib/matching/gap-analysis.ts — gap analysis engine
lib/matching/score.ts — match scoring
lib/matching/gates.ts — hard filter gates
lib/locale/config.ts — CA/US locale config
components/profile/CaregiverProfileDemo.tsx — agency scorecard (1750 lines)
app/profile/build/page.tsx — profile builder shell
app/api/match/rank/route.ts — search/matching API
app/agency/clients/[id]/page.tsx — client detail + match analysis

Last updated: May 3 2026 | Safe revert: 41c6b31


---

## AIRECRUIT — MULTI-AGENT VAPI PLAN

Six distinct Vapi agent use cases (one assistant per use case):

| Use Case | Consent Type | Status | Notes |
|----------|-------------|--------|-------|
| Candidate screening | recruit_calls | BUILT (Phases 1-6) | Outbound to candidates |
| Reference calls | reference_calls | PENDING Session B | AI calls listed references |
| Past employer calls | past_employer_calls | PENDING Session C | Verify work history |
| Current employer calls | current_employer_calls | DROPPED | Too high legal risk |
| Regulatory/licensing calls | regulatory_calls | PENDING | Verify credentials with bodies |
| Match opportunity calls | match_time_calls | PENDING | Notify caregiver of new match |

Each use case = separate Vapi assistant with different prompt/persona.
Consent is per-type — caregiver opts in/out individually.
All gated by lib/airecruit/consent-gate.ts before any call fires.

AIRecruit Sessions pending:
- Session B: Consent flow for all types
- Session C: Profile analysis + campaign from profiles + reference agent
- Session D: SMS, retry logic, cron, bulk actions, employer agent
