import { promises as fs } from 'fs'
import { join } from 'path'

const N = '#0D1B3E'
const G = '#C9973A'

type RouteInfo = {
  route: string
  category: string
  access: string
  filePath: string
  isDynamic: boolean
  isOrphan: boolean
}

// Routes that are reachable via navbar/dropdowns (NOT orphans)
const LINKED_ROUTES = [
  '/', '/about', '/contact', '/privacy', '/terms',
  '/for-caregivers', '/for-agencies', '/for-families',
  '/sign-in', '/sign-up', '/demo', '/opportunities',
  '/profile/build', '/profile/strength', '/profile/demo',
  '/settings', '/settings/communications', '/settings/data-rights',
  '/agency/dashboard', '/agency/search', '/agency/shortlist',
  '/agency/clients', '/agency/clients/new', '/agency/airecruit',
  '/agency/airecruit/new', '/agency/settings', '/agency/billing',
  '/admin', '/admin/agencies', '/admin/caregivers',
  '/admin/status', '/admin/sitemap', '/admin/badges',
  '/admin/reviews', '/admin/references',
]

// Routes that are intentionally not linked (system routes)
const INTENTIONAL_UNLINKED = [
  '/id/:caregiverId', '/verify/:slug', '/reference/:token',
  '/profile/:id', '/demo/dashboard', '/demo/search',
  '/demo/clients', '/demo/clients/:id',
  '/agency/pending-approval', '/agency/signup',
  '/agency/clients/:id', '/agency/clients/:id/review',
  '/agency/airecruit/:campaignId', '/agency/airecruit/:campaignId/:callId',
  '/onboarding', '/profile/dispute/:id',
]

function categorizeRoute(path: string): { category: string; access: string } {
  const segments = path.split('/').filter(Boolean)
  
  if (segments[0] === 'api') return { category: 'api', access: 'API route' }
  if (segments[0] === 'admin') return { category: 'admin', access: 'Super admin only' }
  if (segments[0] === 'agency') return { category: 'agency', access: 'Approved agency' }
  if (segments[0] === 'profile' || segments[0] === 'opportunities' || segments[0] === 'settings' || segments[0] === 'id' || segments[0] === 'verify') {
    return { category: 'caregiver', access: 'Caregiver login' }
  }
  if (segments[0] === 'sign-in' || segments[0] === 'sign-up' || segments[0] === 'onboarding') {
    return { category: 'auth', access: 'Auth' }
  }
  if (segments[0] === 'reference') return { category: 'public', access: 'Public token-based' }
  return { category: 'public', access: 'No auth required' }
}

async function walkDir(dir: string, base: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const paths: string[] = []
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = fullPath.replace(base, '').replace(/\\/g, '/')
    
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue
      if (entry.name === 'api' || entry.name === 'admin' || entry.name === 'agency' || 
          entry.name === 'profile' || entry.name === 'opportunities' || entry.name === 'settings' ||
          entry.name === 'id' || entry.name === 'verify' || entry.name === 'reference') {
        const subPaths = await walkDir(fullPath, base)
        paths.push(...subPaths)
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'route.ts') {
      let route = relativePath.replace('/page.tsx', '').replace('/route.ts', '')
      if (route.includes('[')) {
        route = route.replace(/\[([^\]]+)\]/g, ':$1')
      }
      paths.push(route || '/')
    }
  }
  
  return paths
}

export default async function SitemapPage() {
  const appDir = join(process.cwd(), 'app')
  const allPaths = await walkDir(appDir, appDir)
  
  const routes: RouteInfo[] = allPaths.map(path => {
    const { category, access } = categorizeRoute(path)
    const filePath = path === '/'
      ? 'app/page.tsx'
      : `app${path}/page.tsx`
    const isDynamic = path.includes(':')

    // Check if route is orphaned (not in navbar/dropdowns)
    const isOrphan = !LINKED_ROUTES.includes(path) && !INTENTIONAL_UNLINKED.some(u => {
      const pattern = u.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(path)
    })

    return { route: path, category, access, filePath, isDynamic, isOrphan }
  })

  // Get orphan routes
  const orphanRoutes = routes.filter(r => r.isOrphan)
  
  // Sort: admin, agency, caregiver, public, auth, api
  const categoryOrder: Record<string, number> = {
    admin: 0,
    agency: 1,
    caregiver: 2,
    public: 3,
    auth: 4,
    api: 5,
  }
  
  routes.sort((a, b) => {
    const orderDiff = categoryOrder[a.category] - categoryOrder[b.category]
    if (orderDiff !== 0) return orderDiff
    return a.route.localeCompare(b.route)
  })
  
  // Group by category
  const grouped = routes.reduce((acc, route) => {
    if (!acc[route.category]) acc[route.category] = []
    acc[route.category].push(route)
    return acc
  }, {} as Record<string, RouteInfo[]>)
  
  const categoryInfo: Record<string, { label: string; color: string; bg: string; border: string }> = {
    admin: { label: 'Admin — super access only', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
    agency: { label: 'Agency — approved login required', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    caregiver: { label: 'Caregiver — login required', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4' },
    public: { label: 'Public', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
    auth: { label: 'Auth', color: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE' },
    api: { label: 'API', color: '#374151', bg: '#F3F4F6', border: '#D1D5DB' },
  }
  
  const order = ['admin', 'agency', 'caregiver', 'public', 'auth', 'api']
  const total = routes.length
  const orphanCount = orphanRoutes.length

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: 'system-ui, sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, margin: '0 0 4px' }}>Site map</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
          Auto-generated from filesystem — {total} routes
        </p>

        {/* ORPHAN ROUTES SECTION */}
        {orphanCount > 0 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#92400E', margin: 0 }}>Orphan Pages — Need Navigation Links ({orphanCount})</h2>
            </div>
            <p style={{ fontSize: 13, color: '#B45309', margin: '0 0 12px' }}>
              These pages exist but are not linked from navbar/dropdowns. Add to navigation or mark as intentional.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {orphanRoutes.map(r => (
                <code key={r.route} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 6,
                  background: 'white', color: '#92400E', border: '1px solid #FDE68A'
                }}>
                  {r.route}
                </code>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {order.map(cat => {
            const routesInCat = grouped[cat]
            if (!routesInCat?.length) return null
            const info = categoryInfo[cat]
            
            return (
              <div key={cat} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: info.bg, borderBottom: `1px solid ${info.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: info.color }}>{info.label}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{routesInCat.length} routes</span>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Route</th>
                      <th style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Access</th>
                      <th style={{ textAlign: 'left', padding: '10px 20px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routesInCat.map((route, i) => (
                      <tr key={route.route} style={{ borderBottom: i < routesInCat.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <code style={{ fontSize: 13, fontFamily: 'monospace', color: N, fontWeight: 500 }}>{route.route}</code>
                          {route.isDynamic && (
                            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#FEF3C7', color: '#92400E' }}>[dynamic]</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#64748B', fontSize: 12 }}>{route.access}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <code style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8' }}>{route.filePath}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
