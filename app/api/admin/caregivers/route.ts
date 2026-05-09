import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { logAdminAction } from '@/lib/security/audit'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = process.env.ADMIN_CLERK_USER_ID
    if (!adminId || userId !== adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let query = 'SELECT id, first_name, last_name, email, phone, status, is_verified, created_at FROM caregivers'
    const params: string[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push(`(LOWER(first_name) LIKE LOWER($${params.length + 1}) OR LOWER(last_name) LIKE LOWER($${params.length + 1}) OR LOWER(email) LIKE LOWER($${params.length + 1}))`)
      params.push(`%${search}%`)
    }

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`)
      params.push(status)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC LIMIT 100'

    const { rows } = await pool.query(query, params)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('ADMIN CAREGIVER LIST ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch caregivers' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin
    const adminId = process.env.ADMIN_CLERK_USER_ID
    if (!adminId || userId !== adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, first_name, last_name, email, phone, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Caregiver ID required' }, { status: 400 })
    }

    // Get previous values for audit
    const { rows: existing } = await pool.query(
      'SELECT * FROM caregivers WHERE id = $1',
      [id]
    )
    const previous = existing[0]

    // Update caregiver
    await pool.query(
      `UPDATE caregivers 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, status = $5, updated_at = NOW()
       WHERE id = $6`,
      [first_name, last_name, email, phone, status, id]
    )

    // Log the action
    await logAdminAction({
      adminId: userId,
      action: 'UPDATE_CAREGIVER',
      recordId: id,
      table: 'caregivers',
      previousValue: previous,
      newValue: { first_name, last_name, email, phone, status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ADMIN CAREGIVER UPDATE ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update caregiver' },
      { status: 500 }
    )
  }
}
