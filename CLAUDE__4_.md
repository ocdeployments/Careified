# CLAUDE.md — Careified
# Read this file completely at the start of every session.
# Last updated: 2026-04-28 — Session AIRecruit Phase 3

---

## 1. Project Identity

**Product:** Careified
**Repository:** https://github.com/ocdeployments/Careified
**Live URL:** https://careified.vercel.app
**Local path (Mac):** /Users/owner/careified
**Local path (Cline):** /data/careified
**Geography:** Texas-first (Frisco/McKinney). Canada & US.
**Core moat:** Verified caregiver profiles + AI recruiting + placement outcome loop.

Three audiences — NEVER conflate:
- Agency: Primary buyer. Search, profiles, shortlist, clients, AIRecruit.
- Caregiver: Supply side, always free. Profile builder, ID card, badges.
- Family: Read-only portal. Schedule, caregiver card, notifications.

---

## 2. Architect Role

I am CareNet Architect. I design and prompt. Cline builds.

### ALWAYS before writing a prompt:
- Read the actual file to be modified in full
- Check current DB schema if prompt touches DB
- Verify git status is clean
- Confirm TypeScript compiles after each change

### NEVER:
- Write a prompt based on assumptions about file contents
- Approve a commit without seeing the diff
- Continue past a TypeScript error
- Write multi-file prompts (one file per commit always)
- Accept "it looks correct" without verification
- Paste API keys in chat

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | v4 + inline styles |
| Auth | Clerk | v7 |
| ORM | Prisma | 7 |
| DB Driver | pg Pool | ^8.20 |
| Database | Render PostgreSQL | — |
| Icons | lucide-react | latest |
| Animation | Framer Motion | — |
| Voice AI | Vapi | vapi.ai |
| TTS | ElevenLabs via Vapi | — |
| Telephony | Twilio | — |
| Deployment | Vercel | — |

Inline styles preferred over Tailwind.
No styled-jsx ever.
No emojis ever — lucide-react only.
pg Pool NEVER in middleware.ts (Edge Runtime).

---

## 4. Database Rules

Provider: Render PostgreSQL
Legacy tables: snake_case columns
AIRecruit tables: PascalCase (Prisma managed)

Key tables:
- agencies (clerk_user_id for auth lookup)
- caregivers
- users
- AIRecruitCampaign
- AIRecruitCall (caregiverId is nullable)
- AIRecruitWaitlist

IMPORTANT: prisma db push must be run locally with DATABASE_URL in .env.local — Vercel does NOT run it.

NO caregiver_security table (does not exist).

---

## 5. Workflow Rules — CRITICAL

1. ONE FILE PER COMMIT — always
2. READ ACTUAL FILE FIRST — full cat before any prompt
3. SHOW DIFF BEFORE COMMIT — always review
4. TYPESCRIPT CHECK — npx tsc --noEmit must pass
5. STOP AND WAIT — after each commit for approval
6. DB VERIFY — after any schema change query DB
7. NO NEW PACKAGES — ask architect first
8. CLEAN GIT — git status clean before starting
9. NEVER run npx vercel --prod
10. NEVER set Vercel env vars via CLI — dashboard only
11. NEVER use str_replace or write_file for full rewrites — use bash heredoc always

---

## 6. File Rewrite Rule — CRITICAL

Cline's str_replace and write_file cause duplicate merged code on complex files. This has caused multiple debugging sessions costing hours.

For ANY full file rewrite always use heredoc:
cat > app/api/example/route.ts << 'EOF'
...clean content...
EOF

This is non-negotiable.

---

## 7. Design System

Navy: #0D1B3E — nav, hero, dark sections
Navy dark: #080F1E — footer
Gold: #C9973A / #E8B86D — CTAs, accents
Warm white: #F7F4F0 — page background

Typography: DM Serif Display (headlines) + Inter (body)
Cards: white, borderRadius 16px, border 1px #E2E8F0
Hover: borderColor #C9973A, translateY(-2px)
CTAs: linear-gradient(135deg, #C9973A, #E8B86D)

NO green as primary. NO emojis. Inline styles only.

---

## 8. Environment Variables

Vercel dashboard + .env.local (never CLI):
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_APP_URL
- VAPI_API_KEY (private, no NEXT_PUBLIC prefix)
- VAPI_ASSISTANT_ID (private)
- VAPI_PHONE_NUMBER_ID (private, must be UUID)
- PHI_ENCRYPTION_KEY

Rule: No NEXT_PUBLIC prefix = server only.
NEXT_PUBLIC prefix = browser accessible.
When in doubt: no prefix.

---

## 9. AIRecruit Module

Routes:
- /agency/airecruit — hub page
- /agency/airecruit/new — campaign creation form
- /api/airecruit/campaigns — POST handler
- /api/airecruit/webhook — POST handler

Key files:
- app/agency/airecruit/page.tsx
- app/agency/airecruit/new/page.tsx
- app/api/airecruit/campaigns/route.ts
- app/api/airecruit/webhook/route.ts
- lib/airecruit/vapi.ts
- lib/airecruit/scoring.ts
- lib/airecruit/calling-hours.ts
- prisma/schema.prisma (AIRecruitCampaign, AIRecruitCall, AIRecruitSuppression, AIRecruitWaitlist)

Vapi config:
- Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Assistant name: AIRecruit Screener
- Type: Outbound, warm leads, empathetic + friendly
- Use systemPrompt override only — NO model override (model override requires provider field, causes 400)
- phoneNumberId must be UUID from Vapi dashboard
- Canadian calls supported via US Twilio number

Build phases:
COMPLETE: Phase 1 (DB), Phase 2 (UI), Phase 3 (Vapi), Phase 4 (Webhook), Phase 5 (Scoring)
COMPLIANCE (8 commits): Suppression list, calling hours, opt-out detection, CRTC consent
PENDING:
- Phase 6: Campaign dashboard (list, statuses, results)
- Phase 7: Retry/re-engagement logic
- Phase 8: Self-scheduling
- Phase 9: Outcome tracking feedback loop

---

## 10. Competitive Context

Primary competitor: Activated Insights Recruit
Their weakness: no caregiver data, no placement loop, workflow automation not real AI conversation.
Our moat: verified profiles + AI interview + outcome tracking that learns over time.

---

## 11. Session Start Checklist

cd /data/careified
git status
git log --oneline -5
npx tsc --noEmit 2>&1 | head -5

---

## 12. Verified Stats

75% Annual caregiver turnover (Activated Insights 2025)
4 in 5 Leave within first 100 days (HCAOA 2024)
9.7M Care jobs to fill by 2034 (PHI 2025)
7.8M Direct-care jobs open by 2026 (PHI 2019)

---

## 13. Messaging Rules

1. Never show pricing figures
2. Never name competitors — "general job boards" only
3. Never use emojis — lucide-react only
4. Families never see supply-side data
5. All care backgrounds welcome — never medical-only
6. Reputations EARNED — made VISIBLE by Careified

---

*Last updated: 2026-04-28 — AIRecruit Phase 3*
*Read HANDOFF.md for current technical state.*
*Read CONTEXT.md for strategic and competitive context.*
*Read CLIENT_INTAKE.md for client intake spec.*
*Read RATING_SYSTEM.md for reputation scoring spec.*