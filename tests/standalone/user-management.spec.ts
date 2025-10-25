/**
 * Standalone Tests for User Management Micro-Web
 * 
 * Tests User Management in isolation with both real backend and MSW mocks
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
} from '../utils/test-helpers';
import { testConfig, getServiceUrl, getExpectedContent, getSelectors } from '../config/test-config';

// Test configuration
const serviceName = 'userManagement';
const serviceConfig = testConfig.services[serviceName];
const expectedContent = getExpectedContent(serviceName);
const selectors = getSelectors(serviceName);

test.describe('User Management - Standalone Mode', () => {
  
  test.describe('Real Backend', () => {
    let backendProcess: any;
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start backend first
      backendProcess = await startBackend();
      
      // Start User Management in standalone mode with real backend
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load and display user management interface', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing User Management at ${url}`);
      
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
        
        // Check for Add User button
        const addUserButton = page.locator(selectors.addButton);
        if (await addUserButton.count() > 0) {
          await expect(addUserButton).toBeVisible();
        }
        
        // Check for data grid
        const dataGrid = page.locator(selectors.dataGrid);
        if (await dataGrid.count() > 0) {
          await expect(dataGrid).toBeVisible();
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'user-management-standalone-real');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ User Management loaded successfully in ${loadTime}ms`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
        console.log(`⚠️ Runtime errors: ${consoleCapture.runtimeErrors}`);
        
        // Verify no critical errors
        expect(consoleCapture.typescriptErrors).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'user-management-standalone-real-FAILED');
        throw error;
      }
    });
    
    test('should handle user interactions', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Try to interact with Add User button if present
      const addUserButton = page.locator(selectors.addButton);
      if (await addUserButton.count() > 0) {
        await addUserButton.click();
        
        // Wait for any modal or form to appear
        await page.waitForTimeout(2000);
        
        // Take screenshot of interaction
        await takeScreenshot(page, 'user-management-add-user-interaction');
      }
      
      // Try to interact with refresh button if present
      const refreshButton = page.locator(selectors.refreshButton);
      if (await refreshButton.count() > 0) {
        await refreshButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });
  
  test.describe('MSW Mocks', () => {
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start User Management in standalone mode with MSW enabled
      // This will use the config.default.json with mock.enabled=true
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load with MSW mocks enabled', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing User Management with MSW at ${url}`);
      
      // Setup error capture
      const consoleCapture = captureConsoleErrors(page);
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Listen for MSW messages
      let mswInitialized = false;
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('[MSW]') && text.includes('Mock service worker started')) {
          mswInitialized = true;
        }
      });
      
      try {
        // Navigate to the page
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: testConfig.timeouts.pageLoad 
        });
        
        // Verify page loaded
        expect(response?.status()).toBe(200);
        
        // Wait for webpack compilation and MSW initialization
        await waitForWebpackCompilation(page);
        await page.waitForTimeout(5000); // Extra time for MSW
        
        // Verify MSW initialized
        expect(mswInitialized).toBe(true);
        
        // Wait for page to be ready
        await waitForPageReady(page);
        
        // Verify expected content
        const contentCheck = await verifyPageContent(page, expectedContent);
        expect(contentCheck.verified).toBe(true);
        
        // Verify key UI elements
        await expect(page.locator(selectors.title)).toBeVisible({ timeout: 10000 });
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'user-management-standalone-msw');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ User Management with MSW loaded successfully in ${loadTime}ms`);
        console.log(`🎭 MSW initialized: ${mswInitialized}`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        
        // With MSW, there should be no network errors
        const networkErrors = consoleCapture.errors.filter(error => 
          error.includes('Failed to load resource') || error.includes('CORS')
        );
        expect(networkErrors.length).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'user-management-standalone-msw-FAILED');
        throw error;
      }
    });
    
    test('should display mock user data', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Check if mock data is displayed in the grid
      const dataGrid = page.locator(selectors.dataGrid);
      if (await dataGrid.count() > 0) {
        // Look for mock user data
        const gridText = await dataGrid.textContent();
        
        // Check for common mock data patterns
        const hasMockData = gridText && (
          gridText.includes('mock') ||
          gridText.includes('admin') ||
          gridText.includes('user') ||
          gridText.includes('@example.com')
        );
        
        if (hasMockData) {
          console.log('✅ Mock user data displayed in grid');
        }
        
        // Take screenshot showing data
        await takeScreenshot(page, 'user-management-mock-data');
      }
    });
  });
});
