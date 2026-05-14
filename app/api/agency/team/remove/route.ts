import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

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

    const memberResult = await pool.query(
      `SELECT id FROM agency_team_members 
       WHERE id = $1 AND agency_id = $2`,
      [memberId, agency.id]
    )

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    await pool.query(
      `DELETE FROM agency_team_members WHERE id = $1`,
      [memberId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Team remove error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
