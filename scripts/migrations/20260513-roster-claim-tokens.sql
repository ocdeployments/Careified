-- Migration: Add claim token indexes for Agency Roster
-- Date: 2026-05-13

-- Add index on caregiver_claim_tokens.token for fast lookups
CREATE INDEX IF NOT EXISTS idx_claim_tokens_token 
ON caregiver_claim_tokens(token);

-- Add index on caregivers.claim_status for filtering
CREATE INDEX IF NOT EXISTS idx_caregivers_claim_status 
ON caregivers(claim_status);
