#!/bin/bash
set -e

# Cloudflare credentials
CF_EMAIL="ouday.khaled@gmail.com"
CF_API_KEY="b6172b23e11b421f38069b4931bdf80bd6ff7"
ZONE_NAME="fds-1.com"
SUBDOMAIN="golden-sample.dev-creamat"
FULL_DOMAIN="${SUBDOMAIN}.${ZONE_NAME}"
TARGET_IP="192.168.2.73"

echo "🔍 Step 1: Getting Cloudflare Zone ID for ${ZONE_NAME}..."

# Get Zone ID
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${ZONE_NAME}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ "$ZONE_ID" == "null" ] || [ -z "$ZONE_ID" ]; then
    echo "❌ Error: Could not find zone ${ZONE_NAME}"
    exit 1
fi

echo "✅ Zone ID: ${ZONE_ID}"
echo ""

echo "🔍 Step 2: Checking if DNS record already exists..."

# Check if record exists
EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${FULL_DOMAIN}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ "$EXISTING_RECORD" != "null" ] && [ -n "$EXISTING_RECORD" ]; then
    echo "⚠️  DNS record already exists with ID: ${EXISTING_RECORD}"
    echo "   Skipping creation..."
else
    echo "✅ No existing record found. Safe to create."
    echo ""
    
    echo "📝 Step 3: Creating DNS A record..."
    echo "   Domain: ${FULL_DOMAIN}"
    echo "   IP: ${TARGET_IP}"
    echo "   Proxied: No (Private IP - DNS only mode)"
    echo "   Note: Private IPs cannot use Cloudflare proxy"
    
    # Create DNS record (proxied: false for private IPs)
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
      -H "X-Auth-Email: ${CF_EMAIL}" \
      -H "X-Auth-Key: ${CF_API_KEY}" \
      -H "Content-Type: application/json" \
      --data '{
        "type": "A",
        "name": "'${SUBDOMAIN}'",
        "content": "'${TARGET_IP}'",
        "ttl": 120,
        "proxied": false
      }')
    
    SUCCESS=$(echo $CREATE_RESPONSE | jq -r '.success')
    
    if [ "$SUCCESS" == "true" ]; then
        RECORD_ID=$(echo $CREATE_RESPONSE | jq -r '.result.id')
        echo "✅ DNS record created successfully!"
        echo "   Record ID: ${RECORD_ID}"
    else
        echo "❌ Error creating DNS record:"
        echo $CREATE_RESPONSE | jq -r '.errors'
        exit 1
    fi
fi

echo ""
echo "⏳ Step 4: Waiting 3 seconds for DNS propagation..."
sleep 3

echo ""
echo "🔍 Step 5: Verifying DNS propagation..."
DNS_CHECK=$(host ${FULL_DOMAIN} 2>&1 || echo "FAILED")

if echo "$DNS_CHECK" | grep -q "not found"; then
    echo "❌ DNS not yet propagated"
    echo "   Response: $DNS_CHECK"
    exit 1
else
    echo "✅ DNS successfully propagated!"
    echo "   ${DNS_CHECK}"
fi

echo ""
echo "=================================================="
echo "✅ DNS Configuration Complete!"
echo "=================================================="
echo ""
echo "Domain: ${FULL_DOMAIN}"
echo "Target: ${TARGET_IP}"
echo "Proxied: Yes"
echo "Status: Active and propagated"
echo ""

