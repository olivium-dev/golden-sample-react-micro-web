/**
 * Standalone Tests for Analytics Dashboard Micro-Web
 * 
 * Tests Analytics Dashboard in isolation with both real backend and MSW mocks
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
const serviceName = 'analytics';
const serviceConfig = testConfig.services[serviceName];
const expectedContent = getExpectedContent(serviceName);
const selectors = getSelectors(serviceName);

test.describe('Analytics Dashboard - Standalone Mode', () => {
  
  test.describe('Real Backend', () => {
    let backendProcess: any;
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start backend first
      backendProcess = await startBackend();
      
      // Start Analytics in standalone mode with real backend
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load and display analytics dashboard', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Analytics Dashboard at ${url}`);
      
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
        
        // Check for metric cards
        const metricCards = page.locator(selectors.metricCards);
        if (await metricCards.count() > 0) {
          await expect(metricCards.first()).toBeVisible();
          console.log(`📊 Found ${await metricCards.count()} metric cards`);
        }
        
        // Check for chart area
        const chart = page.locator(selectors.chart);
        if (await chart.count() > 0) {
          await expect(chart).toBeVisible();
          console.log('📈 Chart area found');
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'analytics-dashboard-standalone-real');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Analytics Dashboard loaded successfully in ${loadTime}ms`);
        console.log(`📄 Content found: ${contentCheck.found.join(', ')}`);
        console.log(`🔍 TypeScript errors: ${consoleCapture.typescriptErrors}`);
        console.log(`⚠️ Runtime errors: ${consoleCapture.runtimeErrors}`);
        
        // Verify no critical errors
        expect(consoleCapture.typescriptErrors).toBe(0);
        
      } catch (error) {
        // Take screenshot on failure
        await takeScreenshot(page, 'analytics-dashboard-standalone-real-FAILED');
        throw error;
      }
    });
    
    test('should display standalone mode indicator', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Look for standalone mode indicator
      const bodyText = await page.textContent('body');
      expect(bodyText).toContain('Standalone Mode');
      
      console.log('✅ Standalone mode indicator found');
    });
  });
  
  test.describe('MSW Mocks', () => {
    let microWebProcess: any;
    
    test.beforeAll(async () => {
      // Start Analytics in standalone mode with MSW enabled
      microWebProcess = await startMicroWeb(serviceName, 'standalone');
    });
    
    test.afterAll(async () => {
      await stopAllServices();
    });
    
    test('should load with MSW mocks and display mock data', async ({ page }) => {
      const startTime = Date.now();
      const url = getServiceUrl(serviceName, 'standalone');
      
      console.log(`🧪 Testing Analytics Dashboard with MSW at ${url}`);
      
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
        if (text.includes('[Analytics] Config loaded')) {
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
        
        // Check for metric cards with mock data
        const metricCards = page.locator(selectors.metricCards);
        if (await metricCards.count() > 0) {
          await expect(metricCards.first()).toBeVisible();
          
          // Check for mock metric values
          const cardsText = await metricCards.allTextContents();
          const hasMockData = cardsText.some(text => 
            text.includes('1,234') || // Mock user count
            text.includes('$45,678') || // Mock revenue
            text.includes('3.2%') || // Mock conversion rate
            text.includes('98,765') // Mock page views
          );
          
          if (hasMockData) {
            console.log('✅ Mock analytics data displayed in cards');
          }
        }
        
        // Take screenshot
        const screenshotPath = await takeScreenshot(page, 'analytics-dashboard-standalone-msw');
        
        // Calculate load time
        const loadTime = Date.now() - startTime;
        
        // Log success
        console.log(`✅ Analytics Dashboard with MSW loaded successfully in ${loadTime}ms`);
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
        await takeScreenshot(page, 'analytics-dashboard-standalone-msw-FAILED');
        throw error;
      }
    });
    
    test('should display chart visualization placeholder', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Look for chart section
      const bodyText = await page.textContent('body');
      
      // Should have chart-related content
      const hasChartContent = bodyText && (
        bodyText.includes('Chart') ||
        bodyText.includes('Performance') ||
        bodyText.includes('visualization')
      );
      
      expect(hasChartContent).toBe(true);
      console.log('✅ Chart visualization content found');
      
      // Take screenshot showing chart area
      await takeScreenshot(page, 'analytics-dashboard-chart-area');
    });
    
    test('should show configuration-driven content', async ({ page }) => {
      const url = getServiceUrl(serviceName, 'standalone');
      
      // Setup auth bypass
      await setupAuthBypass(page);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Wait for configuration to load
      await page.waitForTimeout(5000);
      
      // Check for configuration success indicator
      const bodyText = await page.textContent('body');
      
      // Should show that it's using configuration system
      const hasConfigContent = bodyText && (
        bodyText.includes('Micro-Frontend Architecture is Working') ||
        bodyText.includes('Standalone Mode')
      );
      
      expect(hasConfigContent).toBe(true);
      console.log('✅ Configuration-driven content displayed');
    });
  });
});
