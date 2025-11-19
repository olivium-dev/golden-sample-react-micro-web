import { test, expect } from '@playwright/test';

test('Check React state management and navigation', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 CHECKING REACT STATE MANAGEMENT');
  console.log('========================================\n');

  const jsErrors: string[] = [];
  
  // Capture all JavaScript errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
      console.log(`🔴 JS ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    jsErrors.push(`PAGE ERROR: ${error.message}`);
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log(`📊 JavaScript Errors on Load: ${jsErrors.length}`);

  // Test React state by directly calling the function
  const stateTest = await page.evaluate(() => {
    try {
      // Check if React is working
      const root = document.getElementById('root');
      const reactFiberKey = Object.keys(root || {}).find(key => key.startsWith('__reactFiber'));
      const hasReactFiber = !!reactFiberKey;
      
      // Try to find the App component instance
      let appInstance = null;
      if (reactFiberKey && root) {
        const fiber = (root as any)[reactFiberKey];
        // Navigate the fiber tree to find the App component
        let currentFiber = fiber;
        while (currentFiber && !appInstance) {
          if (currentFiber.type && currentFiber.type.name === 'App') {
            appInstance = currentFiber;
            break;
          }
          currentFiber = currentFiber.child || currentFiber.sibling || currentFiber.return;
        }
      }
      
      return {
        hasReact: !!(window as any).React,
        hasReactDOM: !!(window as any).ReactDOM,
        hasReactFiber,
        hasAppInstance: !!appInstance,
        reactVersion: (window as any).React?.version || 'unknown'
      };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  console.log('⚛️  React State Check:');
  console.log(`   Has React: ${stateTest.hasReact}`);
  console.log(`   Has ReactDOM: ${stateTest.hasReactDOM}`);
  console.log(`   Has React Fiber: ${stateTest.hasReactFiber}`);
  console.log(`   Has App Instance: ${stateTest.hasAppInstance}`);
  console.log(`   React Version: ${stateTest.reactVersion}`);

  // Test manual state change
  console.log('\n🧪 Testing Manual State Change...');
  
  const manualStateTest = await page.evaluate(() => {
    try {
      // Try to manually trigger a state change
      const buttons = document.querySelectorAll('button');
      let buttonClicked = false;
      
      // Find a button that should trigger navigation
      for (const button of buttons) {
        if (button.textContent?.includes('Open Module')) {
          // Simulate a click event
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          
          button.dispatchEvent(clickEvent);
          buttonClicked = true;
          break;
        }
      }
      
      return {
        buttonClicked,
        totalButtons: buttons.length,
        currentContent: document.body.innerText.substring(0, 200)
      };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  console.log(`   Button Clicked: ${manualStateTest.buttonClicked}`);
  console.log(`   Total Buttons: ${manualStateTest.totalButtons}`);
  
  await page.waitForTimeout(2000);

  // Check if content changed after manual click
  const afterManualClick = await page.evaluate(() => {
    return {
      content: document.body.innerText.substring(0, 200),
      stillShowsDashboard: document.body.innerText.includes('Dashboard Overview')
    };
  });

  console.log(`   Still Shows Dashboard: ${afterManualClick.stillShowsDashboard}`);

  if (afterManualClick.stillShowsDashboard) {
    console.log('   ❌ Manual click also failed - React state updates not working');
  } else {
    console.log('   ✅ Manual click worked - Issue is with Playwright clicking');
  }

  // Final error summary
  console.log(`\n🚨 Total JavaScript Errors: ${jsErrors.length}`);
  if (jsErrors.length > 0) {
    console.log('   Recent errors:');
    jsErrors.slice(-5).forEach(error => {
      console.log(`   - ${error.substring(0, 100)}...`);
    });
  }

  console.log('\n========================================');
  if (jsErrors.length === 0 && stateTest.hasReact && stateTest.hasReactFiber) {
    console.log('✅ React is working correctly');
    console.log('   Issue is likely with event handlers or click propagation');
  } else {
    console.log('❌ React or JavaScript issues detected');
    console.log('   Need to fix underlying JavaScript errors first');
  }
  console.log('========================================\n');
});
