import { test, expect } from '@playwright/test';

// Test data
const USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  invalidPassword: 'wrongpassword'
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page before each test
    await page.goto('/');
  });

  test('should navigate to signup and login pages from home', async ({ page }) => {
    // Check that we're on the home page
    await expect(page).toHaveTitle('Authentication Demo');
    
    // Check navigation to signup page
    await page.click('text=Sign Up');
    await expect(page).toHaveTitle('Sign Up');
    
    // Check navigation to login page from signup page
    await page.click('text=Login');
    await expect(page).toHaveTitle('Login');
    
    // Check navigation back to home
    await page.click('text=Home');
    await expect(page).toHaveTitle('Authentication Demo');
  });

  test('should show validation errors on signup form', async ({ page }) => {
    // Navigate to signup page
    await page.click('text=Sign Up');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check that browser validation prevents submission (HTML5 validation)
    // This is implicit as the form won't submit with required fields empty
    
    // Fill only name and try to submit
    await page.fill('#name', USER.name);
    await page.click('button[type="submit"]');
    // Form still won't submit due to HTML5 validation
    
    // Fill mismatched passwords and try to submit
    await page.fill('#name', USER.name);
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.fill('#confirm-password', USER.invalidPassword);
    await page.click('button[type="submit"]');
    
    // Check error message for password mismatch
    await expect(page.locator('#error-message')).toHaveText('Passwords do not match');
  });

  test('should successfully register a new user', async ({ page }) => {
    // Navigate to signup page
    await page.click('text=Sign Up');
    
    // Fill out the form with valid data
    await page.fill('#name', USER.name);
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.fill('#confirm-password', USER.password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.locator('#success-message')).toHaveText('User registered successfully');
    
    // Wait for redirect to login page
    await page.waitForURL('**/login.html');
    await expect(page).toHaveTitle('Login');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Try to login with invalid credentials
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.invalidPassword);
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('#error-message')).toHaveText('Invalid email or password');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Login with valid credentials
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard.html');
    
    // Verify user is logged in by checking dashboard content
    await expect(page.locator('h2')).toContainText(`Welcome, ${USER.name}!`);
    await expect(page.locator('#user-info')).toContainText(USER.email);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard.html');
    
    // Click logout button
    await page.click('#logout-btn');
    
    // Verify redirect to home page
    await page.waitForURL('**/');
    await expect(page).toHaveTitle('Authentication Demo');
  });

  test('should not access dashboard when not logged in', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard.html');
    
    // Should be redirected to login page
    await page.waitForURL('**/login.html');
    await expect(page).toHaveTitle('Login');
  });
});

// Test for edge cases and security
test.describe('Authentication Edge Cases', () => {
  test('should prevent duplicate user registration', async ({ page }) => {
    // Go to signup page
    await page.goto('/signup.html');
    
    // Register a user that already exists
    await page.fill('#name', USER.name);
    await page.fill('#email', USER.email);
    await page.fill('#password', USER.password);
    await page.fill('#confirm-password', USER.password);
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('#error-message')).toHaveText('User already exists with this email');
  });

  test('should validate email format', async ({ page }) => {
    // Go to signup page
    await page.goto('/signup.html');
    
    // Try to register with invalid email format
    await page.fill('#name', 'Another User');
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password123');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Form shouldn't submit due to HTML5 validation
    await expect(page).toHaveURL(/signup/);
  });

  test('should require minimum password length', async ({ page }) => {
    // Go to signup page
    await page.goto('/signup.html');
    
    // Try to register with short password
    await page.fill('#name', 'Another User');
    await page.fill('#email', 'another@example.com');
    await page.fill('#password', '12345'); // Less than 6 characters
    await page.fill('#confirm-password', '12345');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Form shouldn't submit due to HTML5 validation
    await expect(page).toHaveURL(/signup/);
  });
});
