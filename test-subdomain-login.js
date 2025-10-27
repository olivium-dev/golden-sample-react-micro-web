const { chromium } = require('playwright');

async function testSubdomainLogin() {
  console.log('🧪 Testing login at https://golden-sample.dev-creamat.fds-1.com/');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown error'
    });
  });
  
  const issues = [];
  
  try {
    console.log('📍 Step 1: Navigating to subdomain...');
    await page.goto('https://golden-sample.dev-creamat.fds-1.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for any async loading
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 2: Checking page title...');
    const title = await page.title();
    console.log(`Title: ${title}`);
    
    if (!title.includes('Micro-Frontend')) {
      issues.push('❌ Page title does not contain "Micro-Frontend"');
    }
    
    console.log('📍 Step 3: Looking for login form...');
    
    // Check if login form is visible
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    const emailVisible = await emailInput.isVisible().catch(() => false);
    const passwordVisible = await passwordInput.isVisible().catch(() => false);
    const buttonVisible = await loginButton.isVisible().catch(() => false);
    
    console.log(`Email input visible: ${emailVisible}`);
    console.log(`Password input visible: ${passwordVisible}`);
    console.log(`Login button visible: ${buttonVisible}`);
    
    if (!emailVisible) {
      issues.push('❌ Email input field not found or not visible');
    }
    if (!passwordVisible) {
      issues.push('❌ Password input field not found or not visible');
    }
    if (!buttonVisible) {
      issues.push('❌ Login button not found or not visible');
    }
    
    if (emailVisible && passwordVisible && buttonVisible) {
      console.log('📍 Step 4: Attempting login...');
      
      await emailInput.fill('admin@example.com');
      await passwordInput.fill('admin123');
      
      console.log('📍 Step 5: Clicking login button...');
      await loginButton.click();
      
      // Wait for potential navigation or loading
      await page.waitForTimeout(5000);
      
      console.log('📍 Step 6: Checking post-login state...');
      
      // Check if we're still on login page or if we've progressed
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Look for signs of successful login
      const userManagementVisible = await page.locator('text=User Management').isVisible().catch(() => false);
      const dataGridVisible = await page.locator('text=Data Grid').isVisible().catch(() => false);
      const analyticsVisible = await page.locator('text=Analytics').isVisible().catch(() => false);
      const settingsVisible = await page.locator('text=Settings').isVisible().catch(() => false);
      
      console.log(`User Management visible: ${userManagementVisible}`);
      console.log(`Data Grid visible: ${dataGridVisible}`);
      console.log(`Analytics visible: ${analyticsVisible}`);
      console.log(`Settings visible: ${settingsVisible}`);
      
      if (!userManagementVisible && !dataGridVisible && !analyticsVisible && !settingsVisible) {
        issues.push('❌ No micro-frontend navigation tabs visible after login');
      }
      
      // Test clicking on a micro-frontend if available
      if (userManagementVisible) {
        console.log('📍 Step 7: Testing User Management navigation...');
        await page.locator('text=User Management').click();
        await page.waitForTimeout(3000);
        
        const userMgmtContent = await page.locator('text=User Management App').isVisible().catch(() => false);
        if (!userMgmtContent) {
          issues.push('❌ User Management micro-frontend content not loading after click');
        }
      }
    }
    
    console.log('📍 Step 8: Checking for console errors...');
    if (consoleErrors.length > 0) {
      issues.push(`❌ Console errors detected: ${consoleErrors.length} errors`);
      consoleErrors.forEach((error, index) => {
        console.log(`   Error ${index + 1}: ${error}`);
      });
    }
    
    console.log('📍 Step 9: Checking for network errors...');
    if (networkErrors.length > 0) {
      issues.push(`❌ Network request failures: ${networkErrors.length} failures`);
      networkErrors.forEach((error, index) => {
        console.log(`   Network Error ${index + 1}: ${error.url} - ${error.failure}`);
      });
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'subdomain-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as subdomain-test-screenshot.png');
    
  } catch (error) {
    issues.push(`❌ Critical error during test: ${error.message}`);
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
  
  return {
    issues,
    consoleErrors,
    networkErrors
  };
}

// Run the test
(async () => {
  const results = await testSubdomainLogin();
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SUBDOMAIN LOGIN TEST RESULTS');
  console.log('='.repeat(60));
  
  if (results.issues.length === 0) {
    console.log('✅ NO ISSUES FOUND - Login test passed!');
  } else {
    console.log(`❌ FOUND ${results.issues.length} ISSUES:`);
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  if (results.consoleErrors.length > 0) {
    console.log('\n📋 CONSOLE ERRORS:');
    results.consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (results.networkErrors.length > 0) {
    console.log('\n🌐 NETWORK ERRORS:');
    results.networkErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.url} - ${error.failure}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
})();
