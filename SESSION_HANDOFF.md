# SESSION_HANDOFF.md — May 19 2026

## Status: CLEAN

Work completed this session:

1. fix(resume): unpdf + mammoth for serverless-safe PDF/DOCX parsing (fa790ad)
2. fix(onboarding): agency routes to /agency/signup not /profile/build (66e009c)
3. fix(db): pool resilience settings across all 57 API routes (c05e6e0)
4. fix(sign-up): role selection screen when no role param (325ab1f)
5. fix(agency): pending-approval page — inline styles, proper content (a3326e2)
6. fix(sign-up): push role param to URL on card selection (e1518d6)
7. chore: remove accidental Success! file (abe792b)
8. Render DB upgraded from free (suspended) to Starter $7/mo
9. careified.com domain confirmed live in production
10. CLERK_PROXY_URL fixed — was missing https:// prefix
11. NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL deleted from Vercel
12. NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL set to /api/auth/role-redirect

## Pending next session:
- Merge develop → main (all fixes above)
- Verify resume parse works on Vercel (PDF + DOCX upload test)
- Verify agency signup full flow end-to-end on production
- Run Playwright E2E tests (caregiver + agency flows)
- /agency/pending-approval — verify not blank after deploy
- Homepage redesign (brief written, ready to build)

## Commits on develop not yet on main:
fa790ad, b86d0a5, 8d34bb7, f806f83 (pdf2json reverts),
66e009c, 07f04bc, e56995b, 1e10cb9, c05e6e0, c8b0d41,
325ab1f, abe792b, a3326e2, e1518d6

## Safe reverts:
5f6e626 (pre-session stable point on origin/develop)
