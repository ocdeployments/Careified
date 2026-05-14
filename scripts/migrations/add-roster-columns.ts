import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function migrate() {
  console.log('🔄 Starting migration: add roster columns to caregivers')

  // Add claim_status column
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'caregivers' AND column_name = 'claim_status'
        ) THEN
          ALTER TABLE caregivers ADD COLUMN claim_status VARCHAR(20) DEFAULT 'self_built';
        END IF;
      END
      $$;
    `)
    console.log('✅ Column claim_status added (or already exists)')
  } catch (err) {
    console.error('❌ Failed to add claim_status column:', err)
    throw err
  }

  // Add source_agency_id column
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'caregivers' AND column_name = 'source_agency_id'
        ) THEN
          ALTER TABLE caregivers ADD COLUMN source_agency_id VARCHAR(255) REFERENCES agencies(id);
        END IF;
      END
      $$;
    `)
    console.log('✅ Column source_agency_id added (or already exists)')
  } catch (err) {
    console.error('❌ Failed to add source_agency_id column:', err)
    throw err
  }

  await pool.end()
  console.log('✅ Migration complete: roster columns added to caregivers')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})