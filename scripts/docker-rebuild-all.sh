#!/bin/bash

# ============================================
# Docker Complete Rebuild Script
# 1. Stop all containers
# 2. Rebuild all images (parallel)
# 3. Start services
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Docker Complete Rebuild${NC}"
echo -e "${BLUE}==========================${NC}"
echo ""

# Step 1: Stop everything
echo -e "${YELLOW}📍 Step 1: Stopping all containers...${NC}"
echo ""

# Stop using run compose
if docker compose -f docker-compose.run.yml ps -q 2>/dev/null | grep -q .; then
    echo "   Stopping services from docker-compose.run.yml..."
    docker compose -f docker-compose.run.yml down
fi

# Stop using simple compose (in case it's running)
if docker compose -f docker-compose.simple.yml ps -q 2>/dev/null | grep -q .; then
    echo "   Stopping services from docker-compose.simple.yml..."
    docker compose -f docker-compose.simple.yml down
fi

# Make sure nothing is running
RUNNING=$(docker ps -q | wc -l | xargs)
if [ "$RUNNING" -gt 0 ]; then
    echo "   Found $RUNNING running containers, stopping them..."
    docker stop $(docker ps -q) 2>/dev/null || true
fi

echo -e "${GREEN}✅ All containers stopped${NC}"
echo ""

# Step 2: Clean up old images (optional but recommended)
echo -e "${YELLOW}📍 Step 2: Cleaning up old images...${NC}"
echo ""

# Remove old creamati-cms images
OLD_IMAGES=$(docker images | grep creamati-cms | awk '{print $3}' | wc -l | xargs)
if [ "$OLD_IMAGES" -gt 0 ]; then
    echo "   Removing $OLD_IMAGES old creamati-cms images..."
    docker images | grep creamati-cms | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
fi

# Prune unused images and cache
echo "   Pruning unused images and build cache..."
docker system prune -f > /dev/null 2>&1
docker builder prune -f > /dev/null 2>&1

echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 3: Rebuild all images in parallel
echo -e "${YELLOW}📍 Step 3: Building all Docker images in parallel...${NC}"
echo ""

export DOCKER_BUILDKIT=1

# Build all services (excluding catalog-app which has errors)
echo "   Building: container-app, user-management-app, data-grid-app,"
echo "             analytics-app, settings-app, orders-app"
echo ""

docker compose -f docker-compose.simple.yml build --parallel \
    container-app \
    user-management-app \
    data-grid-app \
    analytics-app \
    settings-app \
    orders-app

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All images built successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi

echo ""

# Step 4: Show built images
echo -e "${YELLOW}📍 Step 4: Verifying built images...${NC}"
echo ""
docker images | grep creamati-cms
echo ""

# Step 5: Start services
echo -e "${YELLOW}📍 Step 5: Starting services...${NC}"
echo ""

docker compose -f docker-compose.run.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Services started successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

# Step 6: Wait for services to be healthy
echo ""
echo -e "${YELLOW}📍 Step 6: Waiting for services to be healthy...${NC}"
echo ""

sleep 10

# Check container status
echo "   Checking container health..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "micro-frontend|traefik"

echo ""

# Step 7: Test endpoints
echo -e "${YELLOW}📍 Step 7: Testing endpoints...${NC}"
echo ""

# Test main app
echo -n "   Main app (http://localhost): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Test Traefik dashboard (follow redirects)
echo -n "   Traefik dashboard (http://localhost:8080): "
if curl -s -L -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Test remote entries
echo "   Remote entries:"
for app in user data-grid analytics settings orders; do
    echo -n "      $app: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/remoteEntry-$app.js")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED (HTTP $STATUS)${NC}"
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Rebuild complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Final status
echo -e "${YELLOW}📊 Final Status:${NC}"
echo ""
docker system df
echo ""
echo -e "${YELLOW}📦 Running Containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "   Main App:  ${BLUE}http://localhost${NC}"
echo -e "   Traefik:   ${BLUE}http://localhost:8080${NC}"
echo ""

echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo -e "   View logs:    ${BLUE}docker compose -f docker-compose.run.yml logs -f${NC}"
echo -e "   Stop:         ${BLUE}docker compose -f docker-compose.run.yml down${NC}"
echo -e "   Restart:      ${BLUE}docker compose -f docker-compose.run.yml restart${NC}"
echo -e "   Rebuild:      ${BLUE}./scripts/docker-rebuild-all.sh${NC}"
echo ""

echo -e "${GREEN}✅ All done!${NC}"

