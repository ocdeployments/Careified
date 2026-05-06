# CLAUDE.md — Careified

Read this file completely at the start of every session.
Last updated: May 5, 2026 — Phase 1 Complete

## 1. Project Identity

**Product:** Careified
**Repository:** https://github.com/ocdeployments/Careified (private)
**Live URL:** https://careified.vercel.app
**Local path:** /Users/owner/careified
**Geography:** Canada-first (Ontario focus), US expansion planned. Texas mentioned only in AIRecruit Vapi config history.
**Core moat:** Two-sided verified reputation system.

Platform serves ALL care backgrounds — never medical-only framing.

| Audience | Role | What they see |
|----------|------|---------------|
| Agency | Primary buyer — pays | Search, profiles, shortlist, client management |
| Caregiver | Supply side — always free | Profile builder, ID card, badges |
| Family | Read-only portal (future) | Schedule, caregiver card, notifications |

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
- Use str_replace or write_file for full rewrites (always use bash heredoc)

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
| Animation | Framer Motion | — |

- **Tailwind v4:** globals.css must use `@import "tailwindcss"`
- **Inline styles preferred** over Tailwind (v4 production issues)
- **Prisma:** camelCase model fields map to snake_case DB columns
- **pg Pool:** NEVER in middleware.ts (Edge Runtime incompatible)
- **Middleware:** Uses Clerk auth with public routes whitelist

### DO NOT TOUCH

- `.env.local` (DATABASE_URL + Clerk keys)
- `middleware.ts` (Clerk auth — already configured with public routes)
- `lib/airecruit/vapi.ts` (edit from Mac terminal only using bash heredoc)

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
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
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
- **File Rewrite Rule:** When rewriting existing files, ALWAYS use bash heredoc:
  ```bash
  cat > filepath << 'EOF'
  ...content...
  EOF
  ```
  Never use str_replace or write_file for full rewrites. This has caused multiple debugging sessions.

## 7. Design System

- **Navy:** `#0D1B3E` — nav, hero, dark sections
- **Navy dark:** `#080F1E` — footer
- **Gold:** `#C9973A` / `#E8B86D` — caregiver, premium, primary CTAs
- **Royal:** `#1E3A8A` / `#2563EB` — agency colour, secondary actions
- **Amber:** `#B45309` — family colour
- **Warm white:** `#F7F4F0` — page background
- **Gold tint:** `#FDF6EC` — active states, alternate sections

**NO green as primary colour. No emojis anywhere.**

**Typography:** DM Serif Display (headlines) + DM Sans (body). Inter is legacy — being phased out.

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
| lib/demo.ts | ✅ Demo mode constants |
| components/profile/ProfilePreviewCard.tsx | ✅ Live preview panel |
| components/profile/LiveProfilePreview.tsx | ✅ DONE (May 4) |
| components/profile/TravelRadiusMap.tsx | ✅ DONE (May 4) - Leaflet |
| components/profile/IDCardReveal.tsx | ✅ Credential ceremony |
| app/profile/build/Step0ResumeUpload.tsx | ✅ Session 10A |
| app/profile/build/Step1Identity.tsx | ✅ |
| app/profile/build/Step2Services.tsx | ✅ |
| app/profile/build/Step3Availability.tsx | ✅ |
| app/profile/build/Step4Location.tsx | ✅ + Leaflet map |
| app/profile/build/Step5Credentials.tsx | ✅ |
| app/profile/build/Step6Compliance.tsx | ✅ |
| app/profile/build/Step7Personality.tsx | ✅ |
| app/profile/build/Step8WorkHistory.tsx | ✅ |
| app/profile/build/Step9References.tsx | ✅ |
| app/profile/build/Step10OpenQuestions.tsx | ✅ |
| app/demo/page.tsx | ✅ Demo landing |
| app/demo/dashboard/page.tsx | ✅ |
| app/demo/search/page.tsx | ✅ |
| app/demo/clients/page.tsx | ✅ |
| app/demo/clients/[id]/page.tsx | ✅ |

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
cd /Users/owner/careified
git status
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
npx tsc --noEmit 2>&1 | head -5
```

## 13. Testing & Quality Assurance

### Playwright MCP
- **MCP Server:** `@playwright/mcp` (configured in `~/.claude/settings.json`)
- **Tests:** `tests/e2e/` — Playwright E2E tests
- **Run tests:** `npx playwright test tests/e2e/navigation.spec.ts`
- **Browser install:** `npx playwright install chromium`

### QA Tracking System (May 5 2026)
- **Database tables:** `qa_reports`, `qa_issues` (created via SQL)
- **API:** `/api/qa/report` — POST (create report), GET (fetch latest + history), PATCH (mark fixed)
- **Admin tab:** `/admin/status` → "QA Report" tab with collapsible sections, Mark Fixed buttons
- **Seed script:** `scripts/seed-qa-report.ts` — seed initial audit issues
- **Run seed:** `npx tsx scripts/seed-qa-report.ts`

### Architecture Audit (QE Agent Role)
- Run: `find . -name "*.tsx" -not -path "*/.*" -not -path "*/.next/*" > all_pages.txt`
- Compare file list against `/admin/sitemap` for orphan detection
- Audit tab in `/admin/status` tracks orphan pages and fixes

## 14. AIRecruit — Vapi Configuration

### Current Vapi Setup
- **Assistant ID:** fdd84833-80ef-4c50-8391-2d7b38e56ead
- **Assistant name:** AIRecruit Screener
- **Phone Number ID:** efd1fdc0-6795-4d5f-a399-b95367bd88ff
- **Phone number:** +1 (518) 617-4826 (US Twilio)
- **Type:** Outbound, warm leads, empathetic + friendly
- **Voice:** ElevenLabs via Vapi TTS
- **Model:** openai/gpt-4o with system prompt override
- **Canadian calls:** Supported via same US Twilio number

### Consent Types
- `recruit_calls`: ✅ BUILT
- `reference_calls`: PENDING (Session B)
- `past_employer_calls`: PENDING (Session C)
- `current_employer_calls`: DROPPED (legal risk)
- `regulatory_calls`: PENDING
- `match_time_calls`: PENDING

### Compliance
- CRTC (Canada): 9am-9:30pm weekdays, 10am-6pm weekends
- TCPA (US/Texas): 8am-9pm local time
- Calling hours enforced in lib/airecruit/calling-hours.ts
- Suppression list checked before every call
- Permission gate in every call — candidate must say yes

### AIRecruit Sessions Roadmap

**COMPLETE:**
- Session A: Core recruitment calls (Phases 1-6)

**PENDING:**
- **Session B:** Consent flow for all consent types
- **Session C:** Profile analysis + campaign from profiles + reference agent
- **Session D:** SMS, retry logic, cron, bulk actions, employer agent

### Scoring Engine
- OpenRouter API with minimax/minimax-m2.5
- Runs async after webhook receives transcript
- Outputs: overallScore, recommendation, summary, questionScores, flags, confidence
- Recommendation values: advance, review, pass

## 14. Session Commands

### When I say "start session" you will:
1. Read these files in full — in this order:
   - CONTEXT.md
   - CLAUDE.md
   - HANDOFF.md
   - CAREIFIED_SPEC.md
   - CAREIFIED_STATUS.md

2. Run the session start checklist:
   ```bash
   cd /Users/owner/careified
   git status
   git log --oneline -5
   export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
   node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
   npx tsc --noEmit 2>&1 | head -5
   ```

3. Audit the codebase against CAREIFIED_SPEC.md
   POST findings to /api/qa/report
   Show me: PASS / FAIL / WARNING counts only

4. Show this summary:
   ```
   SESSION STARTED — [date]
   ─────────────────────────
   Git: [last 3 commits]
   TypeScript: ✅ clean / ❌ X errors
   DB: ✅ [X caregivers]
   QA: ❌ X failing  ⚠️ X warnings  ✅ X passing
   Most critical open issue: [top item from spec]
   Awaiting your instruction.
   ```

5. Do not build anything. Wait for my instruction.

---

### When I say "end session" you will:
1. UPDATE CAREIFIED_SPEC.md
   - Add new pages + expected behaviours built today
   - Add new buttons/CTAs with href targets
   - Move fixed issues to RESOLVED section
   - Update page count if changed
   Commit: "chore: update CAREIFIED_SPEC.md — [date]"
   Show diff. Wait for approval.

2. UPDATE CLAUDE.md
   - Update Last updated date
   - Add new key files, DB tables, env vars
   Commit: "chore: update CLAUDE.md — [date]"
   Show diff. Wait for approval.

3. UPDATE CONTEXT.md
   - Add product decisions made today and WHY
   - Add anything tried that didn't work
   Commit: "chore: update CONTEXT.md — [date]"
   Show diff. Wait for approval.

4. UPDATE HANDOFF.md
   - Update generated date
   - Add new pages to inventory
   - Move completed items out of pending
   - Update safe revert point to latest commit hash
   Commit: "chore: update HANDOFF.md — [date]"
   Show diff. Wait for approval.

5. UPDATE CAREIFIED_STATUS.md
   - Mark completed sessions as DONE with commit hash
   - Move next session to top of queue
   Commit: "chore: update CAREIFIED_STATUS.md — [date]"
   Show diff. Wait for approval.

6. RUN FINAL QA AUDIT
   POST report to /api/qa/report with latest commit hash

7. SHOW SESSION SUMMARY:
   ```
   SESSION COMPLETE — [date]
   ──────────────────────────────
   Commits: X
   [list each hash + message]

   QA Delta:
   Started:  ❌ X failing  ⚠️ X warnings
   Finished: ❌ X failing  ⚠️ X warnings
   Fixed this session: X issues

   Still open (priority order):
   1. [most critical]
   2. [second]
   3. [third]

   Next session should start with:
   [one line — single most important next action]
   ```

## Last updated: May 5, 2026 — Phase 1 Complete

### Demo Environment
- `/demo` — Landing page with feature tour
- `/demo/dashboard` — Agency dashboard with demo data
- `/demo/search` — Caregiver search with filters (5 mock caregivers, client-side filtering)
- `/demo/clients` — Client list (5 demo clients)
- `/demo/clients/[id]` — Client detail with match results

**Note:** ClientSearch component accepts `isDemo` prop. When true, uses in-component mock data instead of calling /api/match/rank (which requires Clerk auth).

### Travel Radius Map
- Leaflet + OpenStreetMap in Step 4 (Location)
- Draggable marker, circle overlay, radius selector

Read CAREIFIED_STATUS.md for full build tracker, pending items, and roadmap.
Read HANDOFF.md for project handoff context.