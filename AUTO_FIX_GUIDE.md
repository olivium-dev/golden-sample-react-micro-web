# Automated Error Detection and Fixing System

## Overview

This system automatically monitors your micro-frontend application for errors and attempts to fix them without manual intervention. It continuously scans for:

- **Webpack compilation errors** (TypeScript, missing modules, etc.)
- **Runtime errors** (JavaScript console errors, unhandled exceptions)
- **Module Federation errors** (remote loading failures)
- **API errors** (network failures, backend issues)

## Quick Start

### Option 1: Automatic (Recommended)

Run the wrapper script that handles everything:

```bash
./watch_and_fix.sh
```

This will:
1. Check if services are running (start them if not)
2. Install required dependencies
3. Start monitoring and auto-fixing errors

### Option 2: Manual Control

```bash
# Install dependencies first
pip3 install playwright requests
python3 -m playwright install chromium

# Run the auto-fixer
python3 auto_fix_errors.py
```

### Option 3: Custom Configuration

```bash
python3 auto_fix_errors.py \
  --interval 30 \           # Check every 30 seconds
  --max-iterations 10       # Run max 10 fix cycles
```

## What Gets Fixed Automatically

### 1. Missing NPM Packages ✅

**Error:**
```
Module not found: Error: Can't resolve 'recharts'
```

**Fix:**
- Automatically runs `npm install <package>`
- Restarts the affected service
- Verifies the fix

### 2. Import Path Errors ✅

**Error:**
```
TS2307: Cannot find module '../shared-ui-lib/src'
```

**Fix:**
- Detects incorrect relative paths
- Calculates correct depth (../../)
- Updates import statements
- Restarts the service

### 3. TypeScript Type Errors ✅

**Error:**
```
TS7006: Parameter 'event' implicitly has an 'any' type
```

**Fix:**
- Adds type annotations (`: any`, `: Event`, etc.)
- Adds type assertions (`as any`)
- Updates the affected file

### 4. Property Access Errors ⚠️

**Error:**
```
TS2339: Property '__webpack_require__' does not exist on type 'Window'
```

**Fix:**
- Adds type assertions (`(window as any).__webpack_require__`)
- Wraps problematic code

### 5. Type Mismatch Errors ⚠️

**Error:**
```
TS2345: Argument of type 'any[]' is not assignable to parameter
```

**Fix:**
- Adds `as any` assertions
- Relaxes type constraints

## How It Works

### 1. Error Detection

```
┌─────────────────────────────────────────────┐
│  Monitor Webpack Logs                       │
│  • Parse TypeScript errors                  │
│  • Extract file, line, error code           │
│  • Identify missing modules                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Monitor Browser Console                    │
│  • Capture console.error                    │
│  • Check ErrorLogger API                    │
│  • Detect runtime exceptions                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Categorize Errors                          │
│  • TypeScript compilation errors            │
│  • Missing dependencies                     │
│  • Runtime errors                           │
│  • Module Federation errors                 │
└─────────────────────────────────────────────┘
```

### 2. Error Fixing

```
┌─────────────────────────────────────────────┐
│  Analyze Error Type                         │
│  • TS2307 → Import path issue               │
│  • TS7006 → Missing type annotation         │
│  • Missing module → npm install             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Apply Fix Strategy                         │
│  • Modify source files                      │
│  • Install dependencies                     │
│  • Update configurations                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Restart Affected Service                   │
│  • Kill webpack process                     │
│  • Start fresh build                        │
│  • Wait for compilation                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Verify Fix                                 │
│  • Check if error reappears                 │
│  • Mark as fixed if resolved                │
│  • Try alternative fix if failed            │
└─────────────────────────────────────────────┘
```

### 3. Monitoring Loop

```
Start
  │
  ├─► Check Services Health
  │     │
  │     ├─► All Healthy? Continue
  │     └─► Not Healthy? Report & Exit
  │
  ├─► Scan for Errors
  │     │
  │     ├─► Webpack logs
  │     ├─► Browser console
  │     └─► ErrorLogger API
  │
  ├─► Found Errors?
  │     │
  │     ├─► Yes: Apply Fixes → Restart Services
  │     └─► No: Continue
  │
  ├─► Wait (interval)
  │
  ├─► Max Iterations Reached?
  │     │
  │     ├─► Yes: Stop
  │     └─► No: Loop
  │
Stop
```

## Architecture

### Components

```
auto_fix_errors.py
├── ErrorFixer (Main Class)
│   ├── check_services_health()      # Verify all services are running
│   ├── get_webpack_errors()         # Parse webpack logs
│   ├── get_runtime_errors()         # Check browser console
│   ├── fix_missing_module()         # Install npm packages
│   ├── fix_typescript_error()       # Fix TS compilation errors
│   │   ├── fix_module_not_found()   # Correct import paths
│   │   ├── fix_implicit_any()       # Add type annotations
│   │   ├── fix_property_not_exist() # Add type assertions
│   │   └── fix_type_mismatch()      # Fix type mismatches
│   ├── restart_service()            # Restart webpack process
│   └── run_fix_cycle()              # Main loop iteration
└── main()                           # Entry point

watch_and_fix.sh
├── Check services
├── Install dependencies
└── Run auto_fix_errors.py
```

## Configuration

### Command Line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--interval` | 30 | Seconds to wait between checks |
| `--max-iterations` | 10 | Maximum fix attempts |
| `--project-root` | `.` | Project root directory |

### Environment Variables

```bash
# Custom check interval
export AUTO_FIX_INTERVAL=60

# Enable verbose logging
export AUTO_FIX_VERBOSE=true

# Disable automatic restarts
export AUTO_FIX_NO_RESTART=true
```

## Logs and Output

### Real-time Output

```
[13:42:52] ℹ️ 🤖 Automated Error Fixer Started
[13:42:52] ℹ️ Check interval: 20s
[13:42:52] ℹ️ Max iterations: 2
[13:42:52] ✅ All services are healthy. Starting monitoring...
[13:42:52] ℹ️ Starting fix cycle 1/2
[13:42:52] ℹ️ Checking webpack compilation errors...
[13:42:52] ⚠️ Found 5 webpack errors
[13:42:52] 🔧 Attempting to fix TS2307 in App.tsx:44
[13:42:52] ✅ Fixed import path in App.tsx:44
[13:42:52] ℹ️ Restarting container service...
[13:42:54] ✅ container service restarted
```

### Log Files

Error fixer maintains its own log:
```
logs/auto_fix_errors.log
```

Service logs are in their respective directories:
```
frontend/container/container.log
frontend/user-management-app/user-management.log
...
```

## Error Types Reference

### TypeScript Errors

| Code | Description | Auto-Fix Strategy |
|------|-------------|-------------------|
| TS2307 | Cannot find module | Fix import path |
| TS7006 | Implicit any type | Add type annotation |
| TS2339 | Property doesn't exist | Add type assertion |
| TS2345 | Type not assignable | Add type cast |
| TS2322 | Type mismatch | Add type assertion |

### Module Errors

| Error | Auto-Fix Strategy |
|-------|-------------------|
| Module not found | `npm install <package>` |
| Cannot resolve | Fix import path |
| ENOENT | Create missing file |

### Runtime Errors

| Error Type | Detection Method | Fix Strategy |
|------------|------------------|--------------|
| Unhandled exception | ErrorLogger API | Report to developer |
| Module Federation failure | Browser console | Check remote services |
| API error | Network monitoring | Verify backend health |
| React error | ErrorBoundary | Component isolation |

## Limitations

### What Cannot Be Fixed Automatically

1. **Business Logic Errors** ❌
   - Incorrect algorithm implementation
   - Wrong API endpoint URLs
   - Data transformation errors

2. **Module Federation Type Declarations** ⚠️
   - `TS2307` errors for remote modules are **expected**
   - TypeScript cannot statically analyze dynamic imports
   - These are runtime-only and work correctly despite the warning

3. **Complex Type Issues** ❌
   - Generic type inference problems
   - Complex interface mismatches
   - Circular dependencies

4. **Runtime Logic Errors** ❌
   - Null pointer exceptions from bad logic
   - Incorrect state management
   - Race conditions

5. **Infrastructure Issues** ❌
   - Port conflicts (use `./stop.sh` first)
   - Out of memory errors
   - Network connectivity issues

## Best Practices

### 1. Run Before Starting Work

```bash
# Start services
./run.sh

# Start auto-fixer in a separate terminal
./watch_and_fix.sh
```

### 2. Monitor the Output

Keep an eye on the auto-fixer terminal to see:
- What errors are being detected
- What fixes are being applied
- If any errors require manual intervention

### 3. Review Auto-Applied Fixes

After the auto-fixer makes changes:

```bash
# Check what was modified
git diff

# Review the changes
git diff frontend/container/src/App.tsx

# If satisfied, commit
git add .
git commit -m "chore: auto-fix TypeScript errors"
```

### 4. Gradual Rollout

Start with short monitoring periods:

```bash
# Quick test (2 iterations)
python3 auto_fix_errors.py --max-iterations 2

# If successful, run longer
python3 auto_fix_errors.py --max-iterations 10
```

### 5. Integration with CI/CD

```yaml
# .github/workflows/auto-fix.yml
name: Auto-Fix Errors

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: |
          pip install playwright requests
          playwright install chromium
      - name: Start services
        run: ./run.sh
      - name: Run auto-fixer
        run: python3 auto_fix_errors.py --max-iterations 5
      - name: Create PR if fixes applied
        if: success()
        uses: peter-evans/create-pull-request@v4
        with:
          title: 'chore: automated error fixes'
```

## Troubleshooting

### Auto-fixer Won't Start

**Problem:** `Services are not healthy`

**Solution:**
```bash
./stop.sh
./run.sh
sleep 30
./watch_and_fix.sh
```

### Fixes Not Being Applied

**Problem:** Errors detected but no fixes applied

**Check:**
1. File permissions: `ls -la frontend/container/src/`
2. Git status: `git status` (no conflicting changes)
3. Service logs: `tail -f frontend/container/container.log`

### Service Won't Restart

**Problem:** Service keeps crashing after restart

**Solution:**
```bash
# Manually restart to see errors
cd frontend/container
npm start

# Check for port conflicts
lsof -i :3000

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Automation Fails

**Problem:** `Failed to start browser`

**Solution:**
```bash
# Reinstall playwright browsers
python3 -m playwright install --force chromium

# Or use system browser
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## Advanced Usage

### Custom Fix Strategies

Extend `ErrorFixer` class to add custom fix logic:

```python
class CustomErrorFixer(ErrorFixer):
    def fix_custom_error(self, error: Dict[str, Any]) -> bool:
        # Your custom fix logic
        pass
```

### Integration with ErrorLogger

Access errors from the shared error system:

```python
# In auto_fix_errors.py
runtime_errors = await page.evaluate("""
    () => window.ErrorLogger?.getErrors() || []
""")
```

### Programmatic Usage

Use the fixer in your own scripts:

```python
from auto_fix_errors import ErrorFixer

fixer = ErrorFixer(
    project_root=".",
    check_interval=30,
    max_iterations=5
)

await fixer.run()
```

## Related Documentation

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Manual error handling guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [README.md](./README.md) - Project overview

## Support

If the auto-fixer isn't working as expected:

1. Check service health: `curl http://localhost:3000`
2. Review logs: `tail -f logs/auto_fix_errors.log`
3. Run in verbose mode: Add print statements
4. Report issues with full logs and error messages

## Summary

The Automated Error Detection and Fixing System:

✅ **Monitors** webpack compilation, runtime errors, and Module Federation issues  
✅ **Fixes** TypeScript errors, import paths, and missing dependencies  
✅ **Restarts** services automatically after applying fixes  
✅ **Verifies** that fixes resolve the issues  
✅ **Reports** all actions with timestamped logs  

This system significantly reduces manual debugging time and keeps your micro-frontend platform running smoothly! 🚀

