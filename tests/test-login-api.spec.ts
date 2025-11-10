import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login API Test', () => {
  test('Test login API call', async ({ page }) => {
    const apiCalls: any[] = [];
    const apiErrors: any[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/users/login')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          body: request.postDataJSON(),
        });
        console.log(`📡 LOGIN REQUEST: ${request.method()} ${request.url()}`);
        console.log(`   Body: ${JSON.stringify(request.postDataJSON())}`);
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('/api/users/login')) {
        console.log(`📥 LOGIN RESPONSE: ${response.status()}`);
        const text = await response.text().catch(() => 'Could not read response');
        console.log(`   Response: ${text.substring(0, 200)}`);
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Fill and submit login form
    await page.locator('input[type="email"]').first().fill('admin@example.com');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();

    // Wait for API call
    await page.waitForTimeout(5000);

    console.log('\n========================================');
    console.log('📊 LOGIN API ANALYSIS');
    console.log('========================================');
    console.log(`API calls made: ${apiCalls.length}`);
    console.log(`API errors: ${apiErrors.length}`);
    console.log('========================================\n');
  });
});

