import { test, expect } from '@playwright/test';

test('Debug page content', async ({ page }) => {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait a bit for React to render
  await page.waitForTimeout(5000);
  
  // Get page HTML
  const html = await page.content();
  console.log('Page HTML length:', html.length);
  console.log('Page HTML (first 2000 chars):', html.substring(0, 2000));
  
  // Check root element
  const root = await page.locator('#root').first();
  const rootCount = await root.count();
  console.log('Root element count:', rootCount);
  
  if (rootCount > 0) {
    const rootHTML = await root.innerHTML();
    console.log('Root innerHTML length:', rootHTML.length);
    console.log('Root innerHTML (first 1000 chars):', rootHTML.substring(0, 1000));
    
    const rootVisible = await root.isVisible();
    console.log('Root visible:', rootVisible);
    
    const rootDisplay = await root.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        height: style.height,
        width: style.width
      };
    });
    console.log('Root computed styles:', rootDisplay);
  }
  
  // Check body content
  const bodyText = await page.textContent('body');
  console.log('Body text length:', bodyText?.length);
  console.log('Body text (first 500 chars):', bodyText?.substring(0, 500));
  
  // Check for any visible elements
  const visibleElements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const visible: string[] = [];
    all.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        if (el.tagName && el.textContent && el.textContent.trim().length > 0) {
          visible.push(`${el.tagName}: ${el.textContent.substring(0, 50)}`);
        }
      }
    });
    return visible.slice(0, 20);
  });
  console.log('Visible elements:', visibleElements);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-page.png', fullPage: true });
  console.log('Screenshot saved to test-results/debug-page.png');
});

