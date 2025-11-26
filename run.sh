#!/bin/bash

# Script to start all micro-frontend services using Docker Compose
# Usage: ./run.sh

echo "🚀 Starting all micro-frontend services with Docker Compose..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Start services
echo "🐳 Starting Docker Compose services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to initialize (15 seconds)..."
sleep 15

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "  Main App:              http://localhost"
echo "  Traefik Dashboard:     http://localhost:8080"
echo ""
echo "📝 View logs:"
echo "  docker compose logs -f"
echo ""
echo "🛑 To stop all services:"
echo "  docker compose down"
echo "  or"
echo "  ./stop.sh"
echo ""
echo "🔧 To rebuild and restart:"
echo "  scripts/docker-full-rebuild.sh"
echo ""

