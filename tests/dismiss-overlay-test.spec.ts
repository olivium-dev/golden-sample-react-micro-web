import { test, expect } from '@playwright/test';

test('Dismiss webpack overlay and test menu items', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔧 DISMISSING WEBPACK OVERLAY AND TESTING');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check for webpack overlay
  const overlay = page.locator('#webpack-dev-server-client-overlay');
  const overlayExists = await overlay.count() > 0;
  
  if (overlayExists) {
    console.log('🚨 Webpack dev server overlay detected - attempting to dismiss');
    
    // Try to close the overlay by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Or try clicking outside the overlay
    await page.click('body', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(1000);
    
    // Check if overlay is still there
    const stillThere = await overlay.count() > 0;
    console.log(`   Overlay still present: ${stillThere}`);
  }

  // Now test User Management (which was working)
  console.log('\n🧪 Testing User Management after overlay dismissal...');
  
  try {
    const cardButton = page.locator('[class*="Card"]:has-text("User Management") button').first();
    
    // Force click even if overlay is present
    await cardButton.click({ force: true });
    await page.waitForTimeout(4000);

    const result = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasUndefined: text.includes('undefined'),
        hasUserContent: text.includes('User') && text.length > 800,
        hasTable: document.querySelectorAll('table, [class*="DataGrid"]').length > 0,
        hasButtons: document.querySelectorAll('button').length,
        textLength: text.length,
        preview: text.substring(0, 300).replace(/\s+/g, ' ').trim()
      };
    });

    console.log(`   Content length: ${result.textLength}`);
    console.log(`   Has undefined: ${result.hasUndefined}`);
    console.log(`   Has user content: ${result.hasUserContent}`);
    console.log(`   Has table: ${result.hasTable}`);
    console.log(`   Buttons: ${result.hasButtons}`);
    console.log(`   Preview: "${result.preview.substring(0, 100)}..."`);

    if (result.hasUserContent && !result.hasUndefined) {
      console.log('   ✅ USER MANAGEMENT IS WORKING!');
    } else {
      console.log('   ❌ User Management still has issues');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/after-overlay-dismiss.png', fullPage: true });

  } catch (error: any) {
    console.log(`   💥 Error: ${error.message}`);
  }

  console.log('\n========================================');
  console.log('Test complete - check screenshot for current state');
  console.log('========================================\n');
});
