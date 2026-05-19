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
      const { rows } = await pool.query(
        'SELECT status, name FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )

      // No agency record yet — create one and send to signup form
      if (rows.length === 0) {
        return NextResponse.redirect(new URL('/agency/signup', req.url))
      }

      const agency = rows[0]

      // Agency exists but hasn't completed registration (no name)
      if (!agency.name || agency.name.trim() === '') {
        return NextResponse.redirect(new URL('/agency/signup', req.url))
      }

      // Agency registered but not approved yet
      if (agency.status !== 'approved') {
        return NextResponse.redirect(new URL('/agency/pending-approval', req.url))
      }

      // Approved agency → dashboard
      return NextResponse.redirect(new URL('/agency/dashboard', req.url))
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
