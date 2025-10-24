#!/bin/bash

# Test All Errors Script
# Starts all services, runs error tests, and stops services
# Usage: ./test_all_errors.sh [--headless] [--keep-services]

set -e

# Configuration
PROJECT_ROOT="/Users/oudaykhaled/Desktop/golden-sample-react-micro-web /golden-sample-react-micro-web"
OUTPUT_DIR="error_test_results"
HEADLESS=false
KEEP_SERVICES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headless)
      HEADLESS=true
      shift
      ;;
    --keep-services)
      KEEP_SERVICES=true
      shift
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--headless] [--keep-services] [--output-dir OUTPUT_DIR]"
      echo ""
      echo "Options:"
      echo "  --headless        Run browser tests in headless mode"
      echo "  --keep-services   Don't stop services after testing"
      echo "  --output-dir DIR  Output directory for test results (default: error_test_results)"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "run.sh" || ! -f "stop.sh" ]]; then
    log_error "Please run this script from the project root directory"
    log_error "Expected files: run.sh, stop.sh"
    exit 1
fi

# Check Python dependencies
check_python_deps() {
    log_info "Checking Python dependencies..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check if required packages are installed
    python3 -c "import playwright, requests" 2>/dev/null || {
        log_warning "Missing Python dependencies. Installing..."
        pip3 install playwright requests
        playwright install chromium
    }
    
    log_success "Python dependencies are ready"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local all_ready=true
        
        # Check backend
        if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
            all_ready=false
        fi
        
        # Check frontend services
        for port in 3000 3001 3002 3003 3004; do
            if ! curl -s http://localhost:$port > /dev/null 2>&1; then
                all_ready=false
                break
            fi
        done
        
        if [ "$all_ready" = true ]; then
            log_success "All services are ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    log_error "Services did not become ready within $(($max_attempts * 2)) seconds"
    return 1
}

# Main execution
main() {
    echo "🧪 Starting Comprehensive Error Testing Suite"
    echo "=============================================="
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Check dependencies
    check_python_deps
    
    # Stop any existing services
    log_info "Stopping any existing services..."
    ./stop.sh > /dev/null 2>&1 || true
    
    # Start all services
    log_info "Starting all services..."
    ./run.sh
    
    # Wait for services to be ready
    if ! wait_for_services; then
        log_error "Failed to start services"
        exit 1
    fi
    
    # Give services extra time to fully initialize
    log_info "Allowing services to fully initialize..."
    sleep 10
    
    # Run error tests
    log_info "Running error tests..."
    echo ""
    
    # Build test command
    test_cmd="python3 test_errors.py --output-dir '$OUTPUT_DIR'"
    if [ "$HEADLESS" = true ]; then
        test_cmd="$test_cmd --headless"
    fi
    
    # Run the tests
    if eval $test_cmd; then
        log_success "Error tests completed successfully!"
        test_result=0
    else
        log_error "Error tests failed or found issues"
        test_result=1
    fi
    
    # Stop services unless --keep-services is specified
    if [ "$KEEP_SERVICES" = false ]; then
        log_info "Stopping all services..."
        ./stop.sh > /dev/null 2>&1
        log_success "Services stopped"
    else
        log_info "Keeping services running (--keep-services specified)"
    fi
    
    # Show results location
    echo ""
    echo "📊 Test Results:"
    echo "=================="
    if [ -d "$OUTPUT_DIR" ]; then
        echo "📁 Results directory: $OUTPUT_DIR"
        
        # List generated files
        if ls "$OUTPUT_DIR"/*.html > /dev/null 2>&1; then
            echo "🌐 HTML Reports:"
            ls -la "$OUTPUT_DIR"/*.html | awk '{print "   " $9 " (" $5 " bytes)"}'
        fi
        
        if ls "$OUTPUT_DIR"/*.json > /dev/null 2>&1; then
            echo "📄 JSON Reports:"
            ls -la "$OUTPUT_DIR"/*.json | awk '{print "   " $9 " (" $5 " bytes)"}'
        fi
        
        if ls "$OUTPUT_DIR"/*.png > /dev/null 2>&1; then
            screenshot_count=$(ls "$OUTPUT_DIR"/*.png | wc -l)
            echo "📸 Screenshots: $screenshot_count files"
        fi
        
        # Open HTML report if available and not headless
        if [ "$HEADLESS" = false ] && ls "$OUTPUT_DIR"/*.html > /dev/null 2>&1; then
            latest_html=$(ls -t "$OUTPUT_DIR"/*.html | head -1)
            log_info "Opening HTML report: $latest_html"
            open "$latest_html" 2>/dev/null || {
                log_warning "Could not open HTML report automatically"
                echo "   Please open: $latest_html"
            }
        fi
    fi
    
    echo ""
    if [ $test_result -eq 0 ]; then
        log_success "All error tests passed! 🎉"
    else
        log_warning "Error tests completed with issues. Check the reports for details."
    fi
    
    exit $test_result
}

# Trap to ensure cleanup on script exit
cleanup() {
    if [ "$KEEP_SERVICES" = false ]; then
        log_info "Cleaning up services..."
        ./stop.sh > /dev/null 2>&1 || true
    fi
}

trap cleanup EXIT

# Run main function
main "$@"
