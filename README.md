# 🚀 Micro-Frontend Platform

A comprehensive micro-frontend architecture built with React, Webpack Module Federation, FastAPI, and Material-UI.

## ⚡ Quick Start

### 🔧 First Time Setup (3 Steps)

1. **Check Prerequisites** (1 min)
   ```bash
   CHECK-PREREQUISITES.bat
   ```

2. **Install Dependencies** (5-10 min)
   ```bash
   INSTALL-ALL-DEPENDENCIES.bat
   ```

3. **Start Platform** (1 min)
   ```bash
   START-MODULE-FEDERATION.bat
   ```

Then open: **http://localhost:30002** and login with `admin@example.com` / `admin123`

📖 **Need help?** See **[START-HERE.txt](START-HERE.txt)** for complete setup guide

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK-START.txt](QUICK-START.txt)** | One-page reference card with all essential info |
| **[STARTUP-GUIDE.md](STARTUP-GUIDE.md)** | Complete guide with architecture, troubleshooting, and manual commands |
| **[FIXES-APPLIED.md](FIXES-APPLIED.md)** | Detailed explanation of all fixes applied to resolve errors |

---

## 🎯 What's This Project?

This is a **production-ready micro-frontend platform** demonstrating:

✅ **Webpack Module Federation** - Dynamic loading of remote micro-frontends  
✅ **JWT Authentication** - Secure login with access/refresh tokens  
✅ **Multiple Micro-Frontends** - User Management, Data Grid, Analytics, Settings, Orders  
✅ **Shared UI Library** - Reusable components, error handling, auth context  
✅ **FastAPI Backend** - Mock API with authentication and CRUD operations  
✅ **Material-UI** - Modern, responsive UI components  
✅ **React Query** - Efficient data fetching and caching  
✅ **Error Monitoring** - Real-time error tracking and analysis  

---

## 🏗️ Architecture

### Module Federation Mode (Production-Like)

```
┌─────────────────────────────────────────┐
│   Container App (Port 30002)            │
│   ┌───────────────────────────────────┐ │
│   │ Dynamically Loads:                │ │
│   │ • User Management (Port 30003)    │ │
│   │ • Data Grid (Port 30004)          │ │
│   │ • Analytics (Port 30005)          │ │
│   │ • Settings (Port 30006)           │ │
│   └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ⬇️
┌─────────────────────────────────────────┐
│   Backend API (Port 30001)              │
│   • JWT Authentication                   │
│   • User Management                      │
│   • Data Operations                      │
│   • Analytics                            │
│   • Settings                             │
└─────────────────────────────────────────┘
```

---

## 🚀 Startup Modes

### 1. Module Federation Mode ⭐ (Recommended)

**Best for:** Full system testing, production simulation, demonstrations

```bash
START-MODULE-FEDERATION.bat
```

- **Container**: http://localhost:30002 (main app)
- **Backend**: http://localhost:30001 (API)
- **Remotes**: Ports 30003-30006 (loaded dynamically)

**Features:**
- Dynamic remote loading
- Shared dependencies (React, MUI)
- Production-like behavior
- Code splitting optimization

---

### 2. Standalone Mode 🔧

**Best for:** Development, debugging individual apps, faster iteration

```bash
START-STANDALONE-MODE.bat
```

- **Container**: http://localhost:3000
- **User Management**: http://localhost:3001
- **Data Grid**: http://localhost:3002
- **Analytics**: http://localhost:3003
- **Settings**: http://localhost:3004

**Features:**
- Independent app development
- Faster hot reload
- No Module Federation complexity
- Easier debugging

---

### 3. Orders App 📦

**Best for:** Testing real API integration, CRUD operations

```bash
START-ORDERS-APP.bat
```

- **Orders App**: http://localhost:3005 (CORS-disabled Chrome)

**Features:**
- Real API connection (dev-creamat.fds-1.com)
- Full CRUD operations
- Beautiful table UI with perfect spacing
- View details in separate page

---

## 🔑 Login Credentials

```
Admin:   admin@example.com   / admin123
User:    user@example.com    / user123
Viewer:  viewer@example.com  / viewer123
```

---

## 📊 Port Reference

### Module Federation Mode
| Service | Port | URL |
|---------|------|-----|
| Backend | 30001 | http://localhost:30001 |
| **Container** | **30002** | **http://localhost:30002** ⭐ |
| User Management | 30003 | http://localhost:30003 |
| Data Grid | 30004 | http://localhost:30004 |
| Analytics | 30005 | http://localhost:30005 |
| Settings | 30006 | http://localhost:30006 |

### Standalone Mode
| Service | Port | URL |
|---------|------|-----|
| Backend | 30001 | http://localhost:30001 |
| Container | 3000 | http://localhost:3000 |
| User Management | 3001 | http://localhost:3001 |
| Data Grid | 3002 | http://localhost:3002 |
| Analytics | 3003 | http://localhost:3003 |
| Settings | 3004 | http://localhost:3004 |

### Orders App
| Service | Port | URL |
|---------|------|-----|
| Orders | 3005 | http://localhost:3005 |

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Webpack 5** - Module bundling
- **Module Federation** - Micro-frontend architecture
- **Material-UI (MUI)** - Component library
- **React Query** - Data fetching
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Uvicorn** - ASGI server
- **Python 3.8+** - Programming language

### Dev Tools
- **TypeScript Compiler** - Type checking
- **ts-loader** - TypeScript webpack loader
- **webpack-dev-server** - Development server
- **Hot Module Replacement** - Live reload

---

## 📦 Project Structure

```
golden-sample-react-micro-web/
├── backend/
│   └── mock-data-service/
│       ├── main.py                  # FastAPI app entry
│       ├── routers/                 # API endpoints
│       │   ├── auth.py              # Authentication
│       │   ├── users.py             # User management
│       │   ├── data.py              # Data operations
│       │   ├── analytics.py         # Analytics
│       │   ├── settings.py          # Settings
│       │   └── orders.py            # Orders
│       ├── auth/                    # Auth utilities
│       ├── models/                  # Pydantic models
│       └── config/                  # Configuration
│
├── frontend/
│   ├── container/                   # Main container app
│   │   ├── webpack.config.js        # Module Federation config
│   │   └── webpack.minimal.js       # Standalone config
│   │
│   ├── shared-ui-lib/               # Shared components
│   │   └── src/
│   │       ├── auth/                # Auth context & service
│   │       ├── errors/              # Error handling
│   │       └── api/                 # API client
│   │
│   ├── user-management-app/         # User management micro-frontend
│   ├── data-grid-app/               # Data grid micro-frontend
│   ├── analytics-app/               # Analytics micro-frontend
│   ├── settings-app/                # Settings micro-frontend
│   └── orders-app/                  # Orders micro-frontend (real API)
│
├── START-MODULE-FEDERATION.bat      # Startup script (Module Fed)
├── START-STANDALONE-MODE.bat        # Startup script (Standalone)
├── START-ORDERS-APP.bat             # Startup script (Orders)
├── QUICK-START.txt                  # Quick reference card
├── STARTUP-GUIDE.md                 # Comprehensive guide
├── FIXES-APPLIED.md                 # Detailed fixes documentation
└── README.md                        # This file
```

---

## ✨ Key Features

### 🔐 Authentication
- JWT-based authentication
- Access & refresh tokens
- Automatic token refresh
- Cross-tab logout sync
- Role-based access (admin, user, viewer)

### 🚀 Micro-Frontend Architecture
- Webpack Module Federation
- Dynamic remote loading
- Shared dependencies
- Independent deployment
- Hot module replacement

### 🎨 UI/UX
- Material-UI components
- Responsive design
- Dark mode support
- Error boundaries
- Loading states
- Toast notifications

### 📊 Data Management
- React Query for data fetching
- Optimistic updates
- Cache management
- Auto-refetch on window focus
- Pagination support

### 🐛 Error Monitoring
- Real-time error capture
- Error panel with details
- Error toast notifications
- Stack trace analysis
- Keyboard shortcuts (Ctrl+Shift+E)

### 📦 Orders App
- Real API integration
- Full CRUD operations
- Beautiful table UI
- Perfect spacing
- View details page
- Status chips
- Delete confirmation

---

## 🐛 Troubleshooting

### ❌ "Loading script failed" or "remoteEntry.js 404"

**Problem:** Container can't load remote micro-frontends.

**Solution:**
1. Use `START-MODULE-FEDERATION.bat` (not standalone mode)
2. Wait 15 seconds for all services to start
3. Check ports 30003-30006 are not in use

---

### ❌ "401 Unauthorized" on /api/auth/me

**Problem:** Not logged in yet.

**Solution:** This is normal before login - just log in with `admin@example.com` / `admin123`

---

### ❌ "CORS policy" for Orders App

**Problem:** Browser blocks requests to external API.

**Solution:** Use `START-ORDERS-APP.bat` which launches CORS-disabled Chrome

---

### ❌ "Port already in use"

**Problem:** Another process is using the port.

**Solution:**
```bash
# Windows - Find process using port
netstat -ano | findstr :30001

# Kill process
taskkill /PID <PID> /F
```

---

## 📚 Additional Documentation

- **Backend API Docs**: http://localhost:30001/api/docs (Swagger UI)
- **Backend ReDoc**: http://localhost:30001/api/redoc (Alternative docs)

---

## 🎯 Development Workflow

### For Module Federation Development:

1. Start all services:
   ```bash
   START-MODULE-FEDERATION.bat
   ```

2. Open browser:
   ```
   http://localhost:30002
   ```

3. Make changes to any micro-frontend

4. See live reload in container app

### For Individual App Development:

1. Start standalone mode:
   ```bash
   START-STANDALONE-MODE.bat
   ```

2. Open specific app:
   ```
   http://localhost:3001  (User Management)
   http://localhost:3002  (Data Grid)
   etc.
   ```

3. Develop and test independently

---

## 🚧 Known Limitations

1. **CORS for Orders App** - Requires CORS-disabled Chrome for development
2. **Hardcoded Ports** - Ports are hardcoded in webpack configs
3. **Development Tokens** - Orders app uses hardcoded Bearer token
4. **No Docker Support** - Would need Dockerfiles for production deployment

---

## 🔮 Future Enhancements

- [ ] Dynamic port detection
- [ ] Service discovery
- [ ] Docker support
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Production builds optimization
- [ ] E2E testing
- [ ] Performance monitoring
- [ ] Analytics dashboard
- [ ] User management CRUD

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `START-MODULE-FEDERATION.bat`
5. Submit a pull request

---

## 📄 License

This is a demonstration project for educational purposes.

---

## 🎉 Success Indicators

You know everything is working when:

✅ All terminals show "webpack compiled successfully"  
✅ No red errors in browser console (F12)  
✅ Can log in with demo credentials  
✅ Can navigate between all modules  
✅ Module Federation: All apps load in one container  
✅ Standalone: Each app works independently  
✅ Orders app: Can view/create/delete orders  

---

## 💡 Tips

- **Keyboard Shortcuts**: `Ctrl+Shift+E` opens error panel
- **Clear Errors**: `Ctrl+Shift+C` clears all errors
- **Error Monitor**: `Ctrl+Shift+M` jumps to error monitor
- **Hot Reload**: Changes auto-reload in browser
- **Multiple Tabs**: Auth syncs across tabs

---

## 📞 Support

Check the documentation:
- [QUICK-START.txt](QUICK-START.txt) - Quick reference
- [STARTUP-GUIDE.md](STARTUP-GUIDE.md) - Comprehensive guide
- [FIXES-APPLIED.md](FIXES-APPLIED.md) - Technical details

---

## 🎊 Acknowledgments

Built with:
- React & TypeScript
- Webpack Module Federation
- FastAPI
- Material-UI
- React Query

---

**Ready to start?** Run `START-MODULE-FEDERATION.bat` and enjoy! 🚀

---

*Last Updated: November 2, 2025*

