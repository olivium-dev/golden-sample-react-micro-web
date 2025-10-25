import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Micro-Frontend Golden Sample
 * 
 * Projects:
 * - standalone-real: Test individual micro-webs against real backend
 * - standalone-mock: Test individual micro-webs with MSW mocks
 * - e2e-real: Test full Module Federation setup with container
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global timeout for each test
  timeout: 60 * 1000, // 60 seconds
  
  // Expect timeout for assertions
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  
  // Run tests in files in parallel
  fullyParallel: false, // Sequential for stability with service startup
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 1,
  
  // Opt out of parallel tests on CI
  workers: 1, // Single worker for service management
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    // Will be overridden per project
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 seconds
    
    // Action timeout
    actionTimeout: 10 * 1000, // 10 seconds
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'standalone-real',
      testDir: './tests/standalone',
      use: {
        ...devices['Desktop Chrome'],
        // Tests will set their own baseURL per micro-web
      },
      // Run setup to start backend
      dependencies: [],
    },
    
    {
      name: 'standalone-mock',
      testDir: './tests/standalone',
      use: {
        ...devices['Desktop Chrome'],
        // Tests will set their own baseURL per micro-web
      },
      // Use different test files or environment variable to enable mocks
    },
    
    {
      name: 'e2e-real',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000', // Container app
      },
      // Run setup to start all services
      dependencies: [],
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/utils/global-setup.ts'),
  globalTeardown: require.resolve('./tests/utils/global-teardown.ts'),

  // Output directory for test artifacts
  outputDir: 'test-results/artifacts',
  
  // Directory for test reports
  // reportSlowTests: { max: 5, threshold: 30000 }, // Report tests slower than 30s
});
