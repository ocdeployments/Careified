import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

const USER_LIMITS: Record<string, number> = {
  starter: 0,
  growth: 2,
  scale: 5,
  enterprise: 999,
}

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

  // Get agency plan tier
  const agencyResult = await pool.query('SELECT plan_tier FROM agencies WHERE id = $1::uuid', [agencyId])
  const planTier = agencyResult.rows[0]?.plan_tier || 'starter'
  const userLimit = USER_LIMITS[planTier] ?? 0

  // Get connected users
  const usersResult = await pool.query(
    `SELECT telegram_user_id, telegram_username, label, connected_at, last_active_at
     FROM telegram_connected_users WHERE agency_id = $1::uuid ORDER BY connected_at ASC`,
    [agencyId]
  )

  return NextResponse.json({
    connected: usersResult.rows.length > 0,
    users: usersResult.rows,
    user_limit: userLimit,
    plan_tier: planTier,
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

  const { telegram_user_id } = await request.json()
  let result

  if (telegram_user_id) {
    result = await pool.query(
      'DELETE FROM telegram_connected_users WHERE agency_id = $1::uuid AND telegram_user_id = $2',
      [agencyId, telegram_user_id]
    )
  } else {
    result = await pool.query(
      'DELETE FROM telegram_connected_users WHERE agency_id = $1::uuid',
      [agencyId]
    )
  }

  return NextResponse.json({ disconnected: true, removed: result.rowCount || 0 })
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const agencyId = await getAgencyId(userId)
  if (!agencyId) {
    return NextResponse.json({ error: 'agency_not_found' }, { status: 403 })
  }

  const { telegram_user_id, label } = await request.json()

  if (!telegram_user_id || !label) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  await pool.query(
    'UPDATE telegram_connected_users SET label = $1 WHERE agency_id = $2::uuid AND telegram_user_id = $3',
    [label, agencyId, telegram_user_id]
  )

  return NextResponse.json({ updated: true })
}