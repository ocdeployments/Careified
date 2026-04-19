const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

async function run(sql, label) {
 try {
 await pool.query(sql)
 console.log(`✅ ${label}`)
 } catch (err) {
 console.error(`❌ ${label}`)
 console.error(err.message)
 throw err
 }
}

async function migrate() {
 console.log('🔧 Careified — Matching Engine Migration')
 console.log('─────────────────────────────────────────\n')

 // ── PART 1: New columns on caregivers table ──
 console.log('Part 1: Adding columns to caregivers table')

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS work_style jsonb DEFAULT '{}'::jsonb`,
 'work_style column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS client_preferences jsonb DEFAULT '{}'::jsonb`,
 'client_preferences column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS environment_comfort jsonb DEFAULT '{}'::jsonb`,
 'environment_comfort column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS motivation jsonb DEFAULT '{}'::jsonb`,
 'motivation column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS reliability_metrics jsonb DEFAULT '{}'::jsonb`,
 'reliability_metrics column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS best_fit_profile jsonb DEFAULT '{}'::jsonb`,
 'best_fit_profile column'
 )

 await run(
 `ALTER TABLE caregivers
 ADD COLUMN IF NOT EXISTS profile_strength_score integer DEFAULT 0`,
 'profile_strength_score column'
 )

 // ── PART 2: client_needs table ──
 console.log('\nPart 2: Creating client_needs table')

 await run(
 `CREATE TABLE IF NOT EXISTS client_needs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 agency_id uuid NOT NULL,

 client_first_name text,
 client_age integer,

 primary_condition text,
 secondary_conditions text[] DEFAULT '{}',
 mobility_level text,
 medications_complex boolean DEFAULT false,

 services_needed text[] DEFAULT '{}',
 care_intensity text,
 placement_type text,
 hours_per_week integer,
 start_date date,
 duration_expected text,

 city text,
 state text,
 postal_code text,

 pets_present text[] DEFAULT '{}',
 smoking_household boolean DEFAULT false,
 home_condition text,
 family_dynamics text,

 language_required text,
 gender_preference text,
 cultural_preference text,
 personality_desired text[] DEFAULT '{}',

 hourly_rate_max numeric(6,2),

 status text DEFAULT 'open',
 matched_caregiver_id uuid,

 created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now()
 )`,
 'client_needs table'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_client_needs_agency
 ON client_needs(agency_id)`,
 'client_needs agency index'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_client_needs_status
 ON client_needs(status)`,
 'client_needs status index'
 )

 // ── PART 3: placement_outcomes table ──
 console.log('\nPart 3: Creating placement_outcomes table')

 await run(
 `CREATE TABLE IF NOT EXISTS placement_outcomes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 caregiver_id uuid NOT NULL,
 agency_id uuid NOT NULL,
 client_needs_id uuid,

 start_date date,
 end_date date,
 duration_days integer,

 completion_rate numeric(4,3),
 no_show_count integer DEFAULT 0,
 reason_ended text,

 agency_rating jsonb DEFAULT '{}'::jsonb,
 would_place_again boolean,
 private_notes text,

 created_at timestamptz DEFAULT now()
 )`,
 'placement_outcomes table'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_placement_outcomes_caregiver
 ON placement_outcomes(caregiver_id)`,
 'placement_outcomes caregiver index'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_placement_outcomes_agency
 ON placement_outcomes(agency_id)`,
 'placement_outcomes agency index'
 )

 // ── PART 4: match_scores table ──
 console.log('\nPart 4: Creating match_scores table')

 await run(
 `CREATE TABLE IF NOT EXISTS match_scores (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 caregiver_id uuid NOT NULL,
 client_needs_id uuid NOT NULL,

 overall_score integer,
 clinical_fit integer,
 reliability integer,
 logistics_match integer,
 personality_compatibility integer,
 cultural_language_fit integer,
 retention_likelihood integer,
 environment_fit integer,

 strong_fits text[] DEFAULT '{}',
 gaps text[] DEFAULT '{}',

 created_at timestamptz DEFAULT now()
 )`,
 'match_scores table'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_match_scores_caregiver
 ON match_scores(caregiver_id)`,
 'match_scores caregiver index'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_match_scores_client
 ON match_scores(client_needs_id)`,
 'match_scores client index'
 )

 await run(
 `CREATE INDEX IF NOT EXISTS idx_match_scores_overall
 ON match_scores(overall_score DESC)`,
 'match_scores overall index'
 )

 // ── PART 5: Verification ──
 console.log('\nPart 5: Verifying migration')

 const colCheck = await pool.query(`
 SELECT column_name
 FROM information_schema.columns
 WHERE table_name = 'caregivers'
 AND column_name IN (
 'work_style','client_preferences','environment_comfort',
 'motivation','reliability_metrics','best_fit_profile',
 'profile_strength_score'
 )
 ORDER BY column_name
 `)
 console.log(` ✅ Caregivers columns added: ${colCheck.rows.length}/7`)
 colCheck.rows.forEach(r => console.log(` - ${r.column_name}`))

 const tableCheck = await pool.query(`
 SELECT table_name
 FROM information_schema.tables
 WHERE table_name IN ('client_needs','placement_outcomes','match_scores')
 ORDER BY table_name
 `)
 console.log(` ✅ New tables created: ${tableCheck.rows.length}/3`)
 tableCheck.rows.forEach(r => console.log(` - ${r.table_name}`))

 const caregiverCount = await pool.query(
 `SELECT COUNT(*) FROM caregivers WHERE status = 'approved'`
 )
 console.log(` ✅ Approved caregivers (unchanged): ${caregiverCount.rows[0].count}`)

 console.log('\n─────────────────────────────────────────')
 console.log('✅ Migration complete\n')
}

migrate()
 .catch(err => {
 console.error('\n❌ Migration failed:', err.message)
 process.exit(1)
 })
 .finally(() => pool.end())
