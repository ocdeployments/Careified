import { Pool } from 'pg'
import * as fs from 'fs'

async function runMigration(sqlFilePath: string) {
  if (!sqlFilePath) {
    console.error('Usage: npx tsx scripts/run-migration.ts <sql-file>')
    process.exit(1)
  }

  if (!fs.existsSync(sqlFilePath)) {
    console.error(`File not found: ${sqlFilePath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf-8')
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  })

  try {
    await pool.query(sql)
    console.log(`✅ Migration completed: ${sqlFilePath}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${error}`)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

const sqlFile = process.argv[2]
runMigration(sqlFile)