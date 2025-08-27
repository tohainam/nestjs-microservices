# User Service

The User Service is responsible for managing user profiles and personal information. It works in conjunction with the Auth Service, which handles authentication.

## Overview

This service manages:
- User profiles and personal information
- User preferences and settings
- User search and discovery
- User status management (active/inactive)

## Architecture

The User Service is designed as a gRPC microservice that:
- Stores user profile data separately from authentication data
- Uses the `userId` from the Auth Service as its primary identifier
- Exposes gRPC endpoints for user management operations
- All requests go through the API Gateway, not directly to this service

## Database Schema

The User entity contains:
- `userId`: Unique identifier from Auth Service
- `firstName`, `lastName`: User's name
- `isActive`: Account status
- `isEmailVerified`: Email verification status
- `lastLoginAt`: Last login timestamp
- `profilePicture`: Profile image URL
- `bio`: User biography
- `dateOfBirth`: Birth date
- `phoneNumber`: Contact number
- `address`: Physical address details
- `preferences`: User preferences and settings

## gRPC Endpoints

### User Management
- `CreateUser` - Create a new user profile
- `GetUserByUserId` - Get user profile by ID
- `UpdateUserProfile` - Update user profile
- `DeleteUser` - Delete user profile

### User Status
- `ActivateUser` - Activate user account
- `DeactivateUser` - Deactivate user account
- `UpdateLastLogin` - Update last login timestamp

### User Search
- `SearchUsers` - Search users by name
- `GetUsersByIds` - Get multiple users by IDs

### Health Check
- `Health` - Service health status

**Note**: These are gRPC endpoints that are exposed through the API Gateway. Clients should not call this service directly.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `USER_GRPC_URL`: gRPC service URL (default: 0.0.0.0:50051)

## Running the Service

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run start:user:dev

# Run in production mode
pnpm run start:user:prod

# Build the service
pnpm run build:user

# Run tests
pnpm run test
```

## Integration with Auth Service

The User Service expects the Auth Service to:
1. Create authentication records with a unique `userId`
2. Pass this `userId` when creating user profiles
3. Use the `userId` for all subsequent operations

## Security Considerations

- All endpoints should be protected by authentication middleware
- User data access should be restricted to the user themselves or authorized administrators
- Sensitive information should be encrypted or masked in responses