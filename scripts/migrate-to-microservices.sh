#!/bin/bash

# Migration Script for Microservices Architecture
# This script helps migrate from monolithic auth-service to microservices

set -e

echo "🚀 Starting migration to microservices architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
    fi
    
    print_status "Requirements check completed."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    pnpm install
    
    # Install service-specific dependencies
    if [ -d "apps/auth-service" ]; then
        print_status "Installing auth-service dependencies..."
        cd apps/auth-service && pnpm install && cd ../..
    fi
    
    if [ -d "apps/user-service" ]; then
        print_status "Installing user-service dependencies..."
        cd apps/user-service && pnpm install && cd ../..
    fi
    
    print_status "Dependencies installation completed."
}

# Build services
build_services() {
    print_status "Building services..."
    
    # Build auth-service
    if [ -d "apps/auth-service" ]; then
        print_status "Building auth-service..."
        pnpm run build:auth
    fi
    
    # Build user-service
    if [ -d "apps/user-service" ]; then
        print_status "Building user-service..."
        pnpm run build:user
    fi
    
    print_status "Services build completed."
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Create .env.example for auth-service
    if [ ! -f "apps/auth-service/.env.example" ]; then
        cat > apps/auth-service/.env.example << EOF
# Auth Service Environment Variables
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
EOF
        print_status "Created auth-service .env.example"
    fi
    
    # Create .env.example for user-service
    if [ ! -f "apps/user-service/.env.example" ]; then
        cat > apps/user-service/.env.example << EOF
# User Service Environment Variables
MONGODB_URI=mongodb://localhost:27017/user_db
PORT=3002
EOF
        print_status "Created user-service .env.example"
    fi
    
    print_warning "Please copy .env.example to .env and update the values for your environment."
}

# Database migration helper
setup_database() {
    print_status "Setting up database..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting MongoDB with Docker..."
        docker run -d --name mongodb -p 27017:27017 mongo:latest
        
        print_status "Waiting for MongoDB to start..."
        sleep 10
        
        print_status "MongoDB is running on localhost:27017"
    else
        print_warning "Docker not available. Please ensure MongoDB is running on localhost:27017"
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check if services can start
    print_status "Testing auth-service..."
    timeout 10s pnpm run start:auth || print_warning "auth-service health check failed"
    
    print_status "Testing user-service..."
    timeout 10s pnpm run start:user || print_warning "user-service health check failed"
    
    print_status "Health check completed."
}

# Main migration function
main() {
    print_status "Starting microservices migration..."
    
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    build_services
    health_check
    
    print_status "Migration completed successfully! 🎉"
    print_status ""
    print_status "Next steps:"
    print_status "1. Copy .env.example to .env in both services"
    print_status "2. Update environment variables with your values"
    print_status "3. Start services with: pnpm run start:auth:dev & pnpm run start:user:dev"
    print_status "4. Test the services with the provided endpoints"
    print_status ""
    print_status "For more information, see docs/architecture.md"
}

# Run migration
main "$@"