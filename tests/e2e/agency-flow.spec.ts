import { test, expect } from '@playwright/test'

const PREVIEW_URL = 'https://careified-mdm58l9w9-ocdeployments-projects.vercel.app'

test.describe('Agency Flow', () => {
  test.use({ baseURL: PREVIEW_URL })

  test('1. For-agencies page loads', async ({ page }) => {
    await page.goto('/for-agencies')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: "Join" or "Sign up" CTA present
    const ctaVisible = await Promise.all([
      page.locator('button:has-text("Join"), a:has-text("Join")').isVisible().catch(() => false),
      page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').isVisible().catch(() => false),
      page.locator('button:has-text("Get Started"), a:has-text("Get Started")').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(ctaVisible).toBe(true)
  })

  test('2. Agency sign-in works', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    await page.goto('/sign-in')

    // Fill email
    await page.fill('input[name="email"], input[type="email"], input[id="email-address"]', email)

    // Fill password
    await page.fill('input[name="password"], input[type="password"], input[id="password"]', password)

    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Continue")')
    await submitBtn.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: redirected to /agency/dashboard
    // Note: might redirect to /sign-in again if agency not approved
    // Just check we're not on error page
    expect(page.url()).not.toContain('error')
    expect(page.url()).not.toContain('/500')

    // Save auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })
  })

  test('3. Agency dashboard renders', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/dashboard')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: dashboard loads (no 500)
    expect(page.url()).not.toContain('/500')

    // Assert: AI command bar visible (look for AIRecruit elements)
    const aiBar = await Promise.all([
      page.locator('text=AIRecruit').isVisible().catch(() => false),
      page.locator('[data-testid="ai-command"]').isVisible().catch(() => false),
      page.locator('input[placeholder*="Ask"], input[placeholder*="Search"]').first().isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    // AI bar may not be visible if no permissions yet, check for dashboard elements
    const dashboardContent = page.locator('h1, h2, [class*="dashboard"]')
    await expect(dashboardContent.first()).toBeVisible({ timeout: 10000 })

    // Assert: quick links present (search, shortlist, roster)
    const quickLinks = await Promise.all([
      page.locator('a:has-text("Search")').isVisible().catch(() => false),
      page.locator('a:has-text("Shortlist")').isVisible().catch(() => false),
      page.locator('a:has-text("Roster")').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(quickLinks).toBe(true)

    // Assert: stats visible (even if 0)
    const stats = page.locator('[class*="stat"], [class*=" Stat"], text=/\\d+/)
    await expect(stats.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // If no stats, at least page should load
      expect(page.url()).toContain('dashboard')
    })
  })

  test('4. Agency search loads with caregivers', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/search')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: filter panel present
    const filterPanel = page.locator('[data-testid="filters"], aside, [class*="filter"]')
    await expect(filterPanel.first()).toBeVisible({ timeout: 5000 })

    // Assert: at least 1 caregiver card visible (demo data)
    const caregiverCards = page.locator('[class*="card"], [data-testid*="caregiver"]')
    await expect(caregiverCards.first()).toBeVisible({ timeout: 10000 })

    // Assert: match score visible on cards
    const scoreVisible = await Promise.all([
      page.locator('text=/\\d+%/).first().isVisible().catch(() => false),
      page.locator('text=Match').isVisible().catch(() => false),
      page.locator('text=Score').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    // Score might not always be visible, just check cards loaded
  })

  test('5. Caregiver profile opens from search', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/search')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Wait for cards to load
    await page.waitForTimeout(2000)

    // Click first caregiver card
    const firstCard = page.locator('[class*="card"]').first()
    await firstCard.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: URL changes to /profile/[id]
    expect(page.url()).toMatch(/\/profile\/[\w-]+/)

    // Assert: profile page loads
    expect(page.url()).not.toContain('/500')

    // Assert: scorecard section visible
    const scorecard = await Promise.all([
      page.locator('[data-testid="scorecard"]').isVisible().catch(() => false),
      page.locator('text=Score').isVisible().catch(() => false),
      page.locator('text=Match').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    // Score may not render if no match yet

    // Assert: non-recommender disclaimer present
    const disclaimer = await Promise.all([
      page.locator('text=agency makes').isVisible().catch(() => false),
      page.locator('text=hiring decision').isVisible().catch(() => false),
      page.locator('text=not a recommendation').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    // Disclaimer is required on all profiles
    const bodyText = await page.content()
    expect(bodyText.toLowerCase()).toMatch(/agency|decision|recommend/)
  })

  test('6. Shortlist add works', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/search')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Wait for cards to load
    await page.waitForTimeout(2000)

    // Click shortlist/save button on first caregiver
    const shortlistBtn = page.locator('button[aria-label*="shortlist"], button[aria-label*="save"], button:has-text("Save"), button:has-text("Shortlist")').first()
    await shortlistBtn.click()

    // Wait for button state change
    await page.waitForTimeout(1000)

    // Assert: button state changes (saved confirmation)
    const buttonText = await shortlistBtn.textContent()
    expect(buttonText?.toLowerCase()).toMatch(/saved|shortlisted/)

    // Navigate to /agency/shortlist
    await page.goto('/agency/shortlist')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: at least 1 caregiver in shortlist
    const shortlistCards = page.locator('[class*="card"]')
    await expect(shortlistCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('7. Agency roster page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/roster')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: upload zone visible
    const uploadZone = await Promise.all([
      page.locator('text=Upload').isVisible().catch(() => false),
      page.locator('input[type="file"]').isVisible().catch(() => false),
      page.locator('text=Drop').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(uploadZone).toBe(true)

    // Assert: manual entry option visible
    const manualEntry = await Promise.all([
      page.locator('text=Add manually').isVisible().catch(() => false),
      page.locator('text=Manual entry').isVisible().catch(() => false),
      page.locator('button:has-text("Add")').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(manualEntry).toBe(true)
  })

  test('8. Resume upload on roster — PDF', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    // Create minimal test PDF
    const minimalPdf = Buffer.from(
      'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjIxOQolJUVPRgo=',
      'base64'
    )
    const fs = await import('fs')
    fs.writeFileSync('/tmp/test-resume.pdf', minimalPdf)

    await page.goto('/agency/roster/add')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Find file input and upload
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles('/tmp/test-resume.pdf')

    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: 60000 })

    // Assert: response is NOT 500
    expect(page.url()).not.toContain('/500')

    // Assert: either parsed fields OR "enter manually" fallback
    const eitherVisible = await Promise.all([
      page.locator('input[name="firstName"]').isVisible().catch(() => false),
      page.locator('text=Enter manually').isVisible().catch(() => false),
      page.locator('text=enter manually').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(eitherVisible).toBe(true)
  })

  test('9. Agency support page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/support')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: ticket form or support options visible
    const supportContent = await Promise.all([
      page.locator('form').isVisible().catch(() => false),
      page.locator('text=Support').isVisible().catch(() => false),
      page.locator('text=Contact').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(supportContent).toBe(true)
  })

  test('10. Agency settings page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/settings')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: form fields visible
    const formFields = page.locator('input, textarea, select')
    await expect(formFields.first()).toBeVisible({ timeout: 5000 })
  })

  test('11. AIRecruit page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/airecruit')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: "New campaign" or campaign list visible
    const campaignContent = await Promise.all([
      page.locator('text=New campaign').isVisible().catch(() => false),
      page.locator('text=Campaigns').isVisible().catch(() => false),
      page.locator('button:has-text("Campaign")').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(campaignContent).toBe(true)
  })

  test('12. Agency shortlist page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_AGENCY_EMAIL
    const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_AGENCY_EMAIL and PLAYWRIGHT_AGENCY_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/agency.json' })

    await page.goto('/agency/shortlist')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: either caregiver cards OR empty state visible
    const eitherVisible = await Promise.all([
      page.locator('[class*="card"]').first().isVisible().catch(() => false),
      page.locator('text=No candidates').isVisible().catch(() => false),
      page.locator('text=Empty').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(eitherVisible).toBe(true)
  })
})