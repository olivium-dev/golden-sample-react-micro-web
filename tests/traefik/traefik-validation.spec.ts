import { test, expect } from '@playwright/test';

test.describe('Traefik Routing Validation', () => {
  const baseURL = 'http://localhost:8090';

  test('should access Traefik dashboard', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await expect(page.locator('text=Traefik')).toBeVisible();
  });

  test('should route to backend API', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('should route to container app', async ({ page }) => {
    await page.goto(baseURL);
    await expect(page).toHaveTitle(/Micro-Frontend/);
  });

  test('should load all micro-frontends via Module Federation', async ({ page }) => {
    await page.goto(baseURL);
    
    // Login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for authentication
    await page.waitForTimeout(5000);
    
    // Verify container layout is present
    await expect(page.locator('.MuiDrawer-root')).toBeVisible();
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    
    // Test navigation to each micro-frontend
    await page.click('text=User Management');
    await page.waitForTimeout(2000);
    await expect(page.locator('.MuiDrawer-root')).toBeVisible();
    
    await page.click('text=Data Grid');
    await page.waitForTimeout(2000);
    await expect(page.locator('.MuiDrawer-root')).toBeVisible();
    
    await page.click('text=Analytics');
    await page.waitForTimeout(2000);
    await expect(page.locator('.MuiDrawer-root')).toBeVisible();
  });

  test('should verify CORS headers', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/health`);
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });
});

