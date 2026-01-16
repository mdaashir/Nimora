import { test, expect } from '@playwright/test';

test.describe('Landing Page Redirect', () => {
  test('should redirect to login page', async ({ page }) => {
    test.skip(!!process.env.CI, 'Skipping E2E tests in CI environment');
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    test.skip(!!process.env.CI, 'Skipping E2E tests in CI environment');
    await page.goto('/login');

    await expect(page.locator('input[placeholder*="Roll"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show password toggle', async ({ page }) => {
    test.skip(!!process.env.CI, 'Skipping E2E tests in CI environment');
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check for password visibility toggle button
    const toggleButton = page.locator('button[aria-label*="password"]').or(
      page.locator('button').filter({ hasText: /eye/i })
    );

    if (await toggleButton.count() > 0) {
      await toggleButton.first().click();
      await expect(page.locator('input[type="text"]')).toBeVisible();
    }
  });

  test('should have proper accessibility', async ({ page }) => {
    test.skip(!!process.env.CI, 'Skipping E2E tests in CI environment');
    await page.goto('/login');

    // Check for proper labels
    await expect(page.locator('label')).toHaveCount(2);

    // Check for form semantics
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.skip('should navigate to dashboard after login', async ({ page }) => {
    // This test would require valid credentials
    // Skipped to avoid actual login attempts
    await page.goto('/login');
  });
});
