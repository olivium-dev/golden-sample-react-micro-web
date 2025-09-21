# Golden Sample React Micro-Frontend Architecture

A professional micro-frontend architecture demonstrating how to build modular, scalable frontend applications using React and iframe integration.

## 🚀 Features

- **Container App**: Main shell with header, footer, and side menu
- **4 Independent Micro-Frontends**:
  - 🧑‍💼 User Management (port 3001)
  - 📊 Data Grid (port 3002)
  - 📈 Analytics Dashboard (port 3003)
  - ⚙️ Settings Panel (port 3004)
- **Professional UI**: Clean, responsive layout with smooth transitions
- **Navigation System**: Side menu and dashboard cards for navigation

## 🏗️ Architecture

- Each micro-frontend runs independently on its own port
- Container app embeds micro-frontends using iframes
- Clean separation of concerns between applications
- Centralized navigation in the container app

## 🛠️ Quick Start

```bash
# Install all dependencies
npm install

# Start all applications
npm run dev:all

# Access the application
# Main Container: http://localhost:3000
# User Management: http://localhost:3001
# Data Grid: http://localhost:3002
# Analytics: http://localhost:3003
# Settings: http://localhost:3004
```

## 📦 Deployment

```bash
# Build all applications for production
npm run build:all

# Deploy each app to separate domains/subdomains
# Container App → https://app.yourcompany.com
# User Management → https://users.yourcompany.com  
# Data Grid → https://grid.yourcompany.com
# Analytics → https://analytics.yourcompany.com
# Settings → https://settings.yourcompany.com

# Update container's iframe URLs to production domains
```

## 🔄 Future Enhancements

- Add Webpack Module Federation for true micro-frontend architecture
- Implement Material-UI (MUI) for consistent styling
- Add Python microservices backend with FastAPI
- Implement shared component library

## 📜 License

MIT