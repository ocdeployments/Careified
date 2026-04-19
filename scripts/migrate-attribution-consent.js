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
  console.log('🔧 Attribution + Consent + Encryption Migration\n')

  // ── caregiver_attributes ──
  await run(
    `CREATE TABLE IF NOT EXISTS caregiver_attributes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      caregiver_id uuid NOT NULL,
      field_name text NOT NULL,
      value jsonb,
      source text NOT NULL,
      tier integer NOT NULL CHECK (tier BETWEEN 1 AND 4),
      verified_at timestamptz DEFAULT now(),
      expires_at timestamptz,
      status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked','pending')),
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`,
    'caregiver_attributes table'
  )
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_attrs_caregiver ON caregiver_attributes(caregiver_id)`, 'cg_attrs caregiver idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_attrs_field ON caregiver_attributes(caregiver_id, field_name)`, 'cg_attrs field idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_attrs_status ON caregiver_attributes(status) WHERE status = 'active'`, 'cg_attrs status idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_attrs_expires ON caregiver_attributes(expires_at) WHERE expires_at IS NOT NULL`, 'cg_attrs expiry idx')

  // ── caregiver_consents ──
  await run(
    `CREATE TABLE IF NOT EXISTS caregiver_consents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      caregiver_id uuid NOT NULL,
      consent_type text NOT NULL,
      legal_text_version text NOT NULL,
      legal_text_hash text NOT NULL,
      granted boolean NOT NULL,
      ip_address text,
      user_agent text,
      granted_at timestamptz DEFAULT now(),
      revoked_at timestamptz
    )`,
    'caregiver_consents table'
  )
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_consents_caregiver ON caregiver_consents(caregiver_id)`, 'cg_consents caregiver idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_cg_consents_type ON caregiver_consents(caregiver_id, consent_type)`, 'cg_consents type idx')

  // ── agency_consents ──
  await run(
    `CREATE TABLE IF NOT EXISTS agency_consents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id uuid NOT NULL,
      clerk_user_id text NOT NULL,
      consent_type text NOT NULL,
      legal_text_version text NOT NULL,
      legal_text_hash text NOT NULL,
      granted boolean NOT NULL,
      ip_address text,
      user_agent text,
      granted_at timestamptz DEFAULT now(),
      revoked_at timestamptz
    )`,
    'agency_consents table'
  )
  await run(`CREATE INDEX IF NOT EXISTS idx_ag_consents_agency ON agency_consents(agency_id)`, 'ag_consents agency idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_ag_consents_type ON agency_consents(agency_id, consent_type)`, 'ag_consents type idx')

  // ── client_data_consents ──
  await run(
    `CREATE TABLE IF NOT EXISTS client_data_consents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id uuid NOT NULL,
      client_needs_id uuid,
      clerk_user_id text NOT NULL,
      authorization_confirmed boolean NOT NULL,
      legal_text_version text NOT NULL,
      legal_text_hash text NOT NULL,
      ip_address text,
      user_agent text,
      granted_at timestamptz DEFAULT now()
    )`,
    'client_data_consents table'
  )
  await run(`CREATE INDEX IF NOT EXISTS idx_client_consents_client ON client_data_consents(client_needs_id)`, 'client_consents client idx')

  // ── PHI encryption columns on client_needs ──
  // Add _encrypted variants; keep originals for now as write-through during transition.
  await run(
    `ALTER TABLE client_needs
      ADD COLUMN IF NOT EXISTS primary_condition_encrypted bytea,
      ADD COLUMN IF NOT EXISTS secondary_conditions_encrypted bytea,
      ADD COLUMN IF NOT EXISTS mobility_level_encrypted bytea,
      ADD COLUMN IF NOT EXISTS medications_complex_encrypted bytea,
      ADD COLUMN IF NOT EXISTS client_first_name_encrypted bytea,
      ADD COLUMN IF NOT EXISTS encryption_key_version integer DEFAULT 1`,
    'client_needs encrypted columns'
  )

  // ── audit_log ──
  await run(
    `CREATE TABLE IF NOT EXISTS audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_type text NOT NULL CHECK (actor_type IN ('caregiver','agency','admin','system')),
      actor_id text NOT NULL,
      action text NOT NULL,
      resource_type text,
      resource_id text,
      metadata jsonb DEFAULT '{}'::jsonb,
      ip_address text,
      user_agent text,
      created_at timestamptz DEFAULT now()
    )`,
    'audit_log table'
  )
  await run(`CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_type, actor_id)`, 'audit actor idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id)`, 'audit resource idx')
  await run(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC)`, 'audit time idx')

  // ── Verification
  console.log('\n── Verification ──')
  const tables = ['caregiver_attributes', 'caregiver_consents', 'agency_consents', 'client_data_consents', 'audit_log']
  for (const t of tables) {
    const r = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1) as exists`,
      [t]
    )
    console.log(` ${r.rows[0].exists ? '✅' : '❌'} ${t}`)
  }

  const enc = await pool.query(
    `SELECT column_name FROM information_schema.columns
    WHERE table_name = 'client_needs' AND column_name LIKE '%_encrypted'
    ORDER BY column_name`
  )
  console.log(` ✅ Encrypted columns on client_needs: ${enc.rows.length}`)

  console.log('\n✅ Migration complete')
}

migrate()
  .catch(err => { console.error('❌', err.message); process.exit(1) })
  .finally(() => pool.end())
