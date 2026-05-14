import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const agencyResult = await pool.query(
      `SELECT id, status FROM agencies WHERE clerk_user_id = $1`,
      [userId]
    )

    if (agencyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const agency = agencyResult.rows[0]
    if (agency.status !== 'approved') {
      return NextResponse.json({ error: 'Agency not approved' }, { status: 403 })
    }

    const membersResult = await pool.query(
      `SELECT id, email, first_name, last_name, role, status, invited_at, accepted_at
       FROM agency_team_members
       WHERE agency_id = $1
       ORDER BY created_at DESC`,
      [agency.id]
    )

    return NextResponse.json({
      success: true,
      members: membersResult.rows
    })
  } catch (error) {
    console.error('Team GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
