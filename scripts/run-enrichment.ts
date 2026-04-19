// scripts/run-enrichment.ts
import { Pool } from 'pg'
import { enrichAndPersist } from '../lib/enrichment'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name FROM caregivers WHERE status = 'approved'`
  )

  console.log(`Running enrichment on ${rows.length} caregivers\n`)

  for (const { id, first_name, last_name } of rows) {
    const result = await enrichAndPersist(pool, id)
    console.log(
      `✅ ${first_name} ${last_name}: strength=${result.profile_strength_score}, tags=${result.matching_tags.length}, fits=${result.disclosed_preferences.caregiver_indicates_best_for.length}`
    )
  }

  console.log('\n✅ All caregivers enriched')
}

main()
  .catch(err => {
    console.error('❌ Enrichment failed:', err.message)
    process.exit(1)
  })
  .finally(() => pool.end())
