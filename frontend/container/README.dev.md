# Container App - Development Configuration

## 📁 **Webpack Configurations**

This project now has **separate webpack configurations** for different environments:

### **Files:**
- `webpack.config.js` - **Production configuration** (unchanged)
  - Uses `/mf/` paths for Traefik routing
  - For Docker/production deployments
  
- `webpack.dev.js` - **Development configuration** (new)
  - Uses direct `localhost:PORT` URLs
  - For local development with selective micro-frontend loading

## 🚀 **Available Scripts**

### **Development Mode (Selective Loading)**
```bash
npm run start:dev
```
- Uses `webpack.dev.js` configuration
- Loads micro-frontends from `http://localhost:PORT/remoteEntry.js`
- **Smart loading**: Shows helpful messages for unavailable services
- **Start only what you need**: No need to run all micro-frontends

### **Production Mode (Full Docker)**
```bash
npm run start:prod
# or
npm start
```
- Uses `webpack.config.js` configuration  
- Expects `/mf/` paths (requires Traefik/Docker setup)
- All micro-frontends must be running

### **Build Commands**
```bash
npm run build:dev    # Development build
npm run build        # Production build
```

## 🎯 **Development Workflow**

### **Option 1: Selective Development (Recommended)**
```bash
# 1. Start container with development config
cd frontend/container
npm run start:dev

# 2. Start only the micro-frontends you need
cd frontend/delivery-app
npm start  # Port 3007

cd frontend/orders-app  
npm start  # Port 3006

# Available services load normally
# Unavailable services show helpful "Service Not Available" screens
```

### **Option 2: Full Docker Development**
```bash
# Build and run all services with Docker
./scripts/docker-full-rebuild.sh
./run.sh

# Then use production mode
cd frontend/container
npm run start:prod
```

## 🔧 **Service Ports**

| Service | Port | Status |
|---------|------|--------|
| Container | 3000 | Always needed |
| User Management | 3001 | Optional |
| Data Grid | 3002 | Optional |
| Analytics | 3003 | Optional |
| Settings | 3004 | Optional |
| Catalog | 3005 | Optional |
| Orders | 3006 | Optional |
| **Delivery** | **3007** | **Optional** |

## ✨ **Smart Loading Features**

When using `npm run start:dev`:

### **Available Service**
- ✅ Loads instantly with full functionality
- ✅ All features work as expected

### **Unavailable Service**  
- 🚧 Shows "Service Not Available" screen
- 📝 Displays exact commands to start the service
- 💡 Provides helpful development tips
- 🔗 Shows expected port information

## 🎉 **Benefits**

- **Faster Development**: Start only what you need
- **No Configuration Changes**: Production webpack unchanged
- **Better Developer Experience**: Clear instructions for missing services
- **Flexible Workflow**: Choose between selective or full development
- **Production Ready**: Seamless deployment with existing Docker setup

## 🚚 **Delivery App Integration**

The delivery app is now fully integrated and works with both configurations:

- **Development**: `npm run start:dev` + delivery app on port 3007
- **Production**: Full Docker setup with Traefik routing

Click "Delivery" in the navigation menu to access the delivery management system!
