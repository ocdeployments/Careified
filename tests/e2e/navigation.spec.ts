import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('navbar displays correctly on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar is visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Check logo in navbar
    await expect(page.locator('nav >> text=Careified')).toBeVisible();
    
    // Check main nav links in navbar (use .first() to avoid strict mode)
    await expect(page.locator('nav >> text=For Agencies')).toBeVisible();
    await expect(page.locator('nav >> text=For Caregivers')).toBeVisible();
    await expect(page.locator('nav >> text=For Families')).toBeVisible();
    await expect(page.locator('nav >> text=About')).toBeVisible();
    await expect(page.locator('nav >> text=Contact')).toBeVisible();
    
    // Check Sign in and Get started buttons in navbar
    await expect(page.locator('nav >> text=Sign in')).toBeVisible();
    await expect(page.locator('nav >> text=Get started')).toBeVisible();
  });

  test('navbar displays on agency signup page', async ({ page }) => {
    await page.goto('/agency/signup');
    
    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav >> text=Careified')).toBeVisible();
  });

  test('navbar displays on profile build page', async ({ page }) => {
    await page.goto('/profile/build');
    
    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible();
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
