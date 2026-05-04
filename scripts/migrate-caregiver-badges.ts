// Migration: Add badges column to caregivers table
// Usage: npx tsx scripts/migrate-caregiver-badges.ts

import { Pool } from 'pg'

const DATABASE_URL = 'postgresql://careified_app:BqXhCkKsxIP9TlRVjtXbshjJaoe0Lr7o@dpg-d7fd1jflk1mc73dbjdn0-a.oregon-postgres.render.com/careified'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('Adding badges column to caregivers...')

  // Check if column exists
  const { rows: existing } = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'badges'
  `)

  if (existing.length === 0) {
    await pool.query(`
      ALTER TABLE caregivers ADD COLUMN badges JSONB DEFAULT '[]'
    `)
    console.log('✅ badges column added')
  } else {
    console.log('✅ badges column already exists')
  }

  await pool.end()
  console.log('Migration complete.')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})