# SESSION HANDOFF — 2026-05-22 (end of day)

## Branch state
- main: 8c342a3 — verification foundation fully merged and live
- develop: 38c06fc — 1 commit ahead (the profile fix, also merged to main via the merge commit)
- Safe revert: 41c6b31

## What shipped to production today
- fix: email sign-in lockout (Clerk toggle)
- fix: agency role metadata wrong (caregiver → agency)
- fix: aggregateScore.toFixed() crash on profile
- fix: resume parser 422 (minimax-m2.5 + JSON mode)
- fix: NotificationBell React #310
- fix: agency pages status (approved + active)
- fix: E2E auth fixture corruption
- feat: caregiver_disclosures + verification_evidence tables (live in DB)
- feat: derive-tier.ts — tier computed from evidence, 11 tests
- feat: get-caregiver-verification.ts — unified read layer
- fix: profile disclosures — hardcoded 'No' replaced with real prop data
- fix: profile verification — hardcoded badges replaced with buildVerification() from props
- chore: all docs moved to docs/, CODEBASE_MAP.md + gen script added

## What honest rendering now does
- Disclosure section: shows real caregiver answers (rfComplaint, rfTerminated, rfBackground, rfPhysicalLimitation) or "not yet completed" — never fabricates "No"
- Verification section: shows real VSC, certifications (with expiry), references count — or "not yet available"
- declarationDate: shows dm.declarationDate from DB or 'N/A' — never hardcoded

## Remaining verification work
Step 5: Wire getCaregiverVerification() into app/profile/[id]/page.tsx and pass the VerifiedClaim[] as a prop to CaregiverProfileDemo for per-claim provenance display (clickable badges showing evidence source/date)
Step 6: Disclosure capture in profile builder (real answers stored to caregiver_disclosures)
Step 7: Integrations (HSCPOA register check, ID verification, background check API)

## Data residency (action required before scaling to Quebec)
- DB: Render Oregon (US) — migrate to Neon Toronto (ca-central-1) before Quebec users
- Vercel: add "regions": ["yul1"] to vercel.json — 1 line, Montreal serverless
- File storage: Vercel Blob (US) → Cloudflare R2 (Canadian bucket) post-launch
- Clerk: US-only, acceptable under PIPEDA with DPA signed
- DPAs needed: Render, Vercel, Clerk — all available on their websites
- Privacy Policy: must disclose US/Canada data processing before real users

## Known issues
- disclosure.answer boolean coercion in get-caregiver-verification.ts — fix in step 5/6
- CA/US locale leak: /agency/search shows US states to CA agency
- Agency E2E: 7/13 pass (Clerk 60s token TTL vs suite runtime — pages confirmed working)
- agencies table: duplicate + null clerk_user_id rows (data hygiene)
- Gold hex inconsistency: #C9A84C vs #C9973A

## DB migration pattern
DB uses db push, NOT prisma migrate. Future schema changes:
1. Edit prisma/schema.prisma
2. Apply SQL directly via pg node script
3. npx prisma generate
npx prisma migrate dev will fail (non-superuser Render role).

## Session start checklist
1. ./scripts/gen-codebase-map.sh → paste docs/CODEBASE_MAP.md into project knowledge
2. git checkout develop && git pull origin develop
3. git log main..develop --oneline
4. Read this file