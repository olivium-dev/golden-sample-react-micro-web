import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Capture Real Errors', () => {
  test('Capture console and page errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(10000);

    // Try to click User Management
    try {
      await page.locator('button:has-text("User Management")').click({ timeout: 5000 });
      await page.waitForTimeout(5000);
    } catch (e) {
      console.log('Could not click User Management');
    }

    console.log('\n========================================');
    console.log('🔴 CONSOLE ERRORS:');
    console.log('========================================');
    consoleErrors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err}`);
    });

    console.log('\n========================================');
    console.log('🔴 PAGE ERRORS:');
    console.log('========================================');
    pageErrors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'test-results/bff-errors.png', fullPage: true });
  });
});

