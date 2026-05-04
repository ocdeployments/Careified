# Careified — Project Handoff Document
Generated: May 4, 2026 (Updated)

## 1. Project Overview
Careified is a professional caregiving platform connecting caregivers with agencies and families.
- Caregivers: Build verified profiles, get discovered
- Agencies: Search, vet, place caregivers with AI matching
- Families: Read-only portal (future)

Live URL: https://careified.vercel.app
Repo: https://github.com/ocdeployments/Careified (private)
Local repo: /Users/owner/careified

## 2. Tech Stack
- Framework: Next.js 16.2.3 (App Router)
- Database: PostgreSQL on Render
- ORM: Prisma 7 + pg Pool (raw SQL for some queries)
- Auth: Clerk 7.0.12 (DEV keys — production pending)
- Styling: Inline styles only (no Tailwind classes - v4 production issues)
- Deployment: Vercel (auto-deploy from GitHub main)
- Locale: lib/locale/config.ts — CA/US via NEXT_PUBLIC_LOCALE

## 3. Environment Variables
All set in Vercel dashboard + .env.local:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_LOCALE=CA
- OPENROUTER_API_KEY
- PHI_ENCRYPTION_KEY
- VAPI_API_KEY
- VAPI_ASSISTANT_ID
- VAPI_PHONE_NUMBER_ID
- ADMIN_CLERK_USER_ID

## 4. What Was Built Today (May 4, 2026)

### Admin Console — Fully Expanded
- `/admin` — Command center with real metrics, agency list, module adoption, billing overview
- `/admin/agencies` — Full CRUD, module control, detail panel
- `/admin/agencies/[id]` — PATCH status and modules
- `/admin/caregivers` — Manage profiles
- `/admin/status` — Live data from API, DB counts, env var check, git commit
- `/admin/sitemap` — All pages by access level

### Agency Features
- `/agency/dashboard` — Action-first home, AI command bar
- `/agency/settings` — Live edit identity, operations, team, compliance
- `/agency/billing` — Module pricing placeholder
- `/agency/signup` — 4-step form with validation (FIXED)
- AI command bar — Natural language caregiver search
- Caregiver pool filtered by agency service areas

### Profile Builder
- LiveProfilePreview — Ghost to live animation (✅ BUILT)

### Security Fixes
- Broken links resolved (/settings → /settings/communications, etc.)
- Agency signup form validation — field-level errors now display

### Documentation Added
- Security audit findings to status page
- Ticketing system spec
- Promotions/campaigns admin
- Demo environment spec
- US expansion checklist

## 5. Current Page Inventory (36 pages)

### Public (no auth)
/ — Landing page
/for-caregivers — Caregiver pitch
/for-agencies — Agency pitch
/for-families — Family pitch
/about — Company info
/contact — Contact form
/privacy — Privacy policy
/terms — Terms of use

### Auth
/sign-in
/sign-up — accepts ?role=caregiver or ?role=agency
/onboarding — role redirect gateway

### Caregiver (login required)
/profile/build — 11-step builder (Step 0 consent + resume upload)
/profile/[id] — Agency-facing scorecard
/profile/demo — Demo with Maria Santos
/profile/strength — Profile strength dashboard
/opportunities — Job feed
/settings/communications — Consent preferences
/settings/data-rights — Export/delete data
/id/[caregiverId] — Wallet ID card
/verify/[slug] — Public verification page
/reference/[token] — Public reference form

### Agency (approved login required)
/agency/dashboard — Action-first home with AI command bar
/agency/search — 20+ filter caregiver search
/agency/shortlist — Saved candidates
/agency/clients — Client list
/agency/clients/new — Intake form (8 sections)
/agency/clients/[id] — Match analysis + verify-in-call gaps
/agency/airecruit — AIRecruit hub
/agency/airecruit/new — New campaign
/agency/airecruit/[campaignId] — Campaign + calls
/agency/airecruit/[campaignId]/[callId] — Call transcript
/agency/settings — Live-edit branding, areas, team, compliance
/agency/billing — Module pricing placeholder
/agency/signup — 4-step registration form
/agency/pending-approval — Waiting screen

### Admin (ADMIN_CLERK_USER_ID only)
/admin — Full command center with live metrics
/admin/agencies — Full CRUD + module control + detail panel
/admin/agencies/[id] — PATCH status/modules
/admin/caregivers — Manage profiles
/admin/status — Build tracker with live DB data
/admin/sitemap — All pages by access level

## 6. Matching Algorithm

File: lib/matching/score.ts
- 7 dimensions: clinical_fit, reliability, logistics_match, personality_compatibility, cultural_language_fit, retention_signal, environment_fit
- Verification tiers (confidence multipliers): Tier 1 (1.0x), Tier 2 (0.75x), Tier 3 (0.55x), Tier 4 (0.35x)
- Hard gates: language, gender preference, placement type, availability, state match, rate ceiling

Gap analysis: lib/matching/gap-analysis.ts (~15 rule-based triggers)

## 7. AIRecruit — Vapi Multi-Agent

Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead

Consent types:
- recruit_calls: ✅ BUILT
- reference_calls: PENDING
- past_employer_calls: PENDING
- current_employer_calls: DROPPED (legal risk)
- regulatory_calls: PENDING
- match_time_calls: PENDING

## 8. What's Pending

**Status: DEVELOPMENT PHASE** — Security and production items deferred to pre-launch

### Pre-Launch (Launch Prep)
1. Clerk production upgrade (pk_test_ → pk_live_)
2. Copy session — ALL page text is placeholder
3. SSL cert for Render DB (rejectUnauthorized: false)
4. Lawyer review of lib/legal/text.ts
5. E&O / Cyber / General Liability insurance

### Security (Address at Pre-Launch)
- Admin pages auth (ADMIN_CLERK_USER_ID check)
- Vapi webhook signature verification
- Reference token UUIDs
- Rate limiting on registration/reference APIs

### Features Queued
7. Ticketing system
8. ~~Demo environment (/demo/*)~~ ✅ DONE (May 4 2026)
9. Rating system (post-placement)
10. Family portal Phase 1
11. AIRecruit Sessions B, C, D
12. Upload photo API
13. Map for travel radius (Leaflet)

### Infrastructure
14. US Vercel deployment
15. Apple Developer account ($99/yr)

## 9. Git Workflow Rules
- One file per commit
- npx tsc --noEmit before every commit
- git push origin main after every commit
- Never use npx vercel --prod
- Never set env vars via CLI — dashboard only

## 10. Session Start Checklist
```bash
cd /Users/owner/careified
git status
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '"' -f2)
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers').then(r => { console.log('✅', r.rows[0].count, 'caregivers'); pool.end(); });"
npx tsc --noEmit 2>&1 | head -20
```

## 11. Safe Revert Point
git reset --hard 960aca6