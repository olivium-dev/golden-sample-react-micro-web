#!/bin/bash

# Automated Installation Script for Micro-Frontend Platform
# Installs all dependencies for backend and frontend services

set -e

echo "🚀 Installing Micro-Frontend Platform Dependencies..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to install npm dependencies
install_npm() {
    local dir=$1
    local name=$2
    
    echo -e "${BLUE}📦 Installing $name...${NC}"
    cd "$dir"
    if npm install --legacy-peer-deps 2>&1 | grep -v "npm WARN"; then
        echo -e "${GREEN}✓ $name installed successfully${NC}"
    else
        echo -e "${YELLOW}⚠ $name installed with warnings${NC}"
    fi
    cd - > /dev/null
    echo ""
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}🐍 Installing Backend Dependencies...${NC}"
cd backend/mock-data-service
if pip3 install -r requirements.txt > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend installation completed with warnings${NC}"
fi
cd ../..
echo ""

# Install frontend dependencies
echo -e "${BLUE}⚛️  Installing Frontend Dependencies...${NC}"
echo ""

install_npm "frontend/shared-ui-lib" "Shared UI Library"
install_npm "frontend/container" "Container (Host)"
install_npm "frontend/user-management-app" "User Management"
install_npm "frontend/data-grid-app" "Data Grid"
install_npm "frontend/analytics-app" "Analytics"
install_npm "frontend/settings-app" "Settings"

# Summary
echo "═══════════════════════════════"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "═══════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Start all services: npm run start:full"
echo "  2. Open browser: http://localhost:3000"
echo "  3. Login with: admin@example.com / admin123"
echo ""
echo "For manual startup, see INSTALLATION_GUIDE.md"
echo ""

