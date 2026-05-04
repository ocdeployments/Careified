import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const isAdmin = userId === process.env.ADMIN_CLERK_USER_ID
  if (!userId || !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = (await params).id
  const body = await req.json()
  const allowed = ['status', 'modules_enabled', 'plan_tier', 'subscription_status']
  const updates = Object.entries(body).filter(([k]) => allowed.includes(k))
  if (updates.length === 0) return NextResponse.json({ error: 'no_valid_fields' }, { status: 400 })
  const setClauses = updates.map(([k], i) => k + ' = $' + (i + 1)).join(', ')
  const values = [...updates.map(([, v]) => v), id]
  await pool.query('UPDATE agencies SET ' + setClauses + ', updated_at = NOW() WHERE id = $' + values.length, values)
  const r = await pool.query('SELECT * FROM agencies WHERE id = $1', [id])
  return NextResponse.json({ agency: r.rows[0] })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const isAdmin = userId === process.env.ADMIN_CLERK_USER_ID
  if (!userId || !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = (await params).id
  const r = await pool.query('SELECT * FROM agencies WHERE id = $1', [id])
  if (r.rows.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ agency: r.rows[0] })
}
