
// Session 10F addition — run manually if restoring DB from scratch
// ALTER TABLE caregivers ADD COLUMN certifications jsonb;
// Applied directly: April 2026

// Session 10J addition — caregiver_references consent columns
// ALTER TABLE caregiver_references ADD COLUMN IF NOT EXISTS consent_knows boolean DEFAULT false,
// ADD COLUMN IF NOT EXISTS consent_agreed boolean DEFAULT false,
// ADD COLUMN IF NOT EXISTS consent_understands boolean DEFAULT false,
// ADD COLUMN IF NOT EXISTS reference_type varchar(50);
// Applied directly: April 2026
