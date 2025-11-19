import { test, expect } from '@playwright/test';

test.describe('Menu Validation Tests', () => {
  test('Validate each menu item functionality', async ({ page }) => {
    console.log('\n========================================');
    console.log('🧪 MENU VALIDATION TEST');
    console.log('========================================\n');

    // Navigate to main page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const results: any[] = [];

    // Test Dashboard (already loaded)
    console.log('🔍 Testing: Dashboard (Default)');
    const dashboardResult = await testCurrentPage(page, 'Dashboard');
    results.push(dashboardResult);
    console.log(`   ${dashboardResult.success ? '✅' : '❌'} Dashboard: ${dashboardResult.summary}\n`);

    // Test each card button from the dashboard
    const menuCards = [
      { name: 'User Management', buttonText: 'Open Module' },
      { name: 'Data Grid', buttonText: 'Open Module' },
      { name: 'Analytics', buttonText: 'Open Module' },
      { name: 'Settings', buttonText: 'Open Module' },
      { name: 'Orders', buttonText: 'Open Module' },
      { name: 'Catalog', buttonText: 'Open Module' },
      { name: 'Error Monitor', buttonText: 'Open Module' }
    ];

    for (const card of menuCards) {
      console.log(`🔍 Testing: ${card.name}`);
      
      try {
        // Go back to dashboard first
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Find and click the card
        const cardSelector = `[class*="Card"]:has-text("${card.name}") button:has-text("${card.buttonText}")`;
        const cardButton = page.locator(cardSelector).first();
        
        const cardExists = await cardButton.count() > 0;
        
        if (!cardExists) {
          console.log(`   ❌ Card not found for ${card.name}`);
          results.push({
            name: card.name,
            success: false,
            summary: 'Card not found',
            details: { clicked: false, loaded: false, hasContent: false }
          });
          continue;
        }

        // Click the card
        await cardButton.click({ timeout: 10000 });
        console.log(`   ✅ Clicked ${card.name} card`);
        
        // Wait for navigation/loading
        await page.waitForTimeout(3000);

        // Test the loaded page
        const result = await testCurrentPage(page, card.name);
        results.push(result);
        
        console.log(`   ${result.success ? '✅' : '❌'} ${card.name}: ${result.summary}`);
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/${card.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true 
        });

      } catch (error: any) {
        console.log(`   💥 Error testing ${card.name}: ${error.message}`);
        results.push({
          name: card.name,
          success: false,
          summary: `Error: ${error.message}`,
          details: { clicked: false, loaded: false, hasContent: false, error: error.message }
        });
      }
      
      console.log('');
    }

    // Generate final report
    generateFinalReport(results);
  });

  async function testCurrentPage(page: any, pageName: string) {
    const pageAnalysis = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { error: 'No root element' };

      const content = root.textContent || '';
      const buttons = root.querySelectorAll('button').length;
      const inputs = root.querySelectorAll('input').length;
      const links = root.querySelectorAll('a').length;
      const tables = root.querySelectorAll('table').length;
      const cards = root.querySelectorAll('[class*="Card"]').length;
      const charts = root.querySelectorAll('canvas, svg').length;
      const forms = root.querySelectorAll('form').length;
      const dataGrids = root.querySelectorAll('[class*="DataGrid"], [class*="MuiDataGrid"]').length;

      // Check for error indicators
      const hasErrorText = content.toLowerCase().includes('error') || 
                          content.toLowerCase().includes('failed') ||
                          content.toLowerCase().includes('not found');

      // Check for loading indicators
      const hasLoadingText = content.toLowerCase().includes('loading') ||
                            content.toLowerCase().includes('please wait');

      return {
        contentLength: content.length,
        contentPreview: content.substring(0, 200).replace(/\s+/g, ' ').trim(),
        interactiveElements: {
          buttons,
          inputs,
          links,
          total: buttons + inputs + links
        },
        components: {
          tables,
          cards,
          charts,
          forms,
          dataGrids
        },
        indicators: {
          hasError: hasErrorText,
          hasLoading: hasLoadingText
        },
        pageTitle: document.title
      };
    });

    // Determine success criteria
    const hasContent = pageAnalysis.contentLength > 100;
    const hasInteractivity = pageAnalysis.interactiveElements.total > 0;
    const noErrors = !pageAnalysis.indicators.hasError;
    const notStillLoading = !pageAnalysis.indicators.hasLoading;

    // Page-specific validations
    let specificValidation = true;
    let specificNotes = '';

    switch (pageName.toLowerCase()) {
      case 'dashboard':
        specificValidation = pageAnalysis.components.cards > 0;
        specificNotes = `Found ${pageAnalysis.components.cards} cards`;
        break;
      case 'user management':
        specificValidation = pageAnalysis.interactiveElements.buttons > 0 || pageAnalysis.components.tables > 0;
        specificNotes = `Buttons: ${pageAnalysis.interactiveElements.buttons}, Tables: ${pageAnalysis.components.tables}`;
        break;
      case 'data grid':
        specificValidation = pageAnalysis.components.dataGrids > 0 || pageAnalysis.components.tables > 0;
        specificNotes = `DataGrids: ${pageAnalysis.components.dataGrids}, Tables: ${pageAnalysis.components.tables}`;
        break;
      case 'analytics':
        specificValidation = pageAnalysis.components.charts > 0;
        specificNotes = `Charts: ${pageAnalysis.components.charts}`;
        break;
      case 'settings':
        specificValidation = pageAnalysis.components.forms > 0 || pageAnalysis.interactiveElements.inputs > 0;
        specificNotes = `Forms: ${pageAnalysis.components.forms}, Inputs: ${pageAnalysis.interactiveElements.inputs}`;
        break;
      default:
        specificNotes = `Interactive elements: ${pageAnalysis.interactiveElements.total}`;
    }

    const success = hasContent && hasInteractivity && noErrors && notStillLoading && specificValidation;

    return {
      name: pageName,
      success,
      summary: success ? 'Working correctly' : 'Has issues',
      details: {
        hasContent,
        hasInteractivity,
        noErrors,
        notStillLoading,
        specificValidation,
        contentLength: pageAnalysis.contentLength,
        contentPreview: pageAnalysis.contentPreview,
        interactiveElements: pageAnalysis.interactiveElements.total,
        specificNotes,
        pageTitle: pageAnalysis.pageTitle
      }
    };
  }

  function generateFinalReport(results: any[]) {
    console.log('\n========================================');
    console.log('📊 FINAL MENU VALIDATION REPORT');
    console.log('========================================\n');

    const totalTests = results.length;
    const successfulTests = results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    console.log(`📈 Summary:`);
    console.log(`   Total Menu Items Tested: ${totalTests}`);
    console.log(`   Working Correctly: ${successfulTests}`);
    console.log(`   Have Issues: ${failedTests}`);
    console.log(`   Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);

    console.log(`📋 Detailed Results:`);
    results.forEach((result, index) => {
      console.log(`\n   ${index + 1}. ${result.success ? '✅' : '❌'} ${result.name}`);
      console.log(`      Status: ${result.summary}`);
      
      if (result.details) {
        console.log(`      Content: ${result.details.hasContent ? '✅' : '❌'} (${result.details.contentLength} chars)`);
        console.log(`      Interactive: ${result.details.hasInteractivity ? '✅' : '❌'} (${result.details.interactiveElements} elements)`);
        console.log(`      No Errors: ${result.details.noErrors ? '✅' : '❌'}`);
        
        if (result.details.specificNotes) {
          console.log(`      Specific: ${result.details.specificNotes}`);
        }
        
        if (result.details.contentPreview) {
          console.log(`      Preview: "${result.details.contentPreview.substring(0, 60)}..."`);
        }
      }
    });

    // Save report
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
      'test-results/menu-validation-report.json', 
      JSON.stringify(report, null, 2)
    );

    console.log('\n💾 Report saved: test-results/menu-validation-report.json');
    console.log('📸 Screenshots saved for each menu item');

    // Final verdict
    console.log('\n========================================');
    if (successfulTests === totalTests) {
      console.log('🎉 ALL MENU ITEMS WORKING PERFECTLY!');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ MOST MENU ITEMS WORKING (80%+ success)');
    } else if (successfulTests >= totalTests * 0.5) {
      console.log('⚠️  SOME MENU ITEMS WORKING (50%+ success)');
    } else {
      console.log('❌ MENU SYSTEM NEEDS ATTENTION');
    }
    console.log('========================================\n');

    // Test assertion - require at least 50% success rate
    expect(successfulTests / totalTests).toBeGreaterThanOrEqual(0.5);
  }
});
