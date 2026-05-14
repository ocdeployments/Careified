import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  // Check if table already exists
  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_name = 'support_tickets'
  `)

  if (rows.length > 0) {
    console.log('Table support_tickets already exists, skipping.')
    await pool.end()
    return
  }

  // Create table - use VARCHAR for foreign keys to match referenced table types
  await pool.query(`
    CREATE TABLE support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number VARCHAR(20) NOT NULL UNIQUE,
      submitter_id VARCHAR(255) NOT NULL,
      submitter_type VARCHAR(20) NOT NULL,
      agency_id VARCHAR(255),
      caregiver_id VARCHAR(255),
      type VARCHAR(30) NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      status VARCHAR(30) NOT NULL DEFAULT 'open',
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      admin_notes TEXT,
      assigned_to VARCHAR(255),
      sla_due_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMP,
      closed_at TIMESTAMP
    )
  `)

  console.log('Created support_tickets table.')
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})