import { test, expect } from '@playwright/test';

test('Test navigation logic - how cards actually work', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING NAVIGATION LOGIC');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // First, understand the current state
  const initialState = await page.evaluate(() => {
    return {
      url: window.location.href,
      activeTab: (window as any).activeTab || 'unknown',
      hasReactState: !!(window as any).React,
      menuItems: Array.from(document.querySelectorAll('[class*="Card"]')).map(card => ({
        text: card.textContent?.trim().substring(0, 50),
        hasButton: card.querySelector('button') !== null,
        buttonText: card.querySelector('button')?.textContent?.trim()
      }))
    };
  });

  console.log('📊 Initial State:');
  console.log(`   URL: ${initialState.url}`);
  console.log(`   Active Tab: ${initialState.activeTab}`);
  console.log(`   Menu Cards: ${initialState.menuItems.length}`);
  
  initialState.menuItems.forEach((item, index) => {
    console.log(`   ${index + 1}. "${item.text}" - Button: "${item.buttonText}"`);
  });

  // Test clicking User Management card and see what happens
  console.log('\n🧪 Testing User Management Card Click...');
  
  const userMgmtCard = page.locator('[class*="Card"]:has-text("User Management")').first();
  const userMgmtButton = page.locator('[class*="Card"]:has-text("User Management") button').first();
  
  console.log('   🎯 Found card, inspecting click behavior...');
  
  // Check what the button actually does
  const buttonInfo = await userMgmtButton.evaluate((button) => {
    return {
      onclick: button.getAttribute('onclick'),
      type: button.getAttribute('type'),
      className: button.className,
      textContent: button.textContent,
      hasEventListeners: (button as any).__reactEventHandlers !== undefined
    };
  });
  
  console.log('   📋 Button Info:');
  console.log(`      Text: "${buttonInfo.textContent}"`);
  console.log(`      Type: ${buttonInfo.type}`);
  console.log(`      OnClick: ${buttonInfo.onclick}`);
  console.log(`      Has React Handlers: ${buttonInfo.hasEventListeners}`);

  // Click and monitor state changes
  await userMgmtButton.click({ force: true });
  console.log('   🖱️  Clicked button');
  
  await page.waitForTimeout(3000);

  // Check what changed
  const afterClickState = await page.evaluate(() => {
    return {
      url: window.location.href,
      activeTab: (window as any).activeTab || 'unknown',
      currentContent: document.body.innerText.substring(0, 300),
      hasNavigated: !document.body.innerText.includes('Dashboard Overview'),
      rootContent: document.getElementById('root')?.innerHTML.substring(0, 200)
    };
  });

  console.log('   📊 After Click:');
  console.log(`      URL: ${afterClickState.url}`);
  console.log(`      Active Tab: ${afterClickState.activeTab}`);
  console.log(`      Has Navigated: ${afterClickState.hasNavigated}`);
  console.log(`      Content Preview: "${afterClickState.currentContent.replace(/\s+/g, ' ').trim().substring(0, 100)}..."`);

  if (afterClickState.hasNavigated) {
    console.log('   ✅ NAVIGATION WORKED - Content changed');
  } else {
    console.log('   ❌ NAVIGATION FAILED - Still showing dashboard');
  }

  // Take screenshots
  await page.screenshot({ path: 'test-results/navigation-test-after-click.png', fullPage: true });

  console.log('\n========================================');
  console.log('🎯 NAVIGATION DIAGNOSIS');
  console.log('========================================');
  
  if (afterClickState.hasNavigated) {
    console.log('✅ Card clicks are working - navigation is functional');
    console.log('   Issue may be with micro-frontend loading, not navigation');
  } else {
    console.log('❌ Card clicks are NOT working - navigation is broken');
    console.log('   Need to fix the card click handlers');
  }
  
  console.log('========================================\n');
});
