# Creamati CMS - Micro-Frontend Platform

A production-ready micro-frontend application built with React, Webpack Module Federation, Material-UI, and Traefik reverse proxy.

## 🏗️ Architecture Overview

### System Architecture

This project follows a **micro-frontend architecture** pattern, where multiple independent frontend applications are composed into a single user experience. Each micro-frontend (MFE) can be developed, tested, and deployed independently.

```
┌─────────────────────────────────────────────────────────────┐
│                         Traefik                              │
│                    (Reverse Proxy)                           │
│                    Port 3000 & 8080                          │
└───────┬─────────────────────────────────────────────────────┘
        │
        ├─── / ──────────────────────► Container App (Host)
        │                               - Main application shell
        │                               - Loads all MFEs
        │                               - Shared UI components
        │
        ├─── /mf/user-management/ ───► User Management MFE
        │                               - User CRUD operations
        │                               - User authentication UI
        │
        ├─── /mf/data-grid/ ──────────► Data Grid MFE
        │                               - Data tables
        │                               - Grid operations
        │
        ├─── /mf/analytics/ ──────────► Analytics MFE
        │                               - Charts & visualizations
        │                               - Analytics dashboard
        │
        ├─── /mf/settings/ ───────────► Settings MFE
        │                               - Application settings
        │                               - User preferences
        │
        ├─── /mf/orders/ ─────────────► Orders MFE
        │                               - Order management
        │                               - Order tracking
        │
        └─── /mf/catalog/ ────────────► Catalog MFE
                                        - Product catalog
                                        - Inventory management
```

### Key Components

#### 1. Container App (Host Application)
- **Port**: 3000 (via Traefik reverse proxy)
- **Role**: Main application shell that loads and orchestrates all micro-frontends
- **Exposes**: Shared UI library for other MFEs
- **Technology**: React 18, Material-UI, Webpack Module Federation

#### 2. Micro-Frontends (Remote Applications)
Each MFE is an independent application that can be developed and deployed separately:

| MFE | Port (Dev) | Path (Production) | Purpose |
|-----|-----------|-------------------|---------|
| User Management | 3001 | `/mf/user-management/` | User CRUD, authentication |
| Data Grid | 3002 | `/mf/data-grid/` | Data tables, grid operations |
| Analytics | 3003 | `/mf/analytics/` | Charts, visualizations |
| Settings | 3004 | `/mf/settings/` | App settings, preferences |
| Orders | 3006 | `/mf/orders/` | Order management |
| Catalog | 3005 | `/mf/catalog/` | Product catalog |

#### 3. Traefik Reverse Proxy
- **Ports**: 3000 (HTTP), 8080 (Dashboard)
- **Role**: Routes incoming requests to appropriate containers
- **Features**:
  - Path-based routing
  - Automatic service discovery via Docker labels
  - Strip prefix middleware for clean routing
  - Load balancing
  - Health checks

#### 4. Backend Services
- **API Gateway**: `https://dev-creamat.fds-1.com/gateway/`
- **Authentication**: Firebase Authentication
- **Direct API calls**: No BFF pattern (frontends call backend directly)

## 🔧 How the Build System Works

### Build Architecture

The build system follows a **"Build Once, Run Many"** pattern to optimize Docker image creation and reduce disk usage.

#### Build Flow

```
1. Local Build (npm run build)
   ↓
   Each MFE builds its static assets
   ↓
   Output: dist/ folder with bundled JS, CSS, assets

2. Docker Image Creation (parallel)
   ↓
   Each MFE Dockerfile:
   - FROM nginx:alpine (lightweight ~50MB)
   - COPY dist/ → /usr/share/nginx/html/
   - COPY nginx.conf → /etc/nginx/conf.d/
   - Result: ~80-120MB per image

3. Docker Compose (run only)
   ↓
   Uses pre-built images
   - No build steps in compose file
   - Fast startup (~15 seconds)
   - Consistent deployments
```

### Webpack Module Federation Configuration

Each MFE uses Webpack Module Federation for runtime integration:

#### Container App (Host)
```javascript
new ModuleFederationPlugin({
  name: 'container',
  remotes: {
    userApp: 'userApp@/mf/user-management/remoteEntry.js',
    dataApp: 'dataApp@/mf/data-grid/remoteEntry.js',
    // ... other remotes
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    '@mui/material': { singleton: true, eager: true },
    // ... other shared dependencies
  }
})
```

#### Remote MFE (e.g., User Management)
```javascript
new ModuleFederationPlugin({
  name: 'userApp',
  filename: 'remoteEntry.js',
  exposes: {
    './UserManagement': './src/UserManagement.tsx',
  },
  shared: {
    react: { singleton: true, eager: false },
    'react-dom': { singleton: true, eager: false },
    '@mui/material': { singleton: true, eager: false },
  }
})
```

#### Critical Configuration

**publicPath**: Each remote MFE must set the correct `publicPath` in webpack config:
```javascript
output: {
  publicPath: '/mf/user-management/', // Must match Traefik route!
  path: path.resolve(__dirname, 'dist'),
  clean: true,
}
```

This ensures all chunks (split JS files) load from the correct path.

### Traefik Configuration

Traefik uses Docker labels to configure routing:

```yaml
labels:
  - "traefik.enable=true"
  # Route: Match path prefix
  - "traefik.http.routers.user-management.rule=Host(`localhost`) && PathPrefix(`/mf/user-management`)"
  - "traefik.http.routers.user-management.entrypoints=web"
  - "traefik.http.routers.user-management.priority=100"
  
  # Middleware: Strip prefix before forwarding to nginx
  - "traefik.http.routers.user-management.middlewares=user-management-strip"
  - "traefik.http.middlewares.user-management-strip.stripprefix.prefixes=/mf/user-management"
  
  # Service: Forward to container port 80
  - "traefik.http.services.user-management.loadbalancer.server.port=80"
```

**How routing works:**
1. Request: `http://localhost:3000/mf/user-management/remoteEntry.js`
2. Traefik matches: `/mf/user-management` → user-management container
3. Strip middleware: `/remoteEntry.js` (prefix removed)
4. Nginx serves: `/usr/share/nginx/html/remoteEntry.js`

## 📦 Project Structure

```
creamati-cms/
├── frontend/
│   ├── container/              # Main host application
│   │   ├── src/
│   │   ├── webpack.config.js   # Module Federation host config
│   │   ├── Dockerfile          # Production build
│   │   └── nginx.conf          # Nginx configuration
│   │
│   ├── user-management-app/    # MFE: User Management
│   │   ├── src/
│   │   ├── webpack.config.js   # Remote config + publicPath
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   │
│   ├── data-grid-app/          # MFE: Data Grid
│   ├── analytics-app/          # MFE: Analytics
│   ├── settings-app/           # MFE: Settings
│   ├── orders-app/             # MFE: Orders
│   ├── catalog-app/            # MFE: Catalog
│   │
│   └── shared-ui-lib/          # Shared UI components
│       └── src/
│           ├── theme/          # MUI theme
│           └── components/     # Shared components
│
├── scripts/
│   └── docker-full-rebuild.sh  # Complete rebuild script
│
├── docker-compose.yml          # Production Docker Compose
├── run.sh                      # Start services
├── stop.sh                     # Stop services
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Docker Desktop**: Latest version
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creamati-cms
   ```

2. **Install dependencies** (for local development)
   ```bash
   # Install all dependencies
   cd frontend/container && npm install --legacy-peer-deps
   cd ../user-management-app && npm install --legacy-peer-deps
   cd ../data-grid-app && npm install --legacy-peer-deps
   cd ../analytics-app && npm install --legacy-peer-deps
   cd ../settings-app && npm install --legacy-peer-deps
   cd ../orders-app && npm install --legacy-peer-deps
   cd ../catalog-app && npm install --legacy-peer-deps
   ```

### Running the Application

#### Option 1: Quick Start (Recommended)
```bash
# Start all services
./run.sh

# Access the application
# Main app: http://localhost:3000
# Traefik dashboard: http://localhost:8080
```

#### Option 2: Full Rebuild
```bash
# Complete rebuild (fixes dependencies, rebuilds everything)
./scripts/docker-full-rebuild.sh
```

#### Option 3: Manual Build
```bash
# Build all applications locally
cd frontend/container && npm run build
cd ../user-management-app && npm run build
cd ../data-grid-app && npm run build
cd ../analytics-app && npm run build
cd ../settings-app && npm run build
cd ../orders-app && npm run build
cd ../catalog-app && npm run build

# Build Docker images in parallel
docker build -t creamati-cms-container:latest -f frontend/container/Dockerfile frontend/container &
docker build -t creamati-cms-user-management:latest -f frontend/user-management-app/Dockerfile frontend/user-management-app &
docker build -t creamati-cms-data-grid:latest -f frontend/data-grid-app/Dockerfile frontend/data-grid-app &
docker build -t creamati-cms-analytics:latest -f frontend/analytics-app/Dockerfile frontend/analytics-app &
docker build -t creamati-cms-settings:latest -f frontend/settings-app/Dockerfile frontend/settings-app &
docker build -t creamati-cms-orders:latest -f frontend/orders-app/Dockerfile frontend/orders-app &
docker build -t creamati-cms-catalog:latest -f frontend/catalog-app/Dockerfile frontend/catalog-app &
wait

# Start services
docker compose up -d
```

### Stopping the Application

```bash
./stop.sh
# or
docker compose down
```

## ➕ Adding a New Micro-Frontend

Follow these steps to add a new MFE to the platform:

### Step 1: Create the MFE Application

```bash
cd frontend
mkdir my-new-app
cd my-new-app
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install --save react@18.2.0 react-dom@18.2.0 react-router-dom@^6.21.0
npm install --save @mui/material@^5.15.0 @mui/icons-material@^5.15.0 @emotion/react@^11.11.0 @emotion/styled@^11.11.0
npm install --save-dev webpack@^5.89.0 webpack-cli@^5.1.4 webpack-dev-server@^4.11.1
npm install --save-dev html-webpack-plugin@^5.6.0
npm install --save-dev @babel/core@^7.23.7 @babel/preset-react@^7.23.3 @babel/preset-typescript@^7.23.3
npm install --save-dev babel-loader@^9.1.3 ts-loader@^9.5.1
npm install --save-dev typescript@^4.9.5 @types/react@^18.2.47 @types/react-dom@^18.2.18
npm install --save-dev style-loader@^3.3.4 css-loader@^6.8.1
```

### Step 3: Create Webpack Configuration

Create `webpack.config.js`:

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3007, // Choose a unique port
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: '/mf/my-new-app/', // IMPORTANT: Must match Traefik route!
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'myNewApp',
      filename: 'remoteEntry.js',
      exposes: {
        './MyNewApp': './src/MyNewApp.tsx', // Your main component
      },
      remotes: {
        sharedUI: 'container@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: false,
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: false,
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: false,
        },
        '@emotion/react': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: false,
        },
        '@emotion/styled': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000')
    }),
  ],
};
```

### Step 4: Create the Component

Create `src/MyNewApp.tsx`:

```typescript
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const MyNewApp: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My New App
        </Typography>
        <Typography variant="body1">
          This is a new micro-frontend!
        </Typography>
      </Paper>
    </Container>
  );
};

export default MyNewApp;
```

Create `src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import MyNewApp from './MyNewApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MyNewApp />
  </React.StrictMode>
);
```

### Step 5: Create Docker Files

Create `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Serve all static files
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Create `.dockerignore`:

```
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
coverage
.nyc_output
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
*.log
.vscode
.idea
*.swp
*.swo
*~
.git
.gitignore
.gitattributes
Dockerfile
Dockerfile.*
.dockerignore
README.md
*.md
.github
.gitlab-ci.yml
.travis.yml
.cache
.parcel-cache
.webpack
```

### Step 6: Update Container App

Edit `frontend/container/webpack.config.js`:

```javascript
new ModuleFederationPlugin({
  name: 'container',
  remotes: {
    // ... existing remotes
    myNewApp: 'myNewApp@/mf/my-new-app/remoteEntry.js', // Add this line
  },
  // ... rest of config
})
```

Create a route in `frontend/container/src/App.tsx`:

```typescript
const MyNewApp = React.lazy(() => import('myNewApp/MyNewApp'));

// In your routes:
<Route path="/my-new-app" element={
  <Suspense fallback={<div>Loading...</div>}>
    <MyNewApp />
  </Suspense>
} />
```

### Step 7: Update Docker Compose

Edit `docker-compose.yml`:

```yaml
services:
  # ... existing services

  # My New App
  my-new-app:
    image: creamati-cms-my-new-app:latest
    container_name: micro-frontend-my-new-app
    networks:
      - micro-frontend-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.my-new-app.rule=Host(`localhost`) && PathPrefix(`/mf/my-new-app`)"
      - "traefik.http.routers.my-new-app.entrypoints=web"
      - "traefik.http.routers.my-new-app.priority=100"
      - "traefik.http.routers.my-new-app.middlewares=my-new-app-strip"
      - "traefik.http.middlewares.my-new-app-strip.stripprefix.prefixes=/mf/my-new-app"
      - "traefik.http.services.my-new-app.loadbalancer.server.port=80"

  # Update container-app depends_on
  container-app:
    depends_on:
      # ... existing dependencies
      - my-new-app
```

### Step 8: Update Build Scripts

Edit `scripts/docker-full-rebuild.sh`:

```bash
# Add to apps array
apps=(
  "container"
  "user-management-app"
  "data-grid-app"
  "analytics-app"
  "settings-app"
  "orders-app"
  "catalog-app"
  "my-new-app"  # Add this line
)
```

### Step 9: Build and Test

```bash
# Build the new MFE locally
cd frontend/my-new-app
npm run build

# Build the container app (includes new remote reference)
cd ../container
npm run build

# Build Docker images
docker build -t creamati-cms-my-new-app:latest -f frontend/my-new-app/Dockerfile frontend/my-new-app
docker build -t creamati-cms-container:latest -f frontend/container/Dockerfile frontend/container

# Restart services
docker compose down
docker compose up -d

# Test the endpoint
curl http://localhost:3000/mf/my-new-app/remoteEntry.js
# Should return 200 OK

# Test in browser
# Navigate to http://localhost:3000/my-new-app
```

### Step 10: Verify Integration

1. Check all containers are running:
   ```bash
   docker ps
   ```

2. Check Traefik dashboard:
   ```
   http://localhost:8080
   ```
   - Verify `my-new-app` router is present

3. Test the application:
   ```
   http://localhost:3000/my-new-app
   ```

## 🔍 Troubleshooting

### Common Issues

#### 1. ChunkLoadError / Script Loading Failed

**Symptoms**: Console errors like `Loading chunk failed` or `ScriptExternalLoadError`

**Cause**: Incorrect `publicPath` in webpack config

**Solution**: Ensure `output.publicPath` in webpack.config.js matches the Traefik route:
```javascript
output: {
  publicPath: '/mf/my-new-app/', // Must have trailing slash!
}
```

#### 2. 404 on remoteEntry.js

**Symptoms**: `GET http://localhost:3000/mf/my-new-app/remoteEntry.js 404`

**Causes**:
- Traefik routing not configured correctly
- Nginx config incorrect
- Docker image not built with latest code

**Solution**:
```bash
# Rebuild the specific image
docker compose down
docker rmi creamati-cms-my-new-app:latest
cd frontend/my-new-app && npm run build
docker build -t creamati-cms-my-new-app:latest -f Dockerfile .
docker compose up -d
```

#### 3. Shared Dependency Version Conflicts

**Symptoms**: React warnings about multiple React copies, or MUI styling issues

**Solution**: Ensure all MFEs use the same versions:
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "@mui/material": "^5.15.0",
  "@mui/icons-material": "^5.15.0"
}
```

#### 4. Docker Out of Space

**Solution**:
```bash
# Clean up Docker
docker system prune -af
docker builder prune -af

# Increase Docker Desktop disk allocation
# Docker Desktop → Settings → Resources → Disk image size
```

## 📊 Resource Usage

| Component | CPU Limit | Memory Limit | Disk Size |
|-----------|-----------|--------------|-----------|
| Container App | 1.0 | 256MB | ~120MB |
| Each MFE | 0.5 | 256MB | ~80-100MB |
| Traefik | 0.5 | 256MB | ~50MB |
| **Total** | ~4.5 CPUs | ~2GB RAM | ~700MB |

## 🛠️ Development Workflow

### Local Development (No Docker)

```bash
# Terminal 1: Start container app
cd frontend/container
npm start

# Terminal 2: Start a specific MFE
cd frontend/user-management-app
npm start

# Access at http://localhost:3000
```

### Docker Development

```bash
# Full rebuild
./scripts/docker-full-rebuild.sh

# Quick restart (after code changes)
cd frontend/my-app && npm run build
docker compose restart my-app
```

### Production Deployment

```bash
# Build all images
./scripts/docker-full-rebuild.sh

# Tag images for registry
docker tag creamati-cms-container:latest registry.example.com/creamati-cms-container:v1.0.0

# Push to registry
docker push registry.example.com/creamati-cms-container:v1.0.0

# Deploy on production server
docker compose up -d
```

## 📝 Best Practices

### 1. Material-UI (MUI) Only
- **REQUIRED**: Use ONLY MUI components from https://mui.com/
- **FORBIDDEN**: Custom UI components, design systems, or non-MUI libraries
- All styling must use MUI's `sx` prop or theme system

### 2. Module Federation
- Always use `singleton: true` for shared dependencies
- Set `eager: false` for remotes to enable code splitting
- Keep remoteEntry.js files small

### 3. Docker Images
- Build apps locally first (`npm run build`)
- Use multi-stage builds for optimization
- Leverage Docker layer caching

### 4. Traefik Configuration
- Use path prefixes for MFEs (`/mf/app-name/`)
- Set higher priority for MFE routes (100) vs container (1)
- Always use strip prefix middleware

### 5. Testing Strategy
- **Bottom-to-Top**: Backend → Docker image → Browser
- Test remoteEntry.js accessibility first
- Check for console errors
- Verify chunk loading

## 🔐 Security

- All API calls use HTTPS to backend gateway
- Firebase Authentication for user management
- CORS configured on backend services
- No sensitive data in frontend code
- Environment variables for configuration

## 📚 Additional Resources

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Material-UI Documentation](https://mui.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [React 18 Documentation](https://react.dev/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (no console errors!)
4. Submit a pull request

## 📄 License

[Your License Here]

## 👥 Team

[Your Team Information]

---

**Questions or Issues?** Open an issue on GitHub or contact the development team.

