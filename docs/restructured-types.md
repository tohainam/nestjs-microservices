# Restructured Types and Service Architecture

## Overview

This document explains the new restructured types and service architecture that provides better scalability and clarity by separating authentication from user management.

## Key Changes Made

### 1. **Type Restructuring**

#### **Before (Mixed Types)**
- `libs/common/src/types/auth.ts` contained both auth and user types
- `UserServiceControllerMethods()` decorator was used for both services
- Confusing naming with `userId` used in multiple contexts

#### **After (Separated Types)**
- `libs/common/src/types/auth.ts` - Only authentication-related types
- `libs/common/src/types/user.ts` - Only user profile-related types
- Clear separation of concerns with distinct decorators

### 2. **Naming Convention Changes**

#### **Auth Service**
- Uses `userId` for its own user records
- Focuses only on authentication (username, email, password, tokens)
- No user profile information

#### **User Service**
- Uses `authUserId` to reference auth-service users
- Manages all user profile information
- Clear relationship to auth-service

### 3. **Service Controller Separation**

#### **Auth Service Controller**
```typescript
@AuthServiceControllerMethods()
export class UserController {
  // Handles: register, login, validateToken, refreshToken
  // All authentication operations
}
```

#### **User Service Controller**
```typescript
@UserServiceControllerMethods()
export class UserController {
  // Handles: createUser, getUserByAuthUserId, updateUserProfile, etc.
  // All user profile operations
}
```

## New Type Structure

### **Auth Service Types** (`libs/common/src/types/auth.ts`)

```typescript
// Core authentication interfaces
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;  // For initial user creation
  lastName: string;   // For initial user creation
}

export interface LoginResponse {
  userId: string;        // Auth service user ID
  accessToken: string;
  refreshToken: string;
  message: string;
  success: boolean;
  errors: string[];
}

// Authentication service
export interface AuthServiceController {
  register(request: RegisterRequest): Promise<RegisterResponse>;
  login(request: LoginRequest): Promise<LoginResponse>;
  validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>;
  authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse>;
  revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse>;
  health(request: HealthRequest): Promise<HealthResponse>;
}

export function AuthServiceControllerMethods() {
  // gRPC method decorators for AuthService
}
```

### **User Service Types** (`libs/common/src/types/user.ts`)

```typescript
// User profile interfaces
export interface CreateUserRequest {
  authUserId: string;    // Reference to auth-service user ID
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  authUserId: string;    // Reference to auth-service user ID
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  // ... other profile fields
}

// User service controller
export interface UserServiceController {
  createUser(request: CreateUserRequest): Promise<CreateUserResponse>;
  getUserByAuthUserId(request: GetUserByAuthUserIdRequest): Promise<GetUserByAuthUserIdResponse>;
  updateUserProfile(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse>;
  // ... other profile operations
}

export function UserServiceControllerMethods() {
  // gRPC method decorators for UserService
}
```

## Service Responsibilities

### **Auth Service** (`apps/auth-service`)
- **Purpose**: Handle user authentication and authorization
- **Data**: username, email, password, tokens, account status
- **Operations**: register, login, validate tokens, refresh tokens
- **Database**: Stores authentication records with `userId`

### **User Service** (`apps/user-service`)
- **Purpose**: Manage user profiles and personal information
- **Data**: firstName, lastName, bio, preferences, address, etc.
- **Operations**: create profile, update profile, search users, etc.
- **Database**: Stores profile records with `authUserId` (references auth-service)

## Data Flow

### **User Registration**
1. **Client** → **API Gateway** (HTTP POST /auth/register)
2. **API Gateway** → **Auth Service** (gRPC Register)
3. **Auth Service** creates authentication record with `userId`
4. **Auth Service** → **User Service** (gRPC CreateUser with `authUserId`)
5. **User Service** creates profile record with `authUserId`
6. **Response** includes `userId` for future operations

### **User Profile Access**
1. **Client** → **API Gateway** (HTTP GET /users/:userId)
2. **API Gateway** → **Auth Service** (gRPC ValidateToken)
3. **API Gateway** → **User Service** (gRPC GetUserByAuthUserId)
4. **User Service** finds profile by `authUserId`
5. **Response** includes user profile data

## Benefits of New Structure

### **1. Clear Separation of Concerns**
- Auth service handles only authentication
- User service handles only user profiles
- No overlapping responsibilities

### **2. Better Scalability**
- Services can be scaled independently
- Clear data boundaries
- Easier to add new services

### **3. Improved Maintainability**
- Types are clearly defined per service
- No confusion about which service handles what
- Easier to understand and modify

### **4. Type Safety**
- `authUserId` clearly indicates relationship to auth service
- `userId` clearly indicates auth service's own identifier
- Compile-time type checking prevents errors

## Migration Notes

### **Breaking Changes**
- User service now uses `authUserId` instead of `userId`
- Auth service no longer handles user profile operations
- All profile operations must go through user service

### **Required Updates**
- Update API Gateway to call appropriate services
- Update client code to use new field names
- Update database queries to use new field names

### **Backward Compatibility**
- Auth service maintains existing authentication endpoints
- User service maintains existing profile endpoints
- Only internal structure and naming has changed

## Example Usage

### **Creating a User**
```typescript
// 1. Register with auth service
const authResponse = await authService.register({
  username: "john_doe",
  email: "john@example.com",
  password: "secure123",
  firstName: "John",
  lastName: "Doe"
});

// 2. Create user profile
const profileResponse = await userService.createUser({
  authUserId: authResponse.userId,  // Reference to auth user
  firstName: "John",
  lastName: "Doe"
});
```

### **Getting User Profile**
```typescript
// 1. Validate token to get userId
const tokenResponse = await authService.validateToken(token);

// 2. Get user profile using authUserId
const profileResponse = await userService.getUserByAuthUserId({
  authUserId: tokenResponse.userId
});
```

## Future Enhancements

### **1. Event-Driven Communication**
- Use message queues for async communication
- Decouple services further
- Improve performance and reliability

### **2. Service Discovery**
- Implement service registry
- Dynamic service discovery
- Load balancing between instances

### **3. Caching Strategy**
- Cache user profiles
- Cache authentication tokens
- Improve response times

## Conclusion

The new structure provides:
- **Clear separation** between authentication and user management
- **Better scalability** through independent services
- **Improved maintainability** with focused responsibilities
- **Type safety** with clear naming conventions
- **Easier debugging** with clear service boundaries

This architecture makes it much easier to scale, maintain, and extend the system while keeping the codebase clean and organized.