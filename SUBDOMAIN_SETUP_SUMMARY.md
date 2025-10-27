# Subdomain Setup Summary

## 🎉 What We've Done

### 1. ✅ Nginx Configuration (External Repository)
**PR Created**: https://github.com/olivium-dev/server-cremati/pull/7

**Changes**:
- Added new nginx server block for `golden-sample.dev-creamat.fds-1.com`
- Configured SSL certificate paths (to be generated on server)
- Set up proxy to Traefik on `localhost:8090`
- Removed old `/golden-sample/` path-based routing
- Added WebSocket support for Module Federation

**Status**: ⏳ **Waiting for merge**

### 2. ✅ CORS Configuration Updated
**Commit**: `fec8a673` - Pushed to `main` branch

**Changes**:
- Updated `.github/workflows/deploy-with-cloudflare-tunnel.yml`
- Added CORS origins:
  - `https://golden-sample.dev-creamat.fds-1.com`
  - `https://dev-creamat.fds-1.com`
  - Existing: `http://192.168.2.73`, `http://localhost`, `http://vps-73.fds-1.com`
- Backend will accept API requests from subdomain

**Status**: ✅ **Complete** - Will be deployed on next workflow run

### 3. ✅ Automated Setup Script Created
**File**: `setup-subdomain-on-server.sh`

**Features**:
- Verifies DNS configuration is working
- Checks nginx configuration validity
- Generates Let's Encrypt SSL certificate
- Verifies certificate files exist
- Reloads nginx safely
- Tests HTTPS connection
- Checks Traefik container status
- Validates backend CORS configuration

**Status**: ✅ **Complete** - Ready to run on server

### 4. ✅ Documentation Created
**Files**:
- `SUBDOMAIN_DEPLOYMENT_PLAN.md` - Complete deployment guide
- `SUBDOMAIN_SETUP_SUMMARY.md` - This summary

**Status**: ✅ **Complete**

## 🚀 What You Need to Do

### Step 1: Configure DNS (Takes < 2 seconds)

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Select domain**: `dev-creamat.fds-1.com`
3. **Add DNS A Record**:
   - Type: `A`
   - Name: `golden-sample`
   - IPv4: `192.168.2.73`
   - Proxy: **🟠 Enabled (Orange Cloud)** ← Important for instant propagation!
   - TTL: Auto

4. **Verify DNS** (should work in < 2 seconds):
```bash
host golden-sample.dev-creamat.fds-1.com
```

### Step 2: Merge Nginx PR

**PR URL**: https://github.com/olivium-dev/server-cremati/pull/7

Just click "Merge" - the server-cremati pipeline will deploy nginx automatically.

### Step 3: Generate SSL Certificate on Server

**Option A: Run Automated Script (Recommended)**

```bash
# Copy script to server (you'll be prompted for password: P@ssw0rd768)
scp setup-subdomain-on-server.sh ec2-user@192.168.2.73:/tmp/

# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Run the script
cd /tmp
chmod +x setup-subdomain-on-server.sh
./setup-subdomain-on-server.sh
```

The script will guide you through the entire process and tell you if anything goes wrong.

**Option B: Manual Commands**

```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Generate SSL certificate
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com --non-interactive --agree-tos --email admin@fds-1.com

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4: Deploy Backend with Updated CORS

**Option A: Trigger GitHub Actions (Recommended)**

The workflow is already updated. Just run:
```bash
gh workflow run deploy-with-cloudflare-tunnel.yml
```

**Option B: Manual Backend Restart**

If you want to update the running backend immediately without full redeployment:
```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Go to deployment directory
cd /opt/micro-frontend-sample

# Edit docker-compose.deploy.yml
# Update backend CORS_ORIGINS to include: https://golden-sample.dev-creamat.fds-1.com

# Restart backend only
docker-compose restart backend
```

### Step 5: Test the Application

**Quick Test**:
```bash
# Should return 200 OK
curl -I https://golden-sample.dev-creamat.fds-1.com

# Should return health status
curl https://golden-sample.dev-creamat.fds-1.com/api/health
```

**Full Test**:
1. Open browser: https://golden-sample.dev-creamat.fds-1.com
2. Login: `admin@example.com` / `admin123`
3. Test all tabs (User Management, Data Grid, Analytics, Settings)
4. Check browser console (F12) for errors

## 📋 Checklist

Follow this in order:

- [ ] **DNS**: Add A record in Cloudflare (< 2 seconds)
- [ ] **DNS**: Verify with `host golden-sample.dev-creamat.fds-1.com`
- [ ] **Nginx**: Merge PR #7 in server-cremati
- [ ] **Nginx**: Wait for deployment pipeline to complete
- [ ] **SSL**: Copy `setup-subdomain-on-server.sh` to server
- [ ] **SSL**: Run the setup script on server
- [ ] **SSL**: Verify certificate exists and nginx reloaded
- [ ] **Backend**: Run GitHub Actions workflow OR manually restart backend
- [ ] **Test**: Verify HTTPS works: `curl -I https://golden-sample.dev-creamat.fds-1.com`
- [ ] **Test**: Verify API works: `curl https://golden-sample.dev-creamat.fds-1.com/api/health`
- [ ] **Test**: Open in browser and login
- [ ] **Test**: Verify all micro-frontends load
- [ ] **Test**: Check console for errors

## 🎯 Final URLs

Once everything is deployed:

- **Application**: https://golden-sample.dev-creamat.fds-1.com
- **API Health**: https://golden-sample.dev-creamat.fds-1.com/api/health
- **User Management**: https://golden-sample.dev-creamat.fds-1.com/ (click User Management tab)
- **Data Grid**: https://golden-sample.dev-creamat.fds-1.com/ (click Data Grid tab)
- **Analytics**: https://golden-sample.dev-creamat.fds-1.com/ (click Analytics tab)
- **Settings**: https://golden-sample.dev-creamat.fds-1.com/ (click Settings tab)

## ⚡ Quick Reference

### Server SSH
```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
```

### Demo Credentials
```
Email: admin@example.com
Password: admin123
```

### Important Notes

1. **DNS Propagation**: With Cloudflare proxy (orange cloud), propagation is < 2 seconds globally
2. **SSL Certificate**: MUST be generated on the server, NOT in the pipeline
3. **CORS**: Backend must be restarted or redeployed to pick up new CORS origins
4. **Traefik**: Already configured and running on port 8090
5. **Nginx**: External nginx handles SSL termination and proxies to Traefik

## 🔧 Troubleshooting

### DNS not working?
```bash
# Check if DNS record exists
dig golden-sample.dev-creamat.fds-1.com

# Should show Cloudflare IP (104.x.x.x or similar)
```

### SSL certificate fails?
```bash
# Check DNS first
host golden-sample.dev-creamat.fds-1.com

# Try manual generation
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com --force-renewal
```

### CORS errors in browser?
```bash
# Check backend CORS
docker-compose exec backend printenv CORS_ORIGINS

# Should include: https://golden-sample.dev-creamat.fds-1.com
```

### 502 Bad Gateway?
```bash
# Check if Traefik is running
docker-compose ps traefik

# Should show "Up" status
```

## 📞 Need Help?

If anything goes wrong:

1. **Check the full guide**: `SUBDOMAIN_DEPLOYMENT_PLAN.md`
2. **Run the setup script**: It will tell you exactly what's wrong
3. **Check logs**:
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Traefik: `docker-compose logs traefik`
   - Backend: `docker-compose logs backend`

## ✅ Success!

You'll know everything is working when:
- ✅ Browser loads https://golden-sample.dev-creamat.fds-1.com (no SSL warning)
- ✅ Login works with admin@example.com
- ✅ All 4 micro-frontends appear as tabs
- ✅ Clicking each tab loads the micro-frontend
- ✅ No errors in browser console
- ✅ API calls succeed

---

**Ready?** Start with Step 1: Configure DNS in Cloudflare! 🚀

