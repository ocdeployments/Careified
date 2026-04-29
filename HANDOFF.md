# Careified — Project Handoff Document
Generated: 2026-04-28

## 1. Project Overview
Careified is a professional caregiving platform connecting 
caregivers with agencies and families. Three audiences:
- Caregivers: Build verified profiles, get discovered
- Agencies: Search, vet, place caregivers with AI matching
- Families: Find trusted verified caregivers

**Tech Stack:**
- Framework: Next.js 16.2.3 (App Router)
- Database: PostgreSQL — Render (snake_case tables)
- ORM: Prisma 7 + pg Pool (raw SQL for some queries)
- Auth: Clerk 7.0.12
- Styling: Tailwind CSS 4 + inline styles
- UI: Radix UI, lucide-react
- Deployment: Vercel (auto-deploy from GitHub main)
- Repo: https://github.com/ocdeployments/Careified
- Live URL: https://careified.vercel.app

---

## 2. Database
Provider: Render PostgreSQL (external)
Connection: DATABASE_URL in Vercel env vars and .env.local
ORM: Prisma 7 — schema at prisma/schema.prisma
Raw SQL: pg Pool via lib/db.ts

Key tables:
- agencies (clerk_user_id column for auth lookup)
- caregivers
- users
- AIRecruitCampaign
- AIRecruitCall  
- AIRecruitWaitlist

IMPORTANT: prisma db push must be run locally with 
DATABASE_URL in .env.local — Vercel does not run it.
Local repo path: /Users/owner/careified

---

## 3. Environment Variables Required

Vercel dashboard + .env.local:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_APP_URL
- VAPI_API_KEY (private, no NEXT_PUBLIC prefix)
- VAPI_ASSISTANT_ID (private)
- VAPI_PHONE_NUMBER_ID (private — must be UUID from Vapi dashboard)
- PHI_ENCRYPTION_KEY

---

## 4. AIRecruit Module — Current State

Routes built:
- /agency/airecruit — hub page (live)
- /agency/airecruit/new — campaign creation form (live)
- /api/airecruit/campaigns — POST handler (live)
- /api/airecruit/webhook — POST handler (live)

Files:
- app/agency/airecruit/page.tsx
- app/agency/airecruit/new/page.tsx
- app/api/airecruit/campaigns/route.ts
- app/api/airecruit/webhook/route.ts
- lib/airecruit/vapi.ts
- lib/airecruit/scoring.ts
- lib/airecruit/calling-hours.ts
- prisma/schema.prisma (AIRecruitCampaign, AIRecruitCall, AIRecruitSuppression, AIRecruitWaitlist)

Voice provider: Vapi (vapi.ai)
- Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Phone: US Twilio number imported into Vapi
- Canada supported via Twilio number import

Current status: ALL 8 COMPLIANCE COMMITS COMPLETE
- Campaign creation with CRTC consent checkbox
- Suppression list check before calling
- Calling hours enforcement (CRTC/TCPA)
- Webhook receives call completion
- Transcript scoring via OpenRouter/Minimax
- Opt-out phrase detection

Next: Phase 6 campaign dashboard

---

## 5. AIRecruit Build Phases

COMPLETE (Phases 1-5):
- Phase 1: Database schema ✓
- Phase 2: Campaign creation UI ✓
- Phase 3: Vapi integration layer ✓
- Phase 4: Webhook handler ✓
- Phase 5: Scoring engine ✓
- Compliance layer (8 commits) ✓

PENDING:
- Phase 6: Campaign dashboard (list, statuses, results)
- Phase 7: Scheduling integration

---

## 6. Competitive Context
Main competitor: Activated Insights Recruit
Our advantage:
- Caregivers already in DB with verified profiles
- AI agent knows who it is calling before the call
- Closed loop: screening → placement → outcome tracking
- Integrated into agency workflow already in use
- Transparent pricing (competitor hides pricing)

---

## 7. Vapi Configuration
Account: vapi.ai
Assistant name: AIRecruit Screener
Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
Assistant type: Outbound, warm leads, empathetic tone
Phone: US Twilio number (imported into Vapi)
Canadian calls: supported via same US number

Call flow:
1. Agency creates campaign at /agency/airecruit/new
2. POST /api/airecruit/campaigns creates DB records
3. initiateVapiCall fires for each phone number
4. Vapi calls candidate with dynamic system prompt
5. Webhook fires on call completion (Phase 4 — pending)

---

## 8. Key Technical Decisions
- Vapi over pure Twilio: Vapi handles conversation 
  orchestration, turn detection, voicemail detection
- ElevenLabs voice via Vapi TTS provider setting
- caregiverId nullable on AIRecruitCall (matched by 
  phone number at call time, linked post-screening)
- Fire-and-don't-await replaced with awaited 
  Promise.allSettled for proper error capture
- Model overrides removed from Vapi call — use 
  systemPrompt override only to avoid provider errors

---

## 9. Known Issues / Pre-launch Checklist
- [ ] VAPI_PHONE_NUMBER_ID must be UUID in Vercel env
- [ ] Test end-to-end call to real phone number
- [ ] Vapi webhook handler not yet built (Phase 4)
- [ ] Database password rotation (old password in git history)
- [ ] Lawyer review of lib/legal/text.ts
- [ ] E&O / Cyber / General Liability insurance
- [ ] Clerk production upgrade
- [ ] Apple Developer account ($99/yr) for wallet passes

---

## 10. Page Routes (Full List)

Public:
/ | app/page.tsx
/about | app/about/page.tsx
/contact | app/contact/page.tsx
/privacy | app/privacy/page.tsx
/terms | app/terms/page.tsx
/for-caregivers | app/for-caregivers/page.tsx
/for-agencies | app/for-agencies/page.tsx
/for-families | app/for-families/page.tsx

Caregiver:
/profile/[id] | app/profile/[id]/page.tsx
/profile/demo-preview | app/profile/demo-preview/page.tsx
/profile/start | app/profile/start/page.tsx
/profile/build | app/profile/build/page.tsx
/profile/strength | app/profile/strength/page.tsx
/opportunities | app/opportunities/page.tsx

Agency:
/agency/search | app/agency/search/page.tsx
/agency/shortlist | app/agency/shortlist/page.tsx
/agency/clients | app/agency/clients/page.tsx
/agency/pending-approval | app/agency/pending-approval/page.tsx
/agency/airecruit | app/agency/airecruit/page.tsx
/agency/airecruit/new | app/agency/airecruit/new/page.tsx

Admin:
/admin/agencies | app/admin/agencies/page.tsx

Auth:
/sign-in | app/sign-in/[[...sign-in]]/page.tsx
/sign-up | app/sign-up/[[...sign-up]]/page.tsx
/onboarding | app/onboarding/page.tsx
/settings/data-rights | app/settings/data-rights/page.tsx

API (AIRecruit):
/api/airecruit/campaigns | POST — create campaign + fire calls

---

## 11. Git Workflow Rules (Non-negotiable)
- One file per commit
- npx tsc --noEmit before every commit
- git push origin main after every commit
- Never use npx vercel --prod
- Never set env vars via CLI — use Vercel dashboard only
- Local repo: /Users/owner/careified
- When rewriting files use: cat > filepath << 'EOF' 
  (heredoc from terminal, not Cline str_replace)

---

## 12. Design System
Colors: Navy #0D1B3E, Gold #C9A84C, Gold Light #E8B86D
Typography: Inter (body), DM Serif Display (headlines)
Styles: Inline only — no styled-jsx, no Tailwind classes
Components: lucide-react icons, AgencyShell wrapper
Animations: Framer Motion
- CRITICAL: When rewriting files Cline must use the bash heredoc method (cat > file << 'EOF') NOT str_replace or write_file — Cline's patching causes duplicate code merges on complex files
