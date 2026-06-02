import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await pool.query(
      `UPDATE agencies SET show_onboarding = false WHERE clerk_user_id = $1`,
      [userId]
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[onboarding/dismiss]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}