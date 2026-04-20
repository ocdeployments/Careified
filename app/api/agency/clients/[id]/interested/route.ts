import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

async function getAgencyId(clerkUserId: string): Promise<string | null> {
 const { rows } = await pool.query(
 `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
 [clerkUserId]
 )
 return rows[0]?.id ?? null
}

export async function GET(
 _req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 const agencyId = await getAgencyId(userId)
 if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

 const { id } = await params

 // Verify ownership
 const { rows: cn } = await pool.query(
 `SELECT id FROM client_needs WHERE id = $1 AND agency_id = $2`,
 [id, agencyId]
 )
 if (cn.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 })

 const { rows } = await pool.query(
 `SELECT
 i.caregiver_id, i.alignment_score_at_expression, i.created_at, i.message,
 c.first_name, c.last_name, c.city, c.state, c.specializations, c.languages,
 c.years_experience, c.hourly_rate
 FROM caregiver_opportunity_interest i
 JOIN caregivers c ON c.id = i.caregiver_id
 WHERE i.client_needs_id = $1 AND i.status = 'interested' AND c.status = 'approved'
 ORDER BY i.alignment_score_at_expression DESC NULLS LAST, i.created_at DESC`,
 [id]
 )

 return NextResponse.json({ interested: rows })
}
