#!/usr/bin/env node

// Quick test to check what API URL the error logging is using
const { chromium } = require('playwright');

async function quickApiUrlTest() {
  console.log('🧪 Quick API URL Test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const networkRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/errors')) {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      });
      console.log('🔍 API Error Request:', request.method(), request.url());
    }
  });
  
  page.on('requestfailed', request => {
    if (request.url().includes('/api/errors')) {
      console.log('❌ Failed API Error Request:', request.method(), request.url(), request.failure()?.errorText);
    }
  });
  
  try {
    console.log('📱 Loading application...');
    await page.goto('https://golden-sample.dev-creamat.fds-1.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Wait a bit for any initial errors
    await page.waitForTimeout(3000);
    
    // Trigger a test error to see what URL it uses
    console.log('🔥 Triggering test error...');
    await page.evaluate(() => {
      // Force an error to test the API URL
      console.error('TEST ERROR: Checking API URL for error logging');
    });
    
    // Wait for error to be processed
    await page.waitForTimeout(3000);
    
    console.log('\n📊 Results:');
    if (networkRequests.length > 0) {
      console.log('✅ Found API error requests:');
      networkRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
        
        // Check what URL pattern it's using
        if (req.url.includes('golden-sample.dev-creamat.fds-1.com')) {
          console.log('  ✅ Using SUBDOMAIN URL (CORRECT!)');
        } else if (req.url.includes('192.168.2.73:30001')) {
          console.log('  ❌ Still using IP URL (WRONG!)');
        } else if (req.url.includes('localhost:30001')) {
          console.log('  ❌ Still using localhost URL (WRONG!)');
        }
      });
    } else {
      console.log('❌ No API error requests found');
    }
    
    return networkRequests.length > 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
quickApiUrlTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
