#!/bin/bash

# Script to stop all micro-frontend services using Docker Compose
# Usage: ./stop.sh

echo "🛑 Stopping all Docker Compose services..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Stop services
docker compose down

echo ""
echo "✅ All services stopped!"
echo ""

