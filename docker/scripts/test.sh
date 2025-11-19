#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-test}
COMPOSE_FILE="docker-compose.bff.test.yml"

if [ "$ENVIRONMENT" == "production" ]; then
    COMPOSE_FILE="docker-compose.bff.prod.yml"
elif [ "$ENVIRONMENT" == "development" ]; then
    COMPOSE_FILE="docker-compose.bff.yml"
fi

echo -e "${GREEN}🧪 Running BFF Architecture Tests - ${ENVIRONMENT}${NC}"

# Start services if not running
if ! docker-compose -f ${COMPOSE_FILE} ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Services not running. Starting services...${NC}"
    docker-compose -f ${COMPOSE_FILE} up -d
    
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 15
fi

# Run integration tests
echo -e "${GREEN}📋 Running integration tests...${NC}"
npx playwright test tests/integration/bff-docker.spec.ts --reporter=list || {
    echo -e "${RED}❌ Integration tests failed${NC}"
    exit 1
}

# Run E2E tests
echo -e "${GREEN}📋 Running E2E tests...${NC}"
npx playwright test tests/e2e/docker-bff.spec.ts --reporter=list || {
    echo -e "${RED}❌ E2E tests failed${NC}"
    exit 1
}

# Run performance tests
echo -e "${GREEN}📋 Running performance tests...${NC}"
npx playwright test tests/performance/docker-bff.spec.ts --reporter=list || {
    echo -e "${YELLOW}⚠️  Performance tests failed (non-critical)${NC}"
}

echo -e "${GREEN}✅ All tests completed!${NC}"

# Generate test report
echo -e "${GREEN}📊 Generating test report...${NC}"
npx playwright show-report || true

