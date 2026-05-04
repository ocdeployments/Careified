import Link from 'next/link'
import CommandBar from '@/components/agency/CommandBar'
import { DEMO_AGENCY, DEMO_CLIENTS } from '@/lib/demo'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

export default function DemoDashboard() {
  const clients = DEMO_CLIENTS
  const shortlistCount = 3
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // For demo: simulate unmatched clients
  const unmatched = [clients[1], clients[3]]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S }}>
      {/* Hero */}
      <div style={{ background: N, padding: '40px 32px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{greeting}</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#F5F0E8', margin: '0 0 24px' }}>
            {DEMO_AGENCY.name}
          </h1>

          {/* Priority alert */}
          {unmatched.length > 0 && (
            <div style={{ background: 'rgba(201,151,58,0.15)', border: '1px solid rgba(201,151,58,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: G }}>
                  {unmatched.length} client{unmatched.length > 1 ? 's' : ''} without a matched caregiver
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
                  {unmatched.map((c: any) => c.clientFirstName).join(', ')}
                </span>
              </div>
              <Link href="/demo/clients" style={{ fontSize: 12, fontWeight: 700, color: G, textDecoration: 'none', background: 'rgba(201,151,58,0.15)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(201,151,58,0.3)' }}>
                View clients →
              </Link>
            </div>
          )}

          {/* Command bar */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>
              Tell me what you need — I will find the right caregiver
            </p>
            <CommandBar />
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: 'Find a caregiver', desc: 'Search and filter all profiles', href: '/demo/search', primary: true },
              { label: 'New client intake', desc: 'Add a client and run matches', href: '/demo/clients/new', primary: false },
              { label: 'My clients', desc: `${clients.length} active`, href: '/demo/clients', primary: false },
              { label: 'Shortlist', desc: `${shortlistCount} saved`, href: '/demo/shortlist', primary: false },
              { label: 'AIRecruit', desc: 'Run AI screening calls', href: '/demo/airecruit', primary: false },
            ].map(action => (
              <Link key={action.href} href={action.href} style={{
                display: 'block', padding: '16px 18px', borderRadius: 12, textDecoration: 'none',
                background: action.primary ? `linear-gradient(135deg, ${G}, #E8B86D)` : 'rgba(255,255,255,0.06)',
                border: action.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: action.primary ? N : '#F5F0E8', marginBottom: 3 }}>{action.label}</div>
                <div style={{ fontSize: 12, color: action.primary ? 'rgba(13,27,62,0.7)' : 'rgba(255,255,255,0.45)' }}>{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Recent clients */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Recent clients</span>
              <Link href="/demo/clients/new" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 600 }}>+ New client</Link>
            </div>
            {clients.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                No clients yet — <Link href="/demo/clients/new" style={{ color: G }}>add your first</Link>
              </div>
            ) : (
              clients.slice(0, 5).map((c: any) => (
                <Link key={c.id} href={`/demo/clients/${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F9FAFB', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{c.clientFirstName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{c.primaryCondition}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#F0FDF4', color: '#16A34A' }}>
                    {c.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* How to use */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 16 }}>How to find the right caregiver</div>
            {[
              { step: '1', text: 'Add a client with their clinical needs and schedule', href: '/demo/clients/new' },
              { step: '2', text: 'View ranked caregiver matches automatically generated', href: '/demo/clients' },
              { step: '3', text: 'Check the "Verify in your call" list before you dial', href: '/demo/clients' },
              { step: '4', text: 'Shortlist top candidates and compare side by side', href: '/demo/shortlist' },
              { step: '5', text: 'Or browse all caregivers manually with search filters', href: '/demo/search' },
            ].map(s => (
              <Link key={s.step} href={s.href} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, textDecoration: 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: N, flexShrink: 0 }}>{s.step}</span>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{s.text}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Demo notice card */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>Demo Mode</div>
          <div style={{ fontSize: 13, color: '#B45309' }}>This is sample data. To create your own agency, sign up for free.</div>
          <Link href="/sign-up?role=agency" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#0D1B3E', textDecoration: 'none', backgroundColor: '#C9973A', padding: '6px 14px', borderRadius: 6 }}>Sign Up →</Link>
        </div>
      </div>
    </div>
  )
}