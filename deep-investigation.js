const { chromium } = require('playwright');

async function deepInvestigation() {
  console.log('🔍 DEEP INVESTIGATION: API URL Detection');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  // Capture all network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('30001')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  try {
    console.log('📍 Step 1: Navigate to subdomain...');
    await page.goto('https://golden-sample.dev-creamat.fds-1.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for initial loading
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 2: Inject debug script to check API URL detection...');
    const apiUrlInfo = await page.evaluate(() => {
      // Check what the getApiUrl function returns
      function getApiUrl() {
        if (typeof window !== 'undefined') {
          const globalConfig = window.__APP_CONFIG__;
          if (globalConfig && globalConfig.apiUrl) {
            return `GLOBAL_CONFIG: ${globalConfig.apiUrl}`;
          }
          const currentHost = window.location.host;
          if (currentHost === 'golden-sample.dev-creamat.fds-1.com') {
            return `SUBDOMAIN_MATCH: https://golden-sample.dev-creamat.fds-1.com`;
          } else if (currentHost.includes('dev-creamat.fds-1.com')) {
            return `MAIN_DOMAIN_MATCH: https://dev-creamat.fds-1.com`;
          } else if (currentHost.includes('192.168.2.73')) {
            return `IP_MATCH: http://192.168.2.73:30001`;
          } else if (currentHost.includes('localhost')) {
            return `LOCALHOST_MATCH: http://localhost:30001`;
          }
        }
        return `FALLBACK: http://localhost:30001`;
      }
      
      return {
        windowLocation: {
          host: window.location.host,
          hostname: window.location.hostname,
          href: window.location.href,
          origin: window.location.origin
        },
        detectedApiUrl: getApiUrl(),
        globalConfig: window.__APP_CONFIG__ || 'NOT_SET',
        userAgent: navigator.userAgent
      };
    });
    
    console.log('📊 API URL Detection Results:');
    console.log(JSON.stringify(apiUrlInfo, null, 2));
    
    console.log('📍 Step 3: Check what axios instance is using...');
    const axiosInfo = await page.evaluate(() => {
      // Try to access the axios instance if it's available globally
      if (window.axios) {
        return {
          baseURL: window.axios.defaults.baseURL,
          defaults: window.axios.defaults
        };
      }
      return 'AXIOS_NOT_GLOBAL';
    });
    
    console.log('📊 Axios Configuration:');
    console.log(JSON.stringify(axiosInfo, null, 2));
    
    console.log('📍 Step 4: Trigger an API call to see what URL is used...');
    // Try to trigger login to see the actual API call
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('admin@example.com');
      await passwordInput.fill('admin123');
      await loginButton.click();
      
      // Wait for API call
      await page.waitForTimeout(2000);
    }
    
    console.log('📍 Step 5: Check for any runtime API URL changes...');
    const runtimeApiUrl = await page.evaluate(() => {
      // Check if there are any global variables or functions that show the current API URL
      const possibleApiUrls = [];
      
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && (value.includes('api') || value.includes('30001'))) {
          possibleApiUrls.push(`localStorage.${key}: ${value}`);
        }
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (value && (value.includes('api') || value.includes('30001'))) {
          possibleApiUrls.push(`sessionStorage.${key}: ${value}`);
        }
      }
      
      return possibleApiUrls;
    });
    
    console.log('📊 Runtime API URLs found:');
    console.log(runtimeApiUrl);
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 NETWORK REQUESTS SUMMARY');
  console.log('='.repeat(60));
  
  networkRequests.forEach((req, index) => {
    console.log(`${index + 1}. ${req.method} ${req.url}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONSOLE LOGS SUMMARY (First 10)');
  console.log('='.repeat(60));
  
  consoleLogs.slice(0, 10).forEach((log, index) => {
    console.log(`${index + 1}. [${log.type}] ${log.text}`);
  });
  
  return {
    networkRequests,
    consoleLogs
  };
}

// Run the investigation
(async () => {
  await deepInvestigation();
})();
