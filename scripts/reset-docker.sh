#!/bin/bash

# ============================================
# Reset Docker Desktop Data
# Fixes "no space left on device" errors
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Resetting Docker Desktop Data${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  This will delete all Docker images, containers, and volumes!${NC}"
echo -e "${YELLOW}⚠️  Make sure Docker Desktop is running first.${NC}"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}1. Stopping Docker Desktop...${NC}"
osascript -e 'quit app "Docker"' 2>/dev/null || true
sleep 3

echo -e "${YELLOW}2. Removing Docker data...${NC}"

# Remove Docker's virtual disk data
DOCKER_DATA_DIR="$HOME/Library/Containers/com.docker.docker/Data/vms/0/data"
if [ -d "$DOCKER_DATA_DIR" ]; then
    echo "   Removing: $DOCKER_DATA_DIR"
    rm -rf "$DOCKER_DATA_DIR"
fi

# Remove Docker's cache
DOCKER_CACHE_DIR="$HOME/Library/Caches/com.docker.docker"
if [ -d "$DOCKER_CACHE_DIR" ]; then
    echo "   Removing: $DOCKER_CACHE_DIR"
    rm -rf "$DOCKER_CACHE_DIR"
fi

echo -e "${GREEN}✅ Docker data removed${NC}"
echo ""
echo -e "${YELLOW}3. Starting Docker Desktop...${NC}"
open -a Docker

echo ""
echo -e "${YELLOW}4. Waiting for Docker to start (this may take 1-2 minutes)...${NC}"

# Wait for Docker to be ready
MAX_WAIT=120
ELAPSED=0
while ! docker info >/dev/null 2>&1; do
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo -e "${RED}❌ Docker failed to start after ${MAX_WAIT} seconds${NC}"
        exit 1
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo -n "."
done

echo ""
echo -e "${GREEN}✅ Docker is running!${NC}"
echo ""

# Check Docker status
echo -e "${YELLOW}5. Verifying Docker status...${NC}"
docker info >/dev/null 2>&1 && echo -e "${GREEN}✅ Docker is ready${NC}" || echo -e "${RED}❌ Docker not ready${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Docker reset complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📊 Docker disk usage:${NC}"
docker system df
echo ""
echo -e "${GREEN}🚀 You can now build Docker images:${NC}"
echo -e "   docker compose -f docker-compose.simple.yml build --parallel"
echo ""

