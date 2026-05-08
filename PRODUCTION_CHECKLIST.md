# PRODUCTION_CHECKLIST.md
# Careified — Production Readiness Tracker
# Created: May 8 2026
# Rule: Review at START of every session. Update at END of every session.
# Rule: One checkbox per item. Check off only when verified live — not just committed.

---

## 🔴 CRITICAL — Launch Blockers

### Security
- [ ] Admin pages auth enforcement — ADMIN_CLERK_USER_ID check on all /admin/* routes
- [ ] Clerk production keys — upgrade pk_test_ → pk_live_ in Vercel + .env.local
- [ ] SSL cert Render DB — set rejectUnauthorized: true in production
- [ ] Vapi webhook HMAC signature verification — lib/airecruit/vapi.ts
- [ ] Rate limiting — all registration + reference + AI API routes
- [ ] UUID reference tokens — app/api/references/invite/route.ts
- [ ] SQL injection fix — lib/db.ts lines 56-68 (validate keys against column allowlist)
- [ ] Remove dangerouslySetInnerHTML — app/admin/caregivers/page.tsx line 217

### Legal / Compliance
- [ ] Lawyer review lib/legal/text.ts
- [ ] All page copy written — currently all placeholder
- [ ] Privacy policy finalized and lawyer-approved
- [ ] Terms of service finalized and lawyer-approved
- [ ] PIPEDA data rights flow tested end-to-end (export + delete, 30-day SLA)
- [ ] E&O insurance in place
- [ ] Cyber liability insurance in place
- [ ] General liability insurance in place
- [ ] NEXT_PUBLIC_LOCALE=CA added to Vercel env vars

### Infrastructure
- [ ] SSL cert for Render DB (rejectUnauthorized: true)
- [ ] Incident response runbook written
- [ ] Render PostgreSQL daily backups confirmed enabled
- [ ] DB restore procedure documented and tested
- [ ] Uptime monitoring configured (Render + Vercel)
- [ ] Error tracking configured (Sentry — SENTRY_DSN env var)
- [ ] Staging environment created (separate Vercel project + DB)

---

## 🟠 HIGH — Must Build Before Launch

### Missing Features
- [ ] Ticketing system — /support, /admin/tickets, /agency/support, /caregiver/support
- [ ] Rating system — placement_reviews table, agency form, admin queue, badges, profile strength display
- [ ] Photo upload API — /api/profile/upload-photo (Step 1 has no actual upload endpoint)
- [ ] Demo gate — /demo/gate (email + phone capture before demo access)
- [ ] demo_leads DB table — capture and store demo gate submissions
- [ ] Stripe integration — PAYMENTS_ENABLED=false currently, no revenue collection
- [ ] Module pricing confirmed and wired to Stripe

### Broken Links (404s)
- [ ] /agency/support — linked from /agency/billing, page not built
- [ ] /settings — no index page, linked from multiple places
- [ ] /profile/start — linked in /for-caregivers, should be /profile/build

### AIRecruit
- [ ] Session B — consent flow for reference_calls, regulatory_calls, match_time_calls
- [ ] Session C — reference agent, profile analysis, campaign from profiles
- [ ] Session D — SMS, retry logic, cron jobs, bulk actions

---

## 🟡 MEDIUM — Important, Not Blocking

### UX Debt
- [ ] Agency signup — highlight required fields red on submit, scroll to first error, inline errors
- [ ] Agency signup — phone field silently rejects invalid numbers (show error instead)
- [ ] Gold hex inconsistency — audit and standardise #C9973A vs #C9A84C across all files
- [ ] Agency card copy — fix non-recommender liability language ("screens candidates" / "delivers interview-ready professionals")
- [ ] Profile builder — add completion celebration / confirmation at Step 10
- [ ] Demo pages — add guided tour / step-by-step walkthrough
- [ ] Mobile responsiveness audit — all 36 pages

### Data Integrity
- [ ] PHI encryption migration — columns currently plain text, need AES-256-GCM before launch
- [ ] aggregate_score wiring — CTS engine exists but not triggered by anything
- [ ] caregiver_attributes table seeding — empty, graceful fallback exists

### Performance
- [ ] Image optimization pipeline for caregiver photos
- [ ] Leaflet lazy loading — only load on location pages
- [ ] Match ranking API caching — expensive query, no cache strategy
- [ ] Pagination on /agency/search — currently loads all records, won't scale

### Missing DB Tables
- [ ] demo_leads
- [ ] support_tickets + ticket_messages
- [ ] promo_codes + promo_redemptions
- [ ] placement_reviews (check if migration ran from today's session)

---

## 🔵 DESIGN & UX POLISH

### Typography
- [ ] Complete Inter → DM Serif Display + DM Sans migration across all components
- [ ] Enforce consistent heading scale (48px page / 26px section / 20px card)
- [ ] Standardise letter-spacing on headlines (-0.02em everywhere)

### Layout
- [ ] Standardise card padding (24px mobile / 40px desktop)
- [ ] Standardise section vertical spacing (80px mobile / 120px desktop)
- [ ] Lock three-column profile builder ratios (sidebar / form / preview)
- [ ] Audit and fix mobile nav dropdowns

### Components
- [ ] Star rating inputs — replace select fields with clickable gold stars
- [ ] Toast/notification system — save confirmations, errors, success states
- [ ] Loading skeleton states — all data-fetching pages
- [ ] Empty states — shortlist (0 saved), search (0 results), clients (0 clients), reviews (0 reviews)
- [ ] Form field focus states — gold ring (#C9973A) consistent on all inputs

### Micro-interactions
- [ ] Profile builder step transitions — Framer Motion animate in/out
- [ ] Step completion success animation
- [ ] IDCardReveal 3D flip — test and fix on mobile
- [ ] Progress bar animation on step advance

### Brand Consistency
- [ ] Audit all CTA buttons — linear-gradient(135deg, #C9973A, #E8B86D) consistent
- [ ] Standardise card hover — translateY(-2px) default, -4px featured cards only
- [ ] Document footer (#080F1E) vs nav (#0D1B3E) as intentional in design system

---

## 🟢 OPERATIONAL — Post-Launch Readiness

### Monitoring
- [ ] Sentry error tracking — instrument Next.js app, add SENTRY_DSN to Vercel
- [ ] Vercel Analytics — enable in Vercel dashboard
- [ ] Microsoft Clarity — confirm NEXT_PUBLIC_CLARITY_ID set in Vercel
- [ ] Render PostgreSQL slow query log enabled
- [ ] Uptime monitor on careified.vercel.app (Better Uptime or similar)
- [ ] Status page live (statuspage.io or similar)

### Analytics
- [ ] Funnel tracking: caregiver profile completion rate per step
- [ ] Funnel tracking: agency signup conversion rate
- [ ] Funnel tracking: demo → signup conversion rate
- [ ] Event tracking: shortlist adds, AIRecruit launches, step completions

### Support Infrastructure
- [ ] In-platform chat widget (Intercom or Crisp) for agency support
- [ ] Public changelog page or widget
- [ ] Help center / FAQ (minimum 10 articles before launch)

### US Expansion (post-CA launch)
- [ ] US Vercel deployment — second project, NEXT_PUBLIC_LOCALE=US
- [ ] Apple Developer account ($99/yr) for Wallet passes
- [ ] US demo caregivers seeded (TX, FL, NY)
- [ ] US demo clients seeded

---

## 📅 RECOMMENDED LAUNCH SEQUENCE

### Week 1 — Security hardening
- Admin auth, Clerk prod keys, SSL, Vapi HMAC, rate limiting, UUID tokens, SQL fix, XSS fix

### Week 2 — Legal & compliance
- Lawyer review, copy session, PIPEDA flow, ticketing system

### Week 3 — Revenue
- Stripe integration, module pricing, billing page, demo gate + lead capture

### Week 4 — Feature completion
- Rating system finish, photo upload API, AIRecruit Session B, broken link fixes

### Week 5 — Polish & monitoring
- Typography + spacing audit, mobile pass, empty states + skeletons, Sentry + analytics, staging env

### Week 6 — Soft launch
- Onboard first 5 agencies manually
- Invite first 50 caregivers
- Monitor, fix, iterate

---

## SESSION LOG

| Date | Items Checked Off | Items Added |
|------|------------------|-------------|
| May 8 2026 | — | Initial checklist created |

---
_Update this table at the end of every session._