import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { validateTicketStatus } from '@/lib/tickets'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get ticket
    const { rows: ticketRows } = await pool.query(
      'SELECT * FROM support_tickets WHERE id = $1',
      [id]
    )

    if (ticketRows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticket = ticketRows[0]

    // Check if user has access
    const isAdmin = process.env.ADMIN_CLERK_USER_ID === userId
    const isOwner =
      (ticket.submitter_id === userId) ||
      (ticket.agency_id && await checkAgencyMembership(userId, ticket.agency_id)) ||
      (ticket.caregiver_id && await checkCaregiverMembership(userId, ticket.caregiver_id))

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    let query = 'SELECT * FROM ticket_messages WHERE ticket_id = $1'
    if (!isAdmin) {
      query += ' AND internal = FALSE'
    }
    query += ' ORDER BY created_at ASC'

    const { rows: messageRows } = await pool.query(query, [id])

    return NextResponse.json({
      ticket,
      messages: messageRows,
    })
  } catch (err) {
    console.error('Ticket get error:', err)
    return NextResponse.json({ error: 'Failed to get ticket' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    if (process.env.ADMIN_CLERK_USER_ID !== userId) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { id } = await params
    const { status, admin_notes } = await req.json()

    // Get current ticket
    const { rows: existing } = await pool.query(
      'SELECT status FROM support_tickets WHERE id = $1',
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const currentStatus = existing[0].status

    // Validate transition
    if (status && !validateTicketStatus(currentStatus, status)) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
    }

    // Build update query
    let updates = ['updated_at = NOW()']
    const values: string[] = []
    let paramCount = 0

    if (status) {
      paramCount++
      values.push(status)
      updates.push(`status = $${paramCount}`)

      // Set resolved_at or closed_at
      if (status === 'resolved') {
        updates.push('resolved_at = NOW()')
      }
      if (status === 'closed') {
        updates.push('closed_at = NOW()')
      }
    }

    if (admin_notes !== undefined) {
      paramCount++
      values.push(admin_notes)
      updates.push(`admin_notes = $${paramCount}`)
    }

    values.push(id)
    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`

    const { rows } = await pool.query(query, values)

    return NextResponse.json({ ticket: rows[0] })
  } catch (err) {
    console.error('Ticket patch error:', err)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

async function checkAgencyMembership(userId: string, agencyId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM agency_team_members tm
     JOIN agencies a ON a.id = tm.agency_id
     WHERE tm.clerk_user_id = $1 AND tm.agency_id = $2 AND tm.status = 'active' AND a.status = 'approved'`,
    [userId, agencyId]
  )
  return rows.length > 0
}

async function checkCaregiverMembership(userId: string, caregiverId: string): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM caregivers WHERE user_id = $1 AND id = $2',
    [userId, caregiverId]
  )
  return rows.length > 0
}