SESSION_ROADMAP.md — Careified
Last updated: April 2026 — Session 10C Complete

***Completed Sessions
Session What was built Key commits
1–8D Auth, search, shortlist, profile builder, ID cards, navbar, landing 41c6b31
9 ProfilePreviewCard, IDCardReveal, three-column layout bbaeb1e
10A 51 DB columns, ProfileFormContext, useProfileSave, 3 API routes 3fc6eab

***Current State
Working:
Full Clerk auth flow (agency + caregiver)
Agency search — 20+ filters, 15 demo caregivers
Agency shortlist, admin approval
Profile builder shell — Context integrated, DB load on mount
Profile display /profile/[id]
ID cards /id/[caregiverId], verify /verify/[slug]
ProfilePreviewCard (live split view)
IDCardReveal (credential ceremony)

Session 10B — Step1Identity rebuild ✅ DONE
Session 10C — Step2Services rebuild ✅ DONE (b72055e)

Not yet built:
Steps 3-10 of profile builder (Sessions 10D-10M)
Client intake system (after caregiver profile complete)
Matching engine
Rating system
Family portal
Personality display tab on profile

***Immediate Next — Caregiver Profile Rebuild

Session 10B — Step1Identity rebuild ✅ COMPLETE
File: components/profile/Step1Identity.tsx
useProfileForm Context (no local useState)
useProfileSave hook (onBlur saves to DB)
ZIP auto-populate via zippopotam.us
Working photo upload with preview
DOB + age verification (18+)
Job title, bio, language fluency, work authorisation
Emergency contact (collapsible)
Required field validation (red border on blur)

Session 10C — Step2Services rebuild ✅ COMPLETE (b72055e)
File: app/profile/build/Step2Services.tsx
Remove credential selection (belongs in Step 5)
Remove grocery shopping from Nutrition (belongs in Household only)
Added total years experience
Added self-rating per specialty (learning/competent/experienced/specialist)
Added client types most experienced with
Added care tasks unwilling to perform (honesty field)
Added dietary accommodations
Wire to useProfileSave — onBlur saves each selection

Session 10D — Step3Availability rebuild
File: app/profile/build/Step3Availability.tsx
Remove location fields (already in Step 1)
Remove language fields (already in Step 1)
Add weekly availability grid (Mon-Sun × Morning/Afternoon/Evening/Overnight)
Add min/max hours per week
Add earliest start date + notice period
Add preferred client age group
Add preferred care settings
Add hourly rate range (min + max)
Add employment type preference
Wire to useProfileSave

Session 10E — Step4Location rebuild (NEW STEP)
New file: app/profile/build/Step4Location.tsx
Service area derived from Step 1 location (pre-filled, editable)
Travel radius with visual map showing coverage area
Driver's licence (yes/no + class)
Personal vehicle, willing to drive client
Willing to use client's vehicle
Transit accessible

Session 10F — Step5Credentials rebuild
File: app/profile/build/Step4Certifications.tsx → rename Step5Credentials
Primary credential with mutual exclusivity logic
 (No formal credential deselects all others)
Per credential: licence number, issuing body, issue date, expiry, upload
"I don't have this document" path → Self-declared not Verified
Supporting certifications (repeatable, up to 10)
Expiry alerts (amber 90 days, red if expired)
Education section (level, institution, field, year)
Currently enrolled toggle

Session 10G — Step6Compliance rebuild
File: app/profile/build/Step5References.tsx → repurpose as Step6Compliance
Background check consent + e-signature
Vulnerable sector screen consent (Canada)
Driving record check consent (conditional on has_vehicle)
Criminal offence declaration
TB clearance date + upload
Immunisation records upload
Bonded/insured status
Declaration of accuracy (final checkbox)

Session 10H — Step7Personality (new)
New file: app/profile/build/Step7Personality.tsx
7 forced-choice scenario questions (see MASTER_CONTEXT for full spec)
Working style selectors (autonomy/pace/social energy/conflict)
Top 5 strengths from 12 options
Work environment preferences
Ideal client match (excels with / client personalities / avoid)
Growth areas (up to 3)
Care philosophy (2 optional free text)
Saves to personality_profile JSONB

Session 10I — Step8WorkHistory (new)
New file: app/profile/build/Step8WorkHistory.tsx
Repeatable employer blocks (up to 5)
Per employer: org, title, type, dates, client types, duties, reason leaving, supervisor
Volunteer caregiving experience
Family care experience
Professional memberships
Time estimate shown upfront: "~15 minutes. Save and continue later."

Session 10J — Step9References rebuild
File: app/profile/build/Step5References.tsx → rebuild as Step9References
3 references minimum
12 relationship types
Conditional email/phone fields
Phone auto-format (XXX) XXX-XXXX
3-part consent block per reference
Client reference special handling (admin review, first name + last initial only)
"Add later" option with "References pending" status

Session 10K — Step10OpenQuestions (new)
New file: app/profile/build/Step10OpenQuestions.tsx
3 questions shown one at a time
"Describe a challenging caregiving moment" (200 chars)
"How do you ensure client safety daily?" (200 chars)
"Anything else agencies should know?" (300 chars, optional)
All optional but clearly incentivised

Session 10L — GhostProfile + Preview polish
New file: components/profile/GhostProfile.tsx
Maria Santos example profile shown before any data entered
Crossfades to live preview on first keypress
"What agencies see" checklist below preview
Locked score bar (placeholder until agency placement)
Mobile sticky bottom tier bar

Session 10M — page.tsx full update
Wire all 10 steps
Validation on Next button (required fields must be filled)
Step-specific milestone banners
Goes-live celebration at Step 3

***After Caregiver Profile Complete

Session 11 — Client Intake System
Database migration:
Create 9 new tables (clients, client_medical, client_adl_assessment,
client_home_environment, client_family_contacts, client_care_plan,
client_preferences, client_safety_plan, client_consents)
Routes:
/agency/clients — client list
/agency/clients/new — 12-section intake form
/agency/clients/[id] — client profile
/agency/clients/[id]/match — matched caregivers

Intake form sections:
A — Personal info · B — Family/decision makers · C — Medical history (encrypted)
D — Cognitive/mental health · E — ADL/IADL assessment · F — Home environment
G — Nutrition/dietary · H — Schedule/care plan · I — Caregiver preferences
J — Legal/consent (e-signatures) · K — Safety/emergency · L — Goals/notes
Total: ~169 fields across 12 sections

Security:
HIPAA/PIPEDA compliant
Medical fields encrypted at rest
Row-level security (agency sees only their clients)
Audit log on all access

Session 12 — Matching Engine
Match function: takes client_id → returns ranked caregiver_id list with score 0-100
Hard filters (eliminates):
Language mismatch
Schedule overlap <40%
Outside radius
Missing required certifications
Gender preference mismatch
Cognitive care needed + no relevant cert

Weighted score (ranks remaining):
Service coverage: 30%
Schedule fit: 20%
Trust score: 15%
Credential depth: 10%
Personality fit: 10%
Experience level: 8%
Environment fit: 5%
Interests alignment: 2%

Display: /agency/clients/[id]/match shows ranked list with match breakdown

Session 13 — Rating System
Agency rating form (post-placement)
Trust score calculation engine
Honesty scoring against self-assessment
Badge awards

Session 14 — Family Portal Phase 1
/family/[token] — unique invite per client
Schedule view, caregiver profile card, notification prefs
PWA, no app download, agency-branded

***Before First Real Agency Demo
Clerk production instance upgrade
Apple Developer account ($99/yr) for Wallet passes
Phone OTP via Clerk
Dedicated copy session (all pages still placeholder)
UX debt: agency signup form error handling
SSL certificate for Render DB (currently ssl: rejectUnauthorized: false)

***Demo Script (5 Minutes)
1. Agency logs in → /agency/search
2. Filter: Dementia + Available now → Aisha 4.9★, Maria 4.8★
3. Filter: Live-in → Di Tremblay, Helen Kowalski
4. Click Aisha → full profile (bio, specialties, certifications, logistics)
5. Show shortlist button → /agency/shortlist
6. Show: /profile/build → three-column split view, live preview
7. Show: ID card reveal after submit
8. (Post Session 11): /agency/clients/new → intake form
9. (Post Session 12): /agency/clients/[id]/match → ranked matches

***Last updated: April 2026 — Session 10C Complete
Priority: Step3 rebuild (10D) → Step4-10