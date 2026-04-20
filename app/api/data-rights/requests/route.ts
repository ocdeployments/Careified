import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET() {
 const { userId } = await auth()
 if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

 const { rows } = await pool.query(
 `SELECT id, request_type, status, created_at, completed_at, denied_reason
 FROM data_requests
 WHERE clerk_user_id = $1
 ORDER BY created_at DESC`,
 [userId]
 )

 return NextResponse.json({ requests: rows })
}
