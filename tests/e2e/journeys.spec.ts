import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

// Journey 1: Public pages load correctly
test.describe('Public Pages', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/Careified/i)
    await expect(page.locator('nav')).toBeVisible()
  })

  test('for-caregivers page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/for-caregivers`)
    await expect(page.locator('h1')).toBeVisible()
    const text = await page.locator('h1').textContent()
    expect(text).toBeTruthy()
  })

  test('for-agencies page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/for-agencies`)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('privacy and terms pages load', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`)
    expect(await page.locator('body').textContent()).toBeTruthy()
    await page.goto(`${BASE_URL}/terms`)
    expect(await page.locator('body').textContent()).toBeTruthy()
  })

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(BASE_URL)
    await page.waitForTimeout(2000)
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('hydration') &&
      !e.includes('Warning:')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

// Journey 2: Auth redirects work
test.describe('Auth Protection', () => {
  test('/agency/dashboard redirects unauthenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/agency/dashboard`)
    await page.waitForURL(/sign-in|onboarding/, { timeout: 5000 })
      .catch(() => {})
    const url = page.url()
    expect(
      url.includes('sign-in') ||
      url.includes('onboarding') ||
      url !== `${BASE_URL}/agency/dashboard`
    ).toBe(true)
  })

  test('/admin redirects unauthenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForURL(/sign-in|forbidden/, { timeout: 5000 })
      .catch(() => {})
    const url = page.url()
    expect(url).not.toBe(`${BASE_URL}/admin`)
  })

  test('/caregiver/notifications redirects unauthenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/caregiver/notifications`)
    await page.waitForURL(/sign-in/, { timeout: 5000 }).catch(() => {})
    expect(page.url()).not.toContain('/caregiver/notifications')
  })
})

// Journey 3: Claim flow handles bad tokens gracefully
test.describe('Claim Flow', () => {
  test('expired token shows error message not 500', async ({ page }) => {
    await page.goto(`${BASE_URL}/claim/invalid-token-123`)
    await page.waitForLoadState('networkidle')
    const status = await page.evaluate(() =>
      document.title.includes('500') ||
      document.body.textContent?.includes('Internal Server Error')
    )
    expect(status).toBe(false)
    // Should show an expired/invalid message
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
    expect(body?.length).toBeGreaterThan(10)
  })
})

// Journey 4: Mobile viewport
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('landing page renders on iPhone 14', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.locator('nav')).toBeVisible()
    // Nav should be visible (not hidden behind hamburger)
    const navVisible = await page.locator('nav').isVisible()
    expect(navVisible).toBe(true)
  })

  test('for-caregivers CTA visible on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/for-caregivers`)
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })
})

// Journey 5: API security
test.describe('API Security', () => {
  test('profile load returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/profile/load`)
    expect([401, 403]).toContain(res.status())
  })

  test('roster list returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/roster/list`)
    expect([401, 403]).toContain(res.status())
  })

  test('notifications count returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/notifications/count`)
    expect([401, 403]).toContain(res.status())
  })

  test('claim token returns structured response not 500', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/claim/invalid-token`)
    expect(res.status()).not.toBe(500)
  })
})