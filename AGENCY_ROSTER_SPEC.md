# AGENCY_ROSTER_SPEC.md — Agency Roster Specification
# Purpose: Agency builds caregiver profiles on behalf of caregivers, caregiver claims ownership
# Status: NOT BUILT — target May 13-14 2026
# Owner: Both

---

## 1. PURPOSE

Agencies already maintain caregiver data manually in spreadsheets.
Instead of asking caregivers to build profiles from scratch (friction),
agencies seed the supply side for us.

Agency uploads caregiver roster → Careified creates stub profiles →
Caregiver gets notified "claim your profile" → Caregiver owns it forever,
even after leaving the agency.

This is the viral loop that builds the supply side without a separate
caregiver acquisition campaign.

---

## 2. USER STORIES

### As an agency coordinator:
- I want to upload my existing caregiver roster via CSV so I don't have to manually enter each profile
- I want to add a single caregiver manually with basic details (name, phone, email, role)
- I want to see which of my rostered caregivers have claimed their profiles
- I want to regenerate a claim link if it expired

### as a caregiver:
- I want to receive an email/SMS telling me my agency added me to Careified
- I want to claim my profile with one click and complete my details
- I want to own my profile forever — even if I leave this agency
- I want to edit my profile after claiming

---

## 3. DB SCHEMA

### New Table: caregiver_claim_tokens
```sql
CREATE TABLE caregiver_claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email_sent_to VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  claimed_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' -- pending, claimed, expired
);
```

### Modifications to caregivers table
Add columns:
```sql
ALTER TABLE caregivers ADD COLUMN claim_status VARCHAR(20) DEFAULT 'self_built'; -- agency_built, claimed, self_built
ALTER TABLE caregivers ADD COLUMN source_agency_id UUID REFERENCES agencies(id);
```

---

## 4. TOKEN SEMANTICS

- **Format:** UUID (gen_random_uuid())
- **Single-use:** Once claimed, token is consumed (status = 'claimed')
- **TTL:** 30 days from creation
- **Regenerable:** Agency can generate new token for same caregiver
- **Email:** Token sent to caregiver's email on file

---

## 5. EMAIL FLOW

### Template: Caregiver profile claim
Subject: "[Agency Name] created a Careified profile for you — claim it now"

Body:
```
Hi [First Name],

[Agency Name] added you to Careified — the reputation platform for professional caregivers.

We've created a basic profile for you with the information we have on file.
Claim it now to:
- Add your own details and photo
- Make your credentials visible to agencies
- Build your portable professional reputation

Claim your profile: [claim_url]

This link expires in 30 days.

The Careified Team
```

---

## 6. CONFLICT CASES

| Scenario | Resolution |
|----------|-----------|
| Caregiver already has self-built profile under same email | Prompt to merge or keep separate. If merge: transfer agency_built data into existing profile, mark source_agency_id |
| Caregiver already has profile under different email but same phone | Prompt to link accounts or create new. Phone is unique identifier. |
| Token expires before claim | Agency can regenerate new token from dashboard |
| Caregiver claims then deletes profile | Profile soft-deleted. Can rebuild from scratch or ask agency to re-invite |
| Agency tries to recreate after claim | Block — caregiver already claimed. Show "already claimed" status in roster |
| Two agencies build profiles for same caregiver | First claim wins. Second agency sees "already claimed" status |

---

## 7. DATA OWNERSHIP RULES

- **Pre-claim:** Agency owns the data. Agency can edit all fields.
- **Post-claim:** Caregiver owns the data. Agency loses edit rights.
- **After departure:** Caregiver retains profile. Agency cannot delete or modify.
- **Profile visibility:** Agency that created stub sees it in roster until claimed. After claim, only visible in search.

---

## 8. CSV IMPORT

### Column specification
```
first_name, last_name, email, phone, role, years_experience, city, province_state
```

### Validation rules
- first_name: required, 2-50 chars
- last_name: required, 2-50 chars
- email: required, valid format, unique in system
- phone: required, 10 digits
- role: required, from enum (PSW, HCA, DSW, Companion, LiveIn, Other)
- years_experience: optional, 0-50
- city: optional
- province_state: optional, CA provinces or US states

### Flow
1. Agency downloads template
2. Fills in caregiver data
3. Uploads CSV
4. Server validates all rows
5. Preview screen — shows valid rows + errors
6. Agency confirms
7. Stub profiles created in bulk
8. Claim emails sent to all valid rows

### Partial-success handling
If 95/100 rows valid, create 95 profiles, show 5 errors.
Agency can fix errors and re-upload.

---

## 9. API ROUTES NEEDED

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/roster/import | Agency | CSV upload, bulk create stubs |
| POST | /api/roster/add | Agency | Add single caregiver manually |
| GET | /api/roster/list | Agency | List agency's rostered caregivers |
| POST | /api/roster/regenerate-token | Agency | Generate new claim token |
| GET | /api/roster/status/:caregiverId | Agency | Check claim status |
| GET | /api/claim/:token | Public | Claim page for caregiver |
| POST | /api/claim/:token | Public | Submit claim, create account |

---

## 10. TEST PLAN

### Happy path
1. Agency uploads CSV with 5 valid caregivers
2. 5 stub profiles created
3. 5 claim emails sent
4. Caregiver clicks link, creates account
5. Profile ownership transferred to caregiver
6. Agency sees "claimed" status

### Conflict cases
- Same email twice in CSV → error, reject
- Token expires → regenerate works
- Duplicate email in system → merge prompt shown

### Edge cases
- Empty CSV → error message
- Invalid phone format → row-level error
- Agency deletes themselves → claim tokens invalidated

---

## 11. STATUS

- [ ] DB migration — add columns to caregivers
- [ ] DB migration — create caregiver_claim_tokens table
- [ ] /api/roster/import endpoint
- [ ] /api/roster/add endpoint
- [ ] /api/roster/list endpoint
- [ ] /api/roster/regenerate-token endpoint
- [ ] /api/claim/:token public page
- [ ] CSV template + validation
- [ ] Email template integration (via Resend)
- [ ] UI: Agency roster dashboard
- [ ] UI: Claim flow for caregiver
- [ ] Test all conflict cases

---

Last updated: May 9 2026
Target build: May 13-14 2026