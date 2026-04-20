// One-time migration: add ghost profile columns to caregivers table
const { Pool } = require('../node_modules/pg')

const pool = new Pool({
  connectionString: 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
})

async function run() {
  console.log('Adding ghost profile columns...')

  const stmts = [
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS profile_status VARCHAR(50) DEFAULT 'unclaimed'",
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT false",
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS claim_token VARCHAR(255)",
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS npi_number VARCHAR(20)",
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS license_source VARCHAR(100)",
    "ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS verification_tier INT DEFAULT 4",
    "CREATE UNIQUE INDEX IF NOT EXISTS caregivers_claim_token_key ON caregivers(claim_token) WHERE claim_token IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS caregivers_npi_number_key ON caregivers(npi_number) WHERE npi_number IS NOT NULL",
  ]

  for (const sql of stmts) {
    await pool.query(sql)
    console.log('OK:', sql.slice(0, 60))
  }

  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='caregivers' AND column_name IN ('profile_status','claimed','claim_token','npi_number','license_source','verification_tier') ORDER BY column_name"
  )
  console.log('Verified columns:', r.rows.map(x => x.column_name).join(', '))
  await pool.end()
  console.log('Done.')
}

run().catch(e => { console.error('ERROR:', e.message); pool.end() })
