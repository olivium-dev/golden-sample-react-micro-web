import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('BFF CORS Validation', () => {
  test('Validate no CORS errors with BFF architecture', async ({ page }) => {
    const corsErrors: string[] = [];
    const networkErrors: string[] = [];
    const apiRequests: { url: string; method: string; origin: string }[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('CORS') || text.includes('blocked by CORS policy')) {
        corsErrors.push(text);
        console.log(`🚫 CORS ERROR: ${text}`);
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
        console.log(`🚫 CORS BLOCKED: ${request.url()}`);
      }
    });

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        const requestOrigin = new URL(url).origin;
        apiRequests.push({
          url,
          method: request.method(),
          origin: requestOrigin,
        });
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('\n========================================');
    console.log('🧪 BFF CORS VALIDATION RESULTS');
    console.log('========================================\n');

    console.log(`📊 Total API requests: ${apiRequests.length}`);
    console.log(`🚫 CORS errors: ${corsErrors.length}`);

    // Check if any API requests were cross-origin
    const crossOriginRequests = apiRequests.filter(req => {
      const pageOrigin = new URL(BASE_URL).origin;
      return req.origin !== pageOrigin;
    });

    console.log(`\n🌐 Cross-origin API requests: ${crossOriginRequests.length}`);
    
    if (crossOriginRequests.length > 0) {
      console.log('\n❌ Cross-origin requests found:');
      crossOriginRequests.forEach(req => {
        console.log(`   ${req.method} ${req.url}`);
      });
    } else {
      console.log('\n✅ All API requests are same-origin (using BFF)');
    }

    if (apiRequests.length > 0) {
      console.log('\n📋 Sample API requests:');
      apiRequests.slice(0, 5).forEach(req => {
        console.log(`   ${req.method} ${req.url}`);
      });
    }

    console.log('\n========================================');
    console.log('FINAL RESULT:');
    console.log('========================================');

    if (corsErrors.length === 0) {
      console.log('✅ NO CORS ERRORS - BFF ARCHITECTURE WORKING!');
    } else {
      console.log('❌ CORS ERRORS DETECTED:');
      corsErrors.forEach(err => console.log(`   ${err}`));
    }

    console.log('========================================\n');

    // Assertions
    expect(corsErrors.length).toBe(0);
  });
});

