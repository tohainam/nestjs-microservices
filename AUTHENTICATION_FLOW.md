# Authentication Flow Implementation

This document describes the authentication flow implementation using NestJS microservices with gRPC communication.

## Architecture Overview

The system consists of two main services:

1. **API Gateway** - Exposes HTTP endpoints and communicates with auth-service via gRPC
2. **Auth Service** - Handles authentication logic and exposes gRPC endpoints only (internal access only)

## Service Communication

- **API Gateway** ↔ **Auth Service**: gRPC communication (internal network only)
- **Auth Service** ↔ **MongoDB**: Direct connection using Mongoose
- **External Clients** ↔ **API Gateway**: HTTP REST API (only external access point)

## Security Architecture

- **Auth Service**: No external port exposure - only accessible via internal Docker network
- **API Gateway**: Single point of entry for all external requests
- **gRPC Communication**: Internal service-to-service communication only
- **Network Isolation**: Auth service isolated from external access

## Authentication Flow

### 1. User Registration

```
Client → API Gateway (POST /auth/register)
  ↓
API Gateway → Auth Service (gRPC Register) [Internal Network]
  ↓
Auth Service → MongoDB (Create User)
  ↓
Response: User ID and success message
```

**Request Example:**
```json
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

### 2. User Login

```
Client → API Gateway (POST /auth/login)
  ↓
API Gateway → Auth Service (gRPC Login) [Internal Network]
  ↓
Auth Service → MongoDB (Validate Credentials)
  ↓
Auth Service → JWT Generation (Access + Refresh Tokens)
  ↓
Response: Access Token, Refresh Token, and User Profile
```

**Request Example:**
```json
POST /auth/login
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Token Validation

```
Client → API Gateway (POST /auth/validate)
  ↓
API Gateway → Auth Service (gRPC ValidateToken) [Internal Network]
  ↓
Auth Service → JWT Verification
  ↓
Response: Token validity and user ID
```

### 4. Token Refresh

```
Client → API Gateway (POST /auth/refresh)
  ↓
API Gateway → Auth Service (gRPC RefreshToken) [Internal Network]
  ↓
Auth Service → JWT Verification (Refresh Token)
  ↓
Auth Service → Generate New Tokens
  ↓
Response: New Access Token and Refresh Token
```

### 5. Protected Routes

```
Client → API Gateway (Protected Endpoint)
  ↓
API Gateway → Auth Guard → Auth Service (gRPC Authenticate) [Internal Network]
  ↓
Auth Service → JWT Verification
  ↓
If Valid: Allow Access
If Invalid: Return 401 Unauthorized
```

## API Endpoints

### Public Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/validate` - Validate token
- `GET /health` - Health check

### Protected Endpoints

- `POST /auth/logout` - User logout (requires valid token)
- `GET /auth/profile/:userId` - Get user profile (requires valid token)
- `PUT /auth/profile/:userId` - Update user profile (requires valid token)

## Security Features

1. **Password Hashing**: Uses bcrypt with 12 salt rounds
2. **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
3. **Token Validation**: Every protected request validates the token
4. **Password Requirements**: Minimum 8 characters with complexity requirements
5. **Input Validation**: DTO validation using class-validator
6. **Network Isolation**: Auth service not accessible from external network
7. **Single Entry Point**: All external requests must go through API Gateway

## Configuration

### Configuration Management

The system uses `@nestjs/config` with `forRootAsync` for advanced configuration:

- **Async Configuration**: Services wait for configuration to be loaded
- **Environment Validation**: `getOrThrow` ensures required values are present
- **Configuration Caching**: Improved performance with config caching
- **Environment File Support**: Multiple .env file support (.env, .env.local)

### Environment Variables

**Auth Service (.env):**
```env
MONGODB_URI=mongodb://mongodb1:27017,mongodb2:27018,mongodb3:27019/auth-service?replicaSet=rs0
AUTH_GRPC_URL=0.0.0.0:5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

**API Gateway (.env):**
```env
PORT=8000
AUTH_GRPC_URL=auth-service:5000
NODE_ENV=development
```

## Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  username: string (unique),
  email: string (unique),
  password: string (hashed),
  firstName: string,
  lastName: string,
  isActive: boolean,
  isEmailVerified: boolean,
  lastLoginAt: Date,
  refreshToken: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Scaling Considerations

The current architecture is designed for easy scaling:

1. **Proto Structure**: Clean separation between User and Auth services
2. **Stateless Services**: Both services are stateless and can be horizontally scaled
3. **Database**: MongoDB replica set for high availability
4. **gRPC**: Efficient binary protocol for inter-service communication
5. **Load Balancing**: Can easily add load balancers in front of API Gateway
6. **Network Isolation**: Auth service protected from external access
7. **Configuration Management**: Async configuration loading for better startup reliability

## Future Enhancements

1. **Rate Limiting**: Protect against brute force attacks
2. **OAuth Integration**: Add social login providers
3. **Two-Factor Authentication**: Implement 2FA using TOTP
4. **Audit Logging**: Log all authentication events
5. **Token Blacklisting**: Implement proper token revocation
6. **Email Verification**: Add email verification flow
7. **Password Reset**: Implement forgot password functionality
8. **Configuration Validation**: Add schema validation for environment variables
9. **Secrets Management**: Integrate with external secrets management systems
10. **Health Checks**: Enhanced health monitoring for all services