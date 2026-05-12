import { pool } from '@/lib/db'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin')
  }
  const adminId = process.env.ADMIN_CLERK_USER_ID
  if (!adminId || userId !== adminId) {
    redirect('/')
  }
}

async function getAdminStats() {
  const [
    caregivers, agencies, clients, refs,
    pendingAgencies, approvedAgencies,
    recentAgencies, recentCaregivers,
    moduleCounts, trialAgencies, demoAgencies,
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM caregivers WHERE status='approved'"),
    pool.query("SELECT COUNT(*) FROM agencies"),
    pool.query("SELECT COUNT(*) FROM client_needs"),
    pool.query("SELECT COUNT(*) FROM reference_verification_requests WHERE status='completed'"),
    pool.query("SELECT COUNT(*) FROM agencies WHERE status='pending'"),
    pool.query("SELECT COUNT(*) FROM agencies WHERE status IN ('approved','active')"),
    pool.query("SELECT id,name,status,plan_tier,subscription_status,modules_enabled,created_at,city,state FROM agencies ORDER BY created_at DESC LIMIT 8"),
    pool.query("SELECT id,first_name,last_name,city,state,profile_completion_pct,verification_tier,created_at FROM caregivers WHERE status='approved' ORDER BY created_at DESC LIMIT 5"),
    pool.query("SELECT modules_enabled FROM agencies WHERE status IN ('approved','active')"),
    pool.query("SELECT COUNT(*) FROM agencies WHERE subscription_status='trial'"),
    pool.query("SELECT a.id,a.name,a.email,a.created_at, COUNT(c.id) as caregiver_count FROM agencies a LEFT JOIN caregivers c ON c.source_agency_id = a.id WHERE a.is_demo = true GROUP BY a.id"),
  ])

  // Module adoption
  const moduleAdoption: Record<string, number> = {}
  moduleCounts.rows.forEach((r: any) => {
    (r.modules_enabled || []).forEach((m: string) => {
      moduleAdoption[m] = (moduleAdoption[m] || 0) + 1
    })
  })

  return {
    caregivers: parseInt(caregivers.rows[0].count),
    agencies: parseInt(agencies.rows[0].count),
    clients: parseInt(clients.rows[0].count),
    refs: parseInt(refs.rows[0].count),
    pendingAgencies: parseInt(pendingAgencies.rows[0].count),
    approvedAgencies: parseInt(approvedAgencies.rows[0].count),
    trialAgencies: parseInt(trialAgencies.rows[0].count),
    recentAgencies: recentAgencies.rows,
    recentCaregivers: recentCaregivers.rows,
    moduleAdoption,
    demoAgencies: demoAgencies.rows,
  }
}

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

function StatCard({ label, value, sub, color = N }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const c =
    status === 'approved' || status === 'active' ? { bg: '#F0FDF4', color: '#16A34A' } :
    status === 'pending' ? { bg: '#FFFBEB', color: '#D97706' } :
    { bg: '#FEF2F2', color: '#DC2626' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: c.bg, color: c.color }}>
      {status}
    </span>
  )
}

export default async function AdminDashboard() {
  await checkAdmin()
  const s = await getAdminStats()

  const MODULE_LABELS: Record<string, string> = {
    core: 'Core', intelligence: 'Intelligence', airecruit: 'AIRecruit',
    receptionist: 'Receptionist', family_portal: 'Family Portal', white_label: 'White Label'
  }

  return (
    <div style={{ fontFamily: S, color: N }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: N, margin: '0 0 4px' }}>Admin Console</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Careified platform overview — {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Approved caregivers" value={s.caregivers} />
        <StatCard label="Total agencies" value={s.agencies} sub={`${s.pendingAgencies} pending approval`} color={s.pendingAgencies > 0 ? '#D97706' : N} />
        <StatCard label="Active clients" value={s.clients} />
        <StatCard label="Verified references" value={s.refs} />
      </div>

      {/* Alert: pending agencies */}
      {s.pendingAgencies > 0 && (
        <Link href="/admin/agencies" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 20px', marginBottom: 24, textDecoration: 'none' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>{s.pendingAgencies} agency application{s.pendingAgencies > 1 ? 's' : ''} awaiting review</span>
            <span style={{ fontSize: 12, color: '#92400E', marginLeft: 8 }}>Review and approve to give access</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>Review →</span>
        </Link>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Recent agencies */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Agencies</span>
            <Link href="/admin/agencies" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {s.recentAgencies.map((a: any) => (
            <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{a.name || 'Unnamed'}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.city || '—'}{a.state ? ', ' + a.state : ''} · {new Date(a.created_at).toLocaleDateString('en-CA')}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{a.plan_tier || 'starter'}</span>
                <StatusBadge status={a.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Module adoption + billing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 14 }}>Module adoption</div>
            {Object.entries(s.moduleAdoption).sort((a, b) => b[1] - a[1]).map(([mod, count]) => (
              <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{MODULE_LABELS[mod] || mod}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 60, height: 4, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: G, width: `${Math.min(100, (count / Math.max(s.approvedAgencies, 1)) * 100)}%`, borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 16, textAlign: 'right' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 14 }}>Billing overview</div>
            {[
              { label: 'Approved agencies', value: s.approvedAgencies, color: '#16A34A' },
              { label: 'On trial', value: s.trialAgencies, color: '#D97706' },
              { label: 'Pending approval', value: s.pendingAgencies, color: '#94A3B8' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>MRR tracking available after Stripe integration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo accounts */}
      {s.demoAgencies && s.demoAgencies.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Demo Accounts</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{s.demoAgencies.length} demo agency</span>
          </div>
          {s.demoAgencies.map((a: any) => (
            <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{a.name}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.email} · Created {new Date(a.created_at).toLocaleDateString('en-CA')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>{a.caregiver_count} caregivers</span>
                <form action={`/api/admin/demo/wipe/${a.id}`} method="POST" onSubmit={(e) => { if (!confirm('Are you sure? This cannot be undone.')) e.preventDefault() }}>
                  <button type="submit" style={{ fontSize: 11, padding: '4px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>Wipe</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent caregivers */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: N }}>Recent caregivers</span>
          <Link href="/admin/caregivers" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {s.recentCaregivers.map((c: any) => (
            <Link key={c.id} href={`/profile/${c.id}`} style={{ padding: '14px 16px', borderRight: '1px solid #F9FAFB', textDecoration: 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: N }}>{c.first_name} {c.last_name}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>{c.city || '—'}, {c.state || '—'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: c.profile_completion_pct >= 80 ? '#16A34A' : '#D97706' }}>{c.profile_completion_pct || 0}%</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>T{c.verification_tier || 4}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
        {[
          { label: 'Agency management', desc: 'Approve, edit, modules', href: '/admin/agencies' },
          { label: 'Caregiver management', desc: 'Profiles, verification', href: '/admin/caregivers' },
          { label: 'Badge management', desc: 'Award, remove badges', href: '/admin/badges' },
          { label: 'Review management', desc: 'Placement reviews', href: '/admin/reviews' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', border: '1px solid #E2E8F0', textDecoration: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 3 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{l.desc}</div>
          </Link>
        ))}
      </div>

      {/* Quick links row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
        {[
          { label: 'Reference verification', desc: 'Manage references', href: '/admin/references' },
          { label: 'Build status', desc: 'Features, env vars, DB', href: '/admin/status' },
          { label: 'Site map', desc: 'All 36 pages', href: '/admin/sitemap' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', border: '1px solid #E2E8F0', textDecoration: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N, marginBottom: 3 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
