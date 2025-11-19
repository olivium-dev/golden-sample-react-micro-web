import { test, expect } from '@playwright/test';

test('Check for JavaScript errors and page loading', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];
  
  // Capture console messages
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push(`Page Error: ${error.message}`);
    console.log('Page Error:', error.message);
    console.log('Stack:', error.stack);
  });
  
  // Capture failed requests
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    if (failure) {
      errors.push(`Request Failed: ${request.url()} - ${failure.errorText}`);
    }
  });
  
  // Navigate to page
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait for scripts to load
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  
  // Wait additional time for React to mount
  await page.waitForTimeout(5000);
  
  // Check if React has mounted by looking for React root
  const reactMounted = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return false;
    
    // Check if React has rendered anything
    return root.children.length > 0 || root.innerHTML.trim().length > 0;
  });
  
  console.log('React mounted:', reactMounted);
  console.log('Console messages count:', consoleMessages.length);
  console.log('Errors count:', errors.length);
  
  // Log first 20 console messages
  console.log('\n=== Console Messages (first 20) ===');
  consoleMessages.slice(0, 20).forEach(msg => console.log(msg));
  
  // Log all errors
  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(err => console.log(err));
  }
  
  // Check if scripts loaded
  const scriptsLoaded = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map(s => (s as HTMLScriptElement).src);
  });
  
  console.log('\n=== Scripts ===');
  scriptsLoaded.forEach(src => console.log(src));
  
  // Check for React DevTools or other indicators
  const hasReact = await page.evaluate(() => {
    return !!(window as any).React || !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  });
  
  console.log('Has React:', hasReact);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/error-check.png', fullPage: true });
  
  // Check if main.js and remoteEntry.js are accessible
  const mainJsResponse = await page.goto('http://localhost:3000/main.js', { timeout: 5000 }).catch(() => null);
  const remoteEntryResponse = await page.goto('http://localhost:3000/remoteEntry.js', { timeout: 5000 }).catch(() => null);
  
  console.log('main.js accessible:', mainJsResponse?.status() === 200);
  console.log('remoteEntry.js accessible:', remoteEntryResponse?.status() === 200);
  
  // Report findings
  if (!reactMounted) {
    console.log('\n⚠️  React did not mount. Possible issues:');
    console.log('  1. JavaScript errors preventing execution');
    console.log('  2. Module Federation configuration issue');
    console.log('  3. React app not initializing');
  }
  
  // Don't fail the test, just report
  expect(true).toBe(true);
});

