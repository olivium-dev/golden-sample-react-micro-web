#!/bin/bash
# Generate self-signed SSL certificate for private IP subdomain

DOMAIN="golden-sample.dev-creamat.fds-1.com"
SSL_DIR="/etc/letsencrypt/live/${DOMAIN}"

echo "=================================================="
echo "🔒 Generating Self-Signed SSL Certificate"
echo "=================================================="
echo ""
echo "Domain: ${DOMAIN}"
echo "Note: Using self-signed certificate for private IP"
echo ""

# Create directory structure
echo "📁 Creating SSL directory..."
sudo mkdir -p "${SSL_DIR}"
sudo mkdir -p /etc/letsencrypt/archive/${DOMAIN}

# Generate self-signed certificate
echo "🔑 Generating certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/archive/${DOMAIN}/privkey1.pem \
  -out /etc/letsencrypt/archive/${DOMAIN}/fullchain1.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"

# Create symlinks (Let's Encrypt structure)
echo "🔗 Creating symlinks..."
sudo ln -sf /etc/letsencrypt/archive/${DOMAIN}/privkey1.pem ${SSL_DIR}/privkey.pem
sudo ln -sf /etc/letsencrypt/archive/${DOMAIN}/fullchain1.pem ${SSL_DIR}/fullchain.pem
sudo ln -sf /etc/letsencrypt/archive/${DOMAIN}/fullchain1.pem ${SSL_DIR}/chain.pem
sudo ln -sf /etc/letsencrypt/archive/${DOMAIN}/fullchain1.pem ${SSL_DIR}/cert.pem

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chmod 644 /etc/letsencrypt/archive/${DOMAIN}/fullchain1.pem
sudo chmod 600 /etc/letsencrypt/archive/${DOMAIN}/privkey1.pem

# Verify files
echo ""
echo "📋 Verifying certificate files..."
if [ -f "${SSL_DIR}/fullchain.pem" ] && [ -f "${SSL_DIR}/privkey.pem" ]; then
    echo "✅ Certificate files created successfully"
    sudo ls -lah ${SSL_DIR}/
else
    echo "❌ Certificate files missing!"
    exit 1
fi

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo ""
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "=================================================="
echo "✅ Self-Signed SSL Certificate Installed!"
echo "=================================================="
echo ""
echo "⚠️  Note: Browsers will show a security warning for self-signed certificates."
echo "   You can safely proceed (click 'Advanced' → 'Accept Risk')."
echo ""
echo "🌐 Test the application:"
echo "   https://${DOMAIN}"
echo ""

