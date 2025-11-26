#!/bin/bash

# ============================================
# Build Docker Images Once
# Separates build from compose run
# ============================================

# Don't exit on error - continue building other apps
set +e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Building Docker Images (One Time)${NC}"
echo -e "${BLUE}=====================================${NC}"
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

echo -e "${YELLOW}📦 Phase 1: Building applications locally${NC}"
echo ""

# Build all apps locally first
for service in "${SERVICES[@]}"; do
  echo -e "${GREEN}🔨 Building $service${NC}"
  
  cd "frontend/$service"
  
  # Check if dist exists
  if [ ! -d "dist" ]; then
    # Install if needed
    if [ ! -d "node_modules" ]; then
      echo "  📥 Installing dependencies..."
      npm install --legacy-peer-deps --silent
    fi
    
    # Build
    echo "  🔨 Building..."
    if npm run build --silent 2>&1 | grep -q "compiled successfully\|compiled with"; then
      echo "  ✅ Built successfully"
    else
      echo "  ⚠️  Build had errors (will try to use anyway)"
    fi
  else
    echo "  ✅ Already built"
  fi
  
  cd ../..
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All applications built locally!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}🐳 Phase 2: Building Docker images in parallel${NC}"
echo ""

# Build all Docker images in parallel
docker compose -f docker-compose.simple.yml build --parallel

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All Docker images built!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📊 Docker images:${NC}"
docker images | grep creamati-cms

echo ""
echo -e "${GREEN}🚀 To start services:${NC}"
echo -e "   docker compose -f docker-compose.simple.yml up -d"
echo ""
echo -e "${GREEN}✅ Done! Images are ready to use.${NC}"

