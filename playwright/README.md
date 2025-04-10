# End-to-End Testing with Playwright

This directory contains end-to-end tests for user authentication (signup and login) using Playwright.

## Structure

- `tests/` - Contains all the test files
  - `auth.spec.ts` - Tests for authentication functionality (signup, login, logout)
  - `user-journey.spec.ts` - End-to-end user journey tests
  - `accessibility.spec.ts` - Accessibility tests
  - `performance.spec.ts` - Performance tests
- `server/` - Contains a simple Express server with authentication functionality
  - `index.js` - Server implementation
  - `public/` - Static HTML files (generated at runtime)
- `screenshots/` - Directory for storing screenshots from visual tests

## Test Coverage

The tests cover the following scenarios:

### Authentication Flow
- Navigation between pages
- Form validation
- User registration
- Login with valid/invalid credentials
- Logout functionality
- Access control for protected routes

### User Journey
- Complete user flow from signup to logout
- Visual regression tests

### Accessibility
- Basic accessibility checks
- Form label associations
- Required attributes

### Performance
- Page load times
- Form submission performance

## Running the Tests

1. Install dependencies:
   ```
   npm install
   ```

2. Install Playwright browsers:
   ```
   npx playwright install
   ```

3. Run the tests:
   ```
   npm run test:e2e
   ```

   Or run specific test files:
   ```
   npx playwright test auth.spec.ts
   ```

4. View the test report:
   ```
   npx playwright show-report
   ```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project. It includes:

- Test directory setup
- Browser configurations (Chromium, Firefox, WebKit)
- Web server configuration (automatically starts the Express server)
- Screenshot and trace settings

## Adding More Tests

To add more tests:

1. Create a new test file in the `tests/` directory
2. Import the Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Write your tests using the Playwright API
4. Run the tests with `npm run test:e2e`
