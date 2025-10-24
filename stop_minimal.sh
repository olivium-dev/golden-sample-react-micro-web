#!/bin/bash

# Stop all micro-frontend services

echo "🛑 Stopping Golden Sample Micro-Frontend Platform"
echo "=================================================="
echo ""

echo "Killing processes on ports 3000-3004 and 8000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 3000 (Container)"
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 3001 (User Management)"
lsof -ti:3002 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 3002 (Data Grid)"
lsof -ti:3003 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 3003 (Analytics)"
lsof -ti:3004 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 3004 (Settings)"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "  ✅ Stopped port 8000 (Backend)"

echo ""
echo "Killing any remaining webpack and FastAPI processes..."
pkill -f "webpack.*minimal" 2>/dev/null && echo "  ✅ Stopped webpack processes"
pkill -f "FastAPI" 2>/dev/null && echo "  ✅ Stopped FastAPI processes"

echo ""
echo "✅ All services stopped!"
echo ""
echo "🚀 To restart, run:"
echo "  ./run_minimal.sh"
echo ""

