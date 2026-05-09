# AI_PLAYBOOK.md — Careified AI Strategy and Implementation
# Covers: Vapi, WhatsApp, Telegram, SMS, OpenRouter
# Last updated: May 9 2026
# Rule: Every AI interaction must have consent before firing
# Rule: Every AI output must be labeled as AI-generated
# Rule: Non-recommender language applies to all AI output

---

## THE AI VISION

AI is not a feature in Careified. AI is the product.

The goal: agencies run their entire operation 
from a WhatsApp conversation.
Caregivers manage their career from their phone.
Families get peace of mind without downloading anything.

The platform thinks ahead so humans do not have to.

---

## AI SYSTEMS OVERVIEW

| System | Channel | Direction | Status |
|--------|---------|-----------|--------|
| AIRecruit Screener | Phone call | Outbound | ✅ Built |
| Reference Caller | Phone call | Outbound | ❌ Session B |
| Past Employer Verifier | Phone call | Outbound | ❌ Session C |
| Family Schedule Check-in | Phone call | Outbound | ❌ Phase 3 |
| Retention Check-in | Phone call | Outbound | ❌ Phase 3 |
| Inbound Receptionist | Phone call | Inbound | ❌ Phase 3 |
| Agency AI Assistant | WhatsApp/Telegram/SMS | Two-way | ❌ Phase 3 |
| Caregiver AI Assistant | WhatsApp | Two-way | ❌ Phase 3 |
| Family Update Bot | WhatsApp | One-way | ❌ Phase 2 |
| QuickFill broadcast | WhatsApp/SMS/In-app | Outbound | ❌ Phase 2 |
| QuickFill confirmation | Phone call | Outbound | ❌ Phase 2 |
| Family shift updates | WhatsApp | Outbound | ❌ Phase 2 |
| Caregiver late alert | WhatsApp | Inbound triggered | ❌ Phase 3 |
| Caregiver sick call | WhatsApp | Inbound triggered | ❌ Phase 3 |
| AI Command Bar | In-platform | Two-way | ✅ Built |

---

## VAPI CONFIGURATION

### Current Setup
- Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
- Assistant name: AIRecruit Screener
- Phone Number ID: efd1fdc0-6795-4d5f-a399-b95367bd88ff
- Phone number: +1 (518) 617-4826 (US Twilio)
- Type: Outbound warm leads
- Voice: ElevenLabs via Vapi TTS
- Model: openai/gpt-4o
- Canadian calls: supported via same US number

### Vapi Rules
- NEVER fire a call without checking consent gate first
- NEVER fire a call outside compliance hours
- ALWAYS verify HMAC signature on incoming webhooks ✅ fixed
- ALWAYS log call events to audit_log
- ALWAYS store transcript and score after call
- Webhook endpoint: /api/airecruit/webhook

### Consent Types
| Type | Status | Gate File |
|------|--------|-----------|
| recruit_calls | ✅ Built | lib/airecruit/consent-gate.ts |
| reference_calls | ❌ Session B | |
| past_employer_calls | ❌ Session C | |
| current_employer_calls | DROPPED | Legal risk |
| regulatory_calls | ❌ Pending | |
| match_time_calls | ❌ Pending | |

---

## COMPLIANCE RULES — NON-NEGOTIABLE

### Canada (CRTC)
- Calling hours: 9am-9:30pm weekdays
- Calling hours: 10am-6pm weekends
- Must identify caller and purpose immediately
- Must offer opt-out on every call
- Suppression list checked before every call
- File: lib/airecruit/calling-hours.ts ✅

### USA (TCPA)
- Calling hours: 8am-9pm local time
- Written consent required for autodialed calls
- Must identify as automated call
- Must offer immediate opt-out
- Do-not-call registry checked
- File: lib/airecruit/calling-hours.ts ✅

### All AI interactions
- Must be labeled as AI-generated
- Must offer path to human
- Must not claim to be human if asked directly
- Consent captured before first interaction
- Consent timestamped and versioned in DB

---

## AIRECRUIT — SCREENING CALL FLOW

### Phase 1 (Built) ✅

Agency creates campaign
Consent gate checked for recruit_calls
Compliance hours checked
Suppression list checked
Vapi outbound call fires
AI introduces as Careified AIRecruit
Permission gate — candidate must say yes to continue
Structured screening questions
Call ends
Webhook fires → /api/airecruit/webhook
HMAC signature verified
Transcript stored
OpenRouter/minimax scores transcript
Score stored: overallScore, recommendation,
summary, questionScores, flags, confidence
Recommendation: advance / review / pass
Agency sees result in campaign dashboard


### Scoring Dimensions
- Communication clarity
- Care experience depth  
- Availability confirmation
- Red flags detected
- Professionalism signals
- Enthusiasm indicators

### Output Labels (non-recommender)
- NEVER: "We recommend hiring"
- ALWAYS: "Screening criteria alignment: X%"
- ALWAYS: "Agency reviews all results independently"
- ALWAYS: disclaimer on every scored output

---

## AIRECRUIT — REFERENCE CALL FLOW (Session B)

Caregiver lists reference in Step 9
Agency triggers reference call from profile
Consent gate checked for reference_calls
Reference receives SMS/email notification
Vapi calls reference at scheduled time
AI introduces purpose clearly
Structured reference interview:

Confirm working relationship
Dates of employment
Role and responsibilities
Reliability and punctuality
Would you re-engage? (binary — most powerful signal)
Any concerns? (open-ended)


Transcript stored
Score generated
Verification tier updated (Tier 3 if confirmed)
Agency sees reference result on profile


---

## WHATSAPP BUSINESS API — SETUP

### Provider options
1. Twilio WhatsApp (recommended — already use Twilio)
2. 360dialog (cheaper at scale)
3. Meta direct (complex setup)

### Twilio WhatsApp setup

Twilio account (already have via Vapi)
Apply for WhatsApp Business API access
Create WhatsApp Business profile
Get approved phone number
Add to Twilio dashboard
Webhook: /api/whatsapp/webhook
Add TWILIO_WHATSAPP_NUMBER to env vars
Add TWILIO_ACCOUNT_SID to env vars
Add TWILIO_AUTH_TOKEN to env vars


### Message template requirements
WhatsApp requires pre-approved templates for 
outbound messages (business-initiated).
Templates submitted via Twilio for Meta approval.
Approval takes 24-48 hours.

Templates needed for Phase 2 launch:
- new_match_alert: "New caregiver match for [Client]"
- reference_complete: "Reference check complete for [Name]"
- shortlist_notification: "Agency shortlisted your profile"
- credential_expiry: "Your [Credential] expires in 30 days"
- caregiver_arrived: "[Name] arrived at [Client] at [Time]"
- schedule_checkin: "Does [Caregiver]'s schedule still work?"

---

## TELEGRAM BOT — SETUP

### Why Telegram
- Free API (no per-message costs)
- Popular in Eastern European and Filipino caregiver communities
- No template approval required (unlike WhatsApp)
- Good for agency coordinators who prefer Telegram

### Setup

Create bot via @BotFather on Telegram
Get bot token
Add TELEGRAM_BOT_TOKEN to env vars
Webhook: /api/telegram/webhook
Set webhook: POST to Telegram API


### Telegram bot commands
/search [criteria] — search caregivers
/shortlist — view current shortlist
/match [client] — get matches for client
/status — platform status
/help — command list

---

## SMS — SETUP

### Provider
Twilio (already integrated via Vapi)
Add direct SMS capability separate from Vapi.

### Use cases
- Caregiver late arrival alert
- Schedule change notification
- Credential expiry reminder
- AIRecruit call preview message

### Compliance
- TCPA: written consent required for marketing SMS
- CRTC: consent required, opt-out in every message
- All SMS consent stored in 
  caregiver_communication_consents table

---

## AI AGENCY ASSISTANT — CONVERSATION DESIGN

### Architecture
WhatsApp message → Twilio webhook → /api/assistant/agency
→ OpenRouter (conversation AI)
→ Careified DB (search, shortlist, data)
→ Response back via Twilio WhatsApp

### Conversation state
No memory between conversations by default.
Context injected per message:
- Agency ID and tier
- Current shortlist
- Recent searches
- Active clients

### Sample interactions

SEARCH
User: "Find me a PSW in Scarborough available 
       Monday mornings who speaks Tagalog"
AI: "Found 3 caregivers matching your criteria:
     1. Maria Santos — 94% match, 8 yrs experience
     2. James Reyes — 87% match, 5 yrs experience  
     3. Ana Cruz — 82% match, 3 yrs experience
     Reply with a number to see full profile, 
     or 'shortlist all' to save all three."

SHORTLIST
User: "Shortlist all"
AI: "Done. Maria, James, and Ana added to your 
     shortlist. Want me to check references 
     for any of them?"

REFERENCE
User: "Check Maria's references"
AI: "Starting reference check for Maria Santos.
     She has 2 references listed. I'll call both 
     within business hours and update you when 
     complete. Usual turnaround: 2-4 hours."

SCHEDULE
User: "Mrs. Johnson's Monday carer called in sick"
AI: "Checking available caregivers for Mrs. Johnson 
     on Monday... Found 2 matches from your shortlist 
     available Monday. Want me to call them now?"

---

## AI CAREGIVER ASSISTANT — CONVERSATION DESIGN

### Sample interactions

LATE ARRIVAL
Caregiver: "Running 15 min late to Mrs Johnson"
AI: "Got it. Notifying [Agency] and Mrs. Johnson's 
     family now. Updated arrival: 9:15am. Drive safe."

SICK CALL
Caregiver: "Can't make it Thursday, not well"
AI: "Sorry to hear that. I've notified [Agency] 
     about Thursday. They'll arrange cover. 
     Feel better soon. Reply 'back' when you're 
     available again."

MATCH ALERT
AI: "Hi [Name], new match for you. [Agency] in 
     Scarborough is looking for a PSW with your 
     exact profile. Interested? Reply YES to connect 
     or NO to skip."

CREDENTIAL REMINDER
AI: "Reminder: your VSC expires August 15 — 
     that's 45 days away. Want me to remind you 
     again at 30 days and 7 days?"

---

## AI FAMILY CHECK-IN — CALL SCRIPT

### Outbound call script
"Hello, this is an automated call from [Agency Name]
powered by Careified.
I'm calling to check in about [Caregiver Name]'s
schedule with [Client Name].
Does the current [Day] at [Time] schedule still
work well for you?
Press 1 for Yes, it works well.
Press 2 for No, I need a change.
Press 3 to speak with someone at the agency."

### On "No, I need a change"
"I'll let [Agency] know you'd like to discuss
the schedule. Someone will call you within
[SLA time]. Is there a preferred time to call?
Press 1 for Morning (9am-12pm)
Press 2 for Afternoon (12pm-5pm)
Press 3 for Evening (5pm-8pm)"

---

## AI OUTPUT RULES — NON-NEGOTIABLE

Every AI-generated output must follow these rules:

1. Never recommend — always present for agency review
2. Always label as AI-generated or AI-assisted
3. Always include confidence score where applicable
4. Always include disclaimer on scored outputs
5. Never claim to verify what Careified cannot verify
6. Reference data "as reported by" — never "verified by"
7. Match scores are "alignment scores" not recommendations
8. Agency makes all hiring decisions — AI supports only

Template disclaimer for all AI scoring output:
"This assessment was generated by automated screening.
All hiring decisions are made independently by the agency.
Careified presents collected information and does not 
recommend, verify, or vouch for any caregiver."

---

## TESTING AI INTERACTIONS

Before any AI feature goes live:
- Test happy path end to end
- Test consent gate blocks call without consent
- Test compliance hours block call outside hours
- Test webhook fires and is received
- Test HMAC verification rejects invalid signatures
- Test transcript stored correctly
- Test score generated and visible
- Test failure state (what if Vapi is down?)
- Test double-fire prevention (idempotency)

---

## QUICKFILL — AI DISPATCH FLOW

### Trigger
Agency creates shift blast via dashboard or WhatsApp:
"Need PSW Monday 9am Scarborough dementia experience"

### Eligibility filter
lib/blast/eligibility.ts checks:
- Service area overlap with shift location
- Availability grid covers shift time
- Required specializations present
- match_time_calls consent active
- Not already placed that shift
- Not on suppression list

### Broadcast message (WhatsApp/SMS)
"New shift — [Agency Name]
 [Day] [Date], [Start]-[End] ([Hours]hrs)
 [Area] — [Specialty required]
 $[Rate]/hr

 Reply YES to be considered
 Reply NO to skip
 Reply STOP to opt out"

### On YES response
1. Caregiver added to response list with timestamp
2. Agency dashboard updates in real time
3. Vapi outbound call fires within 5 minutes
4. AI confirms:
   - Availability confirmed
   - Address acknowledged
   - Rate confirmed
   - Any questions answered
5. Caregiver says yes → confirmed
6. Shift assigned → all others notified filled

### AI call script — QuickFill confirmation
"Hi [Name], this is Careified calling on behalf
of [Agency Name] about the [Day] shift in [Area].

You indicated you are available and interested.
I just want to confirm a few details.

The shift is [Date] from [Start] to [End],
[Hours] hours at $[Rate] per hour,
at [General Area — not full address yet].

Can you confirm you are still available
and interested in this shift?

Press 1 for Yes
Press 2 for No
Press 3 to speak with the agency"

### On confirmation
- Shift assigned to caregiver
- Full address sent via WhatsApp
- Calendar invite sent
- Agency notified
- Other caregivers notified: "Shift filled"
- Family notified: "[Name] confirmed for [Day]"

### Reliability signal captured
Every blast interaction logged:
- Responded / Did not respond
- Response time
- Accepted / Declined
- Confirmed / No-showed (post-shift)

This data feeds aggregate_score over time.

---

## QUICKFILL — AI DISPATCH SYSTEM

### What it is
Instant shift blast to all qualified available
caregivers in area. Agency broadcasts urgent need.
Caregivers respond YES/NO. AI confirms and schedules.
This is Uber dispatch applied to home care.

### Consent requirement
Caregivers must opt into match_time_calls consent type.
Opt-in copy:
"Get notified instantly when shifts matching your
 profile open up in your area. Via WhatsApp, SMS,
 or call. You control which channel."

### Blast message template (WhatsApp/SMS)
"New shift — [Agency Name]
 [Day] [Date], [Start]-[End] ([Hours]hrs)
 [Area] — [Specialty required if any]
 $[Rate]/hr

 Reply YES to be considered
 Reply NO to skip
 Reply STOP to opt out of all alerts"

### Eligibility filter (lib/blast/eligibility.ts)
Before blast fires, check:
- service_area overlaps shift location
- availability_grid covers shift time
- required specializations present on profile
- match_time_calls consent active
- not already placed that shift day
- not on suppression list
- subscription tier allows receiving blasts

### On YES response
1. Added to response list with timestamp
2. Agency dashboard updates in real time
3. Vapi call fires within 5 minutes
4. AI confirms: availability, address, rate, questions
5. Caregiver accepts → shift assigned
6. All others notified: shift filled
7. Family notified: caregiver confirmed
8. Response logged for reliability scoring

### AI confirmation call script
"Hi [Name], this is Careified calling on behalf
of [Agency]. You expressed interest in the
[Day] shift in [Area] from [Start] to [End].

I'm calling to confirm you're still available
and interested. The rate is $[Rate] per hour.

Press 1 to confirm — we'll send you the
full address right away.
Press 2 if you're no longer available.
Press 3 to speak with someone at [Agency]."

### Reliability signal
Every blast interaction is logged:
- Response time (fast responders flagged positively)
- Response rate (consistent responders trusted more)
- Acceptance rate (committed or browsing?)
- No-show rate (post-shift verification)

This data feeds aggregate_score over time.
Agencies see reliability signals before placement.
This is data no other platform has.

### DB tables needed
shift_blasts:
id, agency_id, client_id, shift_date, start_time,
end_time, service_area, required_specializations[],
required_certifications[], hourly_rate, notes,
status (draft/active/filled/cancelled/expired),
fill_rule (first_response/agency_selects/best_match),
sent_to_count, response_yes_count, response_no_count,
filled_by (caregiver_id), created_at, expires_at

blast_responses:
id, blast_id, caregiver_id,
response (yes/no/no_response),
responded_at, ai_call_id, confirmed,
selected, notified_filled

---

Last updated: May 9 2026
Vapi Assistant ID: fdd84833-80ef-4c50-8391-2d7b38e56ead
Phone Number: +1 (518) 617-4826
