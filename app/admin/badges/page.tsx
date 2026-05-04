import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import BadgesClient from './BadgesClient'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

type CaregiverBadge = {
  id: string
  first_name: string
  last_name: string
  email: string
  badges: Array<{
    id: string
    label: string
    description: string
    earned_at: string
  }>
}

async function getCaregiversWithBadges(): Promise<CaregiverBadge[]> {
  const { rows } = await pool.query(
    `SELECT c.id, c.first_name, c.last_name, c.email, c.badges
     FROM caregivers c
     WHERE c.badges IS NOT NULL AND jsonb_array_length(c.badges) > 0
     ORDER BY c.first_name, c.last_name
     LIMIT 50`
  )
  return rows
}

export default async function AdminBadgesPage() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    redirect('/sign-in')
  }

  const caregivers = await getCaregiversWithBadges()

  return <BadgesClient caregivers={caregivers} />
}