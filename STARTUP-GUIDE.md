# 🚀 Micro-Frontend Platform - Startup Guide

This guide explains how to start and use the Micro-Frontend Platform.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Startup Modes](#startup-modes)
- [Manual Startup](#manual-startup)
- [Port Reference](#port-reference)
- [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Option 1: Module Federation Mode (Recommended)
**Run all micro-frontends with dynamic loading:**

```bash
START-MODULE-FEDERATION.bat
```

Then open: **http://localhost:30002**

### Option 2: Standalone Mode
**Run each app independently:**

```bash
START-STANDALONE-MODE.bat
```

Then open: **http://localhost:3000**

### Option 3: Orders App Only
**Run the Orders app with real API:**

```bash
START-ORDERS-APP.bat
```

Then open: **http://localhost:3005** (in CORS-disabled Chrome)

---

## 🏗️ Architecture Overview

### Module Federation Mode (Production-Like)
```
┌─────────────────────────────────────────┐
│   Container App (Port 30002)            │
│   ┌───────────────────────────────────┐ │
│   │ Loads Remote Micro-Frontends:     │ │
│   │ • User Management (Port 30003)    │ │
│   │ • Data Grid (Port 30004)          │ │
│   │ • Analytics (Port 30005)          │ │
│   │ • Settings (Port 30006)           │ │
│   └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ⬇️
┌─────────────────────────────────────────┐
│   Backend API (Port 30001)              │
│   • Authentication                       │
│   • Users, Data, Analytics, Settings    │
│   • Orders (Mock)                        │
└─────────────────────────────────────────┘
```

### Standalone Mode (Development)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Container    │  │ User Mgmt    │  │ Data Grid    │
│ Port 3000    │  │ Port 3001    │  │ Port 3002    │
└──────────────┘  └──────────────┘  └──────────────┘
       ⬇️                  ⬇️                  ⬇️
┌─────────────────────────────────────────────────┐
│         Backend API (Port 30001)                │
└─────────────────────────────────────────────────┘
```

### Orders App (Real API)
```
┌──────────────────────────────────────┐
│   Orders App (Port 3005)             │
│   Standalone with Real API           │
└──────────────────────────────────────┘
              ⬇️
┌──────────────────────────────────────┐
│   Real API                           │
│   https://dev-creamat.fds-1.com      │
│   • GET /api/Order/User/{userId}     │
│   • POST /api/Order                  │
│   • DELETE /api/Order/{id}           │
└──────────────────────────────────────┘
```

---

## 🎯 Startup Modes

### 1. Module Federation Mode ⭐ (Recommended)

**When to use:**
- Testing the full micro-frontend architecture
- Production-like environment
- Dynamic loading of remote apps
- Shared dependencies optimization

**How it works:**
- Container app (port 30002) is the host
- Remote apps (ports 30003-30006) expose their components
- Webpack Module Federation loads remotes on-demand
- Shared libraries (React, MUI) loaded once

**Startup command:**
```bash
START-MODULE-FEDERATION.bat
```

**Access:**
- Main app: http://localhost:30002
- Login with: `admin@example.com` / `admin123`

---

### 2. Standalone Mode 🔧 (Development)

**When to use:**
- Developing individual apps independently
- Debugging specific features
- Faster hot-reload for single app
- No Module Federation complexity

**How it works:**
- Each app runs independently
- No remote loading
- Direct backend API calls
- Separate dev servers

**Startup command:**
```bash
START-STANDALONE-MODE.bat
```

**Access:**
- Container: http://localhost:3000
- User Management: http://localhost:3001
- Data Grid: http://localhost:3002
- Analytics: http://localhost:3003
- Settings: http://localhost:3004

---

### 3. Orders App Only 📦 (Real API)

**When to use:**
- Testing Orders functionality only
- Working with real production API
- Testing API integration
- Demonstrating CRUD operations

**How it works:**
- Standalone React app
- Connects to https://dev-creamat.fds-1.com
- Uses hardcoded Bearer token
- CORS disabled Chrome required

**Startup command:**
```bash
START-ORDERS-APP.bat
```

**Access:**
- Orders App: http://localhost:3005 (CORS-disabled Chrome)

---

## 🛠️ Manual Startup

If you prefer to start services manually, here are the commands:

### For Module Federation Mode:

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

---

### For Standalone Mode:

**Terminal 1 - Backend:**
```bash
cd golden-sample-react-micro-web/backend/mock-data-service
python main.py
```

**Terminal 2 - Container:**
```bash
cd golden-sample-react-micro-web/frontend/container
npx webpack serve --config webpack.minimal.js
```

**Terminal 3 - User Management:**
```bash
cd golden-sample-react-micro-web/frontend/user-management-app
npx webpack serve --config webpack.minimal.js
```

*...and so on for other apps*

---

### For Orders App Only:

**Terminal 1 - Orders App:**
```bash
cd golden-sample-react-micro-web/frontend/orders-app
npx webpack serve --config webpack.minimal.js
```

**Launch Chrome with CORS disabled:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="%TEMP%\chrome-dev-session" http://localhost:3005
```

---

## 📊 Port Reference

### Module Federation Mode
| Service | Port | URL | Type |
|---------|------|-----|------|
| Backend API | 30001 | http://localhost:30001 | FastAPI |
| Container (Host) | 30002 | http://localhost:30002 | React |
| User Management | 30003 | http://localhost:30003/remoteEntry.js | Remote |
| Data Grid | 30004 | http://localhost:30004/remoteEntry.js | Remote |
| Analytics | 30005 | http://localhost:30005/remoteEntry.js | Remote |
| Settings | 30006 | http://localhost:30006/remoteEntry.js | Remote |

### Standalone Mode
| Service | Port | URL | Type |
|---------|------|-----|------|
| Backend API | 30001 | http://localhost:30001 | FastAPI |
| Container | 3000 | http://localhost:3000 | Standalone |
| User Management | 3001 | http://localhost:3001 | Standalone |
| Data Grid | 3002 | http://localhost:3002 | Standalone |
| Analytics | 3003 | http://localhost:3003 | Standalone |
| Settings | 3004 | http://localhost:3004 | Standalone |

### Orders App
| Service | Port | URL | Type |
|---------|------|-----|------|
| Orders App | 3005 | http://localhost:3005 | Standalone + Real API |

---

## 🔐 Login Credentials

### For Container, User Management, Data Grid, Analytics, Settings:
```
Email: admin@example.com
Password: admin123

OR

Email: user@example.com
Password: user123
```

### For Orders App:
- No login required (uses hardcoded Bearer token)
- Token is embedded in the app configuration

---

## 🐛 Troubleshooting

### Error: "Loading script failed" or "remoteEntry.js 404"

**Problem:** Container can't load remote micro-frontends.

**Solution:**
1. Make sure you're using **Module Federation mode** (not standalone)
2. Start all services in the correct order (backend first, then all apps)
3. Wait 10-15 seconds for all services to be ready
4. Check that ports 30003-30006 are not already in use

**Check if remote apps are running:**
- http://localhost:30003/remoteEntry.js (should show JS code)
- http://localhost:30004/remoteEntry.js
- http://localhost:30005/remoteEntry.js
- http://localhost:30006/remoteEntry.js

---

### Error: "401 Unauthorized" on /api/auth/me

**Problem:** Backend returns 401 when checking authentication.

**Solution:**
1. This is normal on first load (not logged in yet)
2. Log in with credentials: `admin@example.com` / `admin123`
3. Token will be stored and used for subsequent requests

---

### Error: "CORS policy" for Orders App

**Problem:** Browser blocks requests to dev-creamat.fds-1.com

**Solution:**
1. Use the provided batch file: `START-ORDERS-APP.bat`
2. Or manually launch Chrome with CORS disabled:
   ```bash
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="%TEMP%\chrome-dev-session" http://localhost:3005
   ```

---

### Error: "Port already in use"

**Problem:** Port is occupied by another process.

**Solution:**
1. Close any previous instances of the apps
2. Kill processes using the ports:
   ```bash
   # Windows
   netstat -ano | findstr :30001
   taskkill /PID <PID> /F
   ```
3. Or use different ports by modifying `webpack.config.js`

---

### Error: "Module not found" or "Cannot find module"

**Problem:** Dependencies not installed.

**Solution:**
```bash
# Install backend dependencies
cd golden-sample-react-micro-web/backend/mock-data-service
pip install -r requirements.txt

# Install frontend dependencies (run for each app)
cd golden-sample-react-micro-web/frontend/container
npm install

cd ../user-management-app
npm install

# ...and so on for other apps
```

---

### Error: "Python command not found"

**Problem:** Python not installed or not in PATH.

**Solution:**
1. Install Python 3.8+ from https://www.python.org/
2. Add Python to PATH during installation
3. Verify: `python --version`

---

### Error: "webpack command not found"

**Problem:** Node.js/npm not installed or webpack not available.

**Solution:**
1. Install Node.js 16+ from https://nodejs.org/
2. Verify: `node --version` and `npm --version`
3. Use `npx webpack serve` instead of `webpack serve`

---

## 📚 Additional Resources

- **Webpack Module Federation**: https://webpack.js.org/concepts/module-federation/
- **React Query**: https://tanstack.com/query/latest
- **Material-UI**: https://mui.com/
- **FastAPI**: https://fastapi.tiangolo.com/

---

## 🎉 Success Indicators

You know everything is working when:

✅ All terminal windows show "webpack compiled successfully"
✅ No red errors in browser console
✅ Can log in with demo credentials
✅ Can navigate between all modules
✅ Module Federation: Sees all apps in one container
✅ Standalone: Each app works independently
✅ Orders App: Can view/create/delete orders

---

**Need help?** Check the error console in browser (F12) and terminal outputs for detailed error messages.



