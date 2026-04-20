import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function POST(
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
 `INSERT INTO caregiver_opportunity_seen (caregiver_id, client_needs_id, dismissed)
 VALUES ($1, $2, true)
 ON CONFLICT (caregiver_id, client_needs_id)
 DO UPDATE SET dismissed = true`,
 [caregiverId, clientNeedsId]
 )

 return NextResponse.json({ success: true })
}
