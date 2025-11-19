import { test, expect } from '@playwright/test';

test('Simple navigation test - use sidebar instead of cards', async ({ page }) => {
  console.log('\n========================================');
  console.log('🔍 TESTING SIDEBAR NAVIGATION');
  console.log('========================================\n');

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Look for sidebar menu items instead of cards
  const sidebarItems = await page.evaluate(() => {
    const items = [];
    
    // Look for sidebar navigation items
    const listItems = document.querySelectorAll('[role="button"], .MuiListItem-root, .MuiListItemButton-root');
    
    listItems.forEach((item, index) => {
      const text = item.textContent?.trim();
      if (text && text.length > 1 && text !== 'A' && !text.includes('Welcome')) {
        items.push({
          index,
          text,
          className: item.className,
          isVisible: window.getComputedStyle(item).display !== 'none' &&
                    window.getComputedStyle(item).visibility !== 'hidden'
        });
      }
    });
    
    return items;
  });

  console.log(`📋 Found ${sidebarItems.length} sidebar items:`);
  sidebarItems.forEach((item, index) => {
    console.log(`   ${index + 1}. "${item.text}" (visible: ${item.isVisible})`);
  });

  // Test clicking sidebar items
  const testItems = ['User Management', 'Data Grid', 'Analytics'];
  
  for (const itemName of testItems) {
    console.log(`\n🧪 Testing Sidebar: ${itemName}`);
    
    try {
      // Find sidebar item
      const sidebarItem = page.locator(`[role="button"]:has-text("${itemName}"), .MuiListItemButton-root:has-text("${itemName}")`).first();
      const itemExists = await sidebarItem.count() > 0;
      
      if (!itemExists) {
        console.log(`   ❌ Sidebar item not found`);
        continue;
      }

      // Click sidebar item
      await sidebarItem.click({ force: true });
      console.log(`   🖱️  Clicked sidebar item`);
      
      await page.waitForTimeout(3000);

      // Check result
      const result = await page.evaluate(() => {
        const text = document.body.innerText;
        const stillOnDashboard = text.includes('Dashboard Overview');
        
        return {
          navigated: !stillOnDashboard,
          content: text.substring(0, 300).replace(/\s+/g, ' ').trim(),
          hasUndefined: text.includes('undefined'),
          hasError: text.includes('Failed to load') || text.includes('Error'),
          textLength: text.length
        };
      });

      if (result.navigated) {
        console.log(`   ✅ Navigation worked!`);
        console.log(`   📊 Content: ${result.textLength} chars`);
        console.log(`   📝 Preview: "${result.content.substring(0, 80)}..."`);
        
        if (result.hasUndefined) {
          console.log(`   ❌ But shows "undefined" - Module Federation issue`);
        } else if (result.hasError) {
          console.log(`   ⚠️  Shows error messages`);
        } else {
          console.log(`   ✅ Content loaded successfully`);
        }
      } else {
        console.log(`   ❌ Navigation failed - still on dashboard`);
      }

    } catch (error: any) {
      console.log(`   💥 Error: ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log('Sidebar navigation test complete');
  console.log('========================================\n');
});
