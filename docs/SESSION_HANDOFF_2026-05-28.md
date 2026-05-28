# SESSION HANDOFF — 2026-05-28
# Status: IN PROGRESS (P2 running, P3 pending)
# Safe revert: db6a44e (P1 committed)

---

## COMMITS THIS SESSION

| Hash | What | Files |
|------|------|-------|
| db6a44e | fix(assistant): platform-aware system prompt, action blocks, suggested prompts | app/api/agency/assistant/route.ts, app/agency/assistant/AgencyAssistantClient.tsx |
| P2 pending | fix(cron): optimistic locking on call_retry_queue | app/api/cron/process-call-queue/route.ts |
| P3 pending | feat(dashboard): operations-first redesign | app/agency/dashboard/page.tsx |

## DB MIGRATIONS RUN THIS SESSION
- `ALTER TABLE call_retry_queue ADD COLUMN IF NOT EXISTS processing_at TIMESTAMP WITHOUT TIME ZONE` — run manually, confirmed OK

---

## MAJOR STRATEGIC DECISIONS MADE THIS SESSION

### 1. Information Architecture — 6 top-level nav sections
- Dashboard → /agency/dashboard
- Clients → /agency/clients (absorbs Shortlist as a tab)
- Caregivers → /agency/caregivers (replaces "Search Caregivers" — broader)
- Roster → /agency/roster
- AIRecruit → /agency/airecruit
- Intelligence → /agency/intelligence (NEW — ROI, outcomes, match learning)

### 2. Dashboard Design — 4-layer layout
- Layer 1: Top status bar (agency name, plan badge, 4 stat pills, profile %, notification count)
- Layer 2: Alert strip (horizontally scrollable, context-sensitive — only shows active alerts)
- Layer 3: 3 workflow columns (Clients & Coverage | Recruitment Pipeline | AI Assistant persistent)
- Layer 4: Roster health + Recent activity (below fold)
- Design principles: progressive disclosure, status-first, single-action cards, persistent AI rail, collapsible sections, urgency floats up, empty = calm not broken

### 3. AI Assistant — fixed and enhanced
- Model: minimax/minimax-m2.5:free
- System prompt: platform-aware, non-recommender language enforced, action blocks for navigation
- Action blocks: <action>{"type":"navigate","url":"..."}</action> parsed from response, renders "Go →" button
- Suggested prompts when thread empty: 4 chips auto-submit on click

### 4. placement_status — use existing column
- caregivers table already has profile_status column
- Values: stub, invited, incomplete, complete, active
- Decision: extend with 'placed' value for available caregivers pool feature
- Do NOT add a separate placement_status column

### 5. Intelligence section — event-driven summary table
- New: /agency/intelligence page (Phase 1: ROI summary, usage stats)
- DB approach: agency_analytics summary table, event-driven updates, instant reads
- Phase 2: placement outcomes, match learning
- Phase 3: agency-specific scoring weights

### 6. Cron race condition fix
- Problem: two simultaneous invocations can process same call_retry_queue row
- Fix: FOR UPDATE SKIP LOCKED optimistic locking
- Added stale lock cleanup: reset processing_at after 10 min if stuck
- DB column added manually before code change

### 7. Pricing revision
- Starter: $149 CAD/mo (was $99) — up to 25 caregivers
- Growth: $349 CAD/mo (was $249) — unlimited, AIRecruit, QuickFill, AI assistant, Intelligence
- Scale: $699 CAD/mo (was $499) — agency-data-aware AI, family portal, placement outcomes
- Enterprise: Custom
- Early adopters: 12 months protected pricing (extended from 3 months)
- Caregiver: Free + Professional $9.99/mo (unchanged)

### 8. QuickFill SMS blast — Phase 2
- Phase 1: voice blast via existing Vapi QuickFill (already built) + new blast UI
- Phase 2: SMS via Twilio, new match_time_sms consent type, shifts table
- Reason: Twilio setup, CASL compliance, shifts table all needed before SMS

### 9. Legal — non-recommender model enforcement
- Banned phrases: "recommend", "best match", "top candidate", "passed", "hire with confidence"
- Required phrases: "alignment score", "strong fit on X dimensions", "placement decision is yours"
- AI assistant system prompt explicitly enforces this
- Pre-launch: automated copy scanner as pre-commit hook
- Lawyer review required for: lib/legal/text.ts, ToS, consent language, verification badges
- PHI encryption (AES-256-GCM) required before launch — currently plain text

### 10. Caregiver supply side — Phase 1 priority
- Profile visibility signals: "viewed 12 times by 4 agencies this week"
- Career position signals: percentile ranking within locale
- Profile coaching: quantified impact ("adding CPR moves you from 68th to 91st percentile")
- Placement history: caregiver's own professional track record
- All Phase 1 — supply decay is a structural risk

### 11. Acquisition loops (product-led, no marketing budget)
- Supervisor verification → agency signup (medium lift, high value)
- CSV import → mass caregiver outreach (already built, needs better email copy)
- Verify slug + ID card → add "Get verified on Careified" CTA for logged-out visitors
- ROI summary → shareable link → peer referral (build with Intelligence section)
- Pre-launch target: 50 complete caregiver profiles before first agency goes live

### 12. Scale breakpoints
- Match ranking breaks at ~500 caregivers: add composite index + pagination + 15min cache
- Dashboard API breaks at ~50 agencies: materialised agency_dashboard_cache table
- Cron race condition: FIXED this session
- DB connection pool: Supabase switch (already planned) solves Phase 1
- Alert strip: separate /api/agency/alerts lightweight endpoint, polls every 60s

### 13. Feedback system
- Layer 1 passive: Clarity (already set up) — review 5 session recordings weekly
- Layer 2 active: contextual thumbs up/down on match results, 0-result search capture
- Layer 3 direct: monthly 20-min product call with each test agency → FEEDBACK_LOG.md
- Churn signal detection: agencies inactive 14+ days flagged in admin

### 14. Competitive positioning
- AlayaCare/ClearCare: operations software, assume you have caregivers — we find+verify+match
- Hireology/Indeed: top of funnel only, no verification, no match intelligence
- Careified position: only platform covering find → verify → screen → match → place → track → improve
- Build /compare page (public) to own the "Careified vs X" search intent
- Three 10-second value statements by role: owner (ROI), coordinator (workflow), caregiver (career)

---

## FEATURES WITH A PERMANENT HOME (IA decisions)

### Features moving/renaming
- "Search Caregivers" nav → renamed "Caregivers" (/agency/caregivers)
- "Shortlist" removed from top nav → absorbed into Clients as a tab
- New top-level: "Intelligence" (/agency/intelligence)

### New pages to build (Phase 1)
- /agency/caregivers — tabs: Search / Available now / Previously placed / At risk
- /agency/intelligence — tabs: ROI summary / Placement outcomes / Match learning / Trends
- /agency/clients?tab=unmatched — filter on existing clients page
- /agency/roster?tab=onboarding — onboarding pipeline
- /agency/roster?tab=credentials — expiry tracking
- /agency/roster?tab=availability — change feed
- /agency/airecruit?tab=quickfill — QuickFill blast UI

### Phase 2 nav items (reserved, not yet built)
- /agency/families — family portal management
- /agency/schedule — calendar view
- /agency/billing — Stripe live

---

## BUILD ORDER — NEXT SESSIONS

### Session continuing now
- [x] P1 — AI assistant fix (db6a44e)
- [ ] P2 — Cron race condition fix (running)
- [ ] P3 — Dashboard redesign (pending)

### Next session (after P3 verified on preview URL and merged to main)
- P4: /api/agency/alerts lightweight endpoint (unmatched clients, AIRecruit results, expiring credentials)
- P5: profile_status 'placed' value + available caregivers query + /agency/caregivers page with tabs
- P6: Roster tabs (Onboarding / Credentials / Availability changes)
- P7: Placement track record on /profile/[id] (aggregate placement_reviews)
- P8: QuickFill blast UI on /agency/airecruit?tab=quickfill
- P9: /agency/intelligence Phase 1 (ROI summary, usage stats)
- P10: Caregiver engagement basics (profile views count, percentile signal)

### Architecture decisions locked
- placement_status: extend existing profile_status column (not new column)
- Alert strip: separate /api/agency/alerts endpoint, 60s polling
- Intelligence DB: agency_analytics summary table, event-driven
- Collapsible sections: localStorage state persistence
- AI assistant context: Phase 1 platform-aware, Phase 2 agency-data-aware

---

## PENDING VERIFICATION (manual testing not yet done)
- AI assistant on careified.com after P1 — test model, action blocks, suggested prompts
- /agency/signup blank page — investigate
- Careified logo navigation on non-dashboard pages
- CA/US locale leak on /agency/search
- Full caregiver flow: sign up → profile builder → Step 0-5
- Supabase switch (after all flows confirmed stable)

---

## DOCS THAT NEED UPDATING NEXT SESSION
- ROADMAP.md — add Intelligence section, update phase items
- PRICING.md — update to new tier structure ($149/$349/$699)
- CAREIFIED_STATUS.md — add this session's commits
- CONTEXT.md — add IA decisions, pricing decisions, legal decisions
- PRODUCTION_CHECKLIST.md — add copy scanner, PHI encryption, lawyer review items
- CODEBASE_MAP.md — regenerate after P3 is committed

---

## KEY FILES CHANGED THIS SESSION
- app/api/agency/assistant/route.ts — model string, system prompt
- app/agency/assistant/AgencyAssistantClient.tsx — action blocks, suggested prompts
- app/api/cron/process-call-queue/route.ts — optimistic locking (P2 pending)
- app/agency/dashboard/page.tsx — full redesign (P3 pending)

## KEY FILES TO READ NEXT SESSION (before building anything)
- app/agency/dashboard/page.tsx — confirm P3 landed correctly
- app/api/agency/dashboard/route.ts — data shape for alert strip work
- lib/matching/types.ts — ALIGNMENT_DISCLAIMER constant (non-recommender copy)
- lib/legal/text.ts — all consent copy (needs lawyer review)

---

## SAFE REVERTS
- Before this session: 86de162
- After P1: db6a44e
- After P2: (hash when committed)
- After P3: (hash when committed)

## FINAL SESSION STATE — 2026-05-28

### All commits landed on main (3552c09)

| Hash | What |
|------|------|
| db6a44e | fix(assistant): platform-aware system prompt, action blocks, suggested prompts |
| e02029c | fix(cron): optimistic locking on call_retry_queue |
| b9dd5ff | feat(dashboard): operations-first redesign |
| a8a10e2 | fix(dashboard): agency name, plan tier, profile completion, unmatched clients |
| a461813 | fix(nav): Caregivers, Intelligence, removed Shortlist |
| a23d320 | feat(roster): Onboarding / Credentials / Availability tabs |
| cecd9b4 | feat(caregivers): /agency/caregivers — 4 tabs |
| 1385eab | feat(intelligence): /agency/intelligence Phase 1 |
| bbd6c54 | fix(dashboard): mobile responsive breakpoints |
| af0dbbf | fix(signup): blank page — Clerk useUser loading guard |
| 3552c09 | main merge — all above |

### Safe revert: dd99f0c (pre-mobile/signup fixes)

---

## NEXT SESSION — START HERE

### Manual testing needed first (do before any new builds)
1. careified.com/agency/dashboard — confirm agency name shows, alert strip, AI assistant works
2. careified.com/agency/caregivers — confirm 4 tabs load
3. careified.com/agency/roster — confirm Onboarding/Credentials/Availability tabs
4. careified.com/agency/intelligence — confirm ROI summary loads
5. careified.com/agency/signup — confirm no longer blank
6. Test AI assistant — type "find caregivers with dementia experience"

### Build queue (priority order)
1. Find coverage panel — 5-step funnel on /agency/clients/[id]
2. Urgency flag — boolean on client_needs + UI
3. Placement track record — aggregate placement_reviews on /profile/[id]
4. QuickFill blast UI — /agency/airecruit?tab=quickfill
5. Shortlist absorbed into Clients as a tab
6. Caregiver engagement — profile views count + percentile signal
7. Verify slug CTA — "Get verified on Careified" for logged-out visitors

### Docs to update next session
- PRICING.md — update to $149/$349/$699
- ROADMAP.md — tick completed items, add Intelligence section
- CAREIFIED_STATUS.md — add this session's commits
- CONTEXT.md — IA decisions, pricing decisions

### Launch blockers still open
- PHI encryption (AES-256-GCM) — plain text currently
- Clerk production keys
- Lawyer review lib/legal/text.ts
- SSL cert Render DB
- careified.ca in Vercel
- Copy session (placeholder text everywhere)
- Both test agencies onboarded
