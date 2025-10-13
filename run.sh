#!/bin/bash

# Script to stop and restart all micro-frontend and backend services
# Usage: ./run.sh

echo "🛑 Stopping all running services..."

# Kill processes on specific ports
echo "Killing processes on ports 3000-3004 and 8000..."
for port in 3000 3001 3002 3003 3004 8000; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done

# Kill any remaining webpack-dev-server processes
echo "Killing any remaining webpack-dev-server processes..."
pkill -f "webpack-dev-server" 2>/dev/null || true
pkill -f "webpack serve" 2>/dev/null || true

# Kill any remaining python processes for the backend
echo "Killing any remaining FastAPI processes..."
pkill -f "main.py" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

echo "✅ All services stopped"
echo ""
echo "🚀 Starting all services in background..."

# Navigate to project root
PROJECT_ROOT="/Users/oudaykhaled/Desktop/golden-sample-react-micro-web /golden-sample-react-micro-web"
cd "$PROJECT_ROOT"

# Install missing Python dependency for backend
echo "📦 Installing missing Python dependencies..."
pip3 install -q email-validator 2>/dev/null || pip install -q email-validator 2>/dev/null || true

# Start backend service
echo "🐍 Starting FastAPI backend service on port 8000..."
(cd "$PROJECT_ROOT/backend/mock-data-service" && nohup python3 main.py > backend.log 2>&1 &)
sleep 2

# Start frontend services
echo "⚛️  Starting frontend micro-services..."

# Start container app (port 3000)
echo "Starting container app on port 3000..."
(cd "$PROJECT_ROOT/frontend/container" && nohup npx webpack serve --config webpack.minimal.js > container.log 2>&1 &)
sleep 1

# Start user-management-app (port 3001)
echo "Starting user-management-app on port 3001..."
(cd "$PROJECT_ROOT/frontend/user-management-app" && nohup npx webpack serve --config webpack.minimal.js > user-management.log 2>&1 &)
sleep 1

# Start data-grid-app (port 3002)
echo "Starting data-grid-app on port 3002..."
(cd "$PROJECT_ROOT/frontend/data-grid-app" && nohup npx webpack serve --config webpack.minimal.js > data-grid.log 2>&1 &)
sleep 1

# Start analytics-app (port 3003)
echo "Starting analytics-app on port 3003..."
(cd "$PROJECT_ROOT/frontend/analytics-app" && nohup npx webpack serve --config webpack.minimal.js > analytics.log 2>&1 &)
sleep 1

# Start settings-app (port 3004)
echo "Starting settings-app on port 3004..."
(cd "$PROJECT_ROOT/frontend/settings-app" && nohup npx webpack serve --config webpack.minimal.js > settings.log 2>&1 &)
sleep 1

echo ""
echo "🎉 All services starting in background!"
echo ""
echo "📊 Service URLs:"
echo "Backend (FastAPI):        http://localhost:8000"
echo "API Documentation:        http://localhost:8000/docs"
echo "Container App:            http://localhost:3000"
echo "User Management:          http://localhost:3001"
echo "Data Grid:                http://localhost:3002"
echo "Analytics:                http://localhost:3003"
echo "Settings:                 http://localhost:3004"
echo ""
echo "📝 Logs are being written to:"
echo "Backend:                  backend/mock-data-service/backend.log"
echo "Container:                frontend/container/container.log"
echo "User Management:          frontend/user-management-app/user-management.log"
echo "Data Grid:                frontend/data-grid-app/data-grid.log"
echo "Analytics:                frontend/analytics-app/analytics.log"
echo "Settings:                 frontend/settings-app/settings.log"
echo ""
echo "⏳ Services are starting up (this takes ~15-30 seconds)..."
echo ""
echo "🔍 To check logs:"
echo "tail -f backend/mock-data-service/backend.log"
echo "tail -f frontend/container/container.log"
echo ""
echo "🛑 To stop all services:"
echo "./stop.sh"
echo ""
echo "✅ Script completed. Services are running in background!"
