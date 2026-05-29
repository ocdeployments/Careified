import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://www.careified.com'
const isBetaGated = process.env.BETA_GATED === 'true'

console.log('API auth tests skipped — beta gate active on target environment')

test.describe('API Routes - Unauthenticated', () => {
  test.use({ baseURL: PRODUCTION_URL })

  // All of these should return 401 when unauthenticated
  const PROTECTED_ROUTES = [
    { method: 'GET', path: '/api/agency/dashboard' },
    { method: 'GET', path: '/api/agency/clients' },
    { method: 'GET', path: '/api/agency/roster/list' },
    { method: 'GET', path: '/api/agency/shortlist' },
    { method: 'GET', path: '/api/agency/nav-counts' },
    { method: 'GET', path: '/api/profile/load' },
    { method: 'GET', path: '/api/caregiver/notifications' },
  ]

  // Skip auth tests when beta gate is active
  const shouldSkip = isBetaGated

  for (const route of PROTECTED_ROUTES) {
    test.skip(shouldSkip, 'API auth tests skipped — beta gate active on target environment')

    test(`${route.method} ${route.path} - should return 401`, async ({ page }) => {
      // Navigate to the route directly (not via API) to avoid auth session
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })
      const status = response?.status() || 0

      // Assert: 401, not 200 or 500
      expect(status).toBe(401)
    })
  }
})

test.describe('API Routes - Public', () => {
  test.use({ baseURL: PRODUCTION_URL })

  test('GET /api/health - should return 200', async ({ request }) => {
    const response = await request.get('/api/health')

    // Assert: 200
    expect(response.status()).toBe(200)
  })
})