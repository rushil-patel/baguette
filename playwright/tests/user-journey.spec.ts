import { test, expect } from '@playwright/test';

// Test data - using a unique email for this test to avoid conflicts
const USER = {
  name: 'Journey User',
  email: `journey_${Date.now()}@example.com`,
  password: 'journey123'
};

test.describe('End-to-End User Journey', () => {
  test('complete user journey from signup to logout', async ({ page }) => {
    // Step 1: Visit the home page
    await page.goto('/');
    await expect(page).toHaveTitle('Authentication Demo');
    
    // Step 2: Navigate to signup page
    await page.click('text=Sign Up');
    await expect(page).toHaveTitle('Sign Up');
    
    // Step 3: Fill out and submit the signup form
    await page.fill('#name', USER.name);
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.fill('#confirm-password', USER.password);
    await page.click('button[type="submit"]');
    
    // Step 4: Verify successful registration
    await expect(page.locator('#success-message')).toHaveText('User registered successfully');
    
    // Step 5: Wait for redirect to login page
    await page.waitForURL('**/login.html');
    
    // Step 6: Login with the newly created account
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.click('button[type="submit"]');
    
    // Step 7: Verify successful login and dashboard access
    await page.waitForURL('**/dashboard.html');
    await expect(page.locator('h2')).toContainText(`Welcome, ${USER.name}!`);
    await expect(page.locator('#user-info')).toContainText(USER.email);
    
    // Step 8: Logout
    await page.click('#logout-btn');
    
    // Step 9: Verify redirect to home page after logout
    await page.waitForURL('**/');
    await expect(page).toHaveTitle('Authentication Demo');
    
    // Step 10: Try to access dashboard after logout (should redirect to login)
    await page.goto('/dashboard.html');
    await page.waitForURL('**/login.html');
  });
});

// Visual regression test example
test.describe('Visual Tests', () => {
  test('login page visual appearance', async ({ page }) => {
    // Go to login page
    await page.goto('/login.html');
    
    // Take a screenshot for visual comparison
    // This would typically be compared against a baseline in a CI environment
    await page.screenshot({ path: 'playwright/screenshots/login-page.png' });
  });
  
  test('signup page visual appearance', async ({ page }) => {
    // Go to signup page
    await page.goto('/signup.html');
    
    // Take a screenshot for visual comparison
    await page.screenshot({ path: 'playwright/screenshots/signup-page.png' });
  });
  
  test('dashboard page visual appearance', async ({ page }) => {
    // First login
    await page.goto('/login.html');
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard.html');
    
    // Take a screenshot for visual comparison
    await page.screenshot({ path: 'playwright/screenshots/dashboard-page.png' });
  });
});
