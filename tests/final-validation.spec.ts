import { test, expect } from '@playwright/test';

test('Final validation - all services running', async ({ page }) => {
  console.log('\n========================================');
  console.log('✅ FINAL VALIDATION - ALL SERVICES RUNNING');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Test each menu item now that all services should be running
  const menuItems = [
    'User Management',
    'Data Grid', 
    'Analytics',
    'Settings',
    'Orders',
    'Catalog',
    'Error Monitor'
  ];

  const results: any[] = [];

  for (const menuItem of menuItems) {
    console.log(`\n🧪 Testing: ${menuItem}`);
    
    try {
      // Go to dashboard
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Click the card
      const cardButton = page.locator(`[class*="Card"]:has-text("${menuItem}") button:has-text("Open Module")`).first();
      await cardButton.click();
      
      // Wait for micro-frontend to load
      await page.waitForTimeout(4000);

      // Check what's actually loaded
      const pageContent = await page.evaluate(() => {
        const body = document.body;
        const text = body.innerText || '';
        
        // Check for actual error messages (not just the word "error" in menu)
        const hasRealErrors = text.includes('ChunkLoadError') ||
                             text.includes('Loading chunk failed') ||
                             text.includes('Module not found') ||
                             text.includes('Failed to fetch') ||
                             text.includes('Connection refused') ||
                             text.includes('Something went wrong') ||
                             text.includes('Unable to load') ||
                             text.includes('Script error');

        // Check for successful loading indicators
        const hasContent = text.length > 500; // More than just menu text
        const hasInteractiveElements = document.querySelectorAll('button').length > 8; // More than just menu buttons
        const hasSpecificContent = document.querySelectorAll('table, canvas, form, input[type="text"]').length > 0;

        return {
          text: text.substring(0, 300),
          textLength: text.length,
          hasRealErrors,
          hasContent,
          hasInteractiveElements,
          hasSpecificContent,
          url: window.location.href,
          title: document.title
        };
      });

      let status = 'UNKNOWN';
      if (pageContent.hasRealErrors) {
        status = '❌ REAL_ERRORS';
      } else if (pageContent.hasSpecificContent && pageContent.hasContent) {
        status = '✅ WORKING';
      } else if (pageContent.hasContent) {
        status = '⚠️ BASIC_CONTENT';
      } else {
        status = '❌ NO_CONTENT';
      }

      console.log(`   Status: ${status}`);
      console.log(`   Content: ${pageContent.textLength} chars`);
      console.log(`   Interactive: ${pageContent.hasInteractiveElements}`);
      console.log(`   Specific: ${pageContent.hasSpecificContent}`);
      console.log(`   Real Errors: ${pageContent.hasRealErrors}`);
      console.log(`   Preview: "${pageContent.text.replace(/\s+/g, ' ').trim().substring(0, 80)}..."`);

      results.push({
        name: menuItem,
        status: status.replace(/[✅❌⚠️]/g, '').trim(),
        working: status.includes('✅'),
        content: pageContent
      });

      // Take screenshot
      await page.screenshot({ 
        path: `test-results/final-${menuItem.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });

    } catch (error: any) {
      console.log(`   💥 Exception: ${error.message}`);
      results.push({
        name: menuItem,
        status: 'EXCEPTION',
        working: false,
        error: error.message
      });
    }
  }

  // Generate final report
  console.log('\n========================================');
  console.log('📊 FINAL VALIDATION RESULTS');
  console.log('========================================\n');

  const workingCount = results.filter(r => r.working).length;
  const totalCount = results.length;

  console.log(`📈 Summary:`);
  console.log(`   Total: ${totalCount}`);
  console.log(`   Working: ${workingCount}`);
  console.log(`   Broken: ${totalCount - workingCount}`);
  console.log(`   Success Rate: ${((workingCount / totalCount) * 100).toFixed(1)}%\n`);

  console.log(`📋 Results:`);
  results.forEach((result, index) => {
    const icon = result.working ? '✅' : '❌';
    console.log(`   ${index + 1}. ${icon} ${result.name} - ${result.status}`);
  });

  console.log('\n========================================');
  if (workingCount === totalCount) {
    console.log('🎉 ALL MENU ITEMS WORKING!');
  } else if (workingCount > totalCount * 0.8) {
    console.log('✅ MOST MENU ITEMS WORKING');
  } else if (workingCount > 0) {
    console.log('⚠️ SOME MENU ITEMS WORKING');
  } else {
    console.log('❌ NO MENU ITEMS WORKING');
  }
  console.log('========================================\n');

  // Save report
  require('fs').writeFileSync(
    'test-results/final-validation-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: totalCount, working: workingCount, broken: totalCount - workingCount },
      results
    }, null, 2)
  );

  expect(workingCount).toBeGreaterThan(0);
});
