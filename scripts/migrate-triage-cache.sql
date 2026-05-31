-- Triage narrative cache table
CREATE TABLE IF NOT EXISTS triage_narrative_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  date date NOT NULL,
  narrative text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id, date)
);
CREATE INDEX IF NOT EXISTS idx_triage_cache_agency_date ON triage_narrative_cache(agency_id, date);