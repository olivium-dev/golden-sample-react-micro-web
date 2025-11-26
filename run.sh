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
PROJECT_ROOT=$(pwd)
cd "$PROJECT_ROOT"

# Install missing Python dependency for backend
# Create and activate virtual environment
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv backend/venv
fi
source backend/venv/bin/activate

echo "📦 Installing Python dependencies..."
"$PROJECT_ROOT/backend/venv/bin/pip" install -r backend/mock-data-service/requirements.txt

# Start backend service
echo "🐍 Starting FastAPI backend service on port 8000..."
(cd "$PROJECT_ROOT/backend/mock-data-service" && nohup "$PROJECT_ROOT/backend/venv/bin/python3" main.py > backend.log 2>&1 &)
sleep 2

# Start frontend services
echo "⚛️  Starting frontend micro-services..."

# Start container app (port 3000)
echo "Starting container app on port 3000..."
(cd "$PROJECT_ROOT/frontend/container" && nohup npm start > container.log 2>&1 &)
sleep 2

# Start user-management-app (port 3001)
echo "Starting user-management-app on port 3001..."
(cd "$PROJECT_ROOT/frontend/user-management-app" && nohup npm start > user-management.log 2>&1 &)
sleep 2

# Start data-grid-app (port 3002)
echo "Starting data-grid-app on port 3002..."
(cd "$PROJECT_ROOT/frontend/data-grid-app" && nohup npm start > data-grid.log 2>&1 &)
sleep 2

# Start analytics-app (port 3003)
echo "Starting analytics-app on port 3003..."
(cd "$PROJECT_ROOT/frontend/analytics-app" && nohup npm start > analytics.log 2>&1 &)
sleep 2

# Start settings-app (port 3004)
echo "Starting settings-app on port 3004..."
(cd "$PROJECT_ROOT/frontend/settings-app" && nohup npm start > settings.log 2>&1 &)
sleep 2

# Start orders-app (port 3005)
echo "Starting orders-app on port 3005..."
(cd "$PROJECT_ROOT/frontend/orders-app" && nohup npm start > orders.log 2>&1 &)
sleep 2

# Start catalog-app (port 3006)
echo "Starting catalog-app on port 3006..."
(cd "$PROJECT_ROOT/frontend/catalog-app" && nohup npm start > catalog.log 2>&1 &)
sleep 2

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
echo "Orders:                   http://localhost:3006"
echo "Catalog:                  http://localhost:3005"
echo ""
echo "📝 Logs are being written to:"
echo "Backend:                  backend/mock-data-service/backend.log"
echo "Container:                frontend/container/container.log"
echo "User Management:          frontend/user-management-app/user-management.log"
echo "Data Grid:                frontend/data-grid-app/data-grid.log"
echo "Analytics:                frontend/analytics-app/analytics.log"
echo "Settings:                 frontend/settings-app/settings.log"
echo "Orders:                   frontend/orders-app/orders.log"
echo "Catalog:                  frontend/catalog-app/catalog.log"
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
