'use client'

const N = '#0D1B3E'
const S = 'system-ui, sans-serif'

const SECTIONS = [
  { label: 'Public', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', pages: [
    { path: '/', desc: 'Landing page' },
    { path: '/for-caregivers', desc: 'Caregiver pitch' },
    { path: '/for-agencies', desc: 'Agency pitch' },
    { path: '/for-families', desc: 'Family pitch' },
    { path: '/about', desc: 'Company info' },
    { path: '/contact', desc: 'Contact form' },
    { path: '/privacy', desc: 'Privacy policy' },
    { path: '/terms', desc: 'Terms of use' },
  ]},
  { label: 'Auth', color: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE', pages: [
    { path: '/sign-in', desc: 'Sign in' },
    { path: '/sign-up', desc: 'Sign up with role param' },
    { path: '/onboarding', desc: 'Role redirect gateway' },
  ]},
  { label: 'Caregiver — login required', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', pages: [
    { path: '/profile/build', desc: 'Steps 0-10 builder' },
    { path: '/profile/[id]', desc: 'Agency-facing scorecard' },
    { path: '/profile/demo', desc: 'Maria Santos demo' },
    { path: '/profile/strength', desc: 'Profile strength dashboard' },
    { path: '/opportunities', desc: 'Job feed' },
    { path: '/settings/communications', desc: 'Consent preferences' },
    { path: '/settings/data-rights', desc: 'Export and delete' },
    { path: '/id/[caregiverId]', desc: 'Wallet ID card' },
    { path: '/verify/[slug]', desc: 'Public verification' },
  ]},
  { label: 'Agency — approved login required', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', pages: [
    { path: '/agency/search', desc: '20+ filters, 15 caregivers' },
    { path: '/agency/shortlist', desc: 'Saved candidates' },
    { path: '/agency/clients', desc: 'Client list' },
    { path: '/agency/clients/new', desc: 'Intake form 8 sections' },
    { path: '/agency/clients/[id]', desc: 'Match analysis and gaps' },
    { path: '/agency/airecruit', desc: 'AIRecruit hub' },
    { path: '/agency/airecruit/new', desc: 'New campaign' },
    { path: '/agency/airecruit/[id]', desc: 'Campaign and calls' },
    { path: '/agency/airecruit/[id]/[call]', desc: 'Call transcript' },
    { path: '/agency/dashboard', desc: 'Action-first home page' },
    { path: '/agency/settings', desc: 'Branding, areas, team, compliance' },
    { path: '/agency/signup', desc: 'Agency registration' },
    { path: '/agency/pending-approval', desc: 'Waiting screen' },
  ]},
  { label: 'Public token-based', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', pages: [
    { path: '/reference/[token]', desc: '4-min reference form, no auth' },
  ]},
  { label: 'Admin — super access only', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', pages: [
    { path: '/admin', desc: 'Dashboard' },
    { path: '/admin/agencies', desc: 'Approve and reject agencies' },
    { path: '/admin/caregivers', desc: 'Manage caregiver profiles' },
    { path: '/admin/status', desc: 'Build tracker' },
    { path: '/admin/sitemap', desc: 'This page' },
  ]},
]

export default function SitemapPage() {
  const total = SECTIONS.reduce((a, s) => a + s.pages.length, 0)
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: N, margin: '0 0 4px' }}>Site map</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 32px' }}>
          All {total} pages grouped by access level
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: section.bg, borderBottom: `1px solid ${section.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: section.color }}>{section.label}</span>
                <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{section.pages.length} pages</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {section.pages.map((page) => (
                  <div key={page.path} style={{ padding: '14px 20px', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: section.color, fontFamily: 'monospace', marginBottom: 3 }}>{page.path}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{page.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
