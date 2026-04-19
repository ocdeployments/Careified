const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Fields to mirror. Add more as needed; each becomes a Tier 4 attribute.
const FIELDS = [
  'specializations', 'credentials', 'placement_types', 'languages',
  'years_experience', 'hourly_rate', 'city', 'state',
  'has_vehicle', 'willing_live_in', 'willing_overnight', 'travel_radius',
  'availability_status', 'gender',
  'client_preferences', 'environment_comfort', 'motivation',
  'bio', 'job_title',
]

async function run() {
  console.log('🔧 Backfilling existing caregiver data into caregiver_attributes\n')

  const { rows: caregivers } = await pool.query(
    `SELECT id, ${FIELDS.join(', ')} FROM caregivers WHERE status = 'approved'`
  )

  console.log(`Processing ${caregivers.length} caregivers\n`)

  let inserted = 0
  let skipped = 0

  for (const cg of caregivers) {
    for (const field of FIELDS) {
      const value = cg[field]
      if (value === null || value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        value === '') {
        skipped++
        continue
      }

      // Check if already backfilled
      const { rows: existing } = await pool.query(
        `SELECT 1 FROM caregiver_attributes
        WHERE caregiver_id = $1 AND field_name = $2
        AND source = 'caregiver_profile_backfill' AND status = 'active'
        LIMIT 1`,
        [cg.id, field]
      )
      if (existing.length > 0) { skipped++; continue }

      await pool.query(
        `INSERT INTO caregiver_attributes (
          caregiver_id, field_name, value, source, tier, status
        ) VALUES ($1, $2, $3, 'caregiver_profile_backfill', 4, 'active')`,
        [cg.id, field, JSON.stringify(value)]
      )
      inserted++
    }
  }

  console.log(`\n✅ Inserted ${inserted} attributes, skipped ${skipped} (empty or already present)`)

  // Verification
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM caregiver_attributes WHERE status = 'active'`
  )
  console.log(`Total active attributes in DB: ${count}`)
}

run()
  .catch(err => { console.error('❌', err.message); process.exit(1) })
  .finally(() => pool.end())
