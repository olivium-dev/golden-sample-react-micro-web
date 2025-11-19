import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Debug Firebase API Key', () => {
  test('Check what Firebase API key is actually being used', async ({ page }) => {
    const consoleMessages: string[] = [];
    const networkRequests: Array<{ url: string; headers: any }> = [];

    // Capture all console messages
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Capture all network requests to Firebase
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('googleapis.com') || url.includes('identitytoolkit')) {
        networkRequests.push({
          url,
          headers: request.headers(),
        });
        console.log(`🌐 Firebase request: ${url}`);
      }
    });

    console.log('\n========================================');
    console.log('🔍 DEBUGGING FIREBASE API KEY');
    console.log('========================================\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Check what environment variables are set
    const envVars = await page.evaluate(() => {
      const env = (typeof process !== 'undefined' && process.env) || ({} as any);
      return {
        NODE_ENV: env.NODE_ENV,
        REACT_APP_FIREBASE_API_KEY: env.REACT_APP_FIREBASE_API_KEY,
        REACT_APP_FIREBASE_AUTH_DOMAIN: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        REACT_APP_FIREBASE_PROJECT_ID: env.REACT_APP_FIREBASE_PROJECT_ID,
      };
    });

    console.log('🔧 Environment Variables in Browser:');
    console.log(JSON.stringify(envVars, null, 2));

    // Check Firebase config
    const firebaseConfig = await page.evaluate(() => {
      try {
        // Try to access Firebase config through window if exposed
        return (window as any).firebaseConfig || 'Not exposed on window';
      } catch (e) {
        return 'Error accessing Firebase config';
      }
    });

    console.log('\n🔥 Firebase Config:');
    console.log(JSON.stringify(firebaseConfig, null, 2));

    // Now click Google Sign-In to trigger the API call
    console.log('\n🖱️  Clicking Google Sign-In button...');
    await page.locator('button:has-text("Continue with Google")').click();
    await page.waitForTimeout(2000);

    console.log('\n📡 Network Requests to Firebase:');
    networkRequests.forEach((req, index) => {
      console.log(`\n${index + 1}. ${req.url}`);
      
      // Extract API key from URL
      const urlObj = new URL(req.url);
      const apiKey = urlObj.searchParams.get('key');
      if (apiKey) {
        console.log(`   🔑 API Key: ${apiKey}`);
        if (apiKey === 'AIzaSyBYourDefaultApiKey') {
          console.log('   ❌ USING DEFAULT PLACEHOLDER KEY!');
        } else if (apiKey === 'AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0') {
          console.log('   ✅ USING CORRECT KEY FROM .env.development!');
        } else {
          console.log(`   ⚠️  USING UNKNOWN KEY: ${apiKey}`);
        }
      }
    });

    console.log('\n========================================');
    console.log('📊 SUMMARY');
    console.log('========================================');
    console.log(`Total Firebase requests: ${networkRequests.length}`);
    
    const hasDefaultKey = networkRequests.some(req => req.url.includes('AIzaSyBYourDefaultApiKey'));
    const hasCorrectKey = networkRequests.some(req => req.url.includes('AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0'));
    
    console.log(`Using default placeholder key: ${hasDefaultKey ? '❌ YES' : '✅ NO'}`);
    console.log(`Using correct .env key: ${hasCorrectKey ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n========================================\n');

    // Take a screenshot
    await page.screenshot({ path: 'test-results/firebase-api-key-debug.png', fullPage: true });

    // Assertions
    expect(envVars.REACT_APP_FIREBASE_API_KEY).not.toBe('AIzaSyBYourDefaultApiKey');
    expect(envVars.REACT_APP_FIREBASE_API_KEY).toBe('AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0');
    expect(hasDefaultKey).toBe(false);
    expect(hasCorrectKey).toBe(true);
  });
});

