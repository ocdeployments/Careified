-- Field Discovery System - May 13 2026
-- Captures unknown CSV columns for platform-wide field discovery

-- Main field discovery table
CREATE TABLE IF NOT EXISTS field_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(255) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  sample_values TEXT[] DEFAULT '{}',
  agency_count INTEGER DEFAULT 1,
  caregiver_count INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  source VARCHAR(20) DEFAULT 'csv',
  status VARCHAR(20) DEFAULT 'new',
  notes TEXT,
  UNIQUE(field_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_discovery_status
  ON field_discovery(status);
CREATE INDEX IF NOT EXISTS idx_field_discovery_agency_count
  ON field_discovery(agency_count DESC);

-- Add columns to existing caregiver_attributes table
ALTER TABLE caregiver_attributes
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);
ALTER TABLE caregiver_attributes
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'csv';
ALTER TABLE caregiver_attributes
  ADD COLUMN IF NOT EXISTS field_discovery_id UUID REFERENCES field_discovery(id);