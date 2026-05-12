import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { pool } from '@/lib/db'

async function getUserRole(userId: string): Promise<'agency' | 'caregiver' | null> {
  // Check agency ownership
  const { rows: agencyRows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )
  if (agencyRows.length > 0) {
    return 'agency'
  }

  // Check agency team membership
  const { rows: teamRows } = await pool.query(
    `SELECT tm.role FROM agency_team_members tm
     JOIN agencies a ON a.id = tm.agency_id
     WHERE tm.clerk_user_id = $1 AND tm.status = 'active' AND a.status = 'approved'`,
    [userId]
  )
  if (teamRows.length > 0) {
    return 'agency'
  }

  // Check caregiver
  const { rows: caregiverRows } = await pool.query(
    'SELECT id FROM caregivers WHERE user_id = $1',
    [userId]
  )
  if (caregiverRows.length > 0) {
    return 'caregiver'
  }

  return null
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/settings')

  const role = await getUserRole(userId)
  const backHref = role === 'agency' ? '/agency/dashboard' : '/profile/build'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href={backHref} style={{
          display: 'inline-block',
          fontSize: '14px',
          color: '#64748B',
          textDecoration: 'none',
          marginBottom: '24px',
        }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#0D1B3E', marginBottom: '16px' }}>
          Account Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.6 }}>
          Settings are coming soon. You'll be able to manage your account, notifications, and preferences here.
        </p>
        <div style={{ marginTop: '24px', padding: '20px', background: '#FDF6EC', borderRadius: '12px', border: '1px solid #C9973A' }}>
          <p style={{ fontSize: '14px', color: '#0D1B3E', fontWeight: 500 }}>
            Available now:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px', color: '#64748B', fontSize: '14px', lineHeight: 1.8 }}>
            <li><a href="/settings/data-rights" style={{ color: '#1E3A8A', textDecoration: 'none' }}>Data & Privacy</a></li>
            <li><a href="/settings/communications" style={{ color: '#1E3A8A', textDecoration: 'none' }}>Communication preferences</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}