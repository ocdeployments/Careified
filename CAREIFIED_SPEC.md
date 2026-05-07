# CAREIFIED_SPEC.md
# Living QA spec — single source of truth for expected behaviour
# Generated: May 5 2026 | Pages audited: 53 | Components: 102
# Rule: Update this file at END of every build session
# Rule: Audit against this file at START of every build session

---

## HOW TO USE THIS FILE

### Start of every session — paste this prompt to Claude:
> "Read CAREIFIED_SPEC.md. Run a static audit against the current
> codebase. Report PASS, FAIL, or MISSING for each item.
> Do not fix anything. Wait for my instruction."

### End of every session — paste this prompt to Claude:
> "Update CAREIFIED_SPEC.md to reflect everything built today.
> Add new pages and expected behaviours. Move resolved KNOWN ISSUES
> to a RESOLVED section. One file, one commit."

### When adding a new feature — paste this prompt to Claude:
> "Before building [feature], add its spec to CAREIFIED_SPEC.md.
> Define every page, button, and expected behaviour first.
> One file, one commit. Then we build."

---

## SYSTEM CHECKS (Run Every Session)

- [x] proxy.ts exists at project root (renamed from middleware.ts May 6 2026)
- [x] proxy.ts protects all caregiver/agency/admin routes
- [ ] npx tsc --noEmit passes with zero errors
- [ ] All required env vars present (see ENV VARS section)
- [ ] git status is clean before starting
- [ ] No dangerouslySetInnerHTML in any file

---

## SECURITY — CURRENTLY FAILING ❌

These are active failures as of May 6 2026. Fix before launch.

- [x] proxy.ts EXISTS (was middleware.ts — renamed May 6 2026) ✅ FIXED
- [ ] /admin/* requires ADMIN_CLERK_USER_ID check — NOT ENFORCED (CRITICAL)
- [ ] /agency/billing requires agency auth — NOT ENFORCED (HIGH)
- [ ] /agency/clients requires agency auth — NOT ENFORCED (HIGH)
- [ ] /agency/settings requires agency auth — NOT ENFORCED (HIGH)
- [ ] /agency/shortlist requires agency auth — NOT ENFORCED (MEDIUM)
- [ ] /agency/airecruit/new requires agency auth — NOT ENFORCED (HIGH)
- [ ] Vapi webhook HMAC signature verification — NOT BUILT (HIGH)
- [ ] Reference tokens are not UUID — NOT FIXED (HIGH)
- [ ] No rate limiting on any API route — NOT BUILT (HIGH)
- [ ] SQL injection risk in lib/db.ts lines 56-68 — NOT FIXED (HIGH)
- [ ] XSS via dangerouslySetInnerHTML in admin/caregivers line 217 (HIGH)
- [ ] SSL cert for Render DB — rejectUnauthorized: false (MEDIUM)

---

## PAGE REACHABILITY CATEGORIES

Pages are reachable in one of four ways:
- NAV: Linked directly from navbar dropdown
- ACTION: Reached by clicking a button/link on a parent page
- DYNAMIC: Reached via dynamic route from a list page
- SYSTEM: Reached via external link (email, QR code, wallet)

Pages NOT in nav are not orphans if they are ACTION/DYNAMIC/SYSTEM reachable.
A TRUE ORPHAN is a page with no reachability path at all — flag as CRITICAL.

---

## PUBLIC PAGES (No Auth Required)

### / (Landing)
- REACHABILITY: NAV (logo)
- Hero section renders
- Navbar visible with Caregivers, Agencies, Families dropdowns
- Footer links: Privacy, Terms, Contact all work
- No broken links

### /for-caregivers
- REACHABILITY: NAV (caregivers dropdown → /for-caregivers)
- Hero headline: "For Professional Caregivers"
- Subtext: "You don't need another app. Build once. Be seen forever."
- CTA: "Claim Your Profile" → /sign-up?role=caregiver&redirect_url=/profile/build
- Card 1: "Why Should I Build My Profile?" → /for-caregivers#why-build
- Card 2: "Browse Opportunities" → /opportunities
- #why-build section exists below cards
- Maria Santos demo embedded in #why-build section
- Hover: translateY(-6px) + gold glow on cards
- Fonts: DM Serif Display headlines, DM Sans body
- No Tailwind classes — inline styles only

### /for-agencies
- REACHABILITY: NAV (agencies dropdown → /for-agencies)
- Hero headline: "Recruit Without the Legwork."
- Subtext: "We deliver interview-ready professionals with intelligent AI-powered matches."
- CTA: "Join the Careified Network" → /agency/signup
- "Old Way vs Careified Way" comparison section exists
- Features section with 6 platform area cards
- Each feature card links to correct platform page
- Demo section: "Launch the Demo" → /demo
- Closing section: dark navy background, brand statement
- Fonts: DM Serif Display + DM Sans throughout

### /for-families
- REACHABILITY: NAV (families dropdown)
- Page renders without error
- Links to /for-families and /about present

### /about
- REACHABILITY: NAV (families dropdown → /about)
- Page renders without error

### /contact
- REACHABILITY: NAV footer
- Contact form renders
- All form fields present

### /privacy
- REACHABILITY: NAV footer
- Page renders without error

### /terms
- REACHABILITY: NAV footer
- Page renders without error

---

## NAVBAR

### Caregivers Dropdown
- Title: "For Professional Caregivers"
- Subtext: "You don't need another app. Build once. Be seen forever."
- Card 1: "Why Should I Build My Profile?" → /for-caregivers#why-build
- Card 2: "Browse Opportunities" → /opportunities
- Card 3: "Claim Your Profile" → /sign-up?role=caregiver&redirect_url=/profile/build
  - Gold left border 4px solid #C9973A (featured card)
- CTA button: "Claim Your Profile" → /profile/build
- Hover on all cards: translateY(-4px) + gold glow

### Agencies Dropdown
- Title: "Recruit Without the Legwork."
- Subtext: "We deliver interview-ready professionals with intelligent AI-powered matches."
- Card 1: "Join the Careified Network" → /agency/signup
- Card 2: "How It Works" → /for-agencies
- Card 3: "Try the Platform" → /demo
- CTA button: "Join the Careified Network" → /agency/signup
- NO secondary links (search/shortlist/clients/settings/billing/sitemap removed)
- Hover on all cards: translateY(-4px) + royal blue glow

### Families Dropdown
- Links to /for-families and /about present

### Auth Buttons (logged out)
- "Try Demo" → /demo
- "Sign in" → /sign-in
- "Get started" → /sign-up

### Auth Buttons (logged in)
- Profile strength link visible
- Data rights link visible
- Communications link visible
- Clerk UserButton visible

---

## AUTH PAGES

### /sign-in
- REACHABILITY: NAV auth button
- Clerk sign-in form renders
- redirect_url param respected after sign-in
- Caregiver role → /profile/build?step=0
- Agency role → /agency/dashboard

### /sign-up
- REACHABILITY: NAV "Get started" button
- Accepts ?role=caregiver and ?role=agency params
- Clerk sign-up form renders
- After sign-up → /onboarding

### /onboarding
- REACHABILITY: ACTION (post sign-up redirect)
- Detects role from Clerk metadata
- Caregiver → /profile/build
- Agency → /agency/signup or /agency/pending-approval

---

## CAREGIVER PAGES (Auth Required)

### /profile/build
- REACHABILITY: NAV (claim your profile CTA)
- Unauthenticated → redirect to /sign-in with redirect_url=/profile/build
- First visit (resumeParsed=false AND resumeSkipped=false) → ?step=0
- Returning visit → resumes at last completed step

### /profile/build?step=0
- REACHABILITY: ACTION (auto-redirect on first visit)
- Headline: "Let's build your profile"
- Subtext: "Upload your resume and we'll fill in your details automatically. Takes 2 minutes."
- Resume upload zone visible — drag/drop + click
- Accepts: PDF, DOC, DOCX — max 5MB
- On upload → spinner shows "Reading your resume..."
- On parse success → extracted fields listed with labels
- "Looks right — apply to profile" → saves fields → ?step=1
- "Skip" → saves resumeSkipped=true → ?step=1
- Parse error → error message + "Try another file" + "Continue without resume"

### /profile/build?step=1 through ?step=10
- REACHABILITY: ACTION (step navigation)
- Each step renders correct form fields per STEPS array
- Back button works on steps 2-10
- Continue button advances to next step
- Progress bar updates correctly per step
- Sidebar shows completed steps with gold checkmarks
- Locked steps (future steps) show at 0.4 opacity
- Submit button only active at step 10

### /profile/[id]
- REACHABILITY: DYNAMIC (from /agency/search results)
- Agency-facing scorecard renders
- Sections in order: Disclosure, Verification, Clinical, References,
  Availability, Scorecard, Working Style, Work History, Credentials,
  Open Questions, Disclaimer
- Hiring scorecard with 5 dimension bars visible
- Verified reference badges with ratings visible
- Non-recommender disclaimer present
- Red flag disclosure section present

### /profile/demo
- REACHABILITY: ACTION (from /for-caregivers#why-build)
- Demo page with Maria Santos renders
- Same scorecard layout as /profile/[id]

### /profile/strength
- REACHABILITY: ACTION (navbar user menu)
- Profile strength dashboard renders
- Completion percentage visible

### /opportunities
- REACHABILITY: NAV (caregivers dropdown) + /for-caregivers card
- Job feed renders
- Listings visible
- Auth required

### /settings/communications
- REACHABILITY: ACTION (navbar user menu)
- 6 consent types visible
- Toggle controls work

### /settings/data-rights
- REACHABILITY: ACTION (navbar user menu)
- Export data option present
- Delete data option present
- Auto-creates support ticket on request (PIPEDA requirement)

### /settings
- REACHABILITY: ACTION (some links point here)
- Redirects to /settings/communications

### /id/[caregiverId]
- REACHABILITY: SYSTEM (QR code / wallet link)
- Wallet ID card renders
- 3D flip animation works
- Apple Wallet structure present (needs Apple Developer account)

### /verify/[slug]
- REACHABILITY: SYSTEM (external verification link)
- Public page — no auth required
- Verification status renders

### /reference/[token]
- REACHABILITY: SYSTEM (email link to referee)
- Public page — no auth required
- Reference form renders
- All rating fields present

---

## AGENCY PAGES (Approved Agency Auth Required)

### /agency/signup
- REACHABILITY: NAV (agencies dropdown CTA)
- 4-step registration form renders
- Step 1-4 navigation works (Next/Back)
- Field-level validation errors display on empty submit
- On completion → /agency/pending-approval

### /agency/pending-approval
- REACHABILITY: ACTION (post agency signup)
- Waiting screen renders
- Status message visible — no dead end

### /agency/dashboard
- REACHABILITY: ACTION (post sign-in redirect for agency role)
- Action-first layout renders
- AI command bar visible and functional
- Quick links to: search, shortlist, clients, airecruit, settings, billing

### /agency/search
- REACHABILITY: ACTION (agency dashboard quick link)
- 20+ filters render
- 15 demo caregivers visible in results
- Match scoring visible on each card
- "Show all" option works
- Clicking caregiver → /profile/[id]

### /agency/shortlist
- REACHABILITY: ACTION (agency dashboard + navbar user area)
- Saved candidates list renders
- Empty state handled gracefully
- Remove from shortlist works

### /agency/clients
- REACHABILITY: ACTION (agency dashboard quick link)
- Client list renders (5 demo clients)
- "New client" button → /agency/clients/new

### /agency/clients/new
- REACHABILITY: ACTION (from /agency/clients)
- 8-section intake form renders
- All sections navigable
- On submit → creates client → /agency/clients

### /agency/clients/[id]
- REACHABILITY: DYNAMIC (from /agency/clients list)
- Client detail renders
- Ranked matches visible with scores
- Verify-in-call gaps listed
- Match gap analysis present

### /agency/clients/[id]/review
- REACHABILITY: DYNAMIC (from /agency/clients/[id])
- Review page renders

### /agency/airecruit
- REACHABILITY: ACTION (agency dashboard quick link)
- AIRecruit hub renders
- Active campaigns listed
- "New campaign" → /agency/airecruit/new

### /agency/airecruit/new
- REACHABILITY: ACTION (from /agency/airecruit)
- New campaign form renders
- Consent gate present before any call fires

### /agency/airecruit/[campaignId]
- REACHABILITY: DYNAMIC (from /agency/airecruit list)
- Campaign detail renders
- Calls list visible

### /agency/airecruit/[campaignId]/[callId]
- REACHABILITY: DYNAMIC (from campaign detail)
- Call transcript renders
- Scoring visible

### /agency/settings
- REACHABILITY: ACTION (agency dashboard quick link)
- Live-edit form renders
- Branding section present
- Service areas section present
- Team section present
- Compliance section present
- Changes save on blur

### /agency/billing
- REACHABILITY: ACTION (agency dashboard quick link)
- Module pricing placeholder renders
- Support link present (⚠️ /agency/support page not yet built)

### /agency/sitemap
- REACHABILITY: ACTION (admin only)
- All agency pages listed by access level

---

## DEMO PAGES (Email + Phone Gate — No Auth)

### /demo/gate
- REACHABILITY: ACTION (auto-redirect from all /demo/* pages when not unlocked)
- Headline: "See Careified in Action"
- Subtext: "Enter your details to access the live demo."
- Email field renders with Mail icon
- Phone field renders with Phone icon
- Submit button disabled until both fields valid
- Invalid email → inline error message
- Invalid phone (not 10 digits) → inline error message
- On success → sessionStorage demo_unlocked=true → /demo
- Fine print: "We'll never spam you."

### /demo
- REACHABILITY: NAV (agencies dropdown "Try the Platform")
- Gate check: sessionStorage demo_unlocked !== 'true' → /demo/gate
- Demo landing renders with feature tour
- Demo banner: "You are in demo mode"
- CTA: "Start your free 30-day trial" → /agency/signup

### /demo/dashboard
- REACHABILITY: ACTION (from /demo)
- Gate check on load → /demo/gate if not unlocked
- Agency dashboard with pre-loaded demo data renders
- Demo banner visible

### /demo/search
- REACHABILITY: ACTION (from /demo)
- Gate check on load
- Search with 15 demo caregivers renders
- Demo banner visible

### /demo/clients
- REACHABILITY: ACTION (from /demo)
- Gate check on load
- 5 demo clients render
- Demo banner visible

### /demo/clients/[id]
- REACHABILITY: DYNAMIC (from /demo/clients)
- Gate check on load
- Client detail with match results renders
- Demo banner visible

---

## ADMIN PAGES (ADMIN_CLERK_USER_ID Only)

### /admin
- REACHABILITY: SYSTEM (direct URL — admin only)
- Auth check: must match ADMIN_CLERK_USER_ID env var ❌ NOT YET ENFORCED
- Metrics dashboard renders
- Live DB counts visible
- Agency list visible
- Quick links to all admin sub-pages

### /admin/agencies
- REACHABILITY: ACTION (from /admin quick links)
- Auth check required ❌ NOT YET ENFORCED
- Full agency list renders
- CRUD controls present
- Module control visible
- Detail panel opens on row click

### /admin/agencies/[id]
- REACHABILITY: DYNAMIC (from /admin/agencies)
- Auth check required ❌ NOT YET ENFORCED
- PATCH status works
- PATCH modules works

### /admin/caregivers
- REACHABILITY: ACTION (from /admin quick links)
- Auth check required ❌ NOT YET ENFORCED
- Caregiver list renders
- No dangerouslySetInnerHTML ❌ CURRENTLY PRESENT (line 217)

### /admin/status
- REACHABILITY: ACTION (from /admin)
- Live DB data renders
- Env var check visible
- Architecture Audit tab present
- Build tracker visible

### /admin/sitemap
- REACHABILITY: ACTION (from /admin)
- All pages listed by access level

### /admin/badges
- REACHABILITY: ACTION (from /admin quick links — fixed May 4)
- Badges management renders

### /admin/reviews
- REACHABILITY: ACTION (from /admin quick links — fixed May 4)
- Reviews management renders

### /admin/references
- REACHABILITY: ACTION (from /admin quick links — fixed May 4)
- References management renders

---

## API ROUTES

### POST /api/profile/save-field
- Accepts: field name + value
- Auth required
- Saves to DB for authenticated caregiver
- Returns 200 on success

### GET /api/profile/load
- Auth required
- Returns: { exists: boolean, data: object }
- Returns all saved profile fields for caregiver

### POST /api/profile/parse-resume
- Accepts: multipart file upload
- Sends to OpenRouter/Mistral for parsing
- Returns: { firstName, lastName, email, phone, city,
  yearsExperience, jobTitle, services }
- Max file size: 5MB

### POST /api/match/rank
- Accepts: client need object
- Returns: ranked caregivers array with scores
- 7-dimension scoring applied
- Hard gates applied before ranking

### POST /api/references/invite
- Auth required (agency)
- Creates reference_verification_requests record
- Generates token ❌ NOT UUID YET
- Sends invite email

### POST /api/airecruit/webhook
- Accepts: Vapi webhook payload
- ❌ No HMAC signature verification yet
- Processes call completion data

### GET /api/qa/health (NOT YET BUILT)
- Returns: DB status, Clerk status, Vapi status,
  OpenRouter status, env var check

---

## ENV VARS

| Var | Required | Status |
|-----|----------|--------|
| DATABASE_URL | Yes | ✅ Set |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Yes | ✅ Set (dev keys) |
| CLERK_SECRET_KEY | Yes | ✅ Set (dev keys) |
| NEXT_PUBLIC_LOCALE | Yes | ❌ Missing from Vercel |
| OPENROUTER_API_KEY | Yes | ✅ Set |
| PHI_ENCRYPTION_KEY | Yes | ✅ Set |
| VAPI_API_KEY | Yes | ✅ Set |
| VAPI_ASSISTANT_ID | Yes | ✅ Set |
| ADMIN_CLERK_USER_ID | Yes | ✅ Set |
| NEXT_PUBLIC_CLARITY_ID | Yes | ⚠️ Add to Vercel |
| NEXT_PUBLIC_YBUG_ID | Yes | ⚠️ Add to Vercel |

---

## DATABASE TABLES

| Table | Status | Notes |
|-------|--------|-------|
| caregivers | ✅ Live | 15 demo records |
| agencies | ✅ Live | 9 records |
| caregiver_certifications | ✅ Live | |
| caregiver_references | ✅ Live | |
| caregiver_attributes | ✅ Live | Empty — graceful fallback |
| caregiver_communication_consents | ✅ Live | |
| client_needs | ✅ Live | 5 demo clients |
| match_scores | ✅ Live | |
| reference_verification_requests | ✅ Live | |
| audit_log | ✅ Live | |
| demo_leads | ❌ Not built | Capture demo gate submissions |
| support_tickets | ❌ Not built | Ticketing system |
| ticket_messages | ❌ Not built | Ticketing system |
| promo_codes | ❌ Not built | Promotions system |

---

## COMPONENTS — REACHABILITY CHECK

| Component | Import Count | Status |
|-----------|-------------|--------|
| components/ui/Button.tsx | 29 | ✅ Used |
| components/ui/Card.tsx | 92 | ✅ Used |
| components/ui/Tooltip.tsx | 14 | ✅ Used |
| components/profile/GhostProfileModal.tsx | 3 | ✅ Used |
| components/profile/MobilePreviewToggle.tsx | 1 | ✅ Used |
| components/id/QRCodeDisplay.tsx | ? | ⚠️ Verify import |
| components/profile/LiveProfilePreview.tsx | ? | ⚠️ Verify import |
| components/profile/TravelRadiusMap.tsx | ? | ⚠️ Verify import |

---

## FEATURES NOT YET BUILT (Queued)

| Feature | Priority | Notes |
|---------|----------|-------|
| Ticketing system | HIGH | /support, /admin/tickets |
| middleware.ts | CRITICAL | Auth protection |
| Admin auth enforcement | CRITICAL | ADMIN_CLERK_USER_ID check |
| Demo gate (email+phone) | HIGH | /demo/gate + all /demo/* |
| for-agencies page rebuild | HIGH | Prompt ready |
| AIRecruit Session B | MEDIUM | Reference calls consent |
| AIRecruit Session C | MEDIUM | Profile analysis |
| AIRecruit Session D | LOW | SMS, retry, cron |
| Rating system | LOW | Post-placement |
| Family portal Phase 1 | LOW | PWA |
| Upload photo API | MEDIUM | |
| /api/qa/health endpoint | MEDIUM | Live health monitor |
| /admin/qa dashboard | MEDIUM | Full QA dashboard |
| Stripe + billing | HIGH | Pre-launch |
| Clerk production keys | CRITICAL | Pre-launch |
| SSL cert Render DB | HIGH | Pre-launch |

---

## RESOLVED ISSUES

| Issue | Fixed | Date |
|-------|-------|------|
| Agency signup silent validation failures | ✅ | May 4 2026 |
| LiveProfilePreview not built | ✅ | May 4 2026 |
| TravelRadiusMap not built | ✅ | May 4 2026 |
| Demo environment not built | ✅ | May 4 2026 |
| Orphan pages: admin/badges, reviews, references | ✅ | May 4 2026 |
| Agency dashboard not linked | ✅ | May 4 2026 |
| for-caregivers page copy + cards | ✅ | May 5 2026 |
| Navbar caregiver dropdown updated | ✅ | May 5 2026 |
| Navbar agency dropdown updated | ✅ | May 5 2026 |
| Clarity + Ybug scripts added | ✅ | May 5 2026 |
| Consent UI redesign - remove risk badges | ✅ | May 7 2026 |
| Step 11 consent added to profile builder | ✅ | May 7 2026 |
| Working style tag engine built | ✅ | May 7 2026 |
| Step7 live working style preview | ✅ | May 7 2026 |
| WorkingStyleTags reusable component | ✅ | May 7 2026 |
| Profile scorecard shows working style tags | ✅ | May 7 2026 |
| Profile builder crash fix (undefined title) | ✅ | May 7 2026 |
| Ybug script URL corrected | ✅ | May 7 2026 |
| End-of-session QA protocol expanded | ✅ | May 7 2026 |