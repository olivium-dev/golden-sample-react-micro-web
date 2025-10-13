#!/bin/bash

# Script to stop all micro-frontend and backend services
# Usage: ./stop.sh

echo "🛑 Stopping all micro-frontend and backend services..."

# Kill processes on specific ports
echo "Killing processes on ports 3000-3004 and 8000..."
for port in 3000 3001 3002 3003 3004 8000; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || true
    else
        echo "No process found on port $port"
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

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "🚀 To restart all services, run:"
echo "./run.sh"
