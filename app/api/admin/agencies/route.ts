import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { sendAgencyApprovalEmail } from '@/lib/email/send-agency-approval-email'

// Admin Clerk user IDs — add your own Clerk user ID here
const ADMIN_USER_IDS = [
  process.env.ADMIN_CLERK_USER_ID || '',
].filter(Boolean)

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId)
}

// GET — list all agencies with status
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { rows } = await pool.query(`
    SELECT 
      id, clerk_user_id, name, contact_first_name, 
      contact_last_name, contact_email, business_type,
      city, state, status, created_at
    FROM agencies
    ORDER BY created_at DESC
  `)

  return NextResponse.json({ success: true, agencies: rows })
}

// PATCH — update agency status
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { agencyId, status } = await req.json()
  if (!agencyId || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  // Get agency details before update
  const agencyRes = await pool.query(
    'SELECT name, contact_email, contact_first_name FROM agencies WHERE id = $1',
    [agencyId]
  )
  const agency = agencyRes.rows[0]

  await pool.query(
    'UPDATE agencies SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, agencyId]
  )

  // Send approval email if status is 'approved'
  if (status === 'approved' && agency) {
    const contactName = agency.contact_first_name || 'there'
    await sendAgencyApprovalEmail({
      to: agency.contact_email,
      agencyName: agency.name,
      contactName,
    })

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (action, user_id, metadata, created_at)
       VALUES ('agency_approved_email_sent', $1, $2, NOW())`,
      [userId, JSON.stringify({ agency_id: agencyId, email: agency.contact_email })]
    )
  }

  return NextResponse.json({ success: true, agencyId, status })
}
