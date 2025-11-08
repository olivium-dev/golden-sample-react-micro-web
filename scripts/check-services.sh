#!/bin/bash

# Check Services Script - Check status of all services

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🔍 Service Status Check"
echo "=========================================="
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

RUNNING=0
TOTAL=8

check_and_report() {
    local port=$1
    local name=$2
    if check_port $port; then
        echo -e "${GREEN}✅ $name (Port $port) - RUNNING${NC}"
        ((RUNNING++))
    else
        echo -e "${RED}❌ $name (Port $port) - NOT RUNNING${NC}"
    fi
}

check_and_report 3000 "Container"
check_and_report 3001 "User Management"
check_and_report 3002 "Data Grid"
check_and_report 3003 "Analytics"
check_and_report 3004 "Settings"
check_and_report 3005 "Orders"
check_and_report 3006 "Catalog"
check_and_report 8000 "Backend API"

echo ""
echo "=========================================="
echo "📊 Summary: $RUNNING/$TOTAL services running"
echo "=========================================="

if [ $RUNNING -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
    echo ""
    echo "🌐 Access: http://localhost:3000"
    exit 0
elif [ $RUNNING -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    echo ""
    echo "The container is accessible at: http://localhost:3000"
    echo ""
    echo "To start missing services:"
    echo "  ./scripts/start-services.sh"
    exit 1
else
    echo -e "${RED}❌ No services are running${NC}"
    echo ""
    echo "To start all services:"
    echo "  ./scripts/start-services.sh"
    exit 1
fi
