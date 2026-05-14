import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Check if admin
    const isAdmin = process.env.ADMIN_CLERK_USER_ID === userId

    let query = 'SELECT * FROM support_tickets WHERE 1=1'
    const params: string[] = []

    if (isAdmin) {
      // Admin sees all tickets
      if (status) {
        params.push(status)
        query += ` AND status = $${params.length}`
      }
      if (type) {
        params.push(type)
        query += ` AND type = $${params.length}`
      }
    } else {
      // Check if user is agency
      const { rows: agencyRows } = await pool.query(
        'SELECT id FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )
      if (agencyRows.length > 0) {
        // Agency sees their tickets
        params.push(agencyRows[0].id)
        query += ` AND agency_id = $${params.length}`
        if (status) {
          params.push(status)
          query += ` AND status = $${params.length}`
        }
        if (type) {
          params.push(type)
          query += ` AND type = $${params.length}`
        }
      } else {
        // Check if user is caregiver
        const { rows: caregiverRows } = await pool.query(
          'SELECT id FROM caregivers WHERE user_id = $1',
          [userId]
        )
        if (caregiverRows.length > 0) {
          params.push(caregiverRows[0].id)
          query += ` AND caregiver_id = $${params.length}`
          if (status) {
            params.push(status)
            query += ` AND status = $${params.length}`
          }
          if (type) {
            params.push(type)
            query += ` AND type = $${params.length}`
          }
        } else {
          return NextResponse.json({ error: 'No tickets found' }, { status: 404 })
        }
      }
    }

    query += ' ORDER BY created_at DESC'

    const { rows } = await pool.query(query, params)

    return NextResponse.json({ tickets: rows })
  } catch (err) {
    console.error('Ticket list error:', err)
    return NextResponse.json({ error: 'Failed to list tickets' }, { status: 500 })
  }
}