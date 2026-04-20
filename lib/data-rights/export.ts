import { Pool } from 'pg'
import { decryptPHI, decryptPHIJson } from '@/lib/encryption/phi'

export type ExportBundle = {
 exported_at: string
 exporter: { type: 'caregiver' | 'agency'; id: string; clerk_user_id: string }
 data: Record<string, unknown>
}

export async function exportCaregiverData(
 pool: Pool,
 caregiverId: string,
 clerkUserId: string
): Promise<ExportBundle> {
 const [caregiver, attributes, consents, certifications, references, interests, audit] = await Promise.all([
 pool.query(`SELECT * FROM caregivers WHERE id = $1`, [caregiverId]),
 pool.query(`SELECT * FROM caregiver_attributes WHERE caregiver_id = $1`, [caregiverId]),
 pool.query(`SELECT * FROM caregiver_consents WHERE caregiver_id = $1`, [caregiverId]),
 pool.query(`SELECT * FROM caregiver_certifications WHERE caregiver_id = $1`, [caregiverId]),
 pool.query(`SELECT * FROM caregiver_references WHERE caregiver_id = $1`, [caregiverId]),
 pool.query(`SELECT * FROM caregiver_opportunity_interest WHERE caregiver_id = $1`, [caregiverId]),
 pool.query(
 `SELECT * FROM audit_log WHERE actor_type = 'caregiver' AND actor_id = $1 ORDER BY created_at DESC LIMIT 500`,
 [clerkUserId]
 ),
 ])

 return {
 exported_at: new Date().toISOString(),
 exporter: { type: 'caregiver', id: caregiverId, clerk_user_id: clerkUserId },
 data: {
 profile: caregiver.rows[0] ?? null,
 attributes: attributes.rows,
 consents: consents.rows,
 certifications: certifications.rows,
 references: references.rows,
 opportunity_interests: interests.rows,
 recent_audit_events: audit.rows,
 },
 }
}

export async function exportAgencyData(
 pool: Pool,
 agencyId: string,
 clerkUserId: string
): Promise<ExportBundle> {
 const [agency, consents, clientDataConsents, clientNeeds, shortlist, audit] = await Promise.all([
 pool.query(`SELECT * FROM agencies WHERE id = $1`, [agencyId]),
 pool.query(`SELECT * FROM agency_consents WHERE agency_id = $1`, [agencyId]),
 pool.query(`SELECT * FROM client_data_consents WHERE agency_id = $1`, [agencyId]),
 pool.query(`SELECT * FROM client_needs WHERE agency_id = $1`, [agencyId]),
 pool.query(`SELECT * FROM agency_shortlist WHERE agency_clerk_id = $1`, [clerkUserId]),
 pool.query(
 `SELECT * FROM audit_log WHERE actor_type = 'agency' AND actor_id = $1 ORDER BY created_at DESC LIMIT 500`,
 [clerkUserId]
 ),
 ])

 const decryptedClientNeeds = clientNeeds.rows.map(r => ({
 ...r,
 client_first_name: decryptPHI(r.client_first_name_encrypted),
 primary_condition: decryptPHI(r.primary_condition_encrypted),
 secondary_conditions: decryptPHIJson(r.secondary_conditions_encrypted),
 mobility_level: decryptPHI(r.mobility_level_encrypted),
 medications_complex: (() => {
 const v = decryptPHI(r.medications_complex_encrypted)
 return v === 'true' ? true : v === 'false' ? false : null
 })(),
 client_first_name_encrypted: undefined,
 primary_condition_encrypted: undefined,
 secondary_conditions_encrypted: undefined,
 mobility_level_encrypted: undefined,
 medications_complex_encrypted: undefined,
 }))

 return {
 exported_at: new Date().toISOString(),
 exporter: { type: 'agency', id: agencyId, clerk_user_id: clerkUserId },
 data: {
 agency: agency.rows[0] ?? null,
 consents: consents.rows,
 client_data_consents: clientDataConsents.rows,
 client_needs: decryptedClientNeeds,
 shortlist: shortlist.rows,
 recent_audit_events: audit.rows,
 },
 }
}
