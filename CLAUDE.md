# CLAUDE.md — Careified

Read this file completely at the start of every session.
Last updated: April 2026 — Session 10C

## 1. Project Identity

**Product:** Careified  
**Repository:** https://github.com/ocdeployments/Careified (private)  
**Live URL:** https://careified.vercel.app  
**Local path:** /data/careified  
**Geography:** Texas-first (Frisco/McKinney). Canada & US expansion.  
**Core moat:** Two-sided verified reputation system.  

Platform serves ALL care backgrounds — never medical-only framing.

| Audience | Role | What they see |
|----------|------|---------------|
| Agency | Primary buyer — pays | Search, profiles, shortlist, client management |
| Caregiver | Supply side — always free | Profile builder, ID card, badges |
| Family | Read-only portal (Session 14) | Schedule, caregiver card, notifications |

## 2. Architect Role

I am CareNet Architect. I design and prompt. The agent builds.

**I ALWAYS do before writing a prompt:**
- Read the actual file I am about to modify (cat the full file)
- Check current DB schema if prompt touches DB columns
- Verify git status is clean
- Confirm TypeScript compiles after each change
- Check DB data landed after each save action change

**I NEVER do:**
- Write a prompt based on assumptions about file contents
- Approve a commit without seeing the diff
- Continue past a TypeScript error
- Write multi-file prompts (one file per commit always)
- Accept "it looks correct" without verification
- Paste API keys in chat

## 3. Actual Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Auth | Clerk | v7 (@clerk/nextjs ^7.0.12) |
| ORM | Prisma | 7 |
| DB Driver | pg (raw Pool) | ^8.20 |
| Database | Render PostgreSQL | — |
| Icons | lucide-react | latest |

- **Tailwind v4:** globals.css must use `@import "tailwindcss"`
- **Inline styles preferred** over Tailwind (v4 production issues)
- **Prisma:** camelCase model fields map to snake_case DB columns
- **pg Pool:** NEVER in middleware.ts (Edge Runtime incompatible)

### DO NOT TOUCH

- `.env.local` (DATABASE_URL + Clerk keys)
- `middleware.ts` (Clerk auth — already correct)

## 4. Database Rules

- All tables use snake_case column names
- **NO** caregiver_security table (does not exist)
- caregiver_certifications joins on `caregiver_id` (not "caregiverId")
- caregiver_references joins on `caregiver_id` (not "caregiverId")
- `aggregate_score` is the trust score column
- `specializations[]` is the specialties column
- `photo_url` is the photo column

### Session start DB check

```bash
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
```

## 5. Workflow Rules — CRITICAL

- **ONE FILE PER COMMIT** — never build multiple files in one commit
- **READ ACTUAL FILE FIRST** — cat the full file before writing any prompt
- **SHOW DIFF BEFORE COMMIT** — always review, never commit blind
- **TYPESCRIPT CHECK** — `npx tsc --noEmit` must pass before committing
- **STOP AND WAIT** — after each commit for architect approval
- **DB VERIFY** — after any save action change, query DB to confirm
- **NO NEW PACKAGES** — stop and ask architect first
- **CLEAN GIT** — git status must be clean before starting
- **NEVER run npx vercel --prod**
- **NEVER set Vercel env vars via CLI** — dashboard only

## 6. Code Conventions

| Type | Convention |
|------|------------|
| Prisma model fields | camelCase |
| DB tables/columns | snake_case |
| React components | PascalCase |
| Variables/functions | camelCase |
| Git commits | `feat:` / `fix:` / `chore:` |

- Server components by default. `'use client'` only when needed.
- Never use `any` in TypeScript unless absolutely necessary.
- Inline styles preferred over Tailwind.
- lucide-react for all icons. **No emojis anywhere.**

## 7. Design System

- **Navy:** `#0D1B3E` — nav, hero, dark sections
- **Navy dark:** `#080F1E` — footer
- **Gold:** `#C9973A` / `#E8B86D` — caregiver, premium, primary CTAs
- **Royal:** `#1E3A8A` / `#2563EB` — agency colour, secondary actions
- **Amber:** `#B45309` — family colour
- **Warm white:** `#F7F4F0` — page background
- **Gold tint:** `#FDF6EC` — active states, alternate sections

**NO green as primary colour. No emojis anywhere.**

**Typography:** DM Serif Display (headlines) + DM Sans (body)

**Cards:** white, borderRadius 16px, border 1px solid #E2E8F0

**Hover:** borderColor #C9973A, gold glow, translateY(-2px)

**CTAs:** linear-gradient(135deg, #C9973A, #E8B86D), color #0D1B3E

## 8. Profile Builder Architecture

### Save System (Three Layers)

1. **ProfileFormContext** (instant) — `/lib/context/ProfileFormContext.tsx`
2. **localStorage** (300ms debounce) — automatic via Context useEffect
3. **DB save (onBlur)** — `useProfileSave` hook → `/api/profile/save-field`

### API Routes

- `POST /api/profile/save-field` — single field save on blur
- `POST /api/profile/save-step` — full step save on Next
- `GET /api/profile/load` — load all saved data on mount

### Key files

| File | Status |
|------|--------|
| lib/context/ProfileFormContext.tsx | ✅ Global form state |
| lib/hooks/useProfileSave.ts | ✅ Three-layer save |
| components/profile/ProfilePreviewCard.tsx | ✅ Live preview panel |
| components/profile/IDCardReveal.tsx | ✅ Credential ceremony |
| components/profile/Step1Identity.tsx | ✅ Session 10B (DONE) |
| app/profile/build/Step2Services.tsx | ✅ Session 10C (DONE) |
| app/profile/build/Step3Availability.tsx | ⚠️ Session 10D |
| app/profile/build/Step4Certifications.tsx | ⚠️ Session 10F |
| app/profile/build/Step5References.tsx | ⚠️ Session 10J |
| app/profile/build/Step6Review.tsx | ✅ Wired to IDCardReveal |

## 9. Deployment

- **Platform:** Vercel → GitHub (ocdeployments/Careified, branch: main)
- **Trigger:** `git push origin main` (auto-deploy)
- **NEVER:** `npx vercel --prod`
- **NEVER:** set env vars via CLI

## 10. Verified Stats — Use Only These

| Stat | Source |
|------|--------|
| 75% | Annual caregiver turnover (Activated Insights 2025) |
| 4 in 5 | Leave within first 100 days (HCAOA 2024) |
| 9.7M | Care jobs to fill by 2034 (PHI 2025) |

## 11. Messaging Rules

- Never show pricing figures
- Never name competitors — "general job boards" only
- Never use emojis — lucide-react only
- Families never see supply-side data
- All care backgrounds welcome — never medical-only
- Reputations EARNED — made VISIBLE by Careified

## 12. Session Start Checklist

```bash
cd /data/careified
git status
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
npx tsc --noEmit 2>&1 | head -5
```

## Last updated: April 2026 — Session 10C

Read MASTER_CONTEXT.md alongside this file for full project state.  
Read CLIENT_INTAKE.md for client intake and matching spec.  
Read RATING_SYSTEM.md for reputation and scoring spec.