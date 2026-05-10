// Careified — Admin Sitemap (Live Visual Tool)
// Auto-discovers all pages from filesystem at runtime

import { promises as fs } from 'fs'
import { join } from 'path'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

type RouteInfo = {
  route: string
  category: string
  access: string
  status: string
  lineCount: number
  isDynamic: boolean
}

// AUTH REQUIREMENTS (hardcoded mapping)
const ACCESS_MAP: Record<string, string> = {
  '/': 'PUBLIC',
  '/for-caregivers': 'PUBLIC',
  '/for-agencies': 'PUBLIC',
  '/for-families': 'PUBLIC',
  '/about': 'PUBLIC',
  '/contact': 'PUBLIC',
  '/privacy': 'PUBLIC',
  '/terms': 'PUBLIC',
  '/sign-in': 'PUBLIC',
  '/sign-up': 'PUBLIC',
  '/onboarding': 'PUBLIC',
  '/opportunities': 'PUBLIC',
  '/verify/[slug]': 'PUBLIC',
  '/id/[caregiverId]': 'PUBLIC',
  '/reference/[token]': 'PUBLIC',
  '/claim/[token]': 'PUBLIC',
  '/profile/build': 'CAREGIVER',
  '/profile/start': 'CAREGIVER',
  '/profile/strength': 'CAREGIVER',
  '/profile/dispute/[id]': 'CAREGIVER',
  '/profile/[id]': 'AGENCY',
  '/settings': 'CAREGIVER',
  '/settings/communications': 'CAREGIVER',
  '/settings/data-rights': 'CAREGIVER',
  '/agency/dashboard': 'AGENCY',
  '/agency/search': 'AGENCY',
  '/agency/shortlist': 'AGENCY',
  '/agency/roster': 'AGENCY',
  '/agency/clients': 'AGENCY',
  '/agency/clients/new': 'AGENCY',
  '/agency/clients/[id]': 'AGENCY',
  '/agency/clients/[id]/review': 'AGENCY',
  '/agency/airecruit': 'AGENCY',
  '/agency/airecruit/new': 'AGENCY',
  '/agency/airecruit/[campaignId]': 'AGENCY',
  '/agency/airecruit/[campaignId]/[callId]': 'AGENCY',
  '/agency/settings': 'AGENCY',
  '/agency/billing': 'AGENCY',
  '/agency/signup': 'PUBLIC',
  '/agency/pending-approval': 'PUBLIC',
  '/admin': 'ADMIN',
  '/admin/agencies': 'ADMIN',
  '/admin/caregivers': 'ADMIN',
  '/admin/status': 'ADMIN',
  '/admin/sitemap': 'ADMIN',
  '/admin/badges': 'ADMIN',
}

function categorizeRoute(path: string): { category: string; access: string } {
  const segments = path.split('/').filter(Boolean)
  
  if (segments[0] === 'api') return { category: 'API', access: 'API' }
  if (segments[0] === 'admin') return { category: 'Admin', access: 'ADMIN' }
  if (segments[0] === 'agency') return { category: 'Agency', access: 'AGENCY' }
  if (segments[0] === 'profile') return { category: 'Caregiver', access: 'CAREGIVER' }
  if (segments[0] === 'settings') return { category: 'Caregiver', access: 'CAREGIVER' }
  if (segments[0] === 'reference') return { category: 'System', access: 'PUBLIC' }
  if (segments[0] === 'claim') return { category: 'System', access: 'PUBLIC' }
  if (segments[0] === 'verify') return { category: 'System', access: 'PUBLIC' }
  if (segments[0] === 'id') return { category: 'System', access: 'PUBLIC' }
  if (path.startsWith('/sign-')) return { category: 'Auth', access: 'PUBLIC' }
  if (segments[0] === 'onboarding') return { category: 'Auth', access: 'PUBLIC' }
  if (path === '/') return { category: 'Marketing', access: 'PUBLIC' }
  
  return { category: 'Marketing', access: 'PUBLIC' }
}

async function getAllPages(): Promise<RouteInfo[]> {
  const appDir = join(process.cwd(), 'app')
  const pages: RouteInfo[] = []
  
  async function scanDir(dir: string, prefix: string = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.')) continue
          if (entry.name === 'api') {
            // Scan API routes separately
            await scanApiRoutes(join(dir, entry.name))
            continue
          }
          
          const routeSegment = entry.name === 'app' ? '' : `/${entry.name}`
          await scanDir(fullPath, prefix + routeSegment)
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          let route = prefix || '/'
          
          // Check for dynamic route
          if (route.includes('[id]') || route.includes('[token]') || 
              route.includes('[slug]') || route.includes('[campaignId]') ||
              route.includes('[caregiverId]')) {
            route = route.replace(/\[id\]/g, '[id]')
            route = route.replace(/\[token\]/g, '[token]')
            route = route.replace(/\[slug\]/g, '[slug]')
            route = route.replace(/\[campaignId\]/g, '[campaignId]')
            route = route.replace(/\[caregiverId\]/g, '[caregiverId]')
          }
          
          // Get line count
          const content = await fs.readFile(fullPath, 'utf-8')
          const lineCount = content.split('\n').length
          
          const { category, access } = categorizeRoute(route)
          
          pages.push({
            route,
            category,
            access: ACCESS_MAP[route] || access,
            status: lineCount < 20 ? 'STUB' : 'LIVE',
            lineCount,
            isDynamic: route.includes('['),
          })
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  async function scanApiRoutes(apiDir: string) {
    try {
      const entries = await fs.readdir(apiDir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(apiDir, entry.name)
        
        if (entry.isDirectory()) {
          const routeSegment = `/${entry.name}`
          await scanApiDir(fullPath, routeSegment)
        }
      }
    } catch (e) {}
  }
  
  async function scanApiDir(dir: string, prefix: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await scanApiDir(fullPath, `${prefix}/${entry.name}`)
        } else if (entry.name === 'route.ts') {
          const content = await fs.readFile(fullPath, 'utf-8')
          const lineCount = content.split('\n').length
          
          pages.push({
            route: `/api${prefix}`,
            category: 'API',
            access: 'API',
            status: lineCount < 10 ? 'STUB' : 'LIVE',
            lineCount,
            isDynamic: false,
          })
        }
      }
    } catch (e) {}
  }
  
  await scanDir(appDir)
  return pages
}

export default async function SitemapPage() {
  const pages = await getAllPages()
  
  // Group by category
  const grouped = pages.reduce((acc, page) => {
    const cat = page.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(page)
    return acc
  }, {} as Record<string, RouteInfo[]>)
  
  // Calculate stats
  const stats = {
    total: pages.length,
    public: pages.filter(p => p.access === 'PUBLIC').length,
    agency: pages.filter(p => p.access === 'AGENCY').length,
    admin: pages.filter(p => p.access === 'ADMIN').length,
    caregiver: pages.filter(p => p.access === 'CAREGIVER').length,
    live: pages.filter(p => p.status === 'LIVE').length,
    stubs: pages.filter(p => p.status === 'STUB').length,
  }
  
  const categories = Object.keys(grouped).sort()
  
  return (
    <div style={{ fontFamily: S, background: '#F7F4F0', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: N, margin: '0 0 8px' }}>
          Sitemap
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
          Live visual representation of all routes in the application
        </p>
      </div>
      
      {/* Summary Bar */}
      <div style={{ 
        background: N, 
        borderRadius: 12, 
        padding: '16px 20px', 
        marginBottom: 24,
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F5F0E8', fontFamily: "'DM Serif Display', serif" }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total Pages
          </div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Public</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22C55E' }}>{stats.public}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Agency</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{stats.agency}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Admin</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#EF4444' }}>{stats.admin}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Caregiver</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: G }}>{stats.caregiver}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Live</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22C55E' }}>{stats.live}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Stubs</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#94A3B8' }}>{stats.stubs}</div>
        </div>
      </div>
      
      {/* Category Cards */}
      {categories.map(cat => (
        <div key={cat} style={{ 
          background: 'white', 
          borderRadius: 12, 
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          <div style={{ 
            background: cat === 'Marketing' ? '#0D1B3E' : 
                       cat === 'Auth' ? '#1E3A8A' :
                       cat === 'Agency' ? '#1E3A8A' :
                       cat === 'Caregiver' ? '#92400E' :
                       cat === 'Admin' ? '#7C2D12' :
                       cat === 'System' ? '#065F46' : '#64748B',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>
              {cat}
            </h2>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {grouped[cat].length} routes
            </span>
          </div>
          
          <div style={{ padding: 8 }}>
            {grouped[cat].map((page, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: idx < grouped[cat].length - 1 ? '1px solid #F1F5F9' : 'none',
                gap: 12,
              }}>
                <code style={{ 
                  flex: 1, 
                  fontSize: 13, 
                  color: N,
                  fontFamily: 'monospace',
                }}>
                  {page.route}
                </code>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  background: page.access === 'PUBLIC' ? '#DCFCE7' :
                              page.access === 'AGENCY' ? '#DBEAFE' :
                              page.access === 'ADMIN' ? '#FEE2E2' :
                              page.access === 'CAREGIVER' ? '#FEF3C7' :
                              '#F1F5F9',
                  color: page.access === 'PUBLIC' ? '#16A34A' :
                         page.access === 'AGENCY' ? '#1D4ED8' :
                         page.access === 'ADMIN' ? '#DC2626' :
                         page.access === 'CAREGIVER' ? '#D97706' :
                         '#64748B',
                }}>
                  {page.access}
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  background: page.status === 'LIVE' ? '#DCFCE7' : '#F1F5F9',
                  color: page.status === 'LIVE' ? '#16A34A' : '#94A3B8',
                }}>
                  {page.status}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 40, textAlign: 'right' }}>
                  {page.lineCount} lines
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
