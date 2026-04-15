const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const statements = [
 // Search and availability
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS days_available text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS shift_times jsonb DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS open_to_urgent boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS min_hours_per_week integer`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS max_hours_per_week integer`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS holiday_available boolean DEFAULT false`,
 // Logistics
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS has_drivers_license boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS willing_client_vehicle boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS transit_accessible boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS willing_to_transport boolean DEFAULT false`,
 // Compatibility
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS pet_tolerance varchar(50) DEFAULT 'no_preference'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS smoker_household boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS technology_comfort varchar(50) DEFAULT 'basic'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS employment_type varchar(50) DEFAULT 'either'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS lift_experience text[] DEFAULT '{}'`,
 // Compliance
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS medicare_certified boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS vulnerable_sector_check varchar(50) DEFAULT 'not_done'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS driving_record_check varchar(50) DEFAULT 'not_done'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS bonded_insured boolean DEFAULT false`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS provincial_registry_number varchar(100)`,
 // Profile
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS preferred_name varchar(100)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS job_title varchar(100)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS clients_served_count integer DEFAULT 0`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS profile_completion_pct numeric(5,2) DEFAULT 0`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS work_style varchar(50)`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}'`,
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS dietary_cooking text[] DEFAULT '{}'`,
 // Personality (Phase 2 — column ready now)
 `ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS personality_profile jsonb DEFAULT '{}'`,
];

async function run() {
 const client = await pool.connect();
 let passed = 0;
 let failed = 0;
 try {
 for (const sql of statements) {
 try {
 await client.query(sql);
 console.log('✅', sql.substring(33, 90));
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
