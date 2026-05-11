# CONTEXT.md — Careified
# Purpose: Every product and technical decision with the reasoning behind it
# Updated: May 9 2026
# Update trigger: Every session a decision is made
# Owner: Both
# DO NOT DUPLICATE: Rules (CLAUDE.md), status (CAREIFIED_STATUS.md), vision (FOUNDER.md)

## 1. What Careified Is

Careified is a **verified reputation platform** for professional caregivers
— not a job board, not a staffing app, not a resume database.

The core idea: a caregiver builds ONE verified profile that travels with
them across their entire career. Agencies discover them, vet them faster,
and place them with confidence. The caregiver's reputation compounds over
time instead of resetting with every new employer.

Live URL: https://careified.vercel.app
Repo: https://github.com/ocdeployments/Careified (private)
Geography: Canada-first (Ontario focus). US expansion planned post-launch.
Launch currency: CAD first, USD second.

---

## 2. Who We Are Building For

### Primary Buyer — Home Care Agencies
- Pay for the platform (subscription + modules)
- Recruit, vet, and place caregivers with client families
- Current pain: manual screening, high turnover, placement failures
- Current workflow: post on Indeed → receive 200 unvetted resumes →
  manually screen → call references one by one → place → caregiver
  leaves within 100 days → repeat
- What they want: interview-ready professionals, faster placement,
  retention signals before hire, compliance confidence
- Key stat: 75% annual caregiver turnover (Activated Insights 2025)
- Key stat: 4 in 5 caregivers leave within first 100 days (HCAOA 2024)

### Supply Side — Professional Caregivers (Always Free)
- PSWs (Personal Support Workers), HCAs, DSWs, companions, live-in
  caregivers, dementia specialists, palliative caregivers
- NOT medical-only — all care backgrounds welcome
- Current pain: rebuild resume for every agency, reputation resets,
  no way to prove reliability or soft skills, treated as commodity
- Current job search: Indeed, Job Bank Canada, Caregiver.ca (which is
  just an Indeed aggregator), Facebook groups, word of mouth
- What they want: to be seen as professionals, have their reputation
  recognised, find roles that match their skills without applying blind
- Key insight: "You don't need another app" — they are exhausted by
  job boards. Careified is not a job board. It's a professional identity.

### Future — Families (Read-Only Portal, Phase 1 Planned)
- See their assigned caregiver's profile card
- View schedule, shift notes, caregiver credentials
- Never see supply-side data or other caregivers
- Never pay — families access via their agency

---

## 3. The Problem We Solve

### For Agencies
The hiring process is broken in 6 ways:
1. General job boards return unvetted, unverified candidates
2. Reference checking is manual and slow (1-2 days per candidate)
3. No visibility into caregiver reliability before placement
4. Compliance gaps (VSC, TB, immunizations) discovered too late
5. Placements fail — no early retention signals
6. Every hire starts from scratch — no portable reputation data

Careified fixes all 6:
1. Pre-verified profiles with trust scores and credential tiers
2. AIRecruit calls references automatically (built — Vapi)
3. 7-dimension match scoring with retention signal built in
4. Compliance built into profile builder (Step 6)
5. Retention signals in match algorithm
6. Caregiver reputation travels — agencies see full history

### For Caregivers
The job search is broken in 5 ways:
1. Every application = rebuild resume from scratch
2. Reputation resets with every new employer
3. General job boards don't understand care backgrounds
4. Soft skills (patience, empathy, adaptability) are invisible
5. Caregiver.ca and similar are just Indeed aggregators —
   not real solutions

Careified fixes all 5:
1. Build once — profile travels with the caregiver forever
2. Verified reputation compounds across placements
3. 20+ care-specific filters and matching dimensions
4. 7 forced-choice behavioural scenarios surface soft skills
5. Direct connection to agencies — no middlemen

---

## 4. The Core Moat

**Two-sided verified reputation system.**

Neither side works without the other:
- Agencies won't pay without quality caregiver supply
- Caregivers won't build profiles without agency demand

The moat deepens over time:
- More caregivers → better matches for agencies
- More agencies → more discovered caregivers → more profiles built
- More placements → more ratings → stronger trust scores
- Stronger trust scores → better retention → agencies stay

No competitor can replicate this without rebuilding both sides.

---

## 5. Decisions Made and Why

### Why inline styles over Tailwind
Tailwind v4 has production build issues in this stack. Inline styles
are predictable, portable, and don't break on Vercel deploy.
This is a permanent decision — do not introduce Tailwind classes.

### Why no green as primary colour
Green is overused in health/care apps. It signals "medical" not
"professional." Careified uses Navy + Gold to signal trust and premium.
Gold = caregiver/warmth. Royal blue = agency/confidence.
Green is reserved for success states only (checkmarks, saved indicators).

### Why no emojis anywhere
Emojis undermine the professional positioning. Every icon is
lucide-react. This is non-negotiable.

### Why Clerk for auth (not NextAuth or custom)
Speed of implementation, role metadata support, production-grade
security without custom infrastructure. Dev keys now, production
keys at launch.

### Why Vapi for AIRecruit
Best-in-class voice AI with programmable agents, TCPA/CRTC
compliance hooks, webhook support, and transcript access.
Assistant ID: see AI_PLAYBOOK.md

### Why OpenRouter/Mistral for resume parsing
Cost-effective, fast, good at structured extraction from unstructured
resume text. Accessed via OPENROUTER_API_KEY.

### Why one file per commit
Prevents compound errors. If a commit breaks something, it's
immediately obvious which file caused it. Rollback is clean.
This is non-negotiable — never batch multiple files in one commit.

### Why inline styles over component libraries
No dependency risk, no version conflicts, full control over design
system, works consistently across Vercel deploys.

### Why demo requires email + phone (not full auth)
Agencies need to try before they buy — friction kills conversion.
But we need lead capture for follow-up. Email + phone is the minimum
viable gate that captures a warm lead without requiring commitment.
Demo leads should eventually be stored in a `demo_leads` DB table.

### Why caregiver profiles are always free
Supply side must have zero friction to join. Charging caregivers
would kill supply growth. Revenue comes entirely from agencies.

### Why Canada first
Regulatory environment (PIPEDA, CRTC) is well understood.
PSW certification is standardised in Ontario. Existing network
in Ontario. US expansion (HIPAA, TCPA) planned post-launch.

### Why demo is gated behind agency signup (May 8 2026)
Competitive protection — open demos expose profile design,
scoring system, and UX patterns to competitors before launch.
Demo access granted after agency signup on /agency/pending-approval.

### Why Careified Engine not Matching Engine (May 8 2026)
Brand ownership. "Matching Engine" is generic and forgettable.
"Careified Engine" is ownable, proprietary-sounding, and
reinforces the platform name at every mention.

### Why client intake is required for matching (May 8 2026)
Without client data, matching is just filtering by caregiver attributes.
With client intake, the engine performs genuine compatibility scoring
across 7 dimensions. Client intake is therefore a pre-launch blocker.

### Why single auth entry point (May 8 2026)
Separate sign-in and sign-up pages created confusion and split the
Clerk configuration. Single /sign-up entry point with Clerk handling
new vs existing users inline. Simpler, less fragile.

### Why Next.js App Router (Early 2026)
SSR + RSC for SEO and auth. Pages router was too legacy.
App Router provides better performance and modern patterns.

### Why Render PostgreSQL (Early 2026)
Cost-effective, simplicity, managed backups.
PlanetScale and Supabase were considered but rejected.

### Why pg Pool + Prisma hybrid (Early 2026)
Raw SQL for complex match queries, Prisma for schema.
ORM-only was too slow for match ranking queries.

### Why non-recommender positioning (May 4 2026)
Liability protection — platform presents, agency decides.
Recommender model created legal risk.

### Why verification tiers 1-4 with confidence multipliers (May 4 2026)
Honest signal weighting vs binary verified/unverified.
Binary was too simplistic for reliability assessment.

### Why proxy.ts renamed from middleware.ts (May 4 2026)
Next.js 16 Edge Runtime incompatible with pg Pool.
Keep as middleware.ts broke DB connections.

---

## 6. What We Tried That Didn't Work

### Profile Demo as separate page
Originally `/profile/demo` was a standalone page in the navbar.
Removed from nav — content embedded in `/for-caregivers#why-build`
instead. Reason: reduces nav complexity, keeps caregivers on the
marketing page longer before being asked to sign up.

### Tailwind classes in components
Caused production build failures on Vercel with Tailwind v4.
Switched entirely to inline styles. All new components must use
inline styles only.

### Agency dropdown with 7+ links
Too complex. Overwhelmed visitors. Reduced to 3 focused cards:
Join, How It Works, Try the Platform.

### caregiver_security table
Does not exist in the DB. Was referenced in early prompts.
Never build against this table — it was never created.

---

## 7. Messaging Rules (Non-Negotiable)

| Rule | Reason |
|------|--------|
| Never show pricing figures | Pricing not finalised — Stripe session pending |
| Never name competitors | "General job boards" only — no Indeed/Care.com mentions |
| Never use emojis | Undermines professional positioning |
| Families never see supply-side data | Privacy + trust |
| All care backgrounds welcome | Never frame as medical-only |
| Reputations EARNED — made VISIBLE by Careified | Core brand truth |
| "You don't need another app" | Direct response to caregiver fatigue |
| "Build once. Be seen forever." | Core caregiver value prop |
| "Recruit without the legwork." | Core agency value prop |

### Verified Stats Only (Do Not Fabricate)
- 75% annual caregiver turnover — Activated Insights 2025
- 4 in 5 leave within first 100 days — HCAOA 2024
- 9.7M care jobs to fill by 2034 — PHI 2025

---

## 8. Design System (Why These Choices)

| Token | Value | Reason |
|-------|-------|--------|
| Navy | #0D1B3E | Trust, authority, professionalism |
| Navy dark | #080F1E | Footer depth |
| Gold | #C9973A / #E8B86D | Warmth, premium, caregiver identity |
| Royal | #1E3A8A / #2563EB | Agency confidence, secondary actions |
| Amber | #B45309 | Family colour — distinct from agency/caregiver |
| Warm white | #F7F4F0 | Page background — warmer than pure white |
| Gold tint | #FDF6EC | Active states, alternate sections |

**Typography:**
- DM Serif Display — all headlines (emotional, trustworthy)
- DM Sans — all body, labels, UI (clean, readable)
- Inter — legacy components (being phased out)
- 16px base, 48px page headlines, 26px section headlines, 20px card titles

**Cards:** white, borderRadius 16px, border 1px solid #E2E8F0
**Hover:** borderColor #C9973A, gold glow, translateY(-2px to -6px)
**CTAs:** linear-gradient(135deg, #C9973A, #E8B86D), color #0D1B3E

---

## 9. Business Model

### Revenue: Agencies Pay, Caregivers Always Free

| Module | Description | Status |
|--------|-------------|--------|
| core | Dashboard, search, match, shortlist, client intake | Required |
| intelligence | AI command bar, gap analysis, match scoring | Add-on |
| airecruit | Outbound screening + reference calls | Add-on + per-min |
| receptionist | Inbound AI call handler | Add-on + per-min |
| family_portal | Client-facing portal | Per-client |
| white_label | Agency branding, custom domain | Add-on |
| enterprise | API access, custom integrations | Custom |

### Pricing Status
Internal pricing model lives in PRICING.md.
User-facing pricing suppressed until Stripe is live (PAYMENTS_ENABLED=false).
Pricing page shows "contact us" until then.
Launch currency: CAD. USD second.

---

## 10. Growth Strategy — First 100 Caregivers

Target: Ontario PSW community first.

### Fastest channels:
1. PSW training programs — George Brown, Humber, Seneca, Conestoga
   - Present to graduating classes
   - Position as "your professional profile that travels with you"
2. Facebook groups — "PSW jobs Ontario", "Caregiver jobs Toronto"
   - Join, provide value, introduce Careified
   - $5-10/day Facebook ad targeting PSW certificate holders
3. Immigrant settlement orgs — ACCES Employment, COSTI, WoodGreen
   - Free referral pipeline — they actively refer their clients
4. Indeed reverse funnel — post jobs on behalf of demo agencies,
   redirect applicants to build a Careified profile instead of resume

### Incentives:
- "First 100" founding caregiver badge (visible on profile)
- Priority matching — shown first to agencies
- Shareable profile link (LinkedIn-style professional asset)

### Timeline: 100 caregivers in 6-8 weeks is realistic with this stack

---

## 11. What Success Looks Like

See FOUNDER.md → What Success Looks Like

---

## 12. Pre-Launch Checklist (Not Done Yet)

See PRODUCTION_CHECKLIST.md for current launch status.

---

## 13. Session History (Technical)

### Sessions 1–8D (Complete ✅)
Clerk auth, role-locked signup, agency approval, search, shortlist,
profile builder 6 steps, profile display, ID cards, navbar, landing page.
Safe revert: 41c6b31

### Session 9 (Complete ✅)
ProfilePreviewCard (live split view), IDCardReveal (3D flip ceremony),
three-column profile builder layout, Step6Review wired to reveal.
Commits: 2935f0b, 70f3f20, f991f7e, bbaeb1e

### Session 10A (Complete ✅)
51 new DB columns added. ProfileFormContext (global state + localStorage).
useProfileSave hook (three-layer save). Three API routes: save-field,
save-step, load. page.tsx wired to Context + Clerk userId.
Commits: a0fb75d → 3fc6eab

### Session 10B — COMPLETE ✅
Step1Identity.tsx rebuilt with useProfileForm Context + useProfileSave hook
Commit: 31b1bd2

### Session 10C — COMPLETE ✅
Step2Services.tsx rebuilt — Context pattern, removed credentials, added self-ratings
Commit: b72055e

### Session 10D–10L — COMPLETE ✅
Steps 3-10 all rebuilt with Context pattern

---

## 14. Profile Builder — 10-Step Architecture

### Progressive Disclosure Model
- Steps 1–3 → Basic (50%) → Profile goes live in search
- Steps 4–5 → Verified (68%) → Verified badge unlocked
- Steps 6–7 → Professional (82%) → Featured matching eligible
- Steps 8–10 → Elite path (95% requires agency validation)

### Step Map
| Step | Content | Fields From |
|------|---------|-------------|
| 1 | Identity | name, photo, DOB, gender, phone, location, languages, bio, emergency |
| 2 | Services | what you do, self-ratings, client types, dietary |
| 3 | Availability | status, weekly grid, hours, placement types, preferences |
| 4 | Location & Transport | service area, radius, driving, vehicle |
| 5 | Credentials | primary credential, certifications, education |
| 6 | Compliance | background consent, declarations, immunisations |
| 7 | Personality | 7 forced-choice scenarios + working style + strengths |
| 8 | Work History | employer blocks, volunteer, memberships |
| 9 | References | 3 minimum, consent structure |
| 10 | Open Questions | 3 profile quality questions |

### Completion Thresholds
- Step 1: 20% | Step 2: 35% | Step 3: 50% ← Goes live
- Step 4: 58% | Step 5: 68% ← Verified badge
- Step 6: 74% | Step 7: 82% ← Professional tier
- Step 8: 87% | Step 9: 92% | Step 10: 95%

---

## 15. Client Intake System — DESIGNED (Legacy)

See CLIENT_INTAKE.md for full spec.

---

## 16. Personality Assessment — Step 7 Design

7 forced-choice scenario questions (NOT rating scales):

1. **Patience** — dementia repetition
   - A) Naturally at ease — answers fresh each time
   - B) Professional effort — stays calm but aware of repetition

2. **Empathy** — family emotional subtext
   - A) Proactively names it — checks in directly
   - B) Observant — watches for signs, doesn't name unless certain

3. **Adaptability** — unexpected care plan change
   - A) Adapts immediately — works with new info
   - B) Protocol-oriented — confirms with agency before changing

4. **Communication** — end-of-shift observation
   - A) Proactive alerter — calls/messages same evening
   - B) Documentation-first — records thoroughly, reports next contact

5. **Emotional Regulation** — angry family member
   - A) Absorbs and continues — stays calm, explains reasoning
   - B) Processes and resets — professional in moment, needs debrief after

6. **Problem Solving** — medication refusal
   - A) Experimental — tries different approaches until something works
   - B) Collaborative escalator — documents, involves agency/family

7. **Resilience** — client death/grief
   - A) Relational attachment — feels deeply, may stay in touch with family
   - B) Boundaried professional — processes and closes chapter consciously

Each answer → style label + base score (4.0 natural / 3.0 effort-based)
Agency validates post-placement → score adjusts (max 5.0)
Stored in personality_profile JSONB

---

## 17. Rating System — NOT YET BUILT

See RATING_SYSTEM.md for full spec.

---

## 18. Session Etiquette

Claude reads this file at the start of every session.
This gives Claude full product context before touching any code.

If something in this file conflicts with CLAUDE.md:
- CLAUDE.md wins on technical decisions
- CONTEXT.md wins on product/positioning decisions

If something is unclear — ask before building.
One wrong assumption costs a commit. One wrong architectural
decision costs a session.

---

## 19. Client Intake System — Architecture

See CLIENT_INTAKE.md for full spec.

---

## 20. Rating System — Design

See RATING_SYSTEM.md for full spec.

---

## 21. End-of-Session QA Protocol

Run this at the END of every session before closing, after all commits are pushed to main.

### Step 1 — Playwright MCP Browser Check
Use Playwright MCP to visit these pages on localhost:3000 and report console errors, crashes, and missing content. Report as a table: URL | Status | Console Errors | Notes

Public pages (always check):
/ | /for-caregivers | /for-agencies | /for-families | /about
/contact | /privacy | /terms | /profile/demo | /demo
/agency/signup | /opportunities

Caregiver pages (check if touched this session):
/profile/build | /profile/strength | /settings/communications | /settings/data-rights

Agency pages (check if touched this session):
/agency/dashboard | /agency/search | /agency/clients | /agency/settings | /agency/billing

Admin pages (check if touched this session):
/admin | /admin/agencies | /admin/caregivers | /admin/status

### Step 2 — TypeScript Check
npx tsc --noEmit
Zero errors required before session closes.

### Step 3 — Git Check
git status must be clean.
git log --oneline -5 to confirm all commits pushed.

### Step 4 — Report
Show a final table:
TypeScript: ✅ clean / ❌ X errors
Pages checked: X
Pages with errors: X (list them)
Git: ✅ clean / ❌ uncommitted changes
Safe revert: [latest commit hash]

### Step 5 — DB Integrity Check
Run caregiver + agency count query. Confirm counts haven't dropped unexpectedly.

### Step 6 — Broken Link Scan
Grep all href="/" values in app/ and components/. Cross-reference against known routes. Flag any that don't exist.

### Step 7 — Orphan Page Check
List any new pages added this session. Verify each has a reachability path (NAV / ACTION / DYNAMIC / SYSTEM). Flag true orphans.

### Step 8 — Env Var Drift
Grep all process.env references added this session. Verify each exists in .env.local and is documented in CAREIFIED_SPEC.md ENV VARS table.

### Step 9 — Security Regression
Run three checks:

- ADMIN_CLERK_USER_ID present in app/admin/layout.tsx
- auth() present in app/agency/layout.tsx
- No new dangerouslySetInnerHTML in any file

### Step 10 — Console Warnings
Playwright MCP re-run, this time capturing both errors AND warnings.

### Step 11 — Doc Freshness
Confirm CAREIFIED_SPEC.md and CAREIFIED_STATUS.md all updated this session.

### Step 12 — Safe Revert Update
Update safe revert point in CAREIFIED_STATUS.md to latest commit hash.

---

