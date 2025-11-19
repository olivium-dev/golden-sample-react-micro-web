import { test, expect } from '@playwright/test';

test('Click each menu item and capture what actually happens', async ({ page }) => {
  console.log('\n========================================');
  console.log('🖱️  CLICKING EACH MENU ITEM');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/before-clicking.png', fullPage: true });

  // Test each card button from the dashboard
  const menuCards = [
    'User Management',
    'Data Grid', 
    'Analytics',
    'Settings',
    'Orders',
    'Catalog',
    'Error Monitor'
  ];

  const results: any[] = [];

  for (const cardName of menuCards) {
    console.log(`\n🔍 TESTING: ${cardName}`);
    console.log('─'.repeat(50));
    
    try {
      // Go back to dashboard
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Find the card and click it
      const cardButton = page.locator(`[class*="Card"]:has-text("${cardName}") button:has-text("Open Module")`).first();
      
      const cardExists = await cardButton.count() > 0;
      if (!cardExists) {
        console.log(`   ❌ Card not found for ${cardName}`);
        results.push({
          name: cardName,
          status: 'CARD_NOT_FOUND',
          error: 'Card not found on dashboard'
        });
        continue;
      }

      console.log(`   🎯 Found card, clicking...`);
      await cardButton.click();
      
      // Wait for navigation/loading
      await page.waitForTimeout(5000);

      // Capture what's actually on screen after clicking
      const screenContent = await page.evaluate(() => {
        const body = document.body;
        const root = document.getElementById('root');
        
        // Get all visible text on screen
        const allText = body.innerText || '';
        
        // Look for error messages in the visible text
        const errorKeywords = [
          'error', 'Error', 'ERROR',
          'failed', 'Failed', 'FAILED', 
          'not found', 'Not Found', 'NOT FOUND',
          'something went wrong', 'Something went wrong',
          'unable to load', 'Unable to load',
          'connection refused', 'Connection refused',
          'chunk load error', 'ChunkLoadError',
          'module federation', 'Module Federation',
          'loading chunk failed', 'Loading chunk failed',
          'script error', 'Script error',
          'network error', 'Network error',
          '404', '500', '503',
          'timeout', 'Timeout'
        ];

        const foundErrors = errorKeywords.filter(keyword => 
          allText.toLowerCase().includes(keyword.toLowerCase())
        );

        // Check for loading states
        const loadingKeywords = ['loading', 'Loading', 'Please wait', 'Fetching'];
        const foundLoading = loadingKeywords.filter(keyword => 
          allText.toLowerCase().includes(keyword.toLowerCase())
        );

        // Check for empty/blank states
        const isEmpty = !root || root.children.length === 0 || allText.trim().length < 50;

        // Get current URL
        const currentUrl = window.location.href;

        return {
          url: currentUrl,
          textLength: allText.length,
          textPreview: allText.substring(0, 400).replace(/\s+/g, ' ').trim(),
          foundErrors,
          foundLoading,
          isEmpty,
          hasButtons: document.querySelectorAll('button').length,
          hasInputs: document.querySelectorAll('input').length,
          hasTables: document.querySelectorAll('table').length,
          hasCharts: document.querySelectorAll('canvas, svg').length,
          title: document.title
        };
      });

      // Take screenshot of what's actually showing
      await page.screenshot({ 
        path: `test-results/clicked-${cardName.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });

      // Analyze the result
      let status = 'UNKNOWN';
      let details = '';

      if (screenContent.isEmpty) {
        status = 'EMPTY_PAGE';
        details = 'Page is empty or has no content';
      } else if (screenContent.foundErrors.length > 0) {
        status = 'ERROR_DISPLAYED';
        details = `Error messages visible: ${screenContent.foundErrors.join(', ')}`;
      } else if (screenContent.foundLoading.length > 0) {
        status = 'STUCK_LOADING';
        details = `Loading states: ${screenContent.foundLoading.join(', ')}`;
      } else if (screenContent.textLength > 100) {
        status = 'LOADED_SUCCESSFULLY';
        details = `Content loaded (${screenContent.textLength} chars)`;
      } else {
        status = 'MINIMAL_CONTENT';
        details = `Very little content (${screenContent.textLength} chars)`;
      }

      console.log(`   📍 URL: ${screenContent.url}`);
      console.log(`   📄 Title: ${screenContent.title}`);
      console.log(`   📊 Status: ${status}`);
      console.log(`   📝 Content: ${screenContent.textLength} chars`);
      console.log(`   🎯 Buttons: ${screenContent.hasButtons}, Inputs: ${screenContent.hasInputs}`);
      console.log(`   📋 Tables: ${screenContent.hasTables}, Charts: ${screenContent.hasCharts}`);
      
      if (screenContent.foundErrors.length > 0) {
        console.log(`   🚨 ERRORS: ${screenContent.foundErrors.join(', ')}`);
      }
      
      if (screenContent.foundLoading.length > 0) {
        console.log(`   ⏳ LOADING: ${screenContent.foundLoading.join(', ')}`);
      }

      console.log(`   📖 Preview: "${screenContent.textPreview.substring(0, 100)}..."`);

      results.push({
        name: cardName,
        status,
        details,
        url: screenContent.url,
        content: screenContent,
        screenshot: `clicked-${cardName.toLowerCase().replace(/\s+/g, '-')}.png`
      });

    } catch (error: any) {
      console.log(`   💥 EXCEPTION: ${error.message}`);
      results.push({
        name: cardName,
        status: 'EXCEPTION',
        error: error.message
      });
    }
  }

  // Generate comprehensive report
  console.log('\n========================================');
  console.log('📊 MENU CLICK TEST RESULTS');
  console.log('========================================\n');

  const statusCounts = {
    LOADED_SUCCESSFULLY: 0,
    ERROR_DISPLAYED: 0,
    STUCK_LOADING: 0,
    EMPTY_PAGE: 0,
    MINIMAL_CONTENT: 0,
    CARD_NOT_FOUND: 0,
    EXCEPTION: 0
  };

  results.forEach(result => {
    if (statusCounts.hasOwnProperty(result.status)) {
      statusCounts[result.status as keyof typeof statusCounts]++;
    }
  });

  console.log('📈 Status Summary:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > 0) {
      const icon = status === 'LOADED_SUCCESSFULLY' ? '✅' : '❌';
      console.log(`   ${icon} ${status}: ${count}`);
    }
  });

  console.log('\n📋 Individual Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'LOADED_SUCCESSFULLY' ? '✅' : '❌';
    console.log(`\n   ${index + 1}. ${icon} ${result.name}`);
    console.log(`      Status: ${result.status}`);
    console.log(`      Details: ${result.details || result.error || 'No details'}`);
    
    if (result.url) {
      console.log(`      URL: ${result.url}`);
    }
    
    if (result.content) {
      console.log(`      Content: "${result.content.textPreview.substring(0, 80)}..."`);
    }
  });

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: statusCounts,
    totalTested: results.length,
    results: results
  };

  require('fs').writeFileSync(
    'test-results/menu-click-results.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n💾 Report saved: test-results/menu-click-results.json');
  console.log('📸 Screenshots saved for each menu click');

  console.log('\n========================================');
  const workingCount = statusCounts.LOADED_SUCCESSFULLY;
  const totalCount = results.length;
  
  if (workingCount === totalCount) {
    console.log('🎉 ALL MENU ITEMS WORKING PERFECTLY!');
  } else if (workingCount > 0) {
    console.log(`⚠️  ${workingCount}/${totalCount} MENU ITEMS WORKING`);
    console.log('   Some items have issues that need attention');
  } else {
    console.log('❌ NO MENU ITEMS WORKING PROPERLY');
    console.log('   All items have blocking issues');
  }
  console.log('========================================\n');

  // Don't fail the test, just report what we found
  expect(results.length).toBeGreaterThan(0);
});
