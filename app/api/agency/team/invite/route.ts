import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientIp = getClientIp(request)
  const limited = checkRateLimit(clientIp, 10)
  if (!limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { email, role, first_name, last_name } = body

    if (!email || !first_name || !last_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (role && !['coordinator', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
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

    const existingMember = await pool.query(
      `SELECT id FROM agency_team_members
       WHERE agency_id = $1 AND email = $2`,
      [agency.id, email]
    )

    if (existingMember.rows.length > 0) {
      return NextResponse.json({ error: 'Email already on team' }, { status: 409 })
    }

    const teamCount = await pool.query(
      `SELECT COUNT(*) as count FROM agency_team_members
       WHERE agency_id = $1 AND status = 'active'`,
      [agency.id]
    )

    if (parseInt(teamCount.rows[0].count) >= 10) {
      return NextResponse.json({ error: 'Team limit reached (10)' }, { status: 403 })
    }

    const memberResult = await pool.query(
      `INSERT INTO agency_team_members
       (agency_id, email, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [agency.id, email, role || 'coordinator', first_name, last_name]
    )

    console.log(`[TEAM INVITE] Email: ${email}, Role: ${role || 'coordinator'}, Agency: ${agency.id}`)

    return NextResponse.json({
      success: true,
      member_id: memberResult.rows[0].id
    })
  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
