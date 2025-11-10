#!/bin/bash

# Backend API Testing Script
# Tests all User Management and Catalog backend endpoints directly

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-https://dev-creamat.fds-1.com}"
OUTPUT_FILE="/tmp/backend-api-test-results.json"
INSECURE_FLAG="--insecure" # For self-signed certificates

# Initialize results
declare -A test_results
total_tests=0
passed_tests=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((passed_tests++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

# Test API endpoint
test_endpoint() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local auth_token=$6
    
    ((total_tests++))
    log_test "$test_name"
    
    # Build curl command
    local cmd="curl $INSECURE_FLAG -s -w '\n%{http_code}' -X $method"
    
    # Add authorization if provided
    if [ -n "$auth_token" ]; then
        cmd="$cmd -H 'Authorization: Bearer $auth_token'"
    fi
    
    # Add content type for POST/PUT
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        cmd="$cmd -H 'Content-Type: application/json'"
    fi
    
    # Add data if provided
    if [ -n "$data" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    # Add URL
    cmd="$cmd '$BACKEND_URL$endpoint'"
    
    # Execute and capture response
    response=$(eval $cmd)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    # Check if response matches expected status
    if [[ "$expected_status" =~ "$http_code" ]]; then
        log_success "$test_name - HTTP $http_code"
        echo "Response: $body" | head -c 200
        echo ""
        return 0
    else
        log_error "$test_name - Expected HTTP $expected_status, got $http_code"
        echo "Response: $body" | head -c 500
        echo ""
        return 1
    fi
}

# Phase 1: Test User Management Endpoints

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Phase 1: User Management Backend Tests${NC}"
echo -e "${YELLOW}========================================${NC}"

# Test 1: Get all users
log_info "Testing GET /api/User/all"
test_endpoint "Get All Users" "GET" "/api/User/all?skip=0&limit=50" "" "200" || true

# Test 2: Register new user
log_info "Testing POST /api/User/register"
register_data='{
  "email": "test.user@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}'
test_endpoint "Register User" "POST" "/api/User/register" "$register_data" "200|403" || true

# Test 3: Login user
log_info "Testing POST /api/User/login"
login_data='{
  "email": "test.user@example.com",
  "password": "TestPassword123!"
}'
response=$(curl $INSECURE_FLAG -s -X POST "$BACKEND_URL/api/User/login" \
  -H "Content-Type: application/json" \
  -d "$login_data")
login_response=$(echo "$response" | tail -n 1)
log_test "Login User"
echo "Response: $response" | head -c 500
AUTH_TOKEN=$(echo "$response" | jq -r '.authToken' 2>/dev/null || echo "")
if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
    log_success "Login User - Got auth token"
else
    log_error "Login User - Failed to get auth token"
fi
echo ""

# Test 4: Get user profile (requires token)
if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
    log_info "Testing GET /api/User/profile/{userId}"
    # Extract user ID from login response
    USER_ID=$(echo "$response" | jq -r '.userId' 2>/dev/null || echo "")
    if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        test_endpoint "Get User Profile" "GET" "/api/User/profile/$USER_ID" "" "200|401" "$AUTH_TOKEN" || true
    fi
fi

# Test 5: Check CORS headers
log_info "Testing CORS headers on GET /api/User/all"
cors_response=$(curl $INSECURE_FLAG -s -i -X OPTIONS "$BACKEND_URL/api/User/all" 2>&1 || echo "")
if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
    log_success "CORS headers present"
    echo "$cors_response" | grep -i "access-control" || true
else
    log_error "CORS headers not found"
fi
echo ""

# Phase 2: Test Catalog Endpoints

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Phase 2: Catalog Backend Tests${NC}"
echo -e "${YELLOW}========================================${NC}"

# Test 1: Get all categories
log_info "Testing GET /api/Catalog/Category/All/{pageSize}/{pageNumber}"
test_endpoint "Get All Categories (Page 1, Size 10)" "GET" "/api/Catalog/Category/All/10/1" "" "200|403" || true

# Test 2: Get all categories with different pagination
test_endpoint "Get All Categories (Page 2, Size 5)" "GET" "/api/Catalog/Category/All/5/2" "" "200|403" || true

# Test 3: Create category
log_info "Testing POST /api/Catalog/Category"
create_category_data='{
  "name": "Test Category",
  "description": "Test category description"
}'
response=$(curl $INSECURE_FLAG -s -X POST "$BACKEND_URL/api/Catalog/Category" \
  -H "Content-Type: application/json" \
  -d "$create_category_data")
log_test "Create Category"
echo "Response: $response" | head -c 500
echo ""
# Extract category GUID if successful
CATEGORY_GUID=$(echo "$response" | jq -r '.guid // .id // empty' 2>/dev/null | head -1)

# Test 4: Get specific category
if [ -n "$CATEGORY_GUID" ]; then
    test_endpoint "Get Category by GUID" "GET" "/api/Catalog/Category/$CATEGORY_GUID" "" "200|404" || true
fi

# Test 5: Check Catalog CORS headers
log_info "Testing CORS headers on GET /api/Catalog/Category/All/10/1"
cors_response=$(curl $INSECURE_FLAG -s -i -X OPTIONS "$BACKEND_URL/api/Catalog/Category/All/10/1" 2>&1 || echo "")
if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
    log_success "Catalog CORS headers present"
    echo "$cors_response" | grep -i "access-control" || true
else
    log_error "Catalog CORS headers not found"
fi
echo ""

# Phase 3: BFF Integration Tests

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Phase 3: BFF Proxy Integration Tests${NC}"
echo -e "${YELLOW}========================================${NC}"

# Test User Management BFF
log_info "Testing User Management BFF on port 4001"
bff_response=$(curl -s http://localhost:4001/health 2>/dev/null || echo "")
if [ -n "$bff_response" ]; then
    log_success "User Management BFF is running"
    echo "Response: $bff_response" | head -c 200
else
    log_error "User Management BFF is not responding"
fi
echo ""

# Test Catalog BFF
log_info "Testing Catalog BFF on port 4006"
bff_response=$(curl -s http://localhost:4006/health 2>/dev/null || echo "")
if [ -n "$bff_response" ]; then
    log_success "Catalog BFF is running"
    echo "Response: $bff_response" | head -c 200
else
    log_error "Catalog BFF is not responding"
fi
echo ""

# Summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Total tests: $total_tests"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$((total_tests - passed_tests))${NC}"
echo -e "Success rate: $(echo "scale=2; $passed_tests * 100 / $total_tests" | bc)%"
echo ""

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Review the output above.${NC}"
    exit 1
fi

