import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  // Check if column already exists
  const { rows } = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'referred_by'
  `)

  if (rows.length > 0) {
    console.log('Column referred_by already exists, skipping.')
    await pool.end()
    return
  }

  // Add column - use VARCHAR to match id column type
  await pool.query(`
    ALTER TABLE caregivers
    ADD COLUMN referred_by VARCHAR(255) REFERENCES caregivers(id)
  `)

  console.log('Added referred_by column to caregivers table.')
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})