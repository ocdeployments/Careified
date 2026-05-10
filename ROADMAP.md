# ROADMAP.md — Careified Build Roadmap
# Purpose: Phased build plan, weekly schedule, scope gates, and feature parking lot
# Updated: May 9 2026
# Update trigger: Every session — tick completed items, add new features discovered
# Owner: Both
# DO NOT DUPLICATE: Page specs (CAREIFIED_SPEC.md), build status (CAREIFIED_STATUS.md)

## NORTH STAR

Careified is to home care what Uber was to taxis and 
Airbnb was to hotels — it didn't improve the old system, 
it replaced it.

Soft launch: June 15 2026
Two test agencies: Ontario CA + Texas US
Model: Two-sided revenue (agencies + caregiver tiers)

---

## PHASE OVERVIEW

| Phase | Name | Target | Focus |
|-------|------|--------|-------|
| 1 | Recruit & Roster | June 15 2026 | Core platform, agency roster, AIRecruit |
| 2 | Operate & Communicate | August 2026 | Family portal, WhatsApp notifications, caregiver tiers |
| 3 | Full AI Intelligence | October 2026 | Two-way AI assistant, family check-ins, retention AI |
| 4 | Platform & Integrations | 2027 | Alayacare, ClearCare, API marketplace, enterprise |

---

## PHASE 1 — RECRUIT & ROSTER
### Target: June 15 2026 (37 days)
### Goal: Two agencies live, real caregivers being added, 
###        core loop working end to end

### MUST SHIP — no negotiation
These ship or we do not launch:

AGENCY SIDE
- [ ] Agency signup + approval flow ✅ built
- [ ] Agency dashboard — click-click-done ✅ built
- [ ] Caregiver search with 20+ filters ✅ built
- [ ] Match scoring visible on results ✅ built
- [ ] Shortlist management ✅ built
- [ ] Agency Roster — agency builds caregiver profiles on their behalf ❌ not built
- [ ] CSV caregiver import — agency uploads existing roster ❌ not built
- [ ] Pipeline status on shortlisted caregivers (5 stages) ❌ not built
  Stages: Discovered → Contacted → Interviewing → Placed → Inactive
- [ ] Caregiver contact info visible to approved agencies ❌ not built
- [ ] Demo gated behind agency signup ❌ fix today
- [ ] Multi-user agency accounts (coordinator + owner) ❌ not built
- [ ] Locale column added to caregivers + agencies tables ❌ not built
- [ ] CA/US data scoping enforced in all DB queries ❌ not built

CAREGIVER SIDE
- [ ] Profile builder Steps 0-11 ✅ built
- [ ] Caregiver claims agency-built profile ❌ not built
- [ ] Profile visible in search after Step 3 ✅ built
- [ ] Verify slug and ID card ✅ built
- [ ] "You're now live in search" banner after Step 3 ❌ not built
- [ ] Profile view notification (in-app) ❌ not built

AI RECRUIT
- [ ] Outbound screening calls ✅ built
- [ ] TCPA/CRTC compliance ✅ built
- [ ] Scoring and transcript ✅ built
- [ ] Campaign UI ✅ built

PLATFORM
- [ ] careified.ca domain purchased and pointed to Vercel ❌ not done
- [ ] careified.com domain purchased and pointed to Vercel ❌ not done
- [ ] Locale scoping — CA data never visible to US ❌ needs locale column
- [ ] No placeholder copy anywhere ❌ copy session needed
- [ ] Clerk production keys ❌ critical
- [ ] SSL cert Render DB ✅ conditional fix done
- [ ] Admin auth enforced ✅ fixed
- [ ] XSS fix ✅ fixed
- [ ] SQL injection fix ✅ fixed
- [ ] Rate limiting ✅ fixed
- [ ] Gold hex #C9973A consistent across all files ❌ 30 files still wrong
- [ ] GitHub branch protection enabled on main ❌ not done
- [ ] Both test agencies onboarded before June 15 ❌ not done

### SHOULD SHIP — if time allows
- [ ] Basic email notifications (shortlist alert to agency)
- [ ] Profile completion nudge email to caregiver
- [ ] Agency billing placeholder with "contact us"
- [ ] Basic analytics (profile views, search count)
- [ ] QuickFill Basic — in-app shift blast
      (notify matched caregivers of urgent shift openings)

### WILL NOT SHIP — phase 2
- WhatsApp/Telegram AI assistant
- Family portal
- Caregiver payment tiers
- Rating system
- Ticketing system
- Stripe live billing
- Background check integration
- Reference AI calls

---

## PHASE 1 — WEEKLY BUILD PLAN

### WEEK 1: May 9-16 — Fix & Foundation
Monday May 9
- [ ] Demo gate → /agency/signup (navbar fix) 
- [ ] FOUNDER.md created
- [ ] SOUL.md updated with all 33 lenses
- [ ] All .md docs synced with vision
- [ ] ROADMAP.md created (this file)

Tuesday May 13
- [ ] Agency Roster — data model + API
- [ ] Agency can create caregiver stub profile
- [ ] Caregiver notified to claim profile

Wednesday May 14
- [ ] CSV caregiver import
- [ ] Agency uploads roster, stubs created in bulk

Thursday May 15
- [ ] Caregiver contact info visible to approved agencies
- [ ] Pipeline status on shortlisted caregivers (5 stages)

Friday May 16
- [ ] Gold hex fix across 30 files
- [ ] TypeScript clean
- [ ] Week 1 review — what slipped, what accelerated

### WEEK 2: May 17-23 — Agency Workflow
- [ ] Multi-user agency accounts
- [ ] Agency dashboard click-click-done audit
- [ ] Locale column added to caregivers + agencies tables
- [ ] CA/US data scoping enforced in queries
- [ ] careified.ca domain pointed to Vercel
- [ ] careified.com domain pointed to Vercel

### WEEK 3: May 24-30 — Caregiver Experience  
- [ ] Caregiver claims agency-built profile flow
- [ ] Mobile experience audit — PSW on phone test
- [ ] Profile completion nudge emails
- [ ] Empty states — every blank screen has message + CTA
- [ ] Error states — every error has recovery path

### WEEK 4: May 31 - Jun 6 — Trust & Copy
- [ ] Copy session — every placeholder replaced
- [ ] Landing page rewrite — 5 second value prop
- [ ] For-agencies page rewrite
- [ ] For-caregivers page rewrite
- [ ] Verification badges explained clearly
- [ ] PIPEDA/HIPAA compliance language visible
- [ ] Pricing page — "contact us" minimum

### WEEK 5: Jun 7-14 — Launch Prep
- [ ] Clerk production keys upgraded
- [ ] Both test agencies onboarded
- [ ] Canadian agency account created on careified.ca
- [ ] Texas agency account created on careified.com
- [ ] First caregiver profiles seeded (agency roster)
- [ ] AIRecruit test call completed end to end
- [ ] Full regression test — every page, every flow
- [ ] June 15 go/no-go checklist reviewed
- [ ] Rollback plan confirmed

### JUNE 15 — SOFT LAUNCH DAY
- [ ] Both agencies live and active
- [ ] Real caregivers on platform
- [ ] First AI screening call completed
- [ ] No placeholder copy anywhere
- [ ] No critical security issues open
- [ ] Monitoring active (Clarity, error tracking)

---

## PHASE 2 — OPERATE & COMMUNICATE
### Target: August 2026
### Goal: Agencies run daily operations from platform.
###        Caregivers paying for premium features.

### Feature List
FAMILY PORTAL (Phase 1)
- [ ] Schedule view
- [ ] Live shift tracker (timestamps, no GPS)
- [ ] Care notes feed
- [ ] Caregiver profile card
- [ ] Wellness dashboard (mood, appetite, mobility, sleep)
- [ ] Agency messaging only
- [ ] Billing visibility
- [ ] Notification preferences
- [ ] PWA — no app download required
- [ ] Agency branded

CAREGIVER TASK CHECKLIST
- [ ] Caregiver logs arrival/departure timestamps
- [ ] Task checklist per shift (medications, meals, hygiene)
- [ ] Observations feed — caregiver notes visible to family + agency
- [ ] Family sees checklist in real time

WHATSAPP NOTIFICATIONS (one-way first)
- [ ] Agency: new caregiver match alert
- [ ] Agency: reference call completed
- [ ] Caregiver: new shortlist notification
- [ ] Caregiver: profile view count
- [ ] Caregiver: credential expiry reminder
- [ ] Family: caregiver arrived/departed

QUICKFILL — INSTANT SHIFT DISPATCH
- [ ] Agency creates shift blast (date, time, area, requirements)
- [ ] System filters eligible caregivers automatically
- [ ] Blast sent via WhatsApp + SMS + in-app simultaneously
- [ ] Caregiver responds YES/NO via WhatsApp reply
- [ ] Live response dashboard for agency coordinator
- [ ] AI Recruiter calls YES responders to confirm
- [ ] Shift auto-assigned on confirmation
- [ ] Other caregivers notified when filled
- [ ] Family notified of confirmed caregiver
- [ ] Response data feeds reliability score
- [ ] Opt-in: match_time_calls consent type
- [ ] DB tables: shift_blasts, blast_responses
- [ ] Feature name: QuickFill

CAREGIVER TIER SYSTEM
- [ ] Free tier (current behaviour)
- [ ] Professional $9.99 CAD/mo
  - Profile analytics (views, shortlists)
  - WhatsApp notifications
  - Placement alerts
  - Priority in search results
- [ ] Elite $19.99 CAD/mo
  - Everything in Professional
  - AI career assistant (WhatsApp)
  - Direct agency messaging
  - Credential expiry reminders
  - Profile strength coaching
- [ ] Stripe subscription billing for caregivers

AGENCY TIER ENFORCEMENT
- [ ] Starter tier gates enforced (20 caregiver roster limit)
- [ ] Growth tier unlocks AIRecruit + family portal
- [ ] Scale tier unlocks unlimited + white label
- [ ] Stripe billing live for agencies

---

## PHASE 3 — FULL AI INTELLIGENCE
### Target: October 2026
### Goal: AI runs the routine. Humans handle the exceptions.

### Feature List
AI AGENCY ASSISTANT (two-way WhatsApp/Telegram/SMS)
- [ ] Natural language caregiver search via WhatsApp
- [ ] Shortlist management via chat
- [ ] Reference call triggers via chat
- [ ] Schedule updates via chat
- [ ] Daily digest — who's working, any issues, action needed
- [ ] Telegram bot mirror of WhatsApp features

AI CAREGIVER ASSISTANT (WhatsApp)
- [ ] Late arrival notification → auto-notifies family + agency
- [ ] Sick call → finds replacement, notifies all
- [ ] Match alerts → new opportunities with details
- [ ] Credential reminders → renewal nudges
- [ ] Career coaching → profile improvement suggestions

AI FAMILY CHECK-INS (outbound calls)
- [ ] Scheduled check-in calls to families
- [ ] Schedule change capture → updates system → notifies all
- [ ] Wellness check → flags concerns to agency
- [ ] Satisfaction survey → feeds retention signals

PROACTIVE RETENTION AI
- [ ] 2-week placement check-in call to caregiver
- [ ] Early churn signal detection
- [ ] Agency notified before caregiver disappears
- [ ] Re-engagement sequence for dormant caregivers

AIRECRUIT EXPANSION
- [ ] Reference calls (Session B)
- [ ] Past employer verification calls (Session C)
- [ ] SMS + retry logic + cron (Session D)
- [ ] Bulk campaign management

---

## PHASE 4 — PLATFORM & INTEGRATIONS
### Target: 2027
### Goal: Careified becomes the infrastructure layer 
###        other software connects to

### Feature List
INTEGRATIONS
- [ ] Alayacare API integration (Canada)
- [ ] ClearCare/WellSky API integration (US)
- [ ] Checkr background check integration
- [ ] Persona/Didit identity verification
- [ ] Hireology integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync

API MARKETPLACE
- [ ] Public API documentation
- [ ] Agency API access (Enterprise tier)
- [ ] Webhook subscriptions for third-party apps
- [ ] Developer portal

ENTERPRISE
- [ ] Custom domains per agency
- [ ] White label mobile app
- [ ] Dedicated support SLA
- [ ] Custom integrations
- [ ] Volume pricing

EXPANSION
- [ ] Florida market (US)
- [ ] New York market (US)
- [ ] BC market (Canada)
- [ ] Alberta market (Canada)

---

## SCOPE GATES

### Phase 1 scope gate (enforced until June 15)
If a feature request comes in that is not on the 
Phase 1 MUST SHIP list — do this:

1. Log it in the Phase 2 or 3 list above
2. Tell Romy: "This is Phase 2 — logging it for August"
3. Do not build it unless Romy explicitly overrides

The only exception: a test agency asks for something 
that would make them not use the platform.
That becomes Phase 1 immediately.

### Scope creep rule
Every new feature request costs time from something else.
Before adding to Phase 1 — what gets removed?
Romy decides. Claude flags the tradeoff.

---

## GO/NO-GO CRITERIA — JUNE 15

All of these must be true to launch:

TECHNICAL
- [ ] TypeScript zero errors
- [ ] No critical security issues open
- [ ] Clerk production keys live
- [ ] careified.ca resolves correctly
- [ ] careified.com resolves correctly
- [ ] All placeholder copy replaced
- [ ] Mobile experience tested on real phone

AGENCY SIDE
- [ ] Canadian test agency can sign up end to end
- [ ] Texas test agency can sign up end to end
- [ ] Both agencies can search and shortlist caregivers
- [ ] Agency Roster working — agency can add caregiver
- [ ] Caregiver can claim agency-built profile

AI
- [ ] AIRecruit test call completes end to end
- [ ] Transcript and score visible after call
- [ ] Consent gate works before any call fires

TRUST
- [ ] Non-recommender disclaimer on every profile
- [ ] Verification tiers visible and explained
- [ ] Contact info visible to approved agencies only
- [ ] PIPEDA/HIPAA language present

---

## FEATURE PARKING LOT
Ideas that came up but are not in any phase yet.
Review monthly.

- Caregiver community forum / peer support
- Agency coordinator mobile app (native)
- Background check embedded in profile builder
- Insurance certificate upload and verification
- Payroll integration (Wagepoint, Nethris)
- Client family NPS survey post-placement
- Caregiver of the month recognition
- Agency leaderboard (best retention rates)
- Referral reward program (agency refers agency)
- PSW training program partnerships (George Brown etc)
- QuickFill Full (Phase 3) — AI auto-dispatch,
   auto-schedule, family notification,
   reliability scoring from response patterns

---

Last updated: May 9 2026
Next review: May 16 2026 (end of Week 1)
