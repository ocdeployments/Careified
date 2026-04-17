CLIENT_INTAKE.md — Careified
Complete client intake and profile specification
Build AFTER caregiver profile Steps 1-10 are complete
Last updated: April 2026

***Strategic Context
The client profile is the mirror image of the caregiver profile.
Every client field maps to a caregiver filter.
Without client profiles there is no matching — just a directory.

The agency holds both sides:
- Creates client profiles from family intake
- Matches against caregiver profiles
- Makes placements

Families never directly access client records — only through
the family portal (Session 14) with agency permission.

***Database Schema
New tables required

-- Core client record
CREATE TABLE clients (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 agency_id varchar NOT NULL REFERENCES agencies(id),
 first_name varchar(100),
 last_name varchar(100),
 preferred_name varchar(100),
 date_of_birth date,
 gender varchar(50),
 pronouns varchar(50),
 street text,
 city varchar(100),
 state varchar(50),
 postal_code varchar(20),
 dwelling_type varchar(50),
 phone_client varchar(20),
 phone_family varchar(20),
 email varchar(255),
 preferred_language varchar(50),
 other_languages text[],
 photo_url text,
 status varchar(50) DEFAULT 'active',
 created_at timestamptz DEFAULT NOW(),
 updated_at timestamptz DEFAULT NOW()
);

-- Medical history (HIPAA/PIPEDA sensitive — encrypt at rest)
CREATE TABLE client_medical (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 primary_diagnosis text,
 secondary_diagnoses text[],
 last_hospitalization date,
 last_hospitalization_reason text,
 recent_surgeries jsonb DEFAULT '[]',
 allergies_medication text,
 allergies_food text,
 allergies_other text,
 medications jsonb DEFAULT '[]',
 medication_management varchar(50),
 medication_storage text,
 physician_name varchar(100),
 physician_phone varchar(20),
 physician_clinic varchar(100),
 specialists jsonb DEFAULT '[]',
 preferred_hospital varchar(100),
 health_card_number text, -- encrypted
 insurance_provider varchar(100),
 dnr_on_file boolean DEFAULT false,
 dnr_document_url text,
 advance_directives boolean DEFAULT false,
 advance_directives_url text,
 pain_level integer,
 pain_conditions text,
 bp_baseline varchar(20),
 pulse_baseline integer,
 o2_baseline integer,
 weight_lbs numeric,
 height_inches numeric,
 immunisation_status jsonb DEFAULT '{}'
);

-- Cognitive and mental health
CREATE TABLE client_cognitive (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 cognitive_status varchar(50),
 memory_conditions text[],
 experiences_confusion boolean DEFAULT false,
 confusion_details text,
 sundowning boolean DEFAULT false,
 sundowning_details text,
 wanders boolean DEFAULT false,
 wander_frequency text,
 communication_ability varchar(50),
 can_make_decisions varchar(50),
 mental_health_diagnoses text[],
 mental_health_meds text,
 aggressive_behavior_history boolean DEFAULT false,
 aggressive_behavior_details text,
 behavioral_notes text,
 response_to_new_people varchar(50),
 trauma_history boolean DEFAULT false,
 trauma_notes text -- private, agency eyes only
);

-- ADL/IADL assessment
CREATE TABLE client_adl (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 -- Personal care ADLs (independent/reminders/assistance/dependent)
 bathing varchar(50),
 oral_hygiene varchar(50),
 hair_grooming varchar(50),
 nail_care varchar(50),
 dressing_upper varchar(50),
 dressing_lower varchar(50),
 toileting varchar(50),
 continence varchar(50),
 feeding varchar(50),
 -- Mobility ADLs
 transfers varchar(50),
 walking_indoors varchar(50),
 walking_outdoors varchar(50),
 stairs varchar(50),
 assistive_device varchar(50),
 -- IADLs
 meal_preparation varchar(50),
 housekeeping varchar(50),
 laundry varchar(50),
 grocery_shopping varchar(50),
 finances varchar(50),
 medications varchar(50),
 technology varchar(50),
 transportation varchar(50)
);

-- Home environment
CREATE TABLE client_home (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 home_type varchar(50),
 num_floors integer,
 bedroom_floor varchar(50),
 entrance_stairs boolean DEFAULT false,
 entrance_stairs_count integer,
 wheelchair_accessible varchar(50),
 hospital_bed boolean DEFAULT false,
 hoyer_lift boolean DEFAULT false,
 hoyer_model varchar(100),
 bathroom_type varchar(50),
 grab_bars boolean DEFAULT false,
 fall_hazards boolean DEFAULT false,
 fall_hazard_details text,
 home_cleanliness varchar(50),
 special_equipment text[],
 first_aid_location text,
 emergency_numbers_location text,
 key_access text, -- private
 alarm_code text, -- encrypted
 pets boolean DEFAULT false,
 pet_details text,
 smoking varchar(50),
 pest_issues text
);

-- Family contacts and decision makers
CREATE TABLE client_family (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 full_name varchar(100),
 relationship varchar(50),
 phone varchar(20),
 email varchar(255),
 is_poa boolean DEFAULT false,
 is_healthcare_proxy boolean DEFAULT false,
 authorized_to_speak boolean DEFAULT true,
 portal_access boolean DEFAULT false,
 excluded_from_info boolean DEFAULT false,
 exclusion_details text, -- private
 is_primary boolean DEFAULT false,
 sort_order integer DEFAULT 0
);

-- Care plan and schedule
CREATE TABLE client_care_plan (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 care_start_date date,
 care_types text[],
 days_needed text[],
 shift_times_grid jsonb DEFAULT '{}',
 hours_per_week numeric,
 live_in_needed varchar(50),
 visit_duration varchar(50),
 overnight_needed boolean DEFAULT false,
 weekend_needed boolean DEFAULT false,
 holiday_needed boolean DEFAULT false,
 urgency varchar(50),
 care_duration varchar(50),
 replacing_previous boolean DEFAULT false,
 replacing_reason text,
 daily_routine text,
 nutrition_diet_type varchar(50),
 food_texture varchar(50),
 food_allergies text,
 food_dislikes text,
 favorite_foods text,
 dietary_restrictions text,
 meals_per_day integer,
 appetite_issues boolean DEFAULT false,
 fluid_requirements text,
 dysphagia boolean DEFAULT false
);

-- Caregiver preferences (matching engine fuel)
CREATE TABLE client_preferences (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 preferred_gender varchar(50),
 required_languages text[],
 cultural_preferences text,
 preferred_personality text[],
 routine_preference varchar(50),
 anxiety_on_change boolean DEFAULT false,
 consistency_importance integer, -- 1-5
 negative_past_experiences text,
 positive_past_experiences text,
 hobbies_interests text[],
 conversation_preference varchar(50),
 faith_important boolean DEFAULT false,
 faith_notes text,
 kitchen_comfort varchar(50),
 vehicle_comfort varchar(50),
 unacceptable_behaviors text,
 budget_hourly_min numeric,
 budget_hourly_max numeric,
 payment_method varchar(50)
);

-- Safety and emergency
CREATE TABLE client_safety (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 fall_risk varchar(50),
 falls_last_6_months boolean DEFAULT false,
 fall_count integer,
 elopement_risk boolean DEFAULT false,
 seizure_history boolean DEFAULT false,
 seizure_frequency text,
 seizure_protocol text,
 choking_risk boolean DEFAULT false,
 skin_integrity_risk boolean DEFAULT false,
 skin_concern_areas text,
 preferred_hospital text,
 unresponsive_protocol text,
 fire_evacuation_plan text,
 evacuation_assistance boolean DEFAULT false,
 medical_alert_device boolean DEFAULT false,
 medical_alert_type varchar(100),
 abuse_history_note text -- private, agency eyes only
);

-- Legal consents (all e-signatures with timestamps)
CREATE TABLE client_consents (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 consent_care_services boolean DEFAULT false,
 consent_care_date timestamptz,
 consent_care_signature text,
 hipaa_consent boolean DEFAULT false,
 hipaa_date timestamptz,
 emergency_treatment boolean DEFAULT false,
 transport_consent boolean DEFAULT false,
 photo_consent boolean DEFAULT false,
 service_agreement boolean DEFAULT false,
 client_rights boolean DEFAULT false,
 billing_consent boolean DEFAULT false,
 poa_document_url text,
 dnr_document_url text
);

-- Goals and notes
CREATE TABLE client_goals (
 id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
 client_id varchar NOT NULL REFERENCES clients(id),
 primary_goals text,
 good_day_description text,
 difficult_day_description text,
 brings_joy text,
 family_expectations text,
 day_one_notes text,
 rejected_caregivers text,
 intake_coordinator_notes text, -- internal only
 care_coordinator_id varchar,
 referral_source varchar(50)
);

***The Matching Matrix

Client Field | Caregiver Mirror | Weight
-------------|-----------------|-------
preferred_gender | gender | Hard filter
required_languages | languages[] | Hard filter
shift_times_grid | weekly_grid | Hard filter
client location | service_areas + travel_radius | Hard filter
care_types | services[] + specializations[] | Hard filter
required certifications | credentials[] | Hard filter
cognitive status | dementia skills | Hard filter
physical demands | lift_experience[] | Hard filter
preferred_personality | personality_profile.strengths | 10%
hobbies_interests | (future: caregiver hobbies) | 2%
pets | pet_tolerance | Weighted
smoking | smoker_household | Weighted
budget range | hourly_rate | Weighted
consistency_importance | placement_types (permanent) | Weighted
cultural_preferences | (optional match) | Soft

***Match Score Formula
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

***Routes
- /agency/clients → client list (table view)
- /agency/clients/new → 12-section intake form
- /agency/clients/[id] → client profile view
- /agency/clients/[id]/edit → edit any section
- /agency/clients/[id]/match → ranked caregiver matches
- /agency/clients/[id]/schedule → care schedule management
- /agency/clients/[id]/notes → coordinator notes

***Intake Form UX

Progressive sections (not all shown at once)

Phase 1 — Essential (creates client record, enables matching):
Sections A, B, H, I — 52 fields — ~15 minutes

Phase 2 — Clinical (unlocks full matching):
Sections C, D, E — 55 fields — ~20 minutes

Phase 3 — Environment and safety:
Sections F, G, K — 42 fields — ~15 minutes

Phase 4 — Legal and goals:
Sections J, L — 20 fields — ~10 minutes

Save architecture
Same as caregiver profile:
- Field-level save on blur
- Section save on Next
- Auto-load from DB on return visit

***Security Requirements
- All medical fields (client_medical, client_cognitive) encrypted at rest
- Row-level security: agency_id enforced on every query
- Audit log table: every read/write to client records logged
- Family portal: scoped read-only access to approved fields only
- Caregiver access: approved fields only, no medical history
- Admin access: full, with audit trail

***Build Sequence (After Caregiver Profile Complete)
Session 11A: DB migration — create all 9 tables
Session 11B: /agency/clients list page
Session 11C: Client intake form Phase 1 (sections A + B + H + I)
Session 11D: Client intake form Phase 2 (sections C + D + E)
Session 11E: Client intake form Phase 3 (sections F + G + K)
Session 11F: Client intake form Phase 4 (sections J + L)
Session 11G: Client profile display page
Session 12A: Matching engine (hard filters)
Session 12B: Matching engine (weighted scoring)
Session 12C: /agency/clients/[id]/match display

***This file is the authoritative spec for the client intake and matching system.
Do not build any client feature without reading this file first.

Last updated: April 2026 — designed, not yet built.