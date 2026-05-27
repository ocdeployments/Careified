# SESSION HANDOFF — 2026-05-27

## Branch state
- main: f66c89a — all waitlist fixes live
- develop: 634a50b — same, 1 commit ahead (cherry-pick artifact)

## What shipped today
- fix(nav): context-aware navbar — role-specific nav per user type
- fix(onboarding): approved agencies go to dashboard, not signup
- fix(agency-layout): redirect to /agency/signup not /onboarding
- feat(security): beta gate — BETA_PASSWORD env var, /gate page
- feat(waitlist): holding page, API route, standalone layout, no navbar
- fix(waitlist): public routes, logged-out only redirect, navbar hidden
- DB: migrated from Render Oregon → Supabase ca-central-1 (Toronto) ✅
- careified.ca domain purchased (not yet added to Vercel)

## Env vars set in Vercel
- BETA_PASSWORD: set ✅
- DATABASE_URL: updated to Supabase Toronto ✅

## Pending
- Add careified.ca to Vercel as domain alias (same project for now)
- Verify app works on Supabase — test sign-in, search, profile
- Run seed scripts to confirm demo data loads correctly
- DB: Render can be kept as backup for now, cancel when confirmed stable
- Supabase connection string in .env.local (local dev)

## Session start checklist
1. ./scripts/gen-codebase-map.sh → past
