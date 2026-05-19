import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const result = await pool.query(
    `DELETE FROM agency_saved_searches
     WHERE id = $1 AND agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $2)
     RETURNING id`,
    [id, userId]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Search not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}