# Traefik Configuration Guide

## Overview

This project uses [Traefik](https://traefik.io/) as a reverse proxy for automatic service discovery and dynamic routing. Traefik eliminates the need for manual nginx configuration updates when adding or removing micro-frontends.

## Architecture

```
External Nginx (Host) → Traefik (Docker) → Micro-frontends
                                         → Backend API
```

### Components

- **Traefik**: Dynamic reverse proxy with automatic service discovery
- **Backend API**: Routed via `/api` prefix
- **Container App**: Main host application at `/`
- **Micro-frontends**: Routed via path prefixes (`/users`, `/data`, `/analytics`, `/settings`)

## Configuration Files

### `traefik/traefik.yml`
Main Traefik configuration:
- API dashboard (port 8080)
- Entry points (HTTP/HTTPS)
- Docker provider for service discovery
- Logging configuration

### `traefik/dynamic.yml`
Middleware configuration:
- CORS headers for API requests
- Basic authentication for dashboard
- Custom routing rules

### `traefik/Dockerfile`
Traefik image with embedded configuration files

## Dashboard Access

The Traefik dashboard provides real-time visibility into routing and services:

- **Local**: http://localhost:8080
- **VPS**: http://192.168.2.73:8080
- **Authentication**: admin / admin123 (configured in `dynamic.yml`)

### Dashboard Features

1. **Routers**: View all HTTP routing rules
2. **Services**: See all discovered backend services
3. **Middlewares**: Check active middleware (CORS, auth, etc.)
4. **Providers**: Monitor Docker service discovery
5. **Metrics**: Real-time request statistics

## Adding New Services

Traefik automatically discovers services with proper Docker labels. No manual configuration needed!

### Example: Adding a New Micro-Frontend

Add to `docker-compose.prod.yml`:

```yaml
services:
  my-new-service:
    build: ./frontend/my-new-service
    expose:
      - "80"
    depends_on:
      - backend
      - traefik
    networks:
      - micro-frontend-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.my-service.rule=PathPrefix(`/my-service`)"
      - "traefik.http.routers.my-service.entrypoints=web"
      - "traefik.http.services.my-service.loadbalancer.server.port=80"
```

That's it! Traefik will automatically:
1. Discover the new service
2. Create routing rules
3. Update the dashboard
4. Start forwarding traffic

## Routing Rules

### Current Routes

| Path | Service | Port | Description |
|------|---------|------|-------------|
| `/api/*` | backend | 30001 | Backend API with CORS middleware |
| `/` | container | 80 | Main container app (priority 1) |
| `/users/*` | user-management | 80 | User management micro-frontend |
| `/data/*` | data-grid | 80 | Data grid micro-frontend |
| `/analytics/*` | analytics | 80 | Analytics micro-frontend |
| `/settings/*` | settings | 80 | Settings micro-frontend |

### Module Federation

Container app loads micro-frontends via path-based URLs:
- User Management: `http://domain/users/remoteEntry.js`
- Data Grid: `http://domain/data/remoteEntry.js`
- Analytics: `http://domain/analytics/remoteEntry.js`
- Settings: `http://domain/settings/remoteEntry.js`

## Middleware

### CORS Headers

Applied to backend API routes:
```yaml
cors-headers:
  headers:
    accessControlAllowOriginList: ["*"]
    accessControlAllowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    accessControlAllowHeaders: ["Content-Type", "Authorization"]
```

### Basic Auth

Applied to Traefik dashboard:
```yaml
basic-auth:
  basicAuth:
    users:
      - "admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/"
```

To generate new password:
```bash
htpasswd -nb admin your-password
```

## Monitoring and Logs

### Access Logs

Location: `./traefik/logs/access.log`

View logs:
```bash
# Via Docker
docker logs micro-frontend-traefik

# Via file
tail -f ./traefik/logs/access.log
```

### Real-time Monitoring

1. Open Traefik dashboard
2. Navigate to "HTTP" section
3. View routers, services, and middlewares
4. Check request counts and response times

## Troubleshooting

### Service Not Found (404)

**Symptoms**: Accessing a route returns 404

**Solutions**:
1. Check if service is running: `docker ps`
2. Verify labels in `docker-compose.prod.yml`
3. Check Traefik dashboard for registered routers
4. Ensure `traefik.enable=true` label is set
5. Verify service is on the correct network

### CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solutions**:
1. Check if `cors-headers` middleware is applied to backend router
2. Verify `CORS_ORIGINS` environment variable in backend
3. Check browser network tab for response headers
4. Ensure API routes match `PathPrefix(/api)`

### Module Federation Not Loading

**Symptoms**: Micro-frontends fail to load

**Solutions**:
1. Verify remote entry URLs in container webpack config
2. Check browser console for 404 errors on remoteEntry.js
3. Ensure micro-frontend services are running
4. Verify path-based routing: `/users/remoteEntry.js`, not `:30003/remoteEntry.js`
5. Check Traefik dashboard for route conflicts

### Dashboard Not Accessible

**Symptoms**: Cannot access dashboard at port 8080

**Solutions**:
1. Check if Traefik container is running
2. Verify port 8080 is exposed in docker-compose
3. Try without authentication (set `insecure: true`)
4. Check firewall rules
5. Review Traefik logs for errors

### Service Conflicts

**Symptoms**: Routes not working as expected

**Solutions**:
1. Check router priorities (higher number = higher priority)
2. Verify PathPrefix rules don't overlap
3. Review Traefik dashboard for conflicting routers
4. Use more specific path rules
5. Add priority labels to resolve conflicts

## Performance Optimization

### Enable Caching

Add to `dynamic.yml`:
```yaml
http:
  middlewares:
    cache:
      plugin:
        souin:
          default_cache:
            ttl: 3600s
```

### Enable Compression

Add to `traefik.yml`:
```yaml
http:
  middlewares:
    compress:
      compress: {}
```

### Enable Rate Limiting

Add to `dynamic.yml`:
```yaml
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
```

## Production Considerations

### SSL/TLS

Enable HTTPS entry point in `traefik.yml`:
```yaml
entryPoints:
  websecure:
    address: ":443"
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
```

### Dashboard Security

Disable insecure mode in production:
```yaml
api:
  dashboard: true
  insecure: false  # Requires TLS
```

### Health Checks

Traefik automatically uses Docker health checks. Ensure all services have:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:80/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## External Nginx Integration

If using external nginx on the host:

```nginx
location / {
    proxy_pass http://127.0.0.1:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Backup and Rollback

### Backup Current Configuration

```bash
cp -r traefik traefik.backup
cp docker-compose.prod.yml docker-compose.prod.yml.backup
```

### Rollback to Nginx

1. Restore backed-up files
2. Update docker-compose to use nginx service
3. Rebuild and redeploy

## Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Routing Configuration](https://doc.traefik.io/traefik/routing/routers/)
- [Middlewares](https://doc.traefik.io/traefik/middlewares/overview/)
- [Dashboard](https://doc.traefik.io/traefik/operations/dashboard/)

