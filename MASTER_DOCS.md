# MASTER_DOCS.md
# Careified — Master Reference Document
# Created: May 8 2026
# Rule: Update at END of every session
# Rule: Read at START of every session alongside CLAUDE.md

---

## 1. TECHNICAL DECISION LOG

| Date | Decision | Rationale | Alternatives Rejected |
|------|----------|-----------|----------------------|
| Early 2026 | Next.js App Router | SSR + RSC for SEO and auth | Pages router — too legacy |
| Early 2026 | Clerk for auth | Speed, role metadata, production-grade | NextAuth — too custom |
| Early 2026 | Inline styles over Tailwind | Tailwind v4 prod build failures on Vercel | Tailwind — broke on Vercel deploy |
| Early 2026 | Render PostgreSQL | Cost, simplicity, managed backups | PlanetScale, Supabase |
| Early 2026 | Vapi for AIRecruit | Best voice AI, TCPA/CRTC hooks, webhooks, transcripts | Twilio — no AI layer |
| Early 2026 | OpenRouter/Mistral for resume parsing | Cost-effective, fast structured extraction | OpenAI — higher cost |
| Early 2026 | pg Pool + Prisma hybrid | Raw SQL for complex queries, Prisma for schema | ORM-only — too slow for match queries |
| May 4 2026 | Non-recommender positioning | Liability protection — platform presents, agency decides | Recommender model — legal risk |
| May 4 2026 | Verification tiers 1-4 with confidence multipliers | Honest signal weighting vs binary verified/unverified | Binary — oversimplifies reliability |
| May 4 2026 | proxy.ts renamed from middleware.ts | Next.js 16 Edge Runtime incompatible with pg Pool | Keep as middleware.ts — broke DB connections |
| May 5 2026 | Demo gated behind agency signup | Competitive IP protection | Open demo — exposed profile design to competitors |
| May 8 2026 | Single auth entry point /sign-up | UX simplification, one less page | Separate sign-in/sign-up — confusion |
| May 8 2026 | "Careified Engine" naming | Brand ownership, not a generic feature name | "Matching Engine" — generic, forgettable |
| May 8 2026 | Client intake drives matching | Without client data, matching is just filtering | Search-only model — no personalisation |

---

## 2. SECURITY & PRIVACY ELEMENT INVENTORY

### Authentication & Access Control
| Element | Risk Level | Status | Owner |
|---------|-----------|--------|-------|
| Clerk auth on all protected routes | CRITICAL | ⚠️ Partial — proxy.ts gaps remain | Dev |
| ADMIN_CLERK_USER_ID enforcement | CRITICAL | ✅ Built in layout.tsx | Dev |
| ADMIN_CLERK_USER_ID in env vars | CRITICAL | ❌ Missing from .env.local | Romy |
| Agency approval gate | HIGH | ✅ Built | Dev |
| Role-based routing post-auth | HIGH | ✅ Built | Dev |
| Clerk production keys | CRITICAL | ❌ Still on pk_test_ | Romy |
| Session expiry handling | MEDIUM | ⚠️ Clerk default only | Dev |
| /profile/build in public routes | HIGH | ❌ Fixed May 8 — verify | Dev |

### Data Security
| Element | Risk Level | Status | Owner |
|---------|-----------|--------|-------|
| PHI encryption AES-256-GCM | CRITICAL | ❌ Structure exists, columns plain text | Dev |
| SSL cert Render DB | HIGH | ❌ rejectUnauthorized: false | Romy |
| SQL injection lib/db.ts lines 56-68 | HIGH | ❌ Unfixed | Dev |
| dangerouslySetInnerHTML admin/caregivers line 217 | HIGH | ❌ Unfixed | Dev |
| Reference tokens not UUID | HIGH | ❌ Predictable/enumerable | Dev |
| Rate limiting on API routes | HIGH | ❌ Not built | Dev |
| Vapi webhook HMAC verification | HIGH | ❌ Not built | Dev |
| DB backup procedure documented | HIGH | ❌ Not documented | Romy |

### Privacy & Compliance
| Element | Requirement | Status | Owner |
|---------|------------|--------|-------|
| PIPEDA data export | Legal | ✅ /settings/data-rights | Dev |
| PIPEDA data deletion | Legal | ✅ /settings/data-rights | Dev |
| PIPEDA 30-day SLA | Legal | ❌ Requires ticketing system | Dev |
| Consent timestamping | Legal | ✅ Built | Dev |
| Consent versioning | Legal | ✅ Built | Dev |
| TCPA/CRTC calling hours | Legal | ✅ lib/airecruit/calling-hours.ts | Dev |
| Communication consent gate | Legal | ✅ Built | Dev |
| Age verification at signup | Legal | ✅ /profile/start checkbox | Dev |
| Non-recommender disclaimer | Liability | ✅ All profile pages | Dev |
| Lawyer review of lib/legal/text.ts | Legal | ❌ Not done | Romy |
| E&O insurance | Legal | ❌ Not in place | Romy |
| Cyber liability insurance | Legal | ❌ Not in place | Romy |

### PII/PHI Data Inventory
| Data Type | Classification | Storage | Encrypted | Notes |
|-----------|---------------|---------|-----------|-------|
| Caregiver name | PII | caregivers table | ❌ | Plain text |
| Caregiver DOB | PII | caregivers table | ❌ | Plain text |
| Caregiver phone | PII | caregivers table | ❌ | Plain text |
| Caregiver photo | PII | photo_url column | ❌ | URL only |
| Caregiver location | PII | caregivers table | ❌ | Plain text |
| Health declarations | PHI | caregivers table | ❌ | Needs AES-256-GCM |
| Red flag disclosures | Sensitive | caregivers table | ❌ | Visible to approved agencies only |
| Reference contact info | PII | caregiver_references | ❌ | Plain text |
| Client care needs | PHI | client_needs table | ❌ | Needs AES-256-GCM |
| Client medical history | PHI | Not built yet | N/A | Must encrypt at build |
| Agency billing info | PCI | Not built yet | N/A | Stripe handles — never store raw |

---

## 3. USER ERROR / FAQ MAP

### Caregiver Errors

| Step | Mistake | Current Behaviour | Required Fix | Priority |
|------|---------|-------------------|--------------|----------|
| Sign up | Uses wrong email | Clerk error message | Clear message + "try signing in" prompt | HIGH |
| Sign up | Phone already registered | Clerk error | "Account exists — sign in instead" | HIGH |
| Sign up | Skips phone verification | Blocked by Clerk | Clear instruction why phone is required | MEDIUM |
| Step 0 | Uploads wrong file type | Silent fail | Clear error + accepted formats list | HIGH |
| Step 0 | File over 5MB | Silent fail | File size error before upload attempt | HIGH |
| Step 0 | Resume parse fails | Error shown | "Try another file" + manual continue option ✅ | DONE |
| Step 0 | Skips resume, forgets to fill fields | Empty profile goes live | Warning on profile completeness | MEDIUM |
| Step 1 | Leaves name blank | Form won't advance | Inline red error on field | HIGH |
| Step 1 | Uploads photo wrong format | Silent fail | Error + accepted formats | HIGH |
| Step 1 | DOB makes them under 18 | No age check | Block advance + explain requirement | HIGH |
| Step 2 | Selects conflicting services | No warning | Conflict indicator between services | LOW |
| Step 3 | Sets availability but no hours | Incomplete grid | Warning before advancing | MEDIUM |
| Step 4 | Travel radius too small for area | No warning | Suggest minimum viable radius | LOW |
| Step 5 | Uploads expired credential | No expiry check | Flag expiry — visible to agencies | MEDIUM |
| Step 6 | Answers yes to red flag question | No guidance | Explain what happens, what agencies see | HIGH |
| Step 9 | Referee won't respond | No follow-up | Auto-reminder email at 3 days + 7 days | MEDIUM |
| Step 10 | Leaves open questions blank | Allowed silently | Encourage completion — affects score | LOW |
| Any step | Loses internet mid-save | Risk of data loss | localStorage fallback ✅ DONE | DONE |
| Any step | Closes browser mid-step | Risk of data loss | localStorage fallback ✅ DONE | DONE |
| Profile live | Wants to hide profile temporarily | No visibility toggle | Availability status toggle needed | MEDIUM |
| Profile live | Wants to dispute a review | 14-day window | Clear dispute UI with countdown | HIGH |
| Profile live | No notification when agency views | Silent | "Agency viewed your profile" notification | LOW |
| Profile live | No celebration when profile goes live | Silent | Step 10 completion ceremony needed | MEDIUM |

### Agency Errors

| Step | Mistake | Current Behaviour | Required Fix | Priority |
|------|---------|-------------------|--------------|----------|
| Signup | Invalid phone number | Silent reject | ❌ UX debt — show inline error | HIGH |
| Signup | Leaves required fields | No highlight | ❌ UX debt — red highlight + scroll to error | HIGH |
| Signup | Submits duplicate agency | No check | Check by email/ABN before submission | MEDIUM |
| Search | Too many filters → 0 results | Empty state | ⚠️ Empty state not built — build it | HIGH |
| Search | Shortlists wrong candidate | Can remove ✅ | Clear confirmation on shortlist add | LOW |
| Client intake | Incomplete intake submitted | Partial matches | Warning on incomplete required sections | HIGH |
| Client intake | Wrong schedule entered | Bad matches surface | Easy edit on client profile page | MEDIUM |
| Client intake | Duplicate client created | No duplicate check | Check by name + DOB before creation | MEDIUM |
| AIRecruit | Launches without consent | Blocked ✅ | Consent gate built | DONE |
| AIRecruit | Wrong candidate phone | Call fails | Show error + retry option | MEDIUM |
| Match review | Reviews wrong caregiver | No undo | Confirmation screen before submission | HIGH |
| Match review | Submits review after 14-day window | Blocked | Clear deadline display on review form | MEDIUM |
| Billing | Payment fails | No notification | ❌ Stripe not built — add to checklist | HIGH |
| Settings | Accidentally changes service area | Immediate effect | Confirmation dialog on service area change | MEDIUM |

### Admin Errors

| Action | Mistake | Guard Needed | Priority |
|--------|---------|-------------|----------|
| Approve wrong agency | No undo currently | Confirmation dialog + 24hr reversal window | HIGH |
| Delete caregiver | Permanent action | Soft delete only — never hard delete | CRITICAL |
| Override disputed review | Irreversible | Audit log ✅ + confirmation dialog | HIGH |
| Change agency modules | Immediate billing effect | Confirmation + notify agency | MEDIUM |
| Run DB migration | Could break production | Backup required before any migration ✅ | CRITICAL |

---

## 4. CAREGIVER INTERFACE PERSPECTIVE

### Journey Stages
1. **Discovery** `/for-caregivers` — value prop, social proof, workflow diagram
2. **Commitment** `/profile/start` — age gate, competitive protection, sign up CTA
3. **Authentication** `/sign-up` — Clerk signup with phone verification
4. **Onboarding** `/onboarding` — name collection, phone OTP, age confirmation
5. **Profile build** `/profile/build` steps 0-10 — 15 minutes
6. **Live** `/profile/strength` — visibility status, trust score, badges
7. **Discovery** `/opportunities` — browse open roles
8. **Placement** — agency contacts via platform
9. **Post-placement** — rating received, trust score compounds
10. **Career** — profile improves over time, visibility increases

### Key Moments of Truth
| Moment | What must happen | Current status |
|--------|-----------------|----------------|
| Resume parse | Works first time, fills fields accurately | ✅ Built |
| Step 6 red flag questions | Feels safe, not interrogating | ⚠️ Copy needs review |
| Step 7 personality scenarios | Feels insightful, not like a test | ✅ Built |
| Profile goes live | Celebration, sense of achievement | ❌ Missing |
| First agency views profile | Notification to caregiver | ❌ Not built |
| First placement offer | Biggest trust moment | ❌ No flow built |
| First post-placement rating | Transparent, fair, dispute option visible | ⚠️ Partial |

### Caregiver Trust Signals (what they need to feel safe)
- Profile is private until they choose to go live
- Agencies cannot contact them directly — platform mediated
- They can see who viewed their profile
- They own their data — export and delete available
- Ratings are aggregate only — no public negative scores
- Dispute window is clearly communicated
- Free forever — no hidden costs

---

## 5. AGENCY INTERFACE PERSPECTIVE

### Journey Stages
1. **Discovery** `/for-agencies` — value prop, agency workflow diagram
2. **Demo** `/demo` — gated behind signup (competitive protection)
3. **Signup** `/agency/signup` — 4-step registration
4. **Pending** `/agency/pending-approval` — wait screen + demo preview
5. **Approved** — dashboard unlocked, modules active
6. **Recruit** `/agency/search` — search, filter, shortlist caregivers
7. **Client intake** `/agency/clients/new` — define client needs
8. **Match** `/agency/clients/[id]` — Careified Engine alignment scores
9. **Screen** `/agency/airecruit` — automated screening calls
10. **Place** — submit placement review, score updates
11. **Billing** `/agency/billing` — module subscription management

### Key Moments of Truth
| Moment | What must happen | Current status |
|--------|-----------------|----------------|
| First search results | Quality profiles, meaningful scores | ✅ 15 demo caregivers |
| First client intake → match | Fast, accurate alignment scores | ✅ Built |
| First AIRecruit call | High quality transcript, useful scoring | ✅ Built |
| Approval notification | Fast response, clear next steps | ⚠️ Manual process |
| First placement | Retention signal accuracy validated | ❌ Rating system incomplete |
| Billing activation | Clear value, fair pricing | ❌ Stripe not built |

### Agency Trust Signals (what they need to feel confident)
- All placement decisions rest with the agency — Careified never recommends
- Scores reflect data alignment, not Careified opinion
- Caregiver data is caregiver-submitted — not fabricated
- Third-party verification results are passed through as-reported
- Non-recommender disclaimer on every profile
- Full audit trail of all actions
- Data export available for compliance

---

## 6. BACKLOG — Document When Ready

These documents have value but are not needed during active development:

| Document | When to build | Notes |
|----------|--------------|-------|
| Formal workflow diagrams | Pre-launch | Investor/partner facing |
| Integration specifications | When integrating (Stripe, Checkr, Persona) | Build at integration time |
| Data handoff document | Pre-launch | For lawyer review |
| Concept document | Pre-fundraise | Investor deck source |
| Technical direction document | When hiring engineers | Onboarding doc |
| API documentation | When opening API | Enterprise tier |
| Runbook / incident response | Week 5 pre-launch | Operational |
| Help center articles | Week 5 pre-launch | 10 minimum before launch |
| Changelog | Post-launch | Public-facing |

---

## 7. MANDATORY SESSION PROTOCOLS (additions to CLAUDE.md)

### Session Start — Additional Checks
- [ ] Read PRODUCTION_CHECKLIST.md — note any new completions
- [ ] Confirm Vercel last deployment succeeded
- [ ] Run `npm audit` — flag any new vulnerabilities
- [ ] DB record counts: caregivers, agencies (confirm no unexpected drops)
- [ ] Check for TypeScript errors introduced since last session

### During Build — Non-Negotiable
- [ ] `git diff --staged` before EVERY commit — no exceptions
- [ ] DB verify after any save-related change
- [ ] Check mobile viewport after any UI change
- [ ] Verify env var exists before using it in new code
- [ ] No `console.log` left in committed code

### Session End — Full Protocol
- [ ] Playwright E2E: `npx playwright test tests/e2e/navigation.spec.ts`
- [ ] Link audit: `npx tsx scripts/audit-links.ts`
- [ ] Auth audit: `npx tsx scripts/audit-auth.ts`
- [ ] Update CAREIFIED_SPEC.md — add new pages, resolve fixed issues
- [ ] Update CAREIFIED_STATUS.md — session summary
- [ ] Update PRODUCTION_CHECKLIST.md — check off completed items
- [ ] Update MASTER_DOCS.md — new decisions, new errors discovered
- [ ] Update safe revert point in HANDOFF.md and STATUS.md
- [ ] Broken link scan: `grep -rn 'href="/' app/ components/ | grep -v node_modules`
- [ ] Orphan page check — any new pages without reachability path
- [ ] Env var drift: grep new process.env references, verify in .env.local
- [ ] Security regression: confirm no new dangerouslySetInnerHTML, no unprotected routes
- [ ] Mobile spot check on all pages touched this session
- [ ] Confirm Vercel deployment live after push
- [ ] `npm audit` — no new critical vulnerabilities