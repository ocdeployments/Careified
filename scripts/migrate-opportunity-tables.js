const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

async function run(sql, label) {
 try { await pool.query(sql); console.log(`✅ ${label}`) }
 catch (err) { console.error(`❌ ${label}: ${err.message}`); throw err }
}

async function migrate() {
 console.log('🔧 Opportunity tables migration\n')

 // Caregiver expresses interest in an opportunity
 await run(
 `CREATE TABLE IF NOT EXISTS caregiver_opportunity_interest (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 caregiver_id uuid NOT NULL,
 client_needs_id uuid NOT NULL,
 alignment_score_at_expression integer,
 status text NOT NULL DEFAULT 'interested' CHECK (status IN ('interested','withdrawn','agency_contacted','closed')),
 message text,
 created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now(),
 UNIQUE (caregiver_id, client_needs_id)
 )`,
 'caregiver_opportunity_interest table'
 )
 await run(
 `CREATE INDEX IF NOT EXISTS idx_cg_interest_caregiver ON caregiver_opportunity_interest(caregiver_id)`,
 'cg_interest caregiver idx'
 )
 await run(
 `CREATE INDEX IF NOT EXISTS idx_cg_interest_need ON caregiver_opportunity_interest(client_needs_id)`,
 'cg_interest need idx'
 )

 // Caregiver has dismissed/seen an opportunity (so we don't keep re-showing)
 await run(
 `CREATE TABLE IF NOT EXISTS caregiver_opportunity_seen (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 caregiver_id uuid NOT NULL,
 client_needs_id uuid NOT NULL,
 dismissed boolean DEFAULT false,
 seen_at timestamptz DEFAULT now(),
 UNIQUE (caregiver_id, client_needs_id)
 )`,
 'caregiver_opportunity_seen table'
 )
 await run(
 `CREATE INDEX IF NOT EXISTS idx_cg_seen_caregiver ON caregiver_opportunity_seen(caregiver_id)`,
 'cg_seen caregiver idx'
 )

 console.log('\n✅ Migration complete')
}

migrate()
 .catch(err => { console.error('❌', err.message); process.exit(1) })
 .finally(() => pool.end())
