# CLIENT_INTAKE.md — Careified Client Intake System

**Purpose:** Full spec for client intake form and matching engine
**Updated:** May 11 2026
**Update trigger:** When client intake is built or spec changes
**Owner:** Both

**DO NOT DUPLICATE:** Matching weights (CAREIFIED_SPEC.md),
DB schema (ARCHITECTURE.md)

---

## STATUS: DESIGNED — NOT YET BUILT

---

## STRATEGIC CONTEXT

The client profile is the mirror image of the caregiver profile.
Every client field maps to a caregiver filter for matching.
Without client profiles there is no matching — just a directory.

The agency holds both sides:
- Creates client profiles from family intake
- Matches against caregiver profiles
- Makes placements

Families never directly access client records — only through
the family portal (Session 14) with agency permission.

---

## BUILD ORDER

Finish caregiver profile Steps 1-10 FIRST, then build client intake.

---

## DATABASE TABLES NEEDED

- `clients` — core client record
- `client_medical` — Section C (medical history, encrypted)
- `client_cognitive` — cognitive and mental health
- `client_adl` — ADL/IADL assessment
- `client_home` — home environment safety
- `client_family` — family contacts and decision makers
- `client_care_plan` — schedule and care plan
- `client_preferences` — caregiver preferences (matching engine fuel)
- `client_safety` — safety and emergency
- `client_consents` — legal consents with e-signatures
- `client_goals` — goals and notes

---

## THE MATCHING MATRIX

| Client Field | Caregiver Mirror | Weight |
|-------------|-----------------|-------|
| preferred_gender | gender | Hard filter |
| required_languages | languages[] | Hard filter |
| shift_times_grid | weekly_grid | Hard filter |
| client location | service_areas + travel_radius | Hard filter |
| care_types | services[] + specializations[] | Hard filter |
| required certifications | credentials[] | Hard filter |
| cognitive status | dementia skills | Hard filter |
| physical demands | lift_experience[] | Hard filter |
| preferred_personality | personality_profile.strengths | 10% |
| hobbies_interests | (future: caregiver hobbies) | 2% |
| pets | pet_tolerance | Weighted |
| smoking | smoker_household | Weighted |
| budget range | hourly_rate | Weighted |
| consistency_importance | placement_types (permanent) | Weighted |
| cultural_preferences | (optional match) | Soft |

---

## MATCH SCORE FORMULA

Hard filters: pass/fail (fail = excluded from results)

Weighted score (0-100):
- service_coverage 30% — % of required services caregiver offers
- schedule_fit 20% — % overlap required/available hours
- trust_score 15% — aggregate_score normalized to 0-15
- credential_depth 10% — certs beyond minimum requirement
- personality_fit 10% — client preference vs caregiver tags
- experience_level 8% — years + specialization depth match
- environment_fit 5% — pets/smoke/physical demands
- interests_alignment 2% — hobbies overlap

---

## ROUTES

- `/agency/clients` → client list (table view)
- `/agency/clients/new` → 12-section intake form
- `/agency/clients/[id]` → client profile view
- `/agency/clients/[id]/edit` → edit any section
- `/agency/clients/[id]/match` → ranked caregiver matches
- `/agency/clients/[id]/schedule` → care schedule management
- `/agency/clients/[id]/notes` → coordinator notes

---

## INTAKE FORM UX

Progressive sections (not all shown at once)

Phase 1 — Essential (creates client record, enables matching):
Sections A, B, H, I — 52 fields — ~15 minutes

Phase 2 — Clinical (unlocks full matching):
Sections C, D, E — 55 fields — ~20 minutes

Phase 3 — Environment and safety:
Sections F, G, K — 42 fields — ~15 minutes

Phase 4 — Legal and goals:
Sections J, L — 20 fields — ~10 minutes

---

## BUILD SEQUENCE

- Session 11A: DB migration — create all 9 tables
- Session 11B: /agency/clients list page
- Session 11C: Client intake form Phase 1 (sections A + B + H + I)
- Session 11D: Client intake form Phase 2 (sections C + D + E)
- Session 11E: Client intake form Phase 3 (sections F + G + K)
- Session 11F: Client intake form Phase 4 (sections J + L)
- Session 11G: Client profile display page
- Session 12A: Matching engine (hard filters)
- Session 12B: Matching engine (weighted scoring)
- Session 12C: /agency/clients/[id]/match display

