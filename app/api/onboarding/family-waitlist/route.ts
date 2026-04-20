// app/api/onboarding/family-waitlist/route.ts
// Captures family early-access email, stores in DB, sets Clerk metadata

import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Ensure table exists (idempotent)
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS family_waitlist (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id VARCHAR(255),
      email       VARCHAR(255) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email)
    )
  `)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const email: string = (body.email ?? '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  try {
    await ensureTable()

    // Upsert — ignore duplicate email
    await pool.query(
      `INSERT INTO family_waitlist (clerk_user_id, email)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET clerk_user_id = EXCLUDED.clerk_user_id`,
      [userId, email]
    )

    // Set Clerk metadata so role is persisted
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'family' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('family-waitlist error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
