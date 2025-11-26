#!/bin/bash

# Script to stop all micro-frontend services with Docker Compose
# Usage: ./stop.sh

set -e  # Exit on any error

# Navigate to project root
cd "$(dirname "$0")"

echo "🛑 Stopping all micro-frontend services..."
echo "=============================================="
echo ""

# Stop Docker Compose services (keeps images cached)
docker compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 Docker images are still cached for quick restart"
echo ""
echo "🚀 To restart: ./run.sh"
echo "🧹 To cleanup images: docker system prune -af"
echo ""
