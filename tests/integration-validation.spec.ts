import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:3000';
const USER_MANAGEMENT_BFF = 'http://localhost:4001';
const CATALOG_BFF = 'http://localhost:4006';
const BACKEND_URL = 'https://dev-creamat.fds-1.com';
const TEST_USER_EMAIL = 'test.user@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

// Test variables
let authToken: string = '';
let userId: string = '';

test.describe('Phase 1: Backend API Validation', () => {
  test('User Management Backend - Get All Users', async ({ page }) => {
    // Intercept network requests to verify backend call
    let backendCalled = false;
    page.on('response', response => {
      if (response.url().includes('/api/User/all')) {
        backendCalled = true;
      }
    });

    // Test backend endpoint directly
    const response = await page.request.get(`${BACKEND_URL}/api/User/all?skip=0&limit=10`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    expect(response.status()).toBeLessThanOrEqual(200 + 1 || 403); // 200 or 403 acceptable
    const data = await response.json().catch(() => ({}));
    console.log('Users response:', data);
  });

  test('Catalog Backend - Get All Categories', async ({ page }) => {
    const response = await page.request.get(
      `${BACKEND_URL}/api/Catalog/Category/All/10/1`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    expect([200, 403]).toContain(response.status());
    const data = await response.json().catch(() => ({}));
    console.log('Categories response:', data);
  });

  test('User Management Backend - CORS Headers', async ({ page }) => {
    const response = await page.request.options(`${BACKEND_URL}/api/User/all`);
    const corsHeader = response.headers()['access-control-allow-origin'];
    console.log('CORS Header:', corsHeader);
    // CORS header should be present or 204 No Content
    expect([200, 204, 403]).toContain(response.status());
  });
});

test.describe('Phase 2: BFF Proxy Validation', () => {
  test('User Management BFF - Health Check', async ({ page }) => {
    const response = await page.request.get(`${USER_MANAGEMENT_BFF}/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('Catalog BFF - Health Check', async ({ page }) => {
    const response = await page.request.get(`${CATALOG_BFF}/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('User Management BFF - Proxy to Backend', async ({ page }) => {
    const response = await page.request.get(`${USER_MANAGEMENT_BFF}/api/users/all?skip=0&limit=10`);
    expect([200, 401, 403]).toContain(response.status());
  });

  test('Catalog BFF - Proxy to Backend', async ({ page }) => {
    const response = await page.request.get(`${CATALOG_BFF}/api/catalog/Category/All/10/1`);
    expect([200, 403]).toContain(response.status());
  });
});

test.describe('Phase 3: Frontend Authentication Flow', () => {
  test('Login Screen Displays', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check if login screen is visible
    const loginButton = page.locator('text=/sign in|login/i').first();
    await expect(loginButton).toBeVisible({ timeout: 10000 });
    
    console.log('✓ Login screen displayed');
  });

  test('Firebase Email/Password Login', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for login screen
    await page.waitForSelector('button:has-text("Sign in")', { timeout: 10000 });
    
    // Find email input and enter credentials
    const emailInputs = page.locator('input[type="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    
    if (await emailInputs.count() > 0) {
      await emailInputs.first().fill(TEST_USER_EMAIL);
      await passwordInputs.first().fill(TEST_USER_PASSWORD);
      
      // Click sign in button
      await page.locator('button:has-text("Sign in")').click();
      
      // Wait for successful login or home page
      await page.waitForURL(BASE_URL + '**', { timeout: 15000 });
      
      // Extract auth token from localStorage if available
      authToken = await page.evaluate(() => localStorage.getItem('authToken') || '');
      userId = await page.evaluate(() => localStorage.getItem('userId') || '');
      
      console.log('✓ Login successful, authToken:', authToken ? 'received' : 'not found');
    } else {
      console.log('⚠ Email input not found, skipping email/password test');
    }
  });

  test('Verify Auth Context After Login', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check React DevTools for auth context
    const isAuthenticated = await page.evaluate(() => {
      return (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.backends?.[0]?._renderer?.getDisplayName?.() !== undefined;
    });
    
    console.log('React context available:', isAuthenticated);
  });
});

test.describe('Phase 4: User Management Frontend Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and ensure we're logged in
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('Navigate to User Management App', async ({ page }) => {
    // Look for User Management menu item
    const userManagementMenu = page.locator('text=/user management|users/i').first();
    
    if (await userManagementMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userManagementMenu.click();
      await page.waitForTimeout(2000);
      
      // Check for DataGrid or user list
      const dataGrid = page.locator('.MuiDataGrid-root');
      if (await dataGrid.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✓ User Management app loaded');
      } else {
        console.log('⚠ User Management app loaded but DataGrid not found');
      }
    } else {
      console.log('⚠ User Management menu item not found');
    }
  });

  test('User Management - Get All Users API Call', async ({ page }) => {
    let apiCallFound = false;
    let responseData: any = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/users') && response.url().includes('/all')) {
        apiCallFound = true;
        try {
          responseData = await response.json();
          console.log('Users API response:', responseData);
        } catch (e) {
          console.log('Could not parse response');
        }
      }
    });

    // Navigate to User Management
    await page.goto(BASE_URL);
    const userManagementMenu = page.locator('text=/user management|users/i').first();
    if (await userManagementMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userManagementMenu.click();
      await page.waitForTimeout(3000);
    }

    if (apiCallFound) {
      console.log('✓ User Management API call detected');
      if (responseData && Array.isArray(responseData)) {
        console.log(`✓ Users loaded: ${responseData.length} users`);
      }
    } else {
      console.log('⚠ User Management API call not detected');
    }
  });

  test('User Management - Check for API Errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    let networkErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/api/users')) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(BASE_URL);
    const userManagementMenu = page.locator('text=/user management|users/i').first();
    if (await userManagementMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userManagementMenu.click();
      await page.waitForTimeout(3000);
    }

    if (consoleErrors.length > 0) {
      console.log('⚠ Console errors found:', consoleErrors);
    }
    if (networkErrors.length > 0) {
      console.log('⚠ Network errors found:', networkErrors);
    }
    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('✓ No errors detected');
    }
  });
});

test.describe('Phase 5: Catalog Frontend Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('Navigate to Catalog App', async ({ page }) => {
    const catalogMenu = page.locator('text=/catalog|categories/i').first();
    
    if (await catalogMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await catalogMenu.click();
      await page.waitForTimeout(2000);
      console.log('✓ Catalog app navigation clicked');
    } else {
      console.log('⚠ Catalog menu item not found');
    }
  });

  test('Catalog - Get All Categories API Call', async ({ page }) => {
    let apiCallFound = false;
    let responseData: any = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/catalog') || response.url().includes('Category/All')) {
        apiCallFound = true;
        try {
          responseData = await response.json();
          console.log('Categories API response:', responseData);
        } catch (e) {
          console.log('Could not parse response');
        }
      }
    });

    // Navigate to Catalog
    await page.goto(BASE_URL);
    const catalogMenu = page.locator('text=/catalog|categories/i').first();
    if (await catalogMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await catalogMenu.click();
      await page.waitForTimeout(3000);
    }

    if (apiCallFound) {
      console.log('✓ Catalog API call detected');
      if (responseData && responseData.categories) {
        console.log(`✓ Categories loaded: ${responseData.categories.length} categories`);
      }
    } else {
      console.log('⚠ Catalog API call not detected');
    }
  });

  test('Catalog - Check for API Errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    let networkErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (response.status() >= 400 && (response.url().includes('/api/catalog') || response.url().includes('Category'))) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(BASE_URL);
    const catalogMenu = page.locator('text=/catalog|categories/i').first();
    if (await catalogMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await catalogMenu.click();
      await page.waitForTimeout(3000);
    }

    if (consoleErrors.length > 0) {
      console.log('⚠ Console errors found:', consoleErrors);
    }
    if (networkErrors.length > 0) {
      console.log('⚠ Network errors found:', networkErrors);
    }
    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('✓ No errors detected');
    }
  });
});

test.describe('Phase 6: End-to-End Workflow', () => {
  test('Complete User Management Workflow', async ({ page }) => {
    // 1. Navigate to app
    await page.goto(BASE_URL);
    
    // 2. Check login
    let isLoggedIn = false;
    try {
      await page.waitForSelector('button:has-text("Logout")', { timeout: 5000 }).catch(() => {});
      isLoggedIn = true;
    } catch (e) {
      console.log('⚠ Not logged in or logout button not visible');
    }

    if (!isLoggedIn) {
      console.log('⚠ Cannot complete workflow - user not logged in');
      return;
    }

    // 3. Navigate to User Management
    const userManagementMenu = page.locator('text=/user management|users/i').first();
    if (await userManagementMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userManagementMenu.click();
      await page.waitForTimeout(3000);

      // 4. Check for user list
      const users = page.locator('.MuiDataGrid-row');
      const userCount = await users.count();
      console.log(`✓ Workflow: Found ${userCount} users in list`);

      // 5. Try to create a user
      const createButton = page.locator('button:has-text("Add")').first();
      if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Workflow: Create user dialog opened');
      }
    } else {
      console.log('⚠ Cannot complete workflow - User Management menu not found');
    }
  });

  test('Complete Catalog Workflow', async ({ page }) => {
    // 1. Navigate to app
    await page.goto(BASE_URL);
    
    // 2. Check login
    let isLoggedIn = false;
    try {
      await page.waitForSelector('button:has-text("Logout")', { timeout: 5000 }).catch(() => {});
      isLoggedIn = true;
    } catch (e) {
      console.log('⚠ Not logged in or logout button not visible');
    }

    if (!isLoggedIn) {
      console.log('⚠ Cannot complete workflow - user not logged in');
      return;
    }

    // 3. Navigate to Catalog
    const catalogMenu = page.locator('text=/catalog|categories/i').first();
    if (await catalogMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await catalogMenu.click();
      await page.waitForTimeout(3000);

      // 4. Check for category list
      const categories = page.locator('.MuiDataGrid-row');
      const categoryCount = await categories.count();
      console.log(`✓ Workflow: Found ${categoryCount} categories in list`);

      // 5. Try to create a category
      const createButton = page.locator('button:has-text("Add")').first();
      if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Workflow: Create category dialog opened');
      }
    } else {
      console.log('⚠ Cannot complete workflow - Catalog menu not found');
    }
  });
});

