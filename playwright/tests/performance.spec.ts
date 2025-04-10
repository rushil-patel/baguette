import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Enable performance metrics collection
    await page.goto('about:blank');
    await page.evaluate(() => {
      window.performanceEntries = [];
      const observer = new PerformanceObserver((list) => {
        window.performanceEntries.push(...list.getEntries());
      });
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    });
    
    // Navigate to the page and collect metrics
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return {
        performanceEntries: window.performanceEntries,
        timing: performance.timing,
        memory: performance.memory
      };
    });
    
    // Basic assertions on load time
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Page should load in less than 5 seconds
    
    // Check login page load time
    const loginStartTime = Date.now();
    await page.goto('/login.html');
    const loginLoadTime = Date.now() - loginStartTime;
    console.log(`Login page load time: ${loginLoadTime}ms`);
    expect(loginLoadTime).toBeLessThan(5000);
    
    // Check signup page load time
    const signupStartTime = Date.now();
    await page.goto('/signup.html');
    const signupLoadTime = Date.now() - signupStartTime;
    console.log(`Signup page load time: ${signupLoadTime}ms`);
    expect(signupLoadTime).toBeLessThan(5000);
  });
  
  test('login form submission performance', async ({ page }) => {
    // Create a test user first
    await page.goto('/signup.html');
    const testEmail = `perf_${Date.now()}@example.com`;
    await page.fill('#name', 'Performance User');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'performance123');
    await page.fill('#confirm-password', 'performance123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/login.html');
    
    // Measure login performance
    await page.goto('/login.html');
    const startTime = Date.now();
    
    await page.fill('#email', testEmail);
    await page.fill('#password', 'performance123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard.html');
    const loginTime = Date.now() - startTime;
    
    console.log(`Login submission and processing time: ${loginTime}ms`);
    expect(loginTime).toBeLessThan(3000); // Login should complete in less than 3 seconds
  });
});
