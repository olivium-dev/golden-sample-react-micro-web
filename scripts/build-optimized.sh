#!/bin/bash

# ============================================
# Optimized Docker Build Script
# Builds services efficiently with minimal space usage
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Optimized Docker Build Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Enable BuildKit for better caching and efficiency
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo -e "${GREEN}✅ BuildKit enabled${NC}"
echo ""

# Check available disk space
echo -e "${YELLOW}📊 Checking disk space...${NC}"
df -h / | tail -1 | awk '{print "Available: " $4 " (" $5 " used)"}'
echo ""

# Clean up before building
echo -e "${YELLOW}🧹 Cleaning up old images and cache...${NC}"
docker system prune -f
echo ""

# Services to build
SERVICES=(
  "user-management-app"
  "data-grid-app"
  "analytics-app"
  "settings-app"
  "orders-app"
  "catalog-app"
  "container-app"
)

# Build services one at a time to minimize concurrent space usage
TOTAL=${#SERVICES[@]}
CURRENT=0

for service in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}📦 Building $service ($CURRENT/$TOTAL)${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Build with optimized Dockerfile
  docker-compose -f docker-compose.optimized.yml build \
    --pull \
    --compress \
    $service
  
  # Clean up intermediate images after each build
  echo ""
  echo -e "${YELLOW}🧹 Cleaning up intermediate images...${NC}"
  docker image prune -f
  
  echo -e "${GREEN}✅ $service built successfully${NC}"
  echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All services built successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show final Docker usage
echo -e "${YELLOW}📊 Final Docker usage:${NC}"
docker system df
echo ""

# Show built images
echo -e "${YELLOW}📦 Built images:${NC}"
docker images | grep creamati-cms
echo ""

echo -e "${GREEN}🚀 To start services:${NC}"
echo -e "   docker-compose -f docker-compose.optimized.yml up -d"
echo ""

echo -e "${GREEN}🌐 Access:${NC}"
echo -e "   Main App:  http://localhost"
echo -e "   Traefik:   http://localhost:8080"
echo ""

echo -e "${GREEN}✅ Build complete!${NC}"

