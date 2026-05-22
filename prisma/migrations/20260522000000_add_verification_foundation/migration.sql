-- Migration: add_verification_foundation
-- Created: 2026-05-22
-- Description: Add caregiver_disclosures and verification_evidence tables

-- Create caregiver_disclosures table
CREATE TABLE "public"."caregiver_disclosures" (
    "id" VARCHAR(255) NOT NULL,
    "caregiver_id" VARCHAR(255) NOT NULL,
    "question_key" VARCHAR(64) NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "detail" TEXT,
    "attested_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attestation_ip" VARCHAR(64),
    CONSTRAINT "caregiver_disclosures_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
CREATE UNIQUE INDEX "caregiver_disclosures_caregiver_id_question_key_key" ON "public"."caregiver_disclosures"("caregiver_id", "question_key");

-- Create index
CREATE INDEX "caregiver_disclosures_caregiver_id_idx" ON "public"."caregiver_disclosures"("caregiver_id");

-- Add foreign key
ALTER TABLE "public"."caregiver_disclosures" ADD CONSTRAINT "caregiver_disclosures_caregiver_id_fkey"
    FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create verification_evidence table
CREATE TABLE "public"."verification_evidence" (
    "id" VARCHAR(255) NOT NULL,
    "caregiver_id" VARCHAR(255) NOT NULL,
    "claim_ref" VARCHAR(128) NOT NULL,
    "source" VARCHAR(48) NOT NULL,
    "verified_by" VARCHAR(255),
    "verified_at" TIMESTAMP(6),
    "expires_at" TIMESTAMP(6),
    "artifact_ref" JSONB,
    "method_note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verification_evidence_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "verification_evidence_caregiver_id_idx" ON "public"."verification_evidence"("caregiver_id");
CREATE INDEX "verification_evidence_claim_ref_idx" ON "public"."verification_evidence"("claim_ref");

-- Add foreign key
ALTER TABLE "public"."verification_evidence" ADD CONSTRAINT "verification_evidence_caregiver_id_fkey"
    FOREIGN KEY ("caregiver_id") REFERENCES "public"."caregivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;