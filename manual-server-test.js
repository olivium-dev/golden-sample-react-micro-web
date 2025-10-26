const { chromium } = require('playwright');

async function testServer() {
  console.log('🧪 Manual Server Test - Checking deployed application...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`🖥️  CONSOLE [${type.toUpperCase()}]: ${text}`);
  });
  
  // Capture network failures
  page.on('requestfailed', request => {
    console.log(`❌ NETWORK FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  // Capture responses
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`⚠️  HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🌐 Navigating to http://192.168.2.73:30002...');
    
    // Navigate with a more lenient wait condition
    await page.goto('http://192.168.2.73:30002', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check if there's any visible content
    const bodyText = await page.textContent('body');
    console.log(`📝 Body content (first 200 chars): ${bodyText.substring(0, 200)}...`);
    
    // Check for specific elements
    const hasNavigation = await page.locator('.MuiList-root').count();
    console.log(`🧭 Navigation elements found: ${hasNavigation}`);
    
    const hasTitle = await page.locator('h1, h4, [data-testid="app-title"]').count();
    console.log(`📋 Title elements found: ${hasTitle}`);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'manual-test-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as manual-test-screenshot.png');
    
    // Wait for any additional loading
    console.log('⏳ Waiting 10 seconds to observe behavior...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    
    // Take screenshot of error state
    try {
      await page.screenshot({ 
        path: 'manual-test-error-screenshot.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved as manual-test-error-screenshot.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
  }
  
  await browser.close();
  console.log('🏁 Manual test completed');
}

testServer().catch(console.error);
