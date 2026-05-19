import { test, expect } from '@playwright/test'

const PREVIEW_URL = 'https://careified-mdm58l9w9-ocdeployments-projects.vercel.app'

test.describe('Caregiver Flow', () => {
  test.use({ baseURL: PREVIEW_URL })

  test('1. Landing page loads and CTA visible', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/')

    // Assert: page title contains "Careified"
    await expect(page).toHaveTitle(/Careified/i)

    // Assert: at least one CTA button exists
    const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Sign Up"), button:has-text("Join"), a:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Join")')
    await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 })

    // Assert: no JS console errors
    // Filter out known non-critical errors (like Clerk loading)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('Clerk') &&
      !e.includes('clerk') &&
      !e.includes('Failed to load')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('2. Caregiver sign-in works', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    await page.goto('/sign-in')

    // Fill email
    await page.fill('input[name="email"], input[type="email"], input[id="email-address"]', email)

    // Fill password
    await page.fill('input[name="password"], input[type="password"], input[id="password"]', password)

    // Submit - try multiple selectors
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Continue")')
    await submitBtn.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: redirected away from /sign-in
    expect(page.url()).not.toContain('/sign-in')

    // Assert: URL does not contain 'error'
    expect(page.url()).not.toContain('error')

    // Save auth state for subsequent tests
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })
  })

  test('3. Profile builder Step 0 loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/profile/build?step=0')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: resume upload zone is present
    const uploadZone = page.locator('text=Drop your resume, text=Drop your resume here, [data-testid="resume-upload"]')
    await expect(uploadZone.first()).toBeVisible({ timeout: 10000 })

    // Assert: "Skip" option visible
    const skipBtn = page.locator('button:has-text("Skip"), a:has-text("Skip")')
    await expect(skipBtn.first()).toBeVisible({ timeout: 5000 })

    // Assert: no 500 errors
    expect(page.url()).not.toContain('/500')
  })

  test('4. Resume upload — PDF', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    // Create minimal test PDF
    const minimalPdf = Buffer.from(
      'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjIxOQolJUVPRgo=',
      'base64'
    )
    const fs = await import('fs')
    fs.writeFileSync('/tmp/test-resume.pdf', minimalPdf)

    await page.goto('/profile/build?step=0')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Find file input and upload
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles('/tmp/test-resume.pdf')

    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: 60000 })

    // Assert: response is NOT 500
    expect(page.url()).not.toContain('/500')

    // Assert: either fields populate OR "enter manually" fallback shows
    const eitherVisible = await Promise.all([
      page.locator('input[name="firstName"], input[name="first_name"]').isVisible().catch(() => false),
      page.locator('text=Enter manually').isVisible().catch(() => false),
      page.locator('text=enter manually').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(eitherVisible).toBe(true)
  })

  test('5. Step navigation works', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/profile/build?step=0')
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Click Skip
    const skipBtn = page.locator('button:has-text("Skip"), a:has-text("Skip")')
    await skipBtn.first().click()

    // Wait for navigation
    await page.waitForURL(/step=1/, { timeout: 10000 })

    // Assert: URL changes to ?step=1
    expect(page.url()).toContain('step=1')

    // Assert: Step 1 form fields visible (first name, last name)
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]')
    await expect(firstNameInput).toBeVisible({ timeout: 5000 })

    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]')
    await expect(lastNameInput).toBeVisible({ timeout: 5000 })

    // Fill minimum required fields
    await firstNameInput.fill('Test')
    await lastNameInput.fill('Caregiver')

    // Click Continue
    const continueBtn = page.locator('button:has-text("Continue"), button[type="submit"]')
    await continueBtn.click()

    // Wait for navigation
    await page.waitForURL(/step=2/, { timeout: 10000 })

    // Assert: URL changes to ?step=2
    expect(page.url()).toContain('step=2')
  })

  test('6. Caregiver navbar renders correctly', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: navbar is present
    const navbar = page.locator('nav, header')
    await expect(navbar.first()).toBeVisible({ timeout: 10000 })

    // Assert: notification bell visible
    const notificationBell = page.locator('button:has(svg), [data-testid="notifications"]')
    await expect(notificationBell.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Fallback: check for bell icon
      return expect(page.locator('[class*="bell"], svg[*|href*="bell"]').first()).toBeVisible({ timeout: 5000 })
    })

    // Assert: user menu accessible
    const userMenu = page.locator('[data-testid="user-menu"], [class*="user"], button:has-text("Account"), button:has-text("Profile")')
    await expect(userMenu.first()).toBeVisible({ timeout: 5000 })

    // Assert: "Profile" link present in dropdown
    const profileLink = page.locator('a:has-text("Profile"), [href*="profile"]')
    await expect(profileLink.first()).toBeVisible({ timeout: 5000 })
  })

  test('7. Caregiver notifications page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/caregiver/notifications')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads (200, no 500)
    expect(page.url()).not.toContain('/500')

    // Assert: either notifications list OR empty state visible
    const eitherVisible = await Promise.all([
      page.locator('[data-testid="notifications-list"]').isVisible().catch(() => false),
      page.locator('text=No notifications').isVisible().catch(() => false),
      page.locator('text=No new notifications').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(eitherVisible).toBe(true)
  })

  test('8. Opportunities page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/opportunities')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: either listings OR empty state visible
    const eitherVisible = await Promise.all([
      page.locator('[data-testid="opportunities-list"]').isVisible().catch(() => false),
      page.locator('text=No opportunities').isVisible().catch(() => false),
      page.locator('[class*="card"]').first().isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(eitherVisible).toBe(true)
  })

  test('9. Settings communications page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/settings/communications')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: consent toggle controls visible
    const consentToggles = page.locator('input[type="checkbox"], [data-testid*="consent"]')
    await expect(consentToggles.first()).toBeVisible({ timeout: 5000 })
  })

  test('10. Profile strength page loads', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_CAREGIVER_EMAIL
    const password = process.env.PLAYWRIGHT_CAREGIVER_PASSWORD

    test.skip(!email || !password, 'PLAYWRIGHT_CAREGIVER_EMAIL and PLAYWRIGHT_CAREGIVER_PASSWORD must be set in .env.local')

    // Load auth state
    await page.context().storageState({ path: 'tests/e2e/.auth/caregiver.json' })

    await page.goto('/profile/strength')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Assert: page loads
    expect(page.url()).not.toContain('/500')

    // Assert: completion percentage visible
    const percentageVisible = await Promise.all([
      page.locator('text=/\\d+%/').isVisible().catch(() => false),
      page.locator('text=Profile Strength').isVisible().catch(() => false),
      page.locator('text=completion').isVisible().catch(() => false)
    ]).then(results => results.some(r => r))

    expect(percentageVisible).toBe(true)
  })
})