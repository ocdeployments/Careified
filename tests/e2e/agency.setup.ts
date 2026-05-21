import { test as setup } from '@playwright/test'

setup('agency auth', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_AGENCY_EMAIL!
  const password = process.env.PLAYWRIGHT_AGENCY_PASSWORD!

  await page.goto('/sign-in')
  await page.waitForLoadState('networkidle')

  await page.locator('input[name="identifier"]').waitFor({ timeout: 10000 })
  await page.locator('input[name="identifier"]').fill(email)
  await page.locator('button[data-localization-key="formButtonPrimary"]').click()

  await page.locator('input[name="password"]').waitFor({ timeout: 10000 })
  await page.locator('input[name="password"]').fill(password)
  await page.locator('button[data-localization-key="formButtonPrimary"]').click()

  // Wait for full navigation away from sign-in
  await page.waitForURL(/\/(?!sign-in)/, { timeout: 20000 })

  // Wait for all auth callbacks to complete
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await page.waitForTimeout(3000)

  // Navigate to a protected page to trigger role check
  await page.goto('/agency/dashboard')
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await page.waitForTimeout(2000)

  // Save state AFTER all auth flows complete
  await page.context().storageState({
    path: 'tests/e2e/.auth/agency.json'
  })
})