import { test, expect } from '@playwright/test';

test.describe('Real Issues Detection', () => {
  test('Capture actual blocking issues in each menu item', async ({ page }) => {
    console.log('\n========================================');
    console.log('🔍 DETECTING REAL BLOCKING ISSUES');
    console.log('========================================\n');

    const issues: any[] = [];
    
    // Set up comprehensive error tracking
    const allErrors: string[] = [];
    const networkFailures: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        allErrors.push(text);
        console.log(`🔴 CONSOLE ERROR: ${text}`);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
        console.log(`🟡 WARNING: ${text}`);
      }
    });

    page.on('pageerror', (error) => {
      allErrors.push(`PAGE ERROR: ${error.message}`);
      console.log(`💥 PAGE ERROR: ${error.message}`);
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      networkFailures.push(`${request.method()} ${request.url()}: ${failure?.errorText}`);
      console.log(`🌐 NETWORK FAIL: ${request.method()} ${request.url()}: ${failure?.errorText}`);
    });

    // Navigate to main page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Test each menu item by clicking cards
    const menuItems = [
      'User Management',
      'Data Grid', 
      'Analytics',
      'Settings',
      'Orders',
      'Catalog',
      'Error Monitor'
    ];

    for (const menuItem of menuItems) {
      console.log(`\n🧪 TESTING: ${menuItem}`);
      console.log('─'.repeat(50));
      
      const itemIssues: string[] = [];
      const startErrors = allErrors.length;
      const startNetworkFails = networkFailures.length;
      
      try {
        // Go back to dashboard
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Find and click the card
        const cardButton = page.locator(`[class*="Card"]:has-text("${menuItem}") button`).first();
        const cardExists = await cardButton.count() > 0;
        
        if (!cardExists) {
          itemIssues.push(`❌ BLOCKING: Card for "${menuItem}" not found on dashboard`);
          console.log(`   ❌ BLOCKING: Card not found`);
        } else {
          console.log(`   ✅ Card found, clicking...`);
          await cardButton.click();
          
          // Wait for navigation and check what actually happens
          await page.waitForTimeout(5000);
          
          // Comprehensive page analysis
          const pageState = await page.evaluate(() => {
            const root = document.getElementById('root');
            const body = document.body;
            
            // Check for error messages in the UI
            const errorElements = Array.from(document.querySelectorAll('*')).filter(el => {
              const text = el.textContent?.toLowerCase() || '';
              return text.includes('error') || 
                     text.includes('failed') || 
                     text.includes('not found') ||
                     text.includes('something went wrong') ||
                     text.includes('unable to load') ||
                     text.includes('connection refused') ||
                     text.includes('timeout') ||
                     text.includes('500') ||
                     text.includes('404');
            });

            // Check for loading states that never resolve
            const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => {
              const text = el.textContent?.toLowerCase() || '';
              return text.includes('loading') || 
                     text.includes('please wait') ||
                     text.includes('fetching');
            });

            // Check for empty/broken states
            const isEmpty = !root || root.children.length === 0 || (root.textContent?.trim().length || 0) < 50;
            
            // Check for specific micro-frontend indicators
            const hasTable = document.querySelectorAll('table, [class*="DataGrid"], [class*="MuiDataGrid"]').length > 0;
            const hasChart = document.querySelectorAll('canvas, svg[class*="recharts"], [class*="Chart"]').length > 0;
            const hasForm = document.querySelectorAll('form, input[type="text"], input[type="email"]').length > 0;
            const hasButtons = document.querySelectorAll('button').length;
            
            return {
              url: window.location.href,
              title: document.title,
              rootContent: root?.innerHTML.substring(0, 500) || 'NO ROOT',
              bodyText: body.textContent?.substring(0, 300) || 'NO TEXT',
              errorElements: errorElements.map(el => el.textContent?.trim().substring(0, 100)),
              loadingElements: loadingElements.map(el => el.textContent?.trim().substring(0, 50)),
              isEmpty,
              hasTable,
              hasChart,
              hasForm,
              hasButtons,
              totalElements: document.querySelectorAll('*').length
            };
          });

          console.log(`   📍 URL: ${pageState.url}`);
          console.log(`   📄 Title: ${pageState.title}`);
          console.log(`   📊 Elements: ${pageState.totalElements}`);
          console.log(`   🔘 Buttons: ${pageState.hasButtons}`);

          // Detect specific issues
          if (pageState.isEmpty) {
            itemIssues.push(`❌ BLOCKING: Page is empty or has no content`);
            console.log(`   ❌ BLOCKING: Empty page`);
          }

          if (pageState.errorElements.length > 0) {
            pageState.errorElements.forEach(error => {
              itemIssues.push(`❌ BLOCKING: UI Error - "${error}"`);
              console.log(`   ❌ BLOCKING: UI Error - "${error}"`);
            });
          }

          if (pageState.loadingElements.length > 0) {
            itemIssues.push(`⚠️  WARNING: Stuck loading - "${pageState.loadingElements[0]}"`);
            console.log(`   ⚠️  WARNING: Stuck loading`);
          }

          // Check for micro-frontend specific issues
          switch (menuItem) {
            case 'User Management':
              if (!pageState.hasTable && !pageState.hasForm && pageState.hasButtons < 3) {
                itemIssues.push(`❌ BLOCKING: No user table or management interface found`);
                console.log(`   ❌ BLOCKING: Missing user management interface`);
              }
              break;
              
            case 'Data Grid':
              if (!pageState.hasTable) {
                itemIssues.push(`❌ BLOCKING: No data grid/table found`);
                console.log(`   ❌ BLOCKING: Missing data grid`);
              }
              break;
              
            case 'Analytics':
              if (!pageState.hasChart) {
                itemIssues.push(`❌ BLOCKING: No charts or analytics visualizations found`);
                console.log(`   ❌ BLOCKING: Missing analytics charts`);
              }
              break;
              
            case 'Settings':
              if (!pageState.hasForm && pageState.hasButtons < 2) {
                itemIssues.push(`❌ BLOCKING: No settings form or configuration interface found`);
                console.log(`   ❌ BLOCKING: Missing settings interface`);
              }
              break;
              
            case 'Orders':
              if (!pageState.hasTable && pageState.hasButtons < 2) {
                itemIssues.push(`❌ BLOCKING: No orders table or management interface found`);
                console.log(`   ❌ BLOCKING: Missing orders interface`);
              }
              break;
              
            case 'Catalog':
              if (pageState.totalElements < 20) {
                itemIssues.push(`❌ BLOCKING: Catalog appears to be empty or not loaded`);
                console.log(`   ❌ BLOCKING: Empty catalog`);
              }
              break;
              
            case 'Error Monitor':
              if (pageState.totalElements < 15) {
                itemIssues.push(`❌ BLOCKING: Error monitor appears to be empty or not loaded`);
                console.log(`   ❌ BLOCKING: Empty error monitor`);
              }
              break;
          }

          // Check for new errors during this test
          const newErrors = allErrors.slice(startErrors);
          const newNetworkFails = networkFailures.slice(startNetworkFails);
          
          if (newErrors.length > 0) {
            newErrors.forEach(error => {
              itemIssues.push(`❌ BLOCKING: JavaScript Error - "${error}"`);
              console.log(`   ❌ BLOCKING: JS Error - "${error.substring(0, 80)}..."`);
            });
          }
          
          if (newNetworkFails.length > 0) {
            newNetworkFails.forEach(fail => {
              itemIssues.push(`❌ BLOCKING: Network Failure - "${fail}"`);
              console.log(`   ❌ BLOCKING: Network - "${fail}"`);
            });
          }

          // Take screenshot of the broken state
          await page.screenshot({ 
            path: `test-results/issues-${menuItem.toLowerCase().replace(/\s+/g, '-')}.png`,
            fullPage: true 
          });
          console.log(`   📸 Screenshot saved`);

          // Log body text for debugging
          console.log(`   📝 Content: "${pageState.bodyText.substring(0, 100)}..."`);
        }

      } catch (error: any) {
        itemIssues.push(`❌ BLOCKING: Test Exception - "${error.message}"`);
        console.log(`   💥 BLOCKING: Exception - ${error.message}`);
      }

      // Summary for this menu item
      if (itemIssues.length === 0) {
        console.log(`   ✅ NO BLOCKING ISSUES FOUND`);
      } else {
        console.log(`   🚨 FOUND ${itemIssues.length} ISSUES`);
      }

      issues.push({
        menuItem,
        issueCount: itemIssues.length,
        issues: itemIssues,
        status: itemIssues.length === 0 ? 'WORKING' : 'BROKEN'
      });
    }

    // Generate comprehensive issue report
    console.log('\n========================================');
    console.log('🚨 BLOCKING ISSUES REPORT');
    console.log('========================================\n');

    const brokenItems = issues.filter(item => item.status === 'BROKEN');
    const workingItems = issues.filter(item => item.status === 'WORKING');

    console.log(`📊 SUMMARY:`);
    console.log(`   Total Menu Items: ${issues.length}`);
    console.log(`   Working: ${workingItems.length}`);
    console.log(`   Broken: ${brokenItems.length}`);
    console.log(`   Success Rate: ${((workingItems.length / issues.length) * 100).toFixed(1)}%\n`);

    if (brokenItems.length > 0) {
      console.log(`🚨 BROKEN MENU ITEMS:`);
      brokenItems.forEach(item => {
        console.log(`\n   ❌ ${item.menuItem} (${item.issueCount} issues):`);
        item.issues.forEach((issue: string) => {
          console.log(`      ${issue}`);
        });
      });
    }

    if (workingItems.length > 0) {
      console.log(`\n✅ WORKING MENU ITEMS:`);
      workingItems.forEach(item => {
        console.log(`   ✅ ${item.menuItem}`);
      });
    }

    // Overall system issues
    console.log(`\n🔍 SYSTEM-WIDE ISSUES:`);
    console.log(`   Total JavaScript Errors: ${allErrors.length}`);
    console.log(`   Total Network Failures: ${networkFailures.length}`);
    console.log(`   Total Warnings: ${consoleWarnings.length}`);

    if (allErrors.length > 0) {
      console.log(`\n   JavaScript Errors:`);
      [...new Set(allErrors)].slice(0, 5).forEach(error => {
        console.log(`   - ${error.substring(0, 100)}...`);
      });
    }

    if (networkFailures.length > 0) {
      console.log(`\n   Network Failures:`);
      [...new Set(networkFailures)].slice(0, 5).forEach(fail => {
        console.log(`   - ${fail}`);
      });
    }

    // Save detailed report
    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalItems: issues.length,
        working: workingItems.length,
        broken: brokenItems.length,
        successRate: ((workingItems.length / issues.length) * 100).toFixed(1) + '%'
      },
      systemIssues: {
        jsErrors: allErrors.length,
        networkFailures: networkFailures.length,
        warnings: consoleWarnings.length
      },
      menuItems: issues,
      allErrors: [...new Set(allErrors)],
      networkFailures: [...new Set(networkFailures)]
    };

    require('fs').writeFileSync(
      'test-results/blocking-issues-report.json', 
      JSON.stringify(detailedReport, null, 2)
    );

    console.log(`\n💾 Detailed report: test-results/blocking-issues-report.json`);
    console.log(`📸 Screenshots: test-results/issues-*.png`);

    console.log('\n========================================');
    if (brokenItems.length === 0) {
      console.log('🎉 NO BLOCKING ISSUES FOUND!');
    } else {
      console.log(`🚨 ${brokenItems.length} MENU ITEMS HAVE BLOCKING ISSUES`);
      console.log('   Check the detailed report and screenshots above');
    }
    console.log('========================================\n');

    // Fail the test if there are blocking issues
    if (brokenItems.length > 0) {
      throw new Error(`Found ${brokenItems.length} menu items with blocking issues. Check the detailed report.`);
    }
  });
});
