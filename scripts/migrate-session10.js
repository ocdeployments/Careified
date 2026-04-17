// Careified — Session 10A Migration
// Adds missing profile builder columns to caregivers table
// Run: node scripts/migrate-session10.js

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const statements = [
 // Identity additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS language_fluency jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS work_authorisation boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS job_title varchar(100)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS date_of_birth date`,

 // Services additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS skill_ratings jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS dietary_cooking text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS client_types text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS unwilling_tasks text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS years_experience_per_specialty jsonb DEFAULT '{}'`,

 // Availability additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS weekly_grid jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS min_hours_per_week integer`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS max_hours_per_week integer`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS earliest_start_date date`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS notice_period varchar(50)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS holiday_available boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS preferred_age_group varchar(50)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS preferred_settings text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS hourly_rate_max numeric(8,2)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS employment_type varchar(50) DEFAULT 'either'`,

 // Location additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS has_drivers_license boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS willing_to_transport boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS willing_client_vehicle boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS transit_accessible boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS service_areas text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS open_to_urgent boolean DEFAULT false`,

 // Credentials additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS currently_enrolled boolean DEFAULT false`,

 // Compliance additions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS background_consent boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS background_consent_date timestamptz`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS vulnerable_sector_check varchar(50) DEFAULT 'not_done'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS driving_record_check varchar(50) DEFAULT 'not_done'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS criminal_declaration boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS criminal_declaration_detail text`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS bonded_insured boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS immunisation_records jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS tb_clearance_date date`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS declaration_accurate boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS declaration_date timestamptz`,

 // Personality (already exists from earlier session — use IF NOT EXISTS)
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS personality_profile jsonb DEFAULT '{}'`,

 // Work history
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS work_history jsonb DEFAULT '[]'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS volunteer_experience boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS volunteer_description text`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS family_care_experience boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS family_care_description text`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS professional_memberships text[] DEFAULT '{}'`,

 // Open profile questions
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS open_q1 text`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS open_q2 text`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS open_q3 text`,

 // Profile meta
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS profile_completion_pct numeric(5,2) DEFAULT 0`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS profile_phase integer DEFAULT 0`,
];

async function run() {
 const client = await pool.connect();
 let passed = 0;
 let failed = 0;
 try {
 for (const sql of statements) {
 try {
 await client.query(sql);
 const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || sql;
 console.log('✅', col);
 passed++;
 } catch (err) {
 console.error('❌', err.message);
 failed++;
 }
 }
 console.log(`\nDone. ${passed} passed, ${failed} failed.`);
 } finally {
 client.release();
 pool.end();
 }
}

run();
