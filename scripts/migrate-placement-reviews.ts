// Migration: Create placement_reviews table
// Usage: npx tsx scripts/migrate-placement-reviews.ts

import { Pool } from 'pg'

// Direct connection string since .env.local is empty
const DATABASE_URL = 'postgresql://careified_app:BqXhCkKsxIP9TlRVjtXbshjJaoe0Lr7o@dpg-d7fd1jflk1mc73dbjdn0-a.oregon-postgres.render.com/careified'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('Creating placement_reviews table...')

  const sql = `
    CREATE TABLE IF NOT EXISTS placement_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id VARCHAR(255) NOT NULL REFERENCES agencies(id),
      caregiver_id VARCHAR(255) NOT NULL REFERENCES caregivers(id),
      client_id UUID NOT NULL REFERENCES client_needs(id),
      engagement_start DATE,
      engagement_end DATE,

      -- Category 1: Professional Reliability
      punctuality INT CHECK (punctuality >= 1 AND punctuality <= 5),
      reliability INT CHECK (reliability >= 1 AND reliability <= 5),
      professional_conduct INT CHECK (professional_conduct >= 1 AND professional_conduct <= 5),
      would_re_engage BOOLEAN NOT NULL,

      -- Category 2: Human Qualities
      warmth INT CHECK (warmth >= 1 AND warmth <= 5),
      dignity INT CHECK (dignity >= 1 AND dignity <= 5),
      patience INT CHECK (patience >= 1 AND patience <= 5),
      emotional_presence INT CHECK (emotional_presence >= 1 AND emotional_presence <= 5),

      -- Category 3: Hygiene
      personal_hygiene INT CHECK (personal_hygiene >= 1 AND personal_hygiene <= 5),
      client_hygiene INT CHECK (client_hygiene >= 1 AND client_hygiene <= 5),
      environment_cleanliness INT CHECK (environment_cleanliness >= 1 AND environment_cleanliness <= 5),
      infection_control INT CHECK (infection_control >= 1 AND infection_control <= 5),

      -- Category 4: Skills
      specialty_match INT CHECK (specialty_match >= 1 AND specialty_match <= 5),
      medical_awareness INT CHECK (medical_awareness >= 1 AND medical_awareness <= 5),
      medication_handling INT CHECK (medication_handling >= 1 AND medication_handling <= 5),
      mobility_safety INT CHECK (mobility_safety >= 1 AND mobility_safety <= 5),

      -- Category 5: Communication
      comms_agency INT CHECK (comms_agency >= 1 AND comms_agency <= 5),
      comms_family INT CHECK (comms_family >= 1 AND comms_family <= 5),
      boundaries INT CHECK (boundaries >= 1 AND boundaries <= 5),
      cultural_sensitivity INT CHECK (cultural_sensitivity >= 1 AND cultural_sensitivity <= 5),

      -- Category 6: Beyond the Call
      initiative BOOLEAN DEFAULT false,
      emotional_support BOOLEAN DEFAULT false,
      family_communication BOOLEAN DEFAULT false,
      creative_engagement BOOLEAN DEFAULT false,
      problem_solving BOOLEAN DEFAULT false,
      continuity_of_care BOOLEAN DEFAULT false,
      beyond_call_notes TEXT,

      -- Meta
      review_text TEXT,
      personality_validated JSONB,
      status TEXT DEFAULT 'pending',
      dispute_deadline TIMESTAMPTZ,
      admin_flagged BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_placement_reviews_agency ON placement_reviews(agency_id);
    CREATE INDEX IF NOT EXISTS idx_placement_reviews_caregiver ON placement_reviews(caregiver_id);
    CREATE INDEX IF NOT EXISTS idx_placement_reviews_client ON placement_reviews(client_id);
    CREATE INDEX IF NOT EXISTS idx_placement_reviews_status ON placement_reviews(status);
  `

  await pool.query(sql)
  console.log('✅ placement_reviews table created')

  // Verify
  const { rows } = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'placement_reviews'
    ORDER BY ordinal_position
  `)
  console.log(`✅ Verified: ${rows.length} columns`)

  await pool.end()
  console.log('Migration complete.')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})