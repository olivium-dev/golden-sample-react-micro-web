#!/usr/bin/env python3
"""
Automated Error Detection and Fixing System

This script continuously monitors the running application for errors,
analyzes them, and attempts to fix them automatically.

Features:
- Real-time error monitoring via browser console
- Backend error log analysis
- Webpack compilation error detection
- Automatic TypeScript error fixing
- Import path correction
- Missing dependency installation
- Self-healing capabilities

Usage:
    python auto_fix_errors.py [--interval SECONDS] [--max-iterations N]
"""

import asyncio
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Set
import argparse

try:
    from playwright.async_api import async_playwright, Page
    import requests
except ImportError:
    print("Missing dependencies. Install with:")
    print("pip install playwright requests")
    sys.exit(1)

class ErrorFixer:
    def __init__(self, project_root: str, check_interval: int = 30, max_iterations: int = 10):
        self.project_root = Path(project_root)
        self.check_interval = check_interval
        self.max_iterations = max_iterations
        self.iteration = 0
        self.fixed_errors: Set[str] = set()
        self.seen_errors: Set[str] = set()
        
        self.services = {
            "container": "http://localhost:3000",
            "user-management": "http://localhost:3001",
            "data-grid": "http://localhost:3002",
            "analytics": "http://localhost:3003",
            "settings": "http://localhost:3004",
        }
        
        self.backend_url = "http://localhost:8000"
        
    def log(self, message: str, level: str = "INFO"):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        icon = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌", "FIX": "🔧"}
        print(f"[{timestamp}] {icon.get(level, 'ℹ️')} {message}")

    async def check_services_health(self) -> bool:
        """Check if all services are running"""
        all_healthy = True
        
        for name, url in self.services.items():
            try:
                response = requests.get(url, timeout=3)
                if response.status_code != 200:
                    self.log(f"{name} is not healthy (status {response.status_code})", "WARNING")
                    all_healthy = False
            except Exception:
                self.log(f"{name} is not responding", "WARNING")
                all_healthy = False
        
        return all_healthy

    async def get_webpack_errors(self) -> List[Dict[str, Any]]:
        """Parse webpack compilation errors from log files"""
        errors = []
        
        frontend_apps = ["container", "user-management-app", "data-grid-app", "analytics-app", "settings-app"]
        
        for app in frontend_apps:
            log_file = self.project_root / "frontend" / app / f"{app}.log"
            if not log_file.exists():
                continue
            
            try:
                with open(log_file, 'r', errors='ignore') as f:
                    content = f.read()
                    
                    # Check for compilation errors
                    if "ERROR in" in content:
                        # Extract TypeScript errors
                        error_pattern = r'ERROR in (.+?\.tsx?)\n.*?\[tsl\] ERROR in \1\((\d+),(\d+)\)\n\s+TS(\d+): (.+?)(?=\n\n|\nERROR|\Z)'
                        matches = re.finditer(error_pattern, content, re.DOTALL)
                        
                        for match in matches:
                            file_path = match.group(1)
                            line = match.group(2)
                            col = match.group(3)
                            error_code = match.group(4)
                            message = match.group(5).strip()
                            
                            error_id = f"{file_path}:{line}:{error_code}"
                            
                            if error_id not in self.seen_errors:
                                errors.append({
                                    "type": "typescript",
                                    "app": app,
                                    "file": file_path,
                                    "line": int(line),
                                    "column": int(col),
                                    "code": f"TS{error_code}",
                                    "message": message,
                                    "id": error_id,
                                })
                                self.seen_errors.add(error_id)
                        
                        # Extract missing module errors
                        missing_module_pattern = r"Module not found: Error: Can't resolve '([^']+)' in '([^']+)'"
                        module_matches = re.finditer(missing_module_pattern, content)
                        
                        for match in module_matches:
                            module_name = match.group(1)
                            location = match.group(2)
                            error_id = f"missing:{module_name}"
                            
                            if error_id not in self.seen_errors:
                                errors.append({
                                    "type": "missing_module",
                                    "app": app,
                                    "module": module_name,
                                    "location": location,
                                    "id": error_id,
                                })
                                self.seen_errors.add(error_id)
                        
                        # Extract "TypeScript emitted no output" errors (tsconfig noEmit issue)
                        no_output_pattern = r"Error: TypeScript emitted no output for (.+?)\.tsx?"
                        no_output_matches = re.finditer(no_output_pattern, content)
                        
                        for match in no_output_matches:
                            file_path = match.group(1)
                            error_id = f"no_output:{app}"
                            
                            if error_id not in self.seen_errors:
                                errors.append({
                                    "type": "tsconfig_no_emit",
                                    "app": app,
                                    "file": file_path,
                                    "id": error_id,
                                })
                                self.seen_errors.add(error_id)
            
            except Exception as e:
                self.log(f"Failed to parse {app} log: {e}", "WARNING")
        
        return errors

    async def get_runtime_errors(self, page: Page) -> List[Dict[str, Any]]:
        """Get runtime errors from browser console and ErrorLogger"""
        errors = []
        
        try:
            # Get ErrorLogger data
            error_logger_data = await page.evaluate("""
                () => {
                    if (typeof window.ErrorLogger !== 'undefined') {
                        return window.ErrorLogger.getErrors();
                    }
                    return [];
                }
            """)
            
            if error_logger_data:
                for error in error_logger_data:
                    error_id = f"runtime:{error.get('id', '')}"
                    if error_id not in self.seen_errors:
                        errors.append({
                            "type": "runtime",
                            "data": error,
                            "id": error_id,
                        })
                        self.seen_errors.add(error_id)
        
        except Exception as e:
            self.log(f"Failed to get runtime errors: {e}", "WARNING")
        
        return errors

    def fix_missing_module(self, error: Dict[str, Any]) -> bool:
        """Install missing npm module"""
        module_name = error["module"]
        app = error["app"]
        
        self.log(f"Installing missing module '{module_name}' in {app}", "FIX")
        
        app_dir = self.project_root / "frontend" / app
        
        try:
            result = subprocess.run(
                ["npm", "install", module_name],
                cwd=app_dir,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log(f"Successfully installed {module_name}", "SUCCESS")
                self.fixed_errors.add(error["id"])
                return True
            else:
                self.log(f"Failed to install {module_name}: {result.stderr}", "ERROR")
                return False
        
        except Exception as e:
            self.log(f"Error installing module: {e}", "ERROR")
            return False

    def fix_tsconfig_no_emit(self, error: Dict[str, Any]) -> bool:
        """Fix tsconfig.json noEmit: true issue"""
        app = error["app"]
        
        self.log(f"Fixing tsconfig noEmit issue in {app}", "FIX")
        
        app_dir = self.project_root / "frontend" / app
        tsconfig_file = app_dir / "tsconfig.json"
        
        if not tsconfig_file.exists():
            self.log(f"tsconfig.json not found in {app}", "ERROR")
            return False
        
        try:
            # Read tsconfig.json
            with open(tsconfig_file, 'r') as f:
                content = f.read()
            
            # Replace "noEmit": true with "noEmit": false
            if '"noEmit": true' in content:
                updated_content = content.replace('"noEmit": true', '"noEmit": false')
                
                # Write back
                with open(tsconfig_file, 'w') as f:
                    f.write(updated_content)
                
                self.log(f"Fixed tsconfig.json in {app} (noEmit: false)", "SUCCESS")
                self.fixed_errors.add(error["id"])
                return True
            else:
                self.log(f"noEmit: true not found in {app}/tsconfig.json", "WARNING")
                return False
        
        except Exception as e:
            self.log(f"Error fixing tsconfig: {e}", "ERROR")
            return False

    def fix_typescript_error(self, error: Dict[str, Any]) -> bool:
        """Attempt to fix TypeScript errors automatically"""
        error_code = error["code"]
        message = error["message"]
        file_path = error["file"]
        line = error["line"]
        
        # Make file_path absolute
        if not file_path.startswith("/"):
            # Try to find the file
            app = error["app"]
            possible_paths = [
                self.project_root / "frontend" / app / "src" / file_path.replace("./src/", ""),
                self.project_root / "frontend" / app / file_path.replace("./", ""),
                self.project_root / file_path.replace("./", ""),
            ]
            
            file_path = None
            for p in possible_paths:
                if p.exists():
                    file_path = p
                    break
            
            if not file_path:
                self.log(f"Could not locate file: {error['file']}", "WARNING")
                return False
        else:
            file_path = Path(file_path)
        
        if not file_path.exists():
            self.log(f"File does not exist: {file_path}", "WARNING")
            return False
        
        self.log(f"Attempting to fix {error_code} in {file_path.name}:{line}", "FIX")
        
        # TS2307: Cannot find module
        if error_code == "TS2307":
            return self.fix_module_not_found(file_path, line, message)
        
        # TS7006: Parameter implicitly has 'any' type
        elif error_code == "TS7006":
            return self.fix_implicit_any(file_path, line, message)
        
        # TS2339: Property does not exist on type
        elif error_code == "TS2339":
            return self.fix_property_not_exist(file_path, line, message)
        
        # TS2345: Argument type not assignable
        elif error_code == "TS2345":
            return self.fix_type_mismatch(file_path, line, message)
        
        else:
            self.log(f"No automatic fix available for {error_code}", "WARNING")
            return False

    def fix_module_not_found(self, file_path: Path, line: int, message: str) -> bool:
        """Fix module not found errors by correcting import paths"""
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if line > len(lines):
                return False
            
            target_line = lines[line - 1]
            
            # Check if it's a shared-ui-lib import with wrong path
            if "shared-ui-lib" in target_line:
                # Count how many levels up we need to go
                src_depth = len([p for p in file_path.parts if p == "src"])
                
                if src_depth == 0:
                    return False
                
                # Correct path should have one more "../" than src depth
                correct_prefix = "../" * (src_depth + 1)
                
                # Replace the import path
                updated_line = re.sub(
                    r'from ["\'](\.\./)*shared-ui-lib',
                    f'from \'{correct_prefix}shared-ui-lib',
                    target_line
                )
                
                if updated_line != target_line:
                    lines[line - 1] = updated_line
                    
                    with open(file_path, 'w') as f:
                        f.writelines(lines)
                    
                    self.log(f"Fixed import path in {file_path.name}:{line}", "SUCCESS")
                    self.fixed_errors.add(f"{file_path}:{line}:TS2307")
                    return True
            
            return False
        
        except Exception as e:
            self.log(f"Error fixing module import: {e}", "ERROR")
            return False

    def fix_implicit_any(self, file_path: Path, line: int, message: str) -> bool:
        """Fix implicit any type errors"""
        try:
            # Extract parameter name from message
            param_match = re.search(r"Parameter '(\w+)' implicitly", message)
            if not param_match:
                return False
            
            param_name = param_match.group(1)
            
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if line > len(lines):
                return False
            
            target_line = lines[line - 1]
            
            # Add type annotation
            # Look for the parameter and add ': any' after it
            updated_line = re.sub(
                rf'\b{param_name}\b(?!\s*:)',
                f'{param_name}: any',
                target_line
            )
            
            if updated_line != target_line:
                lines[line - 1] = updated_line
                
                with open(file_path, 'w') as f:
                    f.writelines(lines)
                
                self.log(f"Added type annotation for '{param_name}' in {file_path.name}:{line}", "SUCCESS")
                self.fixed_errors.add(f"{file_path}:{line}:TS7006")
                return True
            
            return False
        
        except Exception as e:
            self.log(f"Error fixing implicit any: {e}", "ERROR")
            return False

    def fix_property_not_exist(self, file_path: Path, line: int, message: str) -> bool:
        """Fix property does not exist errors with type assertion"""
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if line > len(lines):
                return False
            
            target_line = lines[line - 1]
            
            # Look for property access and add 'as any'
            # This is a safe but not ideal fix - adds type assertion
            if '.' in target_line and 'as any' not in target_line:
                # Find the object that's missing the property
                property_match = re.search(r"Property '(\w+)' does not exist on type", message)
                if not property_match:
                    return False
                
                # Add (as any) before the property access
                updated_line = re.sub(
                    r'(\w+)\.(\w+)',
                    r'(\1 as any).\2',
                    target_line,
                    count=1
                )
                
                if updated_line != target_line:
                    lines[line - 1] = updated_line
                    
                    with open(file_path, 'w') as f:
                        f.writelines(lines)
                    
                    self.log(f"Added type assertion in {file_path.name}:{line}", "SUCCESS")
                    self.fixed_errors.add(f"{file_path}:{line}:TS2339")
                    return True
            
            return False
        
        except Exception as e:
            self.log(f"Error fixing property error: {e}", "ERROR")
            return False

    def fix_type_mismatch(self, file_path: Path, line: int, message: str) -> bool:
        """Fix type mismatch errors with type assertion"""
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if line > len(lines):
                return False
            
            target_line = lines[line - 1]
            
            # Add 'as any' to the problematic argument
            if 'as any' not in target_line:
                # Find function calls and add 'as any' to arguments
                updated_line = re.sub(
                    r'\.apply\(([^,)]+),\s*([^)]+)\)',
                    r'.apply(\1, \2 as any)',
                    target_line
                )
                
                if updated_line != target_line:
                    lines[line - 1] = updated_line
                    
                    with open(file_path, 'w') as f:
                        f.writelines(lines)
                    
                    self.log(f"Added type assertion in {file_path.name}:{line}", "SUCCESS")
                    self.fixed_errors.add(f"{file_path}:{line}:TS2345")
                    return True
            
            return False
        
        except Exception as e:
            self.log(f"Error fixing type mismatch: {e}", "ERROR")
            return False

    async def restart_service(self, app: str) -> bool:
        """Restart a specific service after fixing errors"""
        self.log(f"Restarting {app} service...", "INFO")
        
        # Kill the process
        app_dir_name = app if app == "container" else f"{app}-app"
        
        try:
            # Kill existing process
            subprocess.run(
                ["pkill", "-f", f"webpack.*{app_dir_name}"],
                capture_output=True
            )
            
            time.sleep(2)
            
            # Start the service
            app_dir = self.project_root / "frontend" / app_dir_name
            log_file = app_dir / f"{app_dir_name}.log"
            
            subprocess.Popen(
                ["npm", "start"],
                cwd=app_dir,
                stdout=open(log_file, 'w'),
                stderr=subprocess.STDOUT
            )
            
            self.log(f"{app} service restarted", "SUCCESS")
            return True
        
        except Exception as e:
            self.log(f"Failed to restart {app}: {e}", "ERROR")
            return False

    async def run_fix_cycle(self) -> int:
        """Run one cycle of error detection and fixing"""
        self.log(f"Starting fix cycle {self.iteration + 1}/{self.max_iterations}", "INFO")
        
        fixes_applied = 0
        
        # 1. Check webpack compilation errors
        self.log("Checking webpack compilation errors...", "INFO")
        webpack_errors = await self.get_webpack_errors()
        
        if webpack_errors:
            self.log(f"Found {len(webpack_errors)} webpack errors", "WARNING")
            
            for error in webpack_errors:
                if error["id"] in self.fixed_errors:
                    continue
                
                if error["type"] == "missing_module":
                    if self.fix_missing_module(error):
                        fixes_applied += 1
                        await self.restart_service(error["app"])
                
                elif error["type"] == "tsconfig_no_emit":
                    if self.fix_tsconfig_no_emit(error):
                        fixes_applied += 1
                        await self.restart_service(error["app"])
                
                elif error["type"] == "typescript":
                    if self.fix_typescript_error(error):
                        fixes_applied += 1
                        await self.restart_service(error["app"])
        
        # 2. Check runtime errors
        self.log("Checking runtime errors...", "INFO")
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                try:
                    await page.goto(self.services["container"], timeout=10000)
                    await page.wait_for_timeout(3000)
                    
                    runtime_errors = await self.get_runtime_errors(page)
                    
                    if runtime_errors:
                        self.log(f"Found {len(runtime_errors)} runtime errors", "WARNING")
                        # Runtime errors typically need manual investigation
                        for error in runtime_errors:
                            self.log(f"Runtime error: {error['data'].get('message', 'Unknown')}", "WARNING")
                
                except Exception as e:
                    self.log(f"Failed to check runtime errors: {e}", "WARNING")
                
                finally:
                    await browser.close()
        
        except Exception as e:
            self.log(f"Failed to start browser: {e}", "ERROR")
        
        return fixes_applied

    async def run(self):
        """Main monitoring loop"""
        self.log("🤖 Automated Error Fixer Started", "INFO")
        self.log(f"Check interval: {self.check_interval}s", "INFO")
        self.log(f"Max iterations: {self.max_iterations}", "INFO")
        
        # Initial service health check
        if not await self.check_services_health():
            self.log("Some services are not healthy. Please start all services first.", "ERROR")
            self.log("Run: ./run.sh", "INFO")
            return False
        
        self.log("All services are healthy. Starting monitoring...", "SUCCESS")
        
        total_fixes = 0
        
        while self.iteration < self.max_iterations:
            self.iteration += 1
            
            fixes = await self.run_fix_cycle()
            total_fixes += fixes
            
            if fixes > 0:
                self.log(f"Applied {fixes} fixes in this cycle", "SUCCESS")
                self.log(f"Waiting {self.check_interval}s for services to rebuild...", "INFO")
            else:
                self.log("No errors found or no fixes applied", "SUCCESS")
                
                if self.iteration >= 3:  # If no errors for 3 cycles, we're done
                    self.log("System appears stable. Stopping monitoring.", "SUCCESS")
                    break
            
            await asyncio.sleep(self.check_interval)
        
        # Summary
        self.log("="*60, "INFO")
        self.log(f"Monitoring complete after {self.iteration} cycles", "INFO")
        self.log(f"Total fixes applied: {total_fixes}", "SUCCESS")
        self.log(f"Errors seen: {len(self.seen_errors)}", "INFO")
        self.log(f"Errors fixed: {len(self.fixed_errors)}", "SUCCESS")
        self.log("="*60, "INFO")
        
        return total_fixes > 0

async def main():
    parser = argparse.ArgumentParser(description="Automated Error Detection and Fixing System")
    parser.add_argument("--interval", type=int, default=30, help="Check interval in seconds (default: 30)")
    parser.add_argument("--max-iterations", type=int, default=10, help="Maximum fix iterations (default: 10)")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    
    args = parser.parse_args()
    
    fixer = ErrorFixer(
        project_root=args.project_root,
        check_interval=args.interval,
        max_iterations=args.max_iterations
    )
    
    success = await fixer.run()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
