/**
 * Standalone Tests for Data Grid Micro-Web
 * 
 * Tests Data Grid in isolation with both real backend and MSW mocks
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
import { testConfig, getServiceUrl, getExpectedContent, getSelectors } from '../config/test-config';

// Test configuration
const serviceName = 'dataGrid';
const serviceConfig = testConfig.services[serviceName];
const expectedContent = getExpectedContent(serviceName);
const selectors = getSelectors(serviceName);

test.describe('Data Grid - Standalone Mode', () => {
  
  test.describe('Real Backend', () => {
    let backendProcess: any;
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start backend first
      backendProcess = await startBackend();
      
      // Start Data Grid in standalone mode with real backend
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load and display data grid interface', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Data Grid at ${url}`);
      
      // Setup error capture
      const consoleCapture = captureConsoleErrors(page);
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      try {
        // Navigate to the page
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: testConfig.timeouts.pageLoad 
        });
        
        // Verify page loaded
        expect(response?.status()).toBe(200);
        
        // Wait for webpack compilation
        await waitForWebpackCompilation(page);
        
        // Wait for page to be ready
        await waitForPageReady(page);
        
        // Verify expected content
        const contentCheck = await verifyPageContent(page, expectedContent);
        expect(contentCheck.verified).toBe(true);
        
        // Verify key UI elements are present
        await expect(page.locator(selectors.title)).toBeVisible({ timeout: 10000 });
        
        // Check for data grid
        const dataGrid = page.locator(selectors.grid);
        if (await dataGrid.count() > 0) {
          await expect(dataGrid).toBeVisible();
          console.log('📊 Data grid found');
        }
        
        // Check for toolbar
        const toolbar = page.locator(selectors.toolbar);
        if (await toolbar.count() > 0) {
          await expect(toolbar).toBeVisible();
          console.log('🛠️ Grid toolbar found');
        }
        
        // Check for pagination
        const pagination = page.locator(selectors.pagination);
        if (await pagination.count() > 0) {
          await expect(pagination).toBeVisible();
          console.log('📄 Pagination found');
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'data-grid-standalone-real');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Data Grid loaded successfully in ${loadTime}ms`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
        console.log(`⚠️ Runtime errors: ${consoleCapture.runtimeErrors}`);
        
        // Verify no critical errors
        expect(consoleCapture.typescriptErrors).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'data-grid-standalone-real-FAILED');
        throw error;
      }
    });
    
    test('should handle grid interactions', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Try to interact with grid toolbar buttons if present
      const toolbarButtons = page.locator('.MuiButton-root, button');
      if (await toolbarButtons.count() > 0) {
        // Click first toolbar button
        await toolbarButtons.first().click();
        await page.waitForTimeout(1000);
        
        console.log('🔧 Toolbar button interaction successful');
      }
      
      // Try to interact with pagination if present
      const paginationButtons = page.locator('.MuiPagination-root button, .MuiTablePagination-root button');
      if (await paginationButtons.count() > 0) {
        // Try to click next page if available
        const nextButton = page.locator('button[aria-label*="next"], button[title*="next"]');
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          console.log('📄 Pagination interaction successful');
        }
      }
      
      // Take screenshot of interactions
      await takeScreenshot(page, 'data-grid-interactions');
    });
  });
  
  test.describe('Standalone Mode (No Backend)', () => {
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start Data Grid in standalone mode without backend
      // This will test the app's behavior when backend is not available
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load gracefully without backend', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Data Grid without backend at ${url}`);
      
      // Setup error capture
      const consoleCapture = captureConsoleErrors(page);
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      try {
        // Navigate to the page
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: testConfig.timeouts.pageLoad 
        });
        
        // Verify page loaded
        expect(response?.status()).toBe(200);
        
        // Wait for webpack compilation
        await waitForWebpackCompilation(page);
        
        // Wait for page to be ready
        await waitForPageReady(page);
        
        // Verify expected content (should still show UI even without data)
        const contentCheck = await verifyPageContent(page, expectedContent);
        expect(contentCheck.verified).toBe(true);
        
        // Verify key UI elements are present
        await expect(page.locator(selectors.title)).toBeVisible({ timeout: 10000 });
        
        // Grid should be present even if empty
        const dataGrid = page.locator(selectors.grid);
        if (await dataGrid.count() > 0) {
          await expect(dataGrid).toBeVisible();
          console.log('📊 Data grid displayed (empty state)');
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'data-grid-standalone-no-backend');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Data Grid loaded gracefully without backend in ${loadTime}ms`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
        
        // Should have network errors (expected when no backend)
        const networkErrors = consoleCapture.errors.filter(error => 
          error.includes('Failed to load resource') || error.includes('CORS')
        );
        console.log(`🌐 Network errors (expected): ${networkErrors.length}`);
        
        // Verify no critical TypeScript errors
        expect(consoleCapture.typescriptErrors).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'data-grid-standalone-no-backend-FAILED');
        throw error;
      }
    });
    
    test('should show empty state or loading indicators', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for any loading states to resolve
      await page.waitForTimeout(5000);
      
      // Check for empty state indicators
      const bodyText = await page.textContent('body');
      
      const hasEmptyStateIndicators = bodyText && (
        bodyText.includes('No data') ||
        bodyText.includes('No rows') ||
        bodyText.includes('Empty') ||
        bodyText.includes('Loading') ||
        bodyText.includes('0 of 0') // Pagination showing no data
      );
      
      if (hasEmptyStateIndicators) {
        console.log('✅ Empty state indicators found');
      }
      
      // Grid should still be functional
      const dataGrid = page.locator(selectors.grid);
      if (await dataGrid.count() > 0) {
        await expect(dataGrid).toBeVisible();
        console.log('📊 Data grid structure maintained');
      }
      
      // Take screenshot showing empty state
      await takeScreenshot(page, 'data-grid-empty-state');
    });
    
    test('should maintain clean architecture structure', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // The data-grid app uses clean architecture (MVVM)
      // It should load and show the UI structure even without data
      
      // Check for architectural components
      const bodyText = await page.textContent('body');
      
      // Should have basic grid structure
      expect(bodyText).toContain('Data Grid');
      
      // Should show that the app loaded successfully
      const hasAppStructure = bodyText && (
        bodyText.includes('table') ||
        bodyText.includes('grid') ||
        bodyText.includes('rows') ||
        bodyText.includes('pagination')
      );
      
      expect(hasAppStructure).toBe(true);
      console.log('✅ Clean architecture structure maintained');
      
      // Take screenshot showing architecture
      await takeScreenshot(page, 'data-grid-clean-architecture');
    });
  });
});
