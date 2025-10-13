# 🐳 Docker Guide - Micro-Frontend Platform

Complete guide to running the micro-frontend platform using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker Desktop 20.10+ (or Docker Engine + Docker Compose)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### Installation

**macOS:**
```bash
brew install --cask docker
```

**Windows/Linux:**
Download from [docker.com](https://www.docker.com/products/docker-desktop)

---

## 🚀 Quick Start

### Development Mode (with hot reload)

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Mode

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build

# Stop production containers
docker-compose -f docker-compose.prod.yml down
```

---

## 📊 Service Architecture

| Service | Port | Container Name | Description |
|---------|------|----------------|-------------|
| Backend API | 8000 | micro-frontend-backend | FastAPI + Mock Data |
| Container App | 3000 | micro-frontend-container | Main Host Application |
| User Management | 3001 | micro-frontend-user-management | CRUD + DataGrid |
| Data Grid | 3002 | micro-frontend-data-grid | Clean Architecture |
| Analytics | 3003 | micro-frontend-analytics | Charts + Metrics |
| Settings | 3004 | micro-frontend-settings | Theme + Config |

---

## 🛠️ Common Commands

### Starting Services

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up backend container-app

# Rebuild and start
docker-compose up --build

# Force recreate containers
docker-compose up --force-recreate
```

### Stopping Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f container-app

# Last 100 lines
docker-compose logs --tail=100 user-management-app
```

### Managing Containers

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec container-app sh

# Restart specific service
docker-compose restart analytics-app

# View resource usage
docker stats
```

---

## 🔧 Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd golden-sample-react-micro-web

# Start services
docker-compose up -d

# Wait for services to start (~2-3 minutes)
docker-compose logs -f | grep "compiled successfully"
```

### 2. Access Applications

- **Container (Main):** http://localhost:3000
- **User Management:** http://localhost:3001
- **Data Grid:** http://localhost:3002
- **Analytics:** http://localhost:3003
- **Settings:** http://localhost:3004
- **API Docs:** http://localhost:8000/docs

### 3. Development with Hot Reload

All services have hot reload enabled. Changes to code will automatically rebuild:

```bash
# Edit any file
vim frontend/container/src/App.minimal.tsx

# Watch logs to see rebuild
docker-compose logs -f container-app
```

### 4. Debugging

```bash
# Access container shell
docker-compose exec container-app sh

# Check node_modules
ls -la /app/node_modules

# Check running processes
docker-compose exec container-app ps aux

# Inspect webpack
docker-compose exec container-app npx webpack --version
```

---

## 🏗️ Building for Production

### Build All Images

```bash
# Build all production images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build container-app

# Build with no cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Test Production Locally

```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up

# Access at http://localhost (port 80)
```

### Production Checklist

- [ ] All services build successfully
- [ ] No console errors in browser
- [ ] All micro-frontends load correctly
- [ ] API endpoints respond correctly
- [ ] Health checks pass
- [ ] Resource usage is acceptable

---

## 📦 Docker Images

### Image Sizes (approximate)

| Service | Development | Production |
|---------|-------------|------------|
| Backend | ~250MB | ~200MB |
| Container App | ~500MB | ~50MB (nginx) |
| User Management | ~500MB | ~50MB (nginx) |
| Data Grid | ~500MB | ~50MB (nginx) |
| Analytics | ~500MB | ~50MB (nginx) |
| Settings | ~500MB | ~50MB (nginx) |

### Optimizing Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# View image sizes
docker images
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check if port is in use
lsof -i :<port>

# Remove and recreate
docker-compose down
docker-compose up --force-recreate
```

### Hot Reload Not Working

```bash
# Ensure WATCHPACK_POLLING is set
docker-compose exec container-app env | grep WATCHPACK

# Restart service
docker-compose restart container-app
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory

# Check container memory usage
docker stats

# Restart Docker Desktop
```

### Build Failures

```bash
# Clean everything
docker-compose down -v --rmi all
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Network Issues

```bash
# Inspect network
docker network inspect golden-sample-react-micro-web_micro-frontend-network

# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Volume Permission Issues

```bash
# Linux: Fix permissions
sudo chown -R $USER:$USER frontend/

# macOS: Usually not needed (but check Docker preferences)
```

---

## 🌐 Networking

### Internal Communication

Services communicate via Docker network:

```javascript
// In micro-frontends
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Container can access: http://backend:8000
// Browser must use: http://localhost:8000
```

### Custom Network

```yaml
networks:
  micro-frontend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 💾 Volumes

### Development Volumes

```yaml
volumes:
  - ./frontend/container:/app      # Code sync
  - /app/node_modules              # Prevent overwrite
  - ./frontend/shared-ui-lib:/app/shared-ui-lib  # Shared library
```

### Persistent Data

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect golden-sample-react-micro-web_backend-cache

# Remove volumes
docker volume prune
```

---

## 🔒 Environment Variables

### Development (.env)

Create `.env` file:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Development Settings
NODE_ENV=development
WATCHPACK_POLLING=true

# Backend
PYTHONUNBUFFERED=1
```

### Production

```bash
# Set in docker-compose.prod.yml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=https://api.production.com
```

---

## 🧪 Testing in Docker

### Run Tests

```bash
# Unit tests
docker-compose exec container-app npm test

# E2E tests
docker-compose exec container-app npm run test:e2e

# Lint
docker-compose exec container-app npm run lint
```

---

## 📈 Monitoring

### Health Checks

```bash
# Check all health statuses
docker-compose ps

# Backend health
curl http://localhost:8000/health

# Container health
curl http://localhost:3000/health
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Container details
docker-compose top
```

---

## 🚢 Deployment

### Push to Registry

```bash
# Tag images
docker tag micro-frontend-container:latest registry.com/container:v1.0.0

# Push to registry
docker push registry.com/container:v1.0.0

# Pull on server
docker pull registry.com/container:v1.0.0
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml micro-frontend

# List services
docker stack services micro-frontend

# Remove stack
docker stack rm micro-frontend
```

### Kubernetes

```bash
# Convert docker-compose to k8s
kompose convert -f docker-compose.prod.yml

# Apply to cluster
kubectl apply -f ./
```

---

## 🎯 Best Practices

### Development

1. ✅ Use volume mounts for hot reload
2. ✅ Keep development containers lightweight
3. ✅ Use `.dockerignore` to exclude unnecessary files
4. ✅ Run `docker-compose down -v` periodically
5. ✅ Monitor resource usage

### Production

1. ✅ Use multi-stage builds
2. ✅ Minimize image layers
3. ✅ Don't run as root
4. ✅ Use specific version tags
5. ✅ Implement health checks
6. ✅ Set resource limits
7. ✅ Use nginx for static files

### Security

1. ✅ Scan images: `docker scan <image>`
2. ✅ Use official base images
3. ✅ Don't expose unnecessary ports
4. ✅ Keep Docker updated
5. ✅ Use secrets for sensitive data

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 🆘 Getting Help

### Common Issues

**Q: Services are slow to start**
A: First build takes time. Subsequent starts are faster due to caching.

**Q: Can't access services**
A: Check if ports are already in use: `lsof -i :3000`

**Q: Changes not reflecting**
A: Ensure volume mounts are correct and WATCHPACK_POLLING is set.

**Q: Out of disk space**
A: Run `docker system prune -a` to clean up unused images and containers.

### Support

- Check logs: `docker-compose logs -f`
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See README.md and LESSONS_LEARNED.md

---

**Last Updated:** $(date)  
**Docker Version:** 20.10+  
**Docker Compose Version:** 2.0+

