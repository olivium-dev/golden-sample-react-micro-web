const { chromium } = require('playwright');

async function testNavigationClick() {
  console.log('🔍 TESTING NAVIGATION CLICK BEHAVIOR...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture all navigation events
  let navigationEvents = [];
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      navigationEvents.push({
        type: 'navigation',
        url: frame.url(),
        timestamp: Date.now()
      });
      console.log(`🌐 NAVIGATION: ${frame.url()}`);
    }
  });
  
  // Capture new page/tab opens
  context.on('page', newPage => {
    console.log(`🆕 NEW PAGE OPENED: ${newPage.url()}`);
    navigationEvents.push({
      type: 'new_page',
      url: newPage.url(),
      timestamp: Date.now()
    });
  });
  
  try {
    console.log('🌐 Step 1: Loading container app and logging in...');
    await page.goto('http://192.168.2.73:30002', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Login
    const inputs = await page.locator('input').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('admin@example.com');
      await inputs[1].fill('admin123');
      await page.locator('button[type="submit"]').click();
      
      console.log('⏳ Waiting for authentication...');
      await page.waitForTimeout(8000);
    }
    
    // Verify we're in the main app
    const isInMainApp = await page.evaluate(() => {
      return {
        hasDrawer: !!document.querySelector('.MuiDrawer-root'),
        hasAppBar: !!document.querySelector('.MuiAppBar-root'),
        url: window.location.href,
        title: document.title
      };
    });
    
    console.log('\n📊 MAIN APP STATUS:');
    console.log(`URL: ${isInMainApp.url}`);
    console.log(`Has Drawer: ${isInMainApp.hasDrawer ? '✅' : '❌'}`);
    console.log(`Has AppBar: ${isInMainApp.hasAppBar ? '✅' : '❌'}`);
    
    if (isInMainApp.hasDrawer && isInMainApp.hasAppBar) {
      console.log('\n🖱️  Step 2: Testing navigation clicks...');
      
      // Take screenshot before clicking
      await page.screenshot({ 
        path: 'before-navigation-click.png',
        fullPage: true 
      });
      console.log('📸 Screenshot: before-navigation-click.png');
      
      // Find User Management button
      const userMgmtButtons = await page.getByText('User Management').all();
      console.log(`Found ${userMgmtButtons.length} "User Management" elements`);
      
      if (userMgmtButtons.length > 0) {
        console.log('🖱️  Clicking on User Management...');
        
        // Clear navigation events
        navigationEvents = [];
        
        // Click the first User Management button (sidebar)
        await userMgmtButtons[0].click();
        
        console.log('⏳ Waiting for response...');
        await page.waitForTimeout(5000);
        
        // Check what happened
        const afterClick = await page.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            hasDrawer: !!document.querySelector('.MuiDrawer-root'),
            hasAppBar: !!document.querySelector('.MuiAppBar-root'),
            hasDataGrid: !!document.querySelector('.MuiDataGrid-root'),
            bodyText: document.body.innerText.substring(0, 300)
          };
        });
        
        console.log('\n📊 AFTER CLICKING USER MANAGEMENT:');
        console.log('===================================');
        console.log(`URL: ${afterClick.url}`);
        console.log(`Title: ${afterClick.title}`);
        console.log(`Has Drawer: ${afterClick.hasDrawer ? '✅' : '❌'}`);
        console.log(`Has AppBar: ${afterClick.hasAppBar ? '✅' : '❌'}`);
        console.log(`Has DataGrid: ${afterClick.hasDataGrid ? '✅' : '❌'}`);
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: 'after-navigation-click.png',
          fullPage: true 
        });
        console.log('📸 Screenshot: after-navigation-click.png');
        
        console.log('\n🌐 NAVIGATION EVENTS:');
        console.log('=====================');
        if (navigationEvents.length === 0) {
          console.log('✅ No navigation events - staying in same page (GOOD)');
        } else {
          navigationEvents.forEach((event, index) => {
            console.log(`${index + 1}. ${event.type.toUpperCase()}: ${event.url}`);
          });
        }
        
        // Analyze the result
        if (afterClick.url !== isInMainApp.url) {
          console.log('\n❌ PROBLEM: URL CHANGED - User was redirected!');
          console.log(`   Before: ${isInMainApp.url}`);
          console.log(`   After:  ${afterClick.url}`);
        } else if (!afterClick.hasDrawer || !afterClick.hasAppBar) {
          console.log('\n❌ PROBLEM: Container layout disappeared!');
          console.log('   The micro-frontend took over the full page');
        } else {
          console.log('\n✅ SUCCESS: Micro-frontend loaded within container');
        }
        
        // Test another navigation
        console.log('\n🖱️  Testing Data Grid navigation...');
        const dataGridButtons = await page.getByText('Data Grid').all();
        if (dataGridButtons.length > 0) {
          navigationEvents = [];
          await dataGridButtons[0].click();
          await page.waitForTimeout(3000);
          
          const afterDataGrid = await page.evaluate(() => {
            return {
              url: window.location.href,
              hasDrawer: !!document.querySelector('.MuiDrawer-root'),
              hasAppBar: !!document.querySelector('.MuiAppBar-root')
            };
          });
          
          console.log(`Data Grid URL: ${afterDataGrid.url}`);
          console.log(`Still has container: ${afterDataGrid.hasDrawer && afterDataGrid.hasAppBar ? '✅' : '❌'}`);
        }
        
      } else {
        console.log('❌ Could not find User Management button');
      }
      
    } else {
      console.log('❌ Not in main app - authentication may have failed');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigationClick().catch(console.error);
