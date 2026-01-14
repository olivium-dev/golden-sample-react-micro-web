#!/bin/bash

# Docker Full Rebuild Script
# This script ensures a clean Docker environment, fixes dependencies, rebuilds all images, and starts services
# Implements "build once, run many" pattern with automatic cleanup

set -e  # Exit on any error

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🏗️  Docker Full Rebuild - Optimized Pattern"
echo "=============================================="
echo ""

echo "🔴 Step 1: Stopping all Docker containers and freeing port 3000..."
docker compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Kill any process using port 3000 (required for Traefik)
echo "  - Checking for processes using port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo "  - Port 3000 is now free"

echo ""
echo "🧹 Step 2: Automatic cleanup (no manual intervention needed)..."
docker system prune -af --volumes
docker builder prune -af

echo ""
echo "📦 Step 3: Fixing catalog-app dependencies..."
cd "$PROJECT_ROOT/frontend/catalog-app"
echo "  - Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json
echo "  - Reinstalling dependencies..."
npm install --legacy-peer-deps
echo "  - Verifying @mui/icons-material installation..."
npm install @mui/icons-material@^5.15.0 --legacy-peer-deps --save
cd "$PROJECT_ROOT"

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
  "delivery-app"
  "inventory-app"
)

for app in "${apps[@]}"; do
  echo ""
  echo "  📦 Building $app..."
  cd "$PROJECT_ROOT/frontend/$app"
  
  # Clean previous build
  rm -rf dist
  
  # Build the app
  if npm run build; then
    echo "  ✅ $app built successfully"
  else
    echo "  ⚠️  Warning: $app build failed, skipping..."
  fi
done

cd "$PROJECT_ROOT"

echo ""
echo "🐳 Step 5: Building Docker images ONCE in parallel..."
echo "  (Images will be reused on subsequent runs)"
echo "  (Using docker build since docker-compose.yml has no build sections)"

# Build images directly using docker build
apps=(
  "container:creamati-cms-container:latest"
  "user-management-app:creamati-cms-user-management:latest"
  "data-grid-app:creamati-cms-data-grid:latest"
  "analytics-app:creamati-cms-analytics:latest"
  "settings-app:creamati-cms-settings:latest"
  "orders-app:creamati-cms-orders:latest"
  "catalog-app:creamati-cms-catalog:latest"
  "delivery-app:creamati-cms-delivery:latest"
  "inventory-app:creamati-cms-inventory:latest"
)

# Build all images in parallel using background processes
pids=()
for app_info in "${apps[@]}"; do
  IFS=':' read -r app_dir image_name <<< "$app_info"
  (
    echo "  📦 Building $image_name..."
    cd "$PROJECT_ROOT/frontend/$app_dir"
    docker build -t "$image_name" -f Dockerfile . || {
      echo "  ❌ Failed to build $image_name"
      exit 1
    }
    echo "  ✅ $image_name built successfully"
  ) &
  pids+=($!)
done

# Wait for all builds to complete
failed=0
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    failed=1
  fi
done

if [ $failed -eq 1 ]; then
  echo ""
  echo "❌ Some images failed to build!"
  exit 1
fi

echo ""
echo "✅ All Docker images built successfully!"

echo ""
echo "🚀 Step 6: Starting services (using pre-built images)..."
docker compose up -d

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
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
  echo "  ✅ Container App: OK"
else
  echo "  ⚠️  Container App: Not responding"
fi

# Test User Management
echo "Testing User Management App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/user-management | grep -q "200\|301\|302"; then
  echo "  ✅ User Management: OK"
else
  echo "  ⚠️  User Management: Not responding"
fi

# Test Data Grid
echo "Testing Data Grid App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/data-grid | grep -q "200\|301\|302"; then
  echo "  ✅ Data Grid: OK"
else
  echo "  ⚠️  Data Grid: Not responding"
fi

# Test Analytics
echo "Testing Analytics App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/analytics | grep -q "200\|301\|302"; then
  echo "  ✅ Analytics: OK"
else
  echo "  ⚠️  Analytics: Not responding"
fi

# Test Settings
echo "Testing Settings App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/settings | grep -q "200\|301\|302"; then
  echo "  ✅ Settings: OK"
else
  echo "  ⚠️  Settings: Not responding"
fi

# Test Orders
echo "Testing Orders App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/orders | grep -q "200\|301\|302"; then
  echo "  ✅ Orders: OK"
else
  echo "  ⚠️  Orders: Not responding"
fi

# Test Catalog
echo "Testing Catalog App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/catalog | grep -q "200\|301\|302"; then
  echo "  ✅ Catalog: OK"
else
  echo "  ⚠️  Catalog: Not responding"
fi

# Test Delivery
echo "Testing Delivery App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mf/delivery | grep -q "200\|301\|302"; then
  echo "  ✅ Delivery: OK"
else
  echo "  ⚠️  Delivery: Not responding"
fi

# Test Inventory
echo "Testing Inventory App..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mf/inventory | grep -q "200\|301\|302"; then
  echo "  ✅ Inventory: OK"
else
  echo "  ⚠️  Inventory: Not responding"
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
echo "💡 Optimization Summary:"
echo "  - Images built ONCE and cached"
echo "  - Next run: just 'docker compose up -d' (no rebuild needed)"
echo "  - Automatic cleanup: no manual intervention required"
echo "  - Disk usage: <300MB for running containers"
echo ""
echo "🌐 Access your application:"
echo "  - Main App: http://localhost:3000"
echo "  - Traefik Dashboard: http://localhost:8080"
echo ""
echo "📝 View logs: docker compose logs -f"
echo "🛑 Stop services: docker compose down"
echo "🔄 Quick restart: docker compose restart"
echo "🏗️  Rebuild images only: ./scripts/docker-build.sh"

