import { test, expect } from '@playwright/test';

test('Debug blank page - capture all issues', async ({ page, context }) => {
  console.log('\n========== DEBUGGING BLANK PAGE ISSUE ==========\n');
  
  const errors: any[] = [];
  const warnings: any[] = [];
  const logs: any[] = [];
  const networkErrors: any[] = [];
  
  // Capture ALL console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push({
        type: 'console-error',
        text,
        location: msg.location(),
        args: msg.args()
      });
      console.log(`❌ CONSOLE ERROR: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log(`⚠️  WARNING: ${text}`);
    } else {
      logs.push(`[${type}] ${text}`);
    }
  });
  
  // Capture page errors (JavaScript exceptions)
  page.on('pageerror', (error) => {
    errors.push({
      type: 'page-error',
      message: error.message,
      stack: error.stack
    });
    console.log(`💥 PAGE ERROR: ${error.message}`);
    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }
  });
  
  // Capture failed network requests
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    networkErrors.push({
      url: request.url(),
      method: request.method(),
      error: failure?.errorText
    });
    console.log(`🔴 NETWORK FAILED: ${request.method()} ${request.url()} - ${failure?.errorText}`);
  });
  
  // Capture responses
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    
    if (status >= 400) {
      console.log(`🔴 HTTP ${status}: ${url}`);
    } else if (url.includes('.js') && status === 200) {
      console.log(`✅ Loaded: ${url.split('/').pop()}`);
    }
  });
  
  console.log('\n--- Navigating to http://localhost:3000 ---\n');
  
  try {
    // Navigate with timeout
    const response = await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log(`📄 Page loaded with status: ${response?.status()}`);
    
    // Wait for potential React mounting
    await page.waitForTimeout(5000);
    
    // Check what's actually in the DOM
    const domInfo = await page.evaluate(() => {
      const root = document.getElementById('root');
      const body = document.body;
      
      return {
        // Root element info
        rootExists: !!root,
        rootHTML: root?.innerHTML || 'NO ROOT ELEMENT',
        rootChildren: root?.children.length || 0,
        rootText: root?.textContent?.trim() || 'EMPTY',
        
        // Body info
        bodyHTML: body.innerHTML.substring(0, 500),
        bodyText: body.textContent?.trim().substring(0, 200) || 'NO TEXT',
        
        // Check for React
        hasReact: !!(window as any).React,
        hasReactDOM: !!(window as any).ReactDOM,
        reactDevTools: !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__,
        
        // Check for webpack/module federation
        webpackChunks: (window as any).__webpack_modules__ ? Object.keys((window as any).__webpack_modules__).length : 0,
        webpackRequire: typeof (window as any).__webpack_require__ !== 'undefined',
        
        // Get all script tags
        scripts: Array.from(document.querySelectorAll('script')).map(s => ({
          src: s.src || 'inline',
          loaded: s.src ? true : false
        })),
        
        // Check for any visible content
        visibleElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 el.textContent?.trim() && 
                 el.textContent.trim().length > 0;
        }).length
      };
    });
    
    console.log('\n========== DOM ANALYSIS ==========');
    console.log('Root exists:', domInfo.rootExists);
    console.log('Root HTML:', domInfo.rootHTML);
    console.log('Root children count:', domInfo.rootChildren);
    console.log('Root text:', domInfo.rootText);
    console.log('Visible elements count:', domInfo.visibleElements);
    
    console.log('\n========== REACT STATUS ==========');
    console.log('Has React:', domInfo.hasReact);
    console.log('Has ReactDOM:', domInfo.hasReactDOM);
    console.log('React DevTools:', domInfo.reactDevTools);
    
    console.log('\n========== WEBPACK STATUS ==========');
    console.log('Webpack require available:', domInfo.webpackRequire);
    console.log('Webpack chunks loaded:', domInfo.webpackChunks);
    
    console.log('\n========== SCRIPTS LOADED ==========');
    domInfo.scripts.forEach(s => console.log(`  ${s.src}`));
    
    // Try to check Module Federation status
    const mfStatus = await page.evaluate(() => {
      try {
        const wpr = (window as any).__webpack_require__;
        if (!wpr) return { available: false, error: 'No webpack require' };
        
        // Check if shared modules are available
        const sharedScopes = (window as any).__webpack_share_scopes__;
        
        return {
          available: true,
          hasShareScopes: !!sharedScopes,
          shareScopes: sharedScopes ? Object.keys(sharedScopes) : [],
          federationInitialized: !!(window as any).__webpack_init_sharing__
        };
      } catch (e: any) {
        return { available: false, error: e.message };
      }
    });
    
    console.log('\n========== MODULE FEDERATION STATUS ==========');
    console.log('MF Status:', JSON.stringify(mfStatus, null, 2));
    
    // Check for specific container initialization
    const containerStatus = await page.evaluate(() => {
      try {
        // Check if container exposed anything
        const container = (window as any).container;
        
        // Check for remote containers
        const remotes = {
          userApp: !!(window as any).userApp,
          dataApp: !!(window as any).dataApp,
          analyticsApp: !!(window as any).analyticsApp,
          settingsApp: !!(window as any).settingsApp,
          ordersApp: !!(window as any).ordersApp,
          catalogApp: !!(window as any).catalogApp,
        };
        
        return {
          containerExposed: !!container,
          remotes,
          windowKeys: Object.keys(window).filter(k => k.includes('App') || k.includes('container'))
        };
      } catch (e: any) {
        return { error: e.message };
      }
    });
    
    console.log('\n========== CONTAINER STATUS ==========');
    console.log('Container Status:', JSON.stringify(containerStatus, null, 2));
    
    // Final error summary
    console.log('\n========== ERROR SUMMARY ==========');
    console.log(`Total Errors: ${errors.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    
    if (errors.length > 0) {
      console.log('\n=== All Errors ===');
      errors.forEach((e, i) => {
        console.log(`\nError ${i + 1}:`);
        console.log(JSON.stringify(e, null, 2));
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n=== Network Errors ===');
      networkErrors.forEach(e => console.log(`  ${e.method} ${e.url}: ${e.error}`));
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/blank-page-debug.png', 
      fullPage: true 
    });
    
    // Save page HTML
    const html = await page.content();
    require('fs').writeFileSync('test-results/page-content.html', html);
    
    console.log('\n========== DIAGNOSTICS COMPLETE ==========');
    console.log('Screenshot saved: test-results/blank-page-debug.png');
    console.log('HTML saved: test-results/page-content.html');
    
    // Diagnosis
    console.log('\n========== DIAGNOSIS ==========');
    
    if (domInfo.rootChildren === 0) {
      console.log('❌ PROBLEM: React is not rendering anything to #root');
      
      if (errors.length > 0) {
        console.log('   → JavaScript errors are preventing React from mounting');
      } else if (!domInfo.hasReact) {
        console.log('   → React is not loaded');
      } else if (!mfStatus.available) {
        console.log('   → Webpack/Module Federation not initialized');
      } else {
        console.log('   → React app failed to initialize (check index.tsx/App.tsx)');
      }
    }
    
    if (networkErrors.length > 0) {
      console.log('❌ PROBLEM: Network requests are failing');
      console.log('   → Some micro-frontends may not be accessible');
    }
    
  } catch (error: any) {
    console.log('❌ CRITICAL ERROR during test:', error.message);
  }
});
