import { test, expect } from '@playwright/test';

test('Capture the real Module Federation errors', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 CAPTURING REAL MODULE FEDERATION ERRORS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Test User Management first
  console.log('🧪 Testing User Management...');
  
  const cardButton = page.locator('[class*="Card"]:has-text("User Management") button:has-text("Open Module")').first();
  await cardButton.click();
  await page.waitForTimeout(3000);

  // Look for the actual error message now displayed
  const errorDetails = await page.evaluate(() => {
    const body = document.body;
    const text = body.innerText;
    
    // Find the error section
    const errorStart = text.indexOf('Module Federation Error');
    if (errorStart === -1) return { found: false };
    
    const errorSection = text.substring(errorStart, errorStart + 1000);
    
    return {
      found: true,
      errorText: errorSection,
      fullText: text.substring(0, 2000)
    };
  });

  if (errorDetails.found) {
    console.log('\n🚨 REAL ERROR CAPTURED:');
    console.log('─'.repeat(80));
    console.log(errorDetails.errorText);
    console.log('─'.repeat(80));
  } else {
    console.log('\n📝 Full page text:');
    console.log('─'.repeat(80));
    console.log(errorDetails.fullText);
    console.log('─'.repeat(80));
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/real-error-capture.png', fullPage: true });
  
  console.log('\n📸 Screenshot saved: test-results/real-error-capture.png');
  console.log('This shows the actual error blocking the interface');
});
