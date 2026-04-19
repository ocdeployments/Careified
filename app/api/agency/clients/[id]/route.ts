// app/api/agency/clients/[id]/route.ts
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

  const { rows } = await pool.query(
    `SELECT * FROM client_needs WHERE id = $1 AND agency_id = $2`,
    [id, agencyId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ client: rows[0] })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  const { id } = await params

  const result = await pool.query(
    `DELETE FROM client_needs WHERE id = $1 AND agency_id = $2`,
    [id, agencyId]
  )

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}