#!/bin/bash

# Automated Error Detection and Fixing System
# This script monitors your application and automatically fixes errors

set -e

echo "🤖 Starting Automated Error Fixer"
echo "=================================="
echo ""

# Check if services are running
if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Services are not running. Starting services first..."
    ./run.sh
    echo ""
    echo "⏳ Waiting 60 seconds for services to start..."
    sleep 60
fi

# Check if playwright is installed
if ! python3 -c "import playwright" 2>/dev/null; then
    echo "📦 Installing required dependencies..."
    pip3 install playwright requests
    python3 -m playwright install chromium
fi

echo ""
echo "✅ All prerequisites met. Starting error monitor..."
echo ""
echo "The script will:"
echo "  • Monitor webpack compilation errors"
echo "  • Monitor runtime errors in the browser"
echo "  • Automatically fix common issues:"
echo "    - Missing npm packages"
echo "    - Import path errors"
echo "    - TypeScript type errors"
echo "    - Module not found errors"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""
echo "=================================="
echo ""

# Run the auto-fixer
python3 auto_fix_errors.py "$@"

echo ""
echo "✅ Monitoring complete!"





