import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { caregiverId, badges } = body

  if (!caregiverId || !Array.isArray(badges)) {
    return NextResponse.json({ error: 'caregiverId and badges array required' }, { status: 400 })
  }

  await pool.query(
    'UPDATE caregivers SET badges = $1 WHERE id = $2',
    [JSON.stringify(badges), caregiverId]
  )

  return NextResponse.json({ success: true })
}