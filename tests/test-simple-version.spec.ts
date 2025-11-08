import { test, expect } from '@playwright/test';

test('Test simple version - all 7 menu items', async ({ page }) => {
  console.log('\n========================================');
  console.log('🎯 TESTING SIMPLE VERSION - ALL 7 MENU ITEMS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check initial state
  const initialState = await page.evaluate(() => {
    return {
      title: document.title,
      content: document.body.innerText.substring(0, 300),
      hasReact: !!(window as any).React,
      buttons: document.querySelectorAll('button').length,
      activeTabDisplay: document.body.innerText.includes('Active:') ? 
        document.body.innerText.match(/Active: (\w+)/)?.[1] : 'not found'
    };
  });

  console.log('📊 Initial State:');
  console.log(`   Title: ${initialState.title}`);
  console.log(`   Buttons: ${initialState.buttons}`);
  console.log(`   Active Tab: ${initialState.activeTabDisplay}`);
  console.log(`   Has React: ${initialState.hasReact}`);
  console.log(`   Content: "${initialState.content.replace(/\s+/g, ' ').trim().substring(0, 100)}..."`);

  // Test each menu item
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
    console.log('─'.repeat(50));
    
    try {
      // Try sidebar click first
      const sidebarItem = page.locator(`[role="button"]:has-text("${menuItem}")`).first();
      const sidebarExists = await sidebarItem.count() > 0;
      
      let clicked = false;
      let method = '';
      
      if (sidebarExists) {
        await sidebarItem.click();
        clicked = true;
        method = 'sidebar';
        console.log(`   ✅ Clicked sidebar item`);
      } else {
        // Try card button
        const cardButton = page.locator(`button:has-text("Open ${menuItem}")`).first();
        const cardExists = await cardButton.count() > 0;
        
        if (cardExists) {
          await cardButton.click();
          clicked = true;
          method = 'card';
          console.log(`   ✅ Clicked card button`);
        } else {
          console.log(`   ❌ No clickable element found`);
        }
      }

      if (!clicked) {
        results.push({
          name: menuItem,
          status: 'NOT_CLICKABLE',
          working: false
        });
        continue;
      }

      // Wait for navigation
      await page.waitForTimeout(2000);

      // Check result
      const result = await page.evaluate(() => {
        const content = document.body.innerText;
        const activeTab = content.includes('Active:') ? 
          content.match(/Active: (\w+)/)?.[1] : 'unknown';
        
        return {
          activeTab,
          content: content.substring(0, 400),
          textLength: content.length,
          hasSpecificContent: content.includes('micro-frontend') || 
                             content.includes('This is the'),
          buttons: document.querySelectorAll('button').length,
          stillOnDashboard: content.includes('Dashboard Overview')
        };
      });

      console.log(`   📍 Active Tab: ${result.activeTab}`);
      console.log(`   📊 Content: ${result.textLength} chars`);
      console.log(`   🎯 Buttons: ${result.buttons}`);
      console.log(`   📄 Has Specific Content: ${result.hasSpecificContent}`);
      console.log(`   🏠 Still on Dashboard: ${result.stillOnDashboard}`);

      const isWorking = !result.stillOnDashboard && 
                       result.hasSpecificContent && 
                       result.activeTab !== 'home' &&
                       result.textLength > 200;

      if (isWorking) {
        console.log(`   🎉 ${menuItem} IS WORKING!`);
      } else if (!result.stillOnDashboard) {
        console.log(`   ⚠️  ${menuItem} navigated but has issues`);
      } else {
        console.log(`   ❌ ${menuItem} navigation failed`);
      }

      results.push({
        name: menuItem,
        status: isWorking ? 'WORKING' : (result.stillOnDashboard ? 'NO_NAVIGATION' : 'PARTIAL'),
        working: isWorking,
        method,
        details: result
      });

      // Take screenshot
      await page.screenshot({ 
        path: `test-results/simple-${menuItem.toLowerCase().replace(/\s+/g, '-')}.png`,
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

  // Final results
  console.log('\n========================================');
  console.log('🏆 SIMPLE VERSION TEST RESULTS');
  console.log('========================================\n');

  const workingCount = results.filter(r => r.working).length;
  const totalCount = results.length;

  console.log(`📈 Summary:`);
  console.log(`   Total: ${totalCount}`);
  console.log(`   Working: ${workingCount}`);
  console.log(`   Success Rate: ${((workingCount / totalCount) * 100).toFixed(1)}%\n`);

  console.log(`📋 Results:`);
  results.forEach((result, index) => {
    const icon = result.working ? '✅' : '❌';
    console.log(`   ${index + 1}. ${icon} ${result.name} - ${result.status} (${result.method || 'none'})`);
  });

  // Save report
  require('fs').writeFileSync(
    'test-results/simple-version-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: totalCount, working: workingCount },
      results
    }, null, 2)
  );

  console.log('\n========================================');
  if (workingCount === totalCount) {
    console.log('🎉 ALL 7/7 MENU ITEMS WORKING IN SIMPLE VERSION!');
  } else if (workingCount >= 5) {
    console.log(`✅ ${workingCount}/7 MENU ITEMS WORKING!`);
  } else {
    console.log(`⚠️ Only ${workingCount}/7 working - needs more fixes`);
  }
  console.log('========================================\n');

  // Expect significant improvement
  expect(workingCount).toBeGreaterThan(totalCount * 0.7); // 70% working
});
