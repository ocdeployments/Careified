# Careified — Project Handoff Document
Generated: 2026-05-02

## 1. Project Overview
Careified is a professional caregiving platform connecting
caregivers with agencies and families. Three audiences:
- Caregivers: Build verified profiles, get discovered
- Agencies: Search, vet, place caregivers with AI matching
- Families: Find trusted verified caregivers

Live URL: https://careified.vercel.app
Repo: https://github.com/ocdeployments/Careified (private)
Local repo: /Users/owner/careified
Build agent working dir: /data/careified

## 2. Tech Stack
- Framework: Next.js 16.2.3 (App Router)
- Database: PostgreSQL — VPS at 187.124.227.63
  Managed via Render dashboard (oregon-postgres.render.com)
  Credentials: Render dashboard → careified DB → Credentials
- ORM: Prisma 7 + pg Pool (raw SQL for some queries)
- Auth: Clerk 7.0.12 (DEVELOPMENT keys — upgrade to production pending)
- Styling: Tailwind CSS 4 + inline styles (inline preferred)
- Deployment: Vercel (auto-deploy from GitHub main)
- Locale: lib/locale/config.ts — CA/US variants via NEXT_PUBLIC_LOCALE

## 3. Environment Variables
Vercel dashboard + .env.local (currently CA locale only):
- DATABASE_URL (Render managed PostgreSQL)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_LOCALE=CA
- VAPI_API_KEY
- VAPI_ASSISTANT_ID
- VAPI_PHONE_NUMBER_ID (must be UUID)
- OPENROUTER_API_KEY
- PHI_ENCRYPTION_KEY
- ADMIN_CLERK_USER_ID

## 4. Database
Provider: Render-managed PostgreSQL (VPS hosted)
Connection: DATABASE_URL in Vercel env + .env.local
Prisma config: prisma.config.ts reads .env.local manually
Run migrations: npx prisma db push (from /Users/owner/careified)
Credentials rotated: 2026-05-02 (new user: careified_app)

Key tables:
- caregivers (51+ columns, snake_case)
- agencies (clerk_user_id for auth lookup)
- users
- AIRecruitCampaign, AIRecruitCall, AIRecruitWaitlist, AIRecruitSuppression
- AuditLog

## 5. Locale System
File: lib/locale/config.ts
Hook: lib/locale/useLocale.ts
Middleware: proxy.ts (renamed from middleware.ts for Next.js 16)
Detection: x-vercel-ip-country header (production only)
CA → ca.careified.com / US + all others → us.careified.com
Dev default: CA

## 6. Profile Builder — Current State
10 steps + Step 0 (resume upload)
All steps rebuilt and wired to ProfileFormContext + useProfileSave

Step 0: app/profile/build/Step0ResumeUpload.tsx (NEW)
Step 1: components/profile/Step1Identity.tsx
Step 2: app/profile/build/Step2Services.tsx
Step 3: app/profile/build/Step3Availability.tsx
Step 4: app/profile/build/Step4Location.tsx
Step 5: app/profile/build/Step5Credentials.tsx
Step 6: app/profile/build/Step6Compliance.tsx
Step 7: app/profile/build/Step7Personality.tsx
Step 8: app/profile/build/Step8WorkHistory.tsx
Step 9: app/profile/build/Step9References.tsx
Step 10: app/profile/build/Step10OpenQuestions.tsx

Save architecture (3 layers):
1. ProfileFormContext (instant, in-memory)
2. localStorage (300ms debounce)
3. DB via useProfileSave hook (onBlur → POST /api/profile/save-field)

## 7. Profile Preview — NEXT SESSION
LiveProfilePreview component NOT YET BUILT.
Replaces ProfilePreviewCard in builder right panel.
Design: Ghost profile (Maria Santos demo) → fades to live data as caregiver types.
Banner evolves: Preview → Taking shape → Live → Top 10% → Elite
Must be built with Romy present — too important for autonomous session.
File to create: components/profile/LiveProfilePreview.tsx

## 8. AIRecruit Module
Routes: /agency/airecruit, /agency/airecruit/new
/agency/airecruit/[campaignId], /agency/airecruit/[campaignId]/[callId]
API: /api/airecruit/campaigns (POST), /api/airecruit/webhook (POST)
Lib: lib/airecruit/vapi.ts, lib/airecruit/scoring.ts, lib/airecruit/calling-hours.ts
Voice: Vapi — Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
PENDING: Session B (consent), Session C (profile analysis), Session D (enhancements)

## 9. Admin Console
Routes: /admin, /admin/caregivers, /admin/agencies
Protection: proxy.ts checks ADMIN_CLERK_USER_ID env var
Audit: lib/security/audit.ts → logAdminAction() → AuditLog table
API: /api/admin/agencies, /api/admin/caregivers

## 10. Page Routes (Full List)
Public: / /about /contact /privacy /terms
/for-caregivers /for-agencies /for-families

Caregiver:
/profile/[id] — agency-facing profile display
/profile/build — 10-step profile builder (+ Step 0)
/profile/start — redirects to /profile/build
/profile/demo-preview
/profile/strength
/opportunities
/id/[caregiverId] — ID card
/verify/[slug] — public verification
/settings/data-rights

Agency:
/agency/search
/agency/shortlist
/agency/clients
/agency/pending-approval
/agency/airecruit
/agency/airecruit/new
/agency/signup

Admin:
/admin
/admin/caregivers

Auth:
/sign-in /sign-up /onboarding

## 11. What Is Built vs Pending

BUILT AND LIVE:
- Clerk auth (agency + caregiver flows)
- Agency search (20+ filters, 15 demo caregivers)
- Agency shortlist
- Admin approval console + audit logging
- Profile builder Steps 0-10 (rebuilt, Context wired)
- Profile display /profile/[id]
- ID cards + verify slug
- Navbar (3-panel dropdown)
- Landing page
- AIRecruit Phases 1-6 (Vapi, scoring, webhooks)
- Locale system (CA/US config + geo-redirect)
- proxy.ts (renamed from middleware.ts for Next.js 16)

PENDING — NEXT SESSION:
- LiveProfilePreview (ghost → live, build with Romy present)
- Map component for travel radius (Leaflet/OpenStreetMap)
- Clerk production instance upgrade (manual — Clerk dashboard)
- US Vercel deployment (second project, NEXT_PUBLIC_LOCALE=US)

PENDING — FUTURE SESSIONS:
- Client intake system (169 fields, 9 tables — fully designed)
- Matching engine (hard filters + weighted score)
- Rating system
- Family portal Phase 1
- AIRecruit Sessions B, C, D
- Background check module (VSC upload + verification)
- /api/profile/upload-photo route
- /api/profile/save-references route
- Big Five personality (TIPI — 10 questions) in Step 7
- Phone OTP via Clerk
- Apple Developer account (Wallet passes)

## 12. Pre-Launch Checklist
- [ ] Clerk production instance upgrade
- [ ] DB password in old git history — rotated 2026-05-02 ✓
- [ ] Lawyer review of lib/legal/text.ts
- [ ] E&O / Cyber / General Liability insurance
- [ ] Apple Developer account ($99/yr)
- [ ] All page copy still placeholder — dedicated copy session needed
- [ ] SSL certificate for Render DB (currently rejectUnauthorized: false)
- [ ] US Vercel deployment setup

## 13. Git Workflow Rules (Non-negotiable)
- One file per commit
- npx tsc --noEmit before every commit
- git push origin main after every commit
- Never use npx vercel --prod
- Never set env vars via CLI — Vercel dashboard only
- Local repo: /Users/owner/careified
- Build agent repo: /data/careified
- When rewriting large files use heredoc:
  cat > filepath << 'EOF' ... EOF

## 14. Design System
Colors: Navy #0D1B3E, Gold #C9973A/#E8B86D, Royal #1E3A8A/#2563EB
Amber #B45309, Warm white #F7F4F0, Gold tint #FDF6EC
Typography: DM Serif Display (headlines) + DM Sans (body)
Styles: Inline only — no Tailwind classes (v4 production issues)
Cards: white, borderRadius 16px, border 1px solid #E2E8F0
Hover: borderColor #C9973A, gold glow, translateY(-2px)
No green as primary. No emojis in UI. No framer-motion in steps.

## 15. Session Start Checklist
cd /Users/owner/careified
git status — must be clean
git log --oneline -5
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2- | tr -d '"')
echo $DATABASE_URL
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT COUNT(*) FROM caregivers WHERE status = \$1', ['approved']).then(r => { console.log('✅ Approved:', r.rows[0].count); pool.end(); });"
npx tsc --noEmit 2>&1 | head -20
