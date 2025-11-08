#!/bin/bash

# Stop Services Script - Stops all running services

set -e

echo "=========================================="
echo "🛑 Stopping All Services"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Stopping service on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to stop port $port${NC}"
        else
            echo -e "${GREEN}✅ Port $port stopped${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port already free${NC}"
    fi
}

echo "Stopping frontend services..."
for port in 3000 3001 3002 3003 3004 3005 3006; do
    kill_port $port
done

echo ""
echo "Stopping backend service..."
kill_port 8000

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All services stopped${NC}"
echo "=========================================="

