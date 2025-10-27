# Subdomain Deployment Plan for golden-sample.dev-creamat.fds-1.com

## 🎯 Objective
Deploy the micro-frontend application on a dedicated subdomain with SSL support and proper CORS configuration.

## ✅ Completed Steps

### 1. Nginx Configuration PR Created ✓
- **PR URL**: https://github.com/olivium-dev/server-cremati/pull/7
- **Changes**: Added nginx server block for `golden-sample.dev-creamat.fds-1.com`
- **Action**: Merge this PR to deploy nginx configuration

### 2. CORS Configuration Updated ✓
- **Commit**: `fec8a673` - "feat: add subdomain support with CORS configuration"
- **Changes**: 
  - Updated GitHub Actions workflow with new CORS origins
  - Includes: `https://golden-sample.dev-creamat.fds-1.com`
  - Backend will accept requests from subdomain
- **Status**: Pushed to main, workflow will deploy on next run

### 3. Automated Setup Script Created ✓
- **File**: `setup-subdomain-on-server.sh`
- **Purpose**: Automates DNS verification and SSL certificate generation
- **Features**:
  - Verifies DNS configuration
  - Generates Let's Encrypt SSL certificate
  - Tests nginx configuration
  - Validates HTTPS connection
  - Checks Traefik status
  - Verifies backend CORS

## 📋 Remaining Steps

### Step 1: Configure DNS in Cloudflare (< 2 seconds) ⏳

**Action Required**: Add DNS A record

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Select Domain**: `dev-creamat.fds-1.com`
3. **Navigate to**: DNS → Records
4. **Add Record**:
   ```
   Type:       A
   Name:       golden-sample
   IPv4:       192.168.2.73
   Proxy:      🟠 Proxied (Enabled)
   TTL:        Auto
   ```
5. **Click**: Save

**Expected Result**: DNS propagates in < 2 seconds due to Cloudflare proxy

**Verify DNS**:
```bash
host golden-sample.dev-creamat.fds-1.com
# Should return: golden-sample.dev-creamat.fds-1.com has address 104.xxx.xxx.xxx (Cloudflare IP)
```

### Step 2: Merge Nginx Configuration PR ⏳

**PR URL**: https://github.com/olivium-dev/server-cremati/pull/7

**Actions**:
1. Review the PR
2. Merge to `main` branch
3. Wait for nginx deployment (automated via server-cremati pipeline)

**Verify Nginx Config Deployed**:
```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73 'sudo nginx -t'
```

### Step 3: Generate SSL Certificate on Server ⏳

**Important**: ⚠️ SSL certificate MUST be generated on the server, NOT in the deployment pipeline.

**Method 1: Using Automated Script (Recommended)**

1. **Copy script to server**:
```bash
scp -o "StrictHostKeyChecking=no" setup-subdomain-on-server.sh ec2-user@192.168.2.73:/tmp/
# Password: P@ssw0rd768
```

2. **SSH to server**:
```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
```

3. **Run setup script**:
```bash
cd /tmp
chmod +x setup-subdomain-on-server.sh
./setup-subdomain-on-server.sh
```

The script will:
- ✓ Verify DNS is configured
- ✓ Check nginx configuration
- ✓ Generate SSL certificate with certbot
- ✓ Verify certificate files exist
- ✓ Reload nginx
- ✓ Test HTTPS connection
- ✓ Check Traefik status
- ✓ Verify backend CORS

**Method 2: Manual SSL Generation**

```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Generate certificate
sudo certbot certonly --nginx \
  -d golden-sample.dev-creamat.fds-1.com \
  --non-interactive \
  --agree-tos \
  --email admin@fds-1.com

# Test nginx
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify certificate
sudo ls -la /etc/letsencrypt/live/golden-sample.dev-creamat.fds-1.com/
```

### Step 4: Deploy Updated Backend with CORS ⏳

**Option A: Trigger Deployment Workflow (Recommended)**

The GitHub Actions workflow has been updated with the new CORS configuration. Simply trigger a deployment:

```bash
gh workflow run deploy-with-cloudflare-tunnel.yml
```

**Option B: Manual Update on Server**

```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Update running backend
cd /opt/micro-frontend-sample

# Check current CORS
docker-compose exec backend printenv CORS_ORIGINS

# Edit docker-compose.deploy.yml and add:
# CORS_ORIGINS: "http://192.168.2.73,http://localhost,http://vps-73.fds-1.com,https://golden-sample.dev-creamat.fds-1.com,https://dev-creamat.fds-1.com"

# Restart backend
docker-compose restart backend

# Verify
docker-compose exec backend printenv CORS_ORIGINS
```

### Step 5: Test the Application ⏳

**Automated Testing**:
```bash
# Test HTTPS
curl -I https://golden-sample.dev-creamat.fds-1.com

# Test API
curl https://golden-sample.dev-creamat.fds-1.com/api/health

# Test Module Federation remote entries
curl -I https://golden-sample.dev-creamat.fds-1.com/users/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/data/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/analytics/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/settings/remoteEntry.js
```

**Manual Testing**:
1. Open browser: https://golden-sample.dev-creamat.fds-1.com
2. Login with: `admin@example.com` / `admin123`
3. Navigate through all tabs:
   - User Management
   - Data Grid
   - Analytics
   - Settings
4. Open browser console (F12)
5. Verify no errors related to:
   - CORS
   - Module Federation
   - SSL/HTTPS
   - API requests

## 🔍 Verification Checklist

- [ ] DNS A record added in Cloudflare
- [ ] DNS resolves: `host golden-sample.dev-creamat.fds-1.com`
- [ ] Nginx PR merged and deployed
- [ ] SSL certificate generated on server
- [ ] Certificate files exist: `/etc/letsencrypt/live/golden-sample.dev-creamat.fds-1.com/`
- [ ] Nginx reloaded without errors
- [ ] HTTPS responds with 200 OK
- [ ] Backend CORS includes subdomain
- [ ] Application loads in browser
- [ ] Login works correctly
- [ ] All micro-frontends load (User, Data, Analytics, Settings)
- [ ] No console errors
- [ ] Module Federation remoteEntry.js files load
- [ ] API calls succeed without CORS errors

## 📊 Expected Outcomes

### URLs
- **Application**: https://golden-sample.dev-creamat.fds-1.com
- **API Health**: https://golden-sample.dev-creamat.fds-1.com/api/health
- **Traefik Dashboard**: http://192.168.2.73:8080 (internal only)

### Architecture
```
Internet
   |
   v
Cloudflare (DNS + Proxy)
   |
   v
Nginx (192.168.2.73:443)
   |-- SSL Termination
   |-- Server: golden-sample.dev-creamat.fds-1.com
   |
   v
Traefik (localhost:8090)
   |-- Path-based routing
   |-- /api        → Backend (port 30001)
   |-- /           → Container (port 80)
   |-- /users      → User Management MFE
   |-- /data       → Data Grid MFE
   |-- /analytics  → Analytics MFE
   |-- /settings   → Settings MFE
   |
   v
Docker Containers (micro-frontend-sample)
```

### Security
- ✅ HTTPS with Let's Encrypt SSL
- ✅ Cloudflare WAF and DDoS protection
- ✅ Strict CORS policy
- ✅ Security headers (HSTS, X-Frame-Options, CSP)

## 🚨 Troubleshooting

### Issue: DNS not resolving
```bash
# Check DNS
dig golden-sample.dev-creamat.fds-1.com

# Verify in Cloudflare dashboard
# Ensure proxy is enabled (orange cloud)
```

### Issue: SSL certificate generation fails
```bash
# Check DNS first
host golden-sample.dev-creamat.fds-1.com

# Check nginx config
sudo nginx -t

# Check certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Try manual generation
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com --force-renewal
```

### Issue: CORS errors in browser
```bash
# Check backend CORS config
docker-compose exec backend printenv CORS_ORIGINS

# Should include: https://golden-sample.dev-creamat.fds-1.com

# Update if needed and restart
docker-compose restart backend
```

### Issue: Module Federation fails to load
```bash
# Check Traefik routing
curl -I https://golden-sample.dev-creamat.fds-1.com/users/remoteEntry.js

# Check Traefik logs
docker-compose logs traefik --tail=50

# Verify nginx proxy headers
curl -v https://golden-sample.dev-creamat.fds-1.com/
```

### Issue: 502 Bad Gateway
```bash
# Check if Traefik is running
docker-compose ps traefik

# Check Traefik logs
docker-compose logs traefik

# Verify port 8090 is accessible
curl http://localhost:8090

# Check nginx upstream
sudo tail -f /var/log/nginx/error.log
```

## 📞 Quick Commands Reference

### DNS
```bash
# Check DNS
host golden-sample.dev-creamat.fds-1.com
dig golden-sample.dev-creamat.fds-1.com
```

### SSH
```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Copy files to server
scp -o "StrictHostKeyChecking=no" file.sh ec2-user@192.168.2.73:/tmp/
```

### SSL
```bash
# Generate certificate
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com

# Check certificate
sudo ls -la /etc/letsencrypt/live/golden-sample.dev-creamat.fds-1.com/

# Renew certificate
sudo certbot renew --force-renewal
```

### Nginx
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### Docker
```bash
# Check services
cd /opt/micro-frontend-sample
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f traefik

# Restart service
docker-compose restart backend
```

### Testing
```bash
# Test HTTPS
curl -I https://golden-sample.dev-creamat.fds-1.com

# Test API
curl https://golden-sample.dev-creamat.fds-1.com/api/health

# Test remote entries
curl -I https://golden-sample.dev-creamat.fds-1.com/users/remoteEntry.js
```

## 📝 Next Steps After Deployment

1. **Monitor application performance**
   - Check response times
   - Monitor error rates
   - Track user sessions

2. **Set up monitoring alerts**
   - SSL certificate expiration (30 days before)
   - Service health checks
   - CORS errors

3. **Update documentation**
   - Add subdomain to project README
   - Update API documentation
   - Document login credentials

4. **Security hardening**
   - Review nginx security headers
   - Configure rate limiting
   - Set up fail2ban for SSH

5. **Backup SSL certificates**
   - Create backup of `/etc/letsencrypt/`
   - Document renewal process
   - Set up auto-renewal monitoring

## ✅ Success Criteria

The deployment is considered successful when:
1. ✅ Application loads at https://golden-sample.dev-creamat.fds-1.com
2. ✅ Valid SSL certificate (no browser warnings)
3. ✅ Login works with demo credentials
4. ✅ All 4 micro-frontends load correctly
5. ✅ No console errors in browser
6. ✅ API calls succeed without CORS errors
7. ✅ Module Federation loads remote entries
8. ✅ Navigation between tabs works smoothly
9. ✅ Traefik routing works correctly
10. ✅ Backend responds to API requests

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Author**: AI Assistant  
**Project**: Micro-Frontend Golden Sample

