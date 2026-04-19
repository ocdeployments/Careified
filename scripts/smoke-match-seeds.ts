// scripts/smoke-match-seeds.ts
import { Pool } from 'pg'
import { computeMatchScore, loadAllApprovedCaregivers } from '../lib/matching'
import type { MatchNeed } from '../lib/matching'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  // Use the attribute-aware V2 loader
  const caregivers = await loadAllApprovedCaregivers(pool)

  console.log(`Running matching against ${caregivers.length} seed caregivers\n`)

  // Three test scenarios against real data:
  const scenarios: Array<{ name: string; need: MatchNeed }> = [
    {
      name: 'Alzheimer\'s live-in, Spanish, Frisco',
      need: {
        city: 'Frisco',
        state: 'TX',
        primary_condition: 'Alzheimer\'s',
        placement_type: 'Live-in care',
        language_required: 'Spanish',
        care_intensity: 'moderate',
      },
    },
    {
      name: 'Post-surgical part-time, McKinney (no language req)',
      need: {
        city: 'McKinney',
        state: 'TX',
        primary_condition: 'post-surgical recovery',
        placement_type: 'Regular part-time',
        care_intensity: 'moderate',
      },
    },
    {
      name: 'Pediatric autism, Frisco (tests poor match discrimination)',
      need: {
        city: 'Frisco',
        state: 'TX',
        primary_condition: 'pediatric autism',
      },
    },
  ]

  for (const s of scenarios) {
    console.log(`\n━━━ Scenario: ${s.name} ━━━`)
    const results = caregivers.map(cg => {
      const r = computeMatchScore(cg, s.need)
      return { caregiver: cg, result: r }
    })

    // Split: excluded vs scored
    const excluded = results.filter(r => !r.result.gates_passed)
    const scored = results.filter(r => r.result.gates_passed)

    scored.sort((a, b) => (b.result.alignment_score ?? 0) - (a.result.alignment_score ?? 0))

    console.log(`\n  Scored: ${scored.length} | Excluded: ${excluded.length}`)
    console.log(`  ${'Score'.padStart(5)} ${'Conf'.padStart(5)} ${'Name'.padEnd(25)} Criteria  Unknowns`)
    console.log(`  ${'─'.repeat(80)}`)
    for (const r of scored) {
      console.log(
        `  ${String(r.result.alignment_score ?? '—').padStart(5)} ` +
        `${String(r.result.overall_confidence ?? '—').padStart(5)} ` +
        `${(r.caregiver.first_name + ' ' + r.caregiver.last_name).padEnd(25)} ` +
        `${String(r.result.criteria_aligned.length).padStart(8)} ` +
        `[${r.result.unknowns.join(',')}]`
      )
    }
    if (excluded.length > 0) {
      console.log(`\n  Excluded:`)
      for (const e of excluded) {
        console.log(`   - ${e.caregiver.first_name} ${e.caregiver.last_name}: ${e.result.gates_failed.join(', ')}`)
      }
    }

    // Verify distribution is discriminating
    if (scored.length > 0) {
      const scores = scored.map(r => r.result.alignment_score!).filter(s => s != null)
      const max = Math.max(...scores)
      const min = Math.min(...scores)
      const range = max - min
      console.log(`\n  Range: ${min}–${max} (spread: ${range})`)
      if (range < 15) {
        console.log(`  ⚠️ WARNING: scores cluster within ${range} points — algorithm may not be discriminating`)
      }
    }
  }

  console.log('\n✅ Smoke test complete')
}

main()
  .catch(err => {
    console.error('❌ Smoke test failed:', err.message)
    process.exit(1)
  })
  .finally(() => pool.end())
