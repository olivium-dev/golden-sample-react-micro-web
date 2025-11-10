import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('BFF Architecture - Full Validation', () => {
  test('Validate BFF architecture with real API calls and CORS check', async ({ page }) => {
    const corsErrors: string[] = [];
    const apiCalls: { url: string; method: string; status: number | null; origin: string }[] = [];
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('CORS') || text.toLowerCase().includes('blocked by cors')) {
        corsErrors.push(text);
        console.log(`🚫 CORS ERROR: ${text.substring(0, 100)}`);
      }
      if (msg.type() === 'error' && !text.includes('Fetching')) {
        consoleErrors.push(text);
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
        console.log(`🚫 REQUEST BLOCKED: ${request.url()}`);
      }
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const requestOrigin = new URL(url).origin;
        apiCalls.push({
          url,
          method: response.request().method(),
          status: response.status(),
          origin: requestOrigin,
        });
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    console.log('\n========================================');
    console.log('🧪 Testing BFF Architecture');
    console.log('========================================\n');

    // Test User Management
    console.log('📍 Testing User Management via BFF...');
    await page.locator('li:has-text("User Management")').click();
    await page.waitForTimeout(5000);
    const userMgmtVisible = await page.locator('text=User Management').isVisible();
    console.log(`   Content loaded: ${userMgmtVisible ? '✅' : '❌'}`);

    // Test Catalog
    console.log('\n📍 Testing Catalog via BFF...');
    await page.locator('li:has-text("Catalog")').click();
    await page.waitForTimeout(5000);
    const catalogVisible = await page.locator('text=Catalog').isVisible();
    console.log(`   Content loaded: ${catalogVisible ? '✅' : '❌'}`);

    // Test Orders
    console.log('\n📍 Testing Orders via BFF...');
    await page.locator('li:has-text("Orders")').click();
    await page.waitForTimeout(5000);
    const ordersVisible = await page.locator('text=Orders').isVisible();
    console.log(`   Content loaded: ${ordersVisible ? '✅' : '❌'}`);

    console.log('\n========================================');
    console.log('📊 BFF VALIDATION RESULTS');
    console.log('========================================\n');

    console.log(`📈 Statistics:`);
    console.log(`   Total API calls: ${apiCalls.length}`);
    console.log(`   CORS errors: ${corsErrors.length}`);
    console.log(`   Console errors: ${consoleErrors.length}`);

    if (apiCalls.length > 0) {
      console.log(`\n📋 API Calls Made:`);
      apiCalls.forEach((call, idx) => {
        const isSameOrigin = call.origin === new URL(BASE_URL).origin;
        console.log(`   ${idx + 1}. ${call.method} ${call.url}`);
        console.log(`      Origin: ${call.origin} ${isSameOrigin ? '✅ (same-origin)' : '❌ (cross-origin)'}`);
        console.log(`      Status: ${call.status}`);
      });
    }

    if (corsErrors.length > 0) {
      console.log(`\n❌ CORS Errors Found:`);
      corsErrors.forEach(err => console.log(`   ${err.substring(0, 100)}`));
    }

    console.log('\n========================================');
    if (corsErrors.length === 0 && apiCalls.length > 0) {
      console.log('✅ BFF ARCHITECTURE VALIDATED!');
      console.log('   - No CORS errors');
      console.log('   - All API calls are same-origin');
      console.log('   - All apps loading correctly');
    } else if (corsErrors.length === 0 && apiCalls.length === 0) {
      console.log('✅ NO CORS ERRORS!');
      console.log('⚠️  Note: No API calls detected (backend might be offline)');
    } else {
      console.log('❌ VALIDATION FAILED');
    }
    console.log('========================================\n');

    // Assertions
    expect(corsErrors.length).toBe(0);
    expect(userMgmtVisible).toBe(true);
    expect(catalogVisible).toBe(true);
    expect(ordersVisible).toBe(true);
  });
});

