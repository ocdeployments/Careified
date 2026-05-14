-- Migration: reference_calls table + AI verification columns
-- Date: 2026-05-13

-- Add call_type to existing AIRecruitCall table
ALTER TABLE "AIRecruitCall" ADD COLUMN IF NOT EXISTS call_type VARCHAR(20) DEFAULT 'screening';

-- Add AI verification columns to caregiver_references
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS verification_source VARCHAR(50);
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS verification_tier INTEGER;
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS would_reengage BOOLEAN;
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE "caregiver_references" ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Create reference_calls table (without FK constraints due to VARCHAR ids)
CREATE TABLE IF NOT EXISTS "reference_calls" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id VARCHAR(255) NOT NULL,
  reference_id VARCHAR(255) NOT NULL,
  agency_id VARCHAR(255) NOT NULL,
  vapi_call_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'initiated',
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  transcript TEXT,
  would_reengage BOOLEAN,
  overall_sentiment VARCHAR(20),
  ai_summary TEXT,
  reliability_notes TEXT,
  client_interaction_notes TEXT,
  strengths TEXT,
  additional_notes TEXT,
  confidence VARCHAR(10),
  human_handoff_requested BOOLEAN DEFAULT FALSE,
  initiated_by_clerk_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reference_calls_caregiver ON "reference_calls"(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_reference_calls_agency ON "reference_calls"(agency_id);
CREATE INDEX IF NOT EXISTS idx_reference_calls_vapi ON "reference_calls"(vapi_call_id);
