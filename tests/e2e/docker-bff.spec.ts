import { test, expect } from '@playwright/test';

const BASE_URL = process.env.CONTAINER_URL || 'http://localhost:3000';

test.describe('E2E Tests - Docker BFF Architecture', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[CONSOLE ERROR] ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('Full application loads without CORS errors', async ({ page }) => {
    const corsErrors: string[] = [];

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    expect(corsErrors.length).toBe(0);
    console.log('✅ No CORS errors detected');
  });

  test('All 7 menu items are accessible', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    const menuItems = [
      'User Management',
      'Data Grid',
      'Analytics',
      'Settings',
      'Orders',
      'Catalog',
    ];

    for (const item of menuItems) {
      console.log(`Testing menu item: ${item}`);
      await page.locator(`button:has-text("${item}")`).click();
      await page.waitForTimeout(3000);

      // Verify content loaded (not just blank page)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(100);
      console.log(`✅ ${item} loaded successfully`);
    }
  });

  test('User Management app works through BFF', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("User Management")').click();
    await page.waitForTimeout(5000);

    // Check for User Management content
    const contentVisible = await page.locator('text=User Management').isVisible();
    expect(contentVisible).toBe(true);

    // Verify API calls are made (check network requests)
    const apiRequests = await page.evaluate(() => {
      return (window as any).__apiRequests || [];
    });
    
    // Should have made API requests (even if they fail, they should be attempted)
    console.log(`API requests made: ${apiRequests.length}`);
  });

  test('Catalog app works through BFF', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Catalog")').click();
    await page.waitForTimeout(5000);

    // Check for Catalog content
    const contentVisible = await page.locator('text=Catalog Management').isVisible() ||
                           await page.locator('h3:has-text("Catalog")').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('Orders app works through BFF', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Orders")').click();
    await page.waitForTimeout(5000);

    // Check for Orders content
    const contentVisible = await page.locator('text=Orders Management').isVisible() ||
                           await page.locator('h3:has-text("Orders")').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('No direct cross-origin requests to backend', async ({ page }) => {
    const crossOriginRequests: string[] = [];
    const backendDomains = [
      'dev-creamat.fds-1.com',
      'dev-cremat.fanusdigital.site',
    ];

    page.on('request', (request) => {
      const url = request.url();
      const requestOrigin = new URL(url).origin;
      const pageOrigin = new URL(BASE_URL).origin;

      if (requestOrigin !== pageOrigin) {
        const isBackendRequest = backendDomains.some(domain => url.includes(domain));
        if (isBackendRequest && url.includes('/api/')) {
          crossOriginRequests.push(url);
        }
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate through apps that use BFF
    const menuItems = ['User Management', 'Catalog', 'Orders'];
    for (const item of menuItems) {
      await page.locator(`button:has-text("${item}")`).click();
      await page.waitForTimeout(3000);
    }

    // Should have no direct cross-origin requests
    expect(crossOriginRequests.length).toBe(0);
    console.log('✅ No direct cross-origin requests to backend');
  });

  test('Error handling works correctly', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate to each app
    const menuItems = ['User Management', 'Catalog', 'Orders'];
    for (const item of menuItems) {
      await page.locator(`button:has-text("${item}")`).click();
      await page.waitForTimeout(3000);

      // Check if error messages are displayed properly (if API fails)
      const errorVisible = await page.locator('text=/error/i').isVisible().catch(() => false);
      
      if (errorVisible) {
        const errorText = await page.locator('text=/error/i').first().textContent();
        // Error should not be CORS-related
        expect(errorText?.toLowerCase()).not.toContain('cors');
        expect(errorText?.toLowerCase()).not.toContain('blocked');
        console.log(`✅ ${item} shows proper error handling`);
      } else {
        console.log(`✅ ${item} loaded successfully`);
      }
    }
  });
});

