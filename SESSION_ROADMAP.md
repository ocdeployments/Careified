# SESSION_ROADMAP.md — Careified

> Last updated: April 16 2026 — Session 8D Complete + Family Portal spec added

---

## Completed Sessions

| Session | What was built | Key commits |
|---------|----------------|-------------|
| 1–6F | Search, profile builder, DB seeding, profile display | — |
| 7 | Clerk v7 auth — full integration | 9aa73c2 |
| 7B | Shortlist — agency_shortlist table, API, UI | — |
| 8B | Admin approval flow — /admin/agencies | — |
| 8C | Role-locked signup — role param in sign-up URL | 9488380, ba4b49f, edc2fe0 |
| 8D | Sign-in role-redirect — /api/auth/role-redirect | 00909d3, 45749bc, 4cf0609, acdca6a |
| 9B | Caregiver ID system — CRF codes, QR, Apple Wallet scaffold | — |

---

## Current State

### What works

- ✅ Full auth flow: signup → role assignment → approval gating → search
- ✅ 15 approved demo caregivers in DB
- ✅ 9 agencies in DB (seeded have clerk_user_id=null)
- ✅ Agency search at `/agency/search` — 20+ filters, approval-gated
- ✅ Caregiver profile display at `/profile/[id]`
- ✅ Profile builder 6 steps — all saving to DB
- ✅ Shortlist at `/agency/shortlist`
- ✅ Admin approval at `/admin/agencies`
- ✅ Caregiver ID cards at `/id/[caregiverId]`, verify at `/verify/[slug]`
- ✅ TypeScript clean, working tree clean

### What is broken/missing

- ❌ All page copy is placeholder/wrong framing
- ❌ No design system applied consistently
- ❌ Navbar needs three-panel hover nav (agency/caregiver/family)
- ❌ Landing page needs full design pass (Session 8A)
- ❌ No personality assessment (Step 7 — Session 9A)
- ❌ No rating system (Session 10)
- ❌ No family portal (Sessions 11–13)

---

## Session 8A — Landing Page Design Pass (NEXT)

### Goals

- DM Serif Display + DM Sans typography
- Three-panel hover nav (agency / caregiver / family)
- Mobile-first — hamburger drawer on small screens
- Hero with subtle grid texture
- Animated stats strip on scroll
- Role cards for three audiences
- Inline styles only (no Tailwind classes that break in prod)
- Profile builder step transitions (slide in/out)
- ID card reveal moment at profile completion

### Rules

- One file per commit
- No new packages
- `tsc --noEmit` before every commit

---

## Session 9A — Personality Step 7

7 forced-choice scenario questions:

1. **Patience** — dementia repetition
2. **Empathy** — family emotional subtext
3. **Adaptability** — unexpected care plan change
4. **Communication** — end-of-shift observation
5. **Emotional Regulation** — angry family member
6. **Problem Solving** — medication refusal
7. **Resilience** — client death/grief

Each answer → style label + base score (4.0 natural / 3.0 effort-based)

- Saves to `personality_profile` JSONB
- Personality & Fit tab on `/profile/[id]`

---

## Session 10 — Rating System

- **10A:** Agency rating form — 6 categories, engagement dates required
- **10B:** Trust score engine — weighted recalc, recency decay
- **10C:** Honesty scoring — agency vs self-assessment, badge awards

---

## Session 11 — Family Portal Phase 1

### What

- Schedule view + caregiver profile card + notification prefs
- Access: Agency enables per client → unique invite link → PWA, no app download
- Auth: Email + password, family role
- Visual: Amber tone, calm, warm, low data density

### New DB tables needed

- `clients` — id, agency_id, name, care_plan_summary
- `client_family_access` — id, client_id, email, token, enabled_by_agency
- `shifts` — id, client_id, caregiver_id, scheduled_start, scheduled_end, status

### Routes

- `/family/[token]` — login gate
- `/family/[token]/schedule` — calendar
- `/family/[token]/caregiver` — profile card
- `/family/[token]/notifications` — prefs

### Feature 1 — Schedule View

- Monthly/weekly calendar of upcoming visits
- Each visit: date, time, caregiver name + photo, care type
- Status: Upcoming / In Progress / Completed / Missed (icon-based, no emojis)
- Shift changes → notification + reason
- Recurring vs one-off distinguished

### Feature 4 — Caregiver Profile Card

- Photo + first name (last name per agency policy)
- Short bio, verified cert badges, years experience
- Aggregate trust score, "Assigned since" date
- Caregiver change → family notified with new card

### Feature 8 — Notifications Phase 1 (email only)

- Shift completed
- Visit changed/cancelled
- Care plan updated

---

## Session 12 — Family Portal Phase 2

Requires: Caregiver PWA with check-in/out button

### Feature 2 — Live Shift Tracker

- Start Shift tap → "Maria arrived at 9:04 AM" to family
- End Shift tap → "Maria completed shift at 12:32 PM"
- Late alert: no check-in within 15 min → "Running Late" to family + agency
- Timestamp only — no GPS

### Feature 3 — Care Notes Feed

- Post-shift structured note (target: under 3 min, voice-to-text supported):
  - Tasks checklist (done / not done + reason)
  - Mood indicator — 5 states, icon-based (no emojis)
  - Meals (yes / partial / refused)
  - Medications (confirmed / declined)
  - Observations free text (50 words max)
- Concerns flagged → visible to family AND agency
- Chronological feed, scrollable, searchable.

### Feature 5 — Wellness Summary Dashboard

- Shift attendance rate ("23 of 24 visits completed")
- 30-day mood trend chart
- Task completion % per week
- Nutrition log per visit
- Caregiver consistency % — key trust metric for families

### Feature 8 additions — Push + SMS

- Caregiver checked in: Push / Email / SMS
- Shift completed + notes ready: Push / Email
- Caregiver running late: Push + SMS (always on)
- Concern flagged: Push + SMS (always on)

---

## Session 13 — Family Portal Phase 3

### Feature 6 — Message Agency (Never Caregiver)

- In-portal thread → agency inbox only
- Quick templates: "Scheduling question" / "Discuss care plan" / "Concern about visit"
- Agency responds from dashboard, all comms logged
- No family↔caregiver path — intentional

### Feature 7 — Billing & Invoices

- Invoices per billing period
- Shift-by-shift breakdown (date, caregiver, hours, rate, total)
- Payment status (paid / outstanding)
- Download as PDF
- Split billing: multiple family members assigned % share
- View only — not a payment processor

### Feature 8 additions

- New invoice: Email
- New agency message: Push / Email

---

## Open Questions — Resolve Before Session 11

1. **"CareShepherds"** — separate brand or internal name? Must clarify before family portal UI
2. **Agency branding** — portal shows agency logo/colors. White-label theming adds complexity. Decision needed
3. **Mood indicators** — spec uses emojis. Must use lucide-react icons or custom SVG per design rules
4. **Billing** — confirm agencies want visibility in Careified vs keeping in existing billing system

---

## Before First Real Agency Demo

- [ ] Clerk production instance upgrade
- [ ] Dedicated copy session — every page
- [ ] Apple Developer account ($99/yr)
- [ ] Phone OTP via Clerk
- [ ] UX debt: agency signup form error handling
- [ ] Clarify "CareShepherds" naming

---

## Post-MVP

- Training platform (250–550 materials)
- Retention tools (day 15/30/60/90 check-ins)
- AI matching (personality-to-client compatibility)
- Google Wallet JWT
- Bedside device: single-purpose tablet locked to family portal, no login, agency provides as premium tier

---

## Demo Script (5 Minutes)

**SETUP:** careified.vercel.app — sign in as agency

1. **SEARCH (30s)** — `/agency/search`, filter panel
2. **FILTER (60s)** — Dementia + Available now → Aisha 4.9, Maria 4.8
   - Live-in → Di Tremblay, Helen Kowalski
3. **PROFILE (90s)** — Click Aisha, show full profile, trust score, tier badge
4. **SHORTLIST (30s)** — Shortlist → `/agency/shortlist`, add note
5. **CAREGIVER (30s)** — `/profile/build`, `/id/[caregiverId]`, QR scan

**CLOSE:** "75% annual turnover. Every hire starts blind. Careified fixes the information problem."

---

## Last updated

April 16 2026 — Session 8D Complete
Family portal full spec incorporated (CareShepherds doc)
Next: Session 8A — landing page design pass
