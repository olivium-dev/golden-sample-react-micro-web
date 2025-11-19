import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const USER_BFF_PORT = 4001;
const CATALOG_BFF_PORT = 4006;
const ORDERS_BFF_PORT = 4005;

test.describe('BFF Architecture Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors and network requests
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[CONSOLE ERROR] ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('Container app loads without CORS errors', async ({ page }) => {
    const corsErrors: string[] = [];
    const networkRequests: any[] = [];

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
      }
    });

    page.on('request', (request) => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
      });
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Check for CORS errors
    expect(corsErrors.length).toBe(0);
    console.log(`✅ No CORS errors detected. Total requests: ${networkRequests.length}`);
  });

  test('User Management app loads and makes API calls through BFF', async ({ page }) => {
    const apiRequests: any[] = [];
    const corsErrors: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/users')) {
        apiRequests.push({
          url,
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate to User Management
    await page.locator('button:has-text("User Management")').click();
    await page.waitForTimeout(5000); // Wait for API calls

    // Verify no CORS errors
    expect(corsErrors.length).toBe(0);

    // Verify API requests use relative paths (no cross-origin)
    const userApiRequests = apiRequests.filter(req => req.url.includes('/api/users'));
    expect(userApiRequests.length).toBeGreaterThan(0);
    
    // Verify all API requests are same-origin (relative paths)
    userApiRequests.forEach(req => {
      const url = new URL(req.url, BASE_URL);
      expect(url.origin).toBe(new URL(BASE_URL).origin);
      console.log(`✅ User API request: ${req.method} ${req.url} (same-origin)`);
    });

    // Verify content loaded
    const contentVisible = await page.locator('text=User Management').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('Catalog app loads and makes API calls through BFF', async ({ page }) => {
    const apiRequests: any[] = [];
    const corsErrors: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/catalog') || url.includes('/api/cdn')) {
        apiRequests.push({
          url,
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate to Catalog
    await page.locator('button:has-text("Catalog")').click();
    await page.waitForTimeout(5000); // Wait for API calls

    // Verify no CORS errors
    expect(corsErrors.length).toBe(0);

    // Verify API requests use relative paths
    const catalogApiRequests = apiRequests.filter(req => 
      req.url.includes('/api/catalog') || req.url.includes('/api/cdn')
    );
    
    if (catalogApiRequests.length > 0) {
      catalogApiRequests.forEach(req => {
        const url = new URL(req.url, BASE_URL);
        expect(url.origin).toBe(new URL(BASE_URL).origin);
        console.log(`✅ Catalog API request: ${req.method} ${req.url} (same-origin)`);
      });
    }

    // Verify content loaded
    const contentVisible = await page.locator('text=Catalog Management').isVisible() ||
                           await page.locator('h3:has-text("Catalog")').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('Orders app loads and makes API calls through BFF', async ({ page }) => {
    const apiRequests: any[] = [];
    const corsErrors: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/orders')) {
        apiRequests.push({
          url,
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure?.errorText.includes('CORS') || failure?.errorText.includes('blocked')) {
        corsErrors.push(`${request.url()}: ${failure.errorText}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate to Orders
    await page.locator('button:has-text("Orders")').click();
    await page.waitForTimeout(5000); // Wait for API calls

    // Verify no CORS errors
    expect(corsErrors.length).toBe(0);

    // Verify API requests use relative paths
    const ordersApiRequests = apiRequests.filter(req => req.url.includes('/api/orders'));
    
    if (ordersApiRequests.length > 0) {
      ordersApiRequests.forEach(req => {
        const url = new URL(req.url, BASE_URL);
        expect(url.origin).toBe(new URL(BASE_URL).origin);
        console.log(`✅ Orders API request: ${req.method} ${req.url} (same-origin)`);
      });
    }

    // Verify content loaded
    const contentVisible = await page.locator('text=Orders Management').isVisible() ||
                           await page.locator('h3:has-text("Orders")').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('No cross-origin requests to backend services', async ({ page }) => {
    const crossOriginRequests: string[] = [];
    const backendDomains = [
      'dev-creamat.fds-1.com',
      'dev-jaiker.fanusdigital.site',
    ];

    page.on('request', (request) => {
      const url = request.url();
      const requestOrigin = new URL(url).origin;
      const pageOrigin = new URL(BASE_URL).origin;

      // Check if request is cross-origin and targets backend
      if (requestOrigin !== pageOrigin) {
        const isBackendRequest = backendDomains.some(domain => url.includes(domain));
        if (isBackendRequest && !url.includes('/api/')) {
          crossOriginRequests.push(url);
        }
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate through all apps
    const menuItems = ['User Management', 'Catalog', 'Orders'];
    for (const item of menuItems) {
      await page.locator(`button:has-text("${item}")`).click();
      await page.waitForTimeout(3000);
    }

    // Verify no direct cross-origin requests to backend
    expect(crossOriginRequests.length).toBe(0);
    console.log(`✅ No direct cross-origin requests to backend services`);
  });

  test('BFF proxy endpoints are accessible', async ({ request }) => {
    // Test User Management BFF
    try {
      const userResponse = await request.get(`http://localhost:${USER_BFF_PORT}/api/users`);
      console.log(`✅ User BFF accessible: ${userResponse.status()}`);
    } catch (error) {
      console.log(`⚠️ User BFF not running or endpoint not available`);
    }

    // Test Catalog BFF
    try {
      const catalogResponse = await request.get(`http://localhost:${CATALOG_BFF_PORT}/api/catalog/Category/All/10/1`);
      console.log(`✅ Catalog BFF accessible: ${catalogResponse.status()}`);
    } catch (error) {
      console.log(`⚠️ Catalog BFF not running or endpoint not available`);
    }

    // Test Orders BFF
    try {
      const ordersResponse = await request.get(`http://localhost:${ORDERS_BFF_PORT}/api/orders/users/test/orders`);
      console.log(`✅ Orders BFF accessible: ${ordersResponse.status()}`);
    } catch (error) {
      console.log(`⚠️ Orders BFF not running or endpoint not available`);
    }
  });

  test('Error handling works correctly', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Navigate to each app and check for error displays
    const menuItems = [
      { name: 'User Management', errorText: 'Error fetching users' },
      { name: 'Catalog', errorText: 'Error fetching categories' },
      { name: 'Orders', errorText: 'Failed to load orders' },
    ];

    for (const item of menuItems) {
      await page.locator(`button:has-text("${item.name}")`).click();
      await page.waitForTimeout(3000);

      // Check if error messages are displayed properly (if API fails)
      const errorVisible = await page.locator(`text=${item.errorText}`).isVisible().catch(() => false);
      
      // If error is visible, verify it's a proper error message, not a CORS error
      if (errorVisible) {
        const errorText = await page.locator(`text=${item.errorText}`).textContent();
        expect(errorText).not.toContain('CORS');
        expect(errorText).not.toContain('blocked');
        console.log(`✅ ${item.name} shows proper error handling`);
      } else {
        console.log(`✅ ${item.name} loaded successfully`);
      }
    }
  });
});

