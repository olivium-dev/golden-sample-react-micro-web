# 📦 Installation Guide - Micro-Frontend Platform

Complete guide to install all dependencies and get the platform running.

---

## ⚡ Quick Installation (3 Steps)

### Step 1: Check Prerequisites
```bash
CHECK-PREREQUISITES.bat
```

This will verify you have:
- ✅ Python 3.8+
- ✅ Node.js 16+
- ✅ npm (comes with Node.js)
- ✅ pip (comes with Python)

### Step 2: Install All Dependencies
```bash
INSTALL-ALL-DEPENDENCIES.bat
```

This will install:
- Backend Python packages
- Frontend Node.js packages for all 7 apps

**⏱️ Takes 5-10 minutes**

### Step 3: Start the Platform
```bash
START-MODULE-FEDERATION.bat
```

Then open: **http://localhost:30002**

---

## 🔧 Manual Installation

If the automated scripts don't work, follow these manual steps:

### Prerequisites Installation

#### 1. Install Python 3.8+

**Windows:**
1. Download from: https://www.python.org/downloads/
2. Run installer
3. ✅ **IMPORTANT**: Check "Add Python to PATH"
4. Click "Install Now"
5. Verify installation:
   ```bash
   python --version
   pip --version
   ```

**Expected output:**
```
Python 3.11.x
pip 23.x.x
```

---

#### 2. Install Node.js 16+

**Windows:**
1. Download LTS version from: https://nodejs.org/
2. Run installer
3. Click "Next" through all steps (default settings are fine)
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**Expected output:**
```
v18.x.x (or v20.x.x)
9.x.x (or 10.x.x)
```

---

### Backend Dependencies Installation

```bash
cd golden-sample-react-micro-web/backend/mock-data-service
pip install -r requirements.txt
```

**What gets installed:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `python-jose` - JWT handling
- `passlib` - Password hashing
- `faker` - Mock data generation
- `python-dotenv` - Environment variables

**Time:** ~2 minutes

---

### Frontend Dependencies Installation

**Install in this order:**

#### 1. Shared UI Library (Required First)
```bash
cd golden-sample-react-micro-web/frontend/shared-ui-lib
npm install
```

#### 2. Container App
```bash
cd golden-sample-react-micro-web/frontend/container
npm install
```

#### 3. User Management App
```bash
cd golden-sample-react-micro-web/frontend/user-management-app
npm install
```

#### 4. Data Grid App
```bash
cd golden-sample-react-micro-web/frontend/data-grid-app
npm install
```

#### 5. Analytics App
```bash
cd golden-sample-react-micro-web/frontend/analytics-app
npm install
```

#### 6. Settings App
```bash
cd golden-sample-react-micro-web/frontend/settings-app
npm install
```

#### 7. Orders App
```bash
cd golden-sample-react-micro-web/frontend/orders-app
npm install
```

**Time:** ~5-8 minutes total

---

## 🐛 Troubleshooting Installation

### ❌ "Python is not recognized"

**Problem:** Python not in PATH

**Solution:**
1. Uninstall Python
2. Reinstall from https://www.python.org/
3. ✅ Make sure to check **"Add Python to PATH"** during installation
4. Restart command prompt
5. Test: `python --version`

---

### ❌ "node is not recognized"

**Problem:** Node.js not in PATH

**Solution:**
1. Reinstall Node.js from https://nodejs.org/
2. Use default installation settings
3. Restart command prompt
4. Test: `node --version`

---

### ❌ "npm install" fails with EACCES error

**Problem:** Permission issues

**Solution (Windows):**
1. Run Command Prompt as Administrator
2. Try installation again

**Solution (Alternative):**
```bash
npm config set prefix %APPDATA%\npm
npm install
```

---

### ❌ "pip install" fails with SSL error

**Problem:** Certificate verification issue

**Solution:**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

### ❌ npm install very slow or hangs

**Problem:** Network issues or npm cache

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Use different registry (optional)
npm config set registry https://registry.npmjs.org/

# Try again
npm install
```

---

### ❌ "Module not found" errors after installation

**Problem:** Dependencies not fully installed

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### ❌ Python "No module named 'fastapi'"

**Problem:** Dependencies not installed in correct Python environment

**Solution:**
```bash
# Check which Python
python --version
which python  # or "where python" on Windows

# Install with specific Python
python -m pip install -r requirements.txt
```

---

## 📊 Disk Space Requirements

| Component | Size | Location |
|-----------|------|----------|
| Python packages | ~50 MB | backend/mock-data-service |
| Node modules (all apps) | ~1.5 GB | frontend/*/node_modules |
| **Total** | **~1.6 GB** | |

Make sure you have at least **2 GB free space**.

---

## 🔍 Verify Installation

### Check Backend Installation
```bash
cd golden-sample-react-micro-web/backend/mock-data-service
python -c "import fastapi; print('✓ FastAPI installed')"
python -c "import uvicorn; print('✓ Uvicorn installed')"
```

### Check Frontend Installation
```bash
cd golden-sample-react-micro-web/frontend/container
npm list react
npm list webpack
```

Should show installed versions without errors.

---

## 🚀 Post-Installation

After successful installation:

### 1. Start the Platform
```bash
START-MODULE-FEDERATION.bat
```

### 2. Verify Services Running

Check these URLs respond:
- Backend: http://localhost:30001/health
- Container: http://localhost:30002
- User Management: http://localhost:30003/remoteEntry.js
- Data Grid: http://localhost:30004/remoteEntry.js
- Analytics: http://localhost:30005/remoteEntry.js
- Settings: http://localhost:30006/remoteEntry.js

### 3. Test Login

Open http://localhost:30002 and login with:
```
Email: admin@example.com
Password: admin123
```

---

## 📦 What Gets Installed?

### Backend (Python)
```
fastapi==0.109.0           # Web framework
uvicorn[standard]==0.27.0  # ASGI server
python-multipart==0.0.6    # File uploads
pydantic[email]==2.5.3     # Data validation
faker==22.0.0              # Mock data
python-jose[cryptography]  # JWT tokens
passlib[bcrypt]==1.7.4     # Password hashing
python-dotenv==1.0.0       # Environment variables
```

### Frontend (Node.js) - Per App
```
react@18.2.0              # UI library
react-dom@18.2.0          # React DOM rendering
typescript@5.3.3          # Type system
webpack@5.89.0            # Module bundler
@mui/material@5.15.0      # UI components
@mui/icons-material       # Icons
@tanstack/react-query     # Data fetching
axios@1.6.5               # HTTP client
react-router-dom@6.21.0   # Routing
@emotion/react            # CSS-in-JS
@emotion/styled           # Styled components
```

**Plus many more development dependencies...**

---

## 🎯 Installation Checklist

Before starting development, make sure:

- [ ] ✅ Python 3.8+ installed and in PATH
- [ ] ✅ Node.js 16+ installed and in PATH
- [ ] ✅ npm working correctly
- [ ] ✅ pip working correctly
- [ ] ✅ Backend dependencies installed (pip install -r requirements.txt)
- [ ] ✅ All frontend apps dependencies installed (npm install in each)
- [ ] ✅ At least 2 GB free disk space
- [ ] ✅ No errors during installation
- [ ] ✅ Can start backend: `python main.py`
- [ ] ✅ Can start frontend: `npx webpack serve`

---

## 🆘 Still Having Issues?

### Check Logs

**Backend errors:**
Look at terminal where you ran `python main.py`

**Frontend errors:**
1. Open browser console (F12)
2. Look at terminal where webpack is running

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `ENOENT` | File/directory not found | Check path, run from correct directory |
| `EACCES` | Permission denied | Run as administrator (Windows) |
| `EADDRINUSE` | Port already in use | Close other instances or change port |
| `MODULE_NOT_FOUND` | Dependency missing | Run `npm install` or `pip install` |
| `SyntaxError` | Code error | Check Node/Python version compatibility |

### Get Help

1. Check browser console (F12) for frontend errors
2. Check terminal output for backend errors
3. Look at error messages carefully
4. Search error message online
5. Check if ports are already in use

---

## 🎊 Success!

If installation completed without errors, you're ready to go!

**Next step:**
```bash
START-MODULE-FEDERATION.bat
```

Then enjoy your micro-frontend platform! 🚀

---

**Estimated Total Time:** 10-15 minutes  
**Difficulty:** Easy (automated scripts do everything)  
**Prerequisites:** Internet connection + 2 GB free space



