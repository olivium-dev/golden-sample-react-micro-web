#!/usr/bin/env python3
"""
Check browser console logs for all micro-frontend apps
"""

import asyncio
import sys
from playwright.async_api import async_playwright

async def check_console_logs(url, app_name):
    """Check console logs for a specific app"""
    print(f"\n{'='*60}")
    print(f"🔍 CHECKING: {app_name} - {url}")
    print('='*60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Show browser
        page = await browser.new_page()
        
        console_messages = []
        errors = []
        
        # Capture console messages
        def handle_console(msg):
            console_messages.append(f"[{msg.type.upper()}] {msg.text}")
            if msg.type in ['error', 'warning']:
                errors.append(f"[{msg.type.upper()}] {msg.text}")
        
        # Capture page errors
        def handle_page_error(error):
            errors.append(f"[PAGE ERROR] {error}")
        
        page.on('console', handle_console)
        page.on('pageerror', handle_page_error)
        
        try:
            # Navigate to the page
            print(f"📱 Loading {url}...")
            await page.goto(url, timeout=30000, wait_until='networkidle')
            
            # Wait a bit for any async loading
            await page.wait_for_timeout(5000)
            
            # Check if page is blank
            body_text = await page.evaluate('document.body.innerText')
            body_html = await page.evaluate('document.body.innerHTML')
            
            print(f"📄 Page loaded. Body text length: {len(body_text.strip())}")
            
            if len(body_text.strip()) < 50:  # Likely empty/white screen
                print("⚠️  POSSIBLE WHITE SCREEN - Very little content")
                print(f"Body text: '{body_text.strip()[:200]}...'")
            else:
                print("✅ Page has content")
                print(f"Body text preview: '{body_text.strip()[:100]}...'")
            
            # Show console messages
            print(f"\n📋 CONSOLE MESSAGES ({len(console_messages)} total):")
            for msg in console_messages[-20:]:  # Show last 20 messages
                print(f"  {msg}")
            
            # Show errors specifically
            if errors:
                print(f"\n❌ ERRORS FOUND ({len(errors)} total):")
                for error in errors:
                    print(f"  🚨 {error}")
            else:
                print("\n✅ No errors found in console")
            
            # Check for specific React/Module Federation issues
            react_errors = [msg for msg in console_messages if 'react' in msg.lower() or 'federation' in msg.lower()]
            if react_errors:
                print(f"\n⚛️  REACT/FEDERATION RELATED ({len(react_errors)} messages):")
                for msg in react_errors:
                    print(f"  🔧 {msg}")
            
            # Take a screenshot
            screenshot_path = f"/tmp/{app_name.replace(' ', '_')}_screenshot.png"
            await page.screenshot(path=screenshot_path)
            print(f"📸 Screenshot saved: {screenshot_path}")
            
        except Exception as e:
            print(f"❌ Failed to load {url}: {e}")
            errors.append(f"Navigation failed: {e}")
        
        finally:
            await browser.close()
    
    return len(errors) == 0, errors

async def main():
    """Check all micro-frontend apps"""
    apps = [
        ("http://localhost:3000", "Container App"),
        ("http://localhost:3001", "User Management"),
        ("http://localhost:3002", "Data Grid"),
        ("http://localhost:3003", "Analytics"),
        ("http://localhost:3004", "Settings"),
    ]
    
    print("🚀 Starting browser console check for all micro-frontend apps...")
    print("This will open browser windows to check each app...")
    
    all_good = True
    all_errors = []
    
    for url, name in apps:
        success, errors = await check_console_logs(url, name)
        if not success:
            all_good = False
            all_errors.extend(errors)
        
        # Small delay between apps
        await asyncio.sleep(2)
    
    print(f"\n{'='*60}")
    print("📊 FINAL SUMMARY")
    print('='*60)
    
    if all_good:
        print("✅ All apps loaded successfully with no critical errors!")
    else:
        print(f"❌ Found issues in {len(all_errors)} cases:")
        for error in all_errors:
            print(f"  🚨 {error}")
    
    print(f"\n📸 Screenshots saved in /tmp/ for visual verification")
    print("🔍 Check the browser windows that opened to see the actual apps")

if __name__ == "__main__":
    asyncio.run(main())
