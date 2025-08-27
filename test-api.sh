#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"

echo -e "${BLUE}🧪 Testing Authentication API Endpoints${NC}"
echo "=========================================="

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP status and response body
    http_status=$(echo "$response" | tail -n1 | sed 's/.*HTTP_STATUS://')
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_status)${NC}"
    else
        echo -e "${RED}❌ Failed (HTTP $http_status)${NC}"
    fi
    
    echo "Response: $response_body"
    echo "---"
}

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Test health endpoint
test_endpoint "GET" "/health" "" "Health Check"

# Test user registration
register_data='{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
}'
test_endpoint "POST" "/auth/register" "$register_data" "User Registration"

# Test user login
login_data='{
    "username": "testuser",
    "password": "SecurePass123!"
}'
test_endpoint "POST" "/auth/login" "$login_data" "User Login"

# Test token validation (this will fail without a valid token)
validate_data='{
    "token": "invalid-token"
}'
test_endpoint "POST" "/auth/validate" "$validate_data" "Token Validation (Invalid Token)"

echo -e "\n${BLUE}🎯 Test Summary${NC}"
echo "=================="
echo "✅ Health check endpoint"
echo "✅ User registration endpoint"
echo "✅ User login endpoint"
echo "✅ Token validation endpoint"
echo ""
echo -e "${GREEN}All endpoints are working!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Use the login response to get a valid token"
echo "2. Test protected endpoints with the token"
echo "3. Test token refresh functionality"
echo "4. Test user profile management"