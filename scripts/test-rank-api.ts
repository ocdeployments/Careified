// scripts/test-rank-api.ts
import { Pool } from 'pg'
import {
  computeMatchScore,
  loadAllApprovedCaregivers,
  persistMatchScore,
} from '../lib/matching'
import type { MatchNeed } from '../lib/matching'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  // Create a test client_need row
  const { rows: [cn] } = await pool.query(
    `INSERT INTO client_needs (
      agency_id, client_first_name, primary_condition,
      placement_type, language_required, city, state, care_intensity
    ) VALUES (
      gen_random_uuid(), 'TestClient', 'Alzheimer''s',
      'Live-in care', 'Spanish', 'Frisco', 'TX', 'moderate'
    ) RETURNING id`
  )
  console.log(`Created test client_need: ${cn.id}`)

  const need: MatchNeed = {
    city: 'Frisco',
    state: 'TX',
    primary_condition: "Alzheimer's",
    placement_type: 'Live-in care',
    language_required: 'Spanish',
    care_intensity: 'moderate',
  }

  const caregivers = await loadAllApprovedCaregivers(pool)
  console.log(`Loaded ${caregivers.length} approved caregivers`)

  const ranked = caregivers
    .map(cg => ({ caregiver: cg, result: computeMatchScore(cg, need) }))
    .filter(r => r.result.gates_passed)
    .sort((a, b) => (b.result.overall_score ?? 0) - (a.result.overall_score ?? 0))

  console.log(`\nRanked (${ranked.length}):`)
  for (const r of ranked) {
    console.log(`  ${r.result.overall_score} ${r.caregiver.first_name} ${r.caregiver.last_name}`)
  }

  // Persist
  for (const r of ranked) {
    await persistMatchScore(pool, r.caregiver.id, cn.id, r.result)
  }
  console.log(`\nPersisted ${ranked.length} match_scores rows`)

  // Verify
  const { rows: persisted } = await pool.query(
    `SELECT COUNT(*) FROM match_scores WHERE client_needs_id = $1`,
    [cn.id]
  )
  console.log(`DB count: ${persisted[0].count}`)

  // Cleanup
  await pool.query(`DELETE FROM match_scores WHERE client_needs_id = $1`, [cn.id])
  await pool.query(`DELETE FROM client_needs WHERE id = $1`, [cn.id])
  console.log('✅ Cleaned up test data')
}

main()
  .catch(err => { console.error('❌', err.message); process.exit(1) })
  .finally(() => pool.end())
