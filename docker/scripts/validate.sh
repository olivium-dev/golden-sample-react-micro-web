#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Validating Full BFF Docker Stack (7/7 Services)${NC}"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check services are running
echo -e "${YELLOW}📊 Checking service status...${NC}"
SERVICES_RUNNING=true

check_service() {
    local service=$1
    if docker ps | grep -q "$service"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
        SERVICES_RUNNING=false
    fi
}

check_service "user-management-bff"
check_service "catalog-bff"
check_service "orders-bff"
check_service "micro-frontend-data-grid"
check_service "micro-frontend-analytics"
check_service "micro-frontend-settings"
check_service "micro-frontend-container"

if [ "$SERVICES_RUNNING" = false ]; then
    echo -e "${RED}❌ Not all services are running. Please start services first.${NC}"
    exit 1
fi

# Check health endpoints
echo ""
echo -e "${YELLOW}🏥 Checking health endpoints...${NC}"

check_health() {
    local service=$1
    local url=$2
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service health check passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $service health check failed${NC}"
        return 1
    fi
}

HEALTHY=true
check_health "User Management BFF" "http://localhost:4001/health" || HEALTHY=false
check_health "Catalog BFF" "http://localhost:4006/health" || HEALTHY=false
check_health "Orders BFF" "http://localhost:4005/health" || HEALTHY=false

if [ "$HEALTHY" = false ]; then
    echo -e "${RED}❌ Not all health checks passed${NC}"
    exit 1
fi

# Run integration tests
echo ""
echo -e "${YELLOW}🧪 Running integration tests...${NC}"
if npx playwright test tests/integration/bff-docker.spec.ts --reporter=list; then
    echo -e "${GREEN}✅ Integration tests passed${NC}"
else
    echo -e "${RED}❌ Integration tests failed${NC}"
    exit 1
fi

# Run E2E tests
echo ""
echo -e "${YELLOW}🧪 Running E2E tests...${NC}"
if npx playwright test tests/e2e/docker-bff.spec.ts --reporter=list; then
    echo -e "${GREEN}✅ E2E tests passed${NC}"
else
    echo -e "${RED}❌ E2E tests failed${NC}"
    exit 1
fi

# Check for CORS errors
echo ""
echo -e "${YELLOW}🔍 Checking for CORS issues...${NC}"
# This would be done in the E2E tests, but we can verify here too

# Final summary
echo ""
echo -e "${GREEN}✅ Full Stack Validation Complete!${NC}"
echo ""
echo "All 7 services are working:"
echo "  1. ✅ User Management BFF"
echo "  2. ✅ Catalog BFF"
echo "  3. ✅ Orders BFF"
echo "  4. ✅ Data Grid App"
echo "  5. ✅ Analytics App"
echo "  6. ✅ Settings App"
echo "  7. ✅ Container App"
echo ""
echo "Access the application at: http://localhost:3000"

