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
    WHERE table_name = 'ticket_messages'
  `)

  if (rows.length > 0) {
    console.log('Table ticket_messages already exists, skipping.')
    await pool.end()
    return
  }

  // Create table
  await pool.query(`
    CREATE TABLE ticket_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id VARCHAR(255) NOT NULL,
      sender_type VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      internal BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `)

  console.log('Created ticket_messages table.')
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})