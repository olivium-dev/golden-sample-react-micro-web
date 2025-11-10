# Traefik BFF Architecture Deployment Guide

## Overview

The BFF architecture now uses **Traefik** as the reverse proxy, simplifying the deployment by routing all traffic through a single port (80) with intelligent path-based routing.

## Architecture with Traefik

```
Internet (Port 80)
        ↓
   Traefik Reverse Proxy
        ↓
   ┌────┴────┬──────┬──────┬──────┐
   ↓         ↓      ↓      ↓      ↓
/api/users  /api/  /api/  /      Micro-
           catalog orders (app)  frontends
   ↓         ↓      ↓      ↓      ↓
User BFF  Cat BFF  Ord BFF  Cont  Apps
(4001)    (4006)   (4005)   (80)  (80)
```

## Benefits of Traefik

1. **Single Port Exposure**: Only port 80 exposed (and 443 for HTTPS)
2. **Dynamic Routing**: Automatic service discovery via Docker labels
3. **Load Balancing**: Built-in load balancing across service instances
4. **Health Checks**: Automatic health monitoring
5. **Metrics**: Prometheus metrics out of the box
6. **SSL Termination**: Easy SSL/TLS configuration
7. **Dashboard**: Web UI at http://localhost:8080

## Routing Rules

### API Routes (Priority: 100 - Highest)
- `/api/users/*` → User Management BFF (Port 4001)
- `/api/catalog/*` → Catalog BFF (Port 4006)
- `/api/cdn/*` → Catalog BFF (Port 4006)
- `/api/orders/*` → Orders BFF (Port 4005)

### Application Routes (Priority: 1 - Lowest)
- `/*` → Container App (Port 80)

### Health Monitoring
- `/user-health` → User Management BFF health
- `/catalog-health` → Catalog BFF health
- `/orders-health` → Orders BFF health

## Quick Start

### Development (with Traefik)
```bash
docker-compose -f docker-compose.bff.traefik.yml up -d
```

### Production (with Traefik)
```bash
docker-compose -f docker-compose.bff.traefik.prod.yml up -d
```

### Access Points
- **Main Application**: http://localhost
- **Traefik Dashboard**: http://localhost:8080
- **Health Check**: http://localhost/user-health

## Traefik Configuration

### Labels Explained

#### BFF Service Example:
```yaml
labels:
  - "traefik.enable=true"  # Enable Traefik routing
  - "traefik.http.routers.user-bff.rule=Host(`localhost`) && PathPrefix(`/api/users`)"  # Route rule
  - "traefik.http.routers.user-bff.priority=100"  # High priority for API routes
  - "traefik.http.services.user-bff.loadbalancer.server.port=4001"  # Internal port
```

### Priority System
- **100**: API routes (BFF servers) - highest priority
- **1**: Container app (catch-all) - lowest priority

This ensures API requests are routed to BFF servers before falling back to the container app.

## Advantages Over Manual Port Mapping

### Before (Multiple Ports):
```yaml
ports:
  - "3000:80"   # Container
  - "4001:4001" # User BFF
  - "4005:4005" # Orders BFF
  - "4006:4006" # Catalog BFF
  - "3002:80"   # Data Grid
  - "3003:80"   # Analytics
  - "3004:80"   # Settings
```

### After (Traefik - Single Port):
```yaml
ports:
  - "80:80"     # All traffic via Traefik
  - "8080:8080" # Traefik Dashboard
```

## Monitoring

### Traefik Dashboard
Access the Traefik dashboard at http://localhost:8080 to see:
- Active routes
- Service health
- Request metrics
- Load balancer status

### Prometheus Metrics
Metrics available at: http://localhost:8080/metrics

Key metrics:
- `traefik_service_requests_total`
- `traefik_service_request_duration_seconds`
- `traefik_entrypoint_requests_total`

## Service Discovery

Traefik automatically discovers services via Docker labels. Add a new service:

```yaml
my-new-service:
  build: ./my-service
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.myservice.rule=Host(`localhost`) && PathPrefix(`/myservice`)"
    - "traefik.http.services.myservice.loadbalancer.server.port=8080"
```

No manual configuration needed!

## Testing

### Test BFF Routing Through Traefik
```bash
# Should be proxied to User Management BFF
curl http://localhost/api/users

# Should be proxied to Catalog BFF
curl http://localhost/api/catalog/Category/All/10/1

# Should be proxied to Orders BFF
curl http://localhost/api/orders/users/test/orders
```

### Test Health Checks
```bash
curl http://localhost/user-health
curl http://localhost/catalog-health
curl http://localhost/orders-health
```

## Scaling with Traefik

### Scale a Service
```bash
docker-compose -f docker-compose.bff.traefik.yml up -d --scale user-management-bff=3
```

Traefik automatically load balances across all 3 instances!

## SSL/TLS Configuration

### Enable HTTPS (Production)
Add certificate configuration to Traefik:

```yaml
command:
  - "--entrypoints.websecure.address=:443"
  - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
  - "--certificatesresolvers.myresolver.acme.email=your@email.com"
  - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
volumes:
  - "./letsencrypt:/letsencrypt"
```

Then update service labels:
```yaml
labels:
  - "traefik.http.routers.user-bff.tls.certresolver=myresolver"
```

## Troubleshooting

### Check Traefik Logs
```bash
docker logs traefik-bff
```

### View Active Routes
Visit http://localhost:8080 and navigate to HTTP → Routers

### Test Specific Route
```bash
curl -v http://localhost/api/users
```

Check the response headers for `X-Traefik-*` headers.

## Comparison: Development vs Production

### Development (Local - Current Setup)
- Container app webpack proxy → BFF servers
- Direct port access for debugging
- Hot reload enabled

### Production (Docker + Traefik)
- Traefik → BFF containers → Backend
- Single port 80 exposed
- Optimized builds
- Auto-scaling capability

## Files Created

- `docker-compose.bff.traefik.yml` - Traefik development setup
- `docker-compose.bff.traefik.prod.yml` - Traefik production setup
- `TRAEFIK_DEPLOYMENT.md` - This documentation

## Next Steps

1. **Test Traefik Setup**:
   ```bash
   docker-compose -f docker-compose.bff.traefik.yml up -d
   ```

2. **Access Application**:
   - Main app: http://localhost
   - Traefik dashboard: http://localhost:8080

3. **Monitor Services**:
   - Check Traefik dashboard for routing
   - View metrics and health status

4. **Scale as Needed**:
   ```bash
   docker-compose up -d --scale catalog-bff=2
   ```

## Summary

Traefik simplifies the BFF architecture by:
- ✅ Reducing port complexity (only port 80 needed)
- ✅ Providing automatic service discovery
- ✅ Enabling easy scaling
- ✅ Built-in load balancing
- ✅ Metrics and monitoring
- ✅ SSL/TLS support

This is the **professional, production-ready solution** for micro-frontend deployments!

