import { test, expect } from '@playwright/test';

test('Test API endpoint fixes', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING API ENDPOINT FIXES');
  console.log('========================================\n');

  const apiErrors: string[] = [];
  const corsErrors: string[] = [];
  const successfulRequests: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('CORS') || text.includes('Access-Control-Allow-Origin')) {
        corsErrors.push(text);
        console.log(`🚫 CORS ERROR: ${text.substring(0, 100)}...`);
      } else if (text.includes('404') || text.includes('Failed to load resource')) {
        apiErrors.push(text);
        console.log(`❌ API ERROR: ${text.substring(0, 100)}...`);
      }
    } else if (msg.type() === 'log' && msg.text().includes('API')) {
      successfulRequests.push(msg.text());
      console.log(`✅ API LOG: ${msg.text().substring(0, 100)}...`);
    }
  });

  // Navigate to main page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('📊 Testing Orders App API...');
  
  // Test Orders app
  try {
    await page.click('text=Orders', { timeout: 5000 });
    await page.waitForTimeout(5000);
    
    const ordersContent = await page.evaluate(() => {
      const content = document.body.innerText;
      return {
        hasOrdersContent: content.includes('Orders') && !content.includes('Dashboard Overview'),
        hasErrorMessage: content.includes('Failed to load orders'),
        apiEndpoint: content.match(/API Endpoint: ([^\n]+)/)?.[1] || 'Not found'
      };
    });
    
    console.log(`   Orders Content: ${ordersContent.hasOrdersContent ? '✅' : '❌'}`);
    console.log(`   API Endpoint: ${ordersContent.apiEndpoint}`);
    console.log(`   Has Error: ${ordersContent.hasErrorMessage ? '❌' : '✅'}`);
    
  } catch (error: any) {
    console.log(`   ❌ Failed to test Orders: ${error.message}`);
  }

  console.log('\n📊 Testing Catalog App API...');
  
  // Test Catalog app  
  try {
    await page.click('text=Catalog', { timeout: 5000 });
    await page.waitForTimeout(5000);
    
    const catalogContent = await page.evaluate(() => {
      const content = document.body.innerText;
      return {
        hasCatalogContent: content.includes('Catalog') && !content.includes('Dashboard Overview'),
        hasErrorMessage: content.includes('Error fetching categories'),
        hasCategories: content.includes('Category') || content.includes('categories')
      };
    });
    
    console.log(`   Catalog Content: ${catalogContent.hasCatalogContent ? '✅' : '❌'}`);
    console.log(`   Has Categories: ${catalogContent.hasCategories ? '✅' : '❌'}`);
    console.log(`   Has Error: ${catalogContent.hasErrorMessage ? '❌' : '✅'}`);
    
  } catch (error: any) {
    console.log(`   ❌ Failed to test Catalog: ${error.message}`);
  }

  // Check network requests
  console.log('\n📡 Network Analysis:');
  const networkRequests = await page.evaluate(() => {
    return (window as any).__networkRequests || [];
  });
  
  console.log(`   Network Requests Captured: ${networkRequests.length}`);

  console.log('\n========================================');
  console.log('📊 API ENDPOINT TEST RESULTS:');
  console.log('========================================');
  
  console.log(`📈 Summary:`);
  console.log(`   API Errors: ${apiErrors.length}`);
  console.log(`   CORS Errors: ${corsErrors.length}`);
  console.log(`   Successful Requests: ${successfulRequests.length}`);

  if (corsErrors.length > 0) {
    console.log('\n🚫 CORS Issues (Expected until backend CORS is deployed):');
    corsErrors.slice(0, 3).forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.substring(0, 80)}...`);
    });
  }

  if (apiErrors.length > 0) {
    console.log('\n❌ API Issues:');
    apiErrors.slice(0, 3).forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.substring(0, 80)}...`);
    });
  }

  console.log('\n🔧 Next Steps:');
  if (corsErrors.length > 0) {
    console.log('   1. Deploy backend CORS changes from enable-frontend-cors branch');
    console.log('   2. Verify gateway routing is configured correctly');
  }
  if (apiErrors.length === 0 && corsErrors.length === 0) {
    console.log('   ✅ All API endpoints are working correctly!');
  }

  console.log('========================================\n');

  // Take screenshot
  await page.screenshot({ path: 'test-results/api-endpoint-test.png', fullPage: false });
});
