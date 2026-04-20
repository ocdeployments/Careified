import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { logAudit } from '@/lib/audit/log'

export async function POST(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 const { id: clientNeedsId } = await params

 const { rows } = await pool.query(
 `SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1`,
 [userId]
 )
 if (rows.length === 0) return NextResponse.json({ error: 'no_caregiver_profile' }, { status: 404 })
 const caregiverId = rows[0].id

 let body: { alignment_score?: number | null; message?: string } = {}
 try { body = await req.json() } catch { /* optional body */ }

 try {
 const { rows: inserted } = await pool.query(
 `INSERT INTO caregiver_opportunity_interest (
 caregiver_id, client_needs_id, alignment_score_at_expression, message, status
 ) VALUES ($1, $2, $3, $4, 'interested')
 ON CONFLICT (caregiver_id, client_needs_id)
 DO UPDATE SET status = 'interested', updated_at = now()
 RETURNING id`,
 [caregiverId, clientNeedsId, body.alignment_score ?? null, body.message ?? null]
 )

 logAudit(pool, {
 actorType: 'caregiver',
 actorId: userId,
 action: 'opportunity_interest_expressed',
 resourceType: 'client_needs',
 resourceId: clientNeedsId,
 })

 return NextResponse.json({ interest_id: inserted[0].id })
 } catch (err) {
 return NextResponse.json({ error: 'interest_failed' }, { status: 500 })
 }
}

export async function DELETE(
 _req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 const { id: clientNeedsId } = await params

 const { rows } = await pool.query(
 `SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1`,
 [userId]
 )
 if (rows.length === 0) return NextResponse.json({ error: 'no_caregiver_profile' }, { status: 404 })
 const caregiverId = rows[0].id

 await pool.query(
 `UPDATE caregiver_opportunity_interest
 SET status = 'withdrawn', updated_at = now()
 WHERE caregiver_id = $1 AND client_needs_id = $2`,
 [caregiverId, clientNeedsId]
 )

 logAudit(pool, {
 actorType: 'caregiver',
 actorId: userId,
 action: 'opportunity_interest_withdrawn',
 resourceType: 'client_needs',
 resourceId: clientNeedsId,
 })

 return NextResponse.json({ success: true })
}
