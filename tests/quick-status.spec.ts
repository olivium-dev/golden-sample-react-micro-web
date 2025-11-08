import { test, expect } from '@playwright/test';

test('Quick status check after fixes', async ({ page }) => {
  console.log('\n========================================');
  console.log('⚡ QUICK STATUS CHECK AFTER FIXES');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Test just a few key menu items quickly
  const testItems = ['User Management', 'Data Grid', 'Analytics'];
  
  for (const item of testItems) {
    console.log(`🧪 Testing: ${item}`);
    
    try {
      // Go to dashboard
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Click the card
      const cardButton = page.locator(`[class*="Card"]:has-text("${item}") button`).first();
      await cardButton.click();
      await page.waitForTimeout(3000);

      // Check result
      const result = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasUndefined = text.includes('undefined');
        const hasError = text.includes('Failed to load') || text.includes('Error');
        const hasContent = text.length > 600;
        
        return {
          text: text.substring(0, 200),
          hasUndefined,
          hasError,
          hasContent,
          length: text.length
        };
      });

      if (result.hasUndefined) {
        console.log(`   ❌ Still shows "undefined"`);
      } else if (result.hasError) {
        console.log(`   ⚠️  Shows error messages`);
      } else if (result.hasContent) {
        console.log(`   ✅ Has content (${result.length} chars)`);
      } else {
        console.log(`   ❌ Minimal content (${result.length} chars)`);
      }

      console.log(`   📝 Preview: "${result.text.replace(/\s+/g, ' ').trim().substring(0, 80)}..."`);

    } catch (error: any) {
      console.log(`   💥 Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('========================================');
  console.log('Status check complete');
  console.log('========================================\n');
});
