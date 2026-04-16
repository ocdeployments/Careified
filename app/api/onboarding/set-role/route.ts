import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

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
    // Set role in Clerk metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })

    // If agency — create pending agency record in DB
    if (role === 'agency') {
      const existing = await pool.query(
        'SELECT id FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO agencies (id, clerk_user_id, status, created_at, updated_at)
           VALUES (gen_random_uuid()::text, $1, 'pending', NOW(), NOW())`,
          [userId]
        )
      }
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('set-role error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Failed to set role', detail: message }, { status: 500 })
  }
}
