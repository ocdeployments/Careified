import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import ReferencesClient from './ReferencesClient'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

type ReferenceRequest = {
  id: string
  caregiver_first_name: string
  caregiver_last_name: string
  reference_name: string
  reference_email: string
  relationship: string
  status: string
  sent_at: string | null
  completed_at: string | null
  would_rehire: string | null
  reliability_rating: number | null
  professionalism_rating: number | null
}

async function getPendingReferences(): Promise<ReferenceRequest[]> {
  const { rows } = await pool.query(
    `SELECT
      r.id,
      c.first_name AS caregiver_first_name,
      c.last_name AS caregiver_last_name,
      r.reference_name,
      r.reference_email,
      r.relationship,
      r.status,
      r.sent_at,
      r.completed_at,
      r.would_rehire,
      r.reliability_rating,
      r.professionalism_rating
    FROM reference_verification_requests r
    JOIN caregivers c ON r.caregiver_id = c.id
    WHERE r.status IN ('pending', 'sent')
    ORDER BY r.sent_at DESC NULLS LAST
    LIMIT 50`
  )
  return rows
}

async function getCompletedReferences(): Promise<ReferenceRequest[]> {
  const { rows } = await pool.query(
    `SELECT
      r.id,
      c.first_name AS caregiver_first_name,
      c.last_name AS caregiver_last_name,
      r.reference_name,
      r.reference_email,
      r.relationship,
      r.status,
      r.sent_at,
      r.completed_at,
      r.would_rehire,
      r.reliability_rating,
      r.professionalism_rating
    FROM reference_verification_requests r
    JOIN caregivers c ON r.caregiver_id = c.id
    WHERE r.status = 'completed'
    ORDER BY r.completed_at DESC
    LIMIT 50`
  )
  return rows
}

export default async function AdminReferencesPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    redirect('/sign-in')
  }

  const [pending, completed] = await Promise.all([
    getPendingReferences(),
    getCompletedReferences(),
  ])

  return <ReferencesClient pending={pending} completed={completed} />
}