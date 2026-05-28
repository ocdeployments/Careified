# SESSION HANDOFF — 2026-05-28 (FINAL)
# This is the single source of truth for next session.
# Replace all previous versions.

---

## CURRENT STATE
- Branch: main (latest) + develop (in sync)
- Live: careified.com
- DB: Render Oregon (production) — Supabase Toronto ready but not switched yet
- Demo data: seeded on Render for agency c1444e1d (Sunrise Senior Care Ontario)
- Safe revert: before dark glass redesign if needed

## COMMITS THIS SESSION (all on main)
- db6a44e — AI assistant: model fix, platform-aware prompt, action blocks, suggested prompts
- e02029c — Cron: optimistic locking on call_retry_queue
- b9dd5ff — Dashboard: operations-first 4-zone layout
- a8a10e2 — Dashboard API: agency name, plan tier, unmatched clients
- a461813 — Nav: Caregivers, Intelligence, removed Shortlist
- a23d320 — Roster: Onboarding/Credentials/Availability tabs
- cecd9b4 — /agency/caregivers: 4-tab page
- 1385eab — /agency/intelligence: Phase 1 ROI summary
- bbd6c54 — Dashboard: mobile responsive breakpoints
- af0dbbf — Signup: blank page fix
- 2b45eef — Nav: live badge counts (AIRecruit + Roster)
- Latest — Dashboard: dark glass visual redesign + microcopy + amber alerts + three-mode toggle

---

## PRODUCT VISION (locked this session)

### The product in one sentence
Careified does the triage. The agency makes the final call.

### Core principles
- TRIAGE is the product messaging — use this word everywhere in copy
- Two parallel worlds run simultaneously: Client Operations + Talent Acquisition
- Platform is ambient — works at the desk, on mobile, via Telegram
- Coordinator drives workflow by client, not by feature stage
- No forced funnel — agency can be at any stage on any day

---

## ARCHITECTURE DECISIONS (locked)

### Navigation
- Persistent left sidebar replaces top navbar for agency users
- Top navbar collapses to: logo + notification bell + user avatar only
- Mode toggle REMOVED from dashboard entirely
- Sidebar has four sections: TRIAGE / CLIENT OPERATIONS / TALENT ACQUISITION / INTELLIGENCE + ADMIN

### Sidebar structure
TRIAGE
  Dashboard (morning briefing)

CLIENT OPERATIONS
  Clients [unmatched count — red badge]
  Placements
  Shortlist [pipeline count — gold badge]

TALENT ACQUISITION
  Find Caregivers
  Roster [expiring credentials count — gold badge]
  AIRecruit [results ready count — gold badge]
  QuickFill

INTELLIGENCE
  Performance
  Bench Strength

ADMIN
  Settings
  Support

Bottom: Plan status · Days remaining · User avatar

### Sidebar clicking behaviour
- Clients [3] → /agency/clients?tab=unmatched (3 unmatched pre-selected)
- AIRecruit [2] → /agency/airecruit?tab=results (results tab pre-selected)
- Roster [4] → /agency/roster?tab=credentials (credentials tab pre-selected)
- Every count badge is a portal to the relevant filtered view

### Mobile strategy
- Desktop 1024px+: 220px sidebar always visible, main content marginLeft 220px
- Tablet 768-1024px: 60px icon-only rail, hover/tap expands to full width
- Mobile <768px: sidebar hidden, bottom tab bar (5 tabs: Dashboard/Clients/Caregivers/AIRecruit/More)
- Bottom tabs have badge counts
- Safe area padding for iPhone home bar
- EVERY page must be mobile compatible — this is non-negotiable

### Dashboard (5 zones, no mode toggle)
Zone 1: Morning briefing — personalised greeting (DM Serif) + 3-5 triage action cards (red/gold/green)
Zone 2: Agency snapshot — 4 stat cards (Clients / Caregivers / Pipeline / AIRecruit), each clickable portal
Zone 3: Two-world view — left column: clients with aging indicators / right column: bench strength + top AIRecruit results
Zone 4: Overnight triage narrative — plain English AI summary of what ran overnight
Zone 5: Coming up — 7-day lookahead (placements ending, credential deadlines, trial periods)

### Bench strength feature (new core feature)
- Visual gap analysis from roster caregivers (specializations, languages, willing_live_in)
- Bar per skill category: Dementia ████, French-speaking █, Live-in ░░░
- Each gap has "Recruit now →" that pre-fills AIRecruit campaign
- Lives on dashboard Zone 3 AND /agency/intelligence bench strength tab
- Derived from existing caregiver fields — no new DB query

### Conversational search (S6)
- Natural language in dashboard AI assistant
- "Find a French-speaking overnight caregiver for Robert in Scarborough"
- AI extracts parameters → navigates to pre-filtered search
- Phase 2: inline results in assistant thread
- Rate limit: 50/day Starter, 200/day Growth, unlimited Scale

### Telegram bot (S7)
- Agency owner sends message to Careified Telegram bot
- Bot searches, queries AIRecruit results, returns top matches
- Auth: connect flow in Settings → Integrations (one-time /connect XXXXXX)
- New column: telegram_user_id on agencies table
- What it does: search, unmatched clients, AIRecruit results, credential check, morning briefing
- What stays in app: profile viewing, documents, billing, visual UI
- Rate limits: Starter none, Growth 30/day, Scale 100/day + proactive push
- Phase 2: proactive push (no-show alerts, overnight briefing delivered to phone)
- Tech: Telegram Bot API (free), new /api/telegram/webhook route

---

## PRICING (final — update PRICING.md next session)

| Tier | Price CAD/mo | Key capabilities |
|------|-------------|-----------------|
| Starter | $149 | Core platform, search, roster, clients, basic AIRecruit. No conversational search. No Telegram. |
| Growth | $349 | + Conversational search 50/day, Telegram 30/day, QuickFill, Intelligence, bench strength, AI assistant |
| Scale | $699 | + Unlimited conversational search, Telegram 100/day + push notifications, family portal, placement outcomes, white label |
| Enterprise | Custom | Multi-location, API access, custom Telegram workflows, dedicated SLA |

Caregiver tiers: Free (basic profile) + Professional $9.99/mo (analytics, priority placement, career signals)
Early adopters (first 2 test agencies): 12 months protected pricing

---

## BUILD SEQUENCE — NEXT SESSIONS

### Session start checklist (every session)
1. ./scripts/gen-codebase-map.sh → paste docs/CODEBASE_MAP.md into project knowledge
2. git checkout develop && git pull origin develop
3. Read this file
4. Check git log --oneline -5

### Prompt S1 — Sidebar (DO FIRST — foundation)
New component: components/nav/AgencySidebar.tsx
Update: app/agency/layout.tsx (add sidebar, marginLeft 220px)
Update: components/nav/Navbar.tsx (remove agency nav links, keep logo/bell/avatar)
Update: app/agency/dashboard/page.tsx (remove mode toggle)
Mobile: bottom tab bar component for <768px
Tablet: 60px icon-only for 768-1024px
Uses /api/agency/nav-counts (already built) for live badge counts

### Prompt S2 — Dashboard 5-zone redesign
Remove mode toggle entirely
Add Zone 2 agency snapshot cards
Add Zone 3 two-world view with bench strength
Add Zone 4 overnight triage narrative
Add Zone 5 coming up 7 days
Fix roster_claimed = 0 bug
Remove debug console.log from dashboard API
Consolidate 5 split stats queries back into one efficient query

### Prompt S3 — Client triage panel
Right-side panel on /agency/clients/[id]
5-step find coverage funnel: roster → re-engage → search → QuickFill → AIRecruit
Urgency flag (boolean on client_needs + DB migration)
Client aging indicator (amber 7 days, red 14 days)
Revenue implication ("~$X/mo not activated")
Never abandons coordinator

### Prompt S4 — Bench strength intelligence
Compute from roster caregivers (specializations, languages, willing_live_in)
Visual bar chart by skill category
Recruit CTA on each gap → pre-fills AIRecruit
Dashboard Zone 3 widget + Intelligence bench strength tab

### Prompt S5 — Overnight triage narrative
AI-generated plain English summary on dashboard load
Reads AIRecruit results + expiring credentials + unmatched clients
Cached per day — regenerates on first load each day
Named caregivers are clickable links
Max 3 sentences

### Prompt S6 — Conversational search Phase 1
Extend AI assistant action blocks to carry rich filter parameters
Natural language → structured search parameters → pre-filtered navigation
"Find French-speaking overnight caregiver for Robert in Scarborough"
→ /agency/caregivers?city=Scarborough&language=French&availability=overnight
Rate limit enforcement by plan tier

### Prompt S7 — Telegram bot
New /api/telegram/webhook/route.ts
Telegram Bot API setup (free, 10 min registration)
Agency connection flow in /agency/settings
New column: telegram_user_id on agencies table
Message handler: parse intent → query existing APIs → format response
Rate limiting by plan tier

### Prompts E-L (operational features — run after S1-S7)
E: Find coverage panel (5-step funnel on client detail)
F: Urgency flag on clients
G: Placement track record on /profile/[id]
H: QuickFill blast UI
I: Caregiver engagement (views, percentile, coaching)
J: Onboarding checklist (5 things first for new agencies)
K: Compliance health per caregiver
L: Copy scanner pre-commit hook

---

## KNOWN BUGS (fix in S1/S2)
- roster_claimed shows 0 — active caregivers displaying as 0 despite 10 on roster
- Debug console.log '[dashboard] agencyId:' still logging in Vercel production
- Stats running as 5 separate queries instead of 1 efficient query
- CA/US locale leak on /agency/search
- Careified logo doesn't navigate home on some pages

---

## LAUNCH BLOCKERS (must resolve before real agency onboards)
- PHI encryption (AES-256-GCM on client_needs health fields) — BUILD AGENT
- Lawyer review (lib/legal/text.ts, ToS, AIRecruit consent) — ROMY
- Clerk production keys — ROMY
- careified.ca in Vercel — ROMY
- E&O / Cyber / GL insurance — ROMY
- Copy session (all placeholder text, triage messaging throughout) — ROMY
- 50 complete caregiver profiles before first real agency goes live — ROMY
- Supabase switch (Vercel → Supabase Toronto, test on preview first) — BUILD AGENT
- PRICING.md update to $149/$349/$699 — BUILD AGENT

---

## PENDING VERIFICATION (test on careified.com before next build)
- AI assistant: test action blocks and suggested prompts
- Dashboard: verify Today mode shows real data correctly
- Roster tabs: Onboarding / Credentials / Availability
- /agency/caregivers: all 4 tabs load
- /agency/intelligence: ROI summary loads
- /agency/signup: no longer blank
- Full caregiver flow: sign up → profile builder → Steps 0-5

---

## KEY FILES TO READ NEXT SESSION
- app/agency/dashboard/page.tsx — current state after dark glass redesign
- app/api/agency/dashboard/route.ts — data shape, split queries to consolidate
- app/agency/layout.tsx — before adding sidebar
- components/nav/Navbar.tsx — before removing agency nav links
- lib/legal/text.ts — consent copy (needs lawyer review)

---

## DESIGN SYSTEM (locked)
PAGE_BG: #080F1E (very dark navy)
NAV_BG: #0D1B3E (navy)
CARD_BG: rgba(255,255,255,0.04) (glass)
CARD_BORDER: rgba(255,255,255,0.08)
CARD_BORDER_GOLD: rgba(201,151,58,0.35)
GOLD: #C9973A / GL: #E8B86D / GLX: rgba(201,151,58,0.15)
TEXT_PRIMARY: #F5F0E8 (warm white)
TEXT_MUTED: rgba(255,255,255,0.55)
TEXT_TERTIARY: rgba(255,255,255,0.3)
RED: #E24B4A / AMBER: #F59E0B / GREEN: #22C55E
TYPOGRAPHY: DM Serif Display for headings/titles, DM Sans for body/labels
LINE_HEIGHT: 1.65 body text
Inline styles only — zero Tailwind classes

---

## STRATEGIC BACKLOG (post-launch)
- Family portal (Phase 2)
- Shift tracker / arrival confirmation (Phase 2)
- QuickFill SMS blast via Twilio (Phase 2)
- Outcome memory → match learning (Phase 2-3)
- Agency-specific scoring weights (Phase 3)
- ROI summary shareable PDF (Phase 1 — extend Intelligence page)
- /compare page (Phase 1 — competitive positioning)
- Supervisor verification → agency acquisition loop (Phase 1)
- Caregiver percentile ranking (Phase 1)
- WhatsApp digest (Phase 3 — after Telegram proven)
- Schedule calendar view (Phase 2)
- Stripe billing live (Phase 2)
## LATE ADDITIONS — S8, S9, S10 + CNAM

### S8 — Bulk upload → AIRecruit auto-launch
Extend /agency/roster/import confirmation step:
- Add checkbox "Start AIRecruit screening calls for these caregivers automatically"
- If checked: create campaign + queue calls for tonight's calling window
Add upload option to /agency/airecruit/new:
- "Add candidates manually" OR "Upload spreadsheet"
- Upload routes to campaign creation not roster
Update /api/roster/template with prescribed format:
- Name, Phone, Email (optional), Specialty (optional), Location (optional)
Mobile compatible from start.
Files: agency/roster/import/page.tsx · agency/airecruit/new/page.tsx · api/roster/template/route.ts

### S9 — AIRecruit mobile responsive pass
Single-column layout on /agency/airecruit/new below 768px
Score cards stack vertically on mobile
Full-width action buttons on campaign results
Screening question builder usable on touch
Campaign list readable on small screens
Files: agency/airecruit/new/page.tsx · agency/airecruit/page.tsx · agency/airecruit/[campaignId]/page.tsx

### S10 — Pre-call SMS + CNAM branding
Pre-call SMS 2-3 min before every AIRecruit outbound call via Twilio:
"Hi [first_name], this is Careified — Canada's verified home care platform.
We're calling in the next few minutes about a caregiver opportunity
that matches your profile. Please answer — it takes about 5 minutes.
Reply STOP to opt out."
New consent type: pre_call_sms
STOP → add to AIRecruitSuppression table
2-3 min delay between SMS send and Vapi call initiation
Rate: $0.0075/SMS — negligible
Caregiver-facing calls: CNAM = "CAREIFIED JOBS"
Reference/employer calls: CNAM = "CAREIFIED"
Dependency: Twilio account setup — ROMY ACTION REQUIRED FIRST
Files: lib/airecruit/vapi.ts · lib/airecruit/consent-gate.ts · new lib/sms/twilio.ts

### ROMY IMMEDIATE ACTION (no code required)
Register CNAM on Vapi phone number:
1. console.vapi.ai → Phone Numbers → select number
2. Register CNAM as "CAREIFIED JOBS"
3. Propagates in 1-3 business days
4. Also set up Twilio account for SMS before S10 builds

### Complete build sequence (final)
S1: Sidebar + layout restructure
S2: Dashboard 5-zone redesign
S3: Client triage panel (find coverage workflow)
S4: Bench strength intelligence
S5: Overnight triage narrative
S6: Conversational search Phase 1
S7: Telegram bot
S8: Bulk upload → AIRecruit auto-launch
S9: AIRecruit mobile responsive
S10: Pre-call SMS + CNAM branding
Then E-L: operational features backlog
