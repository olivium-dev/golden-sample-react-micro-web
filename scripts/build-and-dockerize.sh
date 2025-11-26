#!/bin/bash

# ============================================
# Build Locally, Then Dockerize
# Most efficient approach for limited disk space
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Build and Dockerize Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Services to build
SERVICES=(
  "user-management-app"
  "data-grid-app"
  "analytics-app"
  "settings-app"
  "orders-app"
  "catalog-app"
  "container"
)

TOTAL=${#SERVICES[@]}
CURRENT=0

echo -e "${YELLOW}📦 Phase 1: Building applications locally${NC}"
echo ""

# Build all apps locally first
for service in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🔨 Building $service ($CURRENT/$TOTAL)${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  cd "frontend/$service"
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install --legacy-peer-deps
  fi
  
  # Build the app
  echo -e "${YELLOW}🔨 Building...${NC}"
  npm run build
  
  echo -e "${GREEN}✅ $service built successfully${NC}"
  echo ""
  
  cd ../..
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All applications built locally!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}🐳 Phase 2: Creating Docker images${NC}"
echo ""

# Now create Docker images (very fast, only copying built files)
export DOCKER_BUILDKIT=1

CURRENT=0
for service in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🐳 Dockerizing $service ($CURRENT/$TOTAL)${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Map service name to docker-compose service name
  if [ "$service" = "container" ]; then
    compose_service="container-app"
  else
    compose_service="$service"
  fi
  
  docker-compose -f docker-compose.simple.yml build $compose_service
  
  echo -e "${GREEN}✅ $service dockerized${NC}"
  echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All services built and dockerized!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show final Docker usage
echo -e "${YELLOW}📊 Docker images:${NC}"
docker images | grep creamati-cms
echo ""

echo -e "${GREEN}🚀 To start services:${NC}"
echo -e "   docker-compose -f docker-compose.simple.yml up -d"
echo ""

echo -e "${GREEN}🌐 Access:${NC}"
echo -e "   Main App:  http://localhost"
echo -e "   Traefik:   http://localhost:8080"
echo ""

echo -e "${GREEN}✅ Complete!${NC}"

