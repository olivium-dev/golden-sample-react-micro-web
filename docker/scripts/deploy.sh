#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.bff.yml"

if [ "$ENVIRONMENT" == "production" ]; then
    COMPOSE_FILE="docker-compose.bff.prod.yml"
elif [ "$ENVIRONMENT" == "test" ]; then
    COMPOSE_FILE="docker-compose.bff.test.yml"
fi

echo -e "${GREEN}🚀 Deploying BFF Architecture - ${ENVIRONMENT}${NC}"
echo "Using compose file: ${COMPOSE_FILE}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if secrets directory exists
if [ ! -d "./secrets" ]; then
    echo -e "${YELLOW}⚠️  Secrets directory not found. Creating...${NC}"
    mkdir -p ./secrets
    
    # Generate secrets if they don't exist
    if [ ! -f "./secrets/jwt_secret_key.txt" ]; then
        echo -e "${YELLOW}⚠️  Generating JWT secrets...${NC}"
        openssl rand -base64 32 > ./secrets/jwt_secret_key.txt
        openssl rand -base64 32 > ./secrets/jwt_refresh_secret_key.txt
        chmod 600 ./secrets/jwt_secret_key.txt
        chmod 600 ./secrets/jwt_refresh_secret_key.txt
    fi
fi

# Build and start services
echo -e "${GREEN}📦 Building Docker images...${NC}"
docker-compose -f ${COMPOSE_FILE} build --no-cache

echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose -f ${COMPOSE_FILE} up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health of all services
echo -e "${GREEN}🏥 Checking service health...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HEALTHY=true
    
    # Check BFF services
    if ! docker exec user-management-bff node -e "require('http').get('http://localhost:4001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
        HEALTHY=false
    fi
    
    if ! docker exec catalog-bff node -e "require('http').get('http://localhost:4006/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
        HEALTHY=false
    fi
    
    if ! docker exec orders-bff node -e "require('http').get('http://localhost:4005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
        HEALTHY=false
    fi
    
    if [ "$HEALTHY" = true ]; then
        echo -e "${GREEN}✅ All services are healthy!${NC}"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ Waiting for services... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Services did not become healthy in time${NC}"
    docker-compose -f ${COMPOSE_FILE} ps
    exit 1
fi

# Display service status
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose -f ${COMPOSE_FILE} ps

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services are available at:"
echo "  - Container App: http://localhost:3000"
echo "  - User Management BFF: http://localhost:4001"
echo "  - Catalog BFF: http://localhost:4006"
echo "  - Orders BFF: http://localhost:4005"
echo ""
echo "To view logs: docker-compose -f ${COMPOSE_FILE} logs -f"
echo "To stop: docker-compose -f ${COMPOSE_FILE} down"

