#!/bin/bash

# Golden Sample Micro-Frontend Platform - Minimal Working Version
# This script starts all 5 working micro-frontends + backend

echo "🚀 Starting Golden Sample Micro-Frontend Platform"
echo "=================================================="
echo ""

# Stop any existing services
echo "🛑 Stopping existing services..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
lsof -ti:3004 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
pkill -f "webpack.*minimal" 2>/dev/null
pkill -f "FastAPI" 2>/dev/null
sleep 2
echo "✅ Stopped existing services"
echo ""

# Start Backend
echo "🐍 Starting Backend Service (port 8000)..."
cd backend/mock-data-service
nohup python3 main.py > backend.log 2>&1 &
cd ../..
sleep 2
echo "✅ Backend started"

# Start User Management
echo "👥 Starting User Management (port 3001)..."
cd frontend/user-management-app
nohup npx webpack serve --config webpack.minimal.js > minimal.log 2>&1 &
cd ../..
echo "✅ User Management started"

# Start Data Grid
echo "📊 Starting Data Grid (port 3002)..."
cd frontend/data-grid-app
nohup npx webpack serve --config webpack.minimal.js > minimal2.log 2>&1 &
cd ../..
echo "✅ Data Grid started"

# Start Analytics
echo "📈 Starting Analytics (port 3003)..."
cd frontend/analytics-app
nohup npx webpack serve --config webpack.minimal.js > minimal.log 2>&1 &
cd ../..
echo "✅ Analytics started"

# Start Settings
echo "⚙️  Starting Settings (port 3004)..."
cd frontend/settings-app
nohup npx webpack serve --config webpack.minimal.js > minimal.log 2>&1 &
cd ../..
echo "✅ Settings started"

# Start Container
echo "🏠 Starting Container App (port 3000)..."
cd frontend/container
nohup npx webpack serve --config webpack.minimal.js > minimal.log 2>&1 &
cd ../..
echo "✅ Container started"

echo ""
echo "⏳ Waiting for apps to compile (this takes ~30-60 seconds)..."
sleep 60

echo ""
echo "🎉 All services started!"
echo "=================================================="
echo ""
echo "📊 Service URLs:"
echo "  🏠 Container (Main):    http://localhost:3000"
echo "  👥 User Management:     http://localhost:3001"
echo "  📊 Data Grid:           http://localhost:3002"
echo "  📈 Analytics:           http://localhost:3003"
echo "  ⚙️  Settings:            http://localhost:3004"
echo "  🐍 Backend API:         http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "  Backend:                backend/mock-data-service/backend.log"
echo "  User Management:        frontend/user-management-app/minimal.log"
echo "  Data Grid:              frontend/data-grid-app/minimal2.log"
echo "  Analytics:              frontend/analytics-app/minimal.log"
echo "  Settings:               frontend/settings-app/minimal.log"
echo "  Container:              frontend/container/minimal.log"
echo ""
echo "🛑 To stop all services:"
echo "  ./stop_minimal.sh"
echo ""
echo "✅ Platform ready! Open http://localhost:3000 in your browser"
echo ""

# Open browser (optional - remove if you don't want auto-open)
# open http://localhost:3000





