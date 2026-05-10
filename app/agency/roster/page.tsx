// Careified — Agency Roster Page
// Add and manage caregivers in agency roster

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import RosterClient from './RosterClient'

const N = '#0D1B3E'
const G = '#C9973A'

async function getRosterData(agencyId: string) {
  try {
    const { rows: caregivers } = await pool.query(
      `SELECT id, first_name, last_name, email, phone, city, job_title, 
              years_experience, profile_status, created_at
       FROM caregivers 
       WHERE created_by_agency_id = $1
       ORDER BY created_at DESC`,
      [agencyId]
    )

    const { rows: [stats] } = await pool.query(
      `SELECT COUNT(*) as total FROM caregivers WHERE created_by_agency_id = $1`,
      [agencyId]
    )

    return {
      caregivers,
      totalCount: parseInt(stats?.count || '0'),
    }
  } catch {
    return { caregivers: [], totalCount: 0 }
  }
}

export default async function AgencyRosterPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { rows: agencyRows } = await pool.query(
    'SELECT id, name, locale FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )

  if (agencyRows.length === 0) {
    redirect('/onboarding')
  }

  const agency = agencyRows[0]
  if (agency.status !== 'approved' && agency.status !== 'active') {
    redirect('/agency/pending-approval')
  }

  const { caregivers, totalCount } = await getRosterData(agency.id)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: N, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ 
            fontFamily: "'DM Serif Display', serif", 
            fontSize: 32, 
            color: '#F5F0E8', 
            margin: '0 0 8px' 
          }}>
            Agency Roster
          </h1>
          <p style={{ 
            fontSize: 16, 
            color: 'rgba(255,255,255,0.7)', 
            margin: 0 
          }}>
            Add your caregivers to Careified. Upload their resume and we'll fill in the details automatically.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <RosterClient 
          agencyId={agency.id} 
          agencyName={agency.name}
          caregivers={caregivers}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}
