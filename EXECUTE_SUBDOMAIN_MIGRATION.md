# Execute Subdomain Migration - Action Required

## Status: Ready for Execution ✅

All technical preparations are complete. You need to perform 3 manual steps to complete the migration.

---

## Step 1: Configure DNS in Cloudflare ⏳

**Time Required**: 2 minutes  
**Action Required**: Manual configuration in Cloudflare dashboard

### Instructions:

1. Open: https://dash.cloudflare.com
2. Select domain: **dev-creamat.fds-1.com**
3. Navigate to: **DNS** → **Records**
4. Click: **Add record**
5. Configure:
   - **Type**: `A`
   - **Name**: `golden-sample`
   - **IPv4 address**: `192.168.2.73`
   - **Proxy status**: 🟠 **Proxied** (MUST enable orange cloud!)
   - **TTL**: `Auto`
6. Click: **Save**

### Verification:

```bash
host golden-sample.dev-creamat.fds-1.com
```

**Expected Output**: Should return a Cloudflare IP address (104.x.x.x or similar)  
**Propagation Time**: < 2 seconds with Cloudflare proxy enabled

---

## Step 2: Merge Nginx Configuration PR ⏳

**Time Required**: 1 minute  
**Action Required**: Merge PR in GitHub

### Instructions:

1. Open PR: https://github.com/olivium-dev/server-cremati/pull/7
2. Review the changes (nginx configuration for subdomain)
3. Click: **Merge pull request**
4. Confirm merge
5. Wait for server-cremati pipeline to deploy (~2-3 minutes)

### Verification:

```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73 'sudo nginx -t'
```

**Expected Output**: 
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## Step 3: Run Deployment Script ⏳

**Time Required**: 5 minutes  
**Action Required**: Run local script (automated)

### Instructions:

```bash
cd /Users/oudaykhaled/Desktop/cremat-cms/golden-sample-react-micro-web
./deploy-subdomain.sh
```

### What This Script Does:

1. ✅ Verifies DNS is configured and resolving
2. ✅ Copies setup script to server via SCP
3. ✅ Makes script executable on server
4. ✅ Runs server setup script which:
   - Validates DNS resolution
   - Checks nginx configuration syntax
   - Generates Let's Encrypt SSL certificate
   - Verifies certificate files exist
   - Reloads nginx safely
   - Tests HTTPS connection
   - Checks Traefik container status
   - Validates backend CORS configuration
5. ✅ Tests deployment from your local machine

### Expected Output:

The script will guide you through each step and show:
- DNS verification results
- Script copy status
- Server setup progress (interactive)
- Final deployment test results

**Note**: You may be prompted for the server password: `P@ssw0rd768`

---

## Step 4: Verify in Browser ⏳

**Time Required**: 2 minutes  
**Action Required**: Manual testing

### Instructions:

1. Open browser and navigate to: https://golden-sample.dev-creamat.fds-1.com
2. Verify: No SSL warning appears
3. Login with demo credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
4. Test all micro-frontend tabs:
   - Click **User Management** tab
   - Click **Data Grid** tab
   - Click **Analytics** tab
   - Click **Settings** tab
5. Open browser DevTools (F12) → Console tab
6. Verify: No errors related to CORS, Module Federation, or API calls

### Success Indicators:

✅ Application loads without SSL warnings  
✅ Login works correctly  
✅ All 4 tabs display content  
✅ Navigation between tabs is smooth  
✅ No console errors  
✅ API calls succeed  

---

## Step 5: Backend CORS Update (Optional) 🔄

**Time Required**: 10 minutes  
**Action Required**: Choose one option

The CORS configuration is already updated in the workflow. Choose one:

### Option A: Full Redeployment (Recommended)

Triggers complete redeployment with updated CORS:

```bash
gh workflow run deploy-with-cloudflare-tunnel.yml
```

Monitor deployment:
```bash
gh run list --workflow=deploy-with-cloudflare-tunnel.yml --limit 1
```

### Option B: Quick Backend Restart

Only restarts backend without full redeployment:

```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73 << 'EOF'
cd /opt/micro-frontend-sample
docker-compose restart backend
docker-compose logs backend --tail=20
EOF
```

**Note**: Option A is recommended for production. Option B is faster for testing.

---

## Quick Command Reference

### Check DNS:
```bash
host golden-sample.dev-creamat.fds-1.com
dig golden-sample.dev-creamat.fds-1.com
```

### Test HTTPS:
```bash
curl -I https://golden-sample.dev-creamat.fds-1.com
```

### Test API:
```bash
curl https://golden-sample.dev-creamat.fds-1.com/api/health
```

### Test Module Federation:
```bash
curl -I https://golden-sample.dev-creamat.fds-1.com/users/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/data/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/analytics/remoteEntry.js
curl -I https://golden-sample.dev-creamat.fds-1.com/settings/remoteEntry.js
```

### SSH to Server:
```bash
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
```

### Check Server Services:
```bash
# On server
cd /opt/micro-frontend-sample
docker-compose ps
docker-compose logs backend --tail=50
docker-compose logs traefik --tail=50
```

---

## Troubleshooting

### Issue: DNS not resolving

**Solution**:
```bash
# Check DNS propagation
dig golden-sample.dev-creamat.fds-1.com

# Verify in Cloudflare dashboard that:
# - Proxy status is enabled (orange cloud icon)
# - Record type is A
# - Points to 192.168.2.73
```

### Issue: SSL certificate generation fails

**Cause**: DNS not properly configured or nginx not deployed

**Solution**:
```bash
# Verify DNS first
host golden-sample.dev-creamat.fds-1.com

# Check nginx is deployed
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73 'sudo nginx -t'

# Try manual certificate generation
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com --force-renewal
```

### Issue: CORS errors in browser console

**Solution**:
```bash
# Check backend CORS configuration
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
cd /opt/micro-frontend-sample
docker-compose exec backend printenv CORS_ORIGINS

# Should include: https://golden-sample.dev-creamat.fds-1.com
# If not, restart backend or trigger full redeployment
```

### Issue: 502 Bad Gateway

**Cause**: Traefik not running or nginx can't reach Traefik

**Solution**:
```bash
# Check if Traefik is running
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
cd /opt/micro-frontend-sample
docker-compose ps traefik

# Should show "Up" status
# If not, restart Traefik
docker-compose restart traefik

# Check Traefik logs
docker-compose logs traefik --tail=50
```

### Issue: Module Federation fails to load

**Solution**:
```bash
# Test remote entry files
curl -I https://golden-sample.dev-creamat.fds-1.com/users/remoteEntry.js

# Check Traefik routing
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73
cd /opt/micro-frontend-sample
docker-compose logs traefik | grep remoteEntry
```

---

## Success Criteria Checklist

Before considering the migration complete, verify:

- [ ] DNS resolves to Cloudflare IP
- [ ] HTTPS connection returns 200 OK
- [ ] No SSL warning in browser
- [ ] Login works with demo credentials
- [ ] User Management tab loads
- [ ] Data Grid tab loads
- [ ] Analytics tab loads
- [ ] Settings tab loads
- [ ] No CORS errors in console
- [ ] No Module Federation errors in console
- [ ] API calls succeed (check Network tab)
- [ ] Navigation between tabs is smooth

---

## Final URLs

After successful migration:

- **Application**: https://golden-sample.dev-creamat.fds-1.com
- **API Health**: https://golden-sample.dev-creamat.fds-1.com/api/health
- **Traefik Dashboard**: http://192.168.2.73:8080 (internal only)

---

## Rollback Procedure

If critical issues occur:

1. **Remove DNS record** from Cloudflare dashboard
2. **Revert nginx PR** in server-cremati repository
3. The subdomain becomes inaccessible
4. Main system remains unaffected

**Note**: The old path-based URL (`https://dev-creamat.fds-1.com/golden-sample/`) still has the original issues but can be used as fallback.

---

## Estimated Timeline

- **Step 1** (DNS): 2 minutes
- **Step 2** (Nginx PR): 1 minute + 2-3 minutes deployment
- **Step 3** (SSL Setup): 5 minutes
- **Step 4** (Verification): 2 minutes
- **Step 5** (Optional CORS): 10 minutes

**Total**: ~12 minutes (or ~22 minutes with optional CORS redeployment)

---

## Ready to Execute?

Start with **Step 1: Configure DNS in Cloudflare**

All scripts and documentation are in place:
- ✅ `deploy-subdomain.sh` - Ready to run
- ✅ `setup-subdomain-on-server.sh` - Ready on local machine
- ✅ CORS configuration - Already updated
- ✅ Nginx PR - Ready to merge
- ✅ Documentation - Complete

**Next Action**: Add DNS record in Cloudflare dashboard

