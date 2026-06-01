import { Pool } from 'pg'

const pool = new Pool({
  connectionString: "postgresql://postgres.gvyvpamdvwqwqpbdhfur:REDACTED@aws-1-ca-central-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
})

async function main() {
  const [agencies, cols, table] = await Promise.all([
    pool.query('SELECT count(*)::int as count FROM agencies'),
    pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'agencies' AND column_name LIKE 'telegram%'"),
    pool.query('SELECT count(*)::int as count FROM telegram_connect_codes')
  ])
  console.log('Agencies:', agencies.rows[0].count)
  console.log('Telegram columns:', cols.rows.map(r => r.column_name).join(', '))
  console.log('Connect codes:', table.rows[0].count)
  await pool.end()
}

main()