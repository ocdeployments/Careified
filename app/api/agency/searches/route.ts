import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// GET - list saved searches
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await pool.query(
    `SELECT id, name, filters, created_at
     FROM agency_saved_searches
     WHERE agency_id = (SELECT id FROM agencies WHERE clerk_user_id = $1)
     ORDER BY created_at DESC`,
    [userId]
  )
  return NextResponse.json({ searches: rows })
}

// POST - save a new search
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agencyRes = await pool.query(
    'SELECT id FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )
  if (agencyRes.rows.length === 0) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  const { name, filters } = await req.json()
  if (!name || !filters) {
    return NextResponse.json({ error: 'name and filters required' }, { status: 400 })
  }

  const result = await pool.query(
    `INSERT INTO agency_saved_searches (agency_id, name, filters)
     VALUES ($1, $2, $3) RETURNING id, name, filters, created_at`,
    [agencyRes.rows[0].id, name, JSON.stringify(filters)]
  )

  return NextResponse.json({ search: result.rows[0] }, { status: 201 })
}