# SESSION_HANDOFF.md — May 22 2026

## Status: CLEAN

## Last commit on develop
69d8d47 — fix(codebase-map): clean lib exports section

## Last commit on main
9704006 — merge: profile aggregateScore crash fix

## This session's commits (8 total)

1. f59be06 — feat(verification): add caregiver_disclosures + verification_evidence tables (foundation)
2. 96c6f9a — feat(verification): tier-derivation function (11 tests) + pin test deps
3. b282de5 — chore: codebase map generator + session lifecycle rule
4. 69d8d47 — fix(codebase-map): clean lib exports section
5. ec10aa6 — fix(profile): coerce aggregateScore to Number — pg returns numeric as string
6. 645c687 — fix(resume): use minimax-m2.5 with JSON mode
7. cddb6e3 — fix(notifications): resolve React #310 — hooks above conditional
8. c532d2d — session-end: regenerate session context and handoff

## What's built this session

### Verification foundation (NEW)
- DB tables: caregiver_disclosures, verification_evidence (migration created manually)
- Prisma schema updated with new models
- lib/verification/derive-tier.ts: Pure function to derive tier from evidence array
- tests/unit/derive-tier.test.ts: 11 tests covering all tier derivation scenarios
- Test deps installed: vitest, @vitejs/plugin-react, jsdom, @testing-library/jest-dom

### Profile crash fix
- CaregiverProfileDemo.tsx: aggregateScore is string from pg, added Number coercion

### Resume parser fix
- lib/resume/parse-resume.ts: switched from ring-2.6-1t:free to minimax-m2.5 with JSON mode

### Codebase documentation (NEW)
- scripts/gen-codebase-map.sh: Auto-generates docs/CODEBASE_MAP.md
- docs/CODEBASE_MAP.md: 1507 lines of file tree, routes, lib exports, DB tables, env vars
- CLAUDE.md: Added CODEBASE_MAP.md lifecycle rule

### Dev tool fixes
- Prisma generator output path fixed (../../node_modules → ../node_modules)
- Prisma client regenerated

## Pending — Priority Order

### Still open (from prior sessions)
- /agency/search: caregiver cards don't navigate on click (Tailwind classes not rendering in prod)
- Locale-scoping leak: US states shown to CA-locale agency
- agencies table: duplicate + null clerk_user_id rows (data hygiene)

### Launch blockers (from prior sessions)
- Stripe billing
- Clerk production keys
- Copy session
- careified.ca domain purchase

## Safe revert
9704006 — merge: profile aggregateScore crash fix