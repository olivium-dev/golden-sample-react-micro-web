# Docker BFF Architecture Deployment Guide

## Overview

This guide covers the complete Docker Compose deployment for the BFF (Backend-for-Frontend) architecture. The solution provides production-ready containers with proper networking, health monitoring, and comprehensive testing.

## Architecture

```
Internet → Nginx Load Balancer → BFF Containers → Backend Services
                      ↓
                 Frontend Assets (Static)
```

### Components

1. **BFF Servers**: Express.js servers that proxy API requests and serve React apps
   - User Management BFF (Port 4001)
   - Catalog BFF (Port 4006)
   - Orders BFF (Port 4005)

2. **Micro-Frontends**: React applications served via BFF
   - User Management, Catalog, Orders (via BFF)
   - Data Grid, Analytics, Settings (direct)

3. **Container App**: Main host application (Port 3000/80)

4. **Backend Services**: API services (Port 8000)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- 4GB+ RAM available
- Ports 3000, 3002-3006, 4001, 4005, 4006, 8000 available

## Quick Start

### Development Environment

```bash
# Deploy development environment
./docker/scripts/deploy.sh development

# Or manually
docker-compose -f docker-compose.bff.yml up -d
```

### Production Environment

```bash
# Deploy production environment
./docker/scripts/deploy.sh production

# Or manually
docker-compose -f docker-compose.bff.prod.yml up -d
```

### Test Environment

```bash
# Deploy test environment
./docker/scripts/deploy.sh test

# Or manually
docker-compose -f docker-compose.bff.test.yml up -d
```

## Docker Compose Files

### docker-compose.bff.yml (Development)

- Hot reload enabled
- Volume mounts for live code changes
- Debugging enabled
- Less resource constraints

### docker-compose.bff.prod.yml (Production)

- Optimized builds
- Resource limits configured
- Security hardening
- Caching enabled for Catalog BFF
- Production-ready configuration

### docker-compose.bff.test.yml (Testing)

- Mock backend services
- Faster health checks
- Test-specific configurations
- Isolated test environment

## Service Configuration

### Environment Variables

#### BFF Servers

```env
NODE_ENV=production
BFF_PORT=4001|4005|4006
FRONTEND_PORT=3001|3005|3006
BACKEND_USER_SERVICE_URL=http://backend:8000
BACKEND_CATALOG_SERVICE_URL=https://dev-creamat.fds-1.com/catalog
BACKEND_CDN_SERVICE_URL=https://dev-creamat.fds-1.com/cdn
BACKEND_ORDER_SERVICE_URL=https://dev-creamat.fds-1.com/order
ENABLE_CACHING=true|false
CACHE_MAX_AGE=3600
```

#### Container App

```env
NODE_ENV=production
DOCKER_MODE=true
BFF_MODE=true
```

## Health Checks

All services include health check endpoints:

- **BFF Servers**: `GET /health`
- **Backend**: `GET /health`
- **Container App**: Nginx health endpoint

Check health status:

```bash
# Check all services
./docker/scripts/monitor.sh

# Check specific service
curl http://localhost:4001/health
curl http://localhost:4006/health
curl http://localhost:4005/health
```

## Testing

### Run All Tests

```bash
./docker/scripts/test.sh
```

### Run Specific Test Suites

```bash
# Integration tests
npx playwright test tests/integration/bff-docker.spec.ts

# E2E tests
npx playwright test tests/e2e/docker-bff.spec.ts

# Performance tests
npx playwright test tests/performance/docker-bff.spec.ts
```

### Test Coverage

- **Integration Tests**: BFF-to-backend communication, health checks, API proxying
- **E2E Tests**: Full user journeys, CORS validation, error handling
- **Performance Tests**: Response times, concurrent requests, memory usage

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.bff.yml logs -f

# Specific service
docker-compose -f docker-compose.bff.yml logs -f user-management-bff

# Last 100 lines
docker-compose -f docker-compose.bff.yml logs --tail=100
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# Service status
docker-compose -f docker-compose.bff.yml ps
```

### Health Monitoring

```bash
# Run monitoring script
./docker/scripts/monitor.sh
```

## Troubleshooting

### Services Won't Start

1. **Check Docker is running**:
   ```bash
   docker info
   ```

2. **Check port availability**:
   ```bash
   netstat -an | grep -E "3000|4001|4005|4006|8000"
   ```

3. **Check logs**:
   ```bash
   docker-compose -f docker-compose.bff.yml logs
   ```

### BFF Health Checks Failing

1. **Check BFF server logs**:
   ```bash
   docker logs user-management-bff
   docker logs catalog-bff
   docker logs orders-bff
   ```

2. **Verify backend connectivity**:
   ```bash
   docker exec user-management-bff node -e "require('http').get('http://backend:8000/health', console.log)"
   ```

3. **Check network connectivity**:
   ```bash
   docker network inspect micro-frontend-network
   ```

### CORS Errors Still Occurring

1. **Verify BFF servers are running**:
   ```bash
   curl http://localhost:4001/health
   ```

2. **Check frontend is using relative API paths**:
   - User Management: `/api/users`
   - Catalog: `/api/catalog`, `/api/cdn`
   - Orders: `/api/orders`

3. **Verify Module Federation remotes**:
   - Check container app webpack config
   - Ensure remotes point to BFF servers in Docker mode

### Performance Issues

1. **Check resource limits**:
   ```bash
   docker stats
   ```

2. **Review logs for errors**:
   ```bash
   docker-compose -f docker-compose.bff.yml logs | grep -i error
   ```

3. **Enable caching** (Catalog BFF):
   ```env
   ENABLE_CACHING=true
   CACHE_MAX_AGE=3600
   ```

## Scaling

### Horizontal Scaling

To scale BFF servers:

```bash
docker-compose -f docker-compose.bff.prod.yml up -d --scale user-management-bff=3
```

Update Nginx load balancer configuration to include multiple instances.

### Resource Limits

Adjust resource limits in `docker-compose.bff.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## Security

### Secrets Management

Secrets are stored in `./secrets/` directory:
- `jwt_secret_key.txt`
- `jwt_refresh_secret_key.txt`

Generate new secrets:

```bash
mkdir -p secrets
openssl rand -base64 32 > secrets/jwt_secret_key.txt
openssl rand -base64 32 > secrets/jwt_refresh_secret_key.txt
chmod 600 secrets/*.txt
```

### Network Isolation

All services run on isolated Docker network `micro-frontend-network`. Only necessary ports are exposed.

### Non-Root Containers

All BFF containers run as non-root user (`nodejs`) for security.

## Backup and Recovery

### Backup

```bash
# Backup volumes
docker run --rm -v micro-frontend-backend-cache:/data -v $(pwd):/backup alpine tar czf /backup/backend-cache.tar.gz /data
```

### Recovery

```bash
# Restore volumes
docker run --rm -v micro-frontend-backend-cache:/data -v $(pwd):/backup alpine tar xzf /backup/backend-cache.tar.gz -C /
```

## CI/CD Integration

### Build Pipeline

```yaml
# Example GitHub Actions
- name: Build Docker images
  run: docker-compose -f docker-compose.bff.prod.yml build

- name: Run tests
  run: ./docker/scripts/test.sh test

- name: Deploy
  run: ./docker/scripts/deploy.sh production
```

### Quality Gates

- All tests must pass
- Health checks must succeed
- Performance benchmarks met
- Security scans clear

## Maintenance

### Update Services

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.bff.prod.yml up -d --build
```

### Clean Up

```bash
# Stop and remove containers
docker-compose -f docker-compose.bff.yml down

# Remove volumes (WARNING: Deletes data)
docker-compose -f docker-compose.bff.yml down -v

# Remove images
docker-compose -f docker-compose.bff.yml down --rmi all
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review health checks: `./docker/scripts/monitor.sh`
3. Run tests: `./docker/scripts/test.sh`
4. Check documentation: `BFF_IMPLEMENTATION.md`

## Additional Resources

- [BFF Implementation Guide](./BFF_IMPLEMENTATION.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Playwright Testing](https://playwright.dev/)

