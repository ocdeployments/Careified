import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { generateTicketNumber, getSLADueDate, validateTicketType } from '@/lib/tickets'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 requests per IP per hour
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp, 10)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { userId } = await auth()

    const { type, subject, description, email } = await req.json()

    // Validation
    if (!type || !validateTicketType(type)) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 })
    }
    if (!subject || subject.length < 5 || subject.length > 255) {
      return NextResponse.json({ error: 'Subject must be 5-255 characters' }, { status: 400 })
    }
    if (!description || description.length < 20 || description.length > 5000) {
      return NextResponse.json({ error: 'Description must be 20-5000 characters' }, { status: 400 })
    }

    // Determine submitter info
    let submitterId = email || 'anonymous'
    let submitterType = 'public'
    let agencyId: string | null = null
    let caregiverId: string | null = null
    let userEmail = email

    if (userId) {
      // Check if user is agency
      const { rows: agencyRows } = await pool.query(
        'SELECT id, contact_email FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )
      if (agencyRows.length > 0) {
        submitterType = 'agency'
        agencyId = agencyRows[0].id
        userEmail = agencyRows[0].contact_email
      } else {
        // Check if user is team member
        const { rows: teamRows } = await pool.query(
          `SELECT tm.agency_id, a.contact_email FROM agency_team_members tm
           JOIN agencies a ON a.id = tm.agency_id
           WHERE tm.clerk_user_id = $1 AND tm.status = 'active' AND a.status = 'approved'`,
          [userId]
        )
        if (teamRows.length > 0) {
          submitterType = 'agency'
          agencyId = teamRows[0].agency_id
          userEmail = teamRows[0].contact_email
        } else {
          // Check if user is caregiver
          const { rows: caregiverRows } = await pool.query(
            'SELECT id, email FROM caregivers WHERE user_id = $1',
            [userId]
          )
          if (caregiverRows.length > 0) {
            submitterType = 'caregiver'
            caregiverId = caregiverRows[0].id
            userEmail = caregiverRows[0].email
          }
        }
      }
      submitterId = userId
    }

    // Generate ticket number and SLA
    const ticketNumber = await generateTicketNumber(pool)
    const slaDueAt = getSLADueDate(type)

    // Insert ticket
    const { rows } = await pool.query(
      `INSERT INTO support_tickets
       (ticket_number, submitter_id, submitter_type, agency_id, caregiver_id, type, subject, description, sla_due_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [ticketNumber, submitterId, submitterType, agencyId, caregiverId, type, subject, description, slaDueAt]
    )

    const ticketId = rows[0].id

    // Send confirmation email if Resend is configured
    if (userEmail && process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Careified Support <noreply@careified.ca>',
            to: userEmail,
            subject: `Your support request ${ticketNumber} has been received`,
            text: `We received your request. Ticket: ${ticketNumber}.\n\nWe'll respond within ${slaDueAt ? Math.ceil((slaDueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : '5'} business days.`,
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
      }
    }

    return NextResponse.json({
      ticket_id: ticketId,
      ticket_number: ticketNumber,
      sla_due_at: slaDueAt,
    }, { status: 201 })
  } catch (err) {
    console.error('Ticket create error:', err)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}