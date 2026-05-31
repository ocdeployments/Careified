import { test, expect } from '@playwright/test'

test.describe('Caregiver Profile Interactions', () => {
  test('shortlist button toggles correctly', async ({ page }) => {
    // Navigate to a caregiver profile
    await page.goto('/profile/test-caregiver-id')

    // Find the shortlist button
    const shortlistButton = page.getByRole('button', { name: /add to shortlist|✓ shortlisted|saving/i })

    // Should be visible
    await expect(shortlistButton).toBeVisible()

    // Click to shortlist
    await shortlistButton.click()

    // Should show "Shortlisted" state after API call
    await expect(page.getByRole('button', { name: '✓ Shortlisted' })).toBeVisible({ timeout: 5000 })
  })

  test('contact request button sends request', async ({ page }) => {
    // Navigate to a caregiver profile
    await page.goto('/profile/test-caregiver-id')

    // Find the contact request button
    const contactButton = page.getByRole('button', { name: /request contact|sending|✓ request sent/i })

    // Should be visible
    await expect(contactButton).toBeVisible()

    // Click to send contact request
    await contactButton.click()

    // Should show "Request sent" state after API call
    await expect(page.getByRole('button', { name: '✓ Request sent' })).toBeVisible({ timeout: 5000 })
  })

  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    // Clear auth state by going to a fresh context
    await page.context().clearCookies()

    // Navigate to a caregiver profile
    await page.goto('/profile/test-caregiver-id')

    // Try clicking shortlist button
    const shortlistButton = page.getByRole('button', { name: /add to shortlist/i })

    if (await shortlistButton.isVisible()) {
      await shortlistButton.click()

      // Should redirect to sign-in
      await expect(page).toHaveURL(/sign-in/, { timeout: 5000 })
    }
  })
})