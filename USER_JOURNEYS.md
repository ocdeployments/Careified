# USER_JOURNEYS.md — Careified End-to-End User Flows
# Every journey from discovery to success state
# Last updated: May 9 2026
# Rule: Every new feature must map to a journey before building
# Rule: Every journey must have a failure state and recovery path

---

## JOURNEY MAP LEGEND

✅ Built and working
🔧 Built, needs verification  
❌ Not built yet
⚠️ Known issue

Entry → Steps → Success state
              ↘ Failure state → Recovery path

---

## JOURNEY 1 — CAREGIVER: DISCOVERY TO FIRST PLACEMENT

### Entry points
- Google search "PSW jobs Ontario"
- Facebook group link
- Agency sends claim profile email ❌
- Friend referral link

### Steps

1. Lands on careified.ca ✅
   Success: Hero communicates value in 5 seconds
   Failure: Confused — recovery: clear headline ❌ copy needed

2. Clicks "Claim Your Profile" ✅
   → /sign-up?role=caregiver

3. Clerk signup ✅
   Success: Account created, role set
   Failure: Email already exists → sign in prompt ✅

4. Redirected to /profile/build?step=0 ✅
   Resume upload or skip

5. Completes Steps 1-3 (50% — goes live in search) ✅
   Success: Profile visible to agencies
   Banner: "You're now visible in search" ❌ not built

6. Receives notification "Agency viewed your profile" ❌
   → WhatsApp or email (Phase 2)

7. Agency shortlists caregiver ✅
   Notification to caregiver ❌ not built

8. Agency contacts caregiver ❌
   Contact info visible to agency needed

9. Interview and placement (off-platform currently)
   Future: placement recorded in platform (Phase 2)

10. Post-placement rating (Phase 3)
    Trust score increases
    Profile strength grows

### Success state
Caregiver is placed, profile strengthened,
reputation compounds with each placement.

### Current gaps for June 15
- ❌ "You're now live" banner after Step 3
- ❌ Profile view notification
- ❌ Contact path from agency to caregiver
- ❌ Shortlist notification to caregiver

---

## JOURNEY 2 — CAREGIVER: AGENCY ROSTER CLAIM

### Entry points
- Email: "Agency built a profile for you on Careified"
- SMS notification ❌

### Steps

1. Caregiver receives email with claim link ❌
2. Clicks link → /claim/[token] ❌
3. Prompted to create account or sign in
4. Reviews pre-filled profile
5. Edits and completes their own details
6. Profile ownership transferred to caregiver
7. Caregiver now owns profile — survives if they leave agency

### Success state
Caregiver owns portable professional profile
without initiating the process themselves.

### This is the viral loop — critical for supply growth

---

## JOURNEY 3 — AGENCY: DISCOVERY TO FIRST PLACEMENT

### Entry points
- Google search "home care recruitment software Canada"
- Referral from another agency
- Romy direct outreach
- For-agencies page

### Steps

1. Lands on for-agencies page ✅
   Success: Understands value in one scroll
   Failure: Confused about pricing ❌ no pricing visible
   Failure: Doesn't trust it ❌ no social proof yet

2. Clicks "Join the Careified Network" ✅
   → /agency/signup

3. Completes 4-step signup form ✅
   Failure: Validation errors ✅ fixed

4. → /agency/pending-approval ✅
   Success: Clear "what happens next"
   Failure: Dead end, no status ⚠️ needs better copy

5. Admin approves agency ✅
   → Email notification ❌ not built

6. Agency logs in → /agency/dashboard ✅

7. First search ✅
   Success: Sees caregivers with match scores
   Failure: No results → clear filter guidance ❌

8. Views caregiver profile ✅
   Success: Trusts the data
   Failure: Doesn't understand alignment score ❌ needs explanation

9. Shortlists caregiver ✅

10. Views contact info ❌ not built
    Contacts caregiver directly

11. Runs AIRecruit call on candidate ✅
    Consent gate → call → transcript → score

12. Makes placement (off-platform currently)

### Current gaps for June 15
- ❌ Approval email notification
- ❌ Contact info visible on profile
- ❌ Alignment score explanation tooltip
- ❌ Empty search state with guidance
- ❌ Pricing visible somewhere

---

## JOURNEY 4 — AGENCY ROSTER: ADDING EXISTING CAREGIVERS

### Entry points
- Agency dashboard → "Add caregivers" ❌
- Agency dashboard → "Import roster" ❌

### CSV Import flow ❌
1. Agency clicks "Import roster"
2. Downloads CSV template
3. Fills in caregiver details
4. Uploads CSV
5. Preview screen — review before confirming
6. Confirm → stub profiles created
7. Caregivers notified via email/SMS to claim

### Manual add flow ❌
1. Agency clicks "Add caregiver"
2. Fills basic details (name, phone, email, role)
3. Stub profile created
4. Caregiver notified to claim

### Success state
Agency has their full bench on platform day one.
No cold start. No waiting for caregiver self-signup.

---

## JOURNEY 5 — FAMILY: PORTAL ACCESS

### Entry points (Phase 2)
- Agency sends family portal invite
- Email: "See [Caregiver]'s profile and schedule"

### Steps ❌ (Phase 2)
1. Family receives invite email
2. Clicks link → /family/[token]
3. Sets up PIN or simple password
4. Sees caregiver profile card
5. Sees today's schedule
6. Sees shift tracker (arrived, tasks, departed)
7. Sees observations from today's visit
8. Receives WhatsApp update when caregiver arrives

### Success state
Family knows what happened today
without calling the agency.
Agency gets fewer check-in calls.
Everyone's time is respected.

---

## JOURNEY 6 — AIRECRUIT: SCREENING CALL

### Entry points
- Agency creates campaign from /agency/airecruit ✅
- Agency triggers call from caregiver profile ❌

### Steps ✅
1. Agency selects caregivers for campaign
2. Consent gate — caregiver must have recruit_calls consent
3. Compliance hours check (TCPA/CRTC)
4. Suppression list check
5. Vapi outbound call fires
6. AI permission gate — candidate says yes to continue
7. Structured screening (5-7 questions)
8. Call ends
9. Webhook received and verified
10. Transcript stored
11. Score generated (OpenRouter/minimax)
12. Result visible in campaign dashboard

### Failure states
- Caregiver doesn't answer → retry logic ❌ Session D
- Caregiver opts out → added to suppression list ✅
- Vapi down → job queued for retry ❌ not built
- Webhook fails → manual retry needed ❌

---

## JOURNEY 7 — REFERENCE VERIFICATION

### Entry points
- Caregiver adds reference in Step 9 ✅
- Agency triggers reference check from profile ❌

### Steps ✅ (partial)
1. Caregiver enters reference contact details
2. Agency triggers invite from profile (or auto on AI plan)
3. Reference receives email with unique token link
4. Reference clicks → /reference/[token] ✅
5. Fills structured form (relationship, dates, ratings)
6. Submits → stored in caregiver_references
7. Verification tier updated (Tier 3)
8. Verified badge appears on profile ✅

### AIRecruit reference call (Session B) ❌
1. Agency triggers from profile
2. Consent gate checked
3. Compliance hours checked
4. Vapi calls reference
5. Structured interview
6. Transcript + score stored
7. Verification tier upgraded

---

## JOURNEY 8 — ADMIN: AGENCY APPROVAL

### Entry points
- New agency signup notification (email ❌)
- Admin checks /admin/agencies ✅

### Steps ✅
1. Admin receives notification (email ❌ not built)
2. Admin logs into /admin ✅
3. Sees pending agencies ✅
4. Reviews agency details
5. Approves or declines
6. Agency notified (email ❌ not built)
7. If approved → agency gets dashboard access ✅

### Current gaps
- ❌ Email notification to admin on new signup
- ❌ Email notification to agency on approval/decline

---

## JOURNEY 9 — DATA PORTABILITY (PIPEDA)

### Entry points
- Caregiver visits /settings/data-rights ✅

### Steps ✅
1. Caregiver requests data export
2. System creates support ticket (auto) ✅
3. Admin receives ticket
4. Export generated within 30 days (PIPEDA requirement)
5. Caregiver receives download link via email

### Delete flow ✅
1. Caregiver requests deletion
2. System creates support ticket
3. Admin processes within 30 days
4. All data deleted or anonymised
5. Caregiver notified

---

## JOURNEY 10 — WHATSAPP AI ASSISTANT (Phase 3)

### Agency coordinator flow ❌
Entry: Coordinator sends WhatsApp message to Careified number

1. "Find PSW in Scarborough, Tagalog, Monday mornings"
2. AI searches → returns top 3 with scores
3. "Shortlist all"
4. AI confirms shortlist updated
5. "Check Maria's references"
6. AI triggers reference call with consent check
7. "Maria's references are done — what did they say?"
8. AI returns reference summary

### Caregiver flow ❌
Entry: Caregiver messages Careified WhatsApp

1. "Running 15 min late to Mrs Johnson"
2. AI notifies agency + family immediately
3. "Any new matches for me?"
4. AI returns current opportunities
5. "My VSC expires soon"
6. AI checks → "Expires Aug 15, 47 days away. 
                 Set a reminder?"

---

## DEAD ENDS — CURRENT (fix before June 15)

| Dead End | Page | Fix |
|----------|------|-----|
| No contact path after shortlist | /agency/shortlist | Show contact info |
| Approval wait with no status | /agency/pending-approval | Better copy + email |
| Profile live but no notification | Post step 3 | "You're live" banner |
| Empty search with no guidance | /agency/search | Empty state + tips |
| AIRecruit score but no action CTA | Campaign detail | Add next step CTA |

---

Last updated: May 9 2026
