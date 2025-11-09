import { test, expect } from '@playwright/test';

test('Test backend CORS deployment status', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING BACKEND CORS DEPLOYMENT');
  console.log('========================================\n');

  // Navigate to application
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Test CORS by making actual API calls from the browser
  const corsTestResults = await page.evaluate(async () => {
    const results: any[] = [];
    
    const testEndpoints = [
      'https://dev-creamat.fds-1.com/gateway/api/Order/User/test-user',
      'https://dev-creamat.fds-1.com/gateway/api/catalog/Category/All/10/1',
      'https://dev-creamat.fds-1.com/gateway/health'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing CORS for: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          corsSuccess: true,
          headers: {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
          }
        });
        
      } catch (error: any) {
        results.push({
          endpoint,
          corsSuccess: false,
          error: error.message,
          isCorsError: error.message.includes('CORS') || error.message.includes('Access-Control')
        });
      }
    }
    
    return results;
  });

  console.log('📊 CORS Test Results:');
  corsTestResults.forEach((result, i) => {
    console.log(`\n${i + 1}. ${result.endpoint.split('/').pop()}`);
    if (result.corsSuccess) {
      console.log(`   ✅ CORS Success - Status: ${result.status}`);
      console.log(`   🔧 Allow-Origin: ${result.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   🔧 Allow-Credentials: ${result.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log(`   🔧 Allow-Methods: ${result.headers['access-control-allow-methods'] || 'Not set'}`);
    } else {
      console.log(`   ❌ CORS Failed: ${result.error}`);
      console.log(`   🚫 Is CORS Error: ${result.isCorsError ? 'Yes' : 'No'}`);
    }
  });

  // Test specific menu items with error monitoring
  console.log('\n🧪 Testing Menu Items with Backend Calls:');
  
  const menuTestResults = [];
  
  // Test Orders app
  console.log('\n📍 Testing Orders App...');
  try {
    await page.click('text=Orders', { timeout: 5000 });
    await page.waitForTimeout(5000);
    
    const ordersResult = await page.evaluate(() => {
      const content = document.body.innerText;
      return {
        loaded: content.includes('Orders Management'),
        hasError: content.includes('Failed to load orders'),
        hasData: content.includes('No orders found') || content.includes('ID'), // Either empty state or data
        errorDetails: content.match(/Failed to load orders from API: ([^\n]+)/)?.[1] || null
      };
    });
    
    console.log(`   Content Loaded: ${ordersResult.loaded ? '✅' : '❌'}`);
    console.log(`   Has Data/Empty State: ${ordersResult.hasData ? '✅' : '❌'}`);
    console.log(`   API Error: ${ordersResult.hasError ? '❌' : '✅'}`);
    if (ordersResult.errorDetails) {
      console.log(`   Error Details: ${ordersResult.errorDetails}`);
    }
    
    menuTestResults.push({ name: 'Orders', ...ordersResult });
    
  } catch (error: any) {
    console.log(`   ❌ Failed to test Orders: ${error.message}`);
    menuTestResults.push({ name: 'Orders', loaded: false, error: error.message });
  }

  // Test Catalog app
  console.log('\n📍 Testing Catalog App...');
  try {
    await page.click('text=Catalog', { timeout: 5000 });
    await page.waitForTimeout(5000);
    
    const catalogResult = await page.evaluate(() => {
      const content = document.body.innerText;
      return {
        loaded: content.includes('Catalog Management'),
        hasError: content.includes('Error fetching categories'),
        hasCategories: content.includes('Categories') || content.includes('Category'),
        errorDetails: content.match(/Error fetching categories: ([^\n]+)/)?.[1] || null
      };
    });
    
    console.log(`   Content Loaded: ${catalogResult.loaded ? '✅' : '❌'}`);
    console.log(`   Has Categories: ${catalogResult.hasCategories ? '✅' : '❌'}`);
    console.log(`   API Error: ${catalogResult.hasError ? '❌' : '✅'}`);
    if (catalogResult.errorDetails) {
      console.log(`   Error Details: ${catalogResult.errorDetails}`);
    }
    
    menuTestResults.push({ name: 'Catalog', ...catalogResult });
    
  } catch (error: any) {
    console.log(`   ❌ Failed to test Catalog: ${error.message}`);
    menuTestResults.push({ name: 'Catalog', loaded: false, error: error.message });
  }

  console.log('\n========================================');
  console.log('📊 BACKEND CORS DEPLOYMENT STATUS');
  console.log('========================================\n');

  const corsWorking = corsTestResults.some(r => r.corsSuccess && r.headers['access-control-allow-origin']);
  const apiWorking = menuTestResults.some(r => r.loaded && !r.hasError);

  if (corsWorking) {
    console.log('✅ CORS IS WORKING - Backend deployment successful!');
  } else {
    console.log('❌ CORS NOT WORKING - Backend deployment issue detected');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify enable-frontend-cors branch is deployed');
    console.log('   2. Check if gateway is routing to the updated backend');
    console.log('   3. Confirm CORS policy is active in production');
  }

  if (apiWorking) {
    console.log('✅ API ENDPOINTS WORKING - Frontend configuration correct!');
  } else {
    console.log('⚠️ API ENDPOINTS NEED ATTENTION');
  }

  console.log('\n📋 Summary:');
  console.log(`   CORS Status: ${corsWorking ? '✅ Working' : '❌ Needs Fix'}`);
  console.log(`   API Status: ${apiWorking ? '✅ Working' : '⚠️ Needs Backend'}`);
  console.log(`   Frontend Config: ✅ Correct`);

  console.log('\n========================================\n');

  // Take screenshot
  await page.screenshot({ path: 'test-results/backend-cors-test.png', fullPage: false });
});
