#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.bff.yml"

if [ "$ENVIRONMENT" == "production" ]; then
    COMPOSE_FILE="docker-compose.bff.prod.yml"
elif [ "$ENVIRONMENT" == "test" ]; then
    COMPOSE_FILE="docker-compose.bff.test.yml"
fi

echo -e "${GREEN}📊 Monitoring BFF Architecture Services - ${ENVIRONMENT}${NC}"
echo ""

# Service status
echo -e "${YELLOW}Service Status:${NC}"
docker-compose -f ${COMPOSE_FILE} ps

echo ""
echo -e "${YELLOW}Health Checks:${NC}"

# Check BFF health endpoints
check_health() {
    local service=$1
    local port=$2
    local url="http://localhost:${port}/health"
    
    if curl -s -f ${url} > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service} (port ${port}) - Healthy${NC}"
        curl -s ${url} | jq '.' 2>/dev/null || echo "  Response received"
    else
        echo -e "${RED}❌ ${service} (port ${port}) - Unhealthy${NC}"
    fi
}

check_health "User Management BFF" "4001"
check_health "Catalog BFF" "4006"
check_health "Orders BFF" "4005"

echo ""
echo -e "${YELLOW}Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "CONTAINER|bff|backend|container"

echo ""
echo -e "${YELLOW}Recent Logs (last 20 lines):${NC}"
docker-compose -f ${COMPOSE_FILE} logs --tail=20

echo ""
echo "To view live logs: docker-compose -f ${COMPOSE_FILE} logs -f"
echo "To view specific service logs: docker-compose -f ${COMPOSE_FILE} logs -f <service-name>"

