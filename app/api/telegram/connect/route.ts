import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

async function getAgencyId(userId: string): Promise<string | null> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string

  if (role !== 'agency') {
    return null
  }

  const agencyResult = await pool.query(
    "SELECT id::text as id FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
    [userId]
  )

  if (agencyResult.rows.length === 0) {
    return null
  }

  return agencyResult.rows[0].id
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  const result = await pool.query(
    'SELECT telegram_user_id, telegram_connected_at FROM agencies WHERE id = $1::uuid',
    [agencyId]
  )

  const row = result.rows[0]
  return NextResponse.json({
    connected: !!row.telegram_user_id,
    connected_at: row.telegram_connected_at,
  })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  // Clear old unused codes
  await pool.query(
    'DELETE FROM telegram_connect_codes WHERE agency_id = $1::uuid AND used_at IS NULL',
    [agencyId]
  )

  // Generate new code
  const code = generateCode()
  await pool.query(
    'INSERT INTO telegram_connect_codes (agency_id, code) VALUES ($1::uuid, $2)',
    [agencyId, code]
  )

  return NextResponse.json({ code, expires_in: 900 })
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  await pool.query(
    'UPDATE agencies SET telegram_user_id = NULL, telegram_connected_at = NULL WHERE id = $1::uuid',
    [agencyId]
  )

  return NextResponse.json({ disconnected: true })
}