import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true
})

// GET — called after Clerk signup via forceRedirectUrl
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const role = req.nextUrl.searchParams.get('role')

  if (!role || !['agency', 'caregiver'].includes(role)) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })

    if (role === 'agency') {
      const existing = await pool.query(
        'SELECT id FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO agencies (id, clerk_user_id, name, status, created_at, updated_at)
           VALUES (gen_random_uuid()::text, $1, '', 'pending', NOW(), NOW())`,
          [userId]
        )
      }
    }

    if (role === 'caregiver') {
      return NextResponse.redirect(new URL('/profile/build?step=0', req.url))
    }
    if (role === 'agency') {
      return NextResponse.redirect(new URL('/agency/signup', req.url))
    }
  } catch (error) {
    console.error('set-role GET error:', error)
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
}

// POST — kept for backward compatibility
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { role } = await req.json()
  if (!role || !['agency', 'caregiver'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })

    if (role === 'agency') {
      const existing = await pool.query(
        'SELECT id FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO agencies (id, clerk_user_id, name, status, created_at, updated_at)
           VALUES (gen_random_uuid()::text, $1, '', 'pending', NOW(), NOW())`,
          [userId]
        )
      }
    }

    return NextResponse.json({
      success: true,
      role,
      redirect: role === 'agency' ? '/agency/signup' : '/profile/build?step=0'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Failed to set role', detail: message }, { status: 500 })
  }
}
