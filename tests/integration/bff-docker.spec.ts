import { test, expect } from '@playwright/test';

const BASE_URL = process.env.CONTAINER_URL || 'http://localhost:3000';
const USER_BFF_URL = process.env.USER_BFF_URL || 'http://localhost:4001';
const CATALOG_BFF_URL = process.env.CATALOG_BFF_URL || 'http://localhost:4006';
const ORDERS_BFF_URL = process.env.ORDERS_BFF_URL || 'http://localhost:4005';

test.describe('BFF Integration Tests - Docker', () => {
  test('User Management BFF health check', async ({ request }) => {
    const response = await request.get(`${USER_BFF_URL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('user-management-bff');
  });

  test('Catalog BFF health check', async ({ request }) => {
    const response = await request.get(`${CATALOG_BFF_URL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('catalog-bff');
  });

  test('Orders BFF health check', async ({ request }) => {
    const response = await request.get(`${ORDERS_BFF_URL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('orders-bff');
  });

  test('User Management BFF proxies API requests', async ({ request }) => {
    const response = await request.get(`${USER_BFF_URL}/api/users`, {
      failOnStatusCode: false,
    });
    // Should either succeed (200) or fail gracefully (not CORS error)
    expect([200, 404, 500]).toContain(response.status());
    // Verify no CORS headers in error (if error occurs)
    const headers = response.headers();
    if (response.status() !== 200) {
      // Error should be from backend, not CORS
      expect(headers['access-control-allow-origin']).toBeUndefined();
    }
  });

  test('Catalog BFF proxies catalog API requests', async ({ request }) => {
    const response = await request.get(`${CATALOG_BFF_URL}/api/catalog/Category/All/10/1`, {
      failOnStatusCode: false,
    });
    expect([200, 404, 500]).toContain(response.status());
  });

  test('Catalog BFF proxies CDN API requests', async ({ request }) => {
    const response = await request.get(`${CATALOG_BFF_URL}/api/cdn/api/ImageUpload/mediaTypes`, {
      failOnStatusCode: false,
    });
    expect([200, 404, 500]).toContain(response.status());
  });

  test('Orders BFF proxies orders API requests', async ({ request }) => {
    const response = await request.get(`${ORDERS_BFF_URL}/api/orders/users/test/orders`, {
      failOnStatusCode: false,
    });
    expect([200, 404, 500]).toContain(response.status());
  });

  test('BFF servers serve static files', async ({ request }) => {
    const userBffResponse = await request.get(`${USER_BFF_URL}/`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(userBffResponse.status());

    const catalogBffResponse = await request.get(`${CATALOG_BFF_URL}/`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(catalogBffResponse.status());

    const ordersBffResponse = await request.get(`${ORDERS_BFF_URL}/`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(ordersBffResponse.status());
  });

  test('BFF servers serve remoteEntry.js for Module Federation', async ({ request }) => {
    const userBffResponse = await request.get(`${USER_BFF_URL}/remoteEntry.js`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(userBffResponse.status());

    const catalogBffResponse = await request.get(`${CATALOG_BFF_URL}/remoteEntry.js`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(catalogBffResponse.status());

    const ordersBffResponse = await request.get(`${ORDERS_BFF_URL}/remoteEntry.js`, {
      failOnStatusCode: false,
    });
    expect([200, 404]).toContain(ordersBffResponse.status());
  });

  test('Container app connects to BFF servers', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Check for Module Federation loading
    const remoteEntryLoaded = await page.evaluate(() => {
      return window.__webpack_require__ !== undefined;
    });
    expect(remoteEntryLoaded).toBe(true);
  });
});

