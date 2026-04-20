// scripts/seed-npi-ghost-profiles.ts
// Fetches NPI providers and upserts them as ghost caregiver profiles.
// Usage: npx tsx scripts/seed-npi-ghost-profiles.ts [--state TX] [--limit 200]
//
// Ghost profiles have:
//   profile_status = 'unclaimed'
//   claimed        = false
//   status         = 'ghost'
//   verification_tier based on license presence

import { Pool } from 'pg'
import { fetchNPIProviders, type NPIProvider } from '../lib/npi/fetchNPI'
import { randomBytes } from 'crypto'

// ── Config ────────────────────────────────────────────────────────────────────

const DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'

// Home health / personal care taxonomies to seed
const TAXONOMIES = [
  'Home Health Aide',
  'Certified Nursing Assistant',
  'Personal Care Attendant',
  'Registered Nurse',
  'Licensed Practical Nurse',
]

// States to seed (override with --state flag)
const DEFAULT_STATES = ['TX', 'CA', 'FL', 'NY', 'IL']

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const stateArg = args.find((_, i) => args[i - 1] === '--state')
const limitArg = args.find((_, i) => args[i - 1] === '--limit')
const dryRun = args.includes('--dry-run')

const targetStates = stateArg ? [stateArg.toUpperCase()] : DEFAULT_STATES
const batchLimit = limitArg ? parseInt(limitArg, 10) : 200

// ── DB ────────────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: DB_URL })

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateClaimToken(): string {
  return randomBytes(24).toString('hex') // 48-char hex token
}

function mapCredentialToServices(credential: string | null, taxonomy: string): string[] {
  const t = taxonomy.toLowerCase()
  const c = (credential ?? '').toLowerCase()

  if (t.includes('home health aide') || t.includes('hha')) return ['personal_care', 'companionship']
  if (t.includes('certified nursing') || c.includes('cna')) return ['personal_care', 'medication_reminders', 'wound_care']
  if (t.includes('personal care')) return ['personal_care', 'companionship']
  if (t.includes('registered nurse') || c.includes('rn')) return ['skilled_nursing', 'medication_management', 'wound_care']
  if (t.includes('licensed practical') || c.includes('lpn')) return ['skilled_nursing', 'medication_reminders']
  return ['personal_care']
}

function mapTaxonomyToJobTitle(taxonomy: string): string {
  const t = taxonomy.toLowerCase()
  if (t.includes('home health aide')) return 'Home Health Aide'
  if (t.includes('certified nursing')) return 'Certified Nursing Assistant'
  if (t.includes('personal care')) return 'Personal Care Attendant'
  if (t.includes('registered nurse')) return 'Registered Nurse'
  if (t.includes('licensed practical')) return 'Licensed Practical Nurse'
  return taxonomy
}

// ── Upsert ────────────────────────────────────────────────────────────────────

async function upsertGhostProfile(provider: NPIProvider): Promise<'inserted' | 'skipped'> {
  if (!provider.npiNumber || !provider.firstName || !provider.lastName) return 'skipped'

  // Check for existing record by npi_number
  const existing = await pool.query(
    'SELECT id FROM caregivers WHERE npi_number = $1',
    [provider.npiNumber]
  )
  if (existing.rows.length > 0) return 'skipped'

  const services = mapCredentialToServices(provider.credential, provider.primaryTaxonomy)
  const jobTitle = mapTaxonomyToJobTitle(provider.primaryTaxonomy)
  const claimToken = generateClaimToken()

  await pool.query(
    `INSERT INTO caregivers (
      id, first_name, last_name, phone, city, state, postal_code,
      status, profile_status, claimed, claim_token,
      npi_number, license_source, verification_tier,
      job_title, services, credentials,
      profile_completion_pct, profile_strength_score,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5, $6,
      'ghost', 'unclaimed', false, $7,
      $8, 'NPI Registry', $9,
      $10, $11, $12,
      10, 10,
      NOW(), NOW()
    )`,
    [
      provider.firstName,
      provider.lastName,
      provider.phone,
      provider.city,
      provider.state,
      provider.postalCode,
      claimToken,
      provider.npiNumber,
      provider.verificationTier,
      jobTitle,
      services,
      provider.credential ? [provider.credential] : [],
    ]
  )

  return 'inserted'
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 NPI Ghost Profile Seeder`)
  console.log(`   States: ${targetStates.join(', ')}`)
  console.log(`   Taxonomies: ${TAXONOMIES.length}`)
  console.log(`   Batch limit: ${batchLimit} per query`)
  console.log(`   Dry run: ${dryRun}\n`)

  let totalFetched = 0
  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const state of targetStates) {
    for (const taxonomy of TAXONOMIES) {
      console.log(`  → ${state} / ${taxonomy}`)

      let skip = 0
      let batchCount = 0

      while (true) {
        let providers: NPIProvider[]

        try {
          providers = await fetchNPIProviders({
            state,
            taxonomyDescription: taxonomy,
            limit: batchLimit,
            skip,
          })
        } catch (err) {
          console.error(`    ✗ Fetch error: ${(err as Error).message}`)
          totalErrors++
          break
        }

        if (providers.length === 0) break

        totalFetched += providers.length
        batchCount += providers.length

        if (!dryRun) {
          for (const p of providers) {
            try {
              const result = await upsertGhostProfile(p)
              if (result === 'inserted') totalInserted++
              else totalSkipped++
            } catch (err) {
              console.error(`    ✗ Upsert error for NPI ${p.npiNumber}: ${(err as Error).message}`)
              totalErrors++
            }
          }
        } else {
          totalInserted += providers.length
        }

        // NPI API max is 200 per page; if we got fewer than limit, we're done
        if (providers.length < batchLimit) break

        skip += batchLimit

        // Rate-limit: 100ms between pages
        await new Promise(r => setTimeout(r, 100))
      }

      console.log(`    fetched ${batchCount}`)
    }
  }

  console.log(`\n✅ Done.`)
  console.log(`   Fetched:  ${totalFetched}`)
  console.log(`   Inserted: ${totalInserted}`)
  console.log(`   Skipped:  ${totalSkipped} (already exist)`)
  console.log(`   Errors:   ${totalErrors}`)

  // Final DB count
  if (!dryRun) {
    const r = await pool.query(
      "SELECT COUNT(*) FROM caregivers WHERE profile_status = 'unclaimed'"
    )
    console.log(`   Ghost profiles in DB: ${r.rows[0].count}`)
  }

  await pool.end()
}

main().catch(e => {
  console.error('Fatal:', e.message)
  pool.end()
  process.exit(1)
})
