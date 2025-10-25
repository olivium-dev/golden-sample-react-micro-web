# CI/CD Deployment Guide

## 🚀 Automated Deployment Pipeline

This project uses **100% Docker and Docker Compose** for building and deploying all services. No Node.js or npm setup required in CI/CD!

## Architecture

### Services & Ports
- **Backend API**: Port 30001
- **Container App** (Main Host): Port 30002
- **User Management**: Port 30003
- **Data Grid**: Port 30004
- **Analytics**: Port 30005
- **Settings**: Port 30006
- **Nginx Reverse Proxy**: Ports 80, 443

### Docker Images
All services are built as Docker images and pushed to GitHub Container Registry (`ghcr.io`).

## Prerequisites

### 1. GitHub Secrets
Set these in **Settings → Secrets and variables → Actions**:

```bash
CREAMAT_SSH_PRIVATE_KEY              # SSH private key for VPS access
CREAMAT_CLOUDFLARE_SERVICE_TOKEN_ID  # Cloudflare service token ID
CREAMAT_CLOUDFLARE_SERVICE_TOKEN_SECRET # Cloudflare service token secret
JWT_SECRET_KEY                       # Production JWT secret
JWT_REFRESH_SECRET_KEY              # Production JWT refresh secret
```

### 2. Server Requirements
- Docker and Docker Compose installed
- SSH access via Cloudflare tunnel
- Ports 30001-30006, 80, 443 available

## How to Deploy

### Step 1: Go to GitHub Actions
```
https://github.com/olivium-dev/golden-sample-react-micro-web/actions
```

### Step 2: Run the Workflow
1. Click **"Deploy Micro-Frontend Sample to VPS"**
2. Click **"Run workflow"**
3. Fill in parameters:
   - **registry**: `ghcr.io`
   - **project_name**: `micro-frontend-sample`
   - **environment**: `production` or `staging`
   - **server**: `vps-73.fds-1.com`
   - **ssh_option**: `ec2-user` or `root`
   - **domain**: `fds-1.com`
4. Click **"Run workflow"**

### Step 3: Monitor Deployment
The pipeline will automatically:
1. ✅ Checkout code
2. ✅ Setup Docker Buildx
3. ✅ Login to container registry
4. ✅ Setup SSH via Cloudflare tunnel
5. ✅ Generate deployment configuration
6. ✅ Build all 7 Docker images (backend + 5 frontends + nginx)
7. ✅ Push images to registry
8. ✅ Create docker-compose deployment file
9. ✅ Deploy to VPS via SSH
10. ✅ Verify deployment health
11. ✅ Cleanup

## Pipeline Details

### Build Process
- **Pure Docker builds**: No npm/node setup in CI/CD
- **Multi-stage builds**: Optimized image sizes
- **Shared dependencies**: Proper shared-ui-lib integration
- **Platform targeting**: Linux AMD64 for VPS compatibility
- **Layer caching**: Fast rebuilds with Docker Buildx

### Deployment Process
- **Zero-downtime**: Graceful container shutdown
- **Health checks**: Automatic service verification
- **Docker Compose**: Simple orchestration
- **Environment variables**: Secure secret injection
- **Automatic cleanup**: Old images removed

## Access After Deployment

### Via Nginx Reverse Proxy (Recommended)
- **Main Application**: `http://fds-1.com`
- **API Documentation**: `http://fds-1.com:30001/docs`

### Direct Access
- **Backend API**: `http://fds-1.com:30001`
- **Container App**: `http://fds-1.com:30002`
- **User Management**: `http://fds-1.com:30003`
- **Data Grid**: `http://fds-1.com:30004`
- **Analytics**: `http://fds-1.com:30005`
- **Settings**: `http://fds-1.com:30006`

## Manual Operations

### SSH to Server
```bash
# Via Cloudflare tunnel (configured in pipeline)
ssh fds-server

# Or direct
ssh ec2-user@vps-73.fds-1.com
```

### Monitor Services
```bash
# View running containers
docker ps

# View logs
cd /opt/micro-frontend-sample
docker-compose logs -f

# Check specific service
docker-compose logs -f backend
docker-compose logs -f container

# Check service health
curl http://localhost:30001/health
curl http://localhost:30002/
```

### Manual Deployment
```bash
# SSH to server
ssh fds-server

# Navigate to deployment directory
cd /opt/micro-frontend-sample

# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# Check status
docker-compose ps
```

### Rollback
```bash
# SSH to server
ssh fds-server
cd /opt/micro-frontend-sample

# View available images
docker images | grep micro-frontend-sample

# Update docker-compose.yml to use previous tag
# Then restart
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Build Failures
- **Check Docker Buildx**: Ensure buildx is properly configured
- **Check Registry Access**: Verify GITHUB_TOKEN has package write permissions
- **Check Dockerfile paths**: All paths are relative to repository root

### Deployment Failures
- **SSH Connection**: Verify Cloudflare tunnel configuration
- **Server Access**: Check SSH key and user permissions
- **Port Conflicts**: Ensure ports 30001-30006 are available
- **Docker Compose**: Verify docker-compose is installed on server

### Runtime Issues
- **Check Logs**: `docker-compose logs -f [service]`
- **Check Health**: `docker-compose ps`
- **Check Network**: Verify containers can communicate
- **Check Environment**: Verify .env file on server

## Local Testing

### Test Docker Builds
```bash
# Build all services locally
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up

# Access at http://localhost:30002
```

### Test Individual Service
```bash
# Build specific service
docker-compose -f docker-compose.prod.yml build backend

# Start specific service
docker-compose -f docker-compose.prod.yml up backend
```

## Security Notes

1. **Secrets**: Never commit secrets to repository
2. **SSH Keys**: Store securely in GitHub Secrets
3. **JWT Secrets**: Use strong, unique secrets for production
4. **CORS**: Configure allowed origins properly
5. **Nginx**: Rate limiting and security headers enabled
6. **Health Checks**: Monitor service availability

## Performance

- **Build Time**: ~5-10 minutes for all services
- **Deployment Time**: ~2-3 minutes
- **Image Sizes**: Optimized with multi-stage builds
- **Startup Time**: ~30 seconds for all services

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Check server logs: `docker-compose logs`
3. Verify secrets are configured
4. Ensure server meets requirements
