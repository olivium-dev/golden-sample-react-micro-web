import { test, expect } from '@playwright/test';

test('Capture visible screen errors blocking the interface', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 CAPTURING SCREEN ERRORS');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Take initial screenshot
  await page.screenshot({ path: 'test-results/screen-errors-initial.png', fullPage: true });

  // Look for error overlays, modals, or blocking messages on screen
  const screenErrors = await page.evaluate(() => {
    const errors = [];
    
    // Look for common error UI patterns
    const errorSelectors = [
      // Error overlays and modals
      '[class*="error" i]',
      '[class*="Error" i]',
      '[id*="error" i]',
      '[role="alert"]',
      '[role="alertdialog"]',
      
      // Error messages
      'div:has-text("Error")',
      'div:has-text("Failed")',
      'div:has-text("Something went wrong")',
      'div:has-text("Unable to load")',
      'div:has-text("Connection refused")',
      'div:has-text("Not found")',
      'div:has-text("500")',
      'div:has-text("404")',
      
      // React error boundaries
      '[class*="error-boundary" i]',
      '[class*="ErrorBoundary" i]',
      
      // Webpack/Module Federation errors
      'div:has-text("ChunkLoadError")',
      'div:has-text("Loading chunk")',
      'div:has-text("Module Federation")',
      'div:has-text("remoteEntry")',
      
      // Network/API errors
      'div:has-text("ERR_CONNECTION_REFUSED")',
      'div:has-text("ERR_ABORTED")',
      'div:has-text("Network Error")',
      'div:has-text("API Error")',
      
      // Generic error states
      '.error',
      '.Error',
      '.error-message',
      '.error-container',
      '.error-overlay'
    ];

    errorSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent?.trim();
          const isVisible = window.getComputedStyle(element).display !== 'none' && 
                           window.getComputedStyle(element).visibility !== 'hidden' &&
                           window.getComputedStyle(element).opacity !== '0';
          
          if (text && text.length > 0 && isVisible) {
            const rect = element.getBoundingClientRect();
            errors.push({
              selector,
              text: text.substring(0, 500),
              className: element.className,
              id: element.id,
              tagName: element.tagName,
              visible: isVisible,
              position: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              },
              styles: {
                backgroundColor: window.getComputedStyle(element).backgroundColor,
                color: window.getComputedStyle(element).color,
                fontSize: window.getComputedStyle(element).fontSize,
                zIndex: window.getComputedStyle(element).zIndex
              }
            });
          }
        });
      } catch (e) {
        // Continue with other selectors
      }
    });

    // Also check for any red/error colored elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      const text = element.textContent?.trim();
      
      // Look for red colors or error-like styling
      if ((color.includes('rgb(244, 67, 54)') || // Material-UI error red
           color.includes('#f44336') ||
           color.includes('red') ||
           backgroundColor.includes('rgb(244, 67, 54)') ||
           backgroundColor.includes('#f44336') ||
           backgroundColor.includes('red')) &&
          text && text.length > 10) {
        
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          errors.push({
            selector: 'RED_COLORED_ELEMENT',
            text: text.substring(0, 300),
            className: element.className,
            tagName: element.tagName,
            visible: true,
            position: rect,
            styles: {
              color,
              backgroundColor,
              fontSize: style.fontSize
            }
          });
        }
      }
    });

    return errors;
  });

  console.log(`🔍 Found ${screenErrors.length} potential error elements on screen\n`);

  if (screenErrors.length > 0) {
    console.log('🚨 VISIBLE SCREEN ERRORS:');
    console.log('─'.repeat(80));
    
    screenErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.tagName} (${error.selector})`);
      console.log(`   Class: ${error.className}`);
      console.log(`   Position: ${Math.round(error.position.top)}px from top, ${Math.round(error.position.left)}px from left`);
      console.log(`   Size: ${Math.round(error.position.width)}x${Math.round(error.position.height)}px`);
      console.log(`   Colors: ${error.styles.color} on ${error.styles.backgroundColor}`);
      console.log(`   Text: "${error.text}"`);
      console.log('   ' + '─'.repeat(60));
    });
  }

  // Look for specific blocking overlays
  const blockingElements = await page.evaluate(() => {
    const blocking = [];
    
    // Look for elements that cover the whole screen
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      // Check if element is covering significant screen real estate
      if (rect.width > window.innerWidth * 0.8 && 
          rect.height > window.innerHeight * 0.5 &&
          (style.position === 'fixed' || style.position === 'absolute') &&
          parseInt(style.zIndex) > 1000) {
        
        blocking.push({
          tagName: element.tagName,
          className: element.className,
          text: element.textContent?.substring(0, 200),
          zIndex: style.zIndex,
          position: style.position,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
        });
      }
    });
    
    return blocking;
  });

  if (blockingElements.length > 0) {
    console.log('\n🚫 BLOCKING OVERLAYS DETECTED:');
    console.log('─'.repeat(80));
    
    blockingElements.forEach((element, index) => {
      console.log(`\n${index + 1}. ${element.tagName} - BLOCKING OVERLAY`);
      console.log(`   Class: ${element.className}`);
      console.log(`   Size: ${element.size}`);
      console.log(`   Z-Index: ${element.zIndex}`);
      console.log(`   Position: ${element.position}`);
      console.log(`   Content: "${element.text}"`);
    });
  }

  // Check for React error boundaries
  const reactErrors = await page.evaluate(() => {
    const reactErrorBoundaries = [];
    
    // Look for React error boundary messages
    const errorBoundarySelectors = [
      'div:has-text("Something went wrong")',
      'div:has-text("Error Boundary")',
      'div:has-text("Component Error")',
      'div:has-text("React Error")',
      '[class*="error-boundary" i]'
    ];
    
    errorBoundarySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            reactErrorBoundaries.push({
              text: text.substring(0, 300),
              className: element.className,
              visible: window.getComputedStyle(element).display !== 'none'
            });
          }
        });
      } catch (e) {
        // Continue
      }
    });
    
    return reactErrorBoundaries;
  });

  if (reactErrors.length > 0) {
    console.log('\n⚛️  REACT ERROR BOUNDARIES:');
    console.log('─'.repeat(80));
    
    reactErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. React Error Boundary`);
      console.log(`   Visible: ${error.visible}`);
      console.log(`   Class: ${error.className}`);
      console.log(`   Message: "${error.text}"`);
    });
  }

  // Take final screenshot highlighting errors
  await page.screenshot({ path: 'test-results/screen-errors-final.png', fullPage: true });

  // Generate summary
  console.log('\n========================================');
  console.log('📊 SCREEN ERROR SUMMARY');
  console.log('========================================');
  console.log(`Total Error Elements: ${screenErrors.length}`);
  console.log(`Blocking Overlays: ${blockingElements.length}`);
  console.log(`React Error Boundaries: ${reactErrors.length}`);
  
  const totalIssues = screenErrors.length + blockingElements.length + reactErrors.length;
  
  if (totalIssues > 0) {
    console.log(`\n🚨 ${totalIssues} VISIBLE ISSUES BLOCKING THE INTERFACE`);
    console.log('Screenshots saved:');
    console.log('  - test-results/screen-errors-initial.png');
    console.log('  - test-results/screen-errors-final.png');
  } else {
    console.log('\n✅ NO VISIBLE BLOCKING ERRORS DETECTED');
  }
  console.log('========================================\n');

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalErrorElements: screenErrors.length,
      blockingOverlays: blockingElements.length,
      reactErrorBoundaries: reactErrors.length,
      totalIssues
    },
    screenErrors,
    blockingElements,
    reactErrors
  };

  require('fs').writeFileSync(
    'test-results/screen-errors-report.json',
    JSON.stringify(report, null, 2)
  );

  // Fail if there are blocking issues
  if (totalIssues > 0) {
    throw new Error(`Found ${totalIssues} visible errors blocking the interface. Check screenshots and report.`);
  }
});
