#!/bin/bash
set -e

echo "=== Local Traefik Testing ==="

# Clean up existing containers
docker-compose -f docker-compose.prod.yml down -v

# Build and start with Traefik
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Test Traefik dashboard
echo "Testing Traefik dashboard..."
curl -f http://localhost:8080/api/http/routers || echo "Dashboard test failed"

# Test backend API
echo "Testing backend API..."
curl -f http://localhost:8090/api/health || echo "Backend test failed"

# Test container app
echo "Testing container app..."
curl -f http://localhost:8090/ || echo "Container test failed"

# Test micro-frontends
echo "Testing user-management..."
curl -f http://localhost:8090/users/ || echo "User-mgmt test failed"

echo "Testing data-grid..."
curl -f http://localhost:8090/data/ || echo "Data-grid test failed"

echo "Testing analytics..."
curl -f http://localhost:8090/analytics/ || echo "Analytics test failed"

echo "Testing settings..."
curl -f http://localhost:8090/settings/ || echo "Settings test failed"

# Show Traefik logs
echo "=== Traefik Logs ==="
docker logs micro-frontend-traefik --tail 50

echo "=== All local tests complete ==="

