# Careified — Strategic Context
Last updated: 2026-04-28

## Product Vision
Decision engine answering: "Should I hire THIS caregiver 
for MY specific client, RIGHT NOW?"

Platform is a conduit — presents and organizes information 
but does not recommend, vouch for, verify, or employ 
caregivers. All hiring decisions remain the agency's 
sole responsibility.

---

## AIRecruit — Competitive Strategy

### Primary Competitor
Activated Insights Recruit (formerly Pre-Intent)
activatedinsights.com/recruit

### What They Do
- Automated text/email/voicemail outreach sequences
- Candidate self-scheduling with real-time calendar
- Re-engagement campaigns for cold applicants
- ATS/HRIS integration
- Part of broader suite: Retain, Training, 
  Experience Management, Recognition
- Workflow: ingest lead → auto-contact → self-schedule 
  → hand to ATS
- Hides pricing behind demo wall
- 300,000+ post-acute and long-term care professionals

### Their Structural Weaknesses
1. No caregiver data — processing anonymous leads 
   from job boards. We have verified profiles with 
   credentials, specializations, match scores already 
   in DB.
2. No placement loop — job ends at interview scheduling. 
   No outcome tracking. Scoring never improves.
3. Workflow automation not real AI conversation — 
   voicemail drops and text sequences, not live AI 
   voice interviews producing transcripts and scores.
4. Hidden pricing — trust problem we exploit by 
   being transparent.

### Our Structural Advantages
1. Caregiver-aware screening — AI agent knows who 
   it is calling before the call. Can reference 
   certifications, experience, availability.
2. Closed loop — screening → placement → outcome 
   tracking. Our scoring gets smarter over time.
3. Real AI voice interview — transcript + structured 
   score + recommendation per call. Not a schedule 
   request.
4. Already integrated — agencies live in Careified 
   for search/shortlist/placement. AIRecruit adds 
   to existing workflow, not a new tool to adopt.
5. Transparent pricing.

### Long Term Moat
Post-placement outcome tracking feeds back into 
screening scores. Caregivers who answer certain 
questions certain ways and stay longer teach the 
model what good looks like. Activated Insights has 
no placement data. In 12 months our recommendations 
will be provably more accurate and we will have 
the data to show it.

---

## AIRecruit Build Phases

COMPLETE:
- Phase 1: DB schema (AIRecruitCampaign, AIRecruitCall, 
  AIRecruitWaitlist)
- Phase 2: Campaign creation UI (/agency/airecruit/new)
- Phase 3: Vapi integration layer (pending first test)

PENDING IN ORDER:
- Phase 4: Webhook handler (/api/airecruit/webhook)
  Receive Vapi call completion, store transcript,
  trigger scoring. MOST URGENT after first call works.
- Phase 5: Scoring engine
  Claude API on transcript, structured score per 
  screening question, recommendation (advance/review/pass)
- Phase 6: Campaign dashboard
  List campaigns, call statuses, ranked candidates,
  transcript viewer, score breakdown
- Phase 7: Retry/re-engagement logic
  If no answer: retry at different time, second attempt
  before marking unreachable. Matches competitor baseline.
- Phase 8: Self-scheduling
  Top scoring candidates auto-offered calendar slots.
  Agency calendar integration (Calendly or native).
- Phase 9: Outcome tracking feedback loop
  Post-placement: did the hire work out? Feed back 
  into scoring model. Long term moat.

---

## Candidate State Machine
AIRecruitCall.status values (current + planned):
- pending — created, not yet called
- calling — Vapi call initiated
- completed — call finished, transcript received
- scored — Claude scoring complete
- advancing — agency marked as advance
- placed — caregiver placed with client
- outcome_tracked — 30/60/90 day outcome recorded

---

## Key Design Principles

HONESTY PRINCIPLES (non-negotiable):
- Null means null — missing data shown as missing, 
  never estimated or defaulted
- Non-recommender liability model — platform presents 
  organized information, agencies own hiring decisions
- Confidence weighting by verification tier
- If AI is asked if it is AI — it says yes honestly

VOICE AGENT PRINCIPLES:
- Empathetic tone — caregivers chose a career of 
  human connection, treat them accordingly
- Under 10 minutes per call
- If candidate seems busy, offer callback
- Never make promises about role or compensation
- Human recruiter follows up within 24-48 hours

---

## Inbound Feature (Future)
Agency receptionist inbound assistant — separate 
Vapi assistant, separate phone number, separate 
product area. DO NOT conflate with AIRecruit outbound.
Answers after-hours agency calls, takes messages,
answers role questions, routes urgent calls.
Build after AIRecruit outbound is validated.

---

## Vapi Configuration
Provider: vapi.ai
Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
Assistant name: AIRecruit Screener
Type: Outbound, warm leads, empathetic + friendly
Voice: ElevenLabs via Vapi TTS provider setting
Phone: US Twilio number imported into Vapi
Canadian calls: supported via same US number

Key technical decisions:
- Use systemPrompt override only (no model override)
  Model overrides require provider field — causes 400
- phoneNumberId must be UUID from Vapi dashboard
- VAPI_PHONE_NUMBER_ID, VAPI_API_KEY, VAPI_ASSISTANT_ID
  are private server-only env vars (no NEXT_PUBLIC prefix)

---

## Market Context
- 7.8 million direct-care jobs projected open by 2026
- Most qualified front-line workers on market < 3 days
- Target market: Texas first (Frisco/McKinney), 
  then US and Canada expansion
- Caregiver turnover in home care averages 60-80%
- Being first to contact a candidate is critical

---

## Tech Stack
- Next.js 16.2.3 (App Router)
- React 19
- Tailwind v4 + inline styles (no styled-jsx)
- Prisma 7 + pg Pool (raw SQL for some queries)
- Render PostgreSQL (snake_case for legacy tables,
  PascalCase for new AIRecruit tables)
- Clerk v7 (auth)
- lucide-react (icons)
- Framer Motion (animations)
- Vapi (voice AI orchestration)
- ElevenLabs (TTS via Vapi)
- Twilio (phone number provider)
- Vercel (deployment)
- GitHub: ocdeployments/Careified (branch: main)

---

## File Rewrite Rule (CRITICAL FOR CLINE)
When rewriting existing files, ALWAYS use bash heredoc:
  cat > filepath << 'EOF'
  ...content...
  EOF

NEVER use str_replace or write_file for full rewrites.
Cline's patching creates duplicate merged code.
This has caused multiple debugging sessions.
