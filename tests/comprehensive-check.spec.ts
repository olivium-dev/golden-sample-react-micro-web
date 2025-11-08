import { test, expect } from '@playwright/test';

test('Comprehensive application check', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 COMPREHENSIVE APPLICATION CHECK');
  console.log('========================================\n');

  // Enable console and error monitoring
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ Console Error: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log(`⚠️ Console Warning: ${text}`);
    } else if (type === 'log' && (text.includes('🚀') || text.includes('✅') || text.includes('🔄'))) {
      logs.push(text);
      console.log(`📝 App Log: ${text}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`💥 Page Error: ${error.message}`);
  });

  // Navigate to application
  console.log('\n📊 Loading application...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check page structure
  const pageAnalysis = await page.evaluate(() => {
    const root = document.getElementById('root');
    const body = document.body;
    
    // Check viewport and layout
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const bodyHeight = body.scrollHeight;
    const bodyWidth = body.scrollWidth;
    
    // Check sidebar
    const drawer = document.querySelector('.MuiDrawer-root');
    const drawerPaper = document.querySelector('.MuiDrawer-paper');
    const listItems = document.querySelectorAll('.MuiListItemButton-root');
    
    // Check if elements are in viewport
    const elementsOutsideViewport: string[] = [];
    listItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > viewportHeight || rect.left < 0 || rect.right > viewportWidth) {
        elementsOutsideViewport.push(`MenuItem-${index}: ${(item as HTMLElement).innerText}`);
      }
    });
    
    // Check React
    const hasReact = !!(window as any).React;
    const hasReactDOM = !!(window as any).ReactDOM;
    const reactVersion = hasReact ? (window as any).React.version : 'not found';
    
    // Check Module Federation
    const hasFederationContainer = !!(window as any).__webpack_require__;
    const remotes = (window as any).__webpack_remotes__ || {};
    
    // Check content
    const content = body.innerText || '';
    const buttons = document.querySelectorAll('button');
    const cards = document.querySelectorAll('.MuiCard-root');
    
    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      body: { width: bodyWidth, height: bodyHeight },
      hasOverflow: bodyHeight > viewportHeight || bodyWidth > viewportWidth,
      drawer: {
        exists: !!drawer,
        paperExists: !!drawerPaper,
        paperStyles: drawerPaper ? {
          position: getComputedStyle(drawerPaper).position,
          width: getComputedStyle(drawerPaper).width,
          height: getComputedStyle(drawerPaper).height,
          top: getComputedStyle(drawerPaper).top,
          marginTop: getComputedStyle(drawerPaper).marginTop,
        } : null,
        menuItems: listItems.length,
        elementsOutsideViewport
      },
      react: { hasReact, hasReactDOM, version: reactVersion },
      federation: { hasContainer: hasFederationContainer, remotes: Object.keys(remotes) },
      content: {
        length: content.length,
        hasContent: content.length > 100,
        buttonCount: buttons.length,
        cardCount: cards.length,
        preview: content.substring(0, 200).replace(/\s+/g, ' ')
      }
    };
  });

  console.log('\n📋 Page Analysis:');
  console.log(`   Viewport: ${pageAnalysis.viewport.width}x${pageAnalysis.viewport.height}`);
  console.log(`   Body: ${pageAnalysis.body.width}x${pageAnalysis.body.height}`);
  console.log(`   Has Overflow: ${pageAnalysis.hasOverflow}`);
  console.log(`   React: ${pageAnalysis.react.hasReact ? `✅ v${pageAnalysis.react.version}` : '❌'}`);
  console.log(`   Module Federation: ${pageAnalysis.federation.hasContainer ? '✅' : '❌'}`);
  console.log(`   Drawer: ${pageAnalysis.drawer.exists ? '✅' : '❌'} (${pageAnalysis.drawer.menuItems} items)`);
  
  if (pageAnalysis.drawer.elementsOutsideViewport.length > 0) {
    console.log('\n⚠️ Elements Outside Viewport:');
    pageAnalysis.drawer.elementsOutsideViewport.forEach(el => {
      console.log(`   - ${el}`);
    });
  }
  
  if (pageAnalysis.drawer.paperStyles) {
    console.log('\n📐 Drawer Styles:');
    console.log(`   Position: ${pageAnalysis.drawer.paperStyles.position}`);
    console.log(`   Width: ${pageAnalysis.drawer.paperStyles.width}`);
    console.log(`   Height: ${pageAnalysis.drawer.paperStyles.height}`);
    console.log(`   Top: ${pageAnalysis.drawer.paperStyles.top}`);
    console.log(`   Margin Top: ${pageAnalysis.drawer.paperStyles.marginTop}`);
  }

  // Test clicking menu items
  console.log('\n🧪 Testing Menu Navigation:');
  const menuTests = ['User Management', 'Data Grid', 'Analytics', 'Settings', 'Orders', 'Catalog', 'Error Monitor'];
  
  for (const menuItem of menuTests) {
    console.log(`\n📍 Testing: ${menuItem}`);
    
    // First check if it exists and is visible
    const menuButton = page.locator(`.MuiListItemButton-root:has-text("${menuItem}")`);
    const exists = await menuButton.count() > 0;
    
    if (!exists) {
      console.log(`   ❌ Menu item not found`);
      continue;
    }
    
    // Check visibility
    const isVisible = await menuButton.isVisible();
    if (!isVisible) {
      console.log(`   ⚠️ Menu item not visible`);
      
      // Try to scroll it into view
      try {
        await menuButton.scrollIntoViewIfNeeded();
        console.log(`   📜 Scrolled into view`);
      } catch (e) {
        console.log(`   ❌ Could not scroll into view`);
      }
    }
    
    // Try clicking
    try {
      await menuButton.click({ timeout: 2000 });
      console.log(`   ✅ Clicked successfully`);
      
      // Wait for content change
      await page.waitForTimeout(2000);
      
      // Check what loaded
      const result = await page.evaluate((itemName) => {
        const content = document.body.innerText;
        return {
          contentLength: content.length,
          hasItemName: content.includes(itemName),
          stillOnDashboard: content.includes('Dashboard Overview'),
          preview: content.substring(0, 100).replace(/\s+/g, ' ')
        };
      }, menuItem);
      
      if (!result.stillOnDashboard && result.hasItemName) {
        console.log(`   ✅ Navigation successful - content loaded`);
      } else if (!result.stillOnDashboard) {
        console.log(`   ⚠️ Navigated but content incomplete`);
      } else {
        console.log(`   ❌ Navigation failed - still on dashboard`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Click failed: ${error.message.split('\n')[0]}`);
    }
  }

  // Check for Module Federation errors
  console.log('\n🔍 Checking Module Federation Status:');
  const federationStatus = await page.evaluate(() => {
    const checkRemote = (name: string) => {
      try {
        const container = (window as any)[name];
        return container ? 'loaded' : 'not loaded';
      } catch (e) {
        return 'error';
      }
    };
    
    return {
      userApp: checkRemote('userApp'),
      dataApp: checkRemote('dataApp'),
      analyticsApp: checkRemote('analyticsApp'),
      settingsApp: checkRemote('settingsApp'),
      ordersApp: checkRemote('ordersApp'),
      catalogApp: checkRemote('catalogApp')
    };
  });
  
  Object.entries(federationStatus).forEach(([app, status]) => {
    const icon = status === 'loaded' ? '✅' : status === 'not loaded' ? '⚠️' : '❌';
    console.log(`   ${icon} ${app}: ${status}`);
  });

  // Final summary
  console.log('\n========================================');
  console.log('📊 ISSUES IDENTIFIED:');
  console.log('========================================');
  
  const issues: string[] = [];
  
  if (pageAnalysis.drawer.elementsOutsideViewport.length > 0) {
    issues.push('1. Sidebar menu items are outside viewport (layout issue)');
  }
  
  if (errors.length > 0) {
    issues.push(`2. JavaScript errors detected (${errors.length} errors)`);
  }
  
  if (!pageAnalysis.react.hasReact) {
    issues.push('3. React not properly initialized');
  }
  
  const notLoadedApps = Object.entries(federationStatus).filter(([_, status]) => status !== 'loaded');
  if (notLoadedApps.length > 0) {
    issues.push(`4. Module Federation apps not loaded: ${notLoadedApps.map(([app]) => app).join(', ')}`);
  }
  
  if (issues.length === 0) {
    console.log('✅ No critical issues found!');
  } else {
    issues.forEach(issue => console.log(`❌ ${issue}`));
  }
  
  console.log('\n========================================\n');

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    pageAnalysis,
    federationStatus,
    errors,
    warnings,
    issues
  };
  
  require('fs').writeFileSync(
    'test-results/comprehensive-check-report.json',
    JSON.stringify(report, null, 2)
  );

  // Take screenshot
  await page.screenshot({ path: 'test-results/comprehensive-check.png', fullPage: true });
});
