import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('BFF Quick Validation', () => {
  test('Check what is actually showing on the page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/bff-page-status.png', fullPage: true });

    // Get page content
    const bodyText = await page.locator('body').textContent();
    console.log('========================================');
    console.log('PAGE CONTENT:');
    console.log('========================================');
    console.log(bodyText?.substring(0, 500));
    console.log('========================================');

    // Check for errors
    const errorVisible = await page.locator('text=/error/i').isVisible().catch(() => false);
    console.log(`Error visible: ${errorVisible}`);

    // Check for React
    const reactFound = await page.evaluate(() => {
      return !!(window as any).React || !!document.querySelector('[data-reactroot]');
    });
    console.log(`React found: ${reactFound}`);

    // List all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('Buttons found:', buttons);
  });
});

