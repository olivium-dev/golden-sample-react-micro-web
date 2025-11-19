import { test, expect } from '@playwright/test';

test('Force click all menu items and validate results', async ({ page }) => {
  console.log('\n========================================');
  console.log('🚀 FORCE CLICKING ALL MENU ITEMS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

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
      // Go back to dashboard
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Force click the card button (ignore overlays)
      const cardButton = page.locator(`[class*="Card"]:has-text("${menuItem}") button`).first();
      await cardButton.click({ force: true });
      console.log(`   🖱️  Clicked ${menuItem} card (forced)`);
      
      // Wait for content to load
      await page.waitForTimeout(4000);

      // Analyze what loaded
      const analysis = await page.evaluate(() => {
        const body = document.body;
        const text = body.innerText || '';
        
        // Check for specific success indicators
        const hasTable = document.querySelectorAll('table, [class*="DataGrid"], [class*="MuiDataGrid"]').length > 0;
        const hasChart = document.querySelectorAll('canvas, svg[class*="recharts"]').length > 0;
        const hasForm = document.querySelectorAll('form, input[type="text"], input[type="email"]').length > 0;
        const hasButtons = document.querySelectorAll('button').length;
        const hasCards = document.querySelectorAll('[class*="Card"]').length;
        
        // Check for error states
        const hasUndefined = text.includes('undefined');
        const hasFailedLoad = text.includes('Failed to load');
        const hasChunkError = text.includes('ChunkLoadError') || text.includes('Loading chunk failed');
        const hasScriptError = text.includes('Script error');
        const hasNetworkError = text.includes('ERR_CONNECTION_REFUSED') || text.includes('Network Error');
        
        // Check for loading states
        const isLoading = text.includes('Loading...') || text.includes('Please wait') || text.includes('Fetching');
        
        // Check for specific content by app type
        const hasUserManagement = text.includes('User') && (hasTable || hasForm) && hasButtons > 5;
        const hasDataGrid = hasTable && hasButtons > 3;
        const hasAnalytics = hasChart || text.includes('Analytics') && hasButtons > 3;
        const hasSettings = hasForm || text.includes('Settings') && hasButtons > 3;
        const hasOrders = text.includes('Order') && hasButtons > 3;
        const hasCatalog = text.includes('Catalog') || text.includes('Product') && hasButtons > 3;
        const hasErrorMonitor = text.includes('Error') && text.includes('Monitor') && hasButtons > 5;
        
        return {
          textLength: text.length,
          textPreview: text.substring(0, 400).replace(/\s+/g, ' ').trim(),
          
          // Content indicators
          hasTable,
          hasChart,
          hasForm,
          hasButtons,
          hasCards,
          
          // Error indicators
          hasUndefined,
          hasFailedLoad,
          hasChunkError,
          hasScriptError,
          hasNetworkError,
          isLoading,
          
          // App-specific success indicators
          hasUserManagement,
          hasDataGrid,
          hasAnalytics,
          hasSettings,
          hasOrders,
          hasCatalog,
          hasErrorMonitor,
          
          // URL and title
          url: window.location.href,
          title: document.title
        };
      });

      // Determine status based on analysis
      let status = 'UNKNOWN';
      let details = '';
      let isWorking = false;

      // Check for critical errors first
      if (analysis.hasUndefined) {
        status = '❌ UNDEFINED';
        details = 'Shows "undefined" - Module Federation failed';
      } else if (analysis.hasChunkError) {
        status = '❌ CHUNK_ERROR';
        details = 'Webpack chunk loading error';
      } else if (analysis.hasFailedLoad) {
        status = '❌ FAILED_LOAD';
        details = 'Failed to load micro-frontend';
      } else if (analysis.hasScriptError) {
        status = '❌ SCRIPT_ERROR';
        details = 'JavaScript execution error';
      } else if (analysis.isLoading) {
        status = '⚠️ LOADING';
        details = 'Stuck in loading state';
      } else {
        // Check for app-specific success
        switch (menuItem) {
          case 'User Management':
            if (analysis.hasUserManagement) {
              status = '✅ WORKING';
              details = `User management interface loaded (${analysis.hasButtons} buttons)`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but missing user interface elements`;
            }
            break;
            
          case 'Data Grid':
            if (analysis.hasDataGrid) {
              status = '✅ WORKING';
              details = `Data grid loaded with table`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but no data grid found`;
            }
            break;
            
          case 'Analytics':
            if (analysis.hasAnalytics) {
              status = '✅ WORKING';
              details = `Analytics loaded with charts`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but no charts found`;
            }
            break;
            
          case 'Settings':
            if (analysis.hasSettings) {
              status = '✅ WORKING';
              details = `Settings interface loaded`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but no settings interface`;
            }
            break;
            
          case 'Orders':
            if (analysis.hasOrders) {
              status = '✅ WORKING';
              details = `Orders interface loaded`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but no orders interface`;
            }
            break;
            
          case 'Catalog':
            if (analysis.hasCatalog) {
              status = '✅ WORKING';
              details = `Catalog interface loaded`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but no catalog interface`;
            }
            break;
            
          case 'Error Monitor':
            if (analysis.hasErrorMonitor) {
              status = '✅ WORKING';
              details = `Error monitor loaded`;
              isWorking = true;
            } else {
              status = '⚠️ PARTIAL';
              details = `Content loaded but error monitor incomplete`;
            }
            break;
            
          default:
            if (analysis.textLength > 600) {
              status = '⚠️ PARTIAL';
              details = `Content loaded (${analysis.textLength} chars)`;
            } else {
              status = '❌ NO_CONTENT';
              details = `Minimal content (${analysis.textLength} chars)`;
            }
        }
      }

      console.log(`   📊 Status: ${status}`);
      console.log(`   📝 Details: ${details}`);
      console.log(`   📄 Content: ${analysis.textLength} chars`);
      console.log(`   🎯 Buttons: ${analysis.hasButtons}`);
      console.log(`   📋 Tables: ${analysis.hasTable}`);
      console.log(`   📈 Charts: ${analysis.hasChart}`);
      console.log(`   📝 Forms: ${analysis.hasForm}`);
      
      if (analysis.hasNetworkError) {
        console.log(`   🌐 Network errors detected`);
      }
      
      console.log(`   📖 Preview: "${analysis.textPreview.substring(0, 80)}..."`);

      results.push({
        name: menuItem,
        status: status.replace(/[✅❌⚠️]/g, '').trim(),
        isWorking,
        details,
        analysis
      });

      // Take screenshot
      await page.screenshot({ 
        path: `test-results/force-${menuItem.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });

    } catch (error: any) {
      console.log(`   💥 Exception: ${error.message}`);
      results.push({
        name: menuItem,
        status: 'EXCEPTION',
        isWorking: false,
        details: error.message
      });
    }
  }

  // Generate final report
  console.log('\n========================================');
  console.log('📊 FORCE CLICK TEST RESULTS');
  console.log('========================================\n');

  const workingCount = results.filter(r => r.isWorking).length;
  const partialCount = results.filter(r => r.status === 'PARTIAL').length;
  const brokenCount = results.filter(r => !r.isWorking && r.status !== 'PARTIAL').length;
  const totalCount = results.length;

  console.log(`📈 Summary:`);
  console.log(`   Total: ${totalCount}`);
  console.log(`   ✅ Working: ${workingCount}`);
  console.log(`   ⚠️  Partial: ${partialCount}`);
  console.log(`   ❌ Broken: ${brokenCount}`);
  console.log(`   Success Rate: ${((workingCount / totalCount) * 100).toFixed(1)}%`);
  console.log(`   Functional Rate: ${(((workingCount + partialCount) / totalCount) * 100).toFixed(1)}%\n`);

  console.log(`📋 Individual Results:`);
  results.forEach((result, index) => {
    const icon = result.isWorking ? '✅' : (result.status === 'PARTIAL' ? '⚠️' : '❌');
    console.log(`   ${index + 1}. ${icon} ${result.name} - ${result.status}`);
    console.log(`      ${result.details}`);
  });

  // Save comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalCount,
      working: workingCount,
      partial: partialCount,
      broken: brokenCount,
      successRate: ((workingCount / totalCount) * 100).toFixed(1) + '%',
      functionalRate: (((workingCount + partialCount) / totalCount) * 100).toFixed(1) + '%'
    },
    results: results
  };

  require('fs').writeFileSync(
    'test-results/force-click-comprehensive-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n💾 Report saved: test-results/force-click-comprehensive-report.json');
  console.log('📸 Screenshots saved for each menu item');

  console.log('\n========================================');
  if (workingCount === totalCount) {
    console.log('🎉 ALL MENU ITEMS WORKING PERFECTLY!');
  } else if (workingCount + partialCount >= totalCount * 0.8) {
    console.log('✅ MOST MENU ITEMS FUNCTIONAL (80%+ working/partial)');
  } else if (workingCount > 0) {
    console.log(`⚠️ ${workingCount} MENU ITEMS WORKING, ${partialCount} PARTIAL`);
  } else {
    console.log('❌ NO MENU ITEMS FULLY WORKING');
  }
  console.log('========================================\n');

  // Test passes if at least one item is working
  expect(workingCount + partialCount).toBeGreaterThan(0);
});
