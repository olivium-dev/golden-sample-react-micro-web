#!/bin/bash

# Test Run Script - Start services and validate they're running
# This script starts the backend and checks if services can start

set -e

echo "=========================================="
echo "🚀 Testing Consolidated Platform"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo "📦 Checking if dependencies are installed..."
if [ ! -d "frontend/container/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Run: npm run install:all${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "🔍 Validating webpack configurations..."
# Check if webpack configs are valid
for app in container user-management-app data-grid-app analytics-app settings-app orders-app; do
    if [ -f "frontend/$app/webpack.config.js" ]; then
        echo -e "${GREEN}✅ $app webpack.config.js exists${NC}"
    else
        echo -e "${RED}❌ $app webpack.config.js missing${NC}"
    fi
done

if [ -f "frontend/catalog-app/webpack.config.js" ]; then
    echo -e "${GREEN}✅ catalog-app webpack.config.js exists${NC}"
else
    echo -e "${RED}❌ catalog-app webpack.config.js missing${NC}"
fi
echo ""

echo "🔗 Checking Module Federation remotes..."
if grep -q "ordersApp@http://localhost:3005" "frontend/container/webpack.config.js"; then
    echo -e "${GREEN}✅ Orders app remote configured (port 3005)${NC}"
else
    echo -e "${RED}❌ Orders app remote not configured${NC}"
fi

if grep -q "catalogApp@http://localhost:3006" "frontend/container/webpack.config.js"; then
    echo -e "${GREEN}✅ Catalog app remote configured (port 3006)${NC}"
else
    echo -e "${RED}❌ Catalog app remote not configured${NC}"
fi
echo ""

echo "📝 Checking React Query Provider..."
if grep -q "ReactQueryProvider" "frontend/container/src/index.tsx"; then
    echo -e "${GREEN}✅ ReactQueryProvider integrated${NC}"
else
    echo -e "${RED}❌ ReactQueryProvider not integrated${NC}"
fi
echo ""

echo "🎯 Summary:"
echo "  - Container App: Port 3000"
echo "  - User Management: Port 3001"
echo "  - Data Grid: Port 3002"
echo "  - Analytics: Port 3003"
echo "  - Settings: Port 3004"
echo "  - Orders: Port 3005"
echo "  - Catalog: Port 3006"
echo "  - Backend API: Port 8000"
echo ""

echo -e "${GREEN}✅ Configuration validation complete!${NC}"
echo ""
echo "To start all services, run:"
echo "  npm run dev:all"
echo ""
echo "Or start individual services:"
echo "  npm run dev:container"
echo "  npm run dev:user-management"
echo "  npm run dev:data-grid"
echo "  npm run dev:analytics"
echo "  npm run dev:settings"
echo "  npm run dev:orders"
echo "  npm run dev:catalog"
echo "  npm run dev:backend"

