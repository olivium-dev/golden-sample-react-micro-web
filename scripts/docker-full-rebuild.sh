#!/bin/bash

# Docker Full Rebuild Script
# This script ensures a clean Docker environment, fixes dependencies, rebuilds all images, and starts services

set -e  # Exit on any error

echo "🔴 Step 1: Stopping all Docker containers..."
docker compose -f docker-compose.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

echo ""
echo "🧹 Step 2: Cleaning up Docker system..."
docker system prune -af --volumes
docker builder prune -af

echo ""
echo "📦 Step 3: Fixing catalog-app dependencies..."
cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms/frontend/catalog-app
echo "  - Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json
echo "  - Reinstalling dependencies..."
npm install --legacy-peer-deps
echo "  - Verifying @mui/icons-material installation..."
npm install @mui/icons-material@latest --legacy-peer-deps --save
cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms

echo ""
echo "🏗️  Step 4: Building all applications locally..."

# Array of frontend apps
apps=(
  "container"
  "user-management-app"
  "data-grid-app"
  "analytics-app"
  "settings-app"
  "orders-app"
  "catalog-app"
)

for app in "${apps[@]}"; do
  echo ""
  echo "  📦 Building $app..."
  cd "/Users/oudaykhaled/Desktop/cremat-cms/creamati-cms/frontend/$app"
  
  # Clean previous build
  rm -rf dist
  
  # Build the app
  if npm run build; then
    echo "  ✅ $app built successfully"
  else
    echo "  ⚠️  Warning: $app build failed, skipping..."
  fi
done

cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms

echo ""
echo "🐳 Step 5: Building Docker images in parallel..."
docker compose -f docker-compose.yml build --parallel

echo ""
echo "🚀 Step 6: Starting services with Traefik..."
docker compose -f docker-compose.yml up -d

echo ""
echo "⏳ Step 7: Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "🧪 Step 8: Testing endpoints..."
echo ""

# Test Traefik dashboard
echo "Testing Traefik Dashboard..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
  echo "  ✅ Traefik Dashboard: OK"
else
  echo "  ⚠️  Traefik Dashboard: Not responding"
fi

# Test Container App
echo "Testing Container App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
  echo "  ✅ Container App: OK"
else
  echo "  ⚠️  Container App: Not responding"
fi

# Test User Management
echo "Testing User Management App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/user-management | grep -q "200\|301\|302"; then
  echo "  ✅ User Management: OK"
else
  echo "  ⚠️  User Management: Not responding"
fi

# Test Data Grid
echo "Testing Data Grid App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/data-grid | grep -q "200\|301\|302"; then
  echo "  ✅ Data Grid: OK"
else
  echo "  ⚠️  Data Grid: Not responding"
fi

# Test Analytics
echo "Testing Analytics App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/analytics | grep -q "200\|301\|302"; then
  echo "  ✅ Analytics: OK"
else
  echo "  ⚠️  Analytics: Not responding"
fi

# Test Settings
echo "Testing Settings App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/settings | grep -q "200\|301\|302"; then
  echo "  ✅ Settings: OK"
else
  echo "  ⚠️  Settings: Not responding"
fi

# Test Orders
echo "Testing Orders App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/orders | grep -q "200\|301\|302"; then
  echo "  ✅ Orders: OK"
else
  echo "  ⚠️  Orders: Not responding"
fi

# Test Catalog
echo "Testing Catalog App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/catalog | grep -q "200\|301\|302"; then
  echo "  ✅ Catalog: OK"
else
  echo "  ⚠️  Catalog: Not responding"
fi

echo ""
echo "📊 Step 9: Docker Status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💾 Step 10: Docker Disk Usage..."
docker system df

echo ""
echo "✅ Full rebuild complete!"
echo ""
echo "🌐 Access your application:"
echo "  - Main App: http://localhost"
echo "  - Traefik Dashboard: http://localhost:8080"
echo ""
echo "📝 View logs: docker compose -f docker-compose.yml logs -f"
echo "🛑 Stop services: docker compose -f docker-compose.yml down"

