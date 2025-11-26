import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Firebase Runtime Error Testing', () => {
  
  test('Capture all runtime errors and validate Firebase loads correctly', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const networkErrors: string[] = [];

    // Capture page errors
    page.on('pageerror', (error) => {
      const errorMsg = error.toString();
      pageErrors.push(errorMsg);
      console.log(`❌ PAGE ERROR: ${errorMsg}`);
    });

    // Capture console errors and warnings
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.log(`❌ CONSOLE ERROR: ${text}`);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log(`⚠️  CONSOLE WARNING: ${text}`);
      } else if (text.includes('Firebase') || text.includes('🔥')) {
        console.log(`📝 Firebase log: ${text}`);
      }
    });

    // Capture network failures
    page.on('requestfailed', (request) => {
      const error = request.failure()?.errorText || 'Unknown error';
      networkErrors.push(`${request.method()} ${request.url()} - ${error}`);
      console.log(`📡 NETWORK FAILED: ${request.method()} ${request.url()} - ${error}`);
    });

    console.log('\n========================================');
    console.log('🧪 FIREBASE RUNTIME ERROR TEST');
    console.log('========================================\n');

    console.log('🚀 Navigating to application...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000); // Wait for any async errors

    console.log('\n📊 Error Summary:');
    console.log(`   Page Errors: ${pageErrors.length}`);
    console.log(`   Console Errors: ${consoleErrors.length}`);
    console.log(`   Console Warnings: ${consoleWarnings.length}`);
    console.log(`   Network Errors: ${networkErrors.length}`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/firebase-runtime.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-results/firebase-runtime.png');

    // Check for specific error patterns
    const hasProcessError = pageErrors.some(err => err.includes('process is not defined'));
    const hasFirebaseError = pageErrors.some(err => err.includes('Firebase')) || 
                              consoleErrors.some(err => err.includes('Firebase'));
    const hasWebpackError = pageErrors.some(err => err.includes('webpack'));

    console.log('\n🔍 Error Analysis:');
    console.log(`   process.env error: ${hasProcessError ? '❌ YES' : '✅ NO'}`);
    console.log(`   Firebase error: ${hasFirebaseError ? '❌ YES' : '✅ NO'}`);
    console.log(`   Webpack error: ${hasWebpackError ? '❌ YES' : '✅ NO'}`);

    // Check if page content is visible
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.length > 100;
    console.log(`   Page has content: ${hasContent ? '✅ YES' : '❌ NO'}`);

    // Check if login screen is visible
    const loginScreenVisible = await page.locator('text=Cremat Platform').isVisible().catch(() => false);
    console.log(`   Login screen visible: ${loginScreenVisible ? '✅ YES' : '❌ NO'}`);

    // Check if Google button is visible
    const googleButtonVisible = await page.locator('button:has-text("Continue with Google")').isVisible().catch(() => false);
    console.log(`   Google Sign-In button: ${googleButtonVisible ? '✅ YES' : '❌ NO'}`);

    // Check for error overlay
    const errorOverlay = await page.locator('[data-testid="webpack-overlay"]').isVisible().catch(() => false);
    if (errorOverlay) {
      const overlayText = await page.locator('[data-testid="webpack-overlay"]').textContent();
      console.log(`\n🚨 ERROR OVERLAY DETECTED:`);
      console.log(overlayText);
    }

    // Print detailed errors if any
    if (pageErrors.length > 0) {
      console.log('\n❌ Detailed Page Errors:');
      pageErrors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.substring(0, 200)}`);
      });
    }

    if (consoleErrors.length > 0) {
      console.log('\n❌ Detailed Console Errors:');
      consoleErrors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.substring(0, 200)}`);
      });
    }

    console.log('\n========================================');
    console.log('🎯 TEST RESULT');
    console.log('========================================\n');

    // Assertions
    if (pageErrors.length > 0 || consoleErrors.length > 0) {
      console.log('❌ FAILED: Runtime errors detected');
      console.log(`   - Page Errors: ${pageErrors.length}`);
      console.log(`   - Console Errors: ${consoleErrors.length}`);
    } else if (!loginScreenVisible || !googleButtonVisible) {
      console.log('❌ FAILED: UI not rendering correctly');
    } else {
      console.log('✅ PASSED: No runtime errors, Firebase loaded successfully');
    }

    // Assert no errors
    expect(pageErrors.length, `Page errors found: ${pageErrors.join('\n')}`).toBe(0);
    expect(consoleErrors.length, `Console errors found: ${consoleErrors.join('\n')}`).toBe(0);
    expect(loginScreenVisible, 'Login screen should be visible').toBe(true);
    expect(googleButtonVisible, 'Google Sign-In button should be visible').toBe(true);
  });

  test('Check Firebase initialization and configuration', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
    });

    console.log('\n🔥 Testing Firebase Initialization...\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Check for Firebase initialization message
    const firebaseInitialized = logs.some(log => log.includes('Firebase initialized'));
    
    console.log(`Firebase initialization: ${firebaseInitialized ? '✅ SUCCESS' : '⚠️  NOT FOUND'}`);
    
    if (firebaseInitialized) {
      console.log('✅ Firebase client SDK initialized correctly');
    } else {
      console.log('ℹ️  Firebase may not be fully configured (check .env.development)');
    }
  });

  test('Validate all required UI elements are present', async ({ page }) => {
    console.log('\n🎨 Testing UI Elements...\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    const checks = [
      { name: 'Cremat Platform title', locator: 'text=Cremat Platform' },
      { name: 'Sign In heading', locator: 'text=Sign In' },
      { name: 'Google Sign-In button', locator: 'button:has-text("Continue with Google")' },
      { name: 'OR divider', locator: 'text=OR' },
      { name: 'Email field', locator: 'input[type="email"]' },
      { name: 'Password field', locator: 'input[type="password"]' },
      { name: 'Email Sign-In button', locator: 'button:has-text("Sign In with Email")' },
    ];

    for (const check of checks) {
      const visible = await page.locator(check.locator).isVisible().catch(() => false);
      console.log(`${visible ? '✅' : '❌'} ${check.name}`);
      expect(visible, `${check.name} should be visible`).toBe(true);
    }

    console.log('\n✅ All UI elements validated successfully');
  });
});

