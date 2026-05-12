import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const VALID_TICKET_TYPES = ['billing', 'verification', 'platform', 'data_rights', 'dispute', 'feature', 'general']

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['pending_user', 'resolved'],
  pending_user: ['in_progress'],
  resolved: ['closed', 'open'],
  closed: ['open'],
}

const SLA_DAYS: Record<string, number | null> = {
  data_rights: 30,
  billing: 5,
  verification: 3,
  platform: 3,
  dispute: 7,
  feature: null,
  general: 5,
}

export async function generateTicketNumber(pool: Pool): Promise<string> {
  const { rows } = await pool.query('SELECT COUNT(*) FROM support_tickets')
  const count = parseInt(rows[0].count, 10)
  const nextNum = count + 1
  return `CRF-TKT-${nextNum.toString().padStart(4, '0')}`
}

export function getSLADueDate(type: string): Date | null {
  const days = SLA_DAYS[type]
  if (days === null) return null
  const due = new Date()
  due.setDate(due.getDate() + days)
  return due
}

export function validateTicketType(type: string): boolean {
  return VALID_TICKET_TYPES.includes(type)
}

export function validateTicketStatus(from: string, to: string): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[from]
  return allowed ? allowed.includes(to) : false
}

export { pool }
export { VALID_TICKET_TYPES, VALID_STATUS_TRANSITIONS, SLA_DAYS }