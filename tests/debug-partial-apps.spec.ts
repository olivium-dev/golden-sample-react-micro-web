import { test, expect } from '@playwright/test';

test('Debug why User Management and Data Grid are only partial', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 DEBUGGING PARTIAL APPS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Test User Management in detail
  console.log('🧪 DETAILED TEST: User Management');
  console.log('─'.repeat(50));
  
  try {
    const cardButton = page.locator('[class*="Card"]:has-text("User Management") button').first();
    await cardButton.click({ force: true });
    await page.waitForTimeout(5000);

    // Deep analysis of what's actually loaded
    const userMgmtAnalysis = await page.evaluate(() => {
      const body = document.body;
      const root = document.getElementById('root');
      const text = body.innerText || '';
      
      // Look for specific User Management elements
      const userElements = {
        // Tables and grids
        tables: document.querySelectorAll('table').length,
        dataGrids: document.querySelectorAll('[class*="DataGrid"], [class*="MuiDataGrid"]').length,
        
        // Forms and inputs
        forms: document.querySelectorAll('form').length,
        textInputs: document.querySelectorAll('input[type="text"], input[type="email"]').length,
        selects: document.querySelectorAll('select, [role="combobox"]').length,
        
        // Buttons
        totalButtons: document.querySelectorAll('button').length,
        addButtons: document.querySelectorAll('button:contains("Add"), button:contains("Create"), button:contains("New")').length,
        editButtons: document.querySelectorAll('button:contains("Edit"), button:contains("Update")').length,
        deleteButtons: document.querySelectorAll('button:contains("Delete"), button:contains("Remove")').length,
        
        // User-specific content
        hasUserText: text.includes('User') || text.includes('user'),
        hasEmailText: text.includes('Email') || text.includes('email'),
        hasRoleText: text.includes('Role') || text.includes('role'),
        hasManagementText: text.includes('Management') || text.includes('management'),
        
        // Check for loading or error states
        hasLoadingText: text.includes('Loading') || text.includes('loading'),
        hasErrorText: text.includes('Error') || text.includes('error'),
        hasFailedText: text.includes('Failed') || text.includes('failed'),
        
        // Get all visible text content
        fullText: text,
        textLength: text.length,
        
        // Check DOM structure
        rootChildren: root?.children.length || 0,
        totalElements: document.querySelectorAll('*').length
      };
      
      return userElements;
    });

    console.log('📊 User Management Analysis:');
    console.log(`   Text Length: ${userMgmtAnalysis.textLength} chars`);
    console.log(`   Root Children: ${userMgmtAnalysis.rootChildren}`);
    console.log(`   Total Elements: ${userMgmtAnalysis.totalElements}`);
    console.log(`   Tables: ${userMgmtAnalysis.tables}`);
    console.log(`   Data Grids: ${userMgmtAnalysis.dataGrids}`);
    console.log(`   Forms: ${userMgmtAnalysis.forms}`);
    console.log(`   Text Inputs: ${userMgmtAnalysis.textInputs}`);
    console.log(`   Total Buttons: ${userMgmtAnalysis.totalButtons}`);
    console.log(`   Has User Text: ${userMgmtAnalysis.hasUserText}`);
    console.log(`   Has Email Text: ${userMgmtAnalysis.hasEmailText}`);
    console.log(`   Has Loading: ${userMgmtAnalysis.hasLoadingText}`);
    console.log(`   Has Errors: ${userMgmtAnalysis.hasErrorText}`);
    
    // Show actual content
    console.log('\n📝 Actual Content:');
    console.log(userMgmtAnalysis.fullText.substring(0, 500));
    
    await page.screenshot({ path: 'test-results/debug-user-management.png', fullPage: true });

  } catch (error: any) {
    console.log(`💥 Error testing User Management: ${error.message}`);
  }

  // Test Data Grid in detail
  console.log('\n\n🧪 DETAILED TEST: Data Grid');
  console.log('─'.repeat(50));
  
  try {
    // Go back to dashboard
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const dataGridButton = page.locator('[class*="Card"]:has-text("Data Grid") button').first();
    await dataGridButton.click({ force: true });
    await page.waitForTimeout(5000);

    const dataGridAnalysis = await page.evaluate(() => {
      const body = document.body;
      const root = document.getElementById('root');
      const text = body.innerText || '';
      
      // Look for Data Grid specific elements
      const dataElements = {
        // Data Grid components
        tables: document.querySelectorAll('table').length,
        dataGrids: document.querySelectorAll('[class*="DataGrid"], [class*="MuiDataGrid"]').length,
        rows: document.querySelectorAll('tr, [role="row"]').length,
        cells: document.querySelectorAll('td, [role="cell"], [role="gridcell"]').length,
        
        // Headers and columns
        headers: document.querySelectorAll('th, [role="columnheader"]').length,
        
        // Pagination and controls
        pagination: document.querySelectorAll('[class*="Pagination"], [aria-label*="pagination"]').length,
        
        // Buttons and controls
        totalButtons: document.querySelectorAll('button').length,
        
        // Data Grid specific text
        hasDataText: text.includes('Data') || text.includes('data'),
        hasGridText: text.includes('Grid') || text.includes('grid'),
        hasTableText: text.includes('Table') || text.includes('table'),
        
        // Check for loading or error states
        hasLoadingText: text.includes('Loading') || text.includes('loading'),
        hasErrorText: text.includes('Error') || text.includes('error'),
        
        // Get content
        fullText: text,
        textLength: text.length,
        rootChildren: root?.children.length || 0,
        totalElements: document.querySelectorAll('*').length
      };
      
      return dataElements;
    });

    console.log('📊 Data Grid Analysis:');
    console.log(`   Text Length: ${dataGridAnalysis.textLength} chars`);
    console.log(`   Root Children: ${dataGridAnalysis.rootChildren}`);
    console.log(`   Total Elements: ${dataGridAnalysis.totalElements}`);
    console.log(`   Tables: ${dataGridAnalysis.tables}`);
    console.log(`   Data Grids: ${dataGridAnalysis.dataGrids}`);
    console.log(`   Rows: ${dataGridAnalysis.rows}`);
    console.log(`   Cells: ${dataGridAnalysis.cells}`);
    console.log(`   Headers: ${dataGridAnalysis.headers}`);
    console.log(`   Total Buttons: ${dataGridAnalysis.totalButtons}`);
    console.log(`   Has Data Text: ${dataGridAnalysis.hasDataText}`);
    console.log(`   Has Grid Text: ${dataGridAnalysis.hasGridText}`);
    console.log(`   Has Loading: ${dataGridAnalysis.hasLoadingText}`);
    console.log(`   Has Errors: ${dataGridAnalysis.hasErrorText}`);
    
    // Show actual content
    console.log('\n📝 Actual Content:');
    console.log(dataGridAnalysis.fullText.substring(0, 500));
    
    await page.screenshot({ path: 'test-results/debug-data-grid.png', fullPage: true });

  } catch (error: any) {
    console.log(`💥 Error testing Data Grid: ${error.message}`);
  }

  console.log('\n========================================');
  console.log('🎯 DIAGNOSIS COMPLETE');
  console.log('========================================');
  console.log('Check screenshots:');
  console.log('  - test-results/debug-user-management.png');
  console.log('  - test-results/debug-data-grid.png');
  console.log('========================================\n');
});
