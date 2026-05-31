import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { is_visible } = await req.json()
    if (typeof is_visible !== 'boolean') {
      return NextResponse.json({ error: 'is_visible must be boolean' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE caregivers SET is_visible = $1 WHERE user_id = $2 RETURNING id`,
      [is_visible, userId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, is_visible })
  } catch (err) {
    console.error('[caregiver/visibility]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
