#!/bin/bash

# Setup environment files for the microservices
echo "Setting up environment files..."

# Copy environment files for auth-service
if [ -f "apps/auth-service/.env.example" ]; then
    cp apps/auth-service/.env.example apps/auth-service/.env
    echo "✅ Created apps/auth-service/.env"
else
    echo "❌ apps/auth-service/.env.example not found"
fi

# Copy environment files for api-gateway
if [ -f "apps/api-gateway/.env.example" ]; then
    cp apps/api-gateway/.env.example apps/api-gateway/.env
    echo "✅ Created apps/api-gateway/.env"
else
    echo "❌ apps/api-gateway/.env.example not found"
fi

echo "Environment setup complete!"
echo ""
echo "⚠️  IMPORTANT: Please review and update the .env files with your actual values:"
echo "   - apps/auth-service/.env"
echo "   - apps/api-gateway/.env"
echo ""
echo "   Make sure to change the JWT_SECRET to a secure value in production!"
