#!/bin/bash

# Script to start all micro-frontend services with Docker Compose
# Uses pre-built images (build once, run many pattern)
# Usage: ./run.sh

set -e  # Exit on any error

# Navigate to project root
cd "$(dirname "$0")"

echo "🚀 Starting all micro-frontend services..."
echo "=============================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if images exist
echo "🔍 Checking for pre-built Docker images..."
if ! docker images | grep -q "creamati-cms-container"; then
  echo "⚠️  Docker images not found!"
  echo ""
  echo "Please build images first using one of these methods:"
  echo "  1. Quick build: ./scripts/docker-build.sh"
  echo "  2. Full rebuild: ./scripts/docker-full-rebuild.sh"
  echo ""
  exit 1
fi

echo "✅ Pre-built images found"
echo ""

# Stop any existing containers first
echo "🛑 Stopping any existing containers..."
docker compose down 2>/dev/null || true

# Kill any process using port 3000 (required for Traefik)
echo "🔌 Freeing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Docker Compose services in detached mode (no build, just run)
echo "🚀 Starting services (using pre-built images)..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to initialize (15 seconds)..."
sleep 15

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "  Main App:              http://localhost:3000"
echo "  Traefik Dashboard:     http://localhost:8080"
echo ""
echo "📝 Useful commands:"
echo "  View logs:             docker compose logs -f"
echo "  Stop services:         docker compose down  (or ./stop.sh)"
echo "  Restart services:      docker compose restart"
echo "  Rebuild images:        ./scripts/docker-build.sh"
echo "  Full rebuild:          ./scripts/docker-full-rebuild.sh"
echo ""
echo "💡 Tip: Images are cached. No rebuild needed on next run!"
echo ""
