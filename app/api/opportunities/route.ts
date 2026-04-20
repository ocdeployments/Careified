import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { discoverOpportunities } from '@/lib/opportunities/discover'
import { logAudit } from '@/lib/audit/log'

export async function GET() {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 const { rows } = await pool.query(
 `SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1`,
 [userId]
 )
 if (rows.length === 0) {
 return NextResponse.json({ error: 'no_caregiver_profile' }, { status: 404 })
 }
 const caregiverId = rows[0].id

 const opportunities = await discoverOpportunities(pool, caregiverId, 10)

 logAudit(pool, {
 actorType: 'caregiver',
 actorId: userId,
 action: 'opportunities_viewed',
 metadata: { count: opportunities.length },
 })

 return NextResponse.json({ opportunities })
}
