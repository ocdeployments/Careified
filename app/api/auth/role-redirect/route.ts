import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role === 'agency') {
      // Check approval status
      const { rows } = await pool.query(
        'SELECT status FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )
      if (rows.length === 0 || rows[0].status !== 'approved') {
        return NextResponse.redirect(new URL('/agency/pending-approval', req.url))
      }
      return NextResponse.redirect(new URL('/agency/search', req.url))
    }

    if (role === 'caregiver') {
      return NextResponse.redirect(new URL('/profile/build', req.url))
    }

    // No role set — send to landing page to pick entry point
    return NextResponse.redirect(new URL('/', req.url))
  } catch (error) {
    console.error('role-redirect error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}
