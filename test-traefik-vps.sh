#!/bin/bash
VPS_IP="192.168.2.73"
VPS_USER="ec2-user"

echo "=== Testing Traefik on VPS ($VPS_IP) ==="

# Test Traefik dashboard
echo "Testing Traefik dashboard..."
curl -f http://$VPS_IP:8080/api/http/routers || echo "Dashboard not accessible"

# Test backend API
echo "Testing backend API..."
curl -f http://$VPS_IP:8090/api/health || echo "Backend API failed"

# Test container app
echo "Testing container app..."
curl -f http://$VPS_IP:8090/ || echo "Container app failed"

# Test all micro-frontends
for service in users data analytics settings; do
  echo "Testing $service..."
  curl -f http://$VPS_IP:8090/$service/ || echo "$service failed"
done

echo "=== VPS tests complete ==="

