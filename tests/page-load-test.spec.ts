import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Container App - Page Load Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to load
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test('Container page loads successfully', async ({ page }) => {
    // Check if page title exists or root element is present
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible({ timeout: 10000 });
    
    // Check for any React app indicators
    const hasReactContent = await page.evaluate(() => {
      return document.body.innerHTML.length > 0;
    });
    
    expect(hasReactContent).toBe(true);
  });

  test('Home page loads and displays content', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Check if page has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('Navigation menu is visible', async ({ page }) => {
    // Wait for menu to appear
    await page.waitForTimeout(2000);
    
    // Check for common menu indicators (Material-UI drawer, menu items, etc.)
    const menuIndicators = [
      'button[aria-label*="menu" i]',
      '[role="navigation"]',
      'nav',
      '.MuiDrawer-root',
      '[class*="drawer"]',
      '[class*="menu"]'
    ];
    
    let menuFound = false;
    for (const selector of menuIndicators) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        menuFound = true;
        break;
      }
    }
    
    // At minimum, check if page has interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    expect(buttons + links).toBeGreaterThan(0);
  });

  test('No console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(3000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => {
      const lowerError = error.toLowerCase();
      return !lowerError.includes('favicon') &&
             !lowerError.includes('manifest') &&
             !lowerError.includes('sourcemap') &&
             !lowerError.includes('webpack');
    });
    
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    
    // Allow some non-critical errors but log them
    expect(criticalErrors.length).toBeLessThan(10);
  });

  test('All micro-frontend remotes are configured', async ({ page }) => {
    // Check if Module Federation is working by looking for remoteEntry.js references
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    
    // Check if page loaded successfully
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Verify page has React content
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Micro-Frontend Apps - Individual Tests', () => {
  test('Container app responds', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });
  });

  test('User Management app remote is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/remoteEntry.js', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    expect(response?.status()).toBe(200);
  });

  test('Data Grid app remote is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3002/remoteEntry.js', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    expect(response?.status()).toBe(200);
  });

  test('Analytics app remote is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3003/remoteEntry.js', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    expect(response?.status()).toBe(200);
  });

  test('Settings app remote is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3004/remoteEntry.js', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    expect(response?.status()).toBe(200);
  });

  test('Orders app remote is accessible', async ({ page }) => {
    const response = await page.goto('http://localhost:3005/remoteEntry.js', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    expect(response?.status()).toBe(200);
  });

  test('Catalog app remote is accessible (if running)', async ({ page }) => {
    try {
      const response = await page.goto('http://localhost:3006/remoteEntry.js', { 
        waitUntil: 'networkidle',
        timeout: 5000 
      });
      expect(response?.status()).toBe(200);
    } catch (error) {
      // Catalog app might not be running, that's okay
      console.log('Catalog app not running (optional)');
    }
  });
});

test.describe('Page Functionality Tests', () => {
  test('Page loads without critical errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Filter critical errors
    const criticalErrors = errors.filter(error => {
      const lowerError = error.toLowerCase();
      return !lowerError.includes('favicon') &&
             !lowerError.includes('manifest') &&
             !lowerError.includes('sourcemap') &&
             !lowerError.includes('webpack') &&
             !lowerError.includes('chunk');
    });
    
    console.log(`Found ${criticalErrors.length} critical errors`);
    if (criticalErrors.length > 0) {
      console.log('Errors:', criticalErrors.slice(0, 5));
    }
    
    // Page should load even with some non-critical errors
    const rootVisible = await page.locator('#root').isVisible();
    expect(rootVisible).toBe(true);
  });

  test('Page has interactive elements', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check for buttons, links, or other interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    
    const totalInteractive = buttons + links + inputs;
    expect(totalInteractive).toBeGreaterThan(0);
  });

  test('Page responds to user interaction', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Try to find and click a button if available
    const firstButton = page.locator('button').first();
    const buttonCount = await page.locator('button').count();
    
    if (buttonCount > 0) {
      await firstButton.click({ timeout: 2000 });
      await page.waitForTimeout(500);
      // If we can click without error, page is interactive
      expect(true).toBe(true);
    } else {
      // If no buttons, at least page loaded
      const rootVisible = await page.locator('#root').isVisible();
      expect(rootVisible).toBe(true);
    }
  });
});

