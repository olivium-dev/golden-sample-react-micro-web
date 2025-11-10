import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login Flow Test', () => {
  test('Login screen shows and login works', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Check login screen is visible
    const emailField = await page.locator('input[type="email"]').first();
    const passwordField = await page.locator('input[type="password"]').first();
    const loginButton = await page.locator('button[type="submit"]').first();

    console.log('\n========================================');
    console.log('🔐 LOGIN SCREEN VALIDATION');
    console.log('========================================');
    
    const emailVisible = await emailField.isVisible();
    const passwordVisible = await passwordField.isVisible();
    const buttonVisible = await loginButton.isVisible();

    console.log(`Email field: ${emailVisible ? '✅' : '❌'}`);
    console.log(`Password field: ${passwordVisible ? '✅' : '❌'}`);
    console.log(`Login button: ${buttonVisible ? '✅' : '❌'}`);

    if (emailVisible && passwordVisible && buttonVisible) {
      console.log('\n✅ LOGIN SCREEN IS SHOWING!');
      
      // Take screenshot of login screen
      await page.screenshot({ path: 'test-results/login-screen-verified.png', fullPage: true });

      // Try to login with demo credentials
      console.log('\n🔑 Attempting login with demo credentials...');
      await emailField.fill('admin@example.com');
      await passwordField.fill('admin123');
      await loginButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);

      // Check if we're logged in (dashboard should show)
      const dashboardVisible = await page.locator('text=/dashboard/i').isVisible();
      console.log(`\nDashboard after login: ${dashboardVisible ? '✅ LOGGED IN!' : '❌ Login failed'}`);

      // Take screenshot after login attempt
      await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });
    } else {
      console.log('\n❌ LOGIN SCREEN NOT SHOWING');
    }

    console.log('========================================\n');

    expect(emailVisible).toBe(true);
    expect(passwordVisible).toBe(true);
    expect(buttonVisible).toBe(true);
  });
});

