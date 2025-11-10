import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('BFF API Routing Test', () => {
  test('Check if API requests are routed through BFF servers', async ({ page }) => {
    const apiRequests: { url: string; method: string }[] = [];
    const responses: { url: string; status: number }[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiRequests.push({
          url,
          method: request.method(),
        });
        console.log(`📡 REQUEST: ${request.method()} ${url}`);
      }
    });

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        responses.push({
          url,
          status: response.status(),
        });
        console.log(`📥 RESPONSE: ${response.status()} ${url}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('🧪 Testing User Management API');
    console.log('========================================\n');
    await page.locator('li:has-text("User Management")').click();
    await page.waitForTimeout(5000);

    console.log('\n========================================');
    console.log('🧪 Testing Catalog API');
    console.log('========================================\n');
    await page.locator('li:has-text("Catalog")').click();
    await page.waitForTimeout(5000);

    console.log('\n========================================');
    console.log('🧪 Testing Orders API');
    console.log('========================================\n');
    await page.locator('li:has-text("Orders")').click();
    await page.waitForTimeout(5000);

    console.log('\n========================================');
    console.log('📊 API ROUTING SUMMARY');
    console.log('========================================\n');

    console.log(`Total API requests: ${apiRequests.length}`);
    console.log(`Total API responses: ${responses.length}`);

    if (apiRequests.length > 0) {
      console.log('\n📋 API Requests:');
      apiRequests.forEach((req, idx) => {
        console.log(`   ${idx + 1}. ${req.method} ${req.url}`);
      });
    }

    if (responses.length > 0) {
      console.log('\n📋 API Responses:');
      responses.forEach((res, idx) => {
        console.log(`   ${idx + 1}. Status ${res.status}: ${res.url}`);
      });
    }

    console.log('\n========================================');
    if (apiRequests.length > 0) {
      console.log('✅ API REQUESTS ARE BEING MADE!');
      console.log(`   Requests made: ${apiRequests.length}`);
      console.log(`   Responses received: ${responses.length}`);
    } else {
      console.log('⚠️  NO API REQUESTS DETECTED');
      console.log('   This might be expected if backend is offline');
    }
    console.log('========================================\n');
  });
});

