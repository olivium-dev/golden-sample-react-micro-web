import { test, expect } from '@playwright/test';

interface MenuTestResult {
  menuItem: string;
  clicked: boolean;
  loaded: boolean;
  hasContent: boolean;
  hasInteractiveElements: boolean;
  errorMessages: string[];
  loadTime: number;
  screenshot: string;
}

test.describe('Menu Navigation Tests', () => {
  let testResults: MenuTestResult[] = [];

  test('Test all menu items and validate micro-frontend loading', async ({ page }) => {
    console.log('\n========================================');
    console.log('🧪 TESTING ALL MENU ITEMS');
    console.log('========================================\n');

    // Navigate to the main page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify main page loads
    const mainPageLoaded = await page.locator('#root').isVisible();
    expect(mainPageLoaded).toBe(true);

    // Define menu items to test (based on the screenshot)
    const menuItems = [
      { id: 'dashboard', name: 'Dashboard', selector: 'text=Dashboard' },
      { id: 'users', name: 'User Management', selector: 'text=User Management' },
      { id: 'data', name: 'Data Grid', selector: 'text=Data Grid' },
      { id: 'analytics', name: 'Analytics', selector: 'text=Analytics' },
      { id: 'settings', name: 'Settings', selector: 'text=Settings' },
      { id: 'orders', name: 'Orders', selector: 'text=Orders' },
      { id: 'catalog', name: 'Catalog', selector: 'text=Catalog' },
      { id: 'error-monitor', name: 'Error Monitor', selector: 'text=Error Monitor' }
    ];

    console.log(`📋 Testing ${menuItems.length} menu items...\n`);

    for (const menuItem of menuItems) {
      console.log(`🔍 Testing: ${menuItem.name}`);
      
      const result: MenuTestResult = {
        menuItem: menuItem.name,
        clicked: false,
        loaded: false,
        hasContent: false,
        hasInteractiveElements: false,
        errorMessages: [],
        loadTime: 0,
        screenshot: `test-results/menu-${menuItem.id}.png`
      };

      const startTime = Date.now();

      try {
        // Capture any console errors during navigation
        const errors: string[] = [];
        const errorHandler = (msg: any) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        };
        page.on('console', errorHandler);

        // Click the menu item
        const menuSelector = page.locator(menuItem.selector).first();
        const menuExists = await menuSelector.count() > 0;
        
        if (!menuExists) {
          result.errorMessages.push(`Menu item "${menuItem.name}" not found`);
          console.log(`   ❌ Menu item not found`);
        } else {
          await menuSelector.click({ timeout: 5000 });
          result.clicked = true;
          console.log(`   ✅ Clicked successfully`);

          // Wait for potential micro-frontend to load
          await page.waitForTimeout(3000);

          // Check if content loaded
          const contentCheck = await page.evaluate(() => {
            const root = document.getElementById('root');
            if (!root) return { hasContent: false, contentLength: 0, visibleElements: 0 };

            const textContent = root.textContent || '';
            const visibleElements = root.querySelectorAll('*').length;
            
            // Check for specific indicators of loaded content
            const hasButtons = root.querySelectorAll('button').length;
            const hasInputs = root.querySelectorAll('input').length;
            const hasLinks = root.querySelectorAll('a').length;
            const hasTables = root.querySelectorAll('table').length;
            const hasCards = root.querySelectorAll('[class*="Card"], [class*="card"]').length;
            const hasCharts = root.querySelectorAll('canvas, svg').length;

            return {
              hasContent: textContent.trim().length > 100,
              contentLength: textContent.length,
              visibleElements,
              interactiveElements: hasButtons + hasInputs + hasLinks,
              hasButtons,
              hasInputs,
              hasLinks,
              hasTables,
              hasCards,
              hasCharts,
              textPreview: textContent.substring(0, 200)
            };
          });

          result.hasContent = contentCheck.hasContent;
          result.hasInteractiveElements = contentCheck.interactiveElements > 0;
          result.loaded = contentCheck.visibleElements > 10; // Arbitrary threshold for "loaded"

          console.log(`   📊 Content length: ${contentCheck.contentLength}`);
          console.log(`   🎯 Interactive elements: ${contentCheck.interactiveElements}`);
          console.log(`   📝 Text preview: "${contentCheck.textPreview.substring(0, 50)}..."`);

          // Specific validations based on menu item
          await validateSpecificContent(page, menuItem.id, result);

          // Check for loading states or error messages
          const hasLoadingIndicator = await page.locator('text=Loading').count() > 0;
          const hasErrorMessage = await page.locator('text=Error').count() > 0;

          if (hasLoadingIndicator) {
            console.log(`   ⏳ Loading indicator present`);
          }

          if (hasErrorMessage) {
            result.errorMessages.push('Error message visible on page');
            console.log(`   ⚠️  Error message detected`);
          }

          // Take screenshot
          await page.screenshot({ 
            path: result.screenshot, 
            fullPage: true 
          });

          console.log(`   📸 Screenshot: ${result.screenshot}`);
        }

        page.off('console', errorHandler);
        result.errorMessages.push(...errors);
        result.loadTime = Date.now() - startTime;

        // Determine overall success
        const isSuccess = result.clicked && result.loaded && result.hasContent && result.errorMessages.length === 0;
        console.log(`   ${isSuccess ? '✅' : '❌'} Overall: ${isSuccess ? 'SUCCESS' : 'FAILED'}`);
        
        if (result.errorMessages.length > 0) {
          console.log(`   🚨 Errors: ${result.errorMessages.join(', ')}`);
        }

      } catch (error: any) {
        result.errorMessages.push(`Navigation error: ${error.message}`);
        console.log(`   💥 Exception: ${error.message}`);
      }

      testResults.push(result);
      console.log(`   ⏱️  Load time: ${result.loadTime}ms\n`);
    }

    // Generate comprehensive report
    await generateTestReport(page, testResults);
  });

  // Helper function for specific content validation
  async function validateSpecificContent(page: any, menuId: string, result: MenuTestResult) {
    switch (menuId) {
      case 'dashboard':
        const hasDashboardCards = await page.locator('[class*="Card"], .dashboard-card').count() > 0;
        const hasWelcomeText = await page.locator('text=Welcome').count() > 0;
        if (hasDashboardCards || hasWelcomeText) {
          console.log(`   ✅ Dashboard-specific content found`);
        }
        break;

      case 'users':
        const hasUserTable = await page.locator('table, [class*="DataGrid"], [class*="Table"]').count() > 0;
        const hasAddUserButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').count() > 0;
        if (hasUserTable || hasAddUserButton) {
          console.log(`   ✅ User Management content found`);
        }
        break;

      case 'data':
        const hasDataGrid = await page.locator('[class*="DataGrid"], [class*="MuiDataGrid"], table').count() > 0;
        if (hasDataGrid) {
          console.log(`   ✅ Data Grid component found`);
        }
        break;

      case 'analytics':
        const hasCharts = await page.locator('canvas, svg, [class*="Chart"], [class*="Recharts"]').count() > 0;
        if (hasCharts) {
          console.log(`   ✅ Analytics charts found`);
        }
        break;

      case 'settings':
        const hasSettingsForm = await page.locator('form, input, [class*="Setting"], [class*="Config"]').count() > 0;
        if (hasSettingsForm) {
          console.log(`   ✅ Settings form elements found`);
        }
        break;

      case 'orders':
        const hasOrdersContent = await page.locator('text=Order, [class*="Order"]').count() > 0;
        if (hasOrdersContent) {
          console.log(`   ✅ Orders content found`);
        }
        break;

      case 'catalog':
        const hasCatalogContent = await page.locator('text=Catalog, [class*="Catalog"], [class*="Product"]').count() > 0;
        if (hasCatalogContent) {
          console.log(`   ✅ Catalog content found`);
        }
        break;

      case 'error-monitor':
        const hasErrorMonitor = await page.locator('text=Error, [class*="Error"], [class*="Monitor"]').count() > 0;
        if (hasErrorMonitor) {
          console.log(`   ✅ Error Monitor content found`);
        }
        break;
    }
  }

  // Generate comprehensive test report
  async function generateTestReport(page: any, results: MenuTestResult[]) {
    console.log('\n========================================');
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('========================================\n');

    const totalTests = results.length;
    const successfulTests = results.filter(r => r.clicked && r.loaded && r.hasContent && r.errorMessages.length === 0).length;
    const failedTests = totalTests - successfulTests;

    console.log(`📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Successful: ${successfulTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);

    console.log(`📋 Detailed Results:`);
    results.forEach((result, index) => {
      const status = result.clicked && result.loaded && result.hasContent && result.errorMessages.length === 0 ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${result.menuItem}`);
      console.log(`      Clicked: ${result.clicked ? '✅' : '❌'}`);
      console.log(`      Loaded: ${result.loaded ? '✅' : '❌'}`);
      console.log(`      Has Content: ${result.hasContent ? '✅' : '❌'}`);
      console.log(`      Interactive: ${result.hasInteractiveElements ? '✅' : '❌'}`);
      console.log(`      Load Time: ${result.loadTime}ms`);
      
      if (result.errorMessages.length > 0) {
        console.log(`      Errors: ${result.errorMessages.join(', ')}`);
      }
      console.log('');
    });

    // Save detailed report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        successful: successfulTests,
        failed: failedTests,
        successRate: ((successfulTests / totalTests) * 100).toFixed(1) + '%'
      },
      results: results
    };

    require('fs').writeFileSync(
      'test-results/menu-navigation-report.json', 
      JSON.stringify(report, null, 2)
    );

    console.log('💾 Detailed report saved to: test-results/menu-navigation-report.json');
    console.log('📸 Screenshots saved for each menu item in test-results/');

    // Assert overall success
    console.log('\n========================================');
    if (successfulTests === totalTests) {
      console.log('🎉 ALL MENU ITEMS WORKING PERFECTLY!');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ MOST MENU ITEMS WORKING (80%+ success rate)');
    } else {
      console.log('⚠️  SOME MENU ITEMS NEED ATTENTION');
    }
    console.log('========================================\n');

    // Test assertions
    expect(successfulTests).toBeGreaterThan(0); // At least one menu should work
    expect(successfulTests / totalTests).toBeGreaterThanOrEqual(0.5); // At least 50% success rate
  }
});
