#!/bin/bash

# Complete Authentication Setup Script
# Sets up JWT authentication infrastructure

set -e

echo "🚀 Setting up JWT Authentication..."
echo

# Step 1: Create directories
echo "📁 Creating directories..."
mkdir -p secrets
mkdir -p backend/mock-data-service/auth
mkdir -p backend/mock-data-service/config
mkdir -p frontend/shared-ui-lib/src/auth
mkdir -p frontend/shared-ui-lib/src/api
echo "✅ Directories created"
echo

# Step 2: Generate secrets
echo "🔐 Generating JWT secrets..."
if [ ! -f secrets/jwt_secret_key.txt ]; then
  openssl rand -hex 32 > secrets/jwt_secret_key.txt
  echo "✅ JWT secret key generated"
else
  echo "ℹ️  JWT secret key already exists"
fi

if [ ! -f secrets/jwt_refresh_secret_key.txt ]; then
  openssl rand -hex 32 > secrets/jwt_refresh_secret_key.txt
  echo "✅ JWT refresh secret key generated"
else
  echo "ℹ️  JWT refresh secret key already exists"
fi
echo

# Step 3: Create .env file if it doesn't exist
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env file created from .env.example"
else
  echo "ℹ️  .env file already exists"
fi
echo

# Step 4: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend/mock-data-service
pip3 install -q -r requirements.txt
cd ../..
echo "✅ Backend dependencies installed"
echo

# Step 5: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend/shared-ui-lib
npm install --legacy-peer-deps > /dev/null 2>&1
cd ../..
echo "✅ Frontend dependencies installed"
echo

# Step 6: Display success message
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ JWT Authentication setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "📋 Demo Users:"
echo "  🔴 Admin:  admin@example.com / admin123"
echo "  🔵 User:   user@example.com / user123"
echo "  🟢 Viewer: viewer@example.com / viewer123"
echo
echo "🚀 Next steps:"
echo "  1. Start services: ./run.sh"
echo "  2. Open browser: http://localhost:3000"
echo "  3. Login with any demo user"
echo
echo "📖 For more info, see AUTHENTICATION_GUIDE.md"
echo





