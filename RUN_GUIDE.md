# 🚀 How to Run Your Micro-Frontend Project

## Two Simple Ways to Run Your Project

---

## 1️⃣ **Using npm (Recommended for Development)**

### Step 1: Navigate to Project Directory
```powershell
cd C:\Users\y2005\Desktop\Containarize\my-golden-sample-react-micro-web
```

### Step 2: Install All Dependencies
```powershell
npm run install:all
npm run install:backend
```

### Step 3: Start All Services
```powershell
npm run dev:minimal
```

**That's it!** All services will start automatically:
- 🐍 Backend (port 8000)
- 🏠 Container App (port 3000)
- 👥 User Management (port 3001)
- 📊 Data Grid (port 3002)
- 📈 Analytics (port 3003)
- ⚙️ Settings (port 3004)

---

## 2️⃣ **Using Docker (Most Reliable)**

### Option A: Run in Foreground (see logs)
```powershell
cd C:\Users\y2005\Desktop\Containarize\my-golden-sample-react-micro-web
docker-compose up
```

### Option B: Run in Background (detached)
```powershell
cd C:\Users\y2005\Desktop\Containarize\my-golden-sample-react-micro-web
docker-compose up -d
```

### Stop Docker Services
```powershell
docker-compose down
```

---

## 🌐 **Access Your Applications**

Once started, open these URLs in your browser:

| Application | URL |
|-------------|-----|
| 🏠 **Main App** | http://localhost:3000 |
| 👥 User Management | http://localhost:3001 |
| 📊 Data Grid | http://localhost:3002 |
| 📈 Analytics | http://localhost:3003 |
| ⚙️ Settings | http://localhost:3004 |
| 🐍 Backend API | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/api/docs |

---

## 🔑 **Demo Credentials**

```
Email:    admin@example.com
Password: admin123
```

---

## 🛑 **How to Stop Services**

### For npm method:
- Press `Ctrl+C` in the terminal where you ran `npm run dev:minimal`

### For Docker method:
```powershell
docker-compose down
```

---

## 🔧 **Troubleshooting**

### Port Already in Use?
```powershell
# Kill processes on specific ports
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Dependencies Issues?
```powershell
# Reinstall everything
npm run install:all
npm run install:backend
```

### Docker Issues?
```powershell
# Clean restart
docker-compose down
docker-compose up --build
```

---

## 📋 **What Each Method Does**

### npm Method:
- ✅ Uses `concurrently` to run all services in one terminal
- ✅ Shows colored logs for each service
- ✅ Hot reload enabled
- ✅ No additional windows/tabs
- ✅ Easy to stop with Ctrl+C

### Docker Method:
- ✅ Completely isolated environment
- ✅ Consistent across different machines
- ✅ Production-like setup
- ✅ Automatic service dependencies
- ✅ Easy scaling and deployment

---

## 🎉 **Enjoy Your Micro-Frontend Platform!**

Both methods will give you a fully functional micro-frontend platform with:
- Module Federation architecture
- JWT authentication
- Material-UI design system
- Real-time error monitoring
- Hot reload for development

**Choose the method that works best for you!** 🚀

