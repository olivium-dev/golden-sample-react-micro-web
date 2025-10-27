#!/bin/bash
# Setup script to run on the VPS server (192.168.2.73)
# This script configures SSL for golden-sample.dev-creamat.fds-1.com

set -e

SUBDOMAIN="golden-sample.dev-creamat.fds-1.com"
SERVER_IP="192.168.2.73"

echo "=================================================="
echo "🚀 Subdomain Setup: $SUBDOMAIN"
echo "=================================================="

# Step 1: Verify DNS
echo ""
echo "📋 Step 1: Verifying DNS configuration..."
DNS_CHECK=$(host $SUBDOMAIN 2>&1 || true)
if echo "$DNS_CHECK" | grep -q "not found"; then
    echo "❌ DNS is NOT configured yet!"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "    1. Go to Cloudflare Dashboard: https://dash.cloudflare.com"
    echo "    2. Select domain: dev-creamat.fds-1.com"
    echo "    3. Add DNS A Record:"
    echo "       - Type: A"
    echo "       - Name: golden-sample"
    echo "       - IPv4: $SERVER_IP"
    echo "       - Proxy: Enabled (Orange Cloud)"
    echo "    4. Wait < 2 seconds for propagation"
    echo "    5. Re-run this script"
    echo ""
    exit 1
else
    echo "✅ DNS is configured correctly"
    echo "   $DNS_CHECK"
fi

# Step 2: Check if nginx PR is merged
echo ""
echo "📋 Step 2: Checking nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    sudo nginx -t
    exit 1
fi

# Step 3: Check if SSL certificate already exists
echo ""
echo "📋 Step 3: Checking SSL certificate..."
if [ -d "/etc/letsencrypt/live/$SUBDOMAIN" ]; then
    echo "⚠️  SSL certificate already exists"
    echo "   Location: /etc/letsencrypt/live/$SUBDOMAIN"
    read -p "   Do you want to renew it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Renewing certificate..."
        sudo certbot certonly --nginx -d $SUBDOMAIN --force-renewal --non-interactive --agree-tos --email admin@fds-1.com
    else
        echo "✅ Using existing certificate"
    fi
else
    echo "🔒 Generating new SSL certificate..."
    sudo certbot certonly --nginx -d $SUBDOMAIN --non-interactive --agree-tos --email admin@fds-1.com
fi

# Step 4: Verify certificate files
echo ""
echo "📋 Step 4: Verifying certificate files..."
if [ -f "/etc/letsencrypt/live/$SUBDOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$SUBDOMAIN/privkey.pem" ]; then
    echo "✅ Certificate files exist:"
    sudo ls -lah /etc/letsencrypt/live/$SUBDOMAIN/ | grep -E "fullchain|privkey"
else
    echo "❌ Certificate files are missing!"
    exit 1
fi

# Step 5: Reload nginx
echo ""
echo "📋 Step 5: Reloading nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded successfully"

# Step 6: Test HTTPS
echo ""
echo "📋 Step 6: Testing HTTPS connection..."
sleep 2
if curl -I https://$SUBDOMAIN 2>&1 | grep -q "200 OK\|301 Moved\|302 Found"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS test returned unexpected response"
    curl -I https://$SUBDOMAIN 2>&1 | head -5
fi

# Step 7: Check Traefik status
echo ""
echo "📋 Step 7: Checking Traefik status..."
cd /opt/micro-frontend-sample
if docker-compose ps | grep -q "traefik.*Up"; then
    echo "✅ Traefik is running"
    TRAEFIK_PORT=$(docker-compose ps traefik | grep -oP '0.0.0.0:\K[0-9]+' | head -1)
    echo "   Dashboard: http://localhost:8080"
    echo "   HTTP Port: $TRAEFIK_PORT"
else
    echo "⚠️  Traefik is not running or not found"
    docker-compose ps
fi

# Step 8: Update backend CORS if needed
echo ""
echo "📋 Step 8: Checking backend CORS configuration..."
CURRENT_CORS=$(docker-compose exec -T backend printenv CORS_ORIGINS 2>/dev/null || echo "")
if echo "$CURRENT_CORS" | grep -q "golden-sample.dev-creamat.fds-1.com"; then
    echo "✅ Backend CORS already includes subdomain"
else
    echo "⚠️  Backend CORS needs update"
    echo "   Current: $CURRENT_CORS"
    echo ""
    echo "   ACTION REQUIRED:"
    echo "   1. Re-run GitHub Actions deployment workflow"
    echo "   2. Or manually update docker-compose.deploy.yml and restart backend"
fi

# Final summary
echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "🌐 Application URLs:"
echo "   - Public HTTPS: https://$SUBDOMAIN"
echo "   - API Health:   https://$SUBDOMAIN/api/health"
echo "   - Traefik:      http://localhost:8080"
echo ""
echo "🧪 Testing Commands:"
echo "   curl -I https://$SUBDOMAIN"
echo "   curl https://$SUBDOMAIN/api/health"
echo ""
echo "📝 Next Steps:"
echo "   1. Open browser: https://$SUBDOMAIN"
echo "   2. Login with: admin@example.com / admin123"
echo "   3. Test all micro-frontends load correctly"
echo "   4. Check browser console for errors"
echo ""

