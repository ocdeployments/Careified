# SESSION HANDOFF — 2026-05-31 (FINAL)
# This is the single source of truth for next session.
# Replace all previous versions.
# Commit this file to the repo at: docs/SESSION_HANDOFF_2026-05-31.md

---

## SESSION START CHECKLIST (every session — non-negotiable)
1. Run: `bash scripts/gen-codebase-map.sh` → paste output into architect chat
2. Run: `git log --oneline -5` → confirm latest commits
3. Read this file in full
4. Architect reads codebase map before writing any prompt

---

## CURRENT STATE
- Branch: main (latest commit: d338008)
- Live: careified.com
- DB: Render Oregon (production) — Supabase Toronto ready but not switched yet
- Demo data: seeded on Render for agency c1444e1d (Sunrise Senior Care Ontario)
- Safe revert: 41c6b31

---

## COMMITS THIS SESSION (2026-05-31, all on main)

### SEO / AEO
- Root metadata + OG tags + Twitter cards in app/layout.tsx
- robots.txt — /admin, /agency, /api, /gate blocked from indexing
- Sitemap domain fixed to careified.com
- JSON-LD Organization schema on homepage
- FAQPage JSON-LD on /for-agencies + /for-caregivers
- Page-level metadata on all 8 public pages (privacy + terms noindex)

### QA Infrastructure
- tests/e2e/agency-pages.spec.ts — 25 Playwright tests across 13 agency pages + public pages
- tests/e2e/api-smoke.spec.ts — API auth tests (skipped when BETA_GATED=true)
- tests/e2e/interactions.spec.ts — button interaction tests
- .husky/pre-push — blocks push if TypeScript/build/Playwright fails
- scripts/qa-snapshot.sh — full health report (TS + build + Playwright + audits)
- scripts/audit-dead-buttons.sh — finds buttons with no onClick
- scripts/audit-orphaned-pages.sh — finds pages with no inbound links
- scripts/audit-broken-links.sh — finds href values with no matching page.tsx
- BETA_GATED=true env var skips API auth tests against beta-protected production

### S3 — Client Triage Panel (COMPLETE)
- DB: urgency_flag + urgency_flagged_at columns on clients table
- API: PATCH /api/agency/clients/[id]/urgency (toggle urgency flag)
- API: POST /api/agency/contact-request (contact_requests table created)
- Component: components/agency/ClientTriagePanel.tsx
  - 5-step find coverage funnel: roster → history → search → QuickFill → AIRecruit
  - Urgency toggle, aging indicator (green/amber/red), revenue implication
  - Coordinator notes textarea with auto-save
- Wired into /agency/clients/[id] as right-side panel
- Urgency indicators on /agency/clients list page

### Button fixes
- components/profile/CaregiverProfileDemo.tsx — shortlist button wired (POST/DELETE /api/agency/shortlist)
- components/profile/CaregiverProfileDemo.tsx — contact request button wired (POST /api/agency/contact-request)
- Both buttons have loading states and visual feedback

### S4 — Bench Strength Intelligence (COMPLETE)
- API: bench_strength computed in /api/agency/dashboard (specializations, languages, willing_live_in)
- Component: components/agency/BenchStrengthWidget.tsx
  - compact=true: 4 worst gaps, dashboard Zone 3
  - compact=false: all 8 categories, full intelligence tab
  - Bar chart with color coding: critical=red, low=amber, moderate=gold, strong=green
  - "Recruit →" CTA links to /agency/airecruit/new?skill=[key]
- Wired into dashboard Zone 3 (compact)
- Wired into /agency/intelligence Bench Strength tab (full)
- /agency/airecruit/new pre-fills title + description from ?skill= param
- Pre-fill banner shown when skill param present

### Bug fixes
- Gate page: window.location.href replaces router.push — cookie committed before redirect
- Agency layout: admin users bypass DB lookup, wrapped in AgencyLayoutClient
- Middleware (proxy.ts): admin role bypasses all role-based route restrictions — PENDING PUSH
- Gate + waitlist pages: navbar and footer hidden — PENDING PUSH
- Admin redirect after sign-in: routes to /admin via role-redirect

### Code hygiene
- console.log removed from 10 API route files
- BETA_GATED env var in pre-push hook and qa script

---

## PENDING — NOT YET COMMITTED/PUSHED
The following fixes were written but the agent may not have pushed them yet.
Verify with `git log --oneline -5` at session start:

1. **Navbar hidden on /gate and /waitlist** — app/layout.tsx conditional render
2. **Admin universal access in middleware** — proxy.ts admin bypass before role checks
3. **Admin redirect to /admin after sign-in** — confirm role-redirect route works

If these are not in git log, run the fix prompt from the previous session before starting new work.

---

## KNOWN BUGS (fix before S5)
- Dead buttons in 4 files (audit found): app/contact/ContactForm.tsx, components/profile/ContactCard.tsx, app/demo/login/page.tsx, app/admin/DemoAgenciesList.tsx
- /support broken link — links point to /support but no page exists (should be /agency/support or /caregiver/support)
- 49 orphaned pages flagged by audit — most are false positives (sidebar nav not detected by grep), ~15 are genuinely unlinked. Address in a dedicated linking session.
- Light theme warnings in Playwright — coming from Clerk injected UI components, not our code. Not worth fixing.
- CA/US locale leak on /agency/search — still unresolved

---

## BUILD SEQUENCE STATUS

### Complete
- S1: Sidebar + layout restructure ✅
- S2: Dashboard 5-zone redesign ✅
- S3: Client triage panel ✅
- S4: Bench strength intelligence ✅
- S5: Overnight triage narrative ✅ (API + component built, renders in Zone 4)
- S7: Telegram bot ✅ (webhook with 7 commands, multi-user connect API)

### Not yet built
- S6: Conversational search Phase 1 (NOT BUILT)
- S8: Bulk upload → AIRecruit auto-launch
- S9: AIRecruit mobile responsive
- S10: Pre-call SMS + CNAM branding (Twilio — ROMY action required first)

---

## S5 SPEC — Overnight Triage Narrative (BUILT)

Location: Dashboard Zone 4
Status: ✅ BUILT

Files:
- API: app/api/agency/triage-narrative/route.ts
- Component: components/agency/TriageNarrative.tsx

Implementation:
- GET /api/agency/triage-narrative: checks cache → if fresh return cached → else generate via LLM → cache → return
- Cache key: agency_id + date (YYYY-MM-DD)
- Uses OpenRouter with upstage/ring-2.6-1t:free
- Input data: AIRecruit results (last 24h), expiring credentials (next 60 days), unmatched clients, bench gaps
- Output: Plain English, max 3 sentences
- Dashboard fetches on load, renders with skeleton loading state

---

## S6 SPEC — Conversational Search Phase 1

Extend AI assistant (/agency/assistant) action blocks:
- Natural language → structured search parameters → navigate to /agency/search with filters pre-applied
- "Find a French-speaking overnight caregiver for Robert in Scarborough"
  → /agency/search?language=French&availability=overnight&city=Scarborough
- Parse intent in the existing AI assistant API
- Return action block: { type: 'search', params: { ... }, url: '/agency/search?...' }
- Rate limits: Starter 0/day, Growth 50/day, Scale unlimited

---

## S7 SPEC — Telegram Bot (BUILT)

Status: ✅ BUILT
Tech: Telegram Bot API (HTTP only, no new packages)

Files:
- Webhook: app/api/telegram/webhook/route.ts
- Connect API: app/api/telegram/connect/route.ts

Bot commands implemented:
- /connect — connect agency account
- /morning — morning briefing (unmatched clients + AIRecruit results)
- /search [query] — search caregivers
- /unmatched — list unmatched clients
- /airecruit — latest AIRecruit results
- /creds — caregivers with expiring credentials
- /help — list all commands

Rate limits: Starter none, Growth 30/day, Scale 100/day
Multi-user support via connect_codes table

---

## LAUNCH BLOCKERS (June 15)

### Romy's side
- [ ] Clerk production keys — verify pk_live_ is active not dev
- [ ] careified.ca added to Vercel
- [ ] Lawyer review — lib/legal/text.ts, ToS, AIRecruit consent copy
- [ ] E&O / Cyber / GL insurance
- [ ] 50 complete caregiver profiles before first real agency goes live
- [ ] Copy session — all placeholder text replaced
- [ ] Twilio account setup (required before S10)
- [ ] CNAM registration on Vapi phone number ("CAREIFIED JOBS")

### Build agent's side
- [ ] PHI encryption — AES-256-GCM on client_needs health fields
- [ ] Supabase switch — test on preview first, then production
- [ ] PRICING.md update to $149/$349/$699
- [ ] Demo data strategy — decide: wipe / quarantine / keep

---

## ARCHITECT WORKFLOW (updated rules)

### Session start (non-negotiable)
1. Run `bash scripts/gen-codebase-map.sh && cat CODEBASE_MAP.md` in terminal
2. Paste output to architect at session start
3. Architect reads map before writing any prompt
4. Run `git log --oneline -5` to confirm current state

### Diagnostic workflow (no more one-at-a-time cat commands)
When a bug is reported:
1. Architect reads project knowledge + codebase map first
2. Architect writes ONE diagnostic prompt to agent — agent reads ALL relevant files and reports back
3. Architect assesses report and writes ONE fix prompt
4. No ping-pong of individual cat commands

### Build agent rules (non-negotiable)
- One file per commit
- npx tsc --noEmit before every commit — zero errors required
- npm run build must pass before push
- git push origin main after every commit
- Stop after each commit, wait for confirmation before next
- No new packages without asking
- NEVER npx vercel --prod
- NEVER set Vercel env vars via CLI
- Pre-push hook runs automatically — do not bypass

### QA (automated)
- Run `bash scripts/qa-snapshot.sh` before any push
- Pre-push hook blocks on TypeScript errors, build failures, Playwright failures
- Dead button audit: run `bash scripts/audit-dead-buttons.sh`
- Orphaned pages: run `bash scripts/audit-orphaned-pages.sh`
- Broken links: run `bash scripts/audit-broken-links.sh`

---

## DESIGN SYSTEM (locked)
- PAGE_BG: #080F1E
- NAV_BG: #0D1B3E
- CARD_BG: rgba(255,255,255,0.04)
- CARD_BORDER: rgba(255,255,255,0.08)
- GOLD: #C9973A / GL: #E8B86D / GLX: rgba(201,151,58,0.15)
- TEXT_PRIMARY: #F5F0E8
- TEXT_MUTED: rgba(255,255,255,0.55)
- TEXT_TERTIARY: rgba(255,255,255,0.3)
- RED: #E24B4A / AMBER: #F59E0B / GREEN: #22C55E
- TYPOGRAPHY: DM Serif Display (headings), DM Sans (body)
- Inline styles only — zero Tailwind classes in production
- No emojis in UI — use text or SVG icons only

---

## STACK
- Next.js 16.2.3, React 19
- Prisma 7, raw pg Pool, Render PostgreSQL (snake_case)
- Clerk 7.0.12
- Resend (email)
- Vapi (voice AI) — assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- OpenRouter (LLM) — Ring model: upstage/ring-2.6-1t:free, scoring: minimax-m2.5
- Vercel (auto-deploy on push to main)
- Repo: ocdeployments/Careified on GitHub
- Local: /Users/owner/careified

---

## KEY FILES (read at session start if touching these areas)
- app/agency/dashboard/page.tsx — 5-zone dashboard
- app/api/agency/dashboard/route.ts — consolidated stats + bench strength
- app/agency/layout.tsx — auth + admin bypass
- proxy.ts — middleware, gate, role-based routing
- components/agency/BenchStrengthWidget.tsx — bench strength bars
- components/agency/ClientTriagePanel.tsx — triage funnel
- components/profile/CaregiverProfileDemo.tsx — shortlist + contact buttons
- lib/matching/ — alignment score engine
- lib/airecruit/ — Vapi, scoring, consent
- app/admin/ — admin console pages

---

## PRODUCT VISION (locked)
"Careified does the triage. The agency makes the final call."

Core principles:
- TRIAGE is the product messaging — use this word everywhere
- Two parallel worlds: Client Operations + Talent Acquisition
- Platform is ambient — desk, mobile, Telegram
- Coordinator drives workflow by client, not by feature stage
- Non-recommender model — platform conduit, never staffing agency
- Honest null handling — missing data = null score, never imputed

---

## PRICING (final)
| Tier | CAD/mo | Key capabilities |
|------|--------|-----------------|
| Starter | $149 | Core platform, search, roster, clients, basic AIRecruit |
| Growth | $349 | + Conversational search, Telegram, QuickFill, Intelligence, bench strength |
| Scale | $699 | + Unlimited search, Telegram push, family portal, white label |
| Enterprise | Custom | Multi-location, API access, custom workflows |

Caregiver: Free basic + Professional $9.99/mo
Early adopters (first 2 agencies): 12 months protected pricing
