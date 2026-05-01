# CLAUDE.md — Careified
# Read this file completely at the start of every session.
# Last updated: 2026-04-29 — AIRecruit Phase 6 complete

---

## 1. Project Identity

Product: Careified
Repository: https://github.com/ocdeployments/Careified
Live URL: https://careified.vercel.app
Local path Mac: /Users/owner/careified
Local path Cline: /data/careified
Geography: Texas-first (Frisco/McKinney). Canada and US.
Core moat: Verified caregiver profiles + AI recruiting + placement outcome loop.

Three audiences — NEVER conflate:
- Agency: Primary buyer. Search, profiles, shortlist, clients, AIRecruit.
- Caregiver: Supply side, always free. Profile builder, ID card, badges.
- Family: Read-only portal. Schedule, caregiver card, notifications.

---

## 2. Architect Role

CareNet Architect designs and prompts. Cline builds.

ALWAYS before writing a prompt:
- Read the actual file to be modified in full
- Check current DB schema if prompt touches DB
- Verify git status is clean
- Confirm TypeScript compiles after each change

NEVER:
- Write a prompt based on assumptions about file contents
- Approve a commit without seeing the diff
- Continue past a TypeScript error
- Write multi-file prompts (one file per commit always)
- Accept "it looks correct" without verification
- Paste API keys in chat
- Touch lib/airecruit/vapi.ts with str_replace or write_file
  (always use bash heredoc from Mac terminal for this file)

---

## 3. Tech Stack

Framework: Next.js App Router 16.2.3
UI: React 19.2.4
Styling: Tailwind v4 + inline styles (inline preferred)
Auth: Clerk v7
ORM: Prisma 7
DB Driver: pg Pool
Database: PostgreSQL on VPS (external)
Icons: lucide-react (no emojis ever)
Animation: Framer Motion
Voice AI: Vapi (vapi.ai)
TTS: ElevenLabs via Vapi
Telephony: Twilio
Scoring: OpenRouter with minimax/minimax-m2.5
Deployment: Vercel (auto-deploy from GitHub main)

pg Pool NEVER in middleware.ts (Edge Runtime).
Inline styles preferred over Tailwind.
No styled-jsx ever.
No emojis ever.

---

## 4. Database Rules

Provider: PostgreSQL on VPS
Legacy tables: snake_case columns
AIRecruit tables: PascalCase (Prisma managed)
prisma db push must be run locally with DATABASE_URL
Vercel does NOT run prisma db push automatically.

Key tables:
- agencies (clerk_user_id for auth lookup)
- caregivers
- users
- AIRecruitCampaign
- AIRecruitCall (caregiverId nullable)
- AIRecruitSuppression (do-not-call list)
- AIRecruitWaitlist

NO caregiver_security table (does not exist).

---

## 5. Workflow Rules — CRITICAL

1. ONE FILE PER COMMIT always
2. READ ACTUAL FILE FIRST — full cat before any prompt
3. SHOW DIFF BEFORE COMMIT — always review
4. TYPESCRIPT CHECK — npx tsc --noEmit must pass
5. STOP AND WAIT after each commit for approval
6. DB VERIFY after any schema change
7. NO NEW PACKAGES without asking architect
8. CLEAN GIT before starting
9. NEVER run npx vercel --prod
10. NEVER set Vercel env vars via CLI — dashboard only
11. NEVER use str_replace or write_file for full rewrites
    Always use bash heredoc:
    cat > filepath << 'ENDOFFILE'
    ...content...
    ENDOFFILE

CRITICAL — vapi.ts rule:
lib/airecruit/vapi.ts must ONLY be edited from the
Mac terminal using heredoc. Cline has a history of
corrupting this file. Never let Cline touch it directly.

---

## 6. Design System

Navy: #0D1B3E — nav, hero, dark sections
Navy dark: #080F1E — footer
Gold: #C9973A / #E8B86D — CTAs, accents
Warm white: #F7F4F0 — page background

Typography: DM Serif Display (headlines) + Inter (body)
Cards: white, borderRadius 16px, border 1px solid #E2E8F0
Hover: borderColor #C9973A, translateY(-2px)
CTAs: linear-gradient(135deg, #C9973A, #E8B86D)

NO green as primary. NO emojis. Inline styles only.

---

## 7. Environment Variables

Vercel dashboard + .env.local (never CLI):
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_APP_URL
- VAPI_API_KEY (private, no NEXT_PUBLIC prefix)
- VAPI_ASSISTANT_ID (private)
- VAPI_PHONE_NUMBER_ID (private, must be UUID)
- OPENROUTER_API_KEY (private) — named exactly this
- PHI_ENCRYPTION_KEY

Rule: No NEXT_PUBLIC prefix = server only.
NEXT_PUBLIC prefix = browser accessible.

---

## 8. AIRecruit Module — COMPLETE

Routes live:
- /agency/airecruit — campaign list hub
- /agency/airecruit/new — campaign creation form
- /agency/airecruit/[campaignId] — campaign detail
- /agency/airecruit/[campaignId]/[callId] — transcript view
- /api/airecruit/campaigns — POST create campaign
- /api/airecruit/webhook — POST Vapi webhook

Key files:
- app/agency/airecruit/page.tsx
- app/agency/airecruit/new/page.tsx
- app/agency/airecruit/[campaignId]/page.tsx
- app/agency/airecruit/[campaignId]/[callId]/page.tsx
- app/api/airecruit/campaigns/route.ts
- app/api/airecruit/webhook/route.ts
- lib/airecruit/vapi.ts (edit from Mac terminal only)
- lib/airecruit/scoring.ts
- lib/airecruit/calling-hours.ts

Vapi config:
- Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Assistant name: AIRecruit Screener
- Phone number ID: efd1fdc0-6795-4d5f-a399-b95367bd88ff
- Phone number: +1 (518) 617-4826 (US Twilio)
- Type: Outbound, warm leads, empathetic + friendly
- Voice: ElevenLabs via Vapi TTS
- Model override: openai/gpt-4o with system prompt
- Canadian calls: supported via US Twilio number

Compliance:
- CRTC (Canada): 9am-9:30pm weekdays, 10am-6pm weekends
- TCPA (US/Texas): 8am-9pm local time
- Calling hours enforced in lib/airecruit/calling-hours.ts
- Suppression list checked before every call
- Permission gate in every call — candidate must say yes
- Opt-out phrases detected in transcript → added to suppression list
- CRTC/TCPA consent checkbox required on campaign creation

Candidate entry:
- Structured table — firstName (required), lastName, phone (required), email, notes
- No name = no call (enforced)
- candidateNotes passed to Vapi as background context
- Careified signup invitation delivered at end of every completed call

Scoring:
- OpenRouter API with minimax/minimax-m2.5
- Runs async after webhook receives transcript
- Outputs: overallScore, recommendation, summary, questionScores, flags, confidence
- Recommendation values: advance, review, pass

---

## 9. AIRecruit Roadmap

COMPLETE (Phases 1-6):
- DB schema, campaign creation, Vapi integration
- Webhook, scoring engine, compliance layer
- Campaign dashboard, transcript viewer
- Structured candidate entry with name required

PENDING:

Session B — Option A Part 1:
- Agency TCPA/CRTC consent at onboarding
- Caregiver AIRecruit calling consent in Step 6
- Screen with AIRecruit button on search/shortlist

Session C — Option A Part 2:
- Profile analysis API (strengths, gaps, questions)
- Campaign creation from Careified profiles
- Full caregiver profile context passed to Vapi

Session D — Enhancements:
- SMS invitation to Careified after completed call
  (Twilio SMS — dedicated session)
- Retry logic for no-answer calls
- Callback auto-scheduling via Vercel Cron
- Scoring calibration tuning
- Agency branding (display name in calls)
- Bulk advance/pass actions on campaign results

---

## 10. Competitive Context

Primary competitor: Activated Insights Recruit
Their weakness: no caregiver data, no placement loop,
workflow automation not real AI conversation.
Our moat: verified profiles + AI interview + outcome
tracking that learns over time + identity-aware calls.

---

## 11. Pre-launch Checklist

- [ ] Database password rotation (old password in git history)
- [ ] Lawyer review of lib/legal/text.ts
- [ ] E&O / Cyber / General Liability insurance
- [ ] Clerk production upgrade
- [ ] Apple Developer account for wallet passes
- [ ] Database migration from VPS to Render
- [ ] Texas telemarketer registration (agency responsibility)
- [ ] VAPI_API_KEY rotated (was exposed in git diff)

---

## 12. File Rewrite Rule — CRITICAL

Cline str_replace and write_file cause duplicate merged
code on complex files. This has caused multiple debugging
sessions costing hours.

For ANY full file rewrite always use bash heredoc:
cat > app/api/example/route.ts << 'ENDOFFILE'
...clean content...
ENDOFFILE

This is non-negotiable. Especially for vapi.ts.

---

## 13. Session Start Checklist

cd /data/careified
git status
git log --oneline -5
npx tsc --noEmit 2>&1 | head -5

---

## 14. Verified Stats

75%   Annual caregiver turnover (Activated Insights 2025)
4 in 5 Leave within first 100 days (HCAOA 2024)
9.7M  Care jobs to fill by 2034 (PHI 2025)
7.8M  Direct-care jobs open by 2026 (PHI 2019)

---

## 15. Messaging Rules

1. Never show pricing figures
2. Never name competitors
3. Never use emojis — lucide-react only
4. Families never see supply-side data
5. All care backgrounds welcome — never medical-only
6. Reputations EARNED — made VISIBLE by Careified