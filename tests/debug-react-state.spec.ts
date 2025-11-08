import { test, expect } from '@playwright/test';

test('Debug React state management issue', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 DEBUGGING REACT STATE ISSUE');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check React state directly
  const reactState = await page.evaluate(() => {
    try {
      // Find the React root and get the App component state
      const root = document.getElementById('root');
      if (!root) return { error: 'No root element' };

      // Look for React fiber
      const reactFiberKey = Object.keys(root).find(key => key.startsWith('__reactFiber'));
      if (!reactFiberKey) return { error: 'No React fiber found' };

      const fiber = (root as any)[reactFiberKey];
      
      // Navigate to find the App component
      let appFiber = fiber;
      let attempts = 0;
      while (appFiber && attempts < 20) {
        if (appFiber.type?.name === 'App' || appFiber.elementType?.name === 'App') {
          break;
        }
        appFiber = appFiber.child || appFiber.sibling || appFiber.return;
        attempts++;
      }

      if (!appFiber) return { error: 'App component not found' };

      // Get the state
      const memoizedState = appFiber.memoizedState;
      let currentState = memoizedState;
      const stateValues = [];
      
      while (currentState && stateValues.length < 10) {
        stateValues.push(currentState.memoizedState);
        currentState = currentState.next;
      }

      return {
        success: true,
        appFound: true,
        stateValues,
        fiberType: appFiber.type?.name || 'unknown'
      };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  console.log('⚛️  React State Analysis:');
  console.log(JSON.stringify(reactState, null, 2));

  // Test manual state change
  console.log('\n🧪 Testing Manual State Change...');
  
  const manualStateChange = await page.evaluate(() => {
    try {
      // Try to manually call setActiveTab
      const root = document.getElementById('root');
      const reactFiberKey = Object.keys(root || {}).find(key => key.startsWith('__reactFiber'));
      
      if (reactFiberKey && root) {
        const fiber = (root as any)[reactFiberKey];
        
        // Try to find and call setActiveTab directly
        // This is a hack but will tell us if the state system works
        let appFiber = fiber;
        let attempts = 0;
        while (appFiber && attempts < 20) {
          if (appFiber.type?.name === 'App') {
            // Found the App component
            const hooks = appFiber.memoizedState;
            if (hooks) {
              // Try to trigger a state update
              console.log('Found App component with hooks');
              return { success: true, foundApp: true };
            }
          }
          appFiber = appFiber.child || appFiber.sibling || appFiber.return;
          attempts++;
        }
      }
      
      return { success: false, error: 'Could not find App state' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('Manual state test:', manualStateChange);

  // Test if clicking actually triggers any JavaScript
  console.log('\n🧪 Testing Click Event Propagation...');
  
  const clickTest = await page.evaluate(() => {
    let clickDetected = false;
    
    // Add a global click listener
    const clickListener = () => {
      clickDetected = true;
      console.log('Global click detected');
    };
    
    document.addEventListener('click', clickListener);
    
    // Find and click a button
    const button = document.querySelector('[class*="Card"] button');
    if (button) {
      button.click();
      
      // Remove listener
      setTimeout(() => {
        document.removeEventListener('click', clickListener);
      }, 100);
      
      return { 
        success: true, 
        clickDetected, 
        buttonText: button.textContent,
        buttonClass: button.className 
      };
    }
    
    return { success: false, error: 'No button found' };
  });

  console.log('Click test result:', clickTest);

  await page.waitForTimeout(2000);

  // Check if anything changed after the click
  const afterClick = await page.evaluate(() => {
    return {
      content: document.body.innerText.substring(0, 200),
      stillShowsDashboard: document.body.innerText.includes('Dashboard Overview')
    };
  });

  console.log(`After programmatic click - Still on dashboard: ${afterClick.stillShowsDashboard}`);

  console.log('\n========================================');
  console.log('🎯 DIAGNOSIS');
  console.log('========================================');
  
  if (reactState.success && clickTest.success && clickTest.clickDetected) {
    if (afterClick.stillShowsDashboard) {
      console.log('❌ REACT STATE UPDATE BROKEN');
      console.log('   - React is loaded');
      console.log('   - Clicks are detected');
      console.log('   - But state is not updating');
      console.log('   - Need to fix handleMenuItemClick function');
    } else {
      console.log('✅ NAVIGATION WORKS');
      console.log('   - Issue is with Playwright automation only');
    }
  } else {
    console.log('❌ FUNDAMENTAL REACT ISSUE');
    console.log('   - React state system is broken');
    console.log('   - Need to fix React initialization');
  }
  
  console.log('========================================\n');
});
