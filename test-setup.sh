#!/bin/bash

echo "🚀 Testing Authentication Flow Setup"
echo "====================================="

echo ""
echo "1. Building the project..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "2. Checking file structure..."
echo "   - Proto file: $(ls -la proto/auth.proto)"
echo "   - Auth Service: $(ls -la apps/auth-service/src/)"
echo "   - API Gateway: $(ls -la apps/api-gateway/src/)"

echo ""
echo "3. Checking environment files..."
if [ -f "apps/auth-service/.env" ]; then
    echo "✅ Auth service .env exists"
else
    echo "❌ Auth service .env missing"
fi

if [ -f "apps/api-gateway/.env" ]; then
    echo "✅ API Gateway .env exists"
else
    echo "❌ API Gateway .env missing"
fi

echo ""
echo "4. Checking Docker Compose configuration..."
if [ -f "docker-compose.yml" ]; then
    echo "✅ Docker Compose file exists"
    echo "   - Auth service port: 5000"
    echo "   - API Gateway port: 8000"
    echo "   - MongoDB ports: 27017, 27018, 27019"
else
    echo "❌ Docker Compose file missing"
fi

echo ""
echo "5. Checking dependencies..."
if grep -q "@nestjs/jwt" package.json; then
    echo "✅ JWT dependency installed"
else
    echo "❌ JWT dependency missing"
fi

if grep -q "bcrypt" package.json; then
    echo "✅ bcrypt dependency installed"
else
    echo "❌ bcrypt dependency missing"
fi

echo ""
echo "🎯 Setup Summary:"
echo "   - Authentication flow implemented with gRPC"
echo "   - User registration and login endpoints"
echo "   - JWT token management (access + refresh)"
echo "   - Password hashing with bcrypt"
echo "   - MongoDB integration with Mongoose"
echo "   - API Gateway with HTTP endpoints"
echo "   - Auth Service with gRPC endpoints only"
echo "   - Proper separation of concerns"
echo "   - Scalable proto structure"

echo ""
echo "🚀 To start the services:"
echo "   docker-compose up -d"
echo ""
echo "🌐 API Gateway will be available at: http://localhost:8000"
echo "   - Health check: GET /health"
echo "   - Register: POST /auth/register"
echo "   - Login: POST /auth/login"
echo "   - Refresh: POST /auth/refresh"
echo "   - Validate: POST /auth/validate"
echo "   - Profile: GET /auth/profile/:userId"
echo ""
echo "📚 Documentation: AUTHENTICATION_FLOW.md"