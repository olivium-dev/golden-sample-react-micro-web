/**
 * E2E Tests for Container App with Module Federation
 * 
 * Tests the complete micro-frontend setup with container app loading all remote modules
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
  TestResult,
  generateTestReport,
} from '../utils/test-helpers';
import { testConfig, getServiceUrl, getExpectedContent, getSelectors, navigationRoutes } from '../config/test-config';

test.describe('Container App - Module Federation E2E', () => {
  let backendProcess: any;
  let containerProcess: any;
  let userMgmtProcess: any;
  let dataGridProcess: any;
  let analyticsProcess: any;
  let settingsProcess: any;
  
  test.beforeAll(async () => {
    console.log('🚀 Starting all services for E2E testing...');
    
    // Start backend
    backendProcess = await startBackend();
    
    // Start all micro-webs in Module Federation mode
    userMgmtProcess = await startMicroWeb('userManagement', 'mf');
    dataGridProcess = await startMicroWeb('dataGrid', 'mf');
    analyticsProcess = await startMicroWeb('analytics', 'mf');
    settingsProcess = await startMicroWeb('settings', 'mf');
    
    // Start container last
    containerProcess = await startMicroWeb('container', 'mf');
    
    console.log('✅ All services started for E2E testing');
  });
  
  test.afterAll(async () => {
    await stopAllServices();
  });
  
  test('should load container app with all remote modules', async ({ page }) => {
    const startTime = Date.now();
    const url = testConfig.urls.container;
    
    console.log(`🧪 Testing Container App with Module Federation at ${url}`);
    
    // Setup error capture
    const consoleCapture = captureConsoleErrors(page);
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Track Module Federation loading
    let moduleFederationErrors = 0;
    let remoteModulesLoaded: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      
      // Track Module Federation errors
      if (text.includes('Loading remote') || text.includes('ChunkLoadError') || text.includes('Loading chunk')) {
        if (msg.type() === 'error') {
          moduleFederationErrors++;
        }
      }
      
      // Track successful remote loads
      if (text.includes('Remote') && text.includes('loaded')) {
        remoteModulesLoaded.push(text);
      }
    });
    
    try {
      // Navigate to container
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: testConfig.timeouts.pageLoad 
      });
      
      // Verify page loaded
      expect(response?.status()).toBe(200);
      
      // Wait for webpack compilation
      await waitForWebpackCompilation(page);
      
      // Wait for container to be ready
      await waitForPageReady(page);
      
      // Verify container content
      const containerContent = getExpectedContent('container');
      const contentCheck = await verifyPageContent(page, containerContent);
      expect(contentCheck.verified).toBe(true);
      
      // Verify container UI elements
      const containerSelectors = getSelectors('container');
      await expect(page.locator(containerSelectors.title)).toBeVisible({ timeout: 15000 });
      
      // Check navigation menu
      const navigation = page.locator(containerSelectors.navigation);
      if (await navigation.count() > 0) {
        await expect(navigation).toBeVisible();
        console.log('🧭 Navigation menu found');
      }
      
      // Check menu items
      const menuItems = page.locator(containerSelectors.menuItems);
      const menuItemCount = await menuItems.count();
      console.log(`📋 Found ${menuItemCount} menu items`);
      
      // Take screenshot of container
      await takeScreenshot(page, 'container-app-loaded');
      
      // Calculate load time
      const loadTime = Date.now() - startTime;
      
      // Log success
      console.log(`✅ Container App loaded successfully in ${loadTime}ms`);
      console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
      console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
      console.log(`⚠️ Runtime errors: ${consoleCapture.runtimeErrors}`);
      console.log(`🔗 Module Federation errors: ${moduleFederationErrors}`);
      
      // Verify no critical errors
      expect(consoleCapture.typescriptErrors).toBe(0);
      expect(moduleFederationErrors).toBe(0);
      
    } catch (error) {
      // Take screenshot on failure
      await takeScreenshot(page, 'container-app-FAILED');
      throw error;
    }
  });
  
  test('should load each remote module successfully', async ({ page }) => {
    const url = testConfig.urls.container;
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    const testResults: TestResult[] = [];
    
    // Test each navigation route
    for (const route of navigationRoutes) {
      if (route.service === 'container') continue; // Skip home for now
      
      console.log(`🧪 Testing route: ${route.path} (${route.name})`);
      
      const routeStartTime = Date.now();
      
      try {
        // Setup error capture for this route
        const routeConsoleCapture = captureConsoleErrors(page);
        
        // Navigate to the route
        await page.goto(`${url}${route.path}`, { 
          waitUntil: 'networkidle',
          timeout: testConfig.timeouts.pageLoad 
        });
        
        // Wait for remote module to load
        await page.waitForTimeout(5000);
        
        // Wait for page to be ready
        await waitForPageReady(page);
        
        // Verify expected content for this service
        const expectedContent = getExpectedContent(route.service as keyof typeof testConfig.services);
        const contentCheck = await verifyPageContent(page, expectedContent);
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, `container-route-${route.service}`);
        
        // Calculate load time
        const loadTime = Date.now() - routeStartTime;
        
        // Create test result
        const result: TestResult = {
          serviceName: `Container -> ${route.name}`,
          url: `${url}${route.path}`,
          success: contentCheck.verified,
          loadTime,
          contentVerified: contentCheck.verified,
          expectedContentFound: contentCheck.found,
          consoleErrors: routeConsoleCapture.errors,
          consoleWarnings: routeConsoleCapture.warnings,
          typescriptErrors: routeConsoleCapture.typescriptErrors,
          runtimeErrors: routeConsoleCapture.runtimeErrors,
          screenshotPath,
        };
        
        testResults.push(result);
        
        // Log result
        if (contentCheck.verified) {
          console.log(`✅ ${route.name} loaded successfully in ${loadTime}ms`);
          console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        } else {
          console.log(`❌ ${route.name} failed to load properly`);
          result.error = 'Expected content not found';
        }
        
        // Verify the route loaded successfully
        expect(contentCheck.verified).toBe(true);
        
      } catch (error) {
        console.log(`❌ ${route.name} failed with error: ${error}`);
        
        // Take screenshot on failure
        await takeScreenshot(page, `container-route-${route.service}-FAILED`);
        
        // Add failed result
        testResults.push({
          serviceName: `Container -> ${route.name}`,
          url: `${url}${route.path}`,
          success: false,
          loadTime: Date.now() - routeStartTime,
          contentVerified: false,
          expectedContentFound: [],
          consoleErrors: [],
          consoleWarnings: [],
          typescriptErrors: 0,
          runtimeErrors: 1,
          error: error.toString(),
        });
        
        throw error;
      }
    }
    
    // Generate report for this test
    await generateTestReport(testResults, 'test-results/container-routes-report.json');
    
    console.log(`✅ All ${testResults.length} routes tested successfully`);
  });
  
  test('should handle Module Federation shared dependencies correctly', async ({ page }) => {
    const url = testConfig.urls.container;
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Track shared dependency loading
    const sharedDependencies: string[] = [];
    let reactSingletonWarnings = 0;
    
    page.on('console', (msg) => {
      const text = msg.text();
      
      // Track shared dependency messages
      if (text.includes('Shared module') || text.includes('singleton')) {
        sharedDependencies.push(text);
      }
      
      // Track React singleton warnings
      if (text.includes('multiple versions of React') || text.includes('React singleton')) {
        reactSingletonWarnings++;
      }
    });
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Navigate through different routes to load all remotes
    for (const route of navigationRoutes.slice(1)) { // Skip home
      await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    
    // Check for React singleton issues
    expect(reactSingletonWarnings).toBe(0);
    
    console.log(`✅ Shared dependencies handled correctly`);
    console.log(`🔗 Shared dependency messages: ${sharedDependencies.length}`);
    console.log(`⚠️ React singleton warnings: ${reactSingletonWarnings}`);
    
    // Take screenshot of final state
    await takeScreenshot(page, 'container-shared-dependencies-test');
  });
  
  test('should maintain state across route navigation', async ({ page }) => {
    const url = testConfig.urls.container;
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Check initial state (should show user info in header)
    const initialBodyText = await page.textContent('body');
    const hasUserInfo = initialBodyText && (
      initialBodyText.includes('Test User') ||
      initialBodyText.includes('test@example.com') ||
      initialBodyText.includes('Welcome')
    );
    
    if (hasUserInfo) {
      console.log('✅ User state maintained in header');
    }
    
    // Navigate through routes and verify state persistence
    for (const route of navigationRoutes.slice(1, 3)) { // Test first 2 routes
      await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Check that user info is still in header
      const routeBodyText = await page.textContent('body');
      const stillHasUserInfo = routeBodyText && (
        routeBodyText.includes('Test User') ||
        routeBodyText.includes('test@example.com') ||
        routeBodyText.includes('Welcome')
      );
      
      if (stillHasUserInfo) {
        console.log(`✅ User state maintained on ${route.name} route`);
      }
    }
    
    // Return to home
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Verify state is still there
    const finalBodyText = await page.textContent('body');
    const finalHasUserInfo = finalBodyText && (
      finalBodyText.includes('Test User') ||
      finalBodyText.includes('test@example.com') ||
      finalBodyText.includes('Welcome')
    );
    
    expect(finalHasUserInfo).toBe(true);
    
    console.log('✅ State persistence test completed');
    
    // Take screenshot of final state
    await takeScreenshot(page, 'container-state-persistence-test');
  });
  
  test('should handle remote module loading failures gracefully', async ({ page }) => {
    const url = testConfig.urls.container;
    
    // Setup auth bypass
    await setupAuthBypass(page);
    
    // Setup error capture
    const consoleCapture = captureConsoleErrors(page);
    
    // Track chunk load errors
    let chunkLoadErrors = 0;
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('ChunkLoadError') || text.includes('Loading chunk failed')) {
        chunkLoadErrors++;
      }
    });
    
    // Navigate to container
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageReady(page);
    
    // Try to navigate to all routes
    for (const route of navigationRoutes.slice(1)) {
      try {
        await page.goto(`${url}${route.path}`, { 
          waitUntil: 'networkidle',
          timeout: 15000 // Shorter timeout to catch failures faster
        });
        await page.waitForTimeout(2000);
        
        console.log(`✅ ${route.name} route handled gracefully`);
        
      } catch (error) {
        console.log(`⚠️ ${route.name} route had loading issues (expected in some cases)`);
      }
    }
    
    // The app should still be functional even if some remotes fail
    const finalBodyText = await page.textContent('body');
    expect(finalBodyText).toContain('Micro-Frontend Platform');
    
    console.log(`✅ Error handling test completed`);
    console.log(`🔗 Chunk load errors: ${chunkLoadErrors}`);
    console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
    
    // Take screenshot of error handling
    await takeScreenshot(page, 'container-error-handling-test');
  });
});
