#!/bin/bash

# Start Services Script - Starts backend and all frontend services
# This script helps start all services for manual testing

set -e

echo "=========================================="
echo "🚀 Starting All Services"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

echo "🧹 Step 1: Cleaning up existing processes"
echo "=========================================="
for port in 3000 3001 3002 3003 3004 3005 3006 8000; do
    if check_port $port; then
        kill_port $port
    fi
done
echo ""

echo "📦 Step 2: Checking dependencies"
echo "=========================================="
if [ ! -d "frontend/container/node_modules" ]; then
    echo -e "${RED}❌ Dependencies not installed!${NC}"
    echo -e "${YELLOW}Run: npm run install:all${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "🔧 Step 3: Starting Backend (Port 8000)"
echo "=========================================="
cd backend/mock-data-service

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi

# Start backend in background
echo -e "${BLUE}Starting backend service...${NC}"
nohup python3 main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3
if check_port 8000; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check backend.log for errors"
    exit 1
fi

cd ../..
echo ""

echo "🎨 Step 4: Starting Frontend Services"
echo "=========================================="
echo -e "${BLUE}Starting all 7 frontend services...${NC}"
echo "This may take 30-60 seconds..."
echo ""

# Start all frontend services
npm run dev:all > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend services PID: $FRONTEND_PID"

echo ""
echo "⏳ Waiting for services to start..."
echo ""

# Wait and check each port
PORTS=(3000 3001 3002 3003 3004 3005 3006)
MAX_WAIT=60
WAITED=0
ALL_STARTED=false

while [ $WAITED -lt $MAX_WAIT ]; do
    STARTED_COUNT=0
    for port in "${PORTS[@]}"; do
        if check_port $port; then
            ((STARTED_COUNT++))
        fi
    done
    
    if [ $STARTED_COUNT -eq 7 ]; then
        ALL_STARTED=true
        break
    fi
    
    echo -e "${BLUE}Started: $STARTED_COUNT/7 services... (${WAITED}s)${NC}"
    sleep 2
    ((WAITED+=2))
done

echo ""
echo "=========================================="
echo "📊 Service Status"
echo "=========================================="

for port in "${PORTS[@]}"; do
    if check_port $port; then
        case $port in
            3000) echo -e "${GREEN}✅ Container (3000)${NC}" ;;
            3001) echo -e "${GREEN}✅ User Management (3001)${NC}" ;;
            3002) echo -e "${GREEN}✅ Data Grid (3002)${NC}" ;;
            3003) echo -e "${GREEN}✅ Analytics (3003)${NC}" ;;
            3004) echo -e "${GREEN}✅ Settings (3004)${NC}" ;;
            3005) echo -e "${GREEN}✅ Orders (3005)${NC}" ;;
            3006) echo -e "${GREEN}✅ Catalog (3006)${NC}" ;;
        esac
    else
        case $port in
            3000) echo -e "${RED}❌ Container (3000)${NC}" ;;
            3001) echo -e "${RED}❌ User Management (3001)${NC}" ;;
            3002) echo -e "${RED}❌ Data Grid (3002)${NC}" ;;
            3003) echo -e "${RED}❌ Analytics (3003)${NC}" ;;
            3004) echo -e "${RED}❌ Settings (3004)${NC}" ;;
            3005) echo -e "${RED}❌ Orders (3005)${NC}" ;;
            3006) echo -e "${RED}❌ Catalog (3006)${NC}" ;;
        esac
    fi
done

if check_port 8000; then
    echo -e "${GREEN}✅ Backend API (8000)${NC}"
else
    echo -e "${RED}❌ Backend API (8000)${NC}"
fi

echo ""

if [ "$ALL_STARTED" = true ]; then
    echo "=========================================="
    echo -e "${GREEN}🎉 ALL SERVICES STARTED!${NC}"
    echo "=========================================="
    echo ""
    echo "🌐 Access the application:"
    echo "   http://localhost:3000"
    echo ""
    echo "📋 Available Services:"
    echo "   • Container:      http://localhost:3000"
    echo "   • User Management: http://localhost:3001"
    echo "   • Data Grid:       http://localhost:3002"
    echo "   • Analytics:       http://localhost:3003"
    echo "   • Settings:        http://localhost:3004"
    echo "   • Orders:          http://localhost:3005"
    echo "   • Catalog:         http://localhost:3006"
    echo "   • Backend API:     http://localhost:8000"
    echo ""
    echo "📝 Logs:"
    echo "   • Frontend: frontend.log"
    echo "   • Backend:  backend.log"
    echo ""
    echo "🛑 To stop services:"
    echo "   ./scripts/stop-services.sh"
    echo "   or"
    echo "   kill $FRONTEND_PID $BACKEND_PID"
    echo ""
else
    echo "=========================================="
    echo -e "${YELLOW}⚠️  Some services may still be starting${NC}"
    echo "=========================================="
    echo ""
    echo "Check logs for details:"
    echo "   tail -f frontend.log"
    echo "   tail -f backend.log"
    echo ""
    echo "Or wait a bit longer and check:"
    echo "   ./scripts/check-services.sh"
    echo ""
fi

