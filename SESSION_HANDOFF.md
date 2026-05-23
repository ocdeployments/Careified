# SESSION HANDOFF — 2026-05-22

## Branch state
- develop: ahead of main by several commits — NOT merged
- main: has resume parser fix, NotificationBell fix, aggregateScore crash fix, agency status fix
- Safe revert: 41c6b31

## What was built this session (all on develop)
- feat: verification foundation
  - caregiver_disclosures + verification_evidence tables (live in DB via direct SQL)
  - lib/verification/derive-tier.ts — tier computed from evidence, expired downgrades, 11 tests
  - lib/verification/get-caregiver-verification.ts — unified read layer (references, employment, certifications, disclosures + evidence overlay)
  - docs/CODEBASE_MAP.md + scripts/gen-codebase-map.sh — whole-app skeleton, regenerated each session
- fix: aggregateScore.toFixed() crash (pg returns numeric as string)
- fix: resume parser (minimax-m2.5 + JSON mode — was 422 on every upload)
- fix: NotificationBell React #310 (hook after conditional return)
- fix: agency status (approved + active both accepted in roster/assistant pages)
- fix: E2E auth fixture corruption + parallel workers

## Verification — next step (Step 4)
Rebuild the profile render to show honest tiered claims.

Current state in CaregiverProfileDemo.tsx:
- tierMeta (lines 30-36): hardcoded tier label/color map — KEEP the colors, make data-driven
- redFlags (lines 306-309): HARDCODED 4x { answer: 'No' } — FABRICATED, must be replaced
- openQuestions: hardcoded demo answers — replace with caregiver.open_q1/open_q2 from DB

What needs to happen in step 4:
1. app/profile/[id]/page.tsx: call getCaregiverVerification(caregiver.id) server-side, pass result as new prop verifiedClaims={claims}
2. CaregiverProfileDemo.tsx: add verifiedClaims?: VerifiedClaim[] prop
3. Replace redFlags hardcoded array with: if verifiedClaims has disclosure claims, render them with real answer + attested_at date + "Self-disclosed by caregiver on [date]" label. If no disclosures, render "Not yet completed" state — NEVER fabricate "No".
4. Replace verification section tier badges: use verifiedClaims to render real tiers. If no claims, show "Verification pending" state.
5. is_demo caregivers: page already has is_demo boolean on caregiver — branch so demo caregivers still render the hardcoded demo data (keep the 15 demo profiles working for search), real caregivers get honest rendering.

## Data residency (action required before scaling)
- DB: Render Oregon (US) — needs migration to Canadian region before Quebec launch
- Recommended: Neon (Toronto, ca-central-1) — serverless Postgres, Prisma-compatible, strong DX
- Migration: pg_dump Render → pg_restore Neon → update DATABASE_URL in Vercel
- Vercel: add "regions": ["yul1"] to vercel.json (Montreal serverless functions) — 1 line
- File storage: Vercel Blob is US-only → migrate to Cloudflare R2 (Canadian bucket) post-launch
- Auth: Clerk is US-only but acceptable under PIPEDA with DPA signed
- DPAs needed: Render, Vercel, Clerk (all available on their websites)
- Privacy Policy: must disclose US/Canada data processing before any real users

## Known bugs / technical debt
- disclosure.answer is boolean — rendered as `disc.answer || disc.detail || ''` in get-caregiver-verification.ts, should be explicit "Yes"/"No" string in step 4 render
- CA/US locale leak: /agency/search shows US states to CA-locale agency
- Agency E2E: 7/13 pass — remaining failures are Clerk 60s token TTL vs 250s suite runtime (pages confirmed working, not app bugs)
- caregiver_attributes table is empty — graceful fallback exists
- agencies table: duplicate + null clerk_user_id rows (data hygiene)
- Gold hex inconsistency: #C9A84C vs #C9973A in some files

## DB migration pattern (important)
This DB uses db push, NOT prisma migrate. Future schema changes:
1. Edit prisma/schema.prisma
2. Apply SQL directly via pg (node + DATABASE_URL)
3. npx prisma generate
No migration files needed. npx prisma migrate dev will fail (non-superuser role).

## Session start checklist (every session)
1. ./scripts/gen-codebase-map.sh → paste docs/CODEBASE_MAP.md into project knowledge
2. git checkout develop && git pull origin develop
3. git log main..develop --oneline (know what's unmerged)
4. Read this file

## Pending decisions
- Merge develop → main (Romy's action): safe to merge current develop — additive only
- Neon migration timing: do before real Canadian users, not urgent for current demo state
- Step 4 is_demo branching: confirm is_demo=true for all 15 demo caregivers before building