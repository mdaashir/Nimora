import { test, expect } from '@playwright/test';

test.describe('Dashboard Pages Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests would need authentication
    // For now, we'll just check if pages exist
    await page.goto('/');
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');

    // Check basic accessibility requirements
    await expect(page).toHaveTitle(/Nimora/i);

    // Check for heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/login');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('form')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('login page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - startTime;

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
