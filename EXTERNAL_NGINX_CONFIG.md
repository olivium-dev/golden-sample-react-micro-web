# External Nginx Configuration for Traefik

## Overview

If you have an external nginx running on your host (outside Docker), use this configuration to forward traffic to the Traefik container.

## Configuration

Add this to your external nginx configuration file (e.g., `/etc/nginx/sites-available/micro-frontend`):

```nginx
# Micro-Frontend Application with Traefik
server {
    listen 80;
    server_name yourdomain.com;  # Replace with your domain
    
    # Optional: Redirect to HTTPS
    # return 301 https://$server_name$request_uri;
}

# HTTPS Configuration (if using SSL)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com;
#     
#     ssl_certificate /path/to/cert.pem;
#     ssl_certificate_key /path/to/key.pem;
#     
#     # SSL Settings
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_prefer_server_ciphers off;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Forward all traffic to Traefik
    location / {
        proxy_pass http://127.0.0.1:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (for Traefik dashboard)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Optional: Traefik Dashboard
    location /traefik/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Basic Auth (optional additional layer)
        # auth_basic "Traefik Dashboard";
        # auth_basic_user_file /etc/nginx/.htpasswd;
    }
# }
```

## Setup Steps

### 1. Create Configuration File

```bash
sudo nano /etc/nginx/sites-available/micro-frontend
```

Paste the configuration above and modify:
- Replace `yourdomain.com` with your domain
- Update SSL certificate paths if using HTTPS
- Adjust proxy settings as needed

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/micro-frontend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Verify

```bash
# Check nginx status
sudo systemctl status nginx

# Test access
curl http://localhost/
curl http://localhost/api/health
```

## Port Mapping

| Service | Docker Port | External nginx | Public Access |
|---------|-------------|----------------|---------------|
| Traefik | 80 | Proxy → 80 | :80 or :443 |
| Traefik Dashboard | 8080 | Proxy → 8080 | /traefik/ |
| Backend API | 30001 | Via Traefik | /api/* |
| Container App | 80 | Via Traefik | / |
| Micro-frontends | 80 | Via Traefik | /users, /data, etc. |

## Advanced Configuration

### Load Balancing

If running multiple Traefik instances:

```nginx
upstream traefik_backend {
    least_conn;
    server 127.0.0.1:80 weight=1;
    server 127.0.0.1:8081 weight=1 backup;
}

server {
    location / {
        proxy_pass http://traefik_backend/;
        # ... rest of config
    }
}
```

### Caching

Enable caching for static assets:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://127.0.0.1:80;
    proxy_cache_valid 200 1d;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Rate Limiting

Add rate limiting:

```nginx
limit_req_zone $binary_remote_addr zone=app_limit:10m rate=10r/s;

server {
    location / {
        limit_req zone=app_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:80/;
        # ... rest of config
    }
}
```

### Security Headers

Add security headers:

```nginx
server {
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    location / {
        proxy_pass http://127.0.0.1:80/;
        # ... rest of config
    }
}
```

## Troubleshooting

### Cannot Connect to Traefik

**Check if Traefik is running:**
```bash
docker ps | grep traefik
```

**Check if port is accessible:**
```bash
curl http://localhost:80/
```

**Check nginx error log:**
```bash
sudo tail -f /var/log/nginx/error.log
```

### 502 Bad Gateway

**Causes:**
- Traefik container not running
- Wrong proxy_pass address
- Network connectivity issues

**Solutions:**
```bash
# Restart Traefik
docker restart micro-frontend-traefik

# Check nginx configuration
sudo nginx -t

# Review logs
docker logs micro-frontend-traefik
```

### WebSocket Connections Failing

**Ensure WebSocket headers are set:**
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## Multi-Application Setup

If hosting multiple applications:

```nginx
# Application 1: Micro-Frontend (via Traefik on port 80)
server {
    server_name app1.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:80/;
        # ... headers
    }
}

# Application 2: Another service (direct)
server {
    server_name app2.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000/;
        # ... headers
    }
}

# Application 3: Legacy application
server {
    server_name legacy.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8080/;
        # ... headers
    }
}
```

## Monitoring

### Access Logs

```nginx
server {
    access_log /var/log/nginx/micro-frontend-access.log combined;
    error_log /var/log/nginx/micro-frontend-error.log;
    
    # ... rest of config
}
```

View logs:
```bash
tail -f /var/log/nginx/micro-frontend-access.log
tail -f /var/log/nginx/micro-frontend-error.log
```

### Status Endpoint

```nginx
location /nginx-status {
    stub_status;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

Access: `curl http://localhost/nginx-status`

