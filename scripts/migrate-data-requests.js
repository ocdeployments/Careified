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
 console.log('🔧 Data requests migration\n')

 await run(
 `CREATE TABLE IF NOT EXISTS data_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 requester_type text NOT NULL CHECK (requester_type IN ('caregiver','agency')),
 requester_id uuid NOT NULL,
 clerk_user_id text NOT NULL,
 request_type text NOT NULL CHECK (request_type IN ('export','deletion','correction')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','denied','cancelled')),
 payload jsonb DEFAULT '{}'::jsonb,
 result jsonb,
 ip_address text,
 user_agent text,
 created_at timestamptz DEFAULT now(),
 completed_at timestamptz,
 denied_reason text
 )`,
 'data_requests table'
 )
 await run(
 `CREATE INDEX IF NOT EXISTS idx_data_requests_requester ON data_requests(requester_type, requester_id)`,
 'requester idx'
 )
 await run(
 `CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status)`,
 'status idx'
 )

 console.log('\n✅ Migration complete')
}

migrate()
 .catch(err => { console.error('❌', err.message); process.exit(1) })
 .finally(() => pool.end())
