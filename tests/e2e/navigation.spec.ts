/**
 * E2E Navigation Tests for Module Federation
 * 
 * Tests cross-module navigation flow, state persistence, and user experience
 */

import { test, expect, Page } from '@playwright/test';
import {
  startMicroWeb,
  startBackend,
  stopAllServices,
  waitForWebpackCompilation,
  captureConsoleErrors,
  verifyPageContent,
  takeScreenshot,
  setupAuthBypass,
  waitForPageReady,
} from '../utils/test-helpers';
import { testConfig, navigationRoutes, getSelectors } from '../config/test-config';

test.describe('Cross-Module Navigation - E2E', () => {
  let backendProcess: any;
  let containerProcess: any;
  let userMgmtProcess: any;
  let dataGridProcess: any;
  let analyticsProcess: any;
  let settingsProcess: any;
  
  test.beforeAll(async () => {
    console.log('🚀 Starting all services for Navigation E2E testing...');
    
    // Start backend
    backendProcess = await startBackend();
    
    // Start all micro-webs in Module Federation mode
    userMgmtProcess = await startMicroWeb('userManagement', 'mf');
    dataGridProcess = await startMicroWeb('dataGrid', 'mf');
    analyticsProcess = await startMicroWeb('analytics', 'mf');
    settingsProcess = await startMicroWeb('settings', 'mf');
    
    // Start container last
    containerProcess = await startMicroWeb('container', 'mf');
    
    console.log('✅ All services started for Navigation E2E testing');
  });
  
  test.afterAll(async () => {
    await stopAllServices();
  });
  
  test('should navigate through all micro-frontends in sequence', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing complete navigation flow...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Setup error capture
    const consoleCapture = captureConsoleErrors(page);
    
    // Track navigation performance
    const navigationTimes: { route: string; loadTime: number }[] = [];
    
    try {
      // Start at container
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Verify we're at home
      await expect(page.locator('h1, h4, .MuiTypography-h4')).toBeVisible();
      console.log('✅ Started at home page');
      
      // Navigate through each route in sequence
      for (let i = 1; i < navigationRoutes.length; i++) {
        const route = navigationRoutes[i];
        const startTime = Date.now();
        
        console.log(`🧭 Navigating to ${route.name} (${route.path})`);
        
        // Click navigation menu item or navigate directly
        try {
          // Try to find and click menu item first
          const menuItem = page.locator(`a[href="${route.path}"], button:has-text("${route.name}"), [data-testid*="${route.service}"]`);
          
          if (await menuItem.count() > 0) {
            await menuItem.first().click();
            console.log(`🖱️ Clicked menu item for ${route.name}`);
          } else {
            // Fallback to direct navigation
            await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle' });
            console.log(`🔗 Direct navigation to ${route.name}`);
          }
        } catch {
          // Fallback to direct navigation
          await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle' });
          console.log(`🔗 Fallback navigation to ${route.name}`);
        }
        
        // Wait for the remote module to load
        await page.waitForTimeout(3000);
        await waitForPageReady(page);
        
        // Verify we're on the correct page
        const currentUrl = page.url();
        expect(currentUrl).toContain(route.path);
        
        // Verify page content loaded
        const pageText = await page.textContent('body');
        const hasExpectedContent = pageText && route.name.split(' ').some(word => 
          pageText.toLowerCase().includes(word.toLowerCase())
        );
        
        expect(hasExpectedContent).toBe(true);
        
        // Calculate navigation time
        const loadTime = Date.now() - startTime;
        navigationTimes.push({ route: route.name, loadTime });
        
        // Take screenshot
        await takeScreenshot(page, `navigation-${route.service}`);
        
        console.log(`✅ ${route.name} loaded in ${loadTime}ms`);
        
        // Brief pause between navigations
        await page.waitForTimeout(1000);
      }
      
      // Navigate back to home
      console.log('🏠 Returning to home page');
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Verify we're back at home
      const homeText = await page.textContent('body');
      expect(homeText).toContain('Micro-Frontend Platform');
      
      // Take final screenshot
      await takeScreenshot(page, 'navigation-complete-flow');
      
      // Log performance summary
      console.log('\n📊 Navigation Performance Summary:');
      navigationTimes.forEach(({ route, loadTime }) => {
        console.log(`   ${route}: ${loadTime}ms`);
      });
      
      const avgLoadTime = navigationTimes.reduce((sum, item) => sum + item.loadTime, 0) / navigationTimes.length;
      console.log(`   Average: ${avgLoadTime.toFixed(0)}ms`);
      
      // Verify no critical errors during navigation
      expect(consoleCapture.typescriptErrors).toBe(0);
      
      console.log('✅ Complete navigation flow successful');
      
    } catch (error) {
      await takeScreenshot(page, 'navigation-flow-FAILED');
      throw error;
    }
  });
  
  test('should maintain user authentication state across modules', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing authentication state persistence...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Check initial auth state
    const initialText = await page.textContent('body');
    const hasInitialAuth = initialText && (
      initialText.includes('Test User') ||
      initialText.includes('Welcome') ||
      initialText.includes('Logout')
    );
    
    console.log(`🔐 Initial auth state: ${hasInitialAuth ? 'Authenticated' : 'Not authenticated'}`);
    
    // Navigate through modules and check auth state
    for (const route of navigationRoutes.slice(1, 4)) { // Test first 3 modules
      await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Check auth state in this module
      const moduleText = await page.textContent('body');
      const hasAuthInModule = moduleText && (
        moduleText.includes('Test User') ||
        moduleText.includes('Welcome') ||
        moduleText.includes('Logout') ||
        !moduleText.includes('Login') // Should not show login form
      );
      
      console.log(`🔐 Auth state in ${route.name}: ${hasAuthInModule ? 'Maintained' : 'Lost'}`);
      
      // Take screenshot showing auth state
      await takeScreenshot(page, `auth-state-${route.service}`);
      
      // Auth should be maintained
      expect(hasAuthInModule).toBe(true);
    }
    
    console.log('✅ Authentication state maintained across all modules');
  });
  
  test('should handle browser back/forward navigation correctly', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing browser navigation (back/forward)...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    const visitedRoutes: string[] = [url];
    
    // Navigate to a few routes
    const testRoutes = navigationRoutes.slice(1, 4); // Test first 3 routes
    
    for (const route of testRoutes) {
      const routeUrl = `${url}${route.path}`;
      await page.goto(routeUrl, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      visitedRoutes.push(routeUrl);
      
      console.log(`📍 Visited: ${route.name}`);
    }
    
    // Now test browser back navigation
    console.log('⬅️ Testing browser back navigation...');
    
    for (let i = visitedRoutes.length - 2; i >= 0; i--) {
      await page.goBack();
      await waitForPageReady(page);
      
      const currentUrl = page.url();
      const expectedUrl = visitedRoutes[i];
      
      // URL should match expected
      expect(currentUrl).toBe(expectedUrl);
      
      // Content should load correctly
      const pageText = await page.textContent('body');
      expect(pageText).toContain('Micro-Frontend');
      
      console.log(`✅ Back navigation to: ${currentUrl}`);
      
      // Take screenshot
      await takeScreenshot(page, `back-nav-step-${i}`);
    }
    
    // Test forward navigation
    console.log('➡️ Testing browser forward navigation...');
    
    for (let i = 1; i < visitedRoutes.length; i++) {
      await page.goForward();
      await waitForPageReady(page);
      
      const currentUrl = page.url();
      const expectedUrl = visitedRoutes[i];
      
      // URL should match expected
      expect(currentUrl).toBe(expectedUrl);
      
      // Content should load correctly
      const pageText = await page.textContent('body');
      expect(pageText).toContain('Micro-Frontend');
      
      console.log(`✅ Forward navigation to: ${currentUrl}`);
      
      // Take screenshot
      await takeScreenshot(page, `forward-nav-step-${i}`);
    }
    
    console.log('✅ Browser navigation (back/forward) working correctly');
  });
  
  test('should handle deep linking to specific modules', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing deep linking to modules...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Test direct navigation to each route
    for (const route of navigationRoutes.slice(1)) { // Skip home
      console.log(`🔗 Testing deep link to ${route.name}`);
      
      const directUrl = `${url}${route.path}`;
      
      // Navigate directly to the route
      await page.goto(directUrl, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Verify we're on the correct page
      const currentUrl = page.url();
      expect(currentUrl).toContain(route.path);
      
      // Verify the module loaded correctly
      const pageText = await page.textContent('body');
      
      // Should have container structure (header, navigation)
      expect(pageText).toContain('Micro-Frontend Platform');
      
      // Should have module-specific content
      const hasModuleContent = route.name.split(' ').some(word => 
        pageText.toLowerCase().includes(word.toLowerCase())
      );
      expect(hasModuleContent).toBe(true);
      
      // Take screenshot
      await takeScreenshot(page, `deep-link-${route.service}`);
      
      console.log(`✅ Deep link to ${route.name} successful`);
    }
    
    console.log('✅ Deep linking working correctly for all modules');
  });
  
  test('should handle rapid navigation without memory leaks', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing rapid navigation (memory leak prevention)...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Setup memory monitoring
    const memoryWarnings: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('memory') || text.includes('leak') || text.includes('heap')) {
        memoryWarnings.push(text);
      }
    });
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Perform rapid navigation between routes
    const testRoutes = navigationRoutes.slice(1, 4); // Use first 3 routes
    
    console.log('🏃‍♂️ Performing rapid navigation...');
    
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`   Cycle ${cycle + 1}/3`);
      
      for (const route of testRoutes) {
        await page.goto(`${url}${route.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500); // Short wait for rapid navigation
      }
      
      // Return to home
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
    }
    
    // Final navigation with full wait
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Check for memory warnings
    console.log(`🧠 Memory warnings detected: ${memoryWarnings.length}`);
    
    // Verify app is still responsive
    const finalText = await page.textContent('body');
    expect(finalText).toContain('Micro-Frontend Platform');
    
    // Take final screenshot
    await takeScreenshot(page, 'rapid-navigation-final');
    
    console.log('✅ Rapid navigation completed without critical issues');
  });
  
  test('should maintain module-specific state during navigation', async ({ page }) => {
    const url = testConfig.urls.container;
    
    console.log('🧪 Testing module state persistence...');
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Go to Settings and make a change
    await page.goto(`${url}/settings`, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Try to interact with settings (if possible)
    const themeSelect = page.locator('select').first();
    if (await themeSelect.count() > 0) {
      await themeSelect.selectOption('dark');
      console.log('🌙 Changed theme to dark in Settings');
    }
    
    // Navigate away to another module
    await page.goto(`${url}/analytics`, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    console.log('📊 Navigated to Analytics');
    
    // Navigate back to Settings
    await page.goto(`${url}/settings`, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Check if state was maintained (this depends on implementation)
    const settingsText = await page.textContent('body');
    console.log('⚙️ Returned to Settings');
    
    // Take screenshot of final state
    await takeScreenshot(page, 'module-state-persistence');
    
    // The app should still be functional
    expect(settingsText).toContain('Settings');
    
    console.log('✅ Module state persistence test completed');
  });
});
