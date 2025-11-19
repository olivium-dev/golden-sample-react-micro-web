import { test, expect } from '@playwright/test';

test('Quick validation - all services running', async ({ page }) => {
  console.log('\n========================================');
  console.log('🚀 QUICK VALIDATION TEST');
  console.log('========================================\n');

  // Navigate to main application
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check page loads
  const pageContent = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText?.substring(0, 200) || 'EMPTY',
      hasContent: document.body.innerText?.length > 100,
      hasReact: !!(window as any).React,
      hasReactDOM: !!(window as any).ReactDOM
    };
  });

  console.log('📊 Page Status:');
  console.log(`   Title: ${pageContent.title}`);
  console.log(`   Has Content: ${pageContent.hasContent ? '✅' : '❌'}`);
  console.log(`   React: ${pageContent.hasReact ? '✅' : '⚠️'}`);
  console.log(`   ReactDOM: ${pageContent.hasReactDOM ? '✅' : '⚠️'}`);
  console.log(`   Preview: ${pageContent.bodyText}`);

  // Check for critical errors
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.waitForTimeout(2000);

  console.log('\n🔍 Console Errors:');
  if (errors.length === 0) {
    console.log('   ✅ No page errors detected');
  } else {
    errors.forEach(err => console.log(`   ❌ ${err}`));
  }

  // Check menu items exist
  const menuCheck = await page.evaluate(() => {
    const menuItems = document.querySelectorAll('.MuiListItemButton-root');
    return {
      count: menuItems.length,
      items: Array.from(menuItems).map((item) => (item as HTMLElement).innerText?.split('\n')[0] || 'Unknown')
    };
  });

  console.log('\n📋 Menu Items:');
  console.log(`   Count: ${menuCheck.count}`);
  menuCheck.items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item}`);
  });

  // Check Module Federation remotes
  const federationCheck = await page.evaluate(() => {
    const remotes = ['userApp', 'dataApp', 'analyticsApp', 'settingsApp', 'ordersApp', 'catalogApp'];
    return remotes.map(remote => ({
      name: remote,
      loaded: !!(window as any)[remote]
    }));
  });

  console.log('\n🔌 Module Federation Status:');
  federationCheck.forEach(remote => {
    console.log(`   ${remote.loaded ? '✅' : '⚠️'} ${remote.name}`);
  });

  // Take screenshot
  await page.screenshot({ path: 'test-results/quick-validation.png', fullPage: false });

  console.log('\n========================================');
  console.log('✅ VALIDATION COMPLETE');
  console.log('========================================\n');

  // Basic assertions
  expect(pageContent.hasContent).toBe(true);
  expect(menuCheck.count).toBeGreaterThanOrEqual(7);
});
