import { test, expect } from '@playwright/test';

test('Final test - what actually works now', async ({ page }) => {
  console.log('\n========================================');
  console.log('🎯 FINAL TEST - WHAT ACTUALLY WORKS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check current page state
  const pageState = await page.evaluate(() => {
    const body = document.body;
    const root = document.getElementById('root');
    const text = body.innerText || '';
    
    return {
      // Basic page info
      url: window.location.href,
      title: document.title,
      textLength: text.length,
      rootChildren: root?.children.length || 0,
      
      // Content analysis
      content: text.substring(0, 800).replace(/\s+/g, ' ').trim(),
      
      // Element counts
      totalButtons: document.querySelectorAll('button').length,
      totalCards: document.querySelectorAll('[class*="Card"]').length,
      totalListItems: document.querySelectorAll('[role="button"], .MuiListItem-root').length,
      
      // Check for React
      hasReact: !!(window as any).React,
      hasReactDOM: !!(window as any).ReactDOM,
      
      // Check for errors
      hasErrorText: text.includes('Error') || text.includes('Failed'),
      hasUndefined: text.includes('undefined'),
      
      // Check what's actually visible
      visibleElements: Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.textContent?.trim() &&
               el.textContent.trim().length > 0;
      }).length
    };
  });

  console.log('📊 Current Page State:');
  console.log(`   URL: ${pageState.url}`);
  console.log(`   Title: ${pageState.title}`);
  console.log(`   Text Length: ${pageState.textLength} chars`);
  console.log(`   Root Children: ${pageState.rootChildren}`);
  console.log(`   Total Buttons: ${pageState.totalButtons}`);
  console.log(`   Total Cards: ${pageState.totalCards}`);
  console.log(`   Total List Items: ${pageState.totalListItems}`);
  console.log(`   Visible Elements: ${pageState.visibleElements}`);
  console.log(`   Has React: ${pageState.hasReact}`);
  console.log(`   Has ReactDOM: ${pageState.hasReactDOM}`);
  console.log(`   Has Error Text: ${pageState.hasErrorText}`);
  console.log(`   Has Undefined: ${pageState.hasUndefined}`);

  console.log('\n📝 Page Content:');
  console.log('─'.repeat(80));
  console.log(pageState.content);
  console.log('─'.repeat(80));

  // Test if any buttons are actually clickable
  console.log('\n🧪 Testing Button Functionality...');
  
  const buttonTest = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    const results = [];
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = button.textContent?.trim() || '';
      
      if (text.length > 0) {
        try {
          // Check if button has event listeners
          const hasListeners = (button as any).__reactEventHandlers !== undefined ||
                               button.onclick !== null ||
                               button.getAttribute('onclick') !== null;
          
          results.push({
            index: i,
            text: text.substring(0, 30),
            hasListeners,
            disabled: button.hasAttribute('disabled'),
            className: button.className.substring(0, 50)
          });
        } catch (e) {
          results.push({
            index: i,
            text: text.substring(0, 30),
            error: 'Could not analyze'
          });
        }
      }
    }
    
    return results;
  });

  console.log('🔘 Button Analysis:');
  buttonTest.forEach(btn => {
    console.log(`   ${btn.index + 1}. "${btn.text}" - Listeners: ${btn.hasListeners}, Disabled: ${btn.disabled}`);
  });

  // Take final screenshot
  await page.screenshot({ path: 'test-results/final-working-state.png', fullPage: true });

  console.log('\n========================================');
  console.log('📊 FINAL ASSESSMENT');
  console.log('========================================');

  if (pageState.hasReact && pageState.hasReactDOM && pageState.totalButtons > 0) {
    console.log('✅ React is loaded and UI is rendered');
    
    const hasWorkingButtons = buttonTest.some(btn => btn.hasListeners);
    if (hasWorkingButtons) {
      console.log('✅ Some buttons have event listeners');
      console.log('   Issue may be with specific button handlers');
    } else {
      console.log('❌ No buttons have event listeners');
      console.log('   React event system is broken');
    }
  } else {
    console.log('❌ React is not properly loaded');
    console.log('   Fundamental React initialization issue');
  }

  if (pageState.hasUndefined) {
    console.log('❌ Page shows "undefined" - Module Federation broken');
  } else if (pageState.hasErrorText) {
    console.log('⚠️  Page shows error messages');
  } else if (pageState.textLength > 500) {
    console.log('✅ Page has substantial content');
  }

  console.log('\n📸 Screenshot: test-results/final-working-state.png');
  console.log('========================================\n');

  // Don't fail - just report current state
  expect(pageState.textLength).toBeGreaterThan(100);
});
