import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { analyzeProfileStrength } from '@/lib/profile-strength/analyze'

export async function GET() {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 // Find caregiver linked to this clerk user
 const { rows } = await pool.query(
 `SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1`,
 [userId]
 )
 if (rows.length === 0) {
 return NextResponse.json({ error: 'no_caregiver_profile' }, { status: 404 })
 }

 const report = await analyzeProfileStrength(pool, rows[0].id)
 return NextResponse.json({ report })
}
