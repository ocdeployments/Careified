-- Migration: Create call_retry_queue table
-- Date: 2026-05-14
-- Purpose: Queue Vapi calls for retry with intelligent backoff

CREATE TABLE IF NOT EXISTS call_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_type VARCHAR(50) NOT NULL,
  target_phone VARCHAR(20) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  caregiver_id VARCHAR(255) NOT NULL REFERENCES caregivers(id),
  agency_id VARCHAR(255) NOT NULL REFERENCES agencies(id),
  call_params JSONB NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retry_queue_scheduled ON call_retry_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_retry_queue_caregiver ON call_retry_queue(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_retry_queue_agency ON call_retry_queue(agency_id);
CREATE INDEX IF NOT EXISTS idx_retry_queue_status ON call_retry_queue(status);