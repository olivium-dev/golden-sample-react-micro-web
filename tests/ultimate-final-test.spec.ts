import { test, expect } from '@playwright/test';

test('Ultimate final test - click working buttons', async ({ page }) => {
  console.log('\n========================================');
  console.log('🎯 ULTIMATE FINAL TEST - CLICK WORKING BUTTONS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Test each menu by clicking the working buttons
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
    console.log(`\n🧪 FINAL TEST: ${menuItem}`);
    console.log('─'.repeat(50));
    
    try {
      // Go to dashboard
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Find the specific button for this menu item
      const specificButton = page.locator(`[class*="Card"]:has-text("${menuItem}") button:has-text("Open Module")`).first();
      
      const buttonExists = await specificButton.count() > 0;
      if (!buttonExists) {
        console.log(`   ❌ Button not found for ${menuItem}`);
        results.push({ name: menuItem, status: 'BUTTON_NOT_FOUND', working: false });
        continue;
      }

      // Click with multiple strategies
      let clicked = false;
      
      // Strategy 1: Normal click
      try {
        await specificButton.click({ timeout: 5000 });
        clicked = true;
        console.log(`   ✅ Normal click succeeded`);
      } catch (e) {
        console.log(`   ⚠️  Normal click failed, trying force click`);
        
        // Strategy 2: Force click
        try {
          await specificButton.click({ force: true, timeout: 5000 });
          clicked = true;
          console.log(`   ✅ Force click succeeded`);
        } catch (e2) {
          console.log(`   ❌ Both click strategies failed`);
        }
      }

      if (!clicked) {
        results.push({ name: menuItem, status: 'CLICK_FAILED', working: false });
        continue;
      }

      // Wait for navigation/loading
      await page.waitForTimeout(4000);

      // Check final result
      const finalResult = await page.evaluate(() => {
        const text = document.body.innerText || '';
        
        // Check if we navigated away from dashboard
        const onDashboard = text.includes('Dashboard Overview') && 
                           text.includes('Welcome to the Micro-Frontend Platform');
        
        if (onDashboard) {
          return {
            navigated: false,
            status: 'STILL_ON_DASHBOARD',
            content: text.substring(0, 200)
          };
        }

        // We navigated - check what we got
        const hasRealContent = text.length > 600;
        const hasUndefined = text.trim() === 'undefined' || text.includes('undefined');
        const hasError = text.includes('Failed to load') || 
                        text.includes('Error loading') ||
                        text.includes('Something went wrong');
        const hasLoading = text.includes('Loading...') || text.includes('Please wait');

        let status = 'UNKNOWN';
        if (hasUndefined) {
          status = 'SHOWS_UNDEFINED';
        } else if (hasError) {
          status = 'SHOWS_ERROR';
        } else if (hasLoading) {
          status = 'STUCK_LOADING';
        } else if (hasRealContent) {
          status = 'HAS_CONTENT';
        } else {
          status = 'MINIMAL_CONTENT';
        }

        return {
          navigated: true,
          status,
          content: text.substring(0, 300).replace(/\s+/g, ' ').trim(),
          textLength: text.length,
          hasButtons: document.querySelectorAll('button').length,
          hasInteractive: document.querySelectorAll('button, input, select, a').length > 5
        };
      });

      console.log(`   📍 Navigated: ${finalResult.navigated}`);
      console.log(`   📊 Status: ${finalResult.status}`);
      console.log(`   📄 Content: ${finalResult.textLength} chars`);
      console.log(`   🎯 Buttons: ${finalResult.hasButtons}`);
      console.log(`   ⚡ Interactive: ${finalResult.hasInteractive}`);
      console.log(`   📝 Preview: "${finalResult.content.substring(0, 80)}..."`);

      // Determine if this menu item is working
      const isWorking = finalResult.navigated && 
                       finalResult.status === 'HAS_CONTENT' && 
                       !finalResult.content.includes('undefined') &&
                       finalResult.hasInteractive;

      if (isWorking) {
        console.log(`   🎉 ${menuItem} IS WORKING!`);
      } else if (finalResult.navigated && finalResult.textLength > 400) {
        console.log(`   ⚠️  ${menuItem} is partially working`);
      } else {
        console.log(`   ❌ ${menuItem} has issues`);
      }

      results.push({
        name: menuItem,
        status: finalResult.status,
        working: isWorking,
        navigated: finalResult.navigated,
        details: finalResult
      });

      // Take screenshot of result
      await page.screenshot({ 
        path: `test-results/ultimate-${menuItem.toLowerCase().replace(/\s+/g, '-')}.png`,
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

  // Final comprehensive summary
  console.log('\n========================================');
  console.log('🏆 ULTIMATE FINAL RESULTS');
  console.log('========================================\n');

  const fullyWorking = results.filter(r => r.working).length;
  const navigating = results.filter(r => r.navigated).length;
  const hasContent = results.filter(r => r.details?.textLength > 400).length;
  const totalCount = results.length;

  console.log(`📈 Ultimate Summary:`);
  console.log(`   Total Menu Items: ${totalCount}`);
  console.log(`   🎉 Fully Working: ${fullyWorking}`);
  console.log(`   🔄 Can Navigate: ${navigating}`);
  console.log(`   📄 Has Content: ${hasContent}`);
  console.log(`   Success Rate: ${((fullyWorking / totalCount) * 100).toFixed(1)}%`);
  console.log(`   Navigation Rate: ${((navigating / totalCount) * 100).toFixed(1)}%`);
  console.log(`   Content Rate: ${((hasContent / totalCount) * 100).toFixed(1)}%\n`);

  console.log(`🏆 Final Status by Menu Item:`);
  results.forEach((result, index) => {
    const icon = result.working ? '🎉' : (result.navigated ? '⚠️' : '❌');
    console.log(`   ${index + 1}. ${icon} ${result.name} - ${result.status}`);
  });

  // Save ultimate report
  const ultimateReport = {
    timestamp: new Date().toISOString(),
    finalResults: {
      total: totalCount,
      fullyWorking: fullyWorking,
      canNavigate: navigating,
      hasContent: hasContent,
      successRate: ((fullyWorking / totalCount) * 100).toFixed(1) + '%',
      navigationRate: ((navigating / totalCount) * 100).toFixed(1) + '%',
      contentRate: ((hasContent / totalCount) * 100).toFixed(1) + '%'
    },
    menuItems: results
  };

  require('fs').writeFileSync(
    'test-results/ultimate-final-report.json',
    JSON.stringify(ultimateReport, null, 2)
  );

  console.log('\n💾 Ultimate report: test-results/ultimate-final-report.json');
  console.log('📸 Ultimate screenshots: test-results/ultimate-*.png');

  console.log('\n========================================');
  if (fullyWorking === totalCount) {
    console.log('🏆 PERFECT SUCCESS - ALL 7/7 MENU ITEMS WORKING!');
  } else if (fullyWorking >= 5) {
    console.log(`🎉 EXCELLENT - ${fullyWorking}/7 MENU ITEMS WORKING!`);
  } else if (navigating >= 5) {
    console.log(`✅ GOOD - ${navigating}/7 MENU ITEMS NAVIGATING!`);
  } else {
    console.log(`⚠️ NEEDS WORK - Only ${fullyWorking} fully working, ${navigating} navigating`);
  }
  console.log('========================================\n');

  // Expect at least some functionality
  expect(fullyWorking + navigating).toBeGreaterThan(0);
});
