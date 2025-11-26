# Docker Server Deployment Guide (No GUI)

## Problem Analysis

The `ENOSPC: no space left on device` error during Docker builds is NOT about actual disk space, but about:

1. **Docker's virtual disk limit** (Docker Desktop only)
2. **Build cache accumulation**
3. **Inefficient Dockerfile patterns**

## ✅ Recommended Solution: Optimize Dockerfiles

Since you'll deploy to a server (Linux) where Docker doesn't have artificial disk limits, the real solution is to **optimize your Dockerfiles** to use less space during builds.

---

## Solution 1: Multi-Stage Builds with Smaller Base Images (BEST)

### Current Problem
Your Dockerfiles install ALL dependencies during build, which takes up massive space.

### Optimized Dockerfile Pattern

Replace your current Dockerfiles with this optimized pattern:

```dockerfile
# Stage 1: Build (uses more space temporarily)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copy source code
COPY . .

# Build application
RUN npm run build && \
    # Clean up to reduce image size
    rm -rf node_modules && \
    npm ci --production --legacy-peer-deps --prefer-offline --no-audit

# Stage 2: Production (minimal size)
FROM nginx:alpine

# Copy only built files (not source or node_modules)
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Key Optimizations:
1. ✅ **Multi-stage build** - Build artifacts don't end up in final image
2. ✅ **Alpine base** - Smaller images (5MB vs 1GB)
3. ✅ **Production dependencies only** - Remove dev dependencies
4. ✅ **Layer caching** - Faster rebuilds
5. ✅ **Cleanup during build** - Remove node_modules after build

---

## Solution 2: Use Docker BuildKit (Recommended for Servers)

BuildKit is more efficient and handles space better.

### Enable BuildKit

Add to your server's `/etc/docker/daemon.json`:

```json
{
  "features": {
    "buildkit": true
  },
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB"
    }
  }
}
```

Then restart Docker:
```bash
sudo systemctl restart docker
```

### Use BuildKit in Commands

```bash
# Enable for single build
DOCKER_BUILDKIT=1 docker-compose build

# Or set permanently
export DOCKER_BUILDKIT=1
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
```

---

## Solution 3: Optimize Docker Compose Build Strategy

### Use Build Arguments to Reduce Image Size

Update `docker-compose.bff.traefik.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--log.level=INFO"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - micro-frontend-network
    restart: unless-stopped

  # Build services one at a time to avoid space issues
  user-management-app:
    build:
      context: ./frontend/user-management-app
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    image: creamati-cms-user-management:latest
    container_name: micro-frontend-user-management
    networks:
      - micro-frontend-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.user-management.rule=Host(`localhost`) && PathPrefix(`/remoteEntry-user.js`)"
      - "traefik.http.services.user-management.loadbalancer.server.port=80"

  # Repeat for other services...

networks:
  micro-frontend-network:
    driver: bridge
```

### Build Strategy for Limited Space

```bash
# Build one service at a time
docker-compose -f docker-compose.bff.traefik.yml build user-management-app
docker-compose -f docker-compose.bff.traefik.yml build data-grid-app
docker-compose -f docker-compose.bff.traefik.yml build analytics-app
# ... etc

# Or use this script
for service in user-management-app data-grid-app analytics-app settings-app orders-app catalog-app container-app; do
  echo "Building $service..."
  docker-compose -f docker-compose.bff.traefik.yml build $service
  docker image prune -f  # Clean up after each build
done
```

---

## Solution 4: Server-Specific Docker Configuration

### For Linux Servers (Production)

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "features": {
    "buildkit": true
  },
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB",
      "policy": [
        {"keepStorage": "10GB", "filter": ["unused-for=2160h"]},
        {"keepStorage": "50GB", "all": true}
      ]
    }
  }
}
```

Apply changes:
```bash
sudo systemctl restart docker
```

---

## Solution 5: Use Pre-Built Images (BEST for Production)

Instead of building on the server, build images in CI/CD and push to registry.

### GitHub Actions Workflow

Create `.github/workflows/build-and-push.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main, PROF-507 ]
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app:
          - user-management-app
          - data-grid-app
          - analytics-app
          - settings-app
          - orders-app
          - catalog-app
          - container
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./frontend/${{ matrix.app }}
          file: ./frontend/${{ matrix.app }}/Dockerfile
          push: true
          tags: |
            your-dockerhub-username/creamati-${{ matrix.app }}:latest
            your-dockerhub-username/creamati-${{ matrix.app }}:${{ github.sha }}
          cache-from: type=registry,ref=your-dockerhub-username/creamati-${{ matrix.app }}:buildcache
          cache-to: type=registry,ref=your-dockerhub-username/creamati-${{ matrix.app }}:buildcache,mode=max
```

### Server Deployment (Just Pull Images)

On server, use this simplified docker-compose:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    # ... traefik config ...

  user-management-app:
    image: your-dockerhub-username/creamati-user-management-app:latest
    container_name: micro-frontend-user-management
    networks:
      - micro-frontend-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.user-management.rule=Host(`your-domain.com`) && PathPrefix(`/remoteEntry-user.js`)"
      - "traefik.http.services.user-management.loadbalancer.server.port=80"

  # Repeat for other services using pre-built images...

networks:
  micro-frontend-network:
    driver: bridge
```

Server deployment becomes:
```bash
# Just pull and run - no building!
docker-compose pull
docker-compose up -d
```

---

## Solution 6: Optimize Your Current Dockerfiles

Let me create optimized Dockerfiles for all your services:

### Optimized Pattern for All Services

```dockerfile
# ============================================
# Optimized Multi-Stage Dockerfile
# ============================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src node_modules && \
    npm ci --production --legacy-peer-deps --prefer-offline --no-audit

# Stage 3: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## Solution 7: Build Script for Server Deployment

Create `scripts/build-docker.sh`:

```bash
#!/bin/bash

set -e

echo "🐳 Building Docker images with space optimization..."

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Clean up before building
echo "🧹 Cleaning up old images and cache..."
docker system prune -f

# Build services one at a time
SERVICES=(
  "user-management-app"
  "data-grid-app"
  "analytics-app"
  "settings-app"
  "orders-app"
  "catalog-app"
  "container-app"
)

for service in "${SERVICES[@]}"; do
  echo ""
  echo "📦 Building $service..."
  
  docker-compose -f docker-compose.bff.traefik.yml build \
    --no-cache \
    --pull \
    --compress \
    $service
  
  # Clean up intermediate images after each build
  docker image prune -f
  
  echo "✅ $service built successfully"
done

echo ""
echo "🎉 All services built successfully!"
echo ""
echo "📊 Current Docker usage:"
docker system df

echo ""
echo "🚀 To start services:"
echo "docker-compose -f docker-compose.bff.traefik.yml up -d"
```

Make it executable:
```bash
chmod +x scripts/build-docker.sh
```

Use it:
```bash
./scripts/build-docker.sh
```

---

## Recommended Production Deployment Strategy

### Option A: CI/CD with Pre-Built Images (BEST)

```
Developer → Git Push → GitHub Actions → Build Images → Docker Hub → Server Pulls Images
```

**Pros:**
- ✅ No building on server
- ✅ Fast deployment
- ✅ Consistent images
- ✅ No space issues

### Option B: Build on Server with Optimizations

```
Server → Clone Repo → Build with BuildKit → Deploy
```

**Pros:**
- ✅ No external registry needed
- ✅ Simple workflow
- ⚠️ Requires optimized Dockerfiles

### Option C: Use run.sh (Current Working Solution)

```
Server → Clone Repo → npm install → npm start
```

**Pros:**
- ✅ No Docker issues
- ✅ Works now
- ✅ Simple debugging
- ⚠️ Manual process management

---

## Immediate Action Plan

### For Your Current Mac (Development)

1. **Continue using `./run.sh`** - It works perfectly
2. Don't worry about Docker Desktop space issues
3. Focus on optimizing Dockerfiles for server deployment

### For Server Deployment

**Choose one approach:**

#### Approach 1: Pre-Built Images (Recommended)
```bash
# 1. Set up GitHub Actions (see workflow above)
# 2. Push code to trigger build
# 3. On server, just pull and run:
docker-compose -f docker-compose.bff.traefik.prod.yml pull
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

#### Approach 2: Build on Server
```bash
# 1. SSH to server
# 2. Clone repo
git clone your-repo
cd creamati-cms

# 3. Enable BuildKit
export DOCKER_BUILDKIT=1

# 4. Build with script
./scripts/build-docker.sh

# 5. Deploy
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

#### Approach 3: No Docker (Simplest)
```bash
# 1. SSH to server
# 2. Clone repo
# 3. Install Node.js
# 4. Run services
./run.sh

# 5. Use nginx as reverse proxy (instead of Traefik)
```

---

## Server Requirements

### Minimum for Docker Deployment
- **CPU**: 4 cores
- **RAM**: 8GB
- **Disk**: 50GB free
- **OS**: Ubuntu 20.04+ / Debian 11+
- **Docker**: 24.0+
- **Docker Compose**: 2.20+

### Minimum for Non-Docker Deployment
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: 20GB free
- **OS**: Ubuntu 20.04+ / Debian 11+
- **Node.js**: 18.x
- **nginx**: 1.18+

---

## Summary & Recommendation

### 🎯 Best Solution for You:

**Use GitHub Actions + Pre-Built Images**

**Why:**
1. ✅ No space issues on any machine
2. ✅ Fast deployment (just pull images)
3. ✅ Works on any server without GUI
4. ✅ Consistent builds
5. ✅ Easy rollback (just change image tag)

**Steps:**
1. Create GitHub Actions workflow (I can help)
2. Push to Docker Hub (or GitHub Container Registry)
3. Server just pulls and runs
4. Update = pull new image + restart

**Alternative:**
If you don't want to use Docker on server, `./run.sh` works perfectly fine for production too. Just use nginx as reverse proxy instead of Traefik.

Would you like me to:
1. Create the GitHub Actions workflow?
2. Optimize all Dockerfiles?
3. Create a non-Docker production setup?

