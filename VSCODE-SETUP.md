# 🚀 VS Code Setup Guide

Run these commands in VS Code terminal (Ctrl+` or Ctrl+J to open terminal)

---

## ✅ STEP 1: Check Prerequisites

```bash
# Check Python
python --version

# Check Node.js
node --version

# Check npm
npm --version
```

**Expected output:**
- Python: 3.8+ 
- Node.js: 16+
- npm: 8+

**If missing:**
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

---

## 📦 STEP 2: Install Backend Dependencies

```bash
# Navigate to backend
cd golden-sample-react-micro-web/backend/mock-data-service

# Install Python packages
pip install -r requirements.txt

# Go back to root
cd ../..
```

---

## 📦 STEP 3: Install Frontend Dependencies

### Install all apps (takes 5-8 minutes):

```bash
# Navigate to frontend folder
cd golden-sample-react-micro-web/frontend

# 1. Shared UI Library (install first!)
cd shared-ui-lib
npm install
cd ..

# 2. Container
cd container
npm install
cd ..

# 3. User Management
cd user-management-app
npm install
cd ..

# 4. Data Grid
cd data-grid-app
npm install
cd ..

# 5. Analytics
cd analytics-app
npm install
cd ..

# 6. Settings
cd settings-app
npm install
cd ..

# 7. Orders
cd orders-app
npm install
cd ..

# Go back to root
cd ../..
```

---

## 🚀 STEP 4: Start the Platform

**Option A: Run in Multiple VS Code Terminals (Recommended)**

Open 6 separate terminals in VS Code (Terminal → Split Terminal or Ctrl+Shift+5)

**Terminal 1 - Backend:**
```bash
cd golden-sample-react-micro-web/backend/mock-data-service
python main.py
```

**Terminal 2 - Container:**
```bash
cd golden-sample-react-micro-web/frontend/container
npx webpack serve
```

**Terminal 3 - User Management:**
```bash
cd golden-sample-react-micro-web/frontend/user-management-app
npx webpack serve
```

**Terminal 4 - Data Grid:**
```bash
cd golden-sample-react-micro-web/frontend/data-grid-app
npx webpack serve
```

**Terminal 5 - Analytics:**
```bash
cd golden-sample-react-micro-web/frontend/analytics-app
npx webpack serve
```

**Terminal 6 - Settings:**
```bash
cd golden-sample-react-micro-web/frontend/settings-app
npx webpack serve
```

**Wait 15-20 seconds**, then open: http://localhost:30002

---

## 🎯 Quick Copy-Paste Commands

### Complete Installation (copy all at once):

```bash
# Install backend
cd golden-sample-react-micro-web/backend/mock-data-service && pip install -r requirements.txt && cd ../..

# Install all frontend apps
cd golden-sample-react-micro-web/frontend/shared-ui-lib && npm install && cd ../container && npm install && cd ../user-management-app && npm install && cd ../data-grid-app && npm install && cd ../analytics-app && npm install && cd ../settings-app && npm install && cd ../orders-app && npm install && cd ../..
```

---

## 🔐 Login Credentials

```
Email: admin@example.com
Password: admin123
```

---

## 📊 Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend | 30001 | http://localhost:30001 |
| Container | 30002 | http://localhost:30002 ⭐ |
| User Management | 30003 | http://localhost:30003 |
| Data Grid | 30004 | http://localhost:30004 |
| Analytics | 30005 | http://localhost:30005 |
| Settings | 30006 | http://localhost:30006 |

---

## 🛑 How to Stop Services

Press **Ctrl+C** in each terminal to stop that service.

---

## 🐛 Troubleshooting

### "Python not found"
```bash
# Try with python3
python3 --version
python3 main.py
```

### "pip not found"
```bash
# Try with pip3
pip3 install -r requirements.txt
```

### "Port already in use"
```bash
# Find and kill process (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 30002).OwningProcess | Stop-Process

# Or change port in webpack.config.js
```

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verify Installation

After installation, check:

```bash
# Backend packages
cd golden-sample-react-micro-web/backend/mock-data-service
python -c "import fastapi; print('✓ Backend OK')"

# Frontend packages (in any app)
cd ../../frontend/container
npm list react webpack
```

Should show versions without errors.

---

## 🎊 Success!

If all services start without errors:
1. Open http://localhost:30002
2. Login with admin@example.com / admin123
3. Explore the micro-frontends! 🚀



