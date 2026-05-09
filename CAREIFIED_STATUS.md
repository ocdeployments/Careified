# CAREIFIED — BUILD STATUS
# Last updated: May 9 2026
# Safe revert: 22eaa45

---

## SESSION HISTORY

| Session | Description | Status | Commit |
|---------|-------------|--------|--------|
| 1–8D | Auth, search, shortlist, profile builder, ID cards, navbar, landing | DONE | 41c6b31 |
| 9 | ProfilePreviewCard, IDCardReveal, three-column layout | DONE | bbaeb1e |
| 10A | 51 DB columns, ProfileFormContext, useProfileSave, 3 API routes | DONE | 3fc6eab |
| 10B | Step1Identity rebuild (Context + useProfileSave) | DONE | 31b1bd2 |
| 10C | Step2Services rebuild (Context pattern) | DONE | b72055e |
| 10D-L | Steps 3-10 rebuild (all complete) | DONE | Phase 1 |
| 11 | PRODUCTION_CHECKLIST, /profile/start screenshot mockup, /profile/demo enhancements | DONE | db3690e |
| 12 | Photo position editor (drag/reposition/zoom), Session health monitor | DONE | 622c001 |
| 13 | Onboarding gate (name + phone OTP + age confirmation) | DONE | 142ea98 |

### Phase 1 Complete (May 5 2026)
All 11 profile builder steps working with Context pattern and three-layer save.

---

## LIVE
careified.vercel.app | Repo: ocdeployments/Careified (main)
Stack: Next.js 16.2.3, React 19, Tailwind v4, Prisma 7, pg Pool, Render PostgreSQL, Clerk 7.0.12

---

## BUILT AND LIVE

### Auth
- Clerk auth agency + caregiver signup flows
- Role-locked signup, agency approval flow, admin console
- Post-signin role-based routing, audit logging

### Navigation
- Three-panel dropdown navbar
- Footer with Privacy, Terms, Contact
- Settings links: Data rights, Communications
- Navbar: Build profile, Opportunities, Profile demo, My clients, Search, Shortlist

### Marketing Pages
- Landing page, /for-caregivers, /for-agencies, /for-families, /about, /contact, /privacy, /terms

### Profile Builder (Steps 0-10)
- Step 0: Communication consent gate + resume upload (LLM parsing via OpenRouter/Mistral)
- Step 1: Identity (name, photo, bio, languages, DOB)
- Step 2: Services, diagnosis experience + years, ADLs + frequency, specialized techniques
- Step 3: Availability grid, hours, placement types
- Step 4: Location, travel radius, vehicle, license class
- Step 5: Credentials, mutual exclusivity, conflict warnings
- Step 6: VSC, TB, immunizations, red flag self-disclosure (4 questions)
- Step 7: 7 forced-choice scenarios (patience, empathy, adaptability, communication, emergency response, problem solving, observation)
- Step 8: Work history
- Step 9: References with verification invite links
- Step 10: Open questions
- ProfileFormContext + useProfileSave (3-layer save: memory > localStorage > DB)

### Profile Page (/profile/[id])
- Agency-facing scorecard design
- Section order: Disclosure > Verification > Clinical > References > Availability > Scorecard > Working Style > Work History > Credentials > Open Questions > Disclaimer
- Hiring scorecard (5 dimension bars)
- Verified reference badges with ratings and quotes
- Verification tier framework (Tier 1-4 with confidence score)
- Red flag disclosure, weekly availability grid, rate differential, behavioural working style
- Non-recommender disclaimer
- /profile/demo — demo page with Maria Santos

### Caregiver ID System
- Format: CRF-[COUNTRY]-[STATE]-[YEAR]-[5CHAR]
- /id/[caregiverId], /verify/[slug]
- Apple Wallet .pkpass structure (needs Apple Developer account)
- Google Wallet JWT, IDCardReveal 3D flip animation

### Agency Search & Match
- /agency/search — 20+ filters, 15 demo caregivers
- Match ranking API (/api/match/rank POST) — requires Clerk auth
- Alignment score, dimension breakdown, confidence weighting
- Browse mode (empty need = show all), Show all option in sort
- Agency shortlist (/agency/shortlist)
- **DEMO MODE FIX (May 4 2026):** ClientSearch component now accepts `isDemo` prop for demo routes
- Demo search (/demo/search) uses 5 mock caregivers with client-side filtering

### Client Intake & Match Analysis
- /agency/clients — client list
- /agency/clients/new — intake form (8 sections)
- /agency/clients/[id] — ranked matches + verify-in-call gaps
- Match gap analysis engine (lib/matching/gap-analysis.ts)
- 5 demo clients: Eleanor, Robert, Margaret, James, Dorothy

### Communication Consent
- 6 consent types, /settings/communications, consent gate in builder
- DB: caregiver_communication_consents

### Reference Verification
- /api/references/invite, /api/references/respond
- /reference/[token] — public form (no auth)
- Verified badges on profile page
- DB: reference_verification_requests

### AIRecruit (Phases 1-6)
- Vapi assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Campaign UI, Vapi integration, webhook, scoring, dashboard
- TCPA/CRTC compliance, consent gate before any call

### Admin Console
- /admin, /admin/agencies, /admin/caregivers

### Locale System
- lib/locale/config.ts CA/US variants, NEXT_PUBLIC_LOCALE, geo-redirect via proxy.ts

---

## IN PROGRESS / PARTIALLY BUILT

- LiveProfilePreview: component exists but not built (must build with Romy)
- PHI encryption: structure exists, columns plain text for now (needs migration before launch)
- Match Gap Analysis: rule engine built, generates per caregiver-client pair
- Agency signup validation: JUST FIXED (May 4 2026) - field-level errors now display
- Photo position editor: COMPLETED (May 8 2026) - drag-to-reposition, zoom, persist to DB
- Onboarding gate: COMPLETED (May 8 2026) - name + phone OTP + age confirmation

---

## SESSION MAY 9 2026 — COMPLETED

### Documentation Fixes
- Removed auto-push rules from CLAUDE.md, HANDOFF.md, CAREIFIED_STATUS.md, BEST_PRACTICES.md
- All docs now state: "⛔ DO NOT push. Commit locally only. User runs git push manually when ready."

### Navbar Visual Refresh
- Nav bar: rgba(13,27,62,0.97), backdrop blur 12px, gold border bottom
- Dropdown cards: Lucide icons (Info, Briefcase, UserCheck / Building2, Presentation, Play / Heart, Users)
- Featured card: gold border, subtle gold background
- Dropdown header: gold title, white subtitle
- Active section: gold dot indicator when on matching path
- CTA button: gold gradient, navy text, shadow
- Sign in: transparent with border

---

## SESSION MAY 8 2026 — COMPLETED

### Photo Position Editor
- PhotoUploadEditor.tsx: Modal with 280px crop circle, drag, zoom 1-3x
- ProfilePhoto.tsx: Renders with transform(x,y) scale, edit overlay
- Step1Identity wired to use editor
- DB columns: photo_x, photo_y, photo_scale (added)

### Onboarding Gate Redesign
- /onboarding: Single collection point after Clerk signup
- First/Last name: letters only, min 2 chars, real-time validation
- Phone OTP: 6-digit, auto-advance, paste support, 60s resend, 3 attempt lockout
- Age confirmation checkbox required
- Continue disabled until all fields valid
- API routes: /api/auth/send-phone-otp, /api/auth/verify-phone-otp, /api/caregivers/me
- Redirect caregivers to /onboarding instead of /profile/build

### Session Protocol Updates
- SESSION HEALTH MONITOR added to CLAUDE.md (token tracking, status bar)
- Session Start Git Rules added (read-only at session start)
- Git push now MANUAL ONLY (removed auto-push rule from HANDOFF.md)

---

## SECURITY AUDIT FINDINGS (May 4 2026)

### Critical Issues
| Issue | File | Fix |
|-------|------|-----|
| Admin pages completely unprotected | `app/admin/*` | Add Clerk auth + ADMIN_CLERK_USER_ID check |
| No webhook signature verification | `app/api/airecruit/webhook/route.ts` | Add HMAC validation for Vapi webhooks |
| SQL injection risk in lib/db.ts | `lib/db.ts` lines 56-68 | Validate keys against column allowlist |

### High Priority
| Issue | File | Fix |
|-------|------|-----|
| Reference tokens not UUID | `app/api/references/invite/route.ts` | Use gen_random_uuid() |
| No rate limiting | All API routes | Add rate limiting middleware |
| XSS: dangerouslySetInnerHTML | `app/admin/caregivers/page.tsx` line 217 | Remove or sanitize |

### Medium Priority
| Issue | File | Fix |
|-------|------|-----|
| 404 leaks existence of protected pages | `/agency/*` when not agency | Return 403 instead |
| Tier parameter accepts user input | `lib/attributes/index.ts` | Ensure only admin can set tiers |
| Missing SSL on Render DB | `lib/db.ts` | Set rejectUnauthorized: true in prod |

---

## LINK & ROUTING AUDIT (May 4 2026)

### Broken Links (404)
| Broken Link | Found In |
|-------------|----------|
| `/settings` | `app/settings/communications/page.tsx` - no index page exists |
| `/agency/support` | `app/agency/billing/page.tsx` - support page not built |
| `/profile/start` | `app/for-caregivers/page.tsx` - should be `/profile/build` |

### Orphan Pages (Not in nav)
| Page | Notes |
|------|-------|
| `/admin/status` | Has API, linked from admin/agencies |
| `/admin/sitemap` | Has API, linked from admin/agencies |
| `/agency/dashboard` | Redirect target for approved agencies, not in navbar |
| `/agency/airecruit` | Only accessible via dashboard |
| `/id/[caregiverId]` | For wallet/QR, intentionally not linked |
| `/verify/[slug]` | For public verification, not linked |

### Authorization Leaks (Should be 403, not 404)
| Page | Current | Should Be |
|------|---------|-----------|
| `/admin/*` | No auth - data exposed! | 403 Forbidden |
| `/agency/*` (not agency role) | 404 | 403 Forbidden |

### User Journey Dead Ends
- **Agency signup**: After submit lands on `/agency/pending-approval` - no way to check status
- **Caregiver profile builder**: No explicit "complete" state - user navigates blindly

---

## PENDING (priority order)

### Pre-Launch Blockers
1. NEXT_PUBLIC_LOCALE=CA — add to Vercel env vars NOW
2. Redeploy Vercel after adding env vars
3. Copy session — ALL page text is placeholder
4. ~~UX debt — agency signup silent failures~~ ✅ FIXED May 4 2026
5. ~~Admin pages unprotected~~ ❌ CRITICAL - add auth
6. Clerk production upgrade (pk_test_ > pk_live_)
7. SSL cert for Render DB (currently rejectUnauthorized: false)
8. Lawyer review of lib/legal/text.ts
9. E&O / Cyber / General Liability insurance

### Infrastructure
9. US Vercel deployment (second project, NEXT_PUBLIC_LOCALE=US)
10. Apple Developer account ($99/yr) for Wallet passes
11. Phone OTP via Clerk

### Features Queued
12. Admin panel Phase 1 (content editor, build tracker, analytics, feature flags)
13. LiveProfilePreview (ghost to live animation in builder)
14. AIRecruit Session B (consent), C (profile analysis), D (SMS, retry, cron)
15. Rating system (post-placement ratings, trust score, honesty scoring)
16. Family portal Phase 1 (schedule, shift tracker, care notes, caregiver card — PWA)
17. Background check integration — Checkr (deferred Year 1)
18. PSV verification — Persona/Didit, Nursys (deferred Year 1)
19. Upload photo API
20. Map for travel radius (Leaflet)

---

## DATABASE TABLES

| Table | Status | Notes |
|-------|--------|-------|
| caregivers | LIVE | 15 approved demo records |
| agencies | LIVE | 9 records, 1 linked to your Clerk ID |
| caregiver_certifications | LIVE | |
| caregiver_references | LIVE | |
| caregiver_attributes | LIVE | Empty, graceful fallback |
| caregiver_communication_consents | LIVE | |
| client_needs | LIVE | 5 demo clients seeded |
| match_scores | LIVE | |
| reference_verification_requests | LIVE | |
| audit_log | LIVE | |

---

## ENV VARS

| Var | Status |
|-----|--------|
| DATABASE_URL | SET |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | SET (dev keys) |
| CLERK_SECRET_KEY | SET (dev keys) |
| NEXT_PUBLIC_LOCALE | MISSING FROM VERCEL |
| OPENROUTER_API_KEY | SET |
| PHI_ENCRYPTION_KEY | SET |
| VAPI_API_KEY | SET |
| VAPI_ASSISTANT_ID | SET |
| ADMIN_CLERK_USER_ID | SET |

---

## PRE-LAUNCH CHECKLIST

- [ ] NEXT_PUBLIC_LOCALE=CA in Vercel
- [ ] Clerk production upgrade
- [ ] All page copy written
- [ ] Lawyer review of lib/legal/text.ts
- [ ] E&O / Cyber / General Liability insurance
- [ ] Apple Developer account ($99/yr)
- [ ] SSL cert for Render DB
- [ ] US Vercel deployment
- [ ] UX debt fixes
- [ ] Admin panel built
- [ ] Incident response runbook

---

## PRIORITY ACTION PLAN (Quick Wins)

| # | Action | Impact | Est. Effort |
|---|--------|--------|-------------|
| 1 | **Add auth to /admin/* pages** | CRITICAL security fix - prevents data leak | 1 file |
| 2 | **Fix broken links** (/settings, /agency/support, /profile/start) | User journey fixes | 30 min |
| 3 | **Verify AIRecruit webhook signatures** | Prevent fake call data | 1 hr |
| 4 | **Add rate limiting to registration/reference APIs** | Prevent abuse | 2 hr |
| 5 | **Use UUIDs for reference tokens** | Token predictability fix | 30 min |

---

## DESIGN SYSTEM

Colors: Navy #0D1B3E, Gold #C9973A/#E8B86D, Royal #1E3A8A, Warm white #F7F4F0
Font: Inter (site-wide), 16px base
Cards: white, borderRadius 16px, border 1px solid #E2E8F0
Inline styles only — no Tailwind classes (v4 prod issues)
No green as primary. No emojis in UI.

---

## BUILD RULES

1. One file per commit
2. npx tsc --noEmit before every commit
3. ⛔ DO NOT push. Commit locally only. User runs git push manually when ready.
4. Stop after each commit, wait for confirmation
5. No new packages without asking
6. NEVER npx vercel --prod
7. NEVER set Vercel env vars via CLI
8. Large files: use Python write, NOT str_replace

---

## KEY FILES

lib/consent/types.ts — consent registry
lib/matching/gap-analysis.ts — gap analysis engine
lib/matching/score.ts — match scoring
lib/matching/gates.ts — hard filter gates
lib/locale/config.ts — CA/US locale config
components/profile/CaregiverProfileDemo.tsx — agency scorecard (1750 lines)
app/profile/build/page.tsx — profile builder shell
app/api/match/rank/route.ts — search/matching API
app/agency/clients/[id]/page.tsx — client detail + match analysis

Last updated: May 4 2026 | Safe revert: 960aca6


---

## AIRECRUIT — MULTI-AGENT VAPI PLAN

Six distinct Vapi agent use cases (one assistant per use case):

| Use Case | Consent Type | Status | Notes |
|----------|-------------|--------|-------|
| Candidate screening | recruit_calls | BUILT (Phases 1-6) | Outbound to candidates |
| Reference calls | reference_calls | PENDING Session B | AI calls listed references |
| Past employer calls | past_employer_calls | PENDING Session C | Verify work history |
| Current employer calls | current_employer_calls | DROPPED | Too high legal risk |
| Regulatory/licensing calls | regulatory_calls | PENDING | Verify credentials with bodies |
| Match opportunity calls | match_time_calls | PENDING | Notify caregiver of new match |

Each use case = separate Vapi assistant with different prompt/persona.
Consent is per-type — caregiver opts in/out individually.
All gated by lib/airecruit/consent-gate.ts before any call fires.

AIRecruit Sessions pending:
- Session B: Consent flow for all types
- Session C: Profile analysis + campaign from profiles + reference agent
- Session D: SMS, retry logic, cron, bulk actions, employer agent

---

## US EXPANSION CHECKLIST (deferred — CA first)

When ready to launch US deployment:
- [ ] Agency signup form: add US states alongside CA provinces
- [ ] Step 4 Location: already locale-aware (distanceOptions, licenseClasses)
- [ ] Step 6 Compliance: VSC (CA) vs Background Check (US) — already locale-aware
- [ ] Demo caregivers: add TX/FL/NY seeded caregivers
- [ ] Demo clients: add US cities
- [ ] Service areas: US metro areas
- [ ] Postal code validation: US 5-digit vs CA alphanumeric
- [ ] Phone format: same (+1) but UI label differs
- [ ] Privacy law label: PIPEDA (CA) vs HIPAA (US)
- [ ] Background check label: VSC (CA) vs FBI/state check (US)
- [ ] AIRecruit compliance: CRTC (CA) vs TCPA (US) — already built
- [ ] Second Vercel project: NEXT_PUBLIC_LOCALE=US
- [ ] Geo-redirect: proxy.ts already built, needs US domain


---

## TICKETING SYSTEM (dedicated session)

DB tables needed:
- support_tickets (id, ticket_number CRF-TKT-XXXX, submitter_id, submitter_type, agency_id, caregiver_id, type, priority, status, subject, description, admin_notes, assigned_to, sla_due_at, created_at)
- ticket_messages (id, ticket_id, sender_id, sender_type, message, internal, created_at)

Ticket types: billing, verification, platform, data_rights, dispute, feature, general
Lifecycle: open > assigned > in_progress > pending_user > resolved > closed

Pages to build:
- /support — public submission form
- /agency/support — pre-filled agency form
- /caregiver/support — pre-filled caregiver form
- /admin/tickets — queue with filters, assign, SLA tracking
- /admin/tickets/[id] — detail + message thread + internal notes

Integrations:
- /settings/data-rights auto-creates data_rights ticket (legal requirement — PIPEDA 30-day SLA)
- AIRecruit call failures auto-create platform ticket
- Payment failures auto-create billing ticket
- Expiring credentials auto-create verification ticket

Ticket number format: CRF-TKT-0001

---

## MODULE-BASED PRICING (placeholder — Stripe session pending)

Modules:
- core: Dashboard, search, match, shortlist, client intake — $XX/mo (required)
- intelligence: AI command bar, gap analysis, match scoring — +$XX/mo
- airecruit: Outbound screening + reference calls — +$XX/mo + $0.12/min
- receptionist: Inbound AI call handler — +$XX/mo + $0.12/min
- family_portal: Client-facing portal — +$XX/mo per client
- white_label: Agency branding, custom domain — +$XX/mo
- enterprise: API access, custom integrations — custom

DB field: agencies.modules_enabled TEXT[]

Inbound receptionist (future Vapi session):
- Agency gets dedicated Vapi number
- AI answers as [Agency Name]
- Routes: new inquiry > intake, existing client > schedule, sick call > logs absence + alerts coordinator
- Transfers to human only when needed

PAYMENTS_ENABLED=false until Stripe account + pricing confirmed
Launch currency: CAD first, USD second (both must be built)

---

## PROMOTIONS & CAMPAIGNS (admin session)

Pages:
- /admin/promotions — create/manage promo codes and campaigns
- Applied at Stripe checkout as coupons

Promo types:
- Percentage discount (e.g. 20% off first 3 months)
- Fixed amount (e.g. $50 off)
- Free months (e.g. 2 months free on annual)
- Module unlock (e.g. free AIRecruit for 30 days)

Campaign types:
- Signup promo (new agencies)
- Loyalty discount (agencies 12+ months)
- Referral reward (agency refers another agency)
- Seasonal (Black Friday, New Year etc.)

DB table: promo_codes (id, code, type, value, module_target, max_redemptions, redemptions_count, expires_at, active, created_at)
DB table: promo_redemptions (id, promo_code_id, agency_id, applied_at, discount_amount)

---

## DEMO ENVIRONMENT (dedicated session)

Goal: Let agencies try Careified before signing up — no login required

Pages:
- /demo — landing with "Try the platform" CTA
- /demo/dashboard — agency dashboard with pre-loaded data
- /demo/search — search with 5 mock caregivers (client-side filtering) ✅ FIXED May 4 2026
- /demo/clients — 5 demo clients with match results
- /demo/clients/[id] — match analysis with gap list
- /demo/airecruit — AIRecruit campaign demo (no real calls)

Demo data: Same 15 caregivers + 5 clients in DB (production). Demo search uses in-component mock data.
Demo banner: "You are in demo mode — no real data · Sign up to get started"
CTA on every page: "Start your free 30-day trial →"
Session-based (no DB writes in demo mode)
Guided tour option: step-by-step walkthrough of key features

**BUG FIX (May 4 2026):** /demo/search was calling /api/match/rank which requires auth. Fixed by adding `isDemo` prop to ClientSearch component with 5 mock caregivers.

