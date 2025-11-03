# 🚀 COMPLETE STARTUP COMMANDS

## ✅ **ORDERS NOW INTEGRATED IN DASHBOARD!**

Orders is now part of the main micro-frontend platform with Module Federation.

---

## 📋 **START ALL SERVICES (7 Terminals)**

Open VS Code in: `C:\Users\y2005\Desktop\my-main\golden-sample-react-micro-web`

Then open 7 terminals and run:

---

### **Terminal 1 - Backend:**
```bash
cd backend\mock-data-service
python main.py
```

**Wait for:** `Uvicorn running on http://0.0.0.0:30001`

---

### **Terminal 2 - Container (Main Dashboard):**
```bash
cd frontend\container
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

### **Terminal 3 - User Management:**
```bash
cd frontend\user-management-app
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

### **Terminal 4 - Data Grid:**
```bash
cd frontend\data-grid-app
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

### **Terminal 5 - Analytics:**
```bash
cd frontend\analytics-app
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

### **Terminal 6 - Settings:**
```bash
cd frontend\settings-app
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

### **Terminal 7 - Orders (NEW!):**
```bash
cd frontend\orders-app
npx webpack serve
```

**Wait for:** `webpack compiled successfully`

---

## 🌐 **Open Browser:**

**Wait 20-30 seconds** after all terminals show "compiled successfully"

Then open: **http://localhost:30002**

**Login:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 🎯 **What's New:**

✅ **Orders is now in the sidebar!**
- Click "Orders" in the left sidebar
- View all orders with perfect table spacing
- Create new orders
- Delete orders
- View order details

✅ **Uses same backend as other apps**
- No need for CORS-disabled Chrome
- Uses standard authentication
- Integrated with the platform

✅ **Module Federation enabled**
- Loads dynamically from main dashboard
- Shares React, MUI, and other dependencies
- Fast and efficient

---

## 📊 **Port Reference:**

| Service | Port | URL |
|---------|------|-----|
| Backend | 30001 | http://localhost:30001 |
| Container ⭐ | 30002 | http://localhost:30002 |
| User Management | 30003 | http://localhost:30003 |
| Data Grid | 30004 | http://localhost:30004 |
| Analytics | 30005 | http://localhost:30005 |
| Settings | 30006 | http://localhost:30006 |
| **Orders** 🆕 | **30007** | **http://localhost:30007** |

---

## 🛑 **To Stop:**

Press **Ctrl+C** in each of the 7 terminals

---

## ✅ **Success Indicators:**

✓ All terminals show "webpack compiled successfully"
✓ No red errors in browser console (F12)
✓ Can log in with demo credentials
✓ Can see **7 menu items** in sidebar (including Orders!)
✓ Orders loads without errors
✓ Can create/delete orders

---

## 🎊 **You're All Set!**

Navigate through all modules including the new Orders section! 🚀



