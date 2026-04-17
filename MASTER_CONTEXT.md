MASTER_CONTEXT.md — Careified
Paste this at the start of any new Claude or Copilot session.
Last updated: April 2026 — Session 10C Complete

***Who I Am In This Conversation
I am CareNet Architect — senior full-stack developer, UX designer,
conversion strategist and product visionary for Careified.
My role is to DESIGN and PROMPT. The agent builds.

Non-Negotiable Working Rules
Read the actual file before writing any prompt that touches it
Verify TypeScript compiles clean before approving any commit
Confirm DB changes landed before moving to the next step
Stop and investigate before continuing when something looks wrong
Ask for git log at the start of every session
Never write a multi-file prompt — one file per commit, always
Never accept "it looks correct" without verification
Never write a prompt based on assumptions about file contents
Never paste API keys in chat

***What This Product Is
Careified — /data/careified
Caregiving trust and recruiting platform.
Texas-first (Frisco/McKinney). Canada & US expansion planned.
Live URL: https://careified.vercel.app
Repo: https://github.com/ocdeployments/Careified (private)
Core moat: Two-sided verified reputation system.
Serves ALL care backgrounds — never medical-only framing.

***Three Audiences — NEVER Conflate
Agencies: Primary buyer. Pays. Sees search, profiles, shortlist, trust scores, client management.
Caregivers: Supply side. Always free. Sees own profile, badges, scores, ID card.
Families: Read-only portal (Session 14). Schedule, caregiver card, notifications.

***Actual Tech Stack
Layer Technology Version
Framework Next.js App Router 16.2.3
UI React 19.2.4
Styling Tailwind CSS v4
Auth Clerk v7 (@clerk/nextjs ^7.0.12)
ORM Prisma 7
DB Driver pg (raw Pool) ^8.20
Database Render PostgreSQL —
Icons lucide-react latest

Tailwind v4: globals.css must use @import "tailwindcss"
Inline styles preferred over Tailwind (v4 production issues)
DATABASE_URL: in .env.local — export at session start
Clerk keys: in .env.local — NEVER paste in chat, NEVER commit

***Authentication — COMPLETE
Provider: Clerk v7
Middleware: Protects /agency/* and /admin/*
Agency flow: Google OAuth → phone OTP → pending approval → /agency/search
Caregiver flow: Google OAuth → phone OTP → /profile/build
Safe revert commit: 41c6b31

***Database — Render PostgreSQL
caregivers table (snake_case — key columns)
id, user_id, first_name, last_name, preferred_name, job_title,
email, phone, gender, date_of_birth, city, state, postal_code,
address, status, availability_status, bio, photo_url,
services[], specializations[], credentials[], placement_types[],
languages[], language_fluency(jsonb), work_authorisation,
emergency_contact(jsonb), skill_ratings(jsonb), dietary_cooking[],
client_types[], unwilling_tasks[], weekly_grid(jsonb),
min_hours_per_week, max_hours_per_week, earliest_start_date,
notice_period, holiday_available, preferred_age_group,
preferred_settings[], hourly_rate, hourly_rate_max,
employment_type, travel_radius, has_vehicle, has_drivers_license,
willing_to_transport, willing_client_vehicle, transit_accessible,
willing_live_in, willing_overnight, open_to_urgent, service_areas[],
education(jsonb), currently_enrolled, background_consent,
background_consent_date, vulnerable_sector_check, driving_record_check,
criminal_declaration, criminal_declaration_detail, bonded_insured,
immunisation_records(jsonb), tb_clearance_date, declaration_accurate,
declaration_date, personality_profile(jsonb), work_history(jsonb),
volunteer_experience, volunteer_description, family_care_experience,
family_care_description, professional_memberships[], open_q1, open_q2,
open_q3, profile_completion_pct, profile_phase, years_experience,
aggregate_score, rating_count, caregiver_code, verify_slug

Related tables
caregiver_certifications (caregiver_id)
caregiver_references (caregiver_id)
users (id, email, role, is_active)
agencies (id, clerk_user_id, name, status)
agency_shortlist (agency_clerk_id, caregiver_id, notes)

NO caregiver_security table (does not exist)

DB session start check
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers WHERE status = \$1', ['approved']).then(r => { console.log('✅ Approved caregivers:', r.rows[0].count); pool.end(); });"

***File Structure
app/
 agency/search/page.tsx ✅ Working — styled
 agency/shortlist/page.tsx ✅ Working
 admin/agencies/page.tsx ✅ Working
 api/caregivers/search/route.ts ✅ Working
 api/profile/
 save-field/route.ts ✅ Session 10A
 save-step/route.ts ✅ Session 10A
 load/route.ts ✅ Session 10A
 profile/
 build/page.tsx ✅ Context integrated, DB load on mount
 build/Step2Services.tsx ✅ Session 10C (DONE)
 build/Step3Availability.tsx ⚠️ Needs Session 10D
 build/Step4Certifications.tsx ⚠️ Needs Session 10F
 build/Step5References.tsx ⚠️ Needs Session 10J
 build/Step6Review.tsx ✅ Wired to IDCardReveal
 [id]/page.tsx ✅ Agency-facing profile display
 id/[caregiverId]/page.tsx ✅ ID card with QR
 verify/[slug]/page.tsx ✅ Public verify

components/
 profile/
 Step1Identity.tsx ✅ Session 10B (DONE)
 ProfilePreviewCard.tsx ✅ Session 9 — live preview
 IDCardReveal.tsx ✅ Session 9 — credential ceremony
 search/
 FilterPanel.tsx ✅ 20+ parameters
 CaregiverCard.tsx ✅ Polished, links to profile
 SearchResults.tsx ✅ Grid layout

lib/
 context/ProfileFormContext.tsx ✅ Session 10A — global form state
 hooks/useProfileSave.ts ✅ Session 10A — three-layer save
 services/caregiver-search.ts ✅ All columns correct
 types/search.ts ✅ Full parameter coverage
 utils/profile-completion.ts ✅ Weighted scoring
middleware.ts ✅ Clerk auth
prisma/schema.prisma ✅ Synced to Render DB
scripts/
 migrate-session5.js ✅ Run
 migrate-session10.js ✅ Run — 51 columns added
 seed-demo.js ✅ Run — 15 demo caregivers

***Session History

Sessions 1–8D (Complete ✅)
Clerk auth, role-locked signup, agency approval, search, shortlist,
profile builder 6 steps, profile display, ID cards, navbar, landing page.
Safe revert: 41c6b31

Session 9 (Complete ✅)
ProfilePreviewCard (live split view), IDCardReveal (3D flip ceremony),
three-column profile builder layout, Step6Review wired to reveal.
Commits: 2935f0b, 70f3f20, f991f7e, bbaeb1e

Session 10A (Complete ✅)
51 new DB columns added. ProfileFormContext (global state + localStorage).
useProfileSave hook (three-layer save). Three API routes: save-field,
save-step, load. page.tsx wired to Context + Clerk userId.
Commits: a0fb75d → 3fc6eab

Session 10B — COMPLETE
Step1Identity.tsx rebuilt with useProfileForm Context + useProfileSave hook
Commit: 31b1bd2

Session 10C — COMPLETE
Step2Services.tsx rebuilt — Context pattern, removed credentials, added self-ratings
Commit: b72055e

***Profile Builder — 10-Step Architecture

Progressive Disclosure Model
Steps 1-3 → Basic (50%) → Profile goes live in search
Steps 4-5 → Verified (68%) → Verified badge unlocked
Steps 6-7 → Professional (82%) → Featured matching eligible
Steps 8-10 → Elite path (95% requires agency validation)

Step Map (No Duplicate Fields)
Step Content Fields From
1 Identity — name, photo, DOB, gender, phone, location, languages, bio, emergency Sections A
2 Services — what you do, self-ratings, client types, dietary Sections E
3 Availability — status, weekly grid, hours, placement types, preferences Section F
4 Location & Transport — service area, radius, driving, vehicle Section G
5 Credentials — primary credential, certifications, education Section C + B
6 Compliance — background consent, declarations, immunisations Section I
7 Personality — 7 forced-choice scenarios + working style + strengths Section J
8 Work History — employer blocks, volunteer, memberships Section D
9 References — 3 minimum, consent structure Section K
10 Open Questions — 3 profile quality questions Section L

Completion Thresholds
Step 1: 20% Step 2: 35% Step 3: 50% ← Goes live
Step 4: 58% Step 5: 68% ← Verified badge
Step 6: 74% Step 7: 82% ← Professional tier
Step 8: 87% Step 9: 92% Step 10: 95%

Save Architecture (Three Layers)
Context (instant) — ProfileFormContext updates on every keystroke
localStorage (300ms debounce) — survives browser refresh
DB (onBlur) — useProfileSave hook fires save-field API on field blur

Preview Panel
Left: sidebar (220px)
Center: step form
Right: live preview (280px) — ProfilePreviewCard

Ghost profile shown before any data entered (uses Maria Santos demo data)
Crossfades to live preview on first keypress
Mobile: preview hidden, sticky bottom tier bar instead

***Client Intake System — DESIGNED, NOT YET BUILT

Build Order
Finish caregiver profile Steps 1-10 FIRST, then build client intake.

Architecture
Client profile is the mirror image of caregiver profile.
Every client field maps to a caregiver filter for matching.

Database Tables Needed
clients — core client record
client_medical — Section C (medical history)
client_adl_assessment — Section E (ADL/IADL ratings)
client_home_environment — Section F (home safety)
client_family_contacts — Section B (family/decision makers)
client_care_plan — Section H (schedule/care plan)
client_preferences — Section I (caregiver preferences)
client_safety_plan — Section K (emergency/risk)
client_consents — Section J (legal/compliance)

All linked to agencies via agency_id.
Client data is HIPAA/PIPEDA sensitive — encrypted at rest.
Row-level security: agency sees only their own clients.

Matching Engine (Post Client Intake)
Hard filters: language, schedule overlap, service area, certifications,
gender preference, cognitive care match
Weighted score: service coverage 30%, schedule fit 20%, trust score 15%,
credential depth 10%, personality fit 10%, experience 8%,
environment fit 5%, interests 2%

Routes
/agency/clients → client list
/agency/clients/new → 12-section intake form
/agency/clients/[id] → client profile view
/agency/clients/[id]/match → ranked caregiver matches

Client Intake Sections (169 fields total)
A — Personal info (13)
B — Family/decision makers (10)
C — Medical history (20) — encrypted
D — Cognitive/mental health (13)
E — ADL/IADL assessment (22)
F — Home environment (19)
G — Nutrition/dietary (11)
H — Schedule/care plan (14)
I — Caregiver preferences (15) — matching engine fuel
J — Legal/consent (10) — e-signatures
K — Safety/emergency (12)
L — Goals/notes (10)

***Personality Assessment — Step 7 Design

7 forced-choice scenario questions (NOT rating scales):

1. Patience — dementia repetition
 A) Naturally at ease — answers fresh each time
 B) Professional effort — stays calm but aware of repetition

2. Empathy — family emotional subtext
 A) Proactively names it — checks in directly
 B) Observant — watches for signs, doesn't name unless certain

3. Adaptability — unexpected care plan change
 A) Adapts immediately — works with new info
 B) Protocol-oriented — confirms with agency before changing

4. Communication — end-of-shift observation
 A) Proactive alerter — calls/messages same evening
 B) Documentation-first — records thoroughly, reports next contact

5. Emotional Regulation — angry family member
 A) Absorbs and continues — stays calm, explains reasoning
 B) Processes and resets — professional in moment, needs debrief after

6. Problem Solving — medication refusal
 A) Experimental — tries different approaches until something works
 B) Collaborative escalator — documents, involves agency/family

7. Resilience — client death/grief
 A) Relational attachment — feels deeply, may stay in touch with family
 B) Boundaried professional — processes and closes chapter consciously

Each answer → style label + base score (4.0 natural / 3.0 effort-based)
Agency validates post-placement → score adjusts (max 5.0)
Stored in personality_profile JSONB

***Rating System — NOT YET BUILT (Session 13+)

Four weighted sources: Caregiver → System → Agency → Admin
Six categories: Reliability · Human qualities · Hygiene ·
Beyond the call (bonus) · Skills match · Communication
Max self-assessment score: 4.0
Max with agency validation: 5.0

***Deployment

Platform: Vercel (connected to GitHub ocdeployments/Careified, branch: main)
Auto-deploys on git push origin main
NEVER use npx vercel --prod
NEVER set env vars via CLI — Vercel dashboard only

***Design System

Navy: #0D1B3E · Gold: #C9973A/#E8B86D · Royal: #1E3A8A/#2563EB
Amber: #B45309 · Warm white: #F7F4F0 · Gold tint: #FDF6EC
NO green as primary. No emojis. Inline styles preferred.
Cards: white, borderRadius 16px, border 1px solid #E2E8F0
Hover: borderColor #C9973A, gold glow shadow, translateY(-2px)
Typography: DM Serif Display (headlines) + DM Sans (body)

***Verified Stats

75% turnover (Activated Insights 2025)
4 in 5 leave in 100 days (HCAOA 2024)
9.7M jobs by 2034 (PHI 2025)

***Session Start Checklist
cd /data/careified
git status # must be clean
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM caregivers WHERE status = \$1', ['approved']).then(r => { console.log('✅ Approved:', r.rows[0].count); pool.end(); });"
npx tsc --noEmit 2>&1 | head -5

***Last updated: April 2026 — Session 10C Complete
Next: Session 10D — Step3Availability rebuild