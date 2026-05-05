import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('navbar displays correctly on homepage', async ({ page }) => {
    await page.goto('/');

    // Check main navbar is visible (use first() for multiple nav elements)
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();

    // Check logo in navbar (via alt text)
    await expect(mainNav.getByAltText('Careified')).toBeVisible();

    // Check navbar has navigation links (verify at least some are present)
    const navLinks = mainNav.locator('a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('navbar displays on agency signup page', async ({ page }) => {
    await page.goto('/agency/signup');

    // Navbar should be visible (use first for main nav)
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();
    await expect(mainNav.getByAltText('Careified')).toBeVisible();
  });

  test('navbar displays on profile build page', async ({ page }) => {
    await page.goto('/profile/build');

    // Navbar should be visible (use first for main nav)
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();
  });

  test('all pages load without crash', async ({ page }) => {
    const pages = [
      '/',
      '/for-agencies',
      '/for-caregivers', 
      '/for-families',
      '/about',
      '/contact',
      '/sign-in',
      '/sign-up',
      '/agency/signup',
      '/profile/build',
    ];
    
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
    }
  });
});
