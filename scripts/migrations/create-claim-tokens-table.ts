import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function migrate() {
  console.log('🔄 Starting migration: create caregiver_claim_tokens table')

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS caregiver_claim_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        caregiver_id VARCHAR(255) NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
        agency_id VARCHAR(255) NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        email_sent_to VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
        claimed_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
      );
    `)
    console.log('✅ Table caregiver_claim_tokens created (or already exists)')
  } catch (err) {
    console.error('❌ Failed to create table:', err)
    throw err
  }

  await pool.end()
  console.log('✅ Migration complete: caregiver_claim_tokens table created')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})