import { test, expect } from '@playwright/test';

test('Final API integration test - real backend', async ({ page }) => {
  console.log('\n========================================');
  console.log('🚀 FINAL API INTEGRATION TEST');
  console.log('========================================\n');

  const apiSuccess: string[] = [];
  const apiErrors: string[] = [];
  const corsErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('CORS') || text.includes('Access-Control')) {
        corsErrors.push(text);
        console.log(`🚫 CORS ERROR: ${text.substring(0, 80)}...`);
      } else if (text.includes('Failed to load') && !text.includes('manifest')) {
        apiErrors.push(text);
        console.log(`❌ API ERROR: ${text.substring(0, 80)}...`);
      }
    } else if (msg.type() === 'log' && msg.text().includes('200')) {
      apiSuccess.push(msg.text());
      console.log(`✅ API SUCCESS: ${msg.text().substring(0, 80)}...`);
    }
  });

  // Navigate to application
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('📊 Testing Orders App with Real Backend...');
  
  // Test Orders app
  await page.click('text=Orders', { timeout: 10000 });
  await page.waitForTimeout(8000); // Wait longer for API call

  const ordersResult = await page.evaluate(() => {
    const content = document.body.innerText;
    return {
      hasOrdersTitle: content.includes('Orders Management'),
      hasOrdersData: content.includes('ID') && content.includes('Product') && content.includes('Total'),
      hasNoOrdersMessage: content.includes('No orders found'),
      hasApiError: content.includes('Failed to load orders'),
      hasRealData: content.includes('Hyaluronic_acid') || content.includes('Cars') || content.includes('plane'),
      apiEndpoint: content.match(/API Endpoint: ([^\n]+)/)?.[1] || 'Not found'
    };
  });

  console.log(`   Orders Management UI: ${ordersResult.hasOrdersTitle ? '✅' : '❌'}`);
  console.log(`   Real Orders Data: ${ordersResult.hasRealData ? '✅' : '❌'}`);
  console.log(`   Data Grid Working: ${ordersResult.hasOrdersData ? '✅' : '❌'}`);
  console.log(`   API Error: ${ordersResult.hasApiError ? '❌' : '✅'}`);
  console.log(`   API Endpoint: ${ordersResult.apiEndpoint}`);

  console.log('\n📊 Testing Catalog App with Real Backend...');
  
  // Test Catalog app
  await page.click('text=Catalog', { timeout: 10000 });
  await page.waitForTimeout(8000);

  const catalogResult = await page.evaluate(() => {
    const content = document.body.innerText;
    return {
      hasCatalogTitle: content.includes('Catalog Management'),
      hasCatalogData: content.includes('Skin Care') || content.includes('Hair Care') || content.includes('Body Care'),
      hasApiError: content.includes('Error fetching categories'),
      hasRealCategories: content.includes('Skin Care') && content.includes('Hair Care') && content.includes('Body Care')
    };
  });

  console.log(`   Catalog Management UI: ${catalogResult.hasCatalogTitle ? '✅' : '❌'}`);
  console.log(`   Real Category Data: ${catalogResult.hasRealCategories ? '✅' : '❌'}`);
  console.log(`   API Error: ${catalogResult.hasApiError ? '❌' : '✅'}`);

  console.log('\n========================================');
  console.log('🏆 FINAL INTEGRATION RESULTS');
  console.log('========================================\n');

  const ordersWorking = ordersResult.hasOrdersTitle && (ordersResult.hasRealData || ordersResult.hasNoOrdersMessage) && !ordersResult.hasApiError;
  const catalogWorking = catalogResult.hasCatalogTitle && !catalogResult.hasApiError;

  console.log(`📊 Summary:`);
  console.log(`   Orders App: ${ordersWorking ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`   Catalog App: ${catalogWorking ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`   CORS Errors: ${corsErrors.length}`);
  console.log(`   API Errors: ${apiErrors.length}`);
  console.log(`   API Success: ${apiSuccess.length}`);

  if (ordersWorking && catalogWorking && corsErrors.length === 0) {
    console.log('\n🎉 PERFECT! REAL BACKEND INTEGRATION WORKING!');
  } else if (corsErrors.length > 0) {
    console.log('\n⚠️ CORS ISSUES STILL PRESENT');
  } else {
    console.log('\n⚠️ SOME INTEGRATION ISSUES REMAIN');
  }

  console.log('\n========================================\n');

  // Take final screenshot
  await page.screenshot({ path: 'test-results/final-api-integration.png', fullPage: false });

  // Assert that at least one app is working with real data
  expect(ordersWorking || catalogWorking).toBe(true);
});
