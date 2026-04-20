import { Pool } from 'pg'

export type DeletionResult = {
 deleted_at: string
 tables_affected: Record<string, number>
 retained: string[]
 anonymized: string[]
}

export async function deleteCaregiverData(
 pool: Pool,
 caregiverId: string,
 clerkUserId: string
): Promise<DeletionResult> {
 const client = await pool.connect()
 const tablesAffected: Record<string, number> = {}

 try {
 await client.query('BEGIN')

 const anonId = '00000000-0000-0000-0000-000000000000'
 const ms = await client.query(
 `UPDATE match_scores SET caregiver_id = $1 WHERE caregiver_id = $2`,
 [anonId, caregiverId]
 )
 tablesAffected['match_scores_anonymized'] = ms.rowCount || 0

 const tables = [
 'caregiver_attributes',
 'caregiver_certifications',
 'caregiver_references',
 'caregiver_opportunity_interest',
 'caregiver_opportunity_seen',
 ]
 for (const t of tables) {
 const r = await client.query(`DELETE FROM ${t} WHERE caregiver_id = $1`, [caregiverId])
 tablesAffected[t] = r.rowCount || 0
 }

 const cc = await client.query(
 `UPDATE caregiver_consents SET ip_address = NULL, user_agent = NULL WHERE caregiver_id = $1`,
 [caregiverId]
 )
 tablesAffected['caregiver_consents_anonymized'] = cc.rowCount || 0

 const cg = await client.query(`DELETE FROM caregivers WHERE id = $1`, [caregiverId])
 tablesAffected['caregivers'] = cg.rowCount || 0

 await client.query('COMMIT')

 return {
 deleted_at: new Date().toISOString(),
 tables_affected: tablesAffected,
 retained: [
 'audit_log (legal record — IP/UA retained)',
 'caregiver_consents (anonymized — records of what was agreed)',
 'match_scores (anonymized with tombstone caregiver_id)',
 ],
 anonymized: [
 'match_scores.caregiver_id → tombstone',
 'caregiver_consents IP and user agent cleared',
 ],
 }
 } catch (err) {
 await client.query('ROLLBACK')
 throw err
 } finally {
 client.release()
 }
}

export async function deleteAgencyData(
 pool: Pool,
 agencyId: string,
 clerkUserId: string
): Promise<DeletionResult> {
 const client = await pool.connect()
 const tablesAffected: Record<string, number> = {}

 try {
 await client.query('BEGIN')

 const cn = await client.query(`DELETE FROM client_needs WHERE agency_id = $1`, [agencyId])
 tablesAffected['client_needs'] = cn.rowCount || 0

 const sl = await client.query(
 `DELETE FROM agency_shortlist WHERE agency_clerk_id = $1`,
 [clerkUserId]
 )
 tablesAffected['agency_shortlist'] = sl.rowCount || 0

 const ac = await client.query(
 `UPDATE agency_consents SET ip_address = NULL, user_agent = NULL WHERE agency_id = $1`,
 [agencyId]
 )
 tablesAffected['agency_consents_anonymized'] = ac.rowCount || 0

 const cdc = await client.query(
 `UPDATE client_data_consents SET ip_address = NULL, user_agent = NULL WHERE agency_id = $1`,
 [agencyId]
 )
 tablesAffected['client_data_consents_anonymized'] = cdc.rowCount || 0

 const ag = await client.query(`DELETE FROM agencies WHERE id = $1`, [agencyId])
 tablesAffected['agencies'] = ag.rowCount || 0

 await client.query('COMMIT')

 return {
 deleted_at: new Date().toISOString(),
 tables_affected: tablesAffected,
 retained: [
 'audit_log (legal record)',
 'agency_consents and client_data_consents (anonymized records)',
 ],
 anonymized: ['consent records IP and user agent cleared'],
 }
 } catch (err) {
 await client.query('ROLLBACK')
 throw err
 } finally {
 client.release()
 }
}
