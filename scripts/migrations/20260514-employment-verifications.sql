-- Migration: Create employment_verifications table
-- Date: 2026-05-14
-- Purpose: Track past employer verification calls

CREATE TABLE IF NOT EXISTS employment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  employment_record_id UUID,
  employer_name VARCHAR(255) NOT NULL,
  supervisor_name VARCHAR(255),
  employer_phone VARCHAR(20),
  job_title VARCHAR(255),
  start_date DATE,
  end_date DATE,
  vapi_call_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'initiated',
  employment_confirmed BOOLEAN,
  re_engage BOOLEAN,
  departure_reason TEXT,
  additional_notes TEXT,
  ai_summary TEXT,
  confidence VARCHAR(10),
  overall_sentiment VARCHAR(20),
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  transcript TEXT,
  initiated_by_clerk_id VARCHAR(255),
  verification_tier INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empverif_caregiver ON employment_verifications(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_empverif_vapi ON employment_verifications(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_empverif_agency ON employment_verifications(agency_id);
CREATE INDEX IF NOT EXISTS idx_empverif_status ON employment_verifications(status);