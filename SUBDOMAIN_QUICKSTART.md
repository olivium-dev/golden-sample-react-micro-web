# 🚀 Subdomain Quick Start Guide

## TL;DR - 3 Steps to Deploy

### 1️⃣ Add DNS in Cloudflare (< 2 seconds)
Go to: https://dash.cloudflare.com → `dev-creamat.fds-1.com` → DNS

Add A Record:
- Name: `golden-sample`
- IPv4: `192.168.2.73`
- Proxy: 🟠 **Enabled**

### 2️⃣ Merge Nginx PR
https://github.com/olivium-dev/server-cremati/pull/7

### 3️⃣ Run Deployment Script
```bash
./deploy-subdomain.sh
```

That's it! The script handles everything else automatically.

---

## 📚 What Got Fixed

### The Problem
- Path-based routing (`/golden-sample/`) doesn't work with Module Federation
- Static assets have absolute paths (`/main.js` instead of `/golden-sample/main.js`)

### The Solution
- Use subdomain: `golden-sample.dev-creamat.fds-1.com`
- Nginx handles SSL termination
- Proxies to Traefik on port 8090
- Clean URLs without path prefixes

---

## �� Final URL

**Application**: https://golden-sample.dev-creamat.fds-1.com

**Demo Login**:
- Email: `admin@example.com`
- Password: `admin123`

---

## 📋 Detailed Steps (If you want to do it manually)

### Step 1: DNS Configuration

1. Login to Cloudflare: https://dash.cloudflare.com
2. Select `dev-creamat.fds-1.com`
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Fill in:
   - Type: `A`
   - Name: `golden-sample`
   - IPv4 address: `192.168.2.73`
   - Proxy status: 🟠 **Proxied** (must be enabled for instant propagation)
   - TTL: Auto
6. Click **Save**

**Verify**:
```bash
host golden-sample.dev-creamat.fds-1.com
# Should return Cloudflare IP (propagates in < 2 seconds)
```

### Step 2: Merge Nginx Configuration

**PR**: https://github.com/olivium-dev/server-cremati/pull/7

This PR adds:
- New nginx server block for subdomain
- SSL certificate paths (to be generated on server)
- Proxy configuration to Traefik

Just merge it - the server pipeline will deploy automatically.

### Step 3: Generate SSL Certificate

**Option A: Automated (Recommended)**

Run the deployment helper script:
```bash
./deploy-subdomain.sh
```

This script will:
- ✅ Verify DNS is working
- ✅ Copy setup script to server
- ✅ Run setup script (generates SSL, reloads nginx, tests everything)
- ✅ Test the final deployment

**Option B: Manual**

```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Copy and run setup script
# (from your local machine first)
scp setup-subdomain-on-server.sh ec2-user@192.168.2.73:/tmp/

# Then on server
chmod +x /tmp/setup-subdomain-on-server.sh
/tmp/setup-subdomain-on-server.sh
```

### Step 4: Deploy Backend (CORS Update)

The backend CORS has already been updated in the GitHub Actions workflow.

**Option A: Trigger workflow**
```bash
gh workflow run deploy-with-cloudflare-tunnel.yml
```

**Option B: Manual restart**
```bash
# SSH to server
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Restart backend
cd /opt/micro-frontend-sample
docker-compose restart backend
```

---

## ✅ Verification

### Quick Test
```bash
# Should return 200 OK
curl -I https://golden-sample.dev-creamat.fds-1.com

# Should return health status
curl https://golden-sample.dev-creamat.fds-1.com/api/health
```

### Full Test
1. Open: https://golden-sample.dev-creamat.fds-1.com
2. Login: `admin@example.com` / `admin123`
3. Click each tab:
   - ✅ User Management
   - ✅ Data Grid
   - ✅ Analytics
   - ✅ Settings
4. Open console (F12) and verify no errors

---

## 🔧 Troubleshooting

### DNS Not Working
```bash
# Check DNS
dig golden-sample.dev-creamat.fds-1.com

# Make sure Cloudflare proxy is enabled (orange cloud)
```

### SSL Certificate Fails
```bash
# SSH to server and check
sshpass -p 'P@ssw0rd768' ssh ec2-user@192.168.2.73

# Try manual generation
sudo certbot certonly --nginx -d golden-sample.dev-creamat.fds-1.com --force-renewal
```

### CORS Errors
```bash
# Check backend CORS
docker-compose exec backend printenv CORS_ORIGINS

# Should include: https://golden-sample.dev-creamat.fds-1.com
```

---

## 📞 Files Reference

- `deploy-subdomain.sh` - One-click deployment helper
- `setup-subdomain-on-server.sh` - Server-side setup script
- `SUBDOMAIN_DEPLOYMENT_PLAN.md` - Detailed deployment guide
- `SUBDOMAIN_SETUP_SUMMARY.md` - Complete summary

---

## 🎉 Success Criteria

You're done when:
- ✅ https://golden-sample.dev-creamat.fds-1.com loads without SSL warning
- ✅ Login works
- ✅ All 4 micro-frontends load
- ✅ No console errors
- ✅ API calls succeed

**Enjoy your micro-frontend application! 🚀**
