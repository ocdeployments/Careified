-- Careified — Caregiver Notifications Table
-- Created: May 14 2026

CREATE TABLE IF NOT EXISTS caregiver_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id VARCHAR(255) NOT NULL REFERENCES caregivers(id)
    ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_caregiver
  ON caregiver_notifications(caregiver_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON caregiver_notifications(caregiver_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created
  ON caregiver_notifications(created_at DESC);