const { chromium } = require('playwright');

async function validateTraefikDeployment(baseURL) {
  console.log(`Validating Traefik deployment at ${baseURL}...`);
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    dashboard: false,
    api: false,
    container: false,
    userManagement: false,
    dataGrid: false,
    analytics: false,
    settings: false,
    moduleFederation: false,
    cors: false
  };
  
  try {
    // Test Traefik dashboard
    const dashResponse = await page.request.get(`${baseURL}:8080`);
    results.dashboard = dashResponse.ok();
    
    // Test API
    const apiResponse = await page.request.get(`${baseURL}:8090/api/health`);
    results.api = apiResponse.ok();
    results.cors = apiResponse.headers()['access-control-allow-origin'] !== undefined;
    
    // Test container app with authentication
    await page.goto(`${baseURL}:8090`);
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    results.container = await page.locator('.MuiAppBar-root').isVisible();
    
    // Test Module Federation by navigating to each micro-frontend
    await page.click('text=User Management');
    await page.waitForTimeout(2000);
    results.userManagement = await page.locator('.MuiDrawer-root').isVisible();
    
    await page.click('text=Data Grid');
    await page.waitForTimeout(2000);
    results.dataGrid = await page.locator('.MuiDrawer-root').isVisible();
    
    await page.click('text=Analytics');
    await page.waitForTimeout(2000);
    results.analytics = await page.locator('.MuiDrawer-root').isVisible();
    
    await page.click('text=Settings');
    await page.waitForTimeout(2000);
    results.settings = await page.locator('.MuiDrawer-root').isVisible();
    
    results.moduleFederation = results.userManagement && results.dataGrid && 
                               results.analytics && results.settings;
    
    await page.screenshot({ path: 'traefik-validation.png', fullPage: true });
    
  } catch (error) {
    console.error('Validation error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Print results
  console.log('\n=== VALIDATION RESULTS ===');
  console.log(`Dashboard:          ${results.dashboard ? '✓' : '✗'}`);
  console.log(`API:                ${results.api ? '✓' : '✗'}`);
  console.log(`CORS:               ${results.cors ? '✓' : '✗'}`);
  console.log(`Container App:      ${results.container ? '✓' : '✗'}`);
  console.log(`User Management:    ${results.userManagement ? '✓' : '✗'}`);
  console.log(`Data Grid:          ${results.dataGrid ? '✓' : '✗'}`);
  console.log(`Analytics:          ${results.analytics ? '✓' : '✗'}`);
  console.log(`Settings:           ${results.settings ? '✓' : '✗'}`);
  console.log(`Module Federation:  ${results.moduleFederation ? '✓' : '✗'}`);
  
  const allPassed = Object.values(results).every(v => v === true);
  console.log(`\nOVERALL: ${allPassed ? '✓ PASS' : '✗ FAIL'}`);
  
  return allPassed;
}

// Run for both local and VPS
(async () => {
  const local = await validateTraefikDeployment('http://localhost');
  const vps = await validateTraefikDeployment('http://192.168.2.73');
  
  process.exit(local && vps ? 0 : 1);
})();

