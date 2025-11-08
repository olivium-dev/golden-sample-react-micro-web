#!/bin/bash

# Validation Script for Consolidated Micro-Frontend Platform
# Validates all consolidated features and enhancements

set -e

echo "=========================================="
echo "🔍 Validating Consolidated Platform"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VALIDATION_PASSED=true

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        VALIDATION_PASSED=false
        return 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
        return 0
    fi
}

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check if a directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check package.json for dependency
check_dependency() {
    if grep -q "$2" "$1/package.json"; then
        echo -e "${GREEN}✅ $2 found in $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 not found in $1${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

echo "📦 Checking Prerequisites..."
check_command node
check_command npm
check_command python3
echo ""

echo "📁 Checking Project Structure..."
check_directory "frontend/container"
check_directory "frontend/user-management-app"
check_directory "frontend/data-grid-app"
check_directory "frontend/analytics-app"
check_directory "frontend/settings-app"
check_directory "frontend/orders-app"
check_directory "frontend/catalog-app"
check_directory "frontend/shared-ui-lib"
check_directory "backend/mock-data-service"
echo ""

echo "🔧 Checking React Query Integration..."
if grep -q "@tanstack/react-query" "package.json"; then
    echo -e "${GREEN}✅ @tanstack/react-query found in root package.json${NC}"
else
    echo -e "${RED}❌ @tanstack/react-query not found in root package.json${NC}"
    VALIDATION_PASSED=false
fi
check_dependency "frontend/shared-ui-lib" "@tanstack/react-query"
check_dependency "frontend/container" "@tanstack/react-query"
check_dependency "frontend/user-management-app" "@tanstack/react-query"
check_dependency "frontend/data-grid-app" "@tanstack/react-query"
check_dependency "frontend/analytics-app" "@tanstack/react-query"
check_dependency "frontend/settings-app" "@tanstack/react-query"
check_dependency "frontend/orders-app" "@tanstack/react-query"
echo ""

echo "📝 Checking Key Files..."
check_file "frontend/shared-ui-lib/src/providers/ReactQueryProvider.tsx"
check_file "frontend/shared-ui-lib/src/errors/ErrorCapture.ts"
check_file "frontend/container/src/index.tsx"
check_file "frontend/container/webpack.config.js"
check_file "frontend/orders-app/webpack.config.js"
check_file "frontend/catalog-app/webpack.config.js"
echo ""

echo "🔗 Checking Module Federation Configuration..."
if grep -q "ordersApp" "frontend/container/webpack.config.js"; then
    echo -e "${GREEN}✅ Orders app configured in container${NC}"
else
    echo -e "${RED}❌ Orders app not configured in container${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "catalogApp" "frontend/container/webpack.config.js"; then
    echo -e "${GREEN}✅ Catalog app configured in container${NC}"
else
    echo -e "${RED}❌ Catalog app not configured in container${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "ordersApp/Orders" "frontend/container/src/App.tsx"; then
    echo -e "${GREEN}✅ Orders app imported in container${NC}"
else
    echo -e "${RED}❌ Orders app not imported in container${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "catalogApp/Catalog" "frontend/container/src/App.tsx"; then
    echo -e "${GREEN}✅ Catalog app imported in container${NC}"
else
    echo -e "${RED}❌ Catalog app not imported in container${NC}"
    VALIDATION_PASSED=false
fi
echo ""

echo "🎨 Checking Error Handling..."
if grep -q "ErrorCapture.initialize" "frontend/container/src/index.tsx"; then
    echo -e "${GREEN}✅ ErrorCapture initialized in container${NC}"
else
    echo -e "${RED}❌ ErrorCapture not initialized${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "__originalConsole" "frontend/shared-ui-lib/src/errors/ErrorCapture.ts"; then
    echo -e "${GREEN}✅ Enhanced ErrorCapture with recursion prevention${NC}"
else
    echo -e "${YELLOW}⚠️  ErrorCapture may not have recursion prevention${NC}"
fi
echo ""

echo "⚡ Checking Performance Optimizations..."
if grep -q "useCallback" "frontend/shared-ui-lib/src/auth/AuthContext.tsx"; then
    echo -e "${GREEN}✅ AuthContext uses useCallback${NC}"
else
    echo -e "${RED}❌ AuthContext missing useCallback${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "useMemo" "frontend/shared-ui-lib/src/auth/AuthContext.tsx"; then
    echo -e "${GREEN}✅ AuthContext uses useMemo${NC}"
else
    echo -e "${RED}❌ AuthContext missing useMemo${NC}"
    VALIDATION_PASSED=false
fi
echo ""

echo "📊 Checking Package Scripts..."
if grep -q "dev:orders" "package.json"; then
    echo -e "${GREEN}✅ Orders script in package.json${NC}"
else
    echo -e "${RED}❌ Orders script missing${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "dev:catalog" "package.json"; then
    echo -e "${GREEN}✅ Catalog script in package.json${NC}"
else
    echo -e "${RED}❌ Catalog script missing${NC}"
    VALIDATION_PASSED=false
fi

if grep -q "ORDERS,CATALOG" "package.json"; then
    echo -e "${GREEN}✅ All apps in dev:all script${NC}"
else
    echo -e "${YELLOW}⚠️  Check dev:all script includes all apps${NC}"
fi
echo ""

echo "🏗️  Checking Build Artifacts..."
if [ -d "frontend/container/dist" ] || [ -d "frontend/user-management-app/dist" ]; then
    echo -e "${GREEN}✅ Build artifacts found${NC}"
else
    echo -e "${YELLOW}⚠️  No build artifacts found (run build:all first)${NC}"
fi
echo ""

echo "=========================================="
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
    echo "All consolidated features are properly configured!"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Please fix the issues above before proceeding."
    exit 1
fi

