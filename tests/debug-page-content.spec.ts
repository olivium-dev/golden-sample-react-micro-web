import { test } from '@playwright/test';

test('Debug page content', async ({ page }) => {
  console.log('\n🔍 Debugging page content...\n');
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText?.substring(0, 500) || 'EMPTY',
      htmlLength: document.documentElement.innerHTML.length,
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a').length,
      divs: document.querySelectorAll('div').length,
      rootContent: document.getElementById('root')?.innerHTML?.substring(0, 200) || 'NO ROOT',
      hasReact: !!(window as any).React,
      hasReactDOM: !!(window as any).ReactDOM,
    };
  });
  
  console.log('Page Info:');
  console.log('  Title:', pageInfo.title);
  console.log('  HTML Length:', pageInfo.htmlLength);
  console.log('  Buttons:', pageInfo.buttons);
  console.log('  Links:', pageInfo.links);
  console.log('  Divs:', pageInfo.divs);
  console.log('  Has React:', pageInfo.hasReact);
  console.log('  Has ReactDOM:', pageInfo.hasReactDOM);
  console.log('  Body Text:', pageInfo.bodyText);
  console.log('  Root Content:', pageInfo.rootContent);
  
  // Check for errors
  const errors = await page.evaluate(() => {
    const consoleErrors = [];
    const originalError = console.error;
    console.error = (...args) => {
      consoleErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
    return consoleErrors;
  });
  
  if (errors.length > 0) {
    console.log('\nConsole Errors:', errors);
  }
  
  await page.screenshot({ path: 'test-results/debug-page-content.png', fullPage: true });
});
