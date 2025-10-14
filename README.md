# Micro-Frontend Golden Sample Architecture

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15-blue.svg)](https://mui.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Module Federation](https://img.shields.io/badge/Module%20Federation-Webpack%205-orange.svg)](https://webpack.js.org/concepts/module-federation/)

> A production-ready micro-frontend architecture demonstrating Webpack Module Federation, React, Material-UI, FastAPI backend, JWT authentication, and complete Docker orchestration.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Overall Architecture](#1-overall-architecture)
3. [Module Federation Integration](#2-module-federation-integration)
4. [Authentication & Data Sharing](#3-authentication--data-sharing)
5. [Dockerization](#4-dockerization)
6. [GitHub Registry Deployment](#5-github-registry-deployment)
7. [Quick Start](#quick-start)
8. [Technology Stack](#technology-stack)
9. [Project Structure](#project-structure)
10. [Contributing](#contributing)

---

## Overview

This project showcases a **golden sample** implementation of micro-frontend architecture using **Webpack Module Federation**. It demonstrates how to build, deploy, and manage independent micro-applications that work together seamlessly while maintaining autonomous development and deployment.

### Key Features

✅ **Micro-Frontend Architecture** - Independent, deployable frontend applications  
✅ **Module Federation** - Runtime code sharing without build-time coupling  
✅ **Material-UI Design System** - Consistent theming across all micro-apps  
✅ **JWT Authentication** - Secure token-based authentication with refresh tokens  
✅ **FastAPI Backend** - High-performance Python backend with async support  
✅ **Docker Orchestration** - Complete containerization with docker-compose  
✅ **Shared UI Library** - Reusable components, themes, and utilities  
✅ **TypeScript** - Type-safe development across all applications  
✅ **Error Boundaries** - Graceful error handling for remote module failures  

---

## 1. Overall Architecture

### System Context Diagram

```mermaid
C4Context
    title System Context - Micro-Frontend Platform

    Person(user, "User", "End user accessing the platform")
    
    System_Boundary(platform, "Micro-Frontend Platform") {
        System(container, "Container App", "Host application orchestrating micro-frontends")
        System(userApp, "User Management", "Micro-frontend for user management")
        System(dataApp, "Data Grid", "Micro-frontend for data visualization")
        System(analyticsApp, "Analytics", "Micro-frontend for analytics")
        System(settingsApp, "Settings", "Micro-frontend for settings")
        System(backend, "Backend API", "FastAPI service with JWT auth")
    }
    
    System_Ext(github, "GitHub Registry", "Container image registry")
    
    Rel(user, container, "Uses", "HTTPS")
    Rel(container, userApp, "Loads", "Module Federation")
    Rel(container, dataApp, "Loads", "Module Federation")
    Rel(container, analyticsApp, "Loads", "Module Federation")
    Rel(container, settingsApp, "Loads", "Module Federation")
    
    Rel(userApp, backend, "API Calls", "REST/JSON")
    Rel(dataApp, backend, "API Calls", "REST/JSON")
    Rel(analyticsApp, backend, "API Calls", "REST/JSON")
    Rel(settingsApp, backend, "API Calls", "REST/JSON")
    
    Rel(platform, github, "Pulls images", "Docker")
```

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer - Port 3000-3004"
        Container[Container App :3000<br/>Host Application]
        UserApp[User Management :3001<br/>Micro-Frontend]
        DataApp[Data Grid :3002<br/>Micro-Frontend]
        AnalyticsApp[Analytics :3003<br/>Micro-Frontend]
        SettingsApp[Settings :3004<br/>Micro-Frontend]
        SharedLib[Shared UI Library<br/>Components & Theme]
    end
    
    subgraph "Backend Layer - Port 8000"
        Backend[Mock Data Service :8000<br/>FastAPI + JWT Auth]
        AuthRouter[Auth Router<br/>Login/Logout/Refresh]
        UsersRouter[Users Router<br/>User Management]
        DataRouter[Data Router<br/>Data Operations]
        AnalyticsRouter[Analytics Router<br/>Analytics Data]
        SettingsRouter[Settings Router<br/>Settings Management]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Network<br/>micro-frontend-network]
        Secrets[Docker Secrets<br/>JWT Keys]
    end
    
    User((User)) -->|HTTPS| Container
    
    Container -.->|Module Federation| UserApp
    Container -.->|Module Federation| DataApp
    Container -.->|Module Federation| AnalyticsApp
    Container -.->|Module Federation| SettingsApp
    
    Container --> SharedLib
    UserApp --> SharedLib
    DataApp --> SharedLib
    AnalyticsApp --> SharedLib
    SettingsApp --> SharedLib
    
    UserApp -->|REST API| Backend
    DataApp -->|REST API| Backend
    AnalyticsApp -->|REST API| Backend
    SettingsApp -->|REST API| Backend
    
    Backend --> AuthRouter
    Backend --> UsersRouter
    Backend --> DataRouter
    Backend --> AnalyticsRouter
    Backend --> SettingsRouter
    
    Backend --> Secrets
    
    Container -.-> Docker
    UserApp -.-> Docker
    DataApp -.-> Docker
    AnalyticsApp -.-> Docker
    SettingsApp -.-> Docker
    Backend -.-> Docker
    
    style Container fill:#61dafb,stroke:#333,stroke-width:3px
    style Backend fill:#009688,stroke:#333,stroke-width:3px
    style SharedLib fill:#ffa726,stroke:#333,stroke-width:2px
    style Docker fill:#2496ed,stroke:#333,stroke-width:2px
```

### Component Diagram

```mermaid
graph LR
    subgraph "Container App (Host)"
        AppShell[App Shell<br/>Navigation & Layout]
        ErrorBoundary[Error Boundary<br/>Fault Isolation]
        Router[React Router<br/>Route Management]
        AuthProvider[Auth Provider<br/>Global Auth State]
    end
    
    subgraph "Micro-Frontends"
        direction TB
        UMApp[User Management<br/>remoteEntry.js<br/>Port 3001]
        DGApp[Data Grid<br/>remoteEntry.js<br/>Port 3002]
        AnApp[Analytics<br/>remoteEntry.js<br/>Port 3003]
        StApp[Settings<br/>remoteEntry.js<br/>Port 3004]
    end
    
    subgraph "Shared UI Library"
        Theme[MUI Theme<br/>Design Tokens]
        Components[Shared Components<br/>LoginForm, UserMenu, etc.]
        AuthService[Auth Service<br/>Token Management]
        ApiClient[API Client<br/>Axios with Interceptors]
        ErrorMonitor[Error Monitor<br/>Centralized Logging]
    end
    
    subgraph "Backend Service"
        API[FastAPI Application<br/>Port 8000]
        JWT[JWT Handler<br/>Token Generation/Validation]
        CORS[CORS Middleware<br/>Cross-Origin Support]
        Routers[API Routers<br/>Modular Endpoints]
    end
    
    AppShell --> ErrorBoundary
    ErrorBoundary --> Router
    Router -.->|Lazy Load| UMApp
    Router -.->|Lazy Load| DGApp
    Router -.->|Lazy Load| AnApp
    Router -.->|Lazy Load| StApp
    
    AppShell --> AuthProvider
    AuthProvider --> AuthService
    
    UMApp --> Theme
    UMApp --> Components
    UMApp --> AuthService
    UMApp --> ApiClient
    
    DGApp --> Theme
    DGApp --> Components
    DGApp --> ApiClient
    
    AnApp --> Theme
    AnApp --> Components
    AnApp --> ApiClient
    
    StApp --> Theme
    StApp --> Components
    StApp --> ApiClient
    
    ApiClient -->|HTTP Requests| API
    AuthService -->|Auth Requests| API
    
    API --> JWT
    API --> CORS
    API --> Routers
    
    ErrorMonitor -.->|Capture Errors| ErrorBoundary
    
    style AppShell fill:#61dafb,stroke:#333,stroke-width:2px
    style API fill:#009688,stroke:#333,stroke-width:2px
    style AuthService fill:#ff6b6b,stroke:#333,stroke-width:2px
```

---

## 2. Module Federation Integration

### How Module Federation Works

**Module Federation** allows multiple independent builds to form a single application. Each build acts as a container and can consume code from other containers, enabling true micro-frontend architecture.

### Module Federation Configuration

```mermaid
graph TB
    subgraph "Container App - Host (Port 3000)"
        HostConfig[ModuleFederationPlugin<br/>name: 'container']
        HostRemotes[Remotes Configuration]
        HostShared[Shared Dependencies<br/>React, MUI, etc.]
        
        HostConfig --> HostRemotes
        HostConfig --> HostShared
        
        HostRemotes -->|userApp| UserRemote[userApp@http://localhost:3001/remoteEntry.js]
        HostRemotes -->|dataApp| DataRemote[dataApp@http://localhost:3002/remoteEntry.js]
        HostRemotes -->|analyticsApp| AnalyticsRemote[analyticsApp@http://localhost:3003/remoteEntry.js]
        HostRemotes -->|settingsApp| SettingsRemote[settingsApp@http://localhost:3004/remoteEntry.js]
    end
    
    subgraph "User Management App - Remote (Port 3001)"
        UserConfig[ModuleFederationPlugin<br/>name: 'userApp']
        UserExposes[Exposes<br/>./UserManagement: ./src/App.tsx]
        UserShared[Shared Dependencies<br/>singleton: true]
        
        UserConfig --> UserExposes
        UserConfig --> UserShared
    end
    
    subgraph "Data Grid App - Remote (Port 3002)"
        DataConfig[ModuleFederationPlugin<br/>name: 'dataApp']
        DataExposes[Exposes<br/>./DataGrid: ./src/App.tsx]
        DataShared[Shared Dependencies<br/>singleton: true]
        
        DataConfig --> DataExposes
        DataConfig --> DataShared
    end
    
    subgraph "Analytics App - Remote (Port 3003)"
        AnalyticsConfig[ModuleFederationPlugin<br/>name: 'analyticsApp']
        AnalyticsExposes[Exposes<br/>./Analytics: ./src/App.tsx]
        AnalyticsShared[Shared Dependencies<br/>singleton: true]
        
        AnalyticsConfig --> AnalyticsExposes
        AnalyticsConfig --> AnalyticsShared
    end
    
    subgraph "Settings App - Remote (Port 3004)"
        SettingsConfig[ModuleFederationPlugin<br/>name: 'settingsApp']
        SettingsExposes[Exposes<br/>./Settings: ./src/App.tsx]
        SettingsShared[Shared Dependencies<br/>singleton: true]
        
        SettingsConfig --> SettingsExposes
        SettingsConfig --> SettingsShared
    end
    
    UserRemote -.-> UserExposes
    DataRemote -.-> DataExposes
    AnalyticsRemote -.-> AnalyticsExposes
    SettingsRemote -.-> SettingsExposes
    
    style HostConfig fill:#61dafb,stroke:#333,stroke-width:3px
    style UserConfig fill:#4ecdc4,stroke:#333,stroke-width:2px
    style DataConfig fill:#ff6b6b,stroke:#333,stroke-width:2px
    style AnalyticsConfig fill:#95e1d3,stroke:#333,stroke-width:2px
    style SettingsConfig fill:#ffa726,stroke:#333,stroke-width:2px
```

### Runtime Module Loading Sequence

```mermaid
sequenceDiagram
    participant Browser
    participant Container as Container App<br/>(Host)
    participant Remote as Remote App<br/>(Micro-Frontend)
    participant SharedDeps as Shared Dependencies<br/>(React, MUI)
    
    Browser->>Container: 1. Load container app
    activate Container
    Container->>Container: 2. Initialize Module Federation
    Container->>SharedDeps: 3. Load shared dependencies<br/>(singleton: true)
    activate SharedDeps
    
    Note over Container: User navigates to /users
    
    Container->>Container: 4. React.lazy(() => import('userApp/UserManagement'))
    Container->>Remote: 5. Fetch remoteEntry.js<br/>http://localhost:3001/remoteEntry.js
    activate Remote
    
    Remote-->>Container: 6. Return remote container
    Container->>Remote: 7. Request ./UserManagement module
    Remote->>SharedDeps: 8. Check for shared dependencies
    SharedDeps-->>Remote: 9. Return existing shared instances<br/>(React, ReactDOM, MUI)
    Remote->>Remote: 10. Initialize module with shared deps
    Remote-->>Container: 11. Return UserManagement component
    deactivate Remote
    
    Container->>Container: 12. Render component in Suspense
    Container-->>Browser: 13. Display micro-frontend
    deactivate Container
    deactivate SharedDeps
    
    Note over Browser,SharedDeps: No duplicate dependencies - all shared!
```

### Key Module Federation Concepts

#### 1. **Singleton Sharing**
Ensures only one instance of shared dependencies (React, MUI) is loaded:

```javascript
// Container webpack.config.js
shared: {
  react: {
    singleton: true,      // Only one instance across all micro-frontends
    requiredVersion: "18.2.0",
    strictVersion: false,
    eager: true,         // Load immediately (not lazy)
  },
  '@mui/material': {
    singleton: true,      // Shared MUI instance
    requiredVersion: '^5.15.0',
  }
}
```

#### 2. **Exposing Modules**
Each micro-frontend exposes its entry component:

```javascript
// user-management-app webpack.config.js
exposes: {
  './UserManagement': './src/App.tsx',  // Expose the main component
}
```

#### 3. **Consuming Remote Modules**
The container app dynamically loads remote modules:

```javascript
remotes: {
  userApp: 'userApp@http://localhost:3001/remoteEntry.js',
  dataApp: 'dataApp@http://localhost:3002/remoteEntry.js',
  // ... other remotes
}
```

#### 4. **Lazy Loading with Error Boundaries**
Safe loading of remote modules with fallback:

```typescript
// Container App.tsx
const UserManagement = React.lazy(() => import('userApp/UserManagement'));

<ErrorBoundary componentName="User Management App">
  <Suspense fallback={<LoadingSpinner />}>
    <UserManagement />
  </Suspense>
</ErrorBoundary>
```

---

## 3. Authentication & Data Sharing

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Micro-Frontend<br/>(Any App)
    participant AuthService as Auth Service<br/>(Shared Library)
    participant Storage as LocalStorage +<br/>BroadcastChannel
    participant Backend as Backend API<br/>(FastAPI)
    participant JWT as JWT Handler
    
    User->>Frontend: 1. Enter credentials
    Frontend->>AuthService: 2. login(email, password)
    activate AuthService
    
    AuthService->>Backend: 3. POST /api/auth/login<br/>{email, password}
    activate Backend
    Backend->>JWT: 4. Verify credentials
    Backend->>JWT: 5. Create access token (15min)
    Backend->>JWT: 6. Create refresh token (7 days)
    JWT-->>Backend: 7. Return tokens
    Backend-->>AuthService: 8. {access_token, refresh_token}
    deactivate Backend
    
    AuthService->>Storage: 9. Store access_token<br/>localStorage.setItem('access_token', token)
    AuthService->>Storage: 10. Store refresh_token<br/>localStorage.setItem('refresh_token', token)
    AuthService->>Storage: 11. Broadcast login event<br/>BroadcastChannel.postMessage('LOGIN')
    
    Note over Storage: Other browser tabs receive login event
    
    AuthService->>AuthService: 12. Schedule token refresh<br/>(13 minutes)
    AuthService-->>Frontend: 13. Login successful
    deactivate AuthService
    Frontend-->>User: 14. Redirect to dashboard
    
    Note over AuthService: After 13 minutes...
    
    AuthService->>Backend: 15. POST /api/auth/refresh<br/>{refresh_token}
    activate Backend
    Backend->>JWT: 16. Validate refresh token
    JWT->>JWT: 17. Create new tokens
    JWT-->>Backend: 18. New tokens
    Backend-->>AuthService: 19. {new_access_token, new_refresh_token}
    deactivate Backend
    
    AuthService->>Storage: 20. Update tokens in storage
    AuthService->>AuthService: 21. Reschedule refresh
```

### Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Micro-Frontend
    participant AuthService as Auth Service
    participant Storage as LocalStorage +<br/>BroadcastChannel
    participant Backend as Backend API
    
    User->>Frontend: 1. Click logout
    Frontend->>AuthService: 2. logout()
    activate AuthService
    
    AuthService->>Backend: 3. POST /api/auth/logout<br/>{refresh_token}
    activate Backend
    Backend->>Backend: 4. Revoke refresh token
    Backend-->>AuthService: 5. Success
    deactivate Backend
    
    AuthService->>Storage: 6. Clear access_token
    AuthService->>Storage: 7. Clear refresh_token
    AuthService->>Storage: 8. Broadcast logout<br/>BroadcastChannel.postMessage('LOGOUT')
    
    Note over Storage: All browser tabs receive logout event
    
    AuthService->>AuthService: 9. Stop refresh timer
    AuthService-->>Frontend: 10. Logout complete
    deactivate AuthService
    
    Frontend-->>User: 11. Redirect to login
    
    Note over Frontend,Storage: All tabs log out simultaneously
```

### Cross-Tab Synchronization

```mermaid
graph TB
    subgraph "Browser Tab 1"
        App1[Micro-Frontend App]
        Auth1[Auth Service Instance]
        Storage1[LocalStorage]
        BC1[BroadcastChannel<br/>'auth_channel']
    end
    
    subgraph "Browser Tab 2"
        App2[Micro-Frontend App]
        Auth2[Auth Service Instance]
        Storage2[LocalStorage]
        BC2[BroadcastChannel<br/>'auth_channel']
    end
    
    subgraph "Browser Tab 3"
        App3[Micro-Frontend App]
        Auth3[Auth Service Instance]
        Storage3[LocalStorage]
        BC3[BroadcastChannel<br/>'auth_channel']
    end
    
    subgraph "Shared Storage"
        LS[LocalStorage<br/>access_token<br/>refresh_token]
    end
    
    App1 --> Auth1
    App2 --> Auth2
    App3 --> Auth3
    
    Auth1 --> Storage1
    Auth2 --> Storage2
    Auth3 --> Storage3
    
    Storage1 --> LS
    Storage2 --> LS
    Storage3 --> LS
    
    Auth1 -->|postMessage| BC1
    BC1 -.->|LOGIN/LOGOUT| BC2
    BC1 -.->|LOGIN/LOGOUT| BC3
    
    BC2 -.->|LOGIN/LOGOUT| BC1
    BC2 -.->|LOGIN/LOGOUT| BC3
    BC2 -->|onmessage| Auth2
    
    BC3 -.->|LOGIN/LOGOUT| BC1
    BC3 -.->|LOGIN/LOGOUT| BC2
    BC3 -->|onmessage| Auth3
    
    style BC1 fill:#4ecdc4,stroke:#333,stroke-width:2px
    style BC2 fill:#4ecdc4,stroke:#333,stroke-width:2px
    style BC3 fill:#4ecdc4,stroke:#333,stroke-width:2px
    style LS fill:#ffa726,stroke:#333,stroke-width:3px
```

### Data Sharing Architecture

```mermaid
graph TB
    subgraph "Shared UI Library"
        AuthContext[Auth Context<br/>React Context]
        AuthService[Auth Service<br/>Singleton]
        ApiClient[API Client<br/>Axios + Interceptors]
        ErrorCapture[Error Capture<br/>Centralized Logging]
    end
    
    subgraph "Container App"
        ContainerApp[App Shell]
        AuthProvider[Auth Provider<br/>Context Provider]
    end
    
    subgraph "Micro-Frontends"
        UserApp[User Management]
        DataApp[Data Grid]
        AnalyticsApp[Analytics]
        SettingsApp[Settings]
    end
    
    subgraph "Backend"
        API[FastAPI Backend]
        AuthRouter[Auth Endpoints]
        DataRouters[Data Endpoints]
    end
    
    ContainerApp --> AuthProvider
    AuthProvider --> AuthContext
    
    UserApp --> AuthContext
    DataApp --> AuthContext
    AnalyticsApp --> AuthContext
    SettingsApp --> AuthContext
    
    AuthContext --> AuthService
    
    UserApp --> ApiClient
    DataApp --> ApiClient
    AnalyticsApp --> ApiClient
    SettingsApp --> ApiClient
    
    ApiClient -->|Add Auth Header| AuthService
    ApiClient -->|HTTP Requests| API
    
    API --> AuthRouter
    API --> DataRouters
    
    UserApp -.-> ErrorCapture
    DataApp -.-> ErrorCapture
    AnalyticsApp -.-> ErrorCapture
    SettingsApp -.-> ErrorCapture
    
    style AuthContext fill:#61dafb,stroke:#333,stroke-width:2px
    style ApiClient fill:#4ecdc4,stroke:#333,stroke-width:2px
    style AuthService fill:#ff6b6b,stroke:#333,stroke-width:2px
```

### API Client with Interceptors

```mermaid
sequenceDiagram
    participant MicroApp as Micro-Frontend
    participant ApiClient as API Client
    participant Interceptor as Request Interceptor
    participant AuthService as Auth Service
    participant Backend as Backend API
    participant ErrorHandler as Error Handler
    
    MicroApp->>ApiClient: 1. GET /api/users
    activate ApiClient
    
    ApiClient->>Interceptor: 2. Request interceptor
    activate Interceptor
    Interceptor->>AuthService: 3. getAccessToken()
    AuthService-->>Interceptor: 4. access_token
    Interceptor->>Interceptor: 5. Add Authorization header<br/>Bearer {token}
    Interceptor-->>ApiClient: 6. Modified request
    deactivate Interceptor
    
    ApiClient->>Backend: 7. GET /api/users<br/>Authorization: Bearer {token}
    activate Backend
    
    alt Token Valid
        Backend-->>ApiClient: 8. 200 OK + Data
        ApiClient-->>MicroApp: 9. Return data
    else Token Expired (401)
        Backend-->>ApiClient: 10. 401 Unauthorized
        deactivate Backend
        ApiClient->>AuthService: 11. refreshToken()
        activate AuthService
        AuthService->>Backend: 12. POST /api/auth/refresh
        activate Backend
        Backend-->>AuthService: 13. New tokens
        deactivate Backend
        AuthService->>AuthService: 14. Store new tokens
        AuthService-->>ApiClient: 15. Success
        deactivate AuthService
        ApiClient->>Backend: 16. Retry original request<br/>with new token
        activate Backend
        Backend-->>ApiClient: 17. 200 OK + Data
        deactivate Backend
        ApiClient-->>MicroApp: 18. Return data
    else Other Error
        Backend-->>ApiClient: 19. Error response
        ApiClient->>ErrorHandler: 20. Log error
        ApiClient-->>MicroApp: 21. Throw error
    end
    
    deactivate ApiClient
```

### Authentication Implementation Details

#### Auth Service (Singleton Pattern)

```typescript
// Shared UI Library - AuthService.ts
class AuthService {
  private static instance: AuthService;
  private refreshTimer: NodeJS.Timeout | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  // Singleton instance
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login with automatic token refresh scheduling
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    this.storeTokens(response.data);
    this.scheduleTokenRefresh(); // Refresh in 13 minutes
    this.broadcastMessage({ type: 'LOGIN', tokens: response.data });
    return response.data;
  }

  // Schedule token refresh before expiry
  private scheduleTokenRefresh(): void {
    const refreshInterval = 13 * 60 * 1000; // 13 minutes
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, refreshInterval);
  }
}
```

#### API Client with Interceptors

```typescript
// Shared UI Library - apiClient.ts
import axios from 'axios';
import authService from './auth/AuthService';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authService.refreshToken();
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest); // Retry with new token
      } catch (refreshError) {
        // Refresh failed, logout user
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### Backend JWT Implementation

```python
# Backend - jwt_handler.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from config.settings import settings

def create_access_token(data: dict) -> str:
    """Create JWT access token (15 minutes expiry)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token (7 days expiry)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_REFRESH_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
```

---

## 4. Dockerization

### Docker Architecture

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "micro-frontend-network (Bridge Network)"
            subgraph "Frontend Containers"
                Container[Container App<br/>Port 3000<br/>Node 18 Alpine]
                UserMgmt[User Management<br/>Port 3001<br/>Node 18 Alpine]
                DataGrid[Data Grid<br/>Port 3002<br/>Node 18 Alpine]
                Analytics[Analytics<br/>Port 3003<br/>Node 18 Alpine]
                Settings[Settings<br/>Port 3004<br/>Node 18 Alpine]
            end
            
            subgraph "Backend Container"
                Backend[Mock Data Service<br/>Port 8000<br/>Python 3.11]
            end
        end
        
        subgraph "Docker Volumes"
            BackendCache[backend-cache<br/>Python cache]
            NodeModules1[node_modules<br/>Container App]
            NodeModules2[node_modules<br/>User Management]
            NodeModules3[node_modules<br/>Data Grid]
            NodeModules4[node_modules<br/>Analytics]
            NodeModules5[node_modules<br/>Settings]
        end
        
        subgraph "Docker Secrets"
            JWTSecret[jwt_secret_key.txt]
            JWTRefreshSecret[jwt_refresh_secret_key.txt]
        end
    end
    
    subgraph "Host Filesystem"
        SourceCode[Source Code<br/>./frontend/<br/>./backend/]
        SecretsDir[./secrets/]
    end
    
    Container --> NodeModules1
    UserMgmt --> NodeModules2
    DataGrid --> NodeModules3
    Analytics --> NodeModules4
    Settings --> NodeModules5
    Backend --> BackendCache
    
    Backend --> JWTSecret
    Backend --> JWTRefreshSecret
    
    Container -.->|Volume Mount| SourceCode
    UserMgmt -.->|Volume Mount| SourceCode
    DataGrid -.->|Volume Mount| SourceCode
    Analytics -.->|Volume Mount| SourceCode
    Settings -.->|Volume Mount| SourceCode
    Backend -.->|Volume Mount| SourceCode
    
    JWTSecret -.-> SecretsDir
    JWTRefreshSecret -.-> SecretsDir
    
    UserMgmt -.->|HTTP| Backend
    DataGrid -.->|HTTP| Backend
    Analytics -.->|HTTP| Backend
    Settings -.->|HTTP| Backend
    
    Container -.->|Module Federation| UserMgmt
    Container -.->|Module Federation| DataGrid
    Container -.->|Module Federation| Analytics
    Container -.->|Module Federation| Settings
    
    style Container fill:#61dafb,stroke:#333,stroke-width:2px
    style Backend fill:#009688,stroke:#333,stroke-width:2px
```

### Multi-Stage Build Process

```mermaid
graph LR
    subgraph "Development Build (Dockerfile.dev)"
        DevBase[FROM node:18-alpine]
        DevInstall[Install dependencies<br/>npm ci]
        DevVolume[Mount source code<br/>Volume: ./app]
        DevCommand[CMD: webpack serve<br/>Hot Reload enabled]
        
        DevBase --> DevInstall
        DevInstall --> DevVolume
        DevVolume --> DevCommand
    end
    
    subgraph "Production Build (Dockerfile)"
        ProdBuilder[Stage 1: Builder<br/>FROM node:18-alpine]
        ProdInstallDeps[Install dependencies<br/>npm ci]
        ProdBuild[Build application<br/>webpack --mode production]
        ProdNginx[Stage 2: Runtime<br/>FROM nginx:alpine]
        ProdCopy[COPY dist/ → nginx/html/]
        ProdConfig[COPY nginx.conf]
        ProdServe[Serve static files<br/>Port 80]
        
        ProdBuilder --> ProdInstallDeps
        ProdInstallDeps --> ProdBuild
        ProdBuild --> ProdNginx
        ProdNginx --> ProdCopy
        ProdCopy --> ProdConfig
        ProdConfig --> ProdServe
    end
    
    style DevCommand fill:#61dafb,stroke:#333,stroke-width:2px
    style ProdServe fill:#009688,stroke:#333,stroke-width:2px
```

### Container Orchestration Flow

```mermaid
sequenceDiagram
    participant DC as docker-compose
    participant Network as Docker Network
    participant Backend as Backend Container
    participant Secrets as Docker Secrets
    participant Frontend as Frontend Containers
    participant User as User
    
    DC->>Network: 1. Create micro-frontend-network
    activate Network
    
    DC->>Secrets: 2. Load JWT secrets
    activate Secrets
    
    DC->>Backend: 3. Build & start backend<br/>Port 8000
    activate Backend
    Backend->>Secrets: 4. Read JWT keys
    Backend->>Network: 5. Join network
    Backend->>Backend: 6. Health check
    
    DC->>Frontend: 7. Build & start all frontend containers<br/>Ports 3000-3004
    activate Frontend
    
    Frontend->>Network: 8. Join network
    Frontend->>Backend: 9. Wait for backend (depends_on)
    Backend-->>Frontend: 10. Backend ready
    
    Frontend->>Frontend: 11. Start webpack dev server
    Frontend->>Frontend: 12. Enable hot reload
    
    DC-->>User: 13. All services ready
    
    User->>Frontend: 14. Access http://localhost:3000
    Frontend->>Backend: 15. API calls via network
    Backend-->>Frontend: 16. JSON responses
    Frontend-->>User: 17. Render UI
    
    deactivate Backend
    deactivate Frontend
    deactivate Network
    deactivate Secrets
```

### Docker Compose Services

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend Service
  backend:
    build:
      context: ./backend/mock-data-service
      dockerfile: Dockerfile
    container_name: micro-frontend-backend
    ports:
      - "8000:8000"
    environment:
      - JWT_SECRET_KEY_FILE=/run/secrets/jwt_secret_key
      - JWT_REFRESH_SECRET_KEY_FILE=/run/secrets/jwt_refresh_secret_key
    networks:
      - micro-frontend-network
    secrets:
      - jwt_secret_key
      - jwt_refresh_secret_key
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Container App (Host)
  container-app:
    build:
      context: ./frontend/container
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/container:/app
      - /app/node_modules
    depends_on:
      - user-management-app
      - data-grid-app
      - analytics-app
      - settings-app
    networks:
      - micro-frontend-network

networks:
  micro-frontend-network:
    driver: bridge

secrets:
  jwt_secret_key:
    file: ./secrets/jwt_secret_key.txt
  jwt_refresh_secret_key:
    file: ./secrets/jwt_refresh_secret_key.txt
```

### Dockerfile Examples

#### Frontend Production Dockerfile

```dockerfile
# Multi-stage build for Container App
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npx webpack --config webpack.config.js --mode production

# Production stage with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Network Communication

```mermaid
graph TB
    subgraph "Docker Bridge Network: micro-frontend-network"
        subgraph "Frontend Services"
            C[container-app<br/>172.18.0.2:3000]
            U[user-management-app<br/>172.18.0.3:3001]
            D[data-grid-app<br/>172.18.0.4:3002]
            A[analytics-app<br/>172.18.0.5:3003]
            S[settings-app<br/>172.18.0.6:3004]
        end
        
        B[backend<br/>172.18.0.7:8000]
    end
    
    Host[Host Machine<br/>localhost]
    
    Host -->|Port Forward 3000| C
    Host -->|Port Forward 3001| U
    Host -->|Port Forward 3002| D
    Host -->|Port Forward 3003| A
    Host -->|Port Forward 3004| S
    Host -->|Port Forward 8000| B
    
    C -.->|Module Federation<br/>HTTP| U
    C -.->|Module Federation<br/>HTTP| D
    C -.->|Module Federation<br/>HTTP| A
    C -.->|Module Federation<br/>HTTP| S
    
    U -->|REST API<br/>http://backend:8000| B
    D -->|REST API<br/>http://backend:8000| B
    A -->|REST API<br/>http://backend:8000| B
    S -->|REST API<br/>http://backend:8000| B
    
    style B fill:#009688,stroke:#333,stroke-width:3px
    style C fill:#61dafb,stroke:#333,stroke-width:2px
```

---

## 5. GitHub Registry Deployment

### CI/CD Pipeline

```mermaid
graph TB
    Start([Code Push to GitHub]) --> Trigger[GitHub Actions Triggered]
    
    Trigger --> Checkout[Checkout Repository]
    
    Checkout --> SetupDocker[Setup Docker Buildx]
    
    SetupDocker --> Login[Login to GitHub Container Registry<br/>ghcr.io]
    
    Login --> BuildBackend[Build Backend Image]
    Login --> BuildContainer[Build Container App Image]
    Login --> BuildUser[Build User Management Image]
    Login --> BuildData[Build Data Grid Image]
    Login --> BuildAnalytics[Build Analytics Image]
    Login --> BuildSettings[Build Settings Image]
    
    BuildBackend --> TagBackend[Tag: ghcr.io/user/backend:latest<br/>ghcr.io/user/backend:v1.0.0]
    BuildContainer --> TagContainer[Tag: ghcr.io/user/container:latest<br/>ghcr.io/user/container:v1.0.0]
    BuildUser --> TagUser[Tag: ghcr.io/user/user-mgmt:latest<br/>ghcr.io/user/user-mgmt:v1.0.0]
    BuildData --> TagData[Tag: ghcr.io/user/data-grid:latest<br/>ghcr.io/user/data-grid:v1.0.0]
    BuildAnalytics --> TagAnalytics[Tag: ghcr.io/user/analytics:latest<br/>ghcr.io/user/analytics:v1.0.0]
    BuildSettings --> TagSettings[Tag: ghcr.io/user/settings:latest<br/>ghcr.io/user/settings:v1.0.0]
    
    TagBackend --> PushBackend[Push to GitHub Registry]
    TagContainer --> PushContainer[Push to GitHub Registry]
    TagUser --> PushUser[Push to GitHub Registry]
    TagData --> PushData[Push to GitHub Registry]
    TagAnalytics --> PushAnalytics[Push to GitHub Registry]
    TagSettings --> PushSettings[Push to GitHub Registry]
    
    PushBackend --> Verify[Verify All Images Pushed]
    PushContainer --> Verify
    PushUser --> Verify
    PushData --> Verify
    PushAnalytics --> Verify
    PushSettings --> Verify
    
    Verify --> Deploy[Deploy to Target Environment]
    
    Deploy --> Health[Health Check All Services]
    
    Health --> Success([Deployment Complete])
    
    style Start fill:#4ecdc4,stroke:#333,stroke-width:2px
    style Success fill:#95e1d3,stroke:#333,stroke-width:2px
    style Login fill:#ffa726,stroke:#333,stroke-width:2px
```

### GitHub Actions Workflow

```yaml
# .github/workflows/docker-publish.yml
name: Build and Push Docker Images

on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ${{ github.repository_owner }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service:
          - name: backend
            context: ./backend/mock-data-service
            dockerfile: Dockerfile
          - name: container-app
            context: ./frontend/container
            dockerfile: Dockerfile
          - name: user-management
            context: ./frontend/user-management-app
            dockerfile: Dockerfile
          - name: data-grid
            context: ./frontend/data-grid-app
            dockerfile: Dockerfile
          - name: analytics
            context: ./frontend/analytics-app
            dockerfile: Dockerfile
          - name: settings
            context: ./frontend/settings-app
            dockerfile: Dockerfile

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service.name }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ${{ matrix.service.context }}
          file: ${{ matrix.service.context }}/${{ matrix.service.dockerfile }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Image Tagging Strategy

```mermaid
graph LR
    subgraph "Git Repository"
        Commit[Git Commit<br/>abc123def]
        Branch[Branch<br/>main / develop]
        Tag[Git Tag<br/>v1.0.0]
    end
    
    subgraph "Docker Images"
        Latest[Image: latest<br/>Always newest main]
        Semver[Image: v1.0.0<br/>Semantic version]
        SHA[Image: sha-abc123d<br/>Commit SHA]
        Branch[Image: main<br/>Branch name]
    end
    
    subgraph "GitHub Container Registry"
        Registry[ghcr.io/user/service-name:TAG]
    end
    
    Commit -->|Push to main| Latest
    Commit -->|Commit hash| SHA
    Branch -->|Branch name| Branch
    Tag -->|Version tag| Semver
    
    Latest --> Registry
    Semver --> Registry
    SHA --> Registry
    Branch --> Registry
    
    style Registry fill:#ffa726,stroke:#333,stroke-width:3px
```

### Deployment Commands

#### 1. Build All Images Locally

```bash
# Build development images
make build

# Build production images
make prod-build

# Build specific service
docker-compose build container-app
```

#### 2. Tag Images for GitHub Registry

```bash
# Set your GitHub username
GITHUB_USER="your-username"

# Tag backend
docker tag micro-frontend-backend ghcr.io/$GITHUB_USER/backend:latest
docker tag micro-frontend-backend ghcr.io/$GITHUB_USER/backend:v1.0.0

# Tag container app
docker tag micro-frontend-container ghcr.io/$GITHUB_USER/container-app:latest
docker tag micro-frontend-container ghcr.io/$GITHUB_USER/container-app:v1.0.0

# Tag user management
docker tag micro-frontend-user-management ghcr.io/$GITHUB_USER/user-management:latest
docker tag micro-frontend-user-management ghcr.io/$GITHUB_USER/user-management:v1.0.0

# Tag data grid
docker tag micro-frontend-data-grid ghcr.io/$GITHUB_USER/data-grid:latest
docker tag micro-frontend-data-grid ghcr.io/$GITHUB_USER/data-grid:v1.0.0

# Tag analytics
docker tag micro-frontend-analytics ghcr.io/$GITHUB_USER/analytics:latest
docker tag micro-frontend-analytics ghcr.io/$GITHUB_USER/analytics:v1.0.0

# Tag settings
docker tag micro-frontend-settings ghcr.io/$GITHUB_USER/settings:latest
docker tag micro-frontend-settings ghcr.io/$GITHUB_USER/settings:v1.0.0
```

#### 3. Login to GitHub Container Registry

```bash
# Create a Personal Access Token (PAT) with write:packages scope
# Then login
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
```

#### 4. Push Images to Registry

```bash
# Push all tagged images
docker push ghcr.io/$GITHUB_USER/backend:latest
docker push ghcr.io/$GITHUB_USER/backend:v1.0.0

docker push ghcr.io/$GITHUB_USER/container-app:latest
docker push ghcr.io/$GITHUB_USER/container-app:v1.0.0

docker push ghcr.io/$GITHUB_USER/user-management:latest
docker push ghcr.io/$GITHUB_USER/user-management:v1.0.0

docker push ghcr.io/$GITHUB_USER/data-grid:latest
docker push ghcr.io/$GITHUB_USER/data-grid:v1.0.0

docker push ghcr.io/$GITHUB_USER/analytics:latest
docker push ghcr.io/$GITHUB_USER/analytics:v1.0.0

docker push ghcr.io/$GITHUB_USER/settings:latest
docker push ghcr.io/$GITHUB_USER/settings:v1.0.0
```

#### 5. Deploy from Registry

```bash
# Pull and run from GitHub Container Registry
docker pull ghcr.io/$GITHUB_USER/backend:latest
docker pull ghcr.io/$GITHUB_USER/container-app:latest
docker pull ghcr.io/$GITHUB_USER/user-management:latest
docker pull ghcr.io/$GITHUB_USER/data-grid:latest
docker pull ghcr.io/$GITHUB_USER/analytics:latest
docker pull ghcr.io/$GITHUB_USER/settings:latest

# Update docker-compose.yml to use registry images
# Then start services
docker-compose up -d
```

### Docker Compose with Registry Images

```yaml
# docker-compose.registry.yml
version: '3.8'

services:
  backend:
    image: ghcr.io/${GITHUB_USER}/backend:latest
    ports:
      - "8000:8000"
    networks:
      - micro-frontend-network

  container-app:
    image: ghcr.io/${GITHUB_USER}/container-app:latest
    ports:
      - "3000:80"
    depends_on:
      - user-management-app
      - data-grid-app
      - analytics-app
      - settings-app
    networks:
      - micro-frontend-network

  user-management-app:
    image: ghcr.io/${GITHUB_USER}/user-management:latest
    ports:
      - "3001:80"
    networks:
      - micro-frontend-network

  data-grid-app:
    image: ghcr.io/${GITHUB_USER}/data-grid:latest
    ports:
      - "3002:80"
    networks:
      - micro-frontend-network

  analytics-app:
    image: ghcr.io/${GITHUB_USER}/analytics:latest
    ports:
      - "3003:80"
    networks:
      - micro-frontend-network

  settings-app:
    image: ghcr.io/${GITHUB_USER}/settings:latest
    ports:
      - "3004:80"
    networks:
      - micro-frontend-network

networks:
  micro-frontend-network:
    driver: bridge
```

### Deployment Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub Repository
    participant Actions as GitHub Actions
    participant Registry as GitHub Container Registry
    participant Server as Production Server
    
    Dev->>Git: 1. Push code + tag (v1.0.0)
    activate Git
    
    Git->>Actions: 2. Trigger workflow
    activate Actions
    
    Actions->>Actions: 3. Checkout code
    Actions->>Actions: 4. Build all Docker images
    
    Actions->>Registry: 5. Login to ghcr.io
    activate Registry
    
    Actions->>Registry: 6. Push backend:v1.0.0
    Actions->>Registry: 7. Push container-app:v1.0.0
    Actions->>Registry: 8. Push user-management:v1.0.0
    Actions->>Registry: 9. Push data-grid:v1.0.0
    Actions->>Registry: 10. Push analytics:v1.0.0
    Actions->>Registry: 11. Push settings:v1.0.0
    
    Registry-->>Actions: 12. All images pushed
    deactivate Registry
    
    Actions-->>Git: 13. Update deployment status
    deactivate Actions
    deactivate Git
    
    Note over Server: Manual or automated deployment
    
    Server->>Registry: 14. Pull images (v1.0.0)
    activate Registry
    activate Server
    
    Registry-->>Server: 15. Download images
    deactivate Registry
    
    Server->>Server: 16. Stop old containers
    Server->>Server: 17. Start new containers
    Server->>Server: 18. Health checks
    
    Server-->>Dev: 19. Deployment complete
    deactivate Server
```

---

## Quick Start

### Prerequisites

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 18 (for local development)
- **Python** >= 3.11 (for local development)
- **Make** (optional, for convenience commands)

### 🚀 Start All Services (Docker)

```bash
# Clone the repository
git clone https://github.com/your-username/golden-sample-react-micro-web.git
cd golden-sample-react-micro-web

# Generate JWT secrets (first time only)
chmod +x scripts/setup-auth.sh
./scripts/setup-auth.sh

# Start all services
make up

# Or without Make
docker-compose up -d

# View logs
make logs

# Or
docker-compose logs -f
```

### 📊 Access the Applications

| Service | URL | Description |
|---------|-----|-------------|
| **Container App** | http://localhost:3000 | Main host application |
| **User Management** | http://localhost:3001 | User management micro-frontend |
| **Data Grid** | http://localhost:3002 | Data grid micro-frontend |
| **Analytics** | http://localhost:3003 | Analytics micro-frontend |
| **Settings** | http://localhost:3004 | Settings micro-frontend |
| **Backend API** | http://localhost:8000 | FastAPI backend |
| **API Docs** | http://localhost:8000/api/docs | Interactive API documentation |

### 🔐 Demo Credentials

```
Admin User:
  Email: admin@example.com
  Password: admin123

Regular User:
  Email: user@example.com
  Password: user123

Viewer:
  Email: viewer@example.com
  Password: viewer123
```

### 🛑 Stop Services

```bash
make down
# Or
docker-compose down

# Stop and remove volumes
make clean
# Or
docker-compose down -v
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.0+ | Type safety |
| **Webpack** | 5.x | Module bundler |
| **Module Federation** | Webpack 5 | Micro-frontend architecture |
| **Material-UI** | 5.15+ | UI component library |
| **MUI X Data Grid** | 6.18+ | Advanced data grid |
| **MUI X Charts** | 6.18+ | Data visualization |
| **React Router** | 6.21+ | Client-side routing |
| **Axios** | 1.6+ | HTTP client |
| **Emotion** | 11.11+ | CSS-in-JS styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Runtime |
| **FastAPI** | 0.104+ | Web framework |
| **Uvicorn** | Latest | ASGI server |
| **Pydantic** | 2.x | Data validation |
| **python-jose** | 3.3+ | JWT handling |
| **passlib** | 1.7+ | Password hashing |
| **bcrypt** | 4.0+ | Secure hashing |

### DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **nginx** | Production web server |
| **GitHub Actions** | CI/CD pipeline |
| **GitHub Container Registry** | Docker image registry |

---

## Project Structure

```
golden-sample-react-micro-web/
├── frontend/
│   ├── container/                    # Container app (host) - Port 3000
│   │   ├── src/
│   │   │   ├── App.tsx              # Main app with navigation
│   │   │   ├── index.tsx            # Entry point
│   │   │   └── pages/               # Page components
│   │   ├── webpack.config.js        # Module Federation config
│   │   ├── Dockerfile               # Production build
│   │   ├── Dockerfile.dev           # Development build
│   │   └── package.json
│   │
│   ├── user-management-app/         # User Management - Port 3001
│   │   ├── src/
│   │   │   └── App.tsx              # Exposed as ./UserManagement
│   │   ├── webpack.config.js
│   │   └── package.json
│   │
│   ├── data-grid-app/               # Data Grid - Port 3002
│   │   ├── src/
│   │   │   └── App.tsx              # Exposed as ./DataGrid
│   │   ├── webpack.config.js
│   │   └── package.json
│   │
│   ├── analytics-app/               # Analytics - Port 3003
│   │   ├── src/
│   │   │   └── App.tsx              # Exposed as ./Analytics
│   │   ├── webpack.config.js
│   │   └── package.json
│   │
│   ├── settings-app/                # Settings - Port 3004
│   │   ├── src/
│   │   │   └── App.tsx              # Exposed as ./Settings
│   │   ├── webpack.config.js
│   │   └── package.json
│   │
│   └── shared-ui-lib/               # Shared library
│       ├── src/
│       │   ├── auth/                # Authentication
│       │   │   ├── AuthContext.tsx  # React Context
│       │   │   ├── AuthService.ts   # Singleton service
│       │   │   └── types.ts         # TypeScript types
│       │   ├── api/
│       │   │   └── apiClient.ts     # Axios instance
│       │   ├── components/          # Shared components
│       │   │   ├── LoginForm.tsx
│       │   │   ├── LoginPage.tsx
│       │   │   └── UserMenu.tsx
│       │   ├── errors/              # Error handling
│       │   ├── theme/               # MUI theme
│       │   └── index.ts             # Exports
│       └── package.json
│
├── backend/
│   └── mock-data-service/           # Backend API - Port 8000
│       ├── auth/                    # Authentication
│       │   ├── jwt_handler.py       # JWT creation/validation
│       │   ├── security.py          # Password hashing
│       │   ├── dependencies.py      # FastAPI dependencies
│       │   └── user_store.py        # In-memory user store
│       ├── routers/                 # API routes
│       │   ├── auth.py              # Auth endpoints
│       │   ├── users.py             # User management
│       │   ├── data.py              # Data operations
│       │   ├── analytics.py         # Analytics
│       │   └── settings.py          # Settings
│       ├── models/                  # Pydantic models
│       ├── config/                  # Configuration
│       ├── main.py                  # FastAPI app
│       ├── requirements.txt         # Python dependencies
│       └── Dockerfile
│
├── docker-compose.yml               # Development orchestration
├── docker-compose.prod.yml          # Production orchestration
├── Makefile                         # Convenience commands
├── .env.example                     # Environment variables template
├── scripts/
│   ├── setup-auth.sh                # Generate JWT secrets
│   └── generate-secrets.sh          # Secret generation
└── secrets/
    ├── jwt_secret_key.txt           # JWT access token secret
    └── jwt_refresh_secret_key.txt   # JWT refresh token secret
```

---

## Key Architectural Decisions

### 1. **Why Module Federation?**

Module Federation enables true micro-frontend architecture where:
- Each micro-frontend can be developed and deployed independently
- Shared dependencies (React, MUI) are loaded only once
- No iframe sandboxing or complex integration patterns needed
- Runtime composition without build-time coupling

### 2. **Why Shared UI Library?**

Centralizing common code in `shared-ui-lib` provides:
- Consistent MUI theme across all applications
- Single source of truth for authentication
- Reusable components and utilities
- Simplified maintenance and updates

### 3. **Why JWT with Refresh Tokens?**

JWT authentication with refresh tokens offers:
- Stateless authentication (no server-side sessions)
- Short-lived access tokens (15 minutes) for security
- Long-lived refresh tokens (7 days) for UX
- Automatic token refresh before expiry
- Cross-tab synchronization via BroadcastChannel

### 4. **Why Docker Compose?**

Docker Compose provides:
- Consistent development and production environments
- Easy service orchestration
- Network isolation and service discovery
- Volume management for hot reload
- Simple secrets management

### 5. **Why FastAPI?**

FastAPI offers:
- High performance with async support
- Automatic API documentation (OpenAPI)
- Type hints and validation with Pydantic
- Modern Python framework
- Easy to extend and maintain

---

## Development Workflow

### Local Development (without Docker)

#### Backend

```bash
cd backend/mock-data-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
# Terminal 1 - Container App
cd frontend/container
npm install
npm start  # Starts on port 3000

# Terminal 2 - User Management
cd frontend/user-management-app
npm install
npm start  # Starts on port 3001

# Terminal 3 - Data Grid
cd frontend/data-grid-app
npm install
npm start  # Starts on port 3002

# Terminal 4 - Analytics
cd frontend/analytics-app
npm install
npm start  # Starts on port 3003

# Terminal 5 - Settings
cd frontend/settings-app
npm install
npm start  # Starts on port 3004
```

### Docker Development

```bash
# Start all services with hot reload
make up

# View logs for specific service
docker-compose logs -f container-app
docker-compose logs -f backend

# Restart a service
docker-compose restart user-management-app

# Shell into a container
make shell-container
make shell-backend

# Check service health
make health
```

### Production Build

```bash
# Build production images
make prod-build

# Start production stack
make prod-up

# Access at http://localhost
```

---

## Troubleshooting

### Common Issues

#### 1. **Module Federation Loading Errors**

**Problem**: Remote micro-frontend fails to load

**Solution**:
- Ensure all micro-frontend services are running
- Check that `remoteEntry.js` is accessible (e.g., http://localhost:3001/remoteEntry.js)
- Verify CORS headers are set correctly
- Check browser console for detailed error messages

#### 2. **CORS Errors**

**Problem**: API calls blocked by CORS policy

**Solution**:
```python
# backend/mock-data-service/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", ...],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. **Port Conflicts**

**Problem**: Port already in use

**Solution**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in docker-compose.yml
```

#### 4. **JWT Token Errors**

**Problem**: 401 Unauthorized errors

**Solution**:
- Check that JWT secrets exist in `./secrets/`
- Run `./scripts/setup-auth.sh` to generate secrets
- Verify token expiry settings in backend config
- Clear localStorage and re-login

#### 5. **Docker Build Failures**

**Problem**: Docker build fails

**Solution**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
make rebuild

# Check Docker logs
docker-compose logs backend
```

---

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Each micro-frontend is lazy-loaded
2. **Shared Dependencies**: React, MUI loaded once via Module Federation
3. **Tree Shaking**: Webpack eliminates unused code
4. **Production Builds**: Minification and optimization enabled
5. **nginx Caching**: Static assets cached in production

### Backend Optimization

1. **Async/Await**: FastAPI uses async for concurrent requests
2. **Connection Pooling**: Efficient database connections (when added)
3. **Response Caching**: Implement caching for expensive operations
4. **Request Validation**: Pydantic validates requests efficiently
5. **Health Checks**: Monitor service health and restart if needed

---

## Security Considerations

### Frontend Security

✅ **JWT Token Storage**: Access tokens in localStorage (short-lived)  
✅ **Refresh Token Security**: HttpOnly cookies (when possible)  
✅ **XSS Prevention**: React escapes content by default  
✅ **HTTPS**: Use HTTPS in production  
✅ **Content Security Policy**: Configure CSP headers  

### Backend Security

✅ **Password Hashing**: bcrypt with salt  
✅ **JWT Signing**: Strong secret keys (256-bit)  
✅ **Token Expiry**: Short-lived access tokens (15 min)  
✅ **CORS Configuration**: Whitelist allowed origins  
✅ **Rate Limiting**: Implement rate limiting (recommended)  
✅ **Input Validation**: Pydantic validates all inputs  

### Docker Security

✅ **Secrets Management**: Docker secrets for sensitive data  
✅ **Non-root Users**: Run containers as non-root  
✅ **Image Scanning**: Scan images for vulnerabilities  
✅ **Network Isolation**: Containers in isolated network  
✅ **Health Checks**: Automatic container health monitoring  

---

## Testing Strategy

### Unit Tests

```bash
# Frontend tests
cd frontend/container
npm test

# Backend tests
cd backend/mock-data-service
pytest
```

### Integration Tests

```bash
# Test Module Federation loading
npm run test:integration

# Test API endpoints
pytest tests/integration/
```

### E2E Tests

```bash
# Cypress or Playwright tests
npm run test:e2e
```

---

## Contributing

We welcome contributions! Please see our contributing guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript and Python type hints
- Write tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure all tests pass before submitting PR

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Resources

### Documentation

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)

### Related Projects

- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
- [Micro-Frontend Resources](https://micro-frontends.org/)

---

## Support

For issues, questions, or contributions, please:

- 📧 Open an issue on GitHub
- 💬 Join our discussion forum
- 📖 Check the documentation
- 🐛 Report bugs with detailed reproduction steps

---

## Acknowledgments

Built with ❤️ using modern web technologies and best practices in micro-frontend architecture.

**Key Technologies**: React • TypeScript • Material-UI • Webpack Module Federation • FastAPI • Docker

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with 🚀 by the Micro-Frontend Community

</div>
