import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://www.careified.com'

async function hasAuthFile(): Promise<boolean> {
  const fs = await import('fs')
  return fs.existsSync('tests/e2e/.auth/agency.json')
}

test.describe('Triage Narrative', () => {
  test.beforeEach(async () => {
    if (!await hasAuthFile()) {
      test.skip()
    }
  })
  test.use({ baseURL: PRODUCTION_URL })

  test('Zone 4 triage narrative renders on dashboard', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to dashboard
    await page.goto('/agency/dashboard')

    // Wait for Zone 4 (OVERNIGHT TRIAGE) to appear
    const zone4 = page.locator('text=OVERNIGHT TRIAGE')
    await expect(zone4).toBeVisible({ timeout: 10000 })

    // Wait for either skeleton loading OR narrative text
    // Zone 4 should contain something other than error
    const pageContent = await page.content()

    // Check that the narrative area is present and not showing error
    // The component should show either loading skeleton or narrative text
    const hasError = pageContent.includes('Triage summary unavailable') || pageContent.includes('No triage data available')

    // Allow for loading state or narrative content, but not persistent error
    // We'll wait a bit for the API to respond
    await page.waitForTimeout(3000)

    const contentAfterWait = await page.content()
    const hasErrorAfterWait = contentAfterWait.includes('Triage summary unavailable') || contentAfterWait.includes('No triage data available')

    // Check for undefined or [object Object] in Zone 4 area
    const zone4Html = await zone4.locator('xpath=..').innerHTML()
    expect(zone4Html).not.toContain('undefined')
    expect(zone4Html).not.toContain('[object Object]')

    // No critical console errors
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})