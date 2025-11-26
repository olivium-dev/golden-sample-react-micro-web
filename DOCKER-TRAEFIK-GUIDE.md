# Docker + Traefik Setup Guide

## 🎯 Overview

This project uses **Traefik** as a reverse proxy to route traffic to all micro-frontend services. We provide two Docker strategies:

1. **Simple Approach** (Recommended) - Build locally, Docker only for serving
2. **Optimized Approach** - Multi-stage builds (requires more disk space)

---

## 📋 Quick Start (Recommended)

### Simple Approach - Best for Limited Disk Space

```bash
# 1. Build all apps locally and create Docker images
./scripts/build-and-dockerize.sh

# 2. Start services with Traefik
docker-compose -f docker-compose.simple.yml up -d

# 3. Access your application
open http://localhost
```

**Advantages:**
- ✅ Minimal disk space usage (~500MB total)
- ✅ Fast Docker builds (only copying files)
- ✅ Works on any server
- ✅ Easy to debug (build locally first)

---

## 🏗️ Architecture

### Traefik Routing

```
User Request → Traefik (Port 80) → Routes to correct service
                  ↓
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
Container    User Mgmt      Orders
   App          App           App
```

### How Traefik Works

1. **Single Entry Point**: All traffic goes through port 80
2. **Automatic Service Discovery**: Traefik detects Docker containers
3. **Label-Based Routing**: Routes defined in docker-compose labels
4. **Load Balancing**: Distributes traffic if multiple instances exist

### Routing Rules

| URL Pattern | Service | Priority |
|------------|---------|----------|
| `http://localhost` | container-app | 1 (default) |
| `http://localhost/remoteEntry-user.js` | user-management-app | 10 |
| `http://localhost/remoteEntry-orders.js` | orders-app | 10 |
| `http://localhost/remoteEntry-catalog.js` | catalog-app | 10 |
| `http://localhost/remoteEntry-data-grid.js` | data-grid-app | 10 |
| `http://localhost/remoteEntry-analytics.js` | analytics-app | 10 |
| `http://localhost/remoteEntry-settings.js` | settings-app | 10 |

---

## 🚀 Deployment Options

### Option 1: Simple Approach (Recommended)

**Best for:** Limited disk space, development, production

```bash
# Build and dockerize
./scripts/build-and-dockerize.sh

# Start with Traefik
docker-compose -f docker-compose.simple.yml up -d

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop services
docker-compose -f docker-compose.simple.yml down
```

**How it works:**
1. Builds all apps locally (uses your node_modules)
2. Creates tiny Docker images (only nginx + built files)
3. Each image is ~50MB
4. Total: ~350MB for all services

### Option 2: Optimized Multi-Stage Builds

**Best for:** Servers with plenty of disk space (10GB+)

```bash
# Build with multi-stage Dockerfiles
./scripts/build-optimized.sh

# Start with Traefik
docker-compose -f docker-compose.optimized.yml up -d
```

**How it works:**
1. Builds everything inside Docker
2. Uses multi-stage builds
3. Final images are small, but build process needs more space
4. Requires ~5-10GB during build

---

## 🔧 Configuration

### Traefik Dashboard

Access at: http://localhost:8080

**Features:**
- View all registered services
- Check routing rules
- Monitor traffic
- Debug routing issues

### Environment Variables

Set in `docker-compose.simple.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DOCKER_MODE=true
```

### Resource Limits

Each service has limits to prevent resource hogging:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
```

---

## 🌐 Production Deployment

### On a Server

```bash
# 1. Clone repository
git clone your-repo-url
cd creamati-cms

# 2. Build and dockerize
./scripts/build-and-dockerize.sh

# 3. Start services
docker-compose -f docker-compose.simple.yml up -d

# 4. Verify
docker ps
curl http://localhost
```

### Update Domain for Production

Edit `docker-compose.simple.yml`:

```yaml
labels:
  - "traefik.http.routers.container.rule=Host(`your-domain.com`)"
```

### Enable HTTPS

Add to Traefik command in `docker-compose.simple.yml`:

```yaml
command:
  - "--entrypoints.websecure.address=:443"
  - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
  - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
  - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"

volumes:
  - ./letsencrypt:/letsencrypt
```

Update labels:

```yaml
labels:
  - "traefik.http.routers.container.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.container.entrypoints=websecure"
  - "traefik.http.routers.container.tls.certresolver=myresolver"
```

---

## 🔍 Monitoring & Debugging

### Check Service Status

```bash
# List all containers
docker-compose -f docker-compose.simple.yml ps

# Check resource usage
docker stats

# View logs for all services
docker-compose -f docker-compose.simple.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.simple.yml logs -f user-management-app
```

### Traefik Dashboard

1. Open http://localhost:8080
2. Go to "HTTP" → "Routers"
3. Verify all services are registered
4. Check routing rules and priorities

### Common Issues

#### Service Not Accessible

```bash
# Check if container is running
docker ps | grep micro-frontend

# Check Traefik logs
docker logs traefik

# Check service logs
docker-compose -f docker-compose.simple.yml logs service-name

# Verify routing in Traefik dashboard
open http://localhost:8080
```

#### Routing Not Working

1. Check labels in docker-compose file
2. Verify service is running: `docker ps`
3. Check Traefik dashboard for registered routes
4. Verify priority settings (higher number = higher priority)

#### Port Conflicts

```bash
# Check if port 80 is already in use
lsof -i :80

# Check if port 8080 is already in use
lsof -i :8080

# Kill process using port
kill -9 <PID>
```

---

## 📊 File Structure

```
creamati-cms/
├── docker-compose.simple.yml          # Simple approach (recommended)
├── docker-compose.optimized.yml       # Multi-stage builds
├── scripts/
│   ├── build-and-dockerize.sh        # Build locally + dockerize
│   └── build-optimized.sh            # Build with multi-stage
└── frontend/
    ├── container/
    │   ├── Dockerfile.simple         # Simple Dockerfile
    │   └── Dockerfile.optimized      # Multi-stage Dockerfile
    ├── user-management-app/
    │   ├── Dockerfile.simple
    │   └── Dockerfile.optimized
    └── ... (other apps)
```

---

## 🆚 Comparison

| Aspect | Simple | Optimized |
|--------|--------|-----------|
| **Disk Space During Build** | ~2GB | ~10GB |
| **Final Image Size** | ~50MB each | ~50MB each |
| **Build Time** | ~5 min | ~15 min |
| **Build Location** | Local | Docker |
| **Debugging** | Easy | Harder |
| **Best For** | Most cases | CI/CD pipelines |

---

## 🎯 Recommendations

### Use Simple Approach If:
- ✅ You have limited disk space
- ✅ You want faster builds
- ✅ You're deploying to a server
- ✅ You want easier debugging

### Use Optimized Approach If:
- ✅ You have plenty of disk space (10GB+)
- ✅ You want fully containerized builds
- ✅ You're using CI/CD pipelines
- ✅ You need reproducible builds

---

## 📝 Traefik Labels Explained

### Basic Routing

```yaml
labels:
  # Enable Traefik for this service
  - "traefik.enable=true"
  
  # Define routing rule (Host + PathPrefix)
  - "traefik.http.routers.user-management.rule=Host(`localhost`) && PathPrefix(`/remoteEntry-user.js`)"
  
  # Which entrypoint to use (port 80)
  - "traefik.http.routers.user-management.entrypoints=web"
  
  # Which port on the container to forward to
  - "traefik.http.services.user-management.loadbalancer.server.port=80"
```

### Priority

Higher number = higher priority:

```yaml
# Container app (default, catches all)
- "traefik.http.routers.container.priority=1"

# Specific routes (higher priority)
- "traefik.http.routers.user-management.priority=10"
```

### Multiple Domains

```yaml
- "traefik.http.routers.container.rule=Host(`example.com`) || Host(`www.example.com`)"
```

### Path-Based Routing

```yaml
# Exact path
- "traefik.http.routers.api.rule=Path(`/api`)"

# Path prefix
- "traefik.http.routers.api.rule=PathPrefix(`/api/`)"

# Multiple paths
- "traefik.http.routers.api.rule=PathPrefix(`/api/`) || PathPrefix(`/v1/`)"
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Traefik dashboard accessible: http://localhost:8080
- [ ] Main app loads: http://localhost
- [ ] All services registered in Traefik dashboard
- [ ] Remote entry files accessible
- [ ] No errors in logs: `docker-compose logs`
- [ ] All containers healthy: `docker ps`
- [ ] Resource usage acceptable: `docker stats`

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and Dockerize
        run: ./scripts/build-and-dockerize.sh
      
      - name: Deploy
        run: |
          docker-compose -f docker-compose.simple.yml up -d
          
      - name: Health Check
        run: |
          sleep 30
          curl -f http://localhost || exit 1
```

---

## 📚 Additional Resources

### Traefik Documentation
- [Official Docs](https://doc.traefik.io/traefik/)
- [Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Routing Rules](https://doc.traefik.io/traefik/routing/routers/)

### Module Federation
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Micro-Frontends](https://micro-frontends.org/)

---

## 🎉 Summary

### Quick Commands

```bash
# Build and start (Simple approach - Recommended)
./scripts/build-and-dockerize.sh
docker-compose -f docker-compose.simple.yml up -d

# View Traefik dashboard
open http://localhost:8080

# Access application
open http://localhost

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop services
docker-compose -f docker-compose.simple.yml down
```

### Key Benefits

✅ **Single entry point** - All traffic through Traefik
✅ **Automatic routing** - Based on Docker labels
✅ **Easy scaling** - Add more services easily
✅ **Production ready** - Health checks, resource limits
✅ **Minimal disk usage** - ~350MB total with simple approach
✅ **Server compatible** - Works on any Linux server

---

**Need help?** Check the Traefik dashboard at http://localhost:8080 for routing details!

