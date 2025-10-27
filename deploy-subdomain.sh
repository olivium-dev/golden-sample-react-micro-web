#!/bin/bash
# Quick deployment script for subdomain setup
# This script copies the setup script to the server and runs it

set -e

SERVER_IP="192.168.2.73"
SERVER_USER="ec2-user"
SERVER_PASS="P@ssw0rd768"
SUBDOMAIN="golden-sample.dev-creamat.fds-1.com"

echo "=================================================="
echo "🚀 Subdomain Deployment Helper"
echo "=================================================="
echo ""
echo "This script will:"
echo "  1. Check DNS configuration"
echo "  2. Copy setup script to server"
echo "  3. Run setup script on server (interactive)"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is not installed"
    echo ""
    echo "Install it first:"
    echo "  macOS:  brew install sshpass"
    echo "  Ubuntu: sudo apt-get install sshpass"
    echo ""
    exit 1
fi

# Step 1: Check DNS
echo "📋 Step 1: Checking DNS configuration..."
DNS_CHECK=$(host $SUBDOMAIN 2>&1 || true)
if echo "$DNS_CHECK" | grep -q "not found"; then
    echo "❌ DNS is NOT configured yet!"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "    Go to Cloudflare Dashboard and add DNS A record:"
    echo "    https://dash.cloudflare.com"
    echo ""
    echo "    Type:     A"
    echo "    Name:     golden-sample"
    echo "    IPv4:     $SERVER_IP"
    echo "    Proxy:    🟠 Enabled (Orange Cloud)"
    echo "    TTL:      Auto"
    echo ""
    read -p "Press Enter after configuring DNS to continue..." -r
    echo ""
    
    # Check again
    DNS_CHECK=$(host $SUBDOMAIN 2>&1 || true)
    if echo "$DNS_CHECK" | grep -q "not found"; then
        echo "❌ DNS still not configured. Exiting."
        exit 1
    fi
fi

echo "✅ DNS is configured:"
echo "   $DNS_CHECK"
echo ""

# Step 2: Check if setup script exists
if [ ! -f "setup-subdomain-on-server.sh" ]; then
    echo "❌ setup-subdomain-on-server.sh not found in current directory"
    exit 1
fi

# Step 3: Copy script to server
echo "📋 Step 2: Copying setup script to server..."
sshpass -p "$SERVER_PASS" scp -o "StrictHostKeyChecking=no" \
    setup-subdomain-on-server.sh \
    $SERVER_USER@$SERVER_IP:/tmp/
echo "✅ Script copied to server:/tmp/setup-subdomain-on-server.sh"
echo ""

# Step 4: Make script executable on server
echo "📋 Step 3: Making script executable..."
sshpass -p "$SERVER_PASS" ssh -o "StrictHostKeyChecking=no" \
    $SERVER_USER@$SERVER_IP \
    'chmod +x /tmp/setup-subdomain-on-server.sh'
echo "✅ Script is executable"
echo ""

# Step 5: Run script on server (interactive)
echo "=================================================="
echo "📋 Step 4: Running setup script on server..."
echo "=================================================="
echo ""
echo "The script will now run on the server."
echo "You may be prompted for sudo password: $SERVER_PASS"
echo ""
read -p "Press Enter to continue..." -r
echo ""

sshpass -p "$SERVER_PASS" ssh -t -o "StrictHostKeyChecking=no" \
    $SERVER_USER@$SERVER_IP \
    '/tmp/setup-subdomain-on-server.sh'

echo ""
echo "=================================================="
echo "✅ Setup script completed!"
echo "=================================================="
echo ""
echo "🧪 Testing the deployment..."
echo ""

# Test HTTPS
echo "Testing HTTPS..."
if curl -I https://$SUBDOMAIN 2>&1 | grep -q "200 OK\|301 Moved\|302 Found"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS returned unexpected response"
    curl -I https://$SUBDOMAIN 2>&1 | head -5
fi

echo ""

# Test API
echo "Testing API..."
if curl -s https://$SUBDOMAIN/api/health | grep -q "status\|healthy\|ok"; then
    echo "✅ API is working!"
else
    echo "⚠️  API returned unexpected response"
    curl -s https://$SUBDOMAIN/api/health
fi

echo ""
echo "=================================================="
echo "🎉 Deployment Complete!"
echo "=================================================="
echo ""
echo "🌐 Application URL:"
echo "   https://$SUBDOMAIN"
echo ""
echo "📝 Demo Credentials:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo "🔍 Next Steps:"
echo "   1. Open: https://$SUBDOMAIN"
echo "   2. Login with demo credentials"
echo "   3. Test all micro-frontends"
echo "   4. Check browser console for errors"
echo ""
echo "📊 Monitoring:"
echo "   - Traefik Dashboard: http://$SERVER_IP:8080"
echo "   - Backend Health: https://$SUBDOMAIN/api/health"
echo ""

