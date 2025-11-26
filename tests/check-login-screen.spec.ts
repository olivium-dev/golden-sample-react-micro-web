import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login Screen Test', () => {
  test('Check if login screen is showing', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/login-screen.png', fullPage: true });

    // Check for login elements
    const loginTitle = await page.locator('text=/sign in/i').isVisible();
    const emailField = await page.locator('input[type="email"]').isVisible();
    const passwordField = await page.locator('input[type="password"]').isVisible();
    const loginButton = await page.locator('button:has-text("Sign In")').isVisible();

    console.log('\n========================================');
    console.log('🔐 LOGIN SCREEN CHECK');
    console.log('========================================');
    console.log(`Login Title: ${loginTitle ? '✅' : '❌'}`);
    console.log(`Email Field: ${emailField ? '✅' : '❌'}`);
    console.log(`Password Field: ${passwordField ? '✅' : '❌'}`);
    console.log(`Login Button: ${loginButton ? '✅' : '❌'}`);

    // Check body text
    const bodyText = await page.locator('body').textContent();
    console.log(`\nPage contains "Sign In": ${bodyText?.includes('Sign In') ? '✅' : '❌'}`);
    console.log(`Page contains "Cremat": ${bodyText?.includes('Cremat') ? '✅' : '❌'}`);

    // List all visible text
    console.log(`\nVisible text: ${bodyText?.substring(0, 200)}`);

    if (loginTitle || emailField || passwordField || loginButton) {
      console.log('\n✅ LOGIN SCREEN IS VISIBLE!');
    } else {
      console.log('\n❌ LOGIN SCREEN NOT VISIBLE - Dashboard showing instead');
    }
    console.log('========================================\n');
  });
});

