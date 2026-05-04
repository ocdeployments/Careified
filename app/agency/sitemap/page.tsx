import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'

const SECTIONS = [
  {
    label: 'Dashboard',
    icon: '🏠',
    routes: [
      { name: 'Dashboard', desc: 'Your agency home with AI command bar', path: '/agency/dashboard' },
    ],
  },
  {
    label: 'Search & Shortlist',
    icon: '🔍',
    routes: [
      { name: 'Search Caregivers', desc: 'Browse 20+ filters, find perfect matches', path: '/agency/search' },
      { name: 'Shortlist', desc: 'Saved candidates for your clients', path: '/agency/shortlist' },
    ],
  },
  {
    label: 'Clients',
    icon: '👥',
    routes: [
      { name: 'Client List', desc: 'All your clients and their status', path: '/agency/clients' },
      { name: 'New Client', desc: 'Add a new client intake', path: '/agency/clients/new' },
    ],
  },
  {
    label: 'AIRecruit',
    icon: '📞',
    routes: [
      { name: 'Campaigns', desc: 'View and manage AI screening campaigns', path: '/agency/airecruit' },
      { name: 'New Campaign', desc: 'Start a new AI recruitment campaign', path: '/agency/airecruit/new' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    routes: [
      { name: 'Agency Settings', desc: 'Branding, service areas, team, compliance', path: '/agency/settings' },
      { name: 'Billing & Plans', desc: 'View plan, modules, and trial status', path: '/agency/billing' },
      { name: 'Sitemap', desc: 'All agency pages in one place', path: '/agency/sitemap' },
    ],
  },
]

async function checkAgencyAccess() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  
  const { rows } = await pool.query(
    'SELECT status FROM agencies WHERE clerk_user_id = $1',
    [userId]
  )
  
  if (!rows.length) {
    redirect('/onboarding')
  }
  
  if (rows[0].status !== 'approved' && rows[0].status !== 'active') {
    redirect('/agency/pending-approval')
  }
  
  return rows[0]
}

export default async function AgencySitemapPage() {
  const agency = await checkAgencyAccess()
  
  const total = SECTIONS.reduce((acc, s) => acc + s.routes.length, 0)
  
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: 'system-ui, sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 8px' }}>
          Agency Sitemap
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 32px' }}>
          All {total} pages accessible to your agency
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: '#FDF6EC', borderBottom: '1px solid #FDE68A', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{section.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: N }}>{section.label}</span>
                <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{section.routes.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.routes.map((route, i) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    style={{
                      display: 'block',
                      padding: '16px 20px',
                      textDecoration: 'none',
                      borderBottom: i < section.routes.length - 1 ? '1px solid #F9FAFB' : 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: N, marginBottom: '4px' }}>
                      {route.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {route.desc}
                    </div>
                    <code style={{ fontSize: 11, color: G, marginTop: '6px', display: 'block' }}>
                      {route.path}
                    </code>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 32, padding: 16, background: '#F8FAFC', borderRadius: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            Need help? Contact your account manager or visit{' '}
            <Link href="/contact" style={{ color: G, textDecoration: 'none' }}>/contact</Link>
          </span>
        </div>
      </div>
    </div>
  )
}
