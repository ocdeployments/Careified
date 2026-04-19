const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  console.log('🔧 Backfilling soft data for seed caregivers\n')

  const seedPath = path.join(__dirname, 'seed-soft-data.json')
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

  const ids = Object.keys(seedData)
  console.log(`Found seed data for ${ids.length} caregivers\n`)

  // Verify all IDs exist in DB
  const { rows } = await pool.query(
    `SELECT id FROM caregivers WHERE id = ANY($1::uuid[])`,
    [ids]
  )
  if (rows.length !== ids.length) {
    console.error(`❌ Only ${rows.length}/${ids.length} seed IDs match DB`)
    process.exit(1)
  }

  // Apply soft data
  for (const id of ids) {
    const seed = seedData[id]
    await pool.query(
      `UPDATE caregivers
      SET
        client_preferences = $1,
        environment_comfort = $2,
        motivation = $3,
        updated_at = now()
      WHERE id = $4`,
      [
        JSON.stringify(seed.client_preferences),
        JSON.stringify(seed.environment_comfort),
        JSON.stringify(seed.motivation),
        id,
      ]
    )
    console.log(`✅ ${seed.name_for_reference}`)
  }

  console.log('\n✅ Backfill complete')
}

run()
  .catch(err => {
    console.error('❌ Backfill failed:', err.message)
    process.exit(1)
  })
  .finally(() => pool.end())
