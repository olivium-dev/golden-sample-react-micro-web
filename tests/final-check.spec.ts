import { test, expect } from '@playwright/test';

test('Final check - is page loading correctly', async ({ page }) => {
  console.log('\n========== FINAL PAGE CHECK ==========\n');
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check if React mounted
  const reactMounted = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.children.length > 0 : false;
  });
  
  console.log('✅ React mounted:', reactMounted);
  
  // Check for visible content
  const pageContent = await page.evaluate(() => {
    return {
      title: document.title,
      hasRoot: !!document.getElementById('root'),
      rootChildren: document.getElementById('root')?.children.length || 0,
      bodyText: document.body.innerText.substring(0, 200),
      visibleButtons: document.querySelectorAll('button:not([style*="display: none"])').length,
      visibleLinks: document.querySelectorAll('a:not([style*="display: none"])').length,
      hasMuiElements: document.querySelectorAll('[class*="Mui"]').length > 0,
      hasDrawer: document.querySelectorAll('[class*="Drawer"], [class*="drawer"]').length > 0,
      hasAppBar: document.querySelectorAll('[class*="AppBar"], [class*="appbar"], header').length > 0
    };
  });
  
  console.log('\n📊 Page Content:');
  console.log('  Title:', pageContent.title);
  console.log('  Root children:', pageContent.rootChildren);
  console.log('  Visible buttons:', pageContent.visibleButtons);
  console.log('  Visible links:', pageContent.visibleLinks);
  console.log('  Has MUI elements:', pageContent.hasMuiElements);
  console.log('  Has drawer:', pageContent.hasDrawer);
  console.log('  Has app bar:', pageContent.hasAppBar);
  console.log('  Body text preview:', pageContent.bodyText);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/final-page.png', fullPage: true });
  console.log('\n📸 Screenshot saved: test-results/final-page.png');
  
  // Check for specific elements
  const hasContent = await page.evaluate(() => {
    const checks = {
      hasMenuButton: document.querySelector('button[aria-label*="menu" i]') !== null,
      hasTitle: document.querySelector('h1, h2, h3, h4, h5, h6') !== null,
      hasNavigation: document.querySelector('nav, [role="navigation"]') !== null,
      hasMainContent: document.querySelector('main, [role="main"]') !== null
    };
    return checks;
  });
  
  console.log('\n🔍 Element Checks:');
  console.log('  Has menu button:', hasContent.hasMenuButton);
  console.log('  Has title:', hasContent.hasTitle);
  console.log('  Has navigation:', hasContent.hasNavigation);
  console.log('  Has main content:', hasContent.hasMainContent);
  
  // Test interactivity
  if (pageContent.visibleButtons > 0) {
    try {
      const firstButton = page.locator('button').first();
      await firstButton.click({ timeout: 2000 });
      console.log('\n✅ Page is interactive - button clicked successfully');
    } catch (e) {
      console.log('\n⚠️  Could not click button');
    }
  }
  
  // Final verdict
  console.log('\n========== VERDICT ==========');
  
  if (reactMounted && pageContent.rootChildren > 0) {
    console.log('✅ PAGE IS LOADING CORRECTLY!');
    console.log('   React has mounted and rendered content');
    
    if (pageContent.hasMuiElements) {
      console.log('   Material-UI components are present');
    }
    
    if (pageContent.visibleButtons > 0 || pageContent.visibleLinks > 0) {
      console.log('   Interactive elements are available');
    }
    
    expect(reactMounted).toBe(true);
    expect(pageContent.rootChildren).toBeGreaterThan(0);
  } else {
    console.log('❌ PAGE IS STILL BLANK');
    console.log('   React mounted:', reactMounted);
    console.log('   Root children:', pageContent.rootChildren);
    
    // This will fail the test if page is blank
    expect(reactMounted).toBe(true);
  }
});
