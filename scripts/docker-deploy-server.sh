#!/bin/bash

# Docker Deploy Script for Server
# This script builds Docker images and starts services
# Unlike docker-full-rebuild.sh, it doesn't require npm (builds happen inside Docker)

set -e  # Exit on any error

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🏗️  Docker Deploy - Server Build"
echo "================================="
echo ""

echo "🔴 Step 1: Stopping all Docker containers and freeing port 3000..."
docker compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Kill any process using port 3000 (required for Traefik)
echo "  - Checking for processes using port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo "  - Port 3000 is now free"

echo ""
echo "🧹 Step 2: Aggressive cleanup (freeing ALL Docker space)..."
# Remove ALL containers (running and stopped)
docker rm -f $(docker ps -aq) 2>/dev/null || true
# Remove ALL images
docker rmi -f $(docker images -aq) 2>/dev/null || true
# Remove ALL volumes
docker volume rm -f $(docker volume ls -q) 2>/dev/null || true
# Remove ALL networks (except default ones)
docker network prune -f 2>/dev/null || true
# Clean build cache
docker builder prune -af 2>/dev/null || true
# Final system prune
docker system prune -af --volumes 2>/dev/null || true
# Show disk usage
echo "  - Disk space after cleanup:"
df -h / | tail -1

echo ""
echo "🐳 Step 3: Building Docker images (npm install happens inside Docker)..."

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
)

# Build images sequentially (to avoid disk space issues)
for app_info in "${apps[@]}"; do
  IFS=':' read -r app_dir image_name <<< "$app_info"
  echo "  📦 Building $image_name..."
  cd "$PROJECT_ROOT/frontend/$app_dir"
  
  # Build the image
  if docker build -t "$image_name" -f Dockerfile . ; then
    echo "  ✅ $image_name built successfully"
  else
    echo "  ❌ Failed to build $image_name"
    exit 1
  fi
  
  # Clean up intermediate build cache after each build to save space
  docker builder prune -f 2>/dev/null || true
done

echo ""
echo "✅ All Docker images built successfully!"

echo ""
echo "🚀 Step 4: Starting services (using pre-built images)..."
docker compose up -d

echo ""
echo "⏳ Step 5: Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "🧪 Step 6: Testing endpoints..."
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
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/delivery | grep -q "200\|301\|302"; then
  echo "  ✅ Delivery: OK"
else
  echo "  ⚠️  Delivery: Not responding"
fi

echo ""
echo "📊 Step 7: Docker Status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💾 Step 8: Docker Disk Usage..."
docker system df

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "  - Main App: http://localhost:3000"
echo "  - Traefik Dashboard: http://localhost:8080"
echo ""
echo "📝 View logs: docker compose logs -f"
echo "🛑 Stop services: docker compose down"

