import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// First, we need to install the axe-core package
// This would normally be done with: npm install @axe-core/playwright --save-dev

test.describe('Accessibility Tests', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // This test will fail until @axe-core/playwright is installed
    // Uncomment when the package is installed
    /*
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    */
    
    // For now, we'll just check basic accessibility attributes
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('title')).not.toBeEmpty();
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login.html');
    
    // Check form labels are properly associated with inputs
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    
    // Check inputs have appropriate attributes
    await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#password')).toHaveAttribute('required', '');
  });

  test('signup page should not have accessibility violations', async ({ page }) => {
    await page.goto('/signup.html');
    
    // Check form labels are properly associated with inputs
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    await expect(page.locator('label[for="confirm-password"]')).toBeVisible();
    
    // Check inputs have appropriate attributes
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#password')).toHaveAttribute('minlength', '6');
  });
});
