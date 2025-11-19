import { test, expect } from '@playwright/test';

test('Capture runtime errors', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 CAPTURING RUNTIME ERRORS');
  console.log('========================================\n');

  const errors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
    }
  });

  // Navigate and wait
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Check for error overlays
  const errorOverlays = await page.locator('[data-testid="error-overlay"], .error-overlay, [class*="error"], [class*="Error"]').count();
  console.log(`🚨 Error overlays found: ${errorOverlays}`);

  // Try to click a menu item to trigger micro-frontend loading
  try {
    await page.click('text=User Management', { timeout: 5000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log(`⚠️ Could not click User Management: ${(e as Error).message}`);
  }

  console.log('\n📊 Error Summary:');
  console.log(`   Page Errors: ${errors.length}`);
  console.log(`   Console Errors: ${consoleErrors.length}`);
  console.log(`   Error Overlays: ${errorOverlays}`);

  if (errors.length > 0) {
    console.log('\n💥 Page Errors:');
    errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }

  if (consoleErrors.length > 0) {
    console.log('\n❌ Console Errors:');
    consoleErrors.slice(0, 10).forEach((err, i) => console.log(`   ${i + 1}. ${err.substring(0, 100)}...`));
  }

  // Take screenshot of errors
  await page.screenshot({ path: 'test-results/runtime-errors.png', fullPage: true });

  console.log('\n========================================\n');
});
