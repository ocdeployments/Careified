import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get caregiver
  const caregiverRes = await pool.query(
    'SELECT id, first_name, last_name FROM caregivers WHERE clerk_user_id = $1',
    [userId]
  )
  if (caregiverRes.rows.length === 0) {
    return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })
  }
  const caregiver = caregiverRes.rows[0]

  const body = await req.json()
  const { referenceId, action } = body

  if (action === 'send') {
    // Send invitation email to reference
    const refRes = await pool.query(
      `SELECT id, reference_name, reference_email, token, status
       FROM reference_verification_requests
       WHERE id = $1 AND caregiver_id = $2`,
      [referenceId, caregiver.id]
    )

    if (refRes.rows.length === 0) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }

    const ref = refRes.rows[0]

    // Update status to sent
    await pool.query(
      `UPDATE reference_verification_requests
       SET status = 'sent', sent_at = NOW()
       WHERE id = $1`,
      [referenceId]
    )

    // Send email (placeholder - integrate with Resend/SendGrid)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://careified.vercel.app'
    const referenceUrl = `${appUrl}/reference/${ref.token}`

    console.log(`[EMAIL] Sending reference request to ${ref.reference_email}:`, {
      to: ref.reference_email,
      subject: `${caregiver.first_name} ${caregiver.last_name} has requested a reference from you`,
      body: `Please take a moment to provide a reference for ${caregiver.first_name}.\n\nClick here to respond: ${referenceUrl}\n\nThis link expires in 30 days.`,
    })

    return NextResponse.json({ success: true, referenceUrl })
  }

  if (action === 'remind') {
    // Send reminder email
    const refRes = await pool.query(
      `SELECT id, reference_name, reference_email, token, status, sent_at
       FROM reference_verification_requests
       WHERE id = $1 AND caregiver_id = $2`,
      [referenceId, caregiver.id]
    )

    if (refRes.rows.length === 0) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }

    const ref = refRes.rows[0]

    if (ref.status !== 'sent') {
      return NextResponse.json({ error: 'Reference must be sent first' }, { status: 400 })
    }

    // Check if reminder already sent today
    if (ref.sent_at) {
      const sentDate = new Date(ref.sent_at)
      const now = new Date()
      const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceSent < 3) {
        return NextResponse.json({ error: 'Wait 3 days between reminders' }, { status: 400 })
      }
    }

    // Send reminder email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://careified.vercel.app'
    const referenceUrl = `${appUrl}/reference/${ref.token}`

    console.log(`[EMAIL] Sending reminder to ${ref.reference_email}:`, {
      to: ref.reference_email,
      subject: `Reminder: Reference for ${caregiver.first_name} ${caregiver.last_name}`,
      body: `This is a friendly reminder to complete your reference for ${caregiver.first_name}.\n\nComplete it here: ${referenceUrl}`,
    })

    return NextResponse.json({ success: true, message: 'Reminder sent' })
  }

  if (action === 'cancel') {
    await pool.query(
      `UPDATE reference_verification_requests
       SET status = 'cancelled'
       WHERE id = $1 AND caregiver_id = $2`,
      [referenceId, caregiver.id]
    )
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}