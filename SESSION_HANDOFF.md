# SESSION_HANDOFF.md — May 20 2026

## Status: CLEAN

## Last commit on develop
b70d440 — test(playwright): 10/10 caregiver tests passing, agency tests need 2FA

## Completed this session

### E2E Tests
- Playwright caregiver auth: working via password (Client Trust disabled in Clerk)
- caregiver.setup.ts: handles Clerk sign-in, saves storageState
- caregiver-flow.spec.ts: 10/10 PASSING ✅
- agency.setup.ts: created, blocked by 2FA on test account
- agency-flow.spec.ts: 4/12 passing (public pages only, 8 blocked by 2FA)

### Routing & Auth
- fix(middleware): role-based route protection — agencies blocked from caregiver routes
- fix(middleware): sessionClaims.publicMetadata (was .metadata — silently failing)
- fix(onboarding): pure server-side role redirect
- fix(auth): role-redirect routes new agencies to /agency/signup
- fix(sign-up): role selection screen + URL update on card select
- Agency signup → pending-approval flow: working end-to-end
- Admin dashboard: working

### Database & Infrastructure
- fix(db): pool resilience across 57 API route files
- Render DB: Starter plan, stable, no suspensions
- careified.com: live

## Pending — Priority Order

### IMMEDIATE (next session start)
1. Disable 2FA on agency test account in Clerk dashboard
   Then: npx playwright test tests/e2e/agency-flow.spec.ts --reporter=list
   Target: 10+/12 passing

2. Merge develop → main (all test work is on develop only):
   git checkout main && git pull origin main
   git merge develop --no-ff -m "merge: E2E tests, routing fixes, DB resilience"
   git push origin main && git checkout develop

### BUGS TO FIX
3. Remove debug console.log from app/onboarding/page.tsx
   (leaks userId to Vercel logs in production)

4. Fix /agency/pending-approval blank page
   (reported blank — investigate if still happening)

5. Fix NotificationBell React error #310
   grep -rn "NotificationBell" app/ --include="*.tsx"

6. Verify resume parse on Vercel
   Upload real PDF and DOCX on careified.com/profile/build?step=0
   Confirm unpdf + mammoth work in serverless

7. Post-approval email to agency
   When admin approves → send welcome email via Resend

### LAUNCH BLOCKERS (June 15)
- Clerk production keys (still on dev keys)
- careified.ca domain not purchased
- Copy session (placeholder text site-wide)
- Lawyer review of lib/legal/text.ts
- Both test agencies onboarded

## Safe revert
13d063b — middleware auth guards (last known stable before test work)