#!/usr/bin/env python3
"""
Browser testing script to verify MUI components are loaded
"""

import subprocess
import time
import json
from urllib.request import urlopen

def test_javascript_content():
    """Test if the JavaScript bundles contain MUI components"""
    print("🔍 Testing JavaScript Content for MUI Components...")
    
    try:
        # Get the main.js content
        response = urlopen("http://localhost:3000/main.js", timeout=10)
        js_content = response.read().decode('utf-8')
        
        # Check for MUI indicators
        mui_indicators = [
            "AppBar", "Drawer", "Typography", "Button", "Card", 
            "mui", "material", "emotion", "createTheme"
        ]
        
        found_indicators = []
        for indicator in mui_indicators:
            if indicator.lower() in js_content.lower():
                found_indicators.append(indicator)
        
        print(f"✅ Found {len(found_indicators)} MUI indicators in JavaScript:")
        for indicator in found_indicators[:10]:  # Show first 10
            print(f"   - {indicator}")
        
        if len(found_indicators) > 5:
            print("🎉 MUI components are successfully bundled!")
            return True
        else:
            print("⚠️  Limited MUI content found in bundle")
            return False
            
    except Exception as e:
        print(f"❌ Error testing JavaScript: {e}")
        return False

def test_remoteentry():
    """Test Module Federation remote entry"""
    print("\n🔗 Testing Module Federation Remote Entry...")
    
    try:
        response = urlopen("http://localhost:3000/remoteEntry.js", timeout=5)
        content = response.read().decode('utf-8')
        
        if "container" in content and "webpack" in content:
            print("✅ Module Federation remote entry is working!")
            return True
        else:
            print("⚠️  Remote entry exists but may not be configured correctly")
            return False
            
    except Exception as e:
        print(f"❌ Error testing remote entry: {e}")
        return False

def test_individual_apps():
    """Test each micro-frontend individually"""
    print("\n🧪 Testing Individual Micro-Frontends...")
    
    apps = {
        "User Management": 3001,
        "Data Grid": 3002, 
        "Analytics": 3003,
        "Settings": 3004
    }
    
    results = {}
    for app_name, port in apps.items():
        try:
            # Test if the app serves content
            response = urlopen(f"http://localhost:{port}", timeout=5)
            html = response.read().decode('utf-8')
            
            # Check for React app indicators
            has_react = "root" in html and "React App" in html
            
            # Try to get the JavaScript bundle
            try:
                js_response = urlopen(f"http://localhost:{port}/main.js", timeout=5)
                js_content = js_response.read().decode('utf-8')
                has_mui = any(indicator.lower() in js_content.lower() 
                             for indicator in ["mui", "material", "appbar", "datagrid"])
            except:
                has_mui = False
            
            results[app_name] = {
                "running": True,
                "has_react": has_react,
                "has_mui": has_mui,
                "port": port
            }
            
            status = "✅" if has_react and has_mui else "⚠️"
            print(f"{status} {app_name} (:{port}) - React: {has_react}, MUI: {has_mui}")
            
        except Exception as e:
            results[app_name] = {
                "running": False,
                "error": str(e),
                "port": port
            }
            print(f"❌ {app_name} (:{port}) - Error: {e}")
    
    return results

def open_browser_tabs():
    """Open browser tabs for manual verification"""
    print("\n🌐 Opening Browser Tabs for Manual Testing...")
    
    urls = [
        "http://localhost:3000",  # Container
        "http://localhost:3001",  # User Management
        "http://localhost:3002",  # Data Grid
        "http://localhost:3003",  # Analytics
        "http://localhost:3004",  # Settings
    ]
    
    for url in urls:
        try:
            subprocess.run(["open", url], check=True, timeout=5)
            print(f"✅ Opened: {url}")
            time.sleep(1)
        except:
            print(f"⚠️  Could not open: {url}")

def main():
    """Main testing function"""
    print("🚀 COMPREHENSIVE MUI MICRO-FRONTEND TESTING")
    print("=" * 50)
    
    # Test JavaScript content
    js_test = test_javascript_content()
    
    # Test Module Federation
    mf_test = test_remoteentry()
    
    # Test individual apps
    app_results = test_individual_apps()
    
    # Calculate overall results
    total_apps = len(app_results)
    working_apps = sum(1 for r in app_results.values() if r.get('running', False))
    mui_apps = sum(1 for r in app_results.values() if r.get('has_mui', False))
    
    print(f"\n📊 FINAL RESULTS:")
    print(f"JavaScript MUI Content: {'✅ PASS' if js_test else '❌ FAIL'}")
    print(f"Module Federation: {'✅ PASS' if mf_test else '❌ FAIL'}")
    print(f"Apps Running: {working_apps}/{total_apps}")
    print(f"Apps with MUI: {mui_apps}/{total_apps}")
    
    success_rate = ((js_test + mf_test + (working_apps/total_apps) + (mui_apps/total_apps)) / 4) * 100
    
    print(f"\n🎯 Overall Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 75:
        print("🎉 SYSTEM IS WORKING WELL!")
        print("Opening browser tabs for visual verification...")
        open_browser_tabs()
        
        print("\n📋 MANUAL VERIFICATION CHECKLIST:")
        print("1. Container app shows MUI AppBar and Drawer")
        print("2. Navigation between micro-frontends works")
        print("3. All apps use MUI components (no vanilla HTML)")
        print("4. DataGrid shows in User Management and Data Grid apps")
        print("5. Charts display in Analytics app")
        print("6. Theme controls work in Settings app")
        print("7. Responsive design works on mobile")
        print("8. No console errors in browser DevTools")
        
    else:
        print("⚠️  SYSTEM NEEDS ATTENTION!")
        print("Some components may not be working correctly.")
    
    return {
        "js_test": js_test,
        "mf_test": mf_test,
        "app_results": app_results,
        "success_rate": success_rate
    }

if __name__ == "__main__":
    results = main()
    
    # Save results
    with open("browser_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Results saved to: browser_test_results.json")
