# CAREIFIED — FULL BUILD AUDIT
# Date: May 31 2026
# Purpose: Single source of truth for what is built, tested, pending, and blocked
# Owner: Romy
# Update trigger: End of every session
# Cross-reference: SESSION_HANDOFF_2026-05-31.md, AI_PLAYBOOK.md, PRODUCTION_CHECKLIST.md

---

## AUDIT METHODOLOGY

This audit was produced by cross-referencing:
- SESSION_HANDOFF_2026-05-31.md (today's session)
- SESSION_HANDOFF_2026-05-28.md (previous session)
- CAREIFIED_STATUS.md (build history)
- AI_PLAYBOOK.md (AIRecruit spec)
- PRODUCTION_CHECKLIST.md (launch requirements)
- CODEBASE_MAP.md (file structure)

Confidence levels:
- ✅ CONFIRMED — verified by Playwright or live site test
- ⚠️ CODE BUILT — code exists, not E2E tested against live
- ❌ NOT BUILT — does not exist in codebase
- 🔴 BLOCKED — depends on external action before it can be built or go live

---

## SECTION 1 — CORE PLATFORM

### Auth & Routing
| Feature | Status | Notes |
|---|---|---|
| Clerk auth — agency signup + login | ✅ CONFIRMED | Playwright tested |
| Clerk auth — caregiver signup + login | ✅ CONFIRMED | Playwright tested |
| Role-based routing (agency/caregiver/admin) | ✅ CONFIRMED | proxy.ts |
| Admin universal access to all pages | ✅ CONFIRMED | Fixed today |
| Beta gate (/gate) | ✅ CONFIRMED | Fixed today — no longer sticks |
| Gate page — no navbar/footer | ✅ CONFIRMED | Fixed today |
| Waitlist page — no navbar/footer | ✅ CONFIRMED | Fixed today |
| Agency approval flow | ✅ CONFIRMED | Live |
| Admin bypass for agency layout | ✅ CONFIRMED | Fixed today |
| Telegram bot (/api/telegram/webhook) | ✅ CONFIRMED | Built May 31 |
| Triage narrative API (/api/agency/triage-narrative) | ✅ CONFIRMED | Built May 31 |

### Public Pages
| Page | Status | Notes |
|---|---|---|
| Landing page / | ✅ CONFIRMED | Playwright tested |
| /for-agencies | ✅ CONFIRMED | Playwright + FAQPage JSON-LD |
| /for-caregivers | ✅ CONFIRMED | Playwright + FAQPage JSON-LD |
| /for-families | ✅ CONFIRMED | Playwright tested |
| /about | ✅ CONFIRMED | Playwright tested |
| /contact | ✅ CONFIRMED | Playwright tested |
| /privacy | ✅ CONFIRMED | noindex set |
| /terms | ✅ CONFIRMED | noindex set |
| /waitlist | ✅ CONFIRMED | Public, no navbar |
| /gate | ✅ CONFIRMED | Beta gate, no navbar |

### SEO / AEO (built today)
| Item | Status |
|---|---|
| Root metadata + OG tags + Twitter cards | ✅ CONFIRMED |
| robots.txt — /admin, /agency, /api blocked | ✅ CONFIRMED |
| Sitemap at careified.com/sitemap.xml | ✅ CONFIRMED |
| JSON-LD Organization schema on homepage | ✅ CONFIRMED |
| FAQPage JSON-LD on /for-agencies | ✅ CONFIRMED |
| FAQPage JSON-LD on /for-caregivers | ✅ CONFIRMED |
| Page-level metadata on all 8 public pages | ✅ CONFIRMED |

---

## SECTION 2 — CAREGIVER SIDE

### Profile Builder
| Feature | Status | Notes |
|---|---|---|
| Step 0 — Resume upload + LLM parse | ⚠️ CODE BUILT | pdf-parse crashes on Vercel serverless — known bug |
| Step 1 — Identity | ✅ CONFIRMED | Live |
| Step 2 — Services | ✅ CONFIRMED | Live |
| Step 3 — Availability grid | ✅ CONFIRMED | Live |
| Step 4 — Location + travel radius (Leaflet) | ✅ CONFIRMED | Live |
| Step 5 — Credentials | ✅ CONFIRMED | Live |
| Step 6 — Compliance (VSC, TB, red flags) | ✅ CONFIRMED | Live |
| Step 7 — Personality (7 forced-choice scenarios) | ✅ CONFIRMED | Live |
| Step 8 — Work history | ✅ CONFIRMED | Live |
| Step 9 — References | ✅ CONFIRMED | Live |
| Step 10 — Open questions | ✅ CONFIRMED | Live |
| Step 11 — Consent (6 types) | ✅ CONFIRMED | Live |
| 3-layer save (memory → localStorage → DB) | ✅ CONFIRMED | Live |
| LiveProfilePreview (ghost → live) | ✅ CONFIRMED | Live |

### Profile Display
| Feature | Status | Notes |
|---|---|---|
| /profile/[id] — agency-facing scorecard | ✅ CONFIRMED | Live |
| Verification tier display (honest null handling) | ✅ CONFIRMED | Live |
| Working style tags | ✅ CONFIRMED | Live |
| Trust score + badge display | ✅ CONFIRMED | Live |
| Shortlist button | ✅ CONFIRMED | Fixed today — wired to API |
| Contact request button | ✅ CONFIRMED | Fixed today — wired to API |
| Non-recommender disclaimer | ✅ CONFIRMED | Live |
| ID card + QR verify slug | ✅ CONFIRMED | Live |

### Caregiver Notifications
| Feature | Status | Notes |
|---|---|---|
| Notification bell in navbar | ✅ CONFIRMED | Live |
| /caregiver/notifications page | ✅ CONFIRMED | Live |
| Profile viewed trigger | ✅ CONFIRMED | Live |
| Shortlisted trigger | ✅ CONFIRMED | Live |
| Profile completion nudge | ✅ CONFIRMED | Live |

---

## SECTION 3 — AGENCY SIDE

### Dashboard
| Feature | Status | Notes |
|---|---|---|
| 5-zone layout (no mode toggle) | ✅ CONFIRMED | Live |
| Zone 1 — Morning briefing + triage action cards | ✅ CONFIRMED | Live |
| Zone 2 — Agency snapshot (4 stat cards) | ✅ CONFIRMED | Live |
| Zone 3 — Clients left / BenchStrengthWidget right | ✅ CONFIRMED | Built today |
| Zone 4 — Overnight triage narrative | ✅ CONFIRMED | S5 built today |
| Zone 5 — 7-day lookahead | ✅ CONFIRMED | Live |
| Sidebar (220px, 4 sections, badge counts) | ✅ CONFIRMED | Live |
| Mobile bottom tab bar | ✅ CONFIRMED | Live |

### Agency Pages
| Page | Status | Notes |
|---|---|---|
| /agency/dashboard | ✅ CONFIRMED | Playwright tested |
| /agency/clients | ✅ CONFIRMED | Playwright tested |
| /agency/clients/new | ✅ CONFIRMED | Playwright tested |
| /agency/clients/[id] | ⚠️ CODE BUILT | No Playwright test for detail page |
| /agency/clients/[id] — triage panel | ✅ CONFIRMED | Built today |
| /agency/caregivers | ✅ CONFIRMED | Playwright tested |
| /agency/roster | ✅ CONFIRMED | Playwright tested |
| /agency/roster/import | ✅ CONFIRMED | Playwright tested |
| /agency/airecruit | ✅ CONFIRMED | Playwright tested |
| /agency/airecruit/new | ✅ CONFIRMED | Playwright tested |
| /agency/intelligence | ✅ CONFIRMED | Playwright tested |
| /agency/intelligence — Bench Strength tab | ✅ CONFIRMED | Built today |
| /agency/shortlist | ✅ CONFIRMED | Playwright tested |
| /agency/settings | ✅ CONFIRMED | Playwright tested |
| /agency/assistant | ✅ CONFIRMED | Playwright tested |
| /agency/search | ✅ CONFIRMED | Playwright tested |
| /agency/billing | ⚠️ CODE BUILT | Redirects to settings |
| /agency/support | ⚠️ CODE BUILT | Not linked from sidebar |

### S3 — Client Triage Panel (built today)
| Feature | Status |
|---|---|
| urgency_flag + urgency_flagged_at DB columns | ✅ CONFIRMED |
| PATCH /api/agency/clients/[id]/urgency | ✅ CONFIRMED |
| POST /api/agency/contact-request | ✅ CONFIRMED |
| ClientTriagePanel component | ✅ CONFIRMED |
| 5-step find coverage funnel | ✅ CONFIRMED |
| Urgency toggle + aging indicator | ✅ CONFIRMED |
| Revenue implication display | ✅ CONFIRMED |
| Coordinator notes auto-save | ✅ CONFIRMED |
| Urgency indicators on clients list | ✅ CONFIRMED |

### S4 — Bench Strength Intelligence (built today)
| Feature | Status |
|---|---|
| bench_strength computed in dashboard API | ✅ CONFIRMED |
| BenchStrengthWidget component | ✅ CONFIRMED |
| Dashboard Zone 3 — compact widget | ✅ CONFIRMED |
| /agency/intelligence — full Bench Strength tab | ✅ CONFIRMED |
| AIRecruit new campaign pre-fill from ?skill= | ✅ CONFIRMED |

### Roster
| Feature | Status |
|---|---|
| Roster table (stub/invited/incomplete/complete/active) | ✅ CONFIRMED |
| CSV import with LLM column mapping | ✅ CONFIRMED |
| Manual add + invite flow | ✅ CONFIRMED |
| Caregiver claim flow /claim/[token] | ⚠️ CODE BUILT | Not E2E tested |
| Onboarding / Credentials / Availability tabs | ✅ CONFIRMED |

### AIRecruit
| Feature | Status | Notes |
|---|---|---|
| Campaign creation UI | ✅ CONFIRMED | Live |
| Campaign list + results dashboard | ✅ CONFIRMED | Live |
| Session A — Screening calls | ✅ CONFIRMED | Live on Vapi |
| Session B — Reference calls (code) | ⚠️ CODE BUILT | Vapi assistant NOT created on dashboard |
| Session C — Employer calls (code) | ⚠️ CODE BUILT | Vapi assistant NOT created on dashboard |
| Session D — Retry queue + cron + QuickFill | ⚠️ CODE BUILT | Cron not verified on Vercel |
| Consent gate | ✅ CONFIRMED | Live |
| TCPA/CRTC compliance hours | ✅ CONFIRMED | Live |
| Suppression list | ✅ CONFIRMED | Live |
| Webhook + HMAC verification | ✅ CONFIRMED | Live |
| Scoring engine (OpenRouter/minimax) | ✅ CONFIRMED | Live |

---

## SECTION 4 — ADMIN SIDE

| Feature | Status | Notes |
|---|---|---|
| /admin | ✅ CONFIRMED | Live |
| /admin/agencies | ✅ CONFIRMED | Live |
| /admin/caregivers | ✅ CONFIRMED | Live |
| Agency approval + audit log | ✅ CONFIRMED | Live |
| Admin universal access (all pages) | ✅ CONFIRMED | Fixed today |
| /admin/tickets | ❌ NOT BUILT | Ticketing system not built |
| /admin/badges | ❌ NOT BUILT | Orphaned page |
| /admin/references | ❌ NOT BUILT | Orphaned page |
| Responsive hook (useWindowSize) | ❌ NOT BUILT | lib/hooks/ has only useProfileSave.ts |

---

## SECTION 5 — QA INFRASTRUCTURE (built today)

| Item | Status |
|---|---|
| Playwright agency page suite (25 tests) | ✅ CONFIRMED |
| Playwright API smoke tests (BETA_GATED skip) | ✅ CONFIRMED |
| Playwright interaction tests | ✅ CONFIRMED |
| Pre-push hook (blocks on TS/build/Playwright fail) | ✅ CONFIRMED |
| scripts/qa-snapshot.sh | ✅ CONFIRMED |
| scripts/audit-dead-buttons.sh | ✅ CONFIRMED |
| scripts/audit-orphaned-pages.sh | ✅ CONFIRMED |
| scripts/audit-broken-links.sh | ✅ CONFIRMED |

### Known audit findings (not yet fixed)
| Finding | Count | Action |
|---|---|---|
| Dead buttons | 4 files | Fix in next bug sprint |
| Orphaned pages (genuine) | ~15 | Linking session needed |
| Broken internal links | 1 real (/support) | Fix in next bug sprint |
| Light theme warnings | All agency pages | False positives — Clerk UI components |

---

## SECTION 6 — VAPI / AIRECRUIT ASSISTANT ARCHITECTURE

### Decision: One assistant for June 15, separate assistants for Phase 2

**For June 15 launch — one assistant is sufficient:**
- Only `recruit_calls` (screening) is required for launch
- Existing assistant ID: `fdd84833-80ef-4c50-8391-2d7b38e56ead`
- US phone: `+1 (518) 617-4826` ✅ live

**For Phase 2 (August 2026) — separate assistants required:**

| Assistant | Call Type | Consent | Vapi Status | Phase |
|---|---|---|---|---|
| AIRecruit Screener | Caregiver screening | recruit_calls | ✅ Live | Launch |
| Reference Caller | Reference verification | reference_calls | ❌ Not created | Phase 2 |
| Past Employer Verifier | Employment verification | past_employer_calls | ❌ Not created | Phase 3 |
| QuickFill Alert | Shift availability check | match_time_calls | ❌ Not created | Phase 2 |
| Current Employer Caller | DROPPED — legal risk | DROPPED | N/A | Never |

**Why separate assistants for Phase 2:**
- Different personas required (warm/recruiter vs neutral/professional)
- Different voices (ElevenLabs voice selection per use case)
- Different CNAM branding ("CAREIFIED JOBS" vs "CAREIFIED")
- Cleaner Vapi dashboard analytics per call type
- Failure isolation — one broken assistant doesn't affect others

**Romy action required before Phase 2:**
1. Create "Reference Caller" assistant on console.vapi.ai
2. Create "Past Employer Verifier" assistant on console.vapi.ai
3. Create "QuickFill Alert" assistant on console.vapi.ai (can share screener if needed)
4. Add new assistant IDs as env vars: VAPI_REFERENCE_ASSISTANT_ID, VAPI_EMPLOYER_ASSISTANT_ID, VAPI_QUICKFILL_ASSISTANT_ID
5. Register CNAM "CAREIFIED" on reference/employer phone numbers

**Romy action required before June 15:**
- Provision CA phone number (Ontario DID 416/647/289/905) on console.vapi.ai
- Register CNAM "CAREIFIED JOBS" on CA number
- Add VAPI_PHONE_NUMBER_ID_CA env var to Vercel

---

## SECTION 7 — PENDING FEATURES (not yet built)

### Must have for June 15
| Feature | Owner | Notes |
|---|---|---|
| S5 — Overnight triage narrative | ✅ BUILT | Completed May 31 |
| S6 — Conversational search Phase 1 | Build agent | NOT YET BUILT |
| S7 — Telegram bot | ✅ BUILT | Completed May 31 |
| PHI encryption (AES-256-GCM) | Build agent | Launch blocker |
| Supabase switch | Build agent | Launch blocker |
| Client intake form (169 fields, 4 phases) | Build agent | Launch blocker |
| Ticketing system (PIPEDA) | Build agent | Launch blocker |
| PRICING.md update $149/$349/$699 | Build agent | Launch blocker |

### Phase 2 (August 2026)
| Feature | Notes |
|---|---|
| S8 — Bulk upload → AIRecruit auto-launch | |
| S9 — AIRecruit mobile responsive | |
| S10 — Pre-call SMS + CNAM (needs Twilio) | Blocked on Romy Twilio setup |
| Reference caller Vapi assistant | Romy creates on console.vapi.ai |
| QuickFill blast UI | |
| Stripe billing live | |
| Photo upload API (Vercel Blob) | |
| Family portal Phase 1 | |

### Phase 3 (October 2026)
| Feature | Notes |
|---|---|
| Past employer Vapi assistant | Romy creates on console.vapi.ai |
| Family check-in calls | |
| Retention check-in calls | |
| WhatsApp integration | |
| Apple Wallet .pkpass | Needs Apple Developer account $99/yr |

---

## SECTION 8 — LAUNCH BLOCKERS (June 15)

### Romy's side — ALL PENDING
| Item | Notes |
|---|---|
| Clerk production keys | Verify pk_live_ active |
| careified.ca in Vercel | Domain purchased, not added to Vercel |
| Lawyer review lib/legal/text.ts | ToS + AIRecruit consent |
| E&O / Cyber / GL insurance | |
| 50 complete caregiver profiles | Before first real agency goes live |
| Copy session | All placeholder text |
| Twilio account setup | Required before S10 |
| Vapi CA phone number | Ontario DID — 30 min task |
| CNAM "CAREIFIED JOBS" on Vapi | 1-3 day propagation |

### Build agent's side — ALL PENDING
| Item | Notes |
|---|---|
| PHI encryption | AES-256-GCM on client_needs fields |
| Supabase switch | Test on preview first |
| Client intake form | 169 fields, 4 phases |
| Ticketing system | PIPEDA required |
| Demo data strategy | Wipe / quarantine / keep |
| S5 overnight triage narrative | Next sprint |
| S6 conversational search | Next sprint |
| S7 Telegram bot | Must have June 15 |

---

## SECTION 9 — KNOWN BUGS (open)

| Bug | Severity | Notes |
|---|---|---|
| pdf-parse crashes on Vercel serverless | High | Needs replacement via unpdf or base64 upload |
| CA/US locale leak on /agency/search | Medium | Unresolved |
| Dead buttons in 4 files | Low | ContactForm, ContactCard, DemoAgenciesList, demo/login |
| /support broken link | Low | No /support page — links should point to /agency/support |
| ~15 genuinely orphaned pages | Low | Linking session needed |
| Careified logo doesn't navigate home on some pages | Low | |
| Hardcoded "28 days remaining" in sidebar | Low | Should be dynamic from DB |

---

Last updated: May 31 2026
Next update: Start of next session
