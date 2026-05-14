-- Migration: placement_reviews + caregiver_suitability tables
-- Created: 2026-05-13
-- Purpose: Rating system for post-placement caregiver reviews

-- Drop existing table if exists (different schema, 0 rows)
DROP TABLE IF EXISTS placement_reviews CASCADE;
DROP TABLE IF EXISTS caregiver_suitability CASCADE;

-- Create placement_reviews table per RATING_SYSTEM.md §5
-- Note: Using VARCHAR for foreign keys to match existing table schema
CREATE TABLE placement_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id VARCHAR(255) NOT NULL,
  agency_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255),

  -- Who submitted
  reviewer_type VARCHAR(20) NOT NULL, -- caregiver, system, agency, admin
  reviewer_id VARCHAR(255),

  -- Timing
  placement_start_date DATE NOT NULL,
  placement_end_date DATE,
  review_submitted_at TIMESTAMP DEFAULT NOW(),

  -- Scores (0-5 scale, 0.5 increments)
  professional_reliability_score DECIMAL(2,1),
  human_qualities_score DECIMAL(2,1),
  personal_care_hygiene_score DECIMAL(2,1),
  beyond_the_call_score DECIMAL(2,1),
  skills_match_score DECIMAL(2,1),
  communication_conduct_score DECIMAL(2,1),

  -- Binary
  would_reengage BOOLEAN,

  -- Qualitative (optional)
  positive_feedback TEXT,
  improvement_feedback TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, approved, disputed, archived

  -- Admin override (for admin source)
  admin_override_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create caregiver_suitability table
CREATE TABLE caregiver_suitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id VARCHAR(255) NOT NULL,

  -- Client type suitability scores (0-10)
  dementia_alzheimers INTEGER,
  parkinsons INTEGER,
  palliative_end_of_life INTEGER,
  post_surgical_recovery INTEGER,
  acquired_brain_injury INTEGER,
  developmental_disability INTEGER,
  companion_social INTEGER,
  high_acuity_medical INTEGER,
  pediatric INTEGER,
  mental_health_support INTEGER,

  -- LLM-generated narrative
  suitability_summary TEXT,
  credibility_narrative TEXT,
  best_match_types TEXT[],
  caution_types TEXT[],

  -- Metadata
  computed_at TIMESTAMP DEFAULT NOW(),
  review_count_at_computation INTEGER,
  score_version INTEGER DEFAULT 1,

  UNIQUE(caregiver_id)
);

-- Create indexes
CREATE INDEX idx_placement_reviews_caregiver ON placement_reviews(caregiver_id);
CREATE INDEX idx_placement_reviews_agency ON placement_reviews(agency_id);
CREATE INDEX idx_placement_reviews_status ON placement_reviews(status);
CREATE INDEX idx_suitability_caregiver ON caregiver_suitability(caregiver_id);