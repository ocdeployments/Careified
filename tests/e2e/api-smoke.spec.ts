import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://www.careified.com'

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

  for (const route of PROTECTED_ROUTES) {
    test(`${route.method} ${route.path} - should return 401`, async ({ request }) => {
      // Create a fresh context with no cookies to ensure unauthenticated request
      const freshContext = await request.newContext()
      const response = await freshContext.get(route.path)
      await freshContext.dispose()

      // Assert: 401, not 200 or 500
      expect(response.status()).toBe(401)
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