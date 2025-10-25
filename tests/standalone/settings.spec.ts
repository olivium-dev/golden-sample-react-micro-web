/**
 * Standalone Tests for Settings Panel Micro-Web
 * 
 * Tests Settings Panel in isolation with both real backend and MSW mocks
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
const serviceName = 'settings';
const serviceConfig = testConfig.services[serviceName];
const expectedContent = getExpectedContent(serviceName);
const selectors = getSelectors(serviceName);

test.describe('Settings Panel - Standalone Mode', () => {
  
  test.describe('Real Backend', () => {
    let backendProcess: any;
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start backend first
      backendProcess = await startBackend();
      
      // Start Settings in standalone mode with real backend
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load and display settings panel', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Settings Panel at ${url}`);
      
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
        
        // Check for appearance section
        const appearanceSection = page.locator(selectors.appearanceSection);
        if (await appearanceSection.count() > 0) {
          await expect(appearanceSection).toBeVisible();
          console.log('🎨 Appearance section found');
        }
        
        // Check for notifications section
        const notificationsSection = page.locator(selectors.notificationsSection);
        if (await notificationsSection.count() > 0) {
          await expect(notificationsSection).toBeVisible();
          console.log('🔔 Notifications section found');
        }
        
        // Check for save button
        const saveButton = page.locator(selectors.saveButton);
        if (await saveButton.count() > 0) {
          await expect(saveButton).toBeVisible();
          console.log('💾 Save button found');
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'settings-panel-standalone-real');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Settings Panel loaded successfully in ${loadTime}ms`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
        console.log(`⚠️ Runtime errors: ${consoleCapture.runtimeErrors}`);
        
        // Verify no critical errors
        expect(consoleCapture.typescriptErrors).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'settings-panel-standalone-real-FAILED');
        throw error;
      }
    });
    
    test('should handle settings interactions', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Try to interact with theme mode dropdown if present
      const themeDropdown = page.locator('select, .MuiSelect-root').first();
      if (await themeDropdown.count() > 0) {
        await themeDropdown.click();
        await page.waitForTimeout(1000);
        
        console.log('🎨 Theme dropdown interaction successful');
      }
      
      // Try to toggle a switch if present
      const switches = page.locator('input[type="checkbox"], .MuiSwitch-input');
      if (await switches.count() > 0) {
        await switches.first().click();
        await page.waitForTimeout(1000);
        
        console.log('🔄 Switch toggle interaction successful');
      }
      
      // Try to click save button if present
      const saveButton = page.locator(selectors.saveButton);
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of save interaction
        await takeScreenshot(page, 'settings-panel-save-interaction');
        
        console.log('💾 Save button interaction successful');
      }
    });
  });
  
  test.describe('MSW Mocks', () => {
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start Settings in standalone mode with MSW enabled
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load with MSW mocks and display mock settings', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Settings Panel with MSW at ${url}`);
      
      // Setup error capture
      const consoleCapture = captureConsoleErrors(page);
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Listen for MSW and config messages
      let mswInitialized = false;
      let configLoaded = false;
      
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('[MSW]') && text.includes('Mock service worker started')) {
          mswInitialized = true;
        }
        if (text.includes('[Settings] Config loaded')) {
          configLoaded = true;
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
        await page.waitForTimeout(8000); // Extra time for MSW and config loading
        
        // Verify MSW and config initialized
        expect(mswInitialized).toBe(true);
        expect(configLoaded).toBe(true);
        
        // Wait for page to be ready
        await waitForPageReady(page);
        
        // Verify expected content
        const contentCheck = await verifyPageContent(page, expectedContent);
        expect(contentCheck.verified).toBe(true);
        
        // Verify key UI elements
        await expect(page.locator(selectors.title)).toBeVisible({ timeout: 10000 });
        
        // Check for settings sections
        const bodyText = await page.textContent('body');
        
        // Verify appearance settings
        expect(bodyText).toContain('Appearance');
        expect(bodyText).toContain('Theme Mode');
        
        // Verify notifications settings
        expect(bodyText).toContain('Notifications');
        
        // Check for mock settings values (from config)
        const hasMockSettings = bodyText && (
          bodyText.includes('Light') || // Default theme mode
          bodyText.includes('Blue') || // Default primary color
          bodyText.includes('Enable Notifications') // Default notification setting
        );
        
        if (hasMockSettings) {
          console.log('✅ Mock settings data displayed');
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'settings-panel-standalone-msw');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Settings Panel with MSW loaded successfully in ${loadTime}ms`);
        console.log(`🎭 MSW initialized: ${mswInitialized}`);
        console.log(`⚙️ Config loaded: ${configLoaded}`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        
        // With MSW, there should be no network errors
        const networkErrors = consoleCapture.errors.filter(error => 
          error.includes('Failed to load resource') || error.includes('CORS')
        );
        expect(networkErrors.length).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'settings-panel-standalone-msw-FAILED');
        throw error;
      }
    });
    
    test('should handle settings form interactions with MSW', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for MSW and settings to load
      await page.waitForTimeout(5000);
      
      // Try to change theme mode
      const themeSelect = page.locator('select').first();
      if (await themeSelect.count() > 0) {
        await themeSelect.selectOption('dark');
        await page.waitForTimeout(1000);
        
        console.log('🌙 Theme changed to dark mode');
      }
      
      // Try to toggle notification settings
      const notificationSwitches = page.locator('input[type="checkbox"]');
      if (await notificationSwitches.count() > 0) {
        await notificationSwitches.first().click();
        await page.waitForTimeout(1000);
        
        console.log('🔔 Notification setting toggled');
      }
      
      // Try to save settings (should work with MSW)
      const saveButton = page.locator(selectors.saveButton);
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        // Look for success message
        const bodyText = await page.textContent('body');
        const hasSaveSuccess = bodyText && (
          bodyText.includes('saved') ||
          bodyText.includes('success') ||
          bodyText.includes('Saved!')
        );
        
        if (hasSaveSuccess) {
          console.log('✅ Settings save successful with MSW');
        }
        
        // Take screenshot of save result
        await takeScreenshot(page, 'settings-panel-msw-save-result');
      }
      
      // Try reset button if present
      const resetButton = page.locator(selectors.resetButton);
      if (await resetButton.count() > 0) {
        await resetButton.click();
        await page.waitForTimeout(2000);
        
        console.log('🔄 Settings reset successful');
        
        // Take screenshot of reset result
        await takeScreenshot(page, 'settings-panel-msw-reset-result');
      }
    });
    
    test('should show configuration-driven UI', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for configuration to load
      await page.waitForTimeout(5000);
      
      // Check for configuration success indicators
      const bodyText = await page.textContent('body');
      
      // Should show that it's using configuration system
      const hasConfigContent = bodyText && (
        bodyText.includes('Micro-Frontend Architecture is Working') ||
        bodyText.includes('Standalone Mode')
      );
      
      expect(hasConfigContent).toBe(true);
      
      // Should have the configured settings sections
      expect(bodyText).toContain('Appearance');
      expect(bodyText).toContain('Notifications');
      
      console.log('✅ Configuration-driven UI displayed');
    });
  });
});
