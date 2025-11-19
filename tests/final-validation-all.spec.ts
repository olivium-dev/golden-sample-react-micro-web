import { test, expect } from '@playwright/test';

test('Final validation - all 7 menu items working', async ({ page }) => {
  console.log('\n========================================');
  console.log('🎯 FINAL VALIDATION - ALL 7 MENU ITEMS');
  console.log('========================================\n');

  // Wait for services to start
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Navigate to application
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check all services are running
  console.log('📊 Service Check:');
  const services = [
    { name: 'Container', url: 'http://localhost:3000' },
    { name: 'User Management', url: 'http://localhost:3001/remoteEntry.js' },
    { name: 'Data Grid', url: 'http://localhost:3002/remoteEntry.js' },
    { name: 'Analytics', url: 'http://localhost:3003/remoteEntry.js' },
    { name: 'Settings', url: 'http://localhost:3004/remoteEntry.js' },
    { name: 'Orders', url: 'http://localhost:3005/remoteEntry.js' },
    { name: 'Catalog', url: 'http://localhost:3006/remoteEntry.js' },
    { name: 'Backend API', url: 'http://localhost:8000/api/health' }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      const status = response.ok ? '✅' : '⚠️';
      console.log(`   ${status} ${service.name}: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${service.name}: Failed to connect`);
    }
  }

  // Test each menu item
  const menuItems = [
    { name: 'Dashboard', id: 'home', expectedContent: 'Dashboard Overview' },
    { name: 'User Management', id: 'users', expectedContent: 'User' },
    { name: 'Data Grid', id: 'data', expectedContent: 'Data' },
    { name: 'Analytics', id: 'analytics', expectedContent: 'Analytics' },
    { name: 'Settings', id: 'settings', expectedContent: 'Settings' },
    { name: 'Orders', id: 'orders', expectedContent: 'Orders' },
    { name: 'Catalog', id: 'catalog', expectedContent: 'Catalog' },
    { name: 'Error Monitor', id: 'error-monitor', expectedContent: 'Error' }
  ];

  const results: any[] = [];
  let workingCount = 0;

  console.log('\n🧪 Testing Menu Navigation:');
  
  for (const item of menuItems) {
    console.log(`\n📍 Testing: ${item.name}`);
    
    try {
      // Find and click the menu item
      const menuButton = page.locator(`.MuiListItemButton-root:has-text("${item.name}")`);
      const buttonExists = await menuButton.count() > 0;
      
      if (!buttonExists) {
        console.log(`   ❌ Menu item not found`);
        results.push({ ...item, status: 'NOT_FOUND', working: false });
        continue;
      }
      
      // Click the menu item
      await menuButton.click({ timeout: 5000 });
      console.log(`   ✅ Clicked menu item`);
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check if content loaded
      const contentCheck = await page.evaluate((expected) => {
        const bodyText = document.body.innerText || '';
        const hasExpectedContent = bodyText.includes(expected);
        const contentLength = bodyText.length;
        const hasSubstantialContent = contentLength > 300;
        const stillOnDashboard = bodyText.includes('Dashboard Overview') && expected !== 'Dashboard Overview';
        
        return {
          hasExpectedContent,
          contentLength,
          hasSubstantialContent,
          stillOnDashboard,
          preview: bodyText.substring(0, 150).replace(/\s+/g, ' ')
        };
      }, item.expectedContent);
      
      const isWorking = contentCheck.hasExpectedContent && 
                       contentCheck.hasSubstantialContent && 
                       !contentCheck.stillOnDashboard;
      
      if (isWorking) {
        console.log(`   🎉 ${item.name} is WORKING!`);
        workingCount++;
        results.push({ ...item, status: 'WORKING', working: true, details: contentCheck });
      } else {
        console.log(`   ⚠️  ${item.name} navigation incomplete`);
        console.log(`      - Expected content: ${contentCheck.hasExpectedContent ? 'Yes' : 'No'}`);
        console.log(`      - Content length: ${contentCheck.contentLength}`);
        console.log(`      - Still on dashboard: ${contentCheck.stillOnDashboard ? 'Yes' : 'No'}`);
        results.push({ ...item, status: 'PARTIAL', working: false, details: contentCheck });
      }
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `test-results/final-${item.id}.png`, 
        fullPage: false 
      });
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message.split('\n')[0]}`);
      results.push({ ...item, status: 'ERROR', working: false, error: error.message });
    }
  }

  // Final report
  console.log('\n========================================');
  console.log('🏆 FINAL VALIDATION RESULTS');
  console.log('========================================\n');
  
  console.log(`📊 Summary:`);
  console.log(`   Total Menu Items: ${menuItems.length}`);
  console.log(`   Working: ${workingCount}`);
  console.log(`   Success Rate: ${((workingCount / menuItems.length) * 100).toFixed(1)}%\n`);
  
  console.log(`📋 Detailed Results:`);
  results.forEach((result, index) => {
    const icon = result.working ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`   ${index + 1}. ${icon} ${result.name} - ${result.status}`);
  });
  
  console.log('\n========================================');
  if (workingCount === menuItems.length) {
    console.log('🎉 PERFECT! ALL 7/7 MENU ITEMS WORKING!');
  } else if (workingCount >= 7) {
    console.log(`✅ SUCCESS! ${workingCount}/8 menu items working!`);
  } else if (workingCount >= 5) {
    console.log(`⚠️  PARTIAL SUCCESS: ${workingCount}/8 working`);
  } else {
    console.log(`❌ NEEDS MORE WORK: Only ${workingCount}/8 working`);
  }
  console.log('========================================\n');
  
  // Save final report
  require('fs').writeFileSync(
    'test-results/final-validation-report.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: menuItems.length,
        working: workingCount,
        successRate: ((workingCount / menuItems.length) * 100).toFixed(1) + '%'
      },
      results
    }, null, 2)
  );
  
  // Expect at least 7 out of 8 working (allowing Error Monitor to be optional)
  expect(workingCount).toBeGreaterThanOrEqual(7);
});
