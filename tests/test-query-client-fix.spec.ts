import { test, expect } from '@playwright/test';

test('Test QueryClient fix', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING QUERYCLIENT FIX');
  console.log('========================================\n');

  const errors: string[] = [];
  const queryClientErrors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
    if (error.message.includes('QueryClient')) {
      queryClientErrors.push(error.message);
    }
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('QueryClient') || text.includes('No QueryClient set')) {
        queryClientErrors.push(text);
        console.log(`❌ QUERYCLIENT ERROR: ${text}`);
      } else if (!text.includes('Failed to load resource')) {
        console.log(`❌ OTHER ERROR: ${text}`);
      }
    }
  });

  // Navigate to main page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('📊 Initial Status:');
  console.log(`   QueryClient Errors: ${queryClientErrors.length}`);
  console.log(`   Total Errors: ${errors.length}`);

  // Test each menu item
  const menuItems = ['User Management', 'Data Grid', 'Analytics', 'Settings', 'Orders', 'Catalog'];
  
  for (const menuItem of menuItems) {
    console.log(`\n🧪 Testing: ${menuItem}`);
    
    try {
      // Click menu item
      await page.click(`text=${menuItem}`, { timeout: 5000 });
      await page.waitForTimeout(3000);
      
      // Check for QueryClient errors specifically
      const beforeCount = queryClientErrors.length;
      await page.waitForTimeout(2000);
      const afterCount = queryClientErrors.length;
      
      if (afterCount > beforeCount) {
        console.log(`   ❌ NEW QueryClient errors: ${afterCount - beforeCount}`);
      } else {
        console.log(`   ✅ No new QueryClient errors`);
      }
      
      // Check if content loaded
      const content = await page.evaluate(() => document.body.innerText);
      if (content.includes(menuItem) && !content.includes('Dashboard Overview')) {
        console.log(`   ✅ Content loaded successfully`);
      } else {
        console.log(`   ⚠️ Content may not have loaded properly`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Failed to test: ${error.message.split('\n')[0]}`);
    }
  }

  console.log('\n========================================');
  console.log('📊 FINAL RESULTS:');
  console.log(`   QueryClient Errors: ${queryClientErrors.length}`);
  console.log(`   Total Page Errors: ${errors.length}`);
  
  if (queryClientErrors.length > 0) {
    console.log('\n❌ QueryClient Errors Found:');
    queryClientErrors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.substring(0, 100)}...`);
    });
  } else {
    console.log('\n✅ NO QUERYCLIENT ERRORS - FIX SUCCESSFUL!');
  }
  
  console.log('========================================\n');

  // Take screenshot
  await page.screenshot({ path: 'test-results/query-client-test.png', fullPage: false });

  // Assert no QueryClient errors
  expect(queryClientErrors.length).toBe(0);
});
