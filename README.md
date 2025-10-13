# Micro-Frontend Golden Sample

A production-ready micro-frontend architecture demonstration using React, MUI, Webpack Module Federation, and Clean Architecture principles.

## 🎯 Overview

This project showcases enterprise-grade micro-frontend patterns with:
- **Material-UI (MUI)** - Complete UI migration with zero non-MUI components
- **Webpack Module Federation** - Dynamic remote loading with singleton sharing
- **Clean Architecture** - MVVM pattern in Data Grid app
- **FastAPI Backend** - Mock microservices with CRUD operations
- **Shared Theme System** - Runtime theming with CSS variables

## 🏗️ Architecture

### Frontend Micro-Frontends

```
frontend/
├── container/              # Host app (port 3000)
├── user-management-app/    # User CRUD (port 3001)
├── data-grid-app/         # Data Grid with Clean Architecture (port 3002)
├── analytics-app/         # Analytics Dashboard (port 3003)
├── settings-app/          # Settings & Theme Control (port 3004)
└── shared-ui-lib/         # Shared MUI theme and components
```

### Backend Microservices

```
backend/
└── mock-data-service/     # FastAPI mock backend (port 8000)
```

## ✨ Features

### 🎨 Complete MUI Integration
- **100% MUI Components** - No vanilla HTML elements
- Material Design v3 implementation
- Consistent theming across all micro-frontends
- Responsive design with MUI breakpoints
- Accessibility-first approach

### 🔌 Module Federation
- Dynamic remote loading
- Singleton sharing for React, ReactDOM, and MUI
- Lazy loading with Suspense
- Independent deployment capability
- Type-safe remote imports

### 🏛️ Clean Architecture (Data Grid App)
```
domain/         # Business logic (entities, use cases, interfaces)
├── entities/
├── usecases/
└── repositories/

data/           # Data access (API, mappers, implementations)
├── api/
├── mappers/
└── repositories/

presentation/   # UI (components, pages, viewmodels)
├── components/
├── pages/
└── viewmodels/

infra/         # Infrastructure (config, adapters)
```

### 📊 Feature-Rich Applications

#### Container App
- MUI AppBar with responsive navigation
- Persistent Drawer with menu items
- Dashboard with metric cards
- Module Federation integration
- Dark/Light theme switching

#### User Management
- MUI X DataGrid with sorting, filtering, pagination
- CRUD operations with dialogs
- Form validation
- Search functionality
- Status indicators with Chips

#### Data Grid (Clean Architecture)
- MVVM pattern implementation
- Dependency injection
- Repository pattern
- Use case-driven business logic
- Full CRUD with validation
- Advanced filtering

#### Analytics Dashboard
- Recharts integration
- Line, Bar, and Pie charts
- Metric cards with trends
- Real-time data visualization
- Responsive grid layout

#### Settings Panel
- Tabbed interface
- Theme mode switcher (Light/Dark)
- Color customization
- Notification preferences
- Language & timezone settings
- Accordion groups

### 🎨 Theming System
- Centralized theme configuration
- Design tokens (colors, typography, spacing)
- CSS variables for runtime theming
- ThemeProvider with context
- localStorage persistence
- Cross-micro-frontend theme sync

### 🔧 Backend API
- FastAPI with automatic OpenAPI docs
- RESTful endpoints for all resources
- Mock data generation with Faker
- CORS configuration
- In-memory storage
- Swagger UI at `/api/docs`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd golden-sample-react-micro-web

# Install all frontend dependencies
npm run install:all

# Install backend dependencies
cd backend/mock-data-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Development

Start all services concurrently:

```bash
# Terminal 1: Start backend
cd backend/mock-data-service
python main.py

# Terminal 2: Start all frontends
npm run dev:all
```

Or start individually:

```bash
# Backend
cd backend/mock-data-service && python main.py

# Container (port 3000)
cd frontend/container && npm start

# User Management (port 3001)
cd frontend/user-management-app && npm start

# Data Grid (port 3002)
cd frontend/data-grid-app && npm start

# Analytics (port 3003)
cd frontend/analytics-app && npm start

# Settings (port 3004)
cd frontend/settings-app && npm start
```

### Access Applications

- **Container App**: http://localhost:3000
- **API Documentation**: http://localhost:8000/api/docs
- **User Management**: http://localhost:3001 (standalone)
- **Data Grid**: http://localhost:3002 (standalone)
- **Analytics**: http://localhost:3003 (standalone)
- **Settings**: http://localhost:3004 (standalone)

## 📁 Project Structure

```
/
├── frontend/
│   ├── container/                 # Host application
│   │   ├── src/
│   │   │   ├── App.tsx           # Main app with MUI components
│   │   │   ├── index.tsx         # Entry with ThemeProvider
│   │   │   └── remotes.d.ts      # Type declarations
│   │   └── webpack.config.js     # Module Federation config
│   │
│   ├── user-management-app/      # User CRUD micro-frontend
│   │   └── src/
│   │       └── App.tsx           # DataGrid with CRUD
│   │
│   ├── data-grid-app/            # Clean Architecture example
│   │   ├── src/
│   │   │   ├── app/              # Application layer
│   │   │   ├── domain/           # Business logic
│   │   │   ├── data/             # Data access
│   │   │   ├── presentation/     # UI & ViewModels
│   │   │   └── infra/            # Configuration
│   │   └── CLEAN_ARCHITECTURE.md # Architecture docs
│   │
│   ├── analytics-app/            # Charts & metrics
│   │   └── src/
│   │       └── App.tsx           # Recharts implementation
│   │
│   ├── settings-app/             # Settings & theming
│   │   └── src/
│   │       └── App.tsx           # Theme control panel
│   │
│   └── shared-ui-lib/            # Shared theme library
│       ├── src/
│       │   ├── theme/            # MUI theme config
│       │   ├── tokens/           # Design tokens
│       │   └── components/       # ThemeProvider
│       └── README.md
│
├── backend/
│   └── mock-data-service/        # FastAPI backend
│       ├── main.py               # FastAPI app
│       ├── routers/              # API endpoints
│       ├── models/               # Pydantic models
│       └── mock_data.py          # Data generation
│
├── package.json                  # Root package with scripts
└── README.md                     # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **MUI v5** - Component library
- **MUI X DataGrid** - Advanced data tables
- **Recharts** - Charts library
- **Webpack 5** - Bundler
- **Module Federation** - Micro-frontend architecture
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Faker** - Mock data generation

## 📚 Key Concepts

### Module Federation Configuration

**Host (Container):**
```javascript
exposes: {
  './sharedUI': '../shared-ui-lib/src/index.ts',
},
remotes: {
  userApp: 'userApp@http://localhost:3001/remoteEntry.js',
  dataApp: 'dataApp@http://localhost:3002/remoteEntry.js',
  // ...
},
shared: {
  react: { singleton: true },
  '@mui/material': { singleton: true },
  // ...
}
```

**Remote (Micro-frontend):**
```javascript
exposes: {
  './UserManagement': './src/App.tsx',
},
shared: {
  react: { singleton: true },
  '@mui/material': { singleton: true },
  // ...
}
```

### Clean Architecture Flow

```
UI Event → ViewModel → Use Case → Repository Interface
              ↓                          ↓
         State Update ← Mapper ← Repository Impl → API
```

### Theming

```typescript
// Shared theme with CSS variables
const theme = createTheme({
  palette: {
    primary: { main: '#61dafb' },
    secondary: { main: '#ff6b6b' },
  },
});

// CSS variables injected automatically
:root {
  --primary-main: #61dafb;
  --secondary-main: #ff6b6b;
  // ...
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Test individual apps
cd frontend/container && npm test
cd frontend/user-management-app && npm test
# ...
```

## 📦 Building for Production

```bash
# Build all frontends
npm run build:all

# Build individual apps
cd frontend/container && npm run build
```

## 🔐 Environment Variables

Create `.env` files in each app:

```env
# Frontend apps
REACT_APP_API_URL=http://localhost:8000/api

# Backend
HOST=0.0.0.0
PORT=8000
```

## 🤖 Automated Error Detection and Fixing

The platform includes an intelligent auto-fixer that monitors and fixes errors automatically:

```bash
# Start monitoring and auto-fixing
./watch_and_fix.sh
```

**What it fixes automatically:**
- ✅ Missing npm packages
- ✅ Import path errors  
- ✅ TypeScript type errors
- ✅ Module not found errors
- ✅ Property access errors

The auto-fixer continuously:
1. Scans webpack compilation logs for TypeScript errors
2. Monitors browser console for runtime errors
3. Applies intelligent fixes based on error type
4. Restarts affected services automatically
5. Verifies that fixes resolve the issues

## 📖 Documentation

- [**Auto-Fix Guide**](AUTO_FIX_GUIDE.md) - Automated error fixing system ⭐ **NEW**
- [**Error Handling**](ERROR_HANDLING.md) - Manual error handling and monitoring
- [Shared UI Library](frontend/shared-ui-lib/README.md)
- [Clean Architecture Guide](frontend/data-grid-app/CLEAN_ARCHITECTURE.md)
- [Mock Backend API](backend/mock-data-service/README.md)
- [Deployment Guide](DEPLOYMENT.md)

## 🎯 Best Practices

1. **Use MUI exclusively** - No vanilla HTML/CSS
2. **Singleton sharing** - Prevent version conflicts
3. **Type safety** - TypeScript everywhere
4. **Clean architecture** - Separate concerns
5. **Error boundaries** - Graceful failure handling
6. **Loading states** - Suspense & CircularProgress
7. **Responsive design** - Mobile-first approach
8. **Accessibility** - ARIA labels and keyboard navigation

## 🚧 Known Limitations

- In-memory backend storage (resets on restart)
- Development-only CORS configuration
- No authentication/authorization implemented
- GitHub Pages deployment requires additional configuration

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use MUI components exclusively
3. Maintain type safety
4. Add tests for new features
5. Update documentation

## 📄 License

MIT

## 👥 Authors

Micro-Frontend Team

## 🙏 Acknowledgments

- MUI team for excellent component library
- Webpack team for Module Federation
- FastAPI team for elegant Python framework
- React team for the best UI library
