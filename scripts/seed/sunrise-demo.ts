/**
 * Seed Sunrise Home Care demo data
 * Run: npx tsx scripts/seed/sunrise-demo.ts
 */
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const DEMO_AGENCY_ID = '57e1d648-3ca0-4a95-afb6-93d854690aac'

const DEMO_CAREGIVERS = [
  { first_name: 'Maria', last_name: 'Santos', city: 'Toronto', years_experience: 8, specializations: ['Dementia', 'Alzheimers'], aggregate_score: 9.2 },
  { first_name: 'James', last_name: 'Wilson', city: 'Mississauga', years_experience: 5, specializations: ['Mobility', 'ADLs'], aggregate_score: 8.5 },
  { first_name: 'Linda', last_name: 'Chen', city: 'Scarborough', years_experience: 12, specializations: ['Diabetes', 'Medication'], aggregate_score: 9.4 },
  { first_name: 'Robert', last_name: 'Johnson', city: 'Brampton', years_experience: 3, specializations: ['Companionship'], aggregate_score: 7.8 },
]

const DEMO_CLIENTS = [
  { first_name: 'Eleanor', last_name: 'Thompson', city: 'Toronto', care_level: 'high', primary_condition: 'Dementia' },
  { first_name: 'Robert', last_name: 'Williams', city: 'Mississauga', care_level: 'medium', primary_condition: 'Post-surgery' },
  { first_name: 'Margaret', last_name: 'Davis', city: 'Scarborough', care_level: 'high', primary_condition: 'Alzheimers' },
]

const DEMO_SHORTLIST = [
  { pipeline_stage: 'interview', notes: 'Strong candidate for Eleanor case' },
  { pipeline_stage: 'screening', notes: 'Available for immediate start' },
]

async function seed() {
  console.log('🌱 Seeding Sunrise Home Care demo data...')

  const agencyCheck = await pool.query(
    "SELECT id, name FROM agencies WHERE id = $1 AND is_demo = true",
    [DEMO_AGENCY_ID]
  )

  if (agencyCheck.rows.length === 0) {
    console.error('❌ Demo agency not found:', DEMO_AGENCY_ID)
    process.exit(1)
  }

  console.log('✅ Found demo agency:', agencyCheck.rows[0].name)

  await pool.query('DELETE FROM agency_shortlist WHERE agency_clerk_id = $1', [DEMO_AGENCY_ID])
  await pool.query('DELETE FROM client_needs WHERE agency_id = $1', [DEMO_AGENCY_ID])
  await pool.query('DELETE FROM caregivers WHERE source_agency_id = $1', [DEMO_AGENCY_ID])
  console.log('🗑️  Cleared existing demo data')

  for (const c of DEMO_CAREGIVERS) {
    await pool.query(
      `INSERT INTO caregivers
       (id, first_name, last_name, city, source_agency_id, availability_status, claim_status, years_experience, specializations, aggregate_score, locale, is_demo)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'available', 'agency_built', $5, $6, $7, 'CA', true)`,
      [c.first_name, c.last_name, c.city, DEMO_AGENCY_ID, c.years_experience, c.specializations, c.aggregate_score]
    )
  }
  console.log('✅ Added', DEMO_CAREGIVERS.length, 'caregivers')

  const caregivers = await pool.query(
    'SELECT id, first_name, last_name FROM caregivers WHERE source_agency_id = $1',
    [DEMO_AGENCY_ID]
  )

  for (const c of DEMO_CLIENTS) {
    await pool.query(
      `INSERT INTO client_needs
       (id, client_first_name, city, primary_condition, agency_id, locale, status, care_intensity, placement_type, hours_per_week)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'CA', 'active', 'standard', 'Regular part-time', 20)`,
      [c.first_name, c.city, c.primary_condition, DEMO_AGENCY_ID]
    )
  }
  console.log('✅ Added', DEMO_CLIENTS.length, 'clients')

  for (let i = 0; i < Math.min(DEMO_SHORTLIST.length, caregivers.rows.length); i++) {
    await pool.query(
      `INSERT INTO agency_shortlist (caregiver_id, agency_clerk_id, pipeline_status, notes)
       VALUES ($1, $2, $3, $4)`,
      [caregivers.rows[i].id, DEMO_AGENCY_ID, DEMO_SHORTLIST[i].pipeline_stage, DEMO_SHORTLIST[i].notes]
    )
  }
  console.log('✅ Added', DEMO_SHORTLIST.length, 'shortlist entries')

  const campaignResult = await pool.query(
    `INSERT INTO airecruit_campaigns (agency_id, name, status)
     VALUES ($1, 'Demo Screening', 'active')
     RETURNING id`,
    [DEMO_AGENCY_ID]
  )
  const campaignId = campaignResult.rows[0].id

  const aiResults = [
    { name: 'Sarah Miller', score: 88, rec: 'advance', summary: 'Strong communication, 7 years experience, available immediately' },
    { name: 'Michael Brown', score: 75, rec: 'review', summary: 'Good candidate, needs verification on certifications' },
    { name: 'Jennifer Lee', score: 92, rec: 'advance', summary: 'Excellent fit, specialized in dementia care' },
  ]

  for (const r of aiResults) {
    await pool.query(
      `INSERT INTO airecruit_call_results 
       (campaign_id, candidate_name, candidate_phone, overall_score, recommendation, summary, disclaimer)
       VALUES ($1, $2, $3, $4, $5, $6, 'All placement decisions made by agency')`,
      [campaignId, r.name, '555-000-0000', r.score, r.rec, r.summary]
    )
  }
  console.log('✅ Added', aiResults.length, 'AIRecruit results')

  console.log('🎉 Demo data seeding complete!')

  await pool.end()
}

seed().catch(err => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
