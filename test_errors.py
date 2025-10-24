#!/usr/bin/env python3
"""
Automated Error Testing Script for Micro-Frontend Platform

This script uses Playwright to:
1. Open each micro-frontend URL
2. Monitor console for errors (console.error, console.warn)
3. Check ErrorLogger for captured errors via window.ErrorLogger.getErrors()
4. Navigate through app features to trigger potential errors
5. Take screenshots when errors occur
6. Generate HTML report with all findings

Usage:
    python test_errors.py [--headless] [--output-dir OUTPUT_DIR]
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import argparse

try:
    from playwright.async_api import async_playwright, Page, Browser, ConsoleMessage
    import requests
except ImportError:
    print("Missing dependencies. Install with:")
    print("pip install playwright requests")
    print("playwright install")
    sys.exit(1)

class ErrorTestResult:
    def __init__(self):
        self.url: str = ""
        self.app_name: str = ""
        self.console_errors: List[Dict[str, Any]] = []
        self.console_warnings: List[Dict[str, Any]] = []
        self.error_logger_errors: List[Dict[str, Any]] = []
        self.screenshots: List[str] = []
        self.network_errors: List[Dict[str, Any]] = []
        self.test_duration: float = 0
        self.success: bool = True
        self.error_message: str = ""

class ErrorTester:
    def __init__(self, headless: bool = True, output_dir: str = "error_test_results"):
        self.headless = headless
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Test configuration
        self.services = {
            "container": "http://localhost:3000",
            "user-management": "http://localhost:3001", 
            "data-grid": "http://localhost:3002",
            "analytics": "http://localhost:3003",
            "settings": "http://localhost:3004",
        }
        
        self.backend_url = "http://localhost:8000"
        
        # Results storage
        self.results: Dict[str, ErrorTestResult] = {}
        self.overall_stats = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "total_errors": 0,
            "total_warnings": 0,
            "start_time": None,
            "end_time": None,
        }

    async def check_services_health(self) -> Dict[str, bool]:
        """Check if all services are running"""
        health_status = {}
        
        print("🔍 Checking service health...")
        
        # Check backend
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            health_status["backend"] = response.status_code == 200
            print(f"  Backend: {'✅' if health_status['backend'] else '❌'}")
        except Exception:
            health_status["backend"] = False
            print("  Backend: ❌")
        
        # Check frontend services
        for name, url in self.services.items():
            try:
                response = requests.get(url, timeout=5)
                health_status[name] = response.status_code == 200
                print(f"  {name}: {'✅' if health_status[name] else '❌'}")
            except Exception:
                health_status[name] = False
                print(f"  {name}: ❌")
        
        return health_status

    async def setup_page_monitoring(self, page: Page, result: ErrorTestResult):
        """Set up console and network monitoring for a page"""
        
        # Monitor console messages
        def handle_console(msg: ConsoleMessage):
            message_data = {
                "type": msg.type,
                "text": msg.text,
                "location": msg.location,
                "timestamp": datetime.now().isoformat(),
            }
            
            if msg.type == "error":
                result.console_errors.append(message_data)
                print(f"    🚨 Console Error: {msg.text}")
            elif msg.type == "warning":
                result.console_warnings.append(message_data)
                print(f"    ⚠️  Console Warning: {msg.text}")
        
        page.on("console", handle_console)
        
        # Monitor network failures
        def handle_response(response):
            if response.status >= 400:
                error_data = {
                    "url": response.url,
                    "status": response.status,
                    "status_text": response.status_text,
                    "timestamp": datetime.now().isoformat(),
                }
                result.network_errors.append(error_data)
                print(f"    🌐 Network Error: {response.status} {response.url}")
        
        page.on("response", handle_response)

    async def take_screenshot(self, page: Page, result: ErrorTestResult, reason: str) -> str:
        """Take a screenshot and save it"""
        screenshot_name = f"{result.app_name}_{reason}_{int(time.time())}.png"
        screenshot_path = self.output_dir / screenshot_name
        
        try:
            await page.screenshot(path=screenshot_path, full_page=True)
            result.screenshots.append(screenshot_name)
            print(f"    📸 Screenshot saved: {screenshot_name}")
            return screenshot_name
        except Exception as e:
            print(f"    ❌ Failed to take screenshot: {e}")
            return ""

    async def get_error_logger_data(self, page: Page) -> List[Dict[str, Any]]:
        """Get errors from the ErrorLogger"""
        try:
            # Check if ErrorLogger is available
            error_logger_available = await page.evaluate("typeof window.ErrorLogger !== 'undefined'")
            
            if not error_logger_available:
                return []
            
            # Get errors from ErrorLogger
            errors = await page.evaluate("window.ErrorLogger.getErrors()")
            return errors or []
        except Exception as e:
            print(f"    ⚠️  Failed to get ErrorLogger data: {e}")
            return []

    async def test_container_app(self, page: Page) -> ErrorTestResult:
        """Test the container app with navigation through all micro-frontends"""
        result = ErrorTestResult()
        result.url = self.services["container"]
        result.app_name = "container"
        
        start_time = time.time()
        
        try:
            print(f"  🧪 Testing Container App...")
            
            # Navigate to container app
            await page.goto(result.url, wait_until="networkidle")
            await page.wait_for_timeout(2000)  # Wait for initial load
            
            # Take initial screenshot
            await self.take_screenshot(page, result, "initial_load")
            
            # Test navigation to each micro-frontend
            menu_items = ["users", "data", "analytics", "settings", "error-monitor"]
            
            for item in menu_items:
                try:
                    print(f"    📱 Navigating to {item}...")
                    
                    # Click on menu item
                    await page.click(f'[data-testid="{item}-menu"]', timeout=5000)
                    await page.wait_for_timeout(3000)  # Wait for micro-frontend to load
                    
                    # Take screenshot of loaded micro-frontend
                    await self.take_screenshot(page, result, f"loaded_{item}")
                    
                    # Check for any new errors
                    current_errors = await self.get_error_logger_data(page)
                    if current_errors:
                        print(f"    🔍 Found {len(current_errors)} errors in ErrorLogger")
                    
                except Exception as e:
                    print(f"    ❌ Failed to navigate to {item}: {e}")
                    await self.take_screenshot(page, result, f"error_{item}")
            
            # Test error panel (keyboard shortcut)
            print("    🎹 Testing error panel keyboard shortcut...")
            try:
                await page.keyboard.press("Control+Shift+E")
                await page.wait_for_timeout(1000)
                await self.take_screenshot(page, result, "error_panel")
            except Exception as e:
                print(f"    ⚠️  Error panel test failed: {e}")
            
            # Get final ErrorLogger data
            result.error_logger_errors = await self.get_error_logger_data(page)
            
        except Exception as e:
            result.success = False
            result.error_message = str(e)
            print(f"    ❌ Container app test failed: {e}")
            await self.take_screenshot(page, result, "test_failure")
        
        result.test_duration = time.time() - start_time
        return result

    async def test_standalone_app(self, page: Page, app_name: str, url: str) -> ErrorTestResult:
        """Test a standalone micro-frontend app"""
        result = ErrorTestResult()
        result.url = url
        result.app_name = app_name
        
        start_time = time.time()
        
        try:
            print(f"  🧪 Testing {app_name} standalone...")
            
            # Navigate to app
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(3000)  # Wait for app to load
            
            # Take initial screenshot
            await self.take_screenshot(page, result, "standalone_load")
            
            # Perform app-specific interactions
            if app_name == "user-management":
                await self.test_user_management_interactions(page, result)
            elif app_name == "data-grid":
                await self.test_data_grid_interactions(page, result)
            elif app_name == "analytics":
                await self.test_analytics_interactions(page, result)
            elif app_name == "settings":
                await self.test_settings_interactions(page, result)
            
            # Get ErrorLogger data
            result.error_logger_errors = await self.get_error_logger_data(page)
            
        except Exception as e:
            result.success = False
            result.error_message = str(e)
            print(f"    ❌ {app_name} test failed: {e}")
            await self.take_screenshot(page, result, "test_failure")
        
        result.test_duration = time.time() - start_time
        return result

    async def test_user_management_interactions(self, page: Page, result: ErrorTestResult):
        """Test user management specific interactions"""
        try:
            # Try to click add user button
            await page.click('button:has-text("Add User")', timeout=5000)
            await page.wait_for_timeout(1000)
            
            # Fill form if dialog opens
            if await page.is_visible('input[name="username"]'):
                await page.fill('input[name="username"]', "testuser")
                await page.fill('input[name="email"]', "test@example.com")
                await page.fill('input[name="full_name"]', "Test User")
                
            await self.take_screenshot(page, result, "user_form")
            
        except Exception as e:
            print(f"    ⚠️  User management interaction failed: {e}")

    async def test_data_grid_interactions(self, page: Page, result: ErrorTestResult):
        """Test data grid specific interactions"""
        try:
            # Wait for data grid to load
            await page.wait_for_selector('.MuiDataGrid-root', timeout=10000)
            await page.wait_for_timeout(2000)
            
            # Try to add new row
            if await page.is_visible('button:has-text("Add Row")'):
                await page.click('button:has-text("Add Row")')
                await page.wait_for_timeout(1000)
            
            await self.take_screenshot(page, result, "data_grid_loaded")
            
        except Exception as e:
            print(f"    ⚠️  Data grid interaction failed: {e}")

    async def test_analytics_interactions(self, page: Page, result: ErrorTestResult):
        """Test analytics specific interactions"""
        try:
            # Wait for charts to load
            await page.wait_for_timeout(3000)
            
            # Look for chart elements
            charts_loaded = await page.evaluate("""
                () => {
                    const recharts = document.querySelectorAll('.recharts-wrapper');
                    return recharts.length > 0;
                }
            """)
            
            if charts_loaded:
                print("    📊 Charts detected and loaded")
            
            await self.take_screenshot(page, result, "analytics_charts")
            
        except Exception as e:
            print(f"    ⚠️  Analytics interaction failed: {e}")

    async def test_settings_interactions(self, page: Page, result: ErrorTestResult):
        """Test settings specific interactions"""
        try:
            # Try to change theme
            if await page.is_visible('input[type="checkbox"]'):
                await page.click('input[type="checkbox"]')
                await page.wait_for_timeout(1000)
            
            # Try to change select values
            selects = await page.query_selector_all('select')
            if selects:
                await selects[0].select_option(index=1)
                await page.wait_for_timeout(1000)
            
            await self.take_screenshot(page, result, "settings_changed")
            
        except Exception as e:
            print(f"    ⚠️  Settings interaction failed: {e}")

    async def run_tests(self):
        """Run all error tests"""
        print("🚀 Starting Error Testing Suite")
        print(f"📁 Output directory: {self.output_dir}")
        
        self.overall_stats["start_time"] = datetime.now().isoformat()
        
        # Check service health first
        health_status = await self.check_services_health()
        
        if not all(health_status.values()):
            print("❌ Not all services are healthy. Please start all services first.")
            return False
        
        print("✅ All services are healthy. Starting tests...")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            
            try:
                # Test container app (most comprehensive)
                page = await browser.new_page()
                await self.setup_page_monitoring(page, ErrorTestResult())
                
                self.results["container"] = await self.test_container_app(page)
                self.overall_stats["total_tests"] += 1
                
                if self.results["container"].success:
                    self.overall_stats["passed_tests"] += 1
                else:
                    self.overall_stats["failed_tests"] += 1
                
                await page.close()
                
                # Test standalone apps
                for app_name, url in self.services.items():
                    if app_name == "container":
                        continue  # Already tested
                    
                    page = await browser.new_page()
                    await self.setup_page_monitoring(page, ErrorTestResult())
                    
                    self.results[app_name] = await self.test_standalone_app(page, app_name, url)
                    self.overall_stats["total_tests"] += 1
                    
                    if self.results[app_name].success:
                        self.overall_stats["passed_tests"] += 1
                    else:
                        self.overall_stats["failed_tests"] += 1
                    
                    await page.close()
                
            finally:
                await browser.close()
        
        self.overall_stats["end_time"] = datetime.now().isoformat()
        
        # Calculate error totals
        for result in self.results.values():
            self.overall_stats["total_errors"] += len(result.console_errors) + len(result.error_logger_errors) + len(result.network_errors)
            self.overall_stats["total_warnings"] += len(result.console_warnings)
        
        # Generate reports
        await self.generate_reports()
        
        return self.overall_stats["failed_tests"] == 0

    async def generate_reports(self):
        """Generate JSON and HTML reports"""
        print("📊 Generating test reports...")
        
        # Generate JSON report
        json_report = {
            "metadata": {
                "timestamp": self.timestamp,
                "test_run_id": f"error_test_{self.timestamp}",
                "total_duration": self.calculate_total_duration(),
            },
            "stats": self.overall_stats,
            "results": {name: self.result_to_dict(result) for name, result in self.results.items()},
        }
        
        json_path = self.output_dir / f"error_test_report_{self.timestamp}.json"
        with open(json_path, 'w') as f:
            json.dump(json_report, f, indent=2)
        
        print(f"📄 JSON report saved: {json_path}")
        
        # Generate HTML report
        html_report = self.generate_html_report(json_report)
        html_path = self.output_dir / f"error_test_report_{self.timestamp}.html"
        
        with open(html_path, 'w') as f:
            f.write(html_report)
        
        print(f"🌐 HTML report saved: {html_path}")
        
        # Print summary
        self.print_summary()

    def result_to_dict(self, result: ErrorTestResult) -> Dict[str, Any]:
        """Convert ErrorTestResult to dictionary"""
        return {
            "url": result.url,
            "app_name": result.app_name,
            "success": result.success,
            "error_message": result.error_message,
            "test_duration": result.test_duration,
            "console_errors": result.console_errors,
            "console_warnings": result.console_warnings,
            "error_logger_errors": result.error_logger_errors,
            "network_errors": result.network_errors,
            "screenshots": result.screenshots,
        }

    def calculate_total_duration(self) -> float:
        """Calculate total test duration"""
        return sum(result.test_duration for result in self.results.values())

    def generate_html_report(self, json_report: Dict[str, Any]) -> str:
        """Generate HTML report"""
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Test Report - {self.timestamp}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: #1976d2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .stat-card {{ background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }}
        .stat-value {{ font-size: 2em; font-weight: bold; margin-bottom: 5px; }}
        .success {{ color: #28a745; }}
        .error {{ color: #dc3545; }}
        .warning {{ color: #ffc107; }}
        .info {{ color: #17a2b8; }}
        .test-result {{ margin-bottom: 30px; border: 1px solid #ddd; border-radius: 6px; }}
        .test-header {{ background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }}
        .test-body {{ padding: 15px; }}
        .error-list {{ background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }}
        .error-item {{ background: white; padding: 8px; margin: 5px 0; border-left: 4px solid #dc3545; }}
        .warning-item {{ background: white; padding: 8px; margin: 5px 0; border-left: 4px solid #ffc107; }}
        .screenshot {{ margin: 10px 0; }}
        .screenshot img {{ max-width: 300px; border: 1px solid #ddd; border-radius: 4px; }}
        pre {{ background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐛 Error Test Report</h1>
            <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value info">{self.overall_stats['total_tests']}</div>
                    <div>Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value success">{self.overall_stats['passed_tests']}</div>
                    <div>Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value error">{self.overall_stats['failed_tests']}</div>
                    <div>Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value error">{self.overall_stats['total_errors']}</div>
                    <div>Total Errors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value warning">{self.overall_stats['total_warnings']}</div>
                    <div>Warnings</div>
                </div>
            </div>
        """
        
        # Add test results
        for app_name, result_data in json_report["results"].items():
            status_class = "success" if result_data["success"] else "error"
            status_icon = "✅" if result_data["success"] else "❌"
            
            html += f"""
            <div class="test-result">
                <div class="test-header">
                    <h3>{status_icon} {app_name.title()} App</h3>
                    <p><strong>URL:</strong> {result_data['url']}</p>
                    <p><strong>Duration:</strong> {result_data['test_duration']:.2f}s</p>
                    {f'<p class="error"><strong>Error:</strong> {result_data["error_message"]}</p>' if result_data["error_message"] else ''}
                </div>
                <div class="test-body">
            """
            
            # Console errors
            if result_data["console_errors"]:
                html += f"""
                <h4>Console Errors ({len(result_data["console_errors"])})</h4>
                <div class="error-list">
                """
                for error in result_data["console_errors"]:
                    html += f'<div class="error-item"><strong>{error["type"]}:</strong> {error["text"]}</div>'
                html += "</div>"
            
            # Console warnings
            if result_data["console_warnings"]:
                html += f"""
                <h4>Console Warnings ({len(result_data["console_warnings"])})</h4>
                <div class="error-list">
                """
                for warning in result_data["console_warnings"]:
                    html += f'<div class="warning-item"><strong>{warning["type"]}:</strong> {warning["text"]}</div>'
                html += "</div>"
            
            # ErrorLogger errors
            if result_data["error_logger_errors"]:
                html += f"""
                <h4>ErrorLogger Errors ({len(result_data["error_logger_errors"])})</h4>
                <div class="error-list">
                """
                for error in result_data["error_logger_errors"]:
                    html += f'<div class="error-item"><strong>{error.get("type", "unknown")}:</strong> {error.get("message", "No message")}</div>'
                html += "</div>"
            
            # Network errors
            if result_data["network_errors"]:
                html += f"""
                <h4>Network Errors ({len(result_data["network_errors"])})</h4>
                <div class="error-list">
                """
                for error in result_data["network_errors"]:
                    html += f'<div class="error-item"><strong>{error["status"]}:</strong> {error["url"]}</div>'
                html += "</div>"
            
            # Screenshots
            if result_data["screenshots"]:
                html += f"""
                <h4>Screenshots ({len(result_data["screenshots"])})</h4>
                """
                for screenshot in result_data["screenshots"]:
                    html += f'<div class="screenshot"><img src="{screenshot}" alt="Screenshot: {screenshot}"></div>'
            
            html += """
                </div>
            </div>
            """
        
        html += """
        </div>
    </div>
</body>
</html>
        """
        
        return html

    def print_summary(self):
        """Print test summary to console"""
        print("\n" + "="*60)
        print("📊 ERROR TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.overall_stats['total_tests']}")
        print(f"Passed: {self.overall_stats['passed_tests']} ✅")
        print(f"Failed: {self.overall_stats['failed_tests']} ❌")
        print(f"Total Errors: {self.overall_stats['total_errors']} 🚨")
        print(f"Total Warnings: {self.overall_stats['total_warnings']} ⚠️")
        print(f"Total Duration: {self.calculate_total_duration():.2f}s")
        print("="*60)
        
        if self.overall_stats['failed_tests'] == 0 and self.overall_stats['total_errors'] == 0:
            print("🎉 All tests passed with no errors!")
        elif self.overall_stats['failed_tests'] == 0:
            print("⚠️  Tests passed but errors were detected")
        else:
            print("❌ Some tests failed")
        
        print(f"📄 Reports saved in: {self.output_dir}")

async def main():
    parser = argparse.ArgumentParser(description="Automated Error Testing for Micro-Frontend Platform")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--output-dir", default="error_test_results", help="Output directory for results")
    
    args = parser.parse_args()
    
    tester = ErrorTester(headless=args.headless, output_dir=args.output_dir)
    success = await tester.run_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())




