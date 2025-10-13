# Quick Reference - Automated Error Fixing

## 🚀 One-Line Commands

### Start Auto-Fixer
```bash
./watch_and_fix.sh
```

### Start Services + Auto-Fixer
```bash
./run.sh && sleep 30 && ./watch_and_fix.sh
```

### Stop Everything
```bash
./stop.sh
```

---

## 📋 Common Commands

### Service Management
```bash
# Start all services
./run.sh

# Stop all services  
./stop.sh

# Restart all services
./stop.sh && sleep 2 && ./run.sh

# Check service health
curl http://localhost:3000
```

### Auto-Fixer Usage
```bash
# Basic usage (automatic)
./watch_and_fix.sh

# Custom interval (check every 60 seconds)
python3 auto_fix_errors.py --interval 60

# Limited iterations (run only 3 times)
python3 auto_fix_errors.py --max-iterations 3

# Both options
python3 auto_fix_errors.py --interval 30 --max-iterations 5

# Run in background
nohup ./watch_and_fix.sh > auto_fix.log 2>&1 &
```

### View Logs
```bash
# Container app
tail -f frontend/container/container.log

# All frontend apps
tail -f frontend/*//*.log

# Backend
tail -f backend/mock-data-service/backend.log

# Auto-fixer output
cat auto_fix.log
```

### Check Errors
```bash
# Webpack compilation errors
grep "ERROR in" frontend/container/container.log

# Count errors
grep -c "ERROR in" frontend/container/container.log

# Get error summary
grep "webpack.*compiled" frontend/container/container.log | tail -1
```

---

## 🔍 Debugging

### Check What's Running
```bash
# Check all ports
lsof -i :3000,:3001,:3002,:3003,:3004,:8000

# Check specific port
lsof -i :3000
```

### Kill Stuck Processes
```bash
# Kill by port
lsof -ti :3000 | xargs kill -9

# Kill webpack processes
pkill -f webpack

# Kill all frontend services
pkill -f "webpack.*frontend"
```

### Verify Services
```bash
# Quick health check all services
for port in 3000 3001 3002 3003 3004 8000; do
  curl -s -o /dev/null -w "Port $port: %{http_code}\n" http://localhost:$port
done

# Check if services are responding
curl -I http://localhost:3000 | head -1
curl -s http://localhost:8000/health
```

---

## 🧪 Testing

### Manual Testing
```bash
# Open all apps in browser
open http://localhost:3000
open http://localhost:3001
open http://localhost:3002
open http://localhost:3003
open http://localhost:3004

# Test backend API
curl http://localhost:8000/docs
curl http://localhost:8000/api/users
```

### Automated Testing
```bash
# Run error tests
./test_all_errors.sh

# Run auto-fixer test
python3 auto_fix_errors.py --max-iterations 2
```

---

## 🎯 Workflows

### Daily Development
```bash
# Morning: Start everything
./run.sh
./watch_and_fix.sh  # In separate terminal

# During the day: Code freely
# The auto-fixer handles errors automatically

# Evening: Stop everything
./stop.sh
```

### After Git Merge
```bash
# Merge branch
git merge feature-branch

# Auto-fix any issues
./watch_and_fix.sh

# Review and commit fixes
git diff
git add .
git commit -m "chore: auto-fix merge errors"
```

### Before Committing
```bash
# Check for errors
grep "ERROR in" frontend/*//*.log

# Fix automatically
python3 auto_fix_errors.py --max-iterations 3

# Review changes
git diff

# Commit if satisfied
git add .
git commit -m "fix: resolve TypeScript errors"
```

---

## 📊 Monitoring

### Real-Time Error Monitoring
```bash
# Watch container logs for errors
tail -f frontend/container/container.log | grep --color ERROR

# Watch all logs
tail -f frontend/*/*.log | grep --color ERROR

# Count errors in real-time
watch -n 5 'grep -c "ERROR in" frontend/container/container.log'
```

### Service Health Dashboard
```bash
# Create a simple dashboard
watch -n 2 '
echo "=== Service Health ==="
for port in 3000 3001 3002 3003 3004 8000; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null || echo "DOWN")
  echo "Port $port: $status"
done
'
```

---

## 🔧 Maintenance

### Clear Caches
```bash
# Clear node_modules
find frontend -name "node_modules" -type d -exec rm -rf {} +

# Reinstall dependencies
cd frontend/container && npm install
cd frontend/user-management-app && npm install
# ... repeat for other apps

# Or use root script
npm run install:all
```

### Reset Everything
```bash
# Nuclear option - fresh start
./stop.sh
pkill -f webpack
pkill -f uvicorn
rm -rf frontend/*/node_modules
rm -rf frontend/*/package-lock.json
npm run install:all
./run.sh
```

---

## 🎨 Customization

### Change Check Interval
```bash
# Default: 30 seconds
python3 auto_fix_errors.py --interval 30

# Fast checking: 10 seconds
python3 auto_fix_errors.py --interval 10

# Slow checking: 120 seconds  
python3 auto_fix_errors.py --interval 120
```

### Limit Iterations
```bash
# Run indefinitely (until Ctrl+C)
python3 auto_fix_errors.py --max-iterations 999

# Quick test (2 iterations)
python3 auto_fix_errors.py --max-iterations 2

# Moderate (10 iterations)
python3 auto_fix_errors.py --max-iterations 10
```

---

## 📖 Documentation Quick Links

| Doc | Purpose |
|-----|---------|
| [AUTO_FIX_GUIDE.md](./AUTO_FIX_GUIDE.md) | Full technical guide |
| [AUTO_FIX_SUMMARY.md](./AUTO_FIX_SUMMARY.md) | Overview & examples |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md) | Manual error handling |
| [FINAL_STATUS.md](./FINAL_STATUS.md) | Implementation status |
| [README.md](./README.md) | Project overview |

---

## ⌨️ Keyboard Shortcuts (In Browser)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + E` | Toggle error panel |
| `Ctrl/Cmd + Shift + C` | Clear all errors |
| `Ctrl/Cmd + Shift + M` | Open error monitor |

---

## 🆘 Emergency Commands

### App Won't Start
```bash
./stop.sh
pkill -f webpack
rm -rf frontend/container/node_modules
cd frontend/container && npm install
./run.sh
```

### Port Conflicts
```bash
# Find what's using the port
lsof -i :3000

# Kill it
lsof -ti :3000 | xargs kill -9

# Restart services
./run.sh
```

### Auto-Fixer Not Working
```bash
# Reinstall dependencies
pip3 install --upgrade playwright requests

# Reinstall browsers
python3 -m playwright install --force chromium

# Test manually
python3 auto_fix_errors.py --max-iterations 1
```

---

## 💡 Pro Tips

1. **Run in tmux/screen** for persistent sessions
   ```bash
   tmux new -s dev
   # Terminal 1: ./run.sh
   # Terminal 2: ./watch_and_fix.sh
   ```

2. **Set up shell aliases**
   ```bash
   alias dev-start="./run.sh"
   alias dev-stop="./stop.sh"
   alias dev-fix="./watch_and_fix.sh"
   ```

3. **Create a dev script**
   ```bash
   # dev.sh
   #!/bin/bash
   ./stop.sh 2>/dev/null
   ./run.sh
   sleep 30
   ./watch_and_fix.sh
   ```

4. **Monitor in real-time**
   ```bash
   # Use split terminal or tmux
   # Pane 1: tail -f frontend/container/container.log
   # Pane 2: ./watch_and_fix.sh
   ```

---

## ✅ Quick Checklist

Before starting work:
- [ ] Services running? (`curl http://localhost:3000`)
- [ ] Auto-fixer running? (`ps aux | grep auto_fix`)
- [ ] No port conflicts? (`lsof -i :3000-3004`)
- [ ] Backend healthy? (`curl http://localhost:8000/health`)

Before committing:
- [ ] No compilation errors? (`grep "ERROR in" frontend/*//*.log`)
- [ ] Auto-fixer ran? (Check git diff for fixes)
- [ ] All tests pass? (`npm test`)
- [ ] Review auto-fixes? (`git diff`)

---

**Keep this handy while developing!** 📌

