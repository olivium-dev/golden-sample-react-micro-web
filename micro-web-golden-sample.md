# 🏗 Golden Sample – Micro-Web (Micro-Frontend with React)

This document provides a **comprehensive explanation** of how to set up a golden sample project for **micro-web architecture** using **React + Webpack Module Federation**.  
It is designed to serve as a reference architecture and hands-on guide for teams looking to implement micro-frontends in a structured way.

---

## 1. Introduction

Traditional frontend applications often grow into massive monoliths that are difficult to maintain, scale, or migrate.  
The microservice philosophy has inspired a parallel approach on the frontend called **micro-frontends** (or micro-web).  

### Key Concept
- **Microservices (Backend)** → Small, independent services communicating via APIs.  
- **Micro-Web / Micro-Frontends (Frontend)** → Small, independent UI applications composed together at runtime.  

The goal is to allow different teams to build, deploy, and scale their parts of the frontend **independently**, while still delivering a seamless user experience.

---

## 2. Architecture Overview

Our golden sample consists of:

- **Container App (Host)**
  - Provides the global shell (navigation, layout, shared state).
  - Loads and integrates remote applications dynamically.

- **Remote Apps (Micro-Frontends)**
  - Each is a standalone React project (e.g., `auth-app`, `dashboard-app`, `profile-app`).
  - Each exposes specific pages or components.

- **Shared Libraries**
  - Common dependencies like React and ReactDOM are shared to minimize bundle duplication.

This mirrors the backend **service mesh** idea: each frontend module is autonomous but connected through a central container.

---

## 3. Repository Structure

There are two common ways to structure the repositories:

1. **Multiple Repositories**
   - Each app (container and remotes) lives in its own repository.
   - Pros: Independence, clear ownership, independent CI/CD.
   - Cons: More overhead for versioning and integration.

2. **Monorepo (Nx, Turborepo)**
   - All apps live in a single repository, with workspaces for each.
   - Pros: Easier local development, shared tooling, simplified dependency management.
   - Cons: Tighter coupling between teams.

Example directory layout:

```
/container
/auth-app
/dashboard-app
/profile-app
/ui-lib   (optional shared design system)
```

---

## 4. Setting Up the Container

1. Create project:
   ```bash
   npx create-react-app container --template typescript
   ```

2. Add `webpack.config.js` with Module Federation:

   ```js
   const { ModuleFederationPlugin } = require("webpack").container;

   module.exports = {
     mode: "development",
     devServer: { port: 3000 },
     plugins: [
       new ModuleFederationPlugin({
         name: "container",
         remotes: {
           auth: "auth@http://localhost:3001/remoteEntry.js",
           dashboard: "dashboard@http://localhost:3002/remoteEntry.js",
           profile: "profile@http://localhost:3003/remoteEntry.js",
         },
         shared: { react: { singleton: true }, "react-dom": { singleton: true } },
       })
     ]
   }
   ```

3. The container acts as the orchestrator, dynamically pulling in remote modules.

---

## 5. Setting Up a Remote App (Example: Auth App)

1. Create project:
   ```bash
   npx create-react-app auth-app --template typescript
   ```

2. Add `webpack.config.js` with Module Federation:

   ```js
   const { ModuleFederationPlugin } = require("webpack").container;

   module.exports = {
     mode: "development",
     devServer: { port: 3001 },
     plugins: [
       new ModuleFederationPlugin({
         name: "auth",
         filename: "remoteEntry.js",
         exposes: {
           "./AuthPage": "./src/pages/AuthPage",
         },
         shared: { react: { singleton: true }, "react-dom": { singleton: true } },
       })
     ]
   }
   ```

3. The `AuthPage` component is now available to the container as `auth/AuthPage`.

4. Repeat similar setup for `dashboard-app` (port 3002) and `profile-app` (port 3003).

---

## 6. Routing in Container

In `container/src/App.tsx`:

```tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const AuthPage = lazy(() => import("auth/AuthPage"));
const DashboardPage = lazy(() => import("dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("profile/ProfilePage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

---

## 7. Local Development Workflow

Run all apps concurrently:

```bash
concurrently "npm start --prefix container"              "npm start --prefix auth-app"              "npm start --prefix dashboard-app"              "npm start --prefix profile-app"
```

The container fetches `remoteEntry.js` from each app dynamically.

---

## 8. CI/CD Deployment

Each app is **deployed independently**.

- Auth → `https://cdn.myapp.com/auth/remoteEntry.js`
- Dashboard → `https://cdn.myapp.com/dashboard/remoteEntry.js`
- Profile → `https://cdn.myapp.com/profile/remoteEntry.js`

The container fetches remote apps from these URLs in production.

### Benefits:
- Teams deploy without impacting others.
- Versioning and rollback are independent.
- Horizontal scaling per app.

---

## 9. Shared Concerns

- **Design System**  
  Create a shared `ui-lib` package to ensure consistent styling across all micro-frontends.

- **Authentication**  
  Keep global auth logic in the container. Remotes consume tokens through context or API calls.

- **State Management**  
  Use container-owned global state (e.g., Redux, Zustand, or React Context).  
  Pass data to remotes as props or context.

- **Performance**  
  - Enable dependency sharing to reduce bundle sizes.  
  - Lazy load routes to improve initial load.  

---

## 10. Alternative: Single-SPA

If you require **multi-framework support** (React + Angular + Vue):

- Use Single-SPA as the root orchestrator.
- Mount apps by route or custom logic.
- Communication via custom events or a global store.

Best suited for heterogeneous teams. For React-only teams, Module Federation is simpler and more efficient.

---

## 11. Deliverables for Golden Sample

- ✅ Container app with routing and lazy loading  
- ✅ Two or more remote apps (Auth + Dashboard)  
- ✅ Shared React + optional UI lib  
- ✅ Independent CI/CD pipelines  
- ✅ Documentation for dev and deployment  

---

## 12. Conclusion

This golden sample demonstrates how to apply the **micro-frontend pattern** using React and Webpack 5’s Module Federation.  
It enables teams to scale frontend development the same way microservices transformed backend development.  

- Start with 1 container + 2 remotes.  
- Add a shared UI library for consistency.  
- Evolve into a full ecosystem of independently deployed micro-web apps.

This approach creates a foundation that is **scalable, maintainable, and future-proof** for large frontend systems.
