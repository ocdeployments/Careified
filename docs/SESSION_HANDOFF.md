# SESSION HANDOFF — 2026-05-27

## Branch state
- main: 86de162 — live, stable on Render DB
- develop: 2e7b90a — same
- Safe revert: 41c6b31

## What shipped today
- fix(nav): context-aware navbar — role-specific nav per user type
- fix(onboarding): approved agencies bypass signup if already registered
- fix(agency-layout): redirect to /agency/signup not /onboarding
- feat(security): beta gate — BETA_PASSWORD at /gate, 30-day cookie
- feat(waitlist): holding page, API route (Resend email), no navbar
- fix(waitlist): public routes, logged-out only redirect, usePathname fix
- fix(db): all pool SSL configs updated for Supabase compatibility
- fix(gate): redirect to /sign-in after password entry

## DB state
- Production: Render Oregon (stable, working)
- Supabase ca-central-1 (Toronto): provisioned, schema migrated, demo data copied
- SSL fix is deployed — ready to switch when app is stable
- Switch sequence: test on Vercel preview URL first, then production
- DO NOT switch DATABASE_URL in Vercel without testing preview first

## Vercel env vars
- BETA_PASSWORD: set ✅
- DATABASE_URL: Render (production) ✅
- Supabase URL saved separately for when ready to switch

## careified.ca
- Domain purchased on Spaceship
- NOT yet added to Vercel
- Parked — come back after app is stable

## Next session priorities
1. Test full agency flow: sign in → dashboard → search → profile → shortlist
2. Test caregiver flow: sign up → profile builder → submit
3. Fix any broken flows found in testing
4. CA/US locale leak on /agency/search (US states showing to CA agency)
5. Supabase switch (after testing confirmed stable)