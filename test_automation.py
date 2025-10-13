#!/usr/bin/env python3
"""
Automated testing script for the MUI Micro-Frontend Platform
This script will open browsers and test all functionality
"""

import time
import subprocess
import sys
import json
from urllib.request import urlopen
from urllib.error import URLError

def test_api_endpoints():
    """Test all backend API endpoints"""
    print("🧪 Testing Backend API Endpoints...")
    
    endpoints = [
        "http://localhost:8000/health",
        "http://localhost:8000/api/users", 
        "http://localhost:8000/api/data",
        "http://localhost:8000/api/analytics",
        "http://localhost:8000/api/settings"
    ]
    
    results = {}
    for endpoint in endpoints:
        try:
            response = urlopen(endpoint, timeout=5)
            data = response.read().decode('utf-8')
            status = response.getcode()
            results[endpoint] = {"status": status, "success": True, "data": data[:100]}
            print(f"✅ {endpoint} - Status: {status}")
        except Exception as e:
            results[endpoint] = {"status": "error", "success": False, "error": str(e)}
            print(f"❌ {endpoint} - Error: {e}")
    
    return results

def test_frontend_services():
    """Test all frontend services are running"""
    print("\n🧪 Testing Frontend Services...")
    
    services = {
        "Container": "http://localhost:3000",
        "User Management": "http://localhost:3001", 
        "Data Grid": "http://localhost:3002",
        "Analytics": "http://localhost:3003",
        "Settings": "http://localhost:3004"
    }
    
    results = {}
    for name, url in services.items():
        try:
            response = urlopen(url, timeout=5)
            status = response.getcode()
            results[name] = {"status": status, "success": True, "url": url}
            print(f"✅ {name} - Status: {status} - {url}")
        except Exception as e:
            results[name] = {"status": "error", "success": False, "error": str(e)}
            print(f"❌ {name} - Error: {e}")
    
    return results

def open_browser_for_manual_testing():
    """Open browser for manual testing"""
    print("\n🌐 Opening browser for visual testing...")
    
    urls_to_test = [
        "http://localhost:3000",  # Container app
        "http://localhost:8000/api/docs",  # API docs
    ]
    
    for url in urls_to_test:
        try:
            subprocess.run(["open", url], check=True)  # macOS
            print(f"✅ Opened: {url}")
            time.sleep(2)  # Wait between opens
        except subprocess.CalledProcessError:
            try:
                subprocess.run(["xdg-open", url], check=True)  # Linux
                print(f"✅ Opened: {url}")
            except subprocess.CalledProcessError:
                print(f"❌ Could not open: {url}")

def generate_test_report(api_results, frontend_results):
    """Generate a comprehensive test report"""
    print("\n📊 TEST REPORT")
    print("=" * 50)
    
    # API Tests
    print("\n🔧 Backend API Tests:")
    api_success = sum(1 for r in api_results.values() if r.get('success', False))
    api_total = len(api_results)
    print(f"Passed: {api_success}/{api_total}")
    
    for endpoint, result in api_results.items():
        status = "✅ PASS" if result.get('success') else "❌ FAIL"
        print(f"  {status} {endpoint}")
    
    # Frontend Tests  
    print("\n🎨 Frontend Service Tests:")
    frontend_success = sum(1 for r in frontend_results.values() if r.get('success', False))
    frontend_total = len(frontend_results)
    print(f"Passed: {frontend_success}/{frontend_total}")
    
    for service, result in frontend_results.items():
        status = "✅ PASS" if result.get('success') else "❌ FAIL"
        print(f"  {status} {service}")
    
    # Overall Status
    total_success = api_success + frontend_success
    total_tests = api_total + frontend_total
    success_rate = (total_success / total_tests) * 100
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {total_success}")
    print(f"Failed: {total_tests - total_success}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 EXCELLENT! System is working great!")
    elif success_rate >= 70:
        print("👍 GOOD! Most features working, minor issues to fix")
    else:
        print("⚠️  NEEDS ATTENTION! Several issues found")
    
    return {
        "api_results": api_results,
        "frontend_results": frontend_results,
        "success_rate": success_rate,
        "total_tests": total_tests,
        "passed": total_success
    }

def main():
    """Main testing function"""
    print("🚀 Starting Automated Tests for MUI Micro-Frontend Platform")
    print("=" * 60)
    
    # Test backend APIs
    api_results = test_api_endpoints()
    
    # Test frontend services
    frontend_results = test_frontend_services()
    
    # Generate report
    report = generate_test_report(api_results, frontend_results)
    
    # Open browser for manual testing
    if report["success_rate"] >= 70:
        print("\n🌐 Services are running well! Opening browser for visual testing...")
        open_browser_for_manual_testing()
        
        print("\n📋 MANUAL TESTING CHECKLIST:")
        print("1. ✅ Container app loads with MUI components")
        print("2. ✅ Navigation menu works (drawer opens/closes)")
        print("3. ✅ Dashboard cards are clickable")
        print("4. ✅ User Management loads with DataGrid")
        print("5. ✅ Data Grid loads with clean architecture")
        print("6. ✅ Analytics shows charts")
        print("7. ✅ Settings has theme controls")
        print("8. ✅ All apps use MUI components (no vanilla HTML)")
        print("9. ✅ Responsive design works on mobile")
        print("10. ✅ No console errors")
        
        print("\n🎯 Please verify these items in the opened browser tabs!")
    else:
        print("\n⚠️  Some services are not running. Please check the issues above.")
    
    return report

if __name__ == "__main__":
    report = main()
    
    # Save report to file
    with open("test_results.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📄 Test report saved to: test_results.json")
