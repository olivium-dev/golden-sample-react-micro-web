# Docker Compose Configuration Guide

## Architecture Overview

This project uses a **micro-frontend architecture WITHOUT BFF** (Backend-for-Frontend). All frontends call the real backend at `https://dev-creamat.fds-1.com/gateway/` directly.

## Available Docker Compose Files

### ✅ Recommended Files (Active)

#### 1. `docker-compose.yml` - Local Development (Simple)
**Use for**: Local development without Traefik

```bash
docker-compose up -d
```

**Features:**
- All 7 micro-frontends on separate ports (3000-3006)
- Development mode with hot reload
- Volume mounts for live code changes
- No reverse proxy

**Access:**
- Container: http://localhost:3000
- User Management: http://localhost:3001
- Data Grid: http://localhost:3002
- Analytics: http://localhost:3003
- Settings: http://localhost:3004
- Orders: http://localhost:3005
- Catalog: http://localhost:3006

---

#### 2. `docker-compose.bff.traefik.yml` - Development with Traefik
**Use for**: Local development with Traefik reverse proxy

```bash
docker-compose -f docker-compose.bff.traefik.yml up -d
```

**Features:**
- Single entry point via Traefik (port 80)
- All micro-frontends accessible via localhost
- Traefik dashboard on port 8080
- Production-like routing

**Access:**
- All apps: http://localhost (Traefik routes automatically)
- Traefik Dashboard: http://localhost:8080

---

#### 3. `docker-compose.bff.traefik.prod.yml` - Production with Traefik
**Use for**: Production deployment with Traefik

```bash
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

**Features:**
- Production-optimized builds
- Resource limits configured
- HTTPS support (port 443)
- Prometheus metrics enabled
- Health checks configured
- Auto-restart enabled

**Access:**
- All apps: http://localhost or https://localhost
- Traefik Dashboard: http://localhost:8080

---

#### 4. `docker-compose.prod.yml` - Production without Traefik
**Use for**: Production deployment without reverse proxy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Features:**
- Production builds
- Each service on separate port
- No reverse proxy
- Simple deployment

**Access:**
- Container: http://localhost:80
- User Management: http://localhost:3001
- Data Grid: http://localhost:3002
- Analytics: http://localhost:3003
- Settings: http://localhost:3004
- Orders: http://localhost:3005
- Catalog: http://localhost:3006

---

### ⚠️ Deprecated Files (For Reference Only)

These files are kept for historical reference but should NOT be used:

- `docker-compose.bff.yml` - Old BFF configuration
- `docker-compose.bff.prod.yml` - Old BFF production
- `docker-compose.bff.test.yml` - Old BFF testing

**Why deprecated?**
- Project no longer uses BFF architecture
- Mock backend removed
- Frontends call real backend directly

---

## Service Architecture

### Micro-Frontends (7 services)

1. **Container App** (port 3000)
   - Main host application
   - React Router
   - Module Federation host
   - Loads all remote apps

2. **User Management App** (port 3001)
   - User CRUD operations
   - Firebase authentication
   - Calls: `/gateway/api/user`

3. **Data Grid App** (port 3002)
   - Generic data display
   - MUI Data Grid

4. **Analytics App** (port 3003)
   - Dashboard and metrics
   - MUI Charts
   - Calls: `/gateway/api/analytics`

5. **Settings App** (port 3004)
   - Application settings
   - User preferences

6. **Orders App** (port 3005)
   - Order management
   - Calls: `/gateway/api/Order`

7. **Catalog App** (port 3006)
   - Product catalog
   - Calls: `/gateway/api/Catalog`, `/gateway/cdn`

---

## Traefik Configuration

### Routing Strategy

Traefik routes requests based on path prefixes:

```
Priority 100 (High): Remote Entry Files
- /remoteEntry-user.js → user-management-app:80
- /remoteEntry-data-grid.js → data-grid-app:80
- /remoteEntry-analytics.js → analytics-app:80
- /remoteEntry-settings.js → settings-app:80
- /remoteEntry-orders.js → orders-app:80
- /remoteEntry-catalog.js → catalog-app:80

Priority 1 (Low): Catch-all
- /* → container-app:80
```

### Traefik Dashboard

Access at: http://localhost:8080

Features:
- View all routers and services
- Monitor traffic
- Check health status
- View metrics (production)

---

## Common Commands

### Start Services

```bash
# Development (simple)
docker-compose up -d

# Development (with Traefik)
docker-compose -f docker-compose.bff.traefik.yml up -d

# Production (with Traefik)
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

### Stop Services

```bash
# Stop default
docker-compose down

# Stop specific file
docker-compose -f docker-compose.bff.traefik.yml down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f container-app

# Last 100 lines
docker-compose logs --tail=100 -f
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build container-app

# Rebuild and start
docker-compose up -d --build
```

### Check Status

```bash
# List running containers
docker-compose ps

# Check health
docker-compose ps | grep healthy
```

---

## Environment Variables

### Required for All Services

Create `.env` file in project root:

```env
NODE_ENV=production
DOCKER_MODE=true

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

---

## Resource Limits (Production)

### Traefik
- CPU: 0.5 cores
- Memory: 256MB

### Container App
- CPU: 1.0 core
- Memory: 512MB

### Each Micro-Frontend
- CPU: 0.5 cores
- Memory: 256MB

---

## Networking

All services use the `micro-frontend-network` bridge network:

```yaml
networks:
  micro-frontend-network:
    driver: bridge
```

This allows:
- Service-to-service communication
- DNS resolution by service name
- Isolated network namespace

---

## Health Checks

Production services include health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

---

## Troubleshooting

### Issue: Services not starting
**Solution**: Check logs with `docker-compose logs -f`

### Issue: Port conflicts
**Solution**: Stop conflicting services or change ports in docker-compose file

### Issue: Traefik not routing correctly
**Solution**: 
1. Check Traefik dashboard at http://localhost:8080
2. Verify service labels are correct
3. Ensure services are healthy

### Issue: Remote entries not loading
**Solution**:
1. Check if all services are running: `docker-compose ps`
2. Verify network connectivity
3. Check browser console for errors

### Issue: Build failures
**Solution**:
1. Clear Docker cache: `docker system prune -a`
2. Rebuild: `docker-compose build --no-cache`

---

## Migration Guide

### From BFF to Direct Backend Calls

If you have old code using BFF:

**Before:**
```typescript
const API_URL = 'http://localhost:4001/api/users';
```

**After:**
```typescript
const API_URL = 'https://dev-creamat.fds-1.com/gateway/api/user';
```

### From Mock Backend to Real Backend

**Before:**
```yaml
depends_on:
  - backend
environment:
  - REACT_APP_API_URL=http://backend:8000
```

**After:**
```yaml
# No backend dependency
# Frontend calls https://dev-creamat.fds-1.com/gateway/ directly
```

---

## Best Practices

1. **Use Traefik for production** - Single entry point, better routing
2. **Monitor resource usage** - Check with `docker stats`
3. **Regular updates** - Keep base images updated
4. **Health checks** - Always configure for production
5. **Logging** - Centralize logs for monitoring
6. **Backups** - Regular container and volume backups

---

## Quick Reference

| File | Purpose | Traefik | Backend | Use Case |
|------|---------|---------|---------|----------|
| `docker-compose.yml` | Dev simple | ❌ | ❌ | Local dev |
| `docker-compose.bff.traefik.yml` | Dev Traefik | ✅ | ❌ | Local dev with routing |
| `docker-compose.bff.traefik.prod.yml` | Production | ✅ | ❌ | Production deployment |
| `docker-compose.prod.yml` | Production simple | ❌ | ❌ | Simple production |
| `docker-compose.bff.yml` | ⚠️ Deprecated | ❌ | ❌ | Don't use |
| `docker-compose.bff.prod.yml` | ⚠️ Deprecated | ❌ | ❌ | Don't use |
| `docker-compose.bff.test.yml` | ⚠️ Deprecated | ❌ | ❌ | Don't use |

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Check Traefik dashboard: http://localhost:8080
3. Verify network: `docker network inspect micro-frontend-network`
4. Check service health: `docker-compose ps`

