# User Service

The User Service is responsible for managing user profiles and personal information. It works in conjunction with the Auth Service, which handles authentication.

## Overview

This service manages:
- User profiles and personal information
- User preferences and settings
- User search and discovery
- User status management (active/inactive)

## Architecture

The User Service is designed as a microservice that:
- Stores user profile data separately from authentication data
- Uses the `userId` from the Auth Service as its primary identifier
- Provides RESTful APIs for user management operations

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

## API Endpoints

### User Management
- `POST /api/v1/users` - Create a new user profile
- `GET /api/v1/users/:userId` - Get user profile by ID
- `PUT /api/v1/users/:userId` - Update user profile
- `DELETE /api/v1/users/:userId` - Delete user profile

### User Status
- `PUT /api/v1/users/:userId/activate` - Activate user account
- `PUT /api/v1/users/:userId/deactivate` - Deactivate user account
- `PUT /api/v1/users/:userId/last-login` - Update last login timestamp

### User Search
- `GET /api/v1/users/search?q=query&limit=10` - Search users by name
- `POST /api/v1/users/batch` - Get multiple users by IDs

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Service port (default: 3002)

## Running the Service

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run start:dev

# Run in production mode
pnpm run start:prod

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