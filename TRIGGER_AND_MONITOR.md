# 🚀 Trigger and Monitor CI/CD Pipeline

## Step 1: Trigger the Pipeline

### Option A: Via GitHub Web UI (Recommended)
1. Go to: https://github.com/olivium-dev/golden-sample-react-micro-web/actions
2. Click on **"Deploy Micro-Frontend Sample to VPS"** workflow
3. Click **"Run workflow"** button (top right)
4. Fill in the parameters:
   ```
   registry: ghcr.io
   project_name: micro-frontend-sample
   environment: production
   server: vps-73.fds-1.com
   ssh_option: ec2-user
   domain: fds-1.com
   ```
5. Select branch: **cicd**
6. Click **"Run workflow"**

### Option B: Via GitHub CLI
```bash
gh workflow run "Deploy Micro-Frontend Sample to VPS" \
  --repo olivium-dev/golden-sample-react-micro-web \
  --ref cicd \
  -f registry=ghcr.io \
  -f project_name=micro-frontend-sample \
  -f environment=production \
  -f server=vps-73.fds-1.com \
  -f ssh_option=ec2-user \
  -f domain=fds-1.com
```

## Step 2: Monitor the Pipeline

### Automated Monitoring
Run the monitoring script:
```bash
./monitor-pipeline.sh
```

This will:
- Check pipeline status every 60 seconds
- Show current jobs and their status
- Display logs if pipeline fails
- Exit with success message when pipeline completes

### Manual Monitoring
Watch the pipeline in real-time:
```bash
# List recent runs
gh run list --repo olivium-dev/golden-sample-react-micro-web --branch cicd

# Watch specific run (replace RUN_ID)
gh run watch RUN_ID --repo olivium-dev/golden-sample-react-micro-web

# View logs
gh run view RUN_ID --repo olivium-dev/golden-sample-react-micro-web --log
```

### Via Web Browser
Watch live: https://github.com/olivium-dev/golden-sample-react-micro-web/actions

## Step 3: If Pipeline Fails

### Get Failure Details
```bash
# Get latest failed run
gh run list --repo olivium-dev/golden-sample-react-micro-web --branch cicd --status failure --limit 1

# View failed logs
gh run view --repo olivium-dev/golden-sample-react-micro-web --log-failed
```

### Common Issues and Fixes

#### 1. Missing Secrets
**Error**: `secret not found` or `authentication failed`

**Fix**: Add required secrets in GitHub:
1. Go to: https://github.com/olivium-dev/golden-sample-react-micro-web/settings/secrets/actions
2. Add:
   - `CREAMAT_SSH_PRIVATE_KEY`
   - `CREAMAT_CLOUDFLARE_SERVICE_TOKEN_ID`
   - `CREAMAT_CLOUDFLARE_SERVICE_TOKEN_SECRET`
   - `JWT_SECRET_KEY`
   - `JWT_REFRESH_SECRET_KEY`

#### 2. Docker Build Fails
**Error**: `failed to solve` or `COPY failed`

**Fix**: Check Dockerfile paths and context
```bash
# Test build locally
docker build -f frontend/container/Dockerfile -t test-container .
```

#### 3. SSH Connection Fails
**Error**: `connection refused` or `permission denied`

**Fix**: 
- Verify SSH key is correct
- Check Cloudflare tunnel configuration
- Test SSH manually: `ssh ec2-user@vps-73.fds-1.com`

#### 4. Registry Push Fails
**Error**: `denied: permission_denied` or `unauthorized`

**Fix**:
- Verify `GITHUB_TOKEN` has package write permissions
- Check repository settings → Actions → General → Workflow permissions
- Enable "Read and write permissions"

## Step 4: Iterate and Fix

### Automated Fix Workflow
1. Pipeline fails → Get logs
2. Identify issue
3. Fix code locally
4. Commit and push
5. Re-trigger pipeline
6. Repeat until success

### Quick Fix Commands
```bash
# Make changes
git add .
git commit -m "fix: [description of fix]"
git push origin cicd

# Re-trigger pipeline
gh workflow run "Deploy Micro-Frontend Sample to VPS" \
  --repo olivium-dev/golden-sample-react-micro-web \
  --ref cicd \
  -f registry=ghcr.io \
  -f project_name=micro-frontend-sample \
  -f environment=production \
  -f server=vps-73.fds-1.com \
  -f ssh_option=ec2-user \
  -f domain=fds-1.com
```

## Expected Timeline

### Successful Run
```
✅ Checkout repository          (~10s)
✅ Setup Docker Buildx          (~30s)
✅ Login to registry            (~5s)
✅ Setup SSH via Cloudflare     (~20s)
✅ Generate configuration       (~5s)
✅ Build and push images        (~10-15 minutes)
   - Backend                    (~2 min)
   - Container                  (~2-3 min)
   - User Management            (~2-3 min)
   - Data Grid                  (~2-3 min)
   - Analytics                  (~2-3 min)
   - Settings                   (~2-3 min)
   - Nginx                      (~30s)
✅ Create docker-compose file   (~5s)
✅ Deploy to VPS                (~2-3 minutes)
✅ Verify deployment            (~30s)
✅ Cleanup                      (~10s)

Total: ~15-20 minutes
```

## Success Indicators

### Pipeline Success
- All jobs show green checkmarks ✅
- Deployment verification passes
- Health checks return 200 OK

### Application Success
- Backend API: http://fds-1.com:30001/health returns `{"status":"healthy"}`
- Container App: http://fds-1.com:30002 loads successfully
- All micro-frontends accessible via their ports

## Troubleshooting Commands

```bash
# Check if services are running on VPS
ssh ec2-user@vps-73.fds-1.com "docker ps"

# Check logs on VPS
ssh ec2-user@vps-73.fds-1.com "cd /opt/micro-frontend-sample && docker-compose logs"

# Restart services on VPS
ssh ec2-user@vps-73.fds-1.com "cd /opt/micro-frontend-sample && docker-compose restart"

# Check disk space on VPS
ssh ec2-user@vps-73.fds-1.com "df -h"

# Clean up old images on VPS
ssh ec2-user@vps-73.fds-1.com "docker system prune -af"
```

## Need Help?

1. Check GitHub Actions logs
2. Check this guide for common issues
3. Test Docker builds locally
4. Verify all secrets are set
5. Check VPS server status and logs
