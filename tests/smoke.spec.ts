import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage renders with sign in and get started links', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Careified/)
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('sign-in page renders with email and password fields', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.locator('input[name="password"]').first()).toBeVisible()
  })

  test('sign-up page renders form fields', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.locator('input[name="password"]').first()).toBeVisible()
  })

  test('agency dashboard redirects to sign-in when logged out', async ({ page }) => {
    await page.goto('/agency/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('profile build redirects to sign-in when logged out', async ({ page }) => {
    await page.goto('/profile/build')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('admin redirects to sign-in when logged out', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/sign-in/)
  })
})