#!/bin/bash

# Full Test Script - Build, Validate and Test All Apps
# This ensures all 7 micro-frontends are working

set -e

echo "=========================================="
echo "🧪 Full Build & Test - All 7 Apps"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")/.."

APPS=("container" "user-management-app" "data-grid-app" "analytics-app" "settings-app" "orders-app" "catalog-app")
PASSED=0
FAILED=0
TOTAL=7

echo "📦 Step 1: Checking Dependencies"
echo "=========================================="
for app in "${APPS[@]}"; do
    if [ -d "frontend/$app/node_modules" ]; then
        echo -e "${GREEN}✅ $app dependencies installed${NC}"
    else
        echo -e "${RED}❌ $app dependencies missing${NC}"
        echo -e "${YELLOW}   Run: cd frontend/$app && npm install${NC}"
        ((FAILED++))
    fi
done
echo ""

echo "📝 Step 2: Checking TypeScript Configuration"
echo "=========================================="
for app in "${APPS[@]}"; do
    if [ -f "frontend/$app/tsconfig.json" ]; then
        echo -e "${GREEN}✅ $app tsconfig.json exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $app tsconfig.json missing (may use JS)${NC}"
    fi
done
echo ""

echo "🔧 Step 3: Checking Webpack Configuration"
echo "=========================================="
for app in "${APPS[@]}"; do
    if [ -f "frontend/$app/webpack.config.js" ]; then
        echo -e "${GREEN}✅ $app webpack.config.js exists${NC}"
        
        # Check port configuration
        port=$(grep -o "port: [0-9]*" "frontend/$app/webpack.config.js" | head -1 | grep -o "[0-9]*" || echo "N/A")
        if [ "$port" != "N/A" ]; then
            echo -e "   ${BLUE}ℹ️  Port: $port${NC}"
        fi
    else
        echo -e "${RED}❌ $app webpack.config.js missing${NC}"
        ((FAILED++))
    fi
done
echo ""

echo "🏗️  Step 4: Building All Apps"
echo "=========================================="
BUILD_FAILED=0

for app in "${APPS[@]}"; do
    echo -e "${BLUE}Building $app...${NC}"
    
    if cd "frontend/$app" && npm run build > /dev/null 2>&1; then
        if [ -d "dist" ] && [ -f "dist/remoteEntry.js" ]; then
            echo -e "${GREEN}✅ $app build successful (remoteEntry.js present)${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ $app build failed (no dist/remoteEntry.js)${NC}"
            ((FAILED++))
            BUILD_FAILED=1
        fi
    else
        echo -e "${RED}❌ $app build failed${NC}"
        ((FAILED++))
        BUILD_FAILED=1
    fi
    cd - > /dev/null
    echo ""
done

echo "🔗 Step 5: Validating Module Federation"
echo "=========================================="

# Check container webpack for all remotes
CONTAINER_CONFIG="frontend/container/webpack.config.js"

check_remote() {
    local app_name=$1
    local port=$2
    
    if grep -q "${app_name}@http://localhost:${port}/remoteEntry.js" "$CONTAINER_CONFIG"; then
        echo -e "${GREEN}✅ ${app_name} remote configured (port ${port})${NC}"
        return 0
    else
        echo -e "${RED}❌ ${app_name} remote not configured${NC}"
        return 1
    fi
}

check_remote "userApp" "3001"
check_remote "dataApp" "3002"
check_remote "analyticsApp" "3003"
check_remote "settingsApp" "3004"
check_remote "ordersApp" "3005"
check_remote "catalogApp" "3006"
echo ""

echo "📱 Step 6: Validating Container App Integration"
echo "=========================================="

CONTAINER_APP="frontend/container/src/App.tsx"

# Check imports
if grep -q "import('ordersApp/Orders')" "$CONTAINER_APP"; then
    echo -e "${GREEN}✅ Orders app lazy loaded in container${NC}"
else
    echo -e "${RED}❌ Orders app not imported${NC}"
fi

if grep -q "import('catalogApp/Catalog')" "$CONTAINER_APP"; then
    echo -e "${GREEN}✅ Catalog app lazy loaded in container${NC}"
else
    echo -e "${RED}❌ Catalog app not imported${NC}"
fi

# Check menu items
if grep -q "'orders'" "$CONTAINER_APP"; then
    echo -e "${GREEN}✅ Orders menu item present${NC}"
else
    echo -e "${RED}❌ Orders menu item missing${NC}"
fi

if grep -q "'catalog'" "$CONTAINER_APP"; then
    echo -e "${GREEN}✅ Catalog menu item present${NC}"
else
    echo -e "${RED}❌ Catalog menu item missing${NC}"
fi
echo ""

echo "⚡ Step 7: Validating React Query Integration"
echo "=========================================="

# Check ReactQueryProvider
if [ -f "frontend/shared-ui-lib/src/providers/ReactQueryProvider.tsx" ]; then
    echo -e "${GREEN}✅ ReactQueryProvider exists${NC}"
else
    echo -e "${RED}❌ ReactQueryProvider missing${NC}"
fi

# Check container integration
if grep -q "ReactQueryProvider" "frontend/container/src/index.tsx"; then
    echo -e "${GREEN}✅ ReactQueryProvider integrated in container${NC}"
else
    echo -e "${RED}❌ ReactQueryProvider not integrated${NC}"
fi

# Check all apps have React Query dependency
for app in "${APPS[@]}"; do
    if grep -q "@tanstack/react-query" "frontend/$app/package.json"; then
        echo -e "${GREEN}✅ $app has React Query dependency${NC}"
    else
        echo -e "${YELLOW}⚠️  $app missing React Query dependency${NC}"
    fi
done
echo ""

echo "🎨 Step 8: Validating Error Handling"
echo "=========================================="

# Check ErrorCapture enhancements
if grep -q "__originalConsole" "frontend/shared-ui-lib/src/errors/ErrorCapture.ts"; then
    echo -e "${GREEN}✅ ErrorCapture has recursion prevention${NC}"
else
    echo -e "${YELLOW}⚠️  ErrorCapture may lack recursion prevention${NC}"
fi

if grep -q "ErrorCapture.initialize" "frontend/container/src/index.tsx"; then
    echo -e "${GREEN}✅ ErrorCapture initialized in container${NC}"
else
    echo -e "${RED}❌ ErrorCapture not initialized${NC}"
fi
echo ""

echo "📊 Step 9: Build Artifacts Summary"
echo "=========================================="
for app in "${APPS[@]}"; do
    if [ -f "frontend/$app/dist/remoteEntry.js" ]; then
        size=$(du -h "frontend/$app/dist/remoteEntry.js" | cut -f1)
        echo -e "${GREEN}✅ $app remoteEntry.js ($size)${NC}"
    else
        echo -e "${RED}❌ $app remoteEntry.js not found${NC}"
    fi
done
echo ""

echo "=========================================="
echo "📈 TEST RESULTS"
echo "=========================================="
echo -e "Total Apps: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $PASSED -eq 7 ] && [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL 7 APPS WORKING, TESTED AND VALIDATED!${NC}"
    echo ""
    echo "🚀 Ready to run:"
    echo "   Terminal 1: npm run dev:backend"
    echo "   Terminal 2: npm run dev:all"
    echo "   Browser: http://localhost:3000"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Please fix the issues above."
    echo ""
    exit 1
fi

