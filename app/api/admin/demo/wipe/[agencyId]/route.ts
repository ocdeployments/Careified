import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

const ADMIN_CLERK_USER_ID = process.env.ADMIN_CLERK_USER_ID!

async function checkAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    return userId === ADMIN_CLERK_USER_ID
  } catch {
    return false
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const isAdmin = await checkAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { agencyId } = await params

    const agencyCheck = await pool.query(
      'SELECT id, name FROM agencies WHERE id = $1 AND is_demo = true',
      [agencyId]
    )

    if (agencyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Not a demo agency' }, { status: 400 })
    }

    const agencyName = agencyCheck.rows[0].name

    await pool.query('DELETE FROM agency_shortlist WHERE agency_clerk_id = $1', [agencyId])
    await pool.query('DELETE FROM client_needs WHERE agency_id = $1', [agencyId])
    await pool.query('DELETE FROM caregivers WHERE source_agency_id = $1', [agencyId])
    await pool.query('DELETE FROM agencies WHERE id = $1', [agencyId])

    console.log(`Wiped demo agency: ${agencyName} (${agencyId})`)

    return NextResponse.json({ success: true, message: `Demo agency ${agencyName} wiped` })
  } catch (error) {
    console.error('Wipe error:', error)
    return NextResponse.json({ error: 'Failed to wipe demo agency' }, { status: 500 })
  }
}
