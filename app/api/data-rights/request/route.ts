import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { exportCaregiverData, exportAgencyData } from '@/lib/data-rights/export'
import { deleteCaregiverData, deleteAgencyData } from '@/lib/data-rights/delete'
import { logAudit } from '@/lib/audit/log'

type RequestType = 'export' | 'deletion' | 'correction'

export async function POST(req: NextRequest) {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 let body: { type?: RequestType; payload?: Record<string, unknown> }
 try { body = await req.json() }
 catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

 const type = body.type
 if (!type || !['export', 'deletion', 'correction'].includes(type)) {
 return NextResponse.json({ error: 'invalid_request_type' }, { status: 400 })
 }

 const { rows: cg } = await pool.query(
 `SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1`,
 [userId]
 )
 const { rows: ag } = await pool.query(
 `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
 [userId]
 )

 let requesterType: 'caregiver' | 'agency'
 let requesterId: string

 if (cg.length > 0) {
 requesterType = 'caregiver'
 requesterId = cg[0].id
 } else if (ag.length > 0) {
 requesterType = 'agency'
 requesterId = ag[0].id
 } else {
 return NextResponse.json({ error: 'no_profile' }, { status: 404 })
 }

 const ipAddress = req.headers.get('x-forwarded-for') || undefined
 const userAgent = req.headers.get('user-agent') || undefined

 const { rows: created } = await pool.query(
 `INSERT INTO data_requests (
 requester_type, requester_id, clerk_user_id, request_type,
 payload, status, ip_address, user_agent
 ) VALUES ($1,$2,$3,$4,$5,'processing',$6,$7)
 RETURNING id`,
 [requesterType, requesterId, userId, type, JSON.stringify(body.payload ?? {}), ipAddress, userAgent]
 )
 const requestId = created[0].id

 await logAudit(pool, {
 actorType: requesterType,
 actorId: userId,
 action: `data_request_${type}`,
 resourceType: 'data_requests',
 resourceId: requestId,
 ipAddress,
 userAgent,
 })

 try {
 if (type === 'export') {
 const result = requesterType === 'caregiver'
 ? await exportCaregiverData(pool, requesterId, userId)
 : await exportAgencyData(pool, requesterId, userId)

 await pool.query(
 `UPDATE data_requests SET status = 'completed', result = $1, completed_at = now() WHERE id = $2`,
 [JSON.stringify({ delivered_at: new Date().toISOString() }), requestId]
 )

 return NextResponse.json({ request_id: requestId, type: 'export', bundle: result })
 }

 if (type === 'deletion') {
 if (!body.payload?.confirm_deletion) {
 await pool.query(
 `UPDATE data_requests SET status = 'denied', denied_reason = $1, completed_at = now() WHERE id = $2`,
 ['missing_confirm_deletion_flag', requestId]
 )
 return NextResponse.json({
 error: 'confirmation_required',
 message: 'Send payload.confirm_deletion = true to execute deletion',
 }, { status: 400 })
 }

 const result = requesterType === 'caregiver'
 ? await deleteCaregiverData(pool, requesterId, userId)
 : await deleteAgencyData(pool, requesterId, userId)

 await pool.query(
 `UPDATE data_requests SET status = 'completed', result = $1, completed_at = now() WHERE id = $2`,
 [JSON.stringify(result), requestId]
 )

 return NextResponse.json({ request_id: requestId, type: 'deletion', result })
 }

 if (type === 'correction') {
 await pool.query(
 `UPDATE data_requests SET status = 'pending' WHERE id = $1`,
 [requestId]
 )
 return NextResponse.json({
 request_id: requestId,
 type: 'correction',
 status: 'queued_for_review',
 message: 'Correction requests are reviewed manually. We will contact you.',
 })
 }

 return NextResponse.json({ error: 'unsupported' }, { status: 400 })
 } catch (err) {
 await pool.query(
 `UPDATE data_requests SET status = 'denied', denied_reason = $1 WHERE id = $2`,
 [err instanceof Error ? err.message : 'unknown_error', requestId]
 )
 return NextResponse.json({ error: 'execution_failed' }, { status: 500 })
 }
}
