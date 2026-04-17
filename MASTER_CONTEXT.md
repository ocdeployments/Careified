# MASTER_CONTEXT.md — Careified

> Paste this at the start of any new Claude or Copilot session.
> Last updated: April 2026 — Session 7 Starting

---

## Who I Am In This Conversation

I am **CareNet Architect** — senior full-stack developer, UX designer, conversion strategist and product visionary for Careified.
My role is to DESIGN and PROMPT. The agent builds.

### My Non-Negotiable Working Rules

- Read the actual file before writing any prompt that touches it
- Verify TypeScript compiles clean before approving any commit
- Confirm DB changes landed before moving to the next step
- Stop and investigate before continuing when something looks wrong
- Ask for git log at the start of every session
- **Never write a multi-file prompt — one file per commit, always**
- Never accept "it looks correct" without verification
- Never write a prompt based on assumptions about file contents

---

## What This Product Is

**Careified** — `/data/careified` on the VPS

Caregiving trust and recruiting platform.
Texas-first (Frisco/McKinney). Canada & US expansion planned.

- **Live URL:** https://careified.vercel.app
- **Repo:** https://github.com/ocdeployments/Careified
- **Core moat:** Two-sided verified reputation system.
- Serves ALL care backgrounds — never medical-only framing.

---

## Three Audiences — NEVER Conflate

| Audience | Role | Access |
|----------|------|--------|
| **Agencies** | Primary buyer. Pays. | Search, profiles, shortlist, trust scores |
| **Caregivers** | Supply side. Always free. | Own profile, badges, scores |
| **Families** | Lead generator only. | Intake form at `/care-request`. Never sees supply-side data. |

---

## Actual Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Auth | Clerk | v7 (`@clerk/nextjs` ^7.0.12) |
| ORM | Prisma | 7 |
| DB Driver | pg (raw Pool) | ^8.20 |
| Database | Render PostgreSQL | — |
| Icons | lucide-react | latest |

**Tailwind v4:** `globals.css` must use `@import "tailwindcss"` NOT `@tailwind base/components/utilities`

**Prisma:** camelCase model fields map to snake_case DB columns

**DATABASE_URL:** in `.env.local` — export at session start

**Clerk keys:** in `.env.local` (rotated April 15 — NEVER paste in chat)

---

## Authentication Architecture

**Provider:** Clerk v7

- Already installed: `@clerk/nextjs` ^7.0.12
- Middleware: currently stubbed out (empty) — needs enabling
- Keys: in `.env.local` and Vercel environment variables
- Sign-in page: `/sign-in` (placeholder — needs Clerk components)

### Auth Flows

**Agency flow:**
Google OAuth → phone OTP verification → pending admin approval → access `/agency/search`

**Caregiver flow:**
Google OAuth → phone OTP verification → straight to `/profile/build`

### What needs building (Session 7)

- Enable Clerk middleware — protect `/agency/*` routes
- Wrap `layout.tsx` with ClerkProvider
- Replace sign-in placeholder with Clerk SignIn component
- Role-based redirect post-signup (agency vs caregiver)
- Wire user role to Clerk `publicMetadata`
- Protect `/agency/search` — redirect to sign-in if no session

### Existing auth infrastructure

- `/app/api/agency/signup/route.ts` — creates User + Agency in DB
- `/app/agency/signup/page.tsx` — full form with validation
- `AgencySignupForm.tsx` — ~400 lines
- User model: id, email, password_hash (unused), role, is_active
- Agency model: id, name, status (default: pending), contact fields

> **CRITICAL — Never paste Clerk keys in chat**
> Keys were accidentally exposed and rotated on April 15 2026.
> Always add keys via: `echo 'KEY=value' >> .env.local`
> Never commit keys to git. Never paste in conversation.

---

## Actual Database — Render PostgreSQL

### caregivers table (snake_case)

```
id, user_id, first_name, last_name, preferred_name, job_title,
email, phone, gender, city, state, postal_code, status,
availability_status, bio, photo_url, services[], specializations[],
credentials[], placement_types[], languages[], days_available[],
shift_times(jsonb), willing_live_in, willing_overnight, open_to_urgent,
has_vehicle, has_drivers_license, willing_to_transport,
willing_client_vehicle, transit_accessible, travel_radius,
hourly_rate, years_experience, aggregate_score, rating_count,
min_hours_per_week, max_hours_per_week, holiday_available,
pet_tolerance, smoker_household, technology_comfort, employment_type,
lift_experience[], medicare_certified, vulnerable_sector_check,
driving_record_check, bonded_insured, provincial_registry_number,
profile_completion_pct, clients_served_count, work_style,
hobbies[], dietary_cooking[], personality_profile(jsonb)
```

### Related tables

- `caregiver_certifications` (caregiver_id — NOT "caregiverId")
- `caregiver_references` (caregiver_id — NOT "caregiverId")
- `users` (id, email, password_hash, role, is_active)
- `agencies` (id, name, status, contact fields)
- `agency_caregiver_relationships`, `agency_ratings`, `agency_saved_searches`

**NO** `caregiver_security` table (does not exist)

### Current DB Data

- **15 demo caregivers** (email: `@demo.careified.com`)
- All status = `approved`, avg score **4.61★**, avg completion **71.5%**

---

## File Structure

```
app/
├── agency/
│   ├── search/page.tsx          ✅ Working — styled
│   ├── signup/page.tsx          ✅ Built
│   └── pending-approval/page.tsx ✅ Built
├── api/
│   ├── agency/signup/route.ts   ✅ Built
│   ├── caregivers/search/route.ts ✅ Working
│   └── admin/agencies/route.ts  ✅ Built
├── profile/
│   ├── build/page.tsx           ✅ 6 steps saving to DB
│   └── [id]/page.tsx            ✅ Profile display
├── sign-in/page.tsx             ⚠️ Placeholder — needs Clerk
├── sign-up/page.tsx             ✅ Role-locked (URL param)
├── onboarding/page.tsx           ✅ Redirect gateway
├── admin/agencies/page.tsx      ✅ Admin approval UI
├── layout.tsx                   ✅ ClerkProvider wrapped
├── page.tsx                     ✅ Landing (redesigned)
components/
├── profile/
│   ├── Step1Identity.tsx        ✅ Saves to DB
│   ├── Step2Services.tsx
│   ├── Step3Availability.tsx
│   ├── Step4Certifications.tsx
│   ├── Step5References.tsx
│   └── Step6Review.tsx
├── search/
│   ├── FilterPanel.tsx          ✅ All 20+ parameters
│   ├── CaregiverCard.tsx        ✅ Polished, links to profile
│   └── SearchResults.tsx        ✅ Grid layout
├── agency/
│   └── AgencySignupForm.tsx     ✅ Full form
└── nav/
    └── Navbar.tsx               ✅ Three-panel dropdown
lib/
├── services/caregiver-search.ts  ✅ All columns correct
├── types/search.ts              ✅ Full parameter coverage
├── actions/profile.ts            ✅ All 5 steps save correctly
├── utils/profile-completion.ts   ✅ Weighted scoring
└── db.ts                        ✅ Mock Prisma client + pg Pool
middleware.ts                    ✅ Clerk + role routing
prisma/schema.prisma             ✅ Synced to Render DB
scripts/seed-demo.js             ✅ Run — 15 caregivers
.env.local                       ⚠️ DATABASE_URL + Clerk keys — DO NOT TOUCH
```

---

## Session History

| Session | Status | Description |
|---------|--------|-------------|
| Sessions 5–5B | ✅ | Search service rewritten, 29 columns added, FilterPanel expanded |
| Session 6 | ✅ | All 5 profile builder steps saving correctly |
| Session 6E | ✅ | 15 demo caregivers seeded |
| Session 6F | ✅ | Profile display page |
| Overnight Fixes | ✅ | Tailwind v4 fixed, search page styled |
| Session 7 | ✅ | Clerk auth enabled, middleware protected |
| Session 7B | ✅ | Shortlist feature |
| Session 8A | ✅ | Navbar & landing page redesign (DM fonts) |
| Session 8B | ✅ | Admin approval flow |
| Session 8C | ✅ | Role-locked signup (URL param) |
| Session 8D | ✅ | Profile builder UX redesign (sidebar, animations) |
| Session 9 | ✅ | Split view live preview + ID card reveal |

---

## Next Sessions

1. **Session 10** — Rating System (agency ratings, trust scores)
2. **Session 11** — Family Portal Phase 1

---

## Demo Script (5 Minutes)

1. `/agency/search` — show 15 caregivers, filter panel
2. Filter **Dementia** + **Available now** → Aisha 4.9★, Maria 4.8★
3. Filter **Live-in** → Di Tremblay, Helen Kowalski
4. Click Aisha → full profile
5. Show bio, specialties, certifications, logistics
6. Shortlist button → `/agency/shortlist`

---

## Design System

| Token | Value |
|-------|-------|
| Navy | `#0D1B3E` |
| Gold | `#C9973A` / `#E8B86D` |
| Royal | `#1E3A8A` / `#2563EB` |
| Amber | `#B45309` |
| Warm white | `#F7F4F0` |
| Gold tint | `#FDF6EC` |

- **NO** green as primary. **NO** emojis.
- Inline styles preferred over Tailwind.

### Cards

- White background
- `borderRadius: 16px`
- `border: 1px solid #E2E8F0`

### Hover

- `borderColor: #C9973A`
- Gold glow shadow
- `translateY(-2px)`

---

## Workflow Rules

- **ONE FILE PER COMMIT**
- **READ ACTUAL FILE** — always `cat` before writing prompt
- **SHOW DIFF** before committing
- **TypeScript clean** before approving
- **DB verify** after save action changes
- **NEVER paste API keys** in chat
- **NEVER assume** file contents

---

## Session Start Checklist

```bash
cd /data/careified
git status
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers WHERE status = \$1', ['approved']).then(r => { console.log('✅ Approved:', r.rows[0].count); pool.end(); });"
```

---

## Verified Stats

- **75%** turnover (Activated Insights 2025)
- **4 in 5** leave in 100 days (HCAOA 2024)
- **9.7M** jobs by 2034 (PHI 2025)

---

## Last Updated

April 2026 — Session 8D complete, profile builder redesigned.

**Clerk keys rotated April 15. Never paste keys in chat.**
