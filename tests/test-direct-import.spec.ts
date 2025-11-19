import { test, expect } from '@playwright/test';

test('Test direct Module Federation import', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING DIRECT MODULE FEDERATION');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Test Module Federation directly in browser console
  const mfTest = await page.evaluate(async () => {
    try {
      console.log('Testing Module Federation import...');
      
      // Try to import the UserManagement module directly
      const userModule = await (window as any).__webpack_require__.e('userApp').then(() => {
        return (window as any).__webpack_require__('webpack/container/reference/userApp');
      });
      
      console.log('User module loaded:', userModule);
      
      if (userModule && userModule.get) {
        const UserManagement = await userModule.get('./UserManagement');
        console.log('UserManagement component:', UserManagement);
        
        if (UserManagement) {
          const Component = UserManagement();
          console.log('Component instance:', Component);
          return { success: true, component: !!Component };
        }
      }
      
      return { success: false, error: 'Module or component not found' };
      
    } catch (error: any) {
      console.log('Module Federation error:', error.message);
      return { success: false, error: error.message };
    }
  });

  console.log('Module Federation test result:', mfTest);

  // Also test if we can access the remote directly
  const remoteTest = await page.evaluate(async () => {
    try {
      // Check if remote is available
      const remotes = (window as any).__webpack_require__.cache;
      const remoteKeys = Object.keys(remotes || {}).filter(key => key.includes('userApp'));
      
      return {
        hasRemotes: !!remotes,
        remoteKeys: remoteKeys.slice(0, 5),
        totalCacheKeys: Object.keys(remotes || {}).length
      };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  console.log('Remote test result:', remoteTest);

  // Test what happens when we manually try the import
  const manualImport = await page.evaluate(async () => {
    try {
      // This is what React.lazy is doing
      const module = await import('userApp/UserManagement');
      console.log('Manual import result:', module);
      return { success: true, hasDefault: !!module.default };
    } catch (error: any) {
      console.log('Manual import error:', error.message);
      return { success: false, error: error.message };
    }
  });

  console.log('Manual import result:', manualImport);

  expect(true).toBe(true); // Don't fail, just report
});
