#!/usr/bin/env node

// Test script to verify the API URL fix works correctly
const { chromium } = require('playwright');

async function testApiUrlFix() {
  console.log('🧪 Testing API URL fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs and network requests
  const consoleMessages = [];
  const networkRequests = [];
  
  page.on('console', msg => {
    consoleMessages.push(msg.text());
    console.log('Console:', msg.text());
  });
  
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method()
    });
    if (request.url().includes('/api/errors')) {
      console.log('🔍 Error API Request:', request.method(), request.url());
    }
  });
  
  page.on('requestfailed', request => {
    console.log('❌ Failed Request:', request.method(), request.url(), request.failure()?.errorText);
  });
  
  try {
    // Navigate to the application
    console.log('📱 Loading application...');
    await page.goto('https://golden-sample.dev-creamat.fds-1.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for any initial errors to be logged
    await page.waitForTimeout(3000);
    
    // Try to trigger an error to test error logging
    console.log('🔥 Triggering test error...');
    await page.evaluate(() => {
      // Trigger a test error
      if (window.ErrorCapture) {
        window.ErrorCapture.captureError(new Error('Test error for API URL verification'), 'test');
      } else {
        console.error('Test error for API URL verification');
      }
    });
    
    // Wait for error to be processed
    await page.waitForTimeout(2000);
    
    // Check for localhost:30001 requests
    const localhostRequests = networkRequests.filter(req => 
      req.url.includes('localhost:30001')
    );
    
    const correctApiRequests = networkRequests.filter(req => 
      req.url.includes('golden-sample.dev-creamat.fds-1.com/api/errors')
    );
    
    console.log('\n📊 Test Results:');
    console.log(`❌ Localhost requests: ${localhostRequests.length}`);
    console.log(`✅ Correct API requests: ${correctApiRequests.length}`);
    
    if (localhostRequests.length > 0) {
      console.log('\n❌ Found localhost requests:');
      localhostRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
      });
    }
    
    if (correctApiRequests.length > 0) {
      console.log('\n✅ Found correct API requests:');
      correctApiRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
      });
    }
    
    // Check console for connection refused errors
    const connectionErrors = consoleMessages.filter(msg => 
      msg.includes('ERR_CONNECTION_REFUSED') || 
      msg.includes('localhost:30001')
    );
    
    if (connectionErrors.length > 0) {
      console.log('\n❌ Found connection errors:');
      connectionErrors.forEach(error => {
        console.log(`  - ${error}`);
      });
    } else {
      console.log('\n✅ No connection refused errors found');
    }
    
    const success = localhostRequests.length === 0 && connectionErrors.length === 0;
    console.log(`\n🎯 Overall Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    return success;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testApiUrlFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
