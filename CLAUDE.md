# CLAUDE.md — Careified

> Read this file completely at the start of every session.
> Never override any rule defined here without explicit user instruction.
> Last updated: April 16 2026 — Session 8D Complete

---

## 1. Project Identity

**Product:** Careified
**Repository:** https://github.com/ocdeployments/Careified
**Live URL:** https://careified.vercel.app
**Local path:** `/data/careified`
**Geography:** Texas-first (Frisco/McKinney). Canada & US expansion roadmap.

**Core moat:** Two-sided verified reputation system. Reputations EARNED through real work — made VISIBLE, VERIFIABLE and UNDENIABLE.

Platform serves both medical AND non-medical caregivers. **NEVER** medical-only language or icons.

### Three audiences — NEVER conflate

| Audience | Role | What they see |
|----------|------|---------------|
| Agency | Primary buyer — pays | Search, profiles, shortlist, trust scores |
| Caregiver | Supply side — always free | Own profile, badges, completion meter, ID card |
| Family | Phase 1 portal (Session 11) | Schedule, caregiver card, notifications — read only |

### Family Portal — Confirmed Feature (Session 11+)

- Family NEVER communicates directly with caregivers
- All family ↔ caregiver communication mediated through agency
- Family access enabled per-client by agency — not self-serve
- Family cannot edit any data — read-only always
- Agency can revoke family access at any time
- Family feedback feeds rating system (structured, not star ratings)
- Portal is an agency differentiator — agencies offer it to families

**Three build phases:**
- Phase 1 (Session 11): schedule view, caregiver profile card, notification prefs
- Phase 2 (post-MVP): live shift tracker, care notes feed (needs caregiver PWA)
- Phase 3: agency message inbox, billing visibility

---

## 2. Architect Role

I am **CareNet Architect**. I design and prompt. The agent builds.

### I ALWAYS do before writing a prompt:

- Read the actual file I am about to modify (cat the full file)
- Check current DB schema if prompt touches DB columns
- Verify git status is clean
- Confirm TypeScript compiles after each change
- Check DB data landed after each save action change

### I NEVER do:

- Write a prompt based on assumptions about file contents
- Approve a commit without seeing the diff
- Continue past a TypeScript error
- Write multi-file prompts (one file per commit always)
- Accept "it looks correct" without verification

---

## 3. Actual Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Auth | Clerk v7 | `@clerk/nextjs` ^7.0.12 |
| ORM | Prisma | 7 |
| DB Driver | pg (raw Pool) | ^8.20 |
| Database | Render PostgreSQL | — |
| Icons | lucide-react | latest |

- **Tailwind v4:** `globals.css` must use `@import "tailwindcss"` NOT `@tailwind base/components/utilities`
- **Prisma:** camelCase model fields map to snake_case DB columns
- **DATABASE_URL:** in `.env.local` — export at session start
- **Clerk keys:** in `.env.local` and Vercel dashboard

> **NEVER paste keys in chat. NEVER commit keys to git.**

### DO NOT TOUCH

- `.env.local`
- `prisma/schema.prisma` (only modify after db pull confirmation)

---

## 4. Database Rules

- All tables use **snake_case** column names
- **NO** `caregiver_security` table (does not exist)
- `caregiver_certifications` joins on `caregiver_id`
- `caregiver_references` joins on `caregiver_id`
- `aggregate_score` is the trust score column
- `specializations[]` is the specialties column
- `photo_url` is the photo column
- `agency_shortlist`: id, agency_clerk_id, caregiver_id, notes, created_at
- `agency_saved_searches`: saved filter presets only — NOT shortlist

### Columns added Session 9B

- `caregivers.caregiver_code` varchar(25) — CRF-US-TX-2026-A7K4M format
- `caregivers.verify_slug` varchar(5) — unique 5-char slug
- `caregivers.country` varchar(2) — default 'US'

### Current DB state (verified April 16 2026)

- caregivers (approved): **15**
- agencies (total): **9**

### Session start DB check

```bash
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('caregivers:', r.rows[0].count); return pool.query('SELECT COUNT(*) FROM agencies') }).then(r => { console.log('agencies:', r.rows[0].count); pool.end(); });"
```

---

## 5. Workflow Rules — CRITICAL

- **ONE FILE PER COMMIT**
- **READ ACTUAL FILE FIRST** — cat before writing any prompt
- **SHOW DIFF BEFORE COMMIT**
- **TYPESCRIPT CHECK** — `npx tsc --noEmit` must pass before committing
- **STOP AND WAIT** — after each commit for architect approval
- **DB VERIFY** — after any save action change
- **NO NEW PACKAGES** — ask architect first
- **CLEAN GIT** — git status must be clean before starting
- **NEVER** run `npx vercel --prod`
- **NEVER** set Vercel env vars via CLI
- **NEVER** deploy uncommitted code

---

## 6. Code Conventions

| Type | Convention |
|------|------------|
| Prisma model fields | camelCase |
| DB tables/columns | snake_case |
| React components | PascalCase |
| Variables/functions | camelCase |
| Git commits | `feat:` / `fix:` / `chore:` |

- Server components by default. `use client` only when needed.
- Never use `any` in TypeScript unless absolutely necessary.
- Inline styles preferred over Tailwind (Tailwind v4 production issues).
- lucide-react for all icons. **No emojis** — not one, not ever.
- **pg Pool NEVER in middleware.ts** (Edge Runtime incompatible).

---

## 7. Design System

| Token | Value |
|-------|-------|
| Navy | `#0D1B3E` |
| Navy dark | `#080F1E` |
| Gold | `#C9973A` / `#E8B86D` |
| Royal | `#1E3A8A` / `#2563EB` |
| Amber | `#B45309` |
| Warm white | `#F7F4F0` |
| Gold tint | `#FDF6EC` |

- **NO** green as primary colour.
- **NO** emojis anywhere — ever.

### Cards

- `backgroundColor: white`
- `borderRadius: 16px`
- `border: 1px solid #E2E8F0`

### Hover

- `borderColor: #C9973A`
- `boxShadow: 0 4px 20px rgba(201,151,58,0.15)`
- `transform: translateY(-2px)`

### CTAs

- Background: `linear-gradient(135deg, #C9973A, #E8B86D)`, color: `#0D1B3E`
- OR: `linear-gradient(135deg, #1E3A8A, #2563EB)`, color: `white`

### Typography

- **DM Serif Display** (headlines)
- **DM Sans** (body)

---

## 8. Authentication Architecture — COMPLETE

**Provider:** Clerk v7 (`@clerk/nextjs` ^7.0.12)

**Middleware:** Active — protects `/agency/*` and `/admin/*` routes

### Auth flows (verified Session 8D)

**Sign up:**
1. Landing → `/sign-up?role=agency` OR `/sign-up?role=caregiver`
2. Clerk handles auth
3. `/api/onboarding/set-role?role=[role]&redirect=[destination]`
4. Sets Clerk `publicMetadata.role`
5. If agency: creates pending DB record → `/agency/pending-approval`
6. If caregiver: → `/profile/build`

**Sign in:**
1. `/sign-in` → Clerk handles auth
2. `/api/auth/role-redirect`
3. Agency approved → `/agency/search`
4. Agency pending → `/agency/pending-approval`
5. Caregiver → `/profile/build`
6. No role → `/`

**Admin:**
- Middleware checks `userId === ADMIN_CLERK_USER_ID` env var
- `/admin/*` protected

**Role stored in:** Clerk `publicMetadata.role` ('agency' | 'caregiver')

> Upgrade to production Clerk instance before first real agency.

---

## 9. Site Architecture

| Route | Status |
|-------|--------|
| `/` | BUILT — needs design + copy pass (8A) |
| `/for-agencies` | BUILT — needs rebuild |
| `/for-caregivers` | BUILT — needs copy pass |
| `/for-families` | BUILT (agent) — concept TBD |
| `/sign-in/[[...sign-in]]` | ✅ Clerk SignIn + role-redirect |
| `/sign-up/[[...sign-up]]` | ✅ Clerk SignUp + role param |
| `/onboarding` | ✅ Redirect gateway (no UI) |
| `/agency/search` | ✅ Protected, approval-gated |
| `/agency/shortlist` | ✅ Session 7B |
| `/agency/pending-approval` | ✅ Session 8C |
| `/profile/build` | ✅ 6 steps saving to DB |
| `/profile/[id]` | ✅ Agency-facing profile view |
| `/verify/[slug]` | ✅ Session 9B |
| `/id/[caregiverId]` | ✅ Session 9B |
| `/admin/agencies` | ✅ Session 8B |
| `/family/[token]` | NOT BUILT (Session 11) |

---

## 10. Profile Builder — 6 Steps + Step 7 Pending

| Step | Content | Status |
|------|---------|--------|
| 1 | Identity — name, photo, gender, city, languages | ✅ |
| 2 | Services + credentials + specializations | ✅ |
| 3 | Availability + logistics | ✅ |
| 4 | Certifications | ✅ |
| 5 | References + consent | ✅ |
| 6 | Review + submit | ✅ |
| 7 | Personality assessment (forced-choice) | NOT BUILT (Session 9A) |

- **Completion:** 85% max now. 15% reserved for Step 7.
- **Tiers:** Basic 40% / Verified 60% / Professional 80% / Elite 95%

---

## 11. Caregiver ID System (Session 9B — Built)

- **Format:** `CRF-[COUNTRY]-[STATE]-[YEAR]-[5CHAR]`
- `caregiver_code` = public ID on card and QR
- `verify_slug` = 5-char slug for `/verify/[slug]`
- `/verify/[slug]` = public, no auth required
- `/id/[caregiverId]` = premium dark ID card
- Apple Wallet scaffolded — needs Apple Developer account ($99/yr)

---

## 12. Reputation System — NOT YET BUILT

Four weighted sources: Caregiver → System → Agency → Admin

Six categories: Reliability · Human qualities · Hygiene · Beyond the call · Skills match · Communication

Schema columns exist. Rating form = Session 10.

---

## 13. Deployment

**Platform:** Vercel → GitHub (ocdeployments/Careified, branch: main)

**Trigger:** `git push origin main`

- **NEVER:** `npx vercel --prod`
- **NEVER:** set env vars via CLI — Vercel dashboard UI only

---

## 14. Verified Stats — Use Only These

- **75%** Annual caregiver turnover (Activated Insights 2025)
- **4 in 5** Leave within first 100 days (HCAOA 2024)
- **9.7M** Care jobs by 2034 (PHI 2025)

---

## 15. Messaging Rules

- Never show pricing figures
- Never name competitors
- Never use emojis
- Families never see supply-side data
- All care backgrounds welcome — never medical-only
- **Reputations EARNED — made VISIBLE by Careified**

**Tone:**
- Caregiver: warm, dignified, empowering
- Agency: efficient, confident, data-driven
- Family: calm, reassuring, human

- Never fabricate stats
- Family never contacts caregivers directly
- **ALL current copy is placeholder** — dedicated copy session required before demo

---

## 16. Session Start Checklist

```bash
# Always run at session start — read context files first
cat /data/careified/MASTER_CONTEXT.md | head -100
cat /data/careified/CLAUDE.md | head -80

# Then verify project state
cd /data/careified
git status
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('caregivers:', r.rows[0].count); return pool.query('SELECT COUNT(*) FROM agencies') }).then(r => { console.log('agencies:', r.rows[0].count); pool.end(); });"
npx tsc --noEmit
```

**All must pass before touching any file.**

---

## Last updated

April 16 2026 — Session 8D Complete
Next: Session 8A (landing page + design system)
