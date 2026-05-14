import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agencyId } = body

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    const agencyCheck = await pool.query(
      "SELECT id, name FROM agencies WHERE id = $1 AND is_demo = true AND status = 'approved'",
      [agencyId]
    )

    if (agencyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid demo agency' }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set('careified_demo_session', agencyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2
    })

    return NextResponse.json({ success: true, redirect: '/agency/dashboard' })
  } catch (error) {
    console.error('Demo session error:', error)
    return NextResponse.json({ error: 'Failed to create demo session' }, { status: 500 })
  }
}
