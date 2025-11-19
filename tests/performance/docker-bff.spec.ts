import { test, expect } from '@playwright/test';

const BASE_URL = process.env.CONTAINER_URL || 'http://localhost:3000';
const USER_BFF_URL = process.env.USER_BFF_URL || 'http://localhost:4001';
const CATALOG_BFF_URL = process.env.CATALOG_BFF_URL || 'http://localhost:4006';
const ORDERS_BFF_URL = process.env.ORDERS_BFF_URL || 'http://localhost:4005';

test.describe('Performance Tests - Docker BFF', () => {
  test('BFF health check response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${USER_BFF_URL}/health`);
    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond in less than 1 second
    console.log(`User BFF health check: ${responseTime}ms`);
  });

  test('BFF API proxy response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${USER_BFF_URL}/api/users`, {
      failOnStatusCode: false,
    });
    const responseTime = Date.now() - startTime;

    // Should respond quickly even if backend is slow
    expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
    console.log(`User BFF API proxy: ${responseTime}ms`);
  });

  test('Concurrent requests handling', async ({ request }) => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(request.get(`${USER_BFF_URL}/health`));
    }

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });

    // Should handle concurrent requests efficiently
    expect(totalTime).toBeLessThan(concurrentRequests * 500); // Less than 500ms per request
    console.log(`Concurrent requests (${concurrentRequests}): ${totalTime}ms`);
  });

  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(30000); // Should load in less than 30 seconds
    console.log(`Page load time: ${loadTime}ms`);

    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete}ms`);
  });

  test('Memory usage check', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Navigate through all apps
    const menuItems = ['User Management', 'Catalog', 'Orders'];
    for (const item of menuItems) {
      await page.locator(`button:has-text("${item}")`).click();
      await page.waitForTimeout(3000);
    }

    // Check memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      } : null;
    });

    if (memoryInfo) {
      console.log(`Memory Usage: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Total Heap: ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    }
  });

  test('Response time under load', async ({ request }) => {
    const iterations = 20;
    const responseTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await request.get(`${USER_BFF_URL}/health`);
      responseTimes.push(Date.now() - startTime);
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Max response time: ${maxResponseTime}ms`);
    console.log(`Min response time: ${minResponseTime}ms`);

    expect(avgResponseTime).toBeLessThan(500); // Average should be less than 500ms
    expect(maxResponseTime).toBeLessThan(2000); // Max should be less than 2 seconds
  });
});

