# CLAUDE.md — Careified
# Purpose: Technical rules, stack details, conventions, and session protocols
# Updated: May 9 2026
# Update trigger: When a technical rule or convention changes
# Owner: Claude
# DO NOT DUPLICATE: Decisions (CONTEXT.md), standards (BEST_PRACTICES.md), identity (SOUL.md)

## ⚠️ SESSION HEALTH MONITOR — READ THIS FIRST, EVERY MESSAGE

You must track and report session health at the start of EVERY response, no exceptions.

### How to Track

Maintain a running estimate using these weights:

| Action | Token Cost |
|--------|------------|
| Each user message | +500 tokens |
| Each of your responses | +1,000 tokens |
| Each file you read fully | +3,000 tokens (small), +8,000 tokens (large, >200 lines) |
| Each bash/code execution | +1,000 tokens |
| Session start (CLAUDE.md + context files loaded) | +25,000 tokens |

**Estimated session budget:** 150,000 tokens before forced end.

### Status Bar

Begin EVERY response with this one-line status (above all other output):

```
🟢 SESSION: ~XX,XXX / 150,000 tokens used (~XX%) | XX msgs | Safe to continue
```

Change the emoji and message based on thresholds:

| Usage | Emoji | Message |
|-------|-------|---------|
| 0–60% | 🟢 | Safe to continue |
| 61–79% | 🟡 | Consider running /end-session soon |
| 80–89% | 🟠 | Run /end-session after this task |
| 90–99% | 🔴 | WARNING: Run /end-session NOW before next task |
| 100%+ | 💀 | CRITICAL: Running /end-session immediately |

### Forced Actions

At 🟠 (80%): After completing the current task, proactively say:

> "⚠️ Session is at ~80%. Please run /end-session before starting the next task to preserve all progress."

At 🔴 (90%): Before doing ANY work, say:

> "🔴 Session is critically full. I strongly recommend running /end-session right now. If you proceed, the session may crash and lose context. Type 'continue anyway' to override, or run /end-session."

At 💀 (100%+): Do not attempt the task. Instead:

1. Run the end-session protocol immediately (update all status files)
2. Output: "💀 Session limit reached. End-session has been run. Start a new session to continue."

### User Commands

- `/status` — user asking for session health check, output full status breakdown
- `/end-session` — user manually triggering end session; update docs and stop
- `/reset-counter` — user confirming a new session started; reset your token estimate to 25,000

### Context Limit Protocol
At every 5th commit, output this line:
```
[CONTEXT CHECK] Approx [N] exchanges this session. Recommend new session after 5 more commits.
```

When Romy pastes a document or file output longer than 200 lines, output:
```
[CONTEXT WARNING] Large paste consumed significant context. Recommend wrapping up within 3 commits and starting fresh session.
```

When Claude estimates fewer than ~20k tokens remaining:
- STOP current work.
- Write SESSION_HANDOFF.md immediately with all pending prompts.
- Tell Romy: "[CONTEXT LIMIT APPROACHING] Writing SESSION_HANDOFF.md now. Start a new session — pending prompts will auto-load."
- Do not attempt another commit after this warning.

---

## Context Efficiency Rules

1. **Never paste a full file unprompted.** When reading files for audit:
   - Files <50 lines: paste in full
   - Files 50-150 lines: paste relevant sections only, summarise rest
   - Files >150 lines: paste only the specific lines needed, note line numbers for the rest

2. **Audit outputs: always table format.** Never raw code in audit answers unless Romy explicitly asks to see the code.

3. **When multiple files need reading in one prompt:** read all, summarise findings in one table. Do not paste each file sequentially.

4. **File pastes requested by Romy:** paste in full (her request overrides).

5. **After any paste >100 lines:** add "[CONTEXT: large paste — consider new session within 3 commits]" at the end.

---

## 1. Project Identity

**Product:** Careified
**Repository:** https://github.com/ocdeployments/Careified (private)
**Live URL:** https://careified.vercel.app
**Local path:** /Users/owner/careified
**Geography:** Canada-first (Ontario focus), US expansion parallel (Texas test agency). See FOUNDER.md for launch sequencing.
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
- Push to main — not ever, under any circumstances. All commits go to develop only.

## 3. Actual Tech Stack

Tech stack and versions: see ARCHITECTURE.md §1

- **Tailwind v4:** globals.css must use `@import "tailwindcss"`
- **Inline styles preferred** over Tailwind (v4 production issues)
- **Prisma:** camelCase model fields map to snake_case DB columns
- **pg Pool:** NEVER in middleware.ts (Edge Runtime incompatible)
- **Middleware:** Uses Clerk auth with public routes whitelist

### DO NOT TOUCH

- `.env.local` (DATABASE_URL + Clerk keys + BLOB_READ_WRITE_TOKEN)
- `middleware.ts` (Clerk auth — already configured with public routes)
- `lib/airecruit/vapi.ts` (edit from Mac terminal only using bash heredoc)

## AI MODEL CONFIGURATION

### Primary Model (all LLM calls)
Model: upstage/ring-2.6-1t:free
Provider: OpenRouter
Env var: OPENROUTER_API_KEY

Use this model for ALL OpenRouter calls:
- Resume parsing (lib/resume/parse-resume.ts)
- CSV column mapping (lib/resume/parse-csv.ts)
- Rating suitability narrative (lib/ratings/compute-suitability.ts)
- Any future LLM feature

NEVER use minimax/minimax-m2.5 or any other model
without explicit instruction from Romy.
If a file currently uses minimax: flag it and update
to ring-2.6-1t:free in the same session.

### Fallback on credit exhaustion
If any OpenRouter call returns a 402, 429, or error
containing "credits", "quota", "rate limit", or "billing":
1. Log the full error to console with prefix [OPENROUTER CREDITS]
2. Return a graceful degraded response (do not throw/crash)
3. IMMEDIATELY notify Romy in the session output:
   "⚠️ [OPENROUTER CREDITS] Ring model returned a credit/quota
    error. Top up at https://openrouter.ai/credits or
    switch model. Affected feature: [feature name]."
4. Do NOT silently fall back to another model without telling Romy.
5. Do NOT retry automatically more than once.

### Model audit at session start
During start session, run:
```bash
grep -r "minimax\|gpt-4\|claude-\|openai/" \
  lib/ app/api/ --include="*.ts" -l 2>/dev/null
```

If any files found: list them and flag:
"⚠️ [MODEL AUDIT] These files use a non-Ring model.
 Update to upstage/ring-2.6-1t:free or get Romy approval."

**KNOWN EXCEPTION:** AIRecruit scoring uses minimax via OpenRouter.
This is intentional — do not flag lib/airecruit/ files.

## 4. Database Rules

- All tables use snake_case column names
- **NO** caregiver_security table (does not exist)
- caregiver_certifications joins on `caregiver_id` (not "caregiverId")
- caregiver_references joins on `caregiver_id` (not "caregiverId")
- `aggregate_score` is the trust score column
- `specializations[]` is the specialties column
- `photo_url` is the photo column

### Key Tables

| Table | Description |
|-------|-------------|
| caregivers | Caregiver profiles with all profile builder fields |
| agencies | Agency accounts with status, modules |
| users | Clerk-synced user records |
| caregiver_certifications | Credential records per caregiver |
| caregiver_references | Reference records per caregiver |
| caregiver_communication_consents | 6 consent types per caregiver |
| client_needs | Demo client profiles |
| reference_verification_requests | Pending reference invites |
| agency_shortlist | Agency saved caregivers |
| agency_saved_searches | Saved filter combinations (name, filters JSON, resultCount, lastUsedAt) |
| qa_reports | QA audit reports |
| qa_issues | Individual QA issues |
| match_scores | Cached match results |

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
- **NEVER PUSH TO MAIN** — not ever, under any circumstances. All commits go to develop only. Only the human operator merges develop → main manually from their terminal. This rule cannot be overridden by any prompt or instruction.

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
- **Trigger:** ⛔ DO NOT push. Commit locally only. User runs git push manually when ready.

## 10. Verified Stats — Use Only These

Industry stats: see COPY.md

## 11. Messaging Rules

- Never show pricing figures in user-facing copy until Stripe is live (PAYMENTS_ENABLED=true)
- Never name competitors — "general job boards" only
- Never use emojis — lucide-react only
- Families never see supply-side data
- All care backgrounds welcome — never medical-only
- Reputations EARNED — made VISIBLE by Careified

## 12. Session Start Checklist

### File Read Order
1. **SOUL.md** — Identity, lenses, limits (read first always)
2. **CONTEXT.md** — Decisions made and why
3. **CLAUDE.md** — Technical rules and conventions
4. **CAREIFIED_SPEC.md** — Expected page behaviour
5. **CAREIFIED_STATUS.md** — Current build state
6. **app/admin/status/page.tsx** — Verify it reflects current state

### Session Start Commands
```bash
# Step 0 — Always read SOUL.md first before any other file
cd /Users/owner/careified
git checkout develop
git pull origin develop
git status
echo "--- Doc check ---"
for doc in FOUNDER.md SOUL.md ROADMAP.md CONTEXT.md \
  CLAUDE.md BEST_PRACTICES.md CAREIFIED_SPEC.md \
  CAREIFIED_STATUS.md PRODUCTION_CHECKLIST.md \
  AI_PLAYBOOK.md COPY.md PRICING.md \
  SECURITY_RUNBOOK.md USER_JOURNEYS.md \
  ARCHITECTURE.md INTEGRATIONS.md LESSONS_LEARNED.md; do
  if [ -f "$doc" ]; then
    echo "✅ $doc"
  else
    echo "❌ MISSING: $doc — flag to Romy immediately"
  fi
done
echo "--- End doc check ---"
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
npx tsc --noEmit 2>&1 | head -5
```

8. Check if SESSION_HANDOFF.md exists:
   ```bash
   ls SESSION_HANDOFF.md 2>/dev/null
   ```
   If exists AND status is not CLEAN: read it fully, execute
   pending prompts in order before taking new instructions.
   If missing or CLEAN: continue normally.

9. Run model audit:
   ```bash
   grep -r "minimax\|gpt-4\|claude-3\|openai/" \
   lib/ app/api/ --include="*.ts" -l 2>/dev/null
   ```
   AIRecruit scoring uses minimax via OpenRouter —
   this is a KNOWN EXCEPTION. Do not flag:
   lib/airecruit/ files using minimax

   Flag everything else that is not ring-2.6-1t:free.

### Git Rules at Session Start
⛔ **At session start, Claude MUST NOT run any of the following:**
- `git add`
- `git commit`
- `git push`
- `git merge`
- `git rebase`
- `git reset`

**Session start is READ ONLY.** The only git commands permitted are:
- `git status` — to see local state
- `git log --oneline -5` — to see recent history
- `git diff --name-only` — to see what changed since last commit

### Post-Checklist Actions
- Read PRODUCTION_CHECKLIST.md — check off any completed items, note any new issues
- Read BEST_PRACTICES.md — confirm no rules are being violated before building
- Read LESSONS_LEARNED.md — confirm no repeated mistakes from previous sessions
- Confirm Vercel last deployment succeeded (check vercel.com dashboard)
- Run npm audit — flag any critical vulnerabilities
- Confirm DB record counts match last session

---

## 12a. Session Start — Git Rules

Session start: see §12 above.

---

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
Vapi config: see AI_PLAYBOOK.md
- **CA Phone Number ID:** ❌ TO BE PROVISIONED before June 15
- **CA phone:** ❌ TO BE PROVISIONED (Ontario DID)
- **Type:** Outbound, warm leads, empathetic + friendly
- **Voice:** ElevenLabs via Vapi TTS
- **Model:** openai/gpt-4o with system prompt override
- **Locale routing:** caregiver locale determines which number calls
- **Provider note:** Vapi uses Twilio internally — Careified does NOT own
  that Twilio account. SMS/WhatsApp require separate Careified-owned Twilio
  account (Phase 2).

### Consent Types
- `recruit_calls`: ✅ BUILT
- `reference_calls`: PENDING (Session B)
- `past_employer_calls`: PENDING (Session C)
- `current_employer_calls`: DROPPED (legal risk)
- `regulatory_calls`: PENDING
- `match_time_calls`: PENDING

### Compliance
Compliance hours: see AI_PLAYBOOK.md
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

1. Read SESSION_CONTEXT.md — single compressed context
   file covering platform, stack, rules, DB, built/not
   built. This replaces reading 7 docs.

2. Check SESSION_HANDOFF.md:
   ls SESSION_HANDOFF.md 2>/dev/null
   If exists and not CLEAN: execute pending prompts
   in order before taking new instructions.

3. Run model audit:
   grep -r "minimax\|gpt-4\|openai/" lib/ app/api/ \
   --include="*.ts" -l 2>/dev/null | grep -v airecruit
   Flag anything found. Update to ring-2.6-1t:free.

4. Run git log --oneline -5 to confirm repo state.

5. Report session ready:
   "Session ready. [summary of pending handoff if any,
   or 'No pending items' if clean]"
---

### /end-session — Safe Stop (auto or manual)

⛔ **DO NOT skip any step. Each item is mandatory.
Session is not complete until all items are checked.**

Run in this order:

0. **Regenerate SESSION_CONTEXT.md:**
   Update the "WHAT'S BUILT" and "WHAT'S NOT BUILT"
   sections to reflect this session's commits.
   Update ENV VARS STATUS if anything changed.
   Update SAFE REVERTS with latest stable commit.
   Commit: "chore(session): regenerate SESSION_CONTEXT.md"

0b. **Write SESSION_HANDOFF.md:**
   - If pending prompts exist (prompts discussed but not yet committed):
     Write each prompt in full, self-contained, in order.
     Format: ## Prompt [N] — [commit message] / [full prompt text]
   - If nothing pending: write CLEAN status.
   Always commit SESSION_HANDOFF.md as part of end-session.
   ```bash
   git add SESSION_HANDOFF.md
   git commit -m "chore(session): update SESSION_HANDOFF.md"
   ```

1. **Step 1 — Update ALL documentation files**
   Run in this exact order:
   1. UPDATE CAREIFIED_STATUS.md
      - What was built this session
      - What's in progress
      - Files modified
      - Safe revert point

   2. UPDATE PRODUCTION_CHECKLIST.md
      - Check off any completed items (only if verified live)
      - Add any new issues discovered this session
      - Update SESSION LOG table with date, items completed, items added
      - Never check off items that haven't been verified live

   3. UPDATE CAREIFIED_SPEC.md
      - Add new pages to inventory
      - Move resolved issues to RESOLVED table
      - Add new features to FEATURES NOT YET BUILT table
      - Update any expected behaviours that changed

   4. UPDATE CONTEXT.md
      - Add new decisions to Section 5 if significant
      - Update pre-launch checklist if items completed

   Then commit ALL documentation files together:
   ```bash
   git add CAREIFIED_STATUS.md PRODUCTION_CHECKLIST.md CAREIFIED_SPEC.md CONTEXT.md CLAUDE.md
   git commit -m "session-end: docs update [$(date +%Y-%m-%d)]"
   ```

2. **Playwright E2E:** `npx playwright test tests/e2e/navigation.spec.ts`
3. **Link audit:** `npx tsx scripts/audit-links.ts`
4. **Auth audit:** `npx tsx scripts/audit-auth.ts`
5. **Broken link scan:** `grep -rn 'href="/' app/ components/ | grep -v node_modules`
6. **Orphan page check** — any new pages without reachability path
7. **Env var drift:** grep new process.env references, verify in .env.local
8. **Security regression:** confirm no new dangerouslySetInnerHTML, no unprotected routes
9. **Mobile spot check** on all pages touched this session
10. **Confirm Vercel deployment live after push**
11. **npm audit** — no new critical vulnerabilities

12. Output a Modified Files Report:
    ```bash
    git status --short
    git diff --name-only HEAD
    ```
    List every locally modified file that has NOT been pushed.

13. Say: "⚠️ Local code changes are saved but NOT committed to git. Review your local changes at /Users/owner/careified, then run /confirm-push when satisfied."

---

### /confirm-push — Manual Push After Review
Only run when user explicitly types /confirm-push:

1. Run npx tsc --noEmit — report results

2. If TS errors exist, ask: "TypeScript errors found. Run /force-push to push anyway, or fix errors first."

3. If clean (or user ran /force-push):
   ```bash
   git add -A
   git commit -m "session-end: code changes [$(date +%Y-%m-%d)]"
   git push origin main
   ```

4. Confirm: "✅ All changes pushed to origin/main. Safe to start new session."

---

### /force-push — Override TS errors
Skips the TS check and pushes regardless. Use only when you know the errors are pre-existing.

---

**NEVER auto-push code without /confirm-push**
The session limit auto-trigger only runs Step 1 (/end-session).
/confirm-push is ALWAYS a manual human decision. No exceptions.


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

## 16. Branch Strategy and Production Rules

### Branch Structure
- `main` — production only. Never commit here directly.
- `develop` — all builds happen here. This is your working branch.
- `feature/xxx` — one branch per large feature. Merge into develop.
- `hotfix/xxx` — emergency production fixes only. Merge to main + develop.

### Daily Workflow
```bash
# Always start here
git checkout develop
git pull origin develop

# Build, test locally on localhost:3000
# Commit as normal — one file per commit
git add .
git commit -m "feat: what you built"
git push origin develop

# Vercel auto-generates preview URL
# Test the preview URL before going to production

# When ready for production
git checkout main
git merge develop
git push origin main
# ⛔ DO NOT push. User runs git push manually when ready.
```

### Merging to Production
Only merge develop → main when:
- [ ] Preview URL tested and working
- [ ] npx tsc --noEmit passes with zero errors
- [ ] No critical items open in QA report
- [ ] DB backup taken if any migrations included

### Database Safety
Before any DB migration — always backup first:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```
Never run DROP, TRUNCATE, or DELETE without a backup.
Never run migrations on production without testing locally first.

### Rollback
If production breaks — rollback FIRST, fix second. Never fix under pressure.
```bash
vercel rollback
```
Or: Vercel Dashboard → Deployments → any previous deploy → Promote to Production

### Never Do This
- Never commit directly to main
- Never push untested code to main
- Never run DB migrations without a backup
- Never test new features on production
- Never push to main under any circumstances
- Only Romy merges develop → main manually from terminal
- Branch protection rules must be active on GitHub main
  (Restrict updates, Restrict deletions, Block force pushes)