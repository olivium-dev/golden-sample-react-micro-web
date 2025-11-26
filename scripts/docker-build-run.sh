#!/bin/bash

# ============================================
# Docker Build and Run - Optimized Workflow
# 1. Build images once
# 2. Run without rebuilding
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Docker Optimized Workflow${NC}"
echo -e "${BLUE}============================${NC}"
echo ""

# Check if images exist
IMAGES_EXIST=true
for img in creamati-cms-container creamati-cms-user-management creamati-cms-data-grid creamati-cms-analytics creamati-cms-settings creamati-cms-orders creamati-cms-catalog; do
  if ! docker images | grep -q "$img"; then
    IMAGES_EXIST=false
    break
  fi
done

if [ "$IMAGES_EXIST" = false ]; then
  echo -e "${YELLOW}📦 Images not found. Building them first...${NC}"
  echo ""
  
  # Clean up Docker first
  echo -e "${YELLOW}🧹 Cleaning Docker...${NC}"
  docker system prune -af > /dev/null 2>&1
  docker builder prune -af > /dev/null 2>&1
  
  # Build images in parallel
  echo -e "${YELLOW}🐳 Building Docker images (this will take a few minutes)...${NC}"
  docker compose -f docker-compose.simple.yml build --parallel
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Images built successfully!${NC}"
  else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Images already exist. Skipping build.${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting services with Traefik...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Stop existing containers
docker compose -f docker-compose.run.yml down > /dev/null 2>&1

# Start services using run-only compose (no build)
docker compose -f docker-compose.run.yml up -d

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Services started successfully!${NC}"
  echo ""
  echo -e "${YELLOW}📊 Running containers:${NC}"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo ""
  echo -e "${GREEN}🌐 Access URLs:${NC}"
  echo -e "   Main App:  http://localhost"
  echo -e "   Traefik:   http://localhost:8080"
  echo ""
  echo -e "${YELLOW}📝 Useful commands:${NC}"
  echo -e "   View logs:    docker compose -f docker-compose.run.yml logs -f"
  echo -e "   Stop:         docker compose -f docker-compose.run.yml down"
  echo -e "   Restart:      docker compose -f docker-compose.run.yml restart"
else
  echo -e "${RED}❌ Failed to start services${NC}"
  exit 1
fi

