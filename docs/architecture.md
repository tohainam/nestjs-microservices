# Service Architecture Documentation

## Overview

This document describes the new microservice architecture that separates authentication from user management.

## Architecture Changes

### Before (Monolithic Auth Service)
- Single service handling both authentication and user profile management
- User entity contained both auth data (username, password, tokens) and profile data (firstName, lastName, etc.)
- All user operations were centralized in one service

### After (Microservices Architecture)
- **Auth Service**: Handles authentication, authorization, and token management
- **User Service**: Manages user profiles, preferences, and personal information
- Clear separation of concerns with well-defined boundaries

## Service Responsibilities

### Auth Service (`apps/auth-service`)
**Purpose**: Handle user authentication and authorization

**Responsibilities**:
- User registration and login
- Password management and validation
- JWT token generation and validation
- Refresh token management
- User authentication verification

**Data Model**:
```typescript
{
  username: string,        // Unique username
  email: string,          // Unique email
  password: string,       // Hashed password
  isActive: boolean,      // Account status
  isEmailVerified: boolean, // Email verification status
  refreshToken?: string   // Current refresh token
}
```

**Key Operations**:
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /validate-token` - Token validation
- `POST /refresh-token` - Token refresh

### User Service (`apps/user-service`)
**Purpose**: Manage user profiles and personal information

**Responsibilities**:
- User profile creation and management
- Personal information storage
- User preferences and settings
- User search and discovery
- Profile status management

**Data Model**:
```typescript
{
  userId: string,         // Reference to auth-service user ID
  firstName: string,      // User's first name
  lastName: string,       // User's last name
  isActive: boolean,      // Profile status
  isEmailVerified: boolean, // Email verification status
  lastLoginAt?: Date,    // Last login timestamp
  profilePicture?: string, // Profile image URL
  bio?: string,          // User biography
  dateOfBirth?: Date,    // Birth date
  phoneNumber?: string,  // Contact number
  address?: object,      // Physical address
  preferences?: object   // User preferences
}
```

**Key Operations**:
- `POST /users` - Create user profile
- `GET /users/:userId` - Get user profile
- `PUT /users/:userId` - Update user profile
- `DELETE /users/:userId` - Delete user profile
- `GET /users/search` - Search users
- `POST /users/batch` - Get multiple users

## Data Flow

### User Registration Flow
1. Client sends registration request to Auth Service
2. Auth Service validates input and creates authentication record
3. Auth Service generates unique `userId`
4. Auth Service calls User Service to create user profile
5. User Service creates profile with the provided `userId`
6. Response includes `userId` for future operations

### User Authentication Flow
1. Client sends login request to Auth Service
2. Auth Service validates credentials
3. Auth Service generates access and refresh tokens
4. Auth Service calls User Service to update last login
5. Response includes tokens and `userId`

### Profile Access Flow
1. Client includes JWT token in request to User Service
2. User Service validates token with Auth Service
3. User Service processes the request using `userId` from token
4. Response includes user profile data

## Integration Points

### Service Communication
- **Synchronous**: REST API calls between services
- **Asynchronous**: Event-driven communication (future enhancement)
- **Shared Data**: `userId` as the common identifier

### Error Handling
- Each service handles its own domain errors
- Cross-service errors are logged and handled gracefully
- Fallback mechanisms for critical operations

### Security
- JWT tokens for service-to-service authentication
- Role-based access control for user operations
- Data encryption for sensitive information

## Configuration

### Environment Variables
Both services require:
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_ACCESS_EXPIRES_IN`: Access token expiration time

### Port Configuration
- Auth Service: gRPC Port 50050 (default)
- User Service: gRPC Port 50051 (default)
- API Gateway: HTTP Port 8000 (default)

## Deployment

### Docker
Each service has its own Dockerfile and can be deployed independently:
```bash
# Build services
docker build -t auth-service apps/auth-service/
docker build -t user-service apps/user-service/

# Run services
docker run -p 50050:50050 auth-service
docker run -p 50051:50051 user-service
```

### Development
```bash
# Start auth service
pnpm run start:auth:dev

# Start user service
pnpm run start:user:dev

# Build specific service
pnpm run build:auth
pnpm run build:user
```

## Migration Strategy

### Phase 1: Service Creation
- [x] Create User Service structure
- [x] Define User entity and service
- [x] Implement basic CRUD operations

### Phase 2: Auth Service Refactoring
- [x] Remove profile-related fields from User entity
- [x] Update User Service to focus on authentication
- [x] Maintain backward compatibility

### Phase 3: Integration
- [x] Implement service-to-service communication
- [x] Add error handling and logging
- [x] Create integration tests

### Phase 4: Production Deployment
- [ ] Deploy services to staging environment
- [ ] Perform integration testing
- [ ] Deploy to production
- [ ] Monitor service health and performance

## Benefits

### Scalability
- Services can be scaled independently
- Database connections can be optimized per service
- Load balancing can be applied per service

### Maintainability
- Clear separation of concerns
- Easier to understand and modify individual services
- Independent deployment and updates

### Technology Flexibility
- Each service can use different technologies
- Database choices can be optimized per service
- Programming languages can vary per service

### Team Organization
- Teams can work on different services independently
- Reduced merge conflicts
- Faster development cycles

## Future Enhancements

### Event-Driven Architecture
- Implement message queues for asynchronous communication
- Add event sourcing for audit trails
- Implement CQRS pattern for read/write separation

### API Gateway
- Centralized routing and load balancing
- Rate limiting and throttling
- Authentication middleware

### Monitoring and Observability
- Distributed tracing with Jaeger
- Metrics collection with Prometheus
- Centralized logging with ELK stack

### Caching Strategy
- Redis for session management
- CDN for static assets
- Database query optimization

## Troubleshooting

### Common Issues
1. **Service Communication Failures**: Check network connectivity and service health
2. **Database Connection Issues**: Verify MongoDB URI and credentials
3. **JWT Token Problems**: Ensure JWT_SECRET is properly configured
4. **Port Conflicts**: Verify service ports are not already in use

### Debug Commands
```bash
# Check service status (through API Gateway)
curl http://localhost:8000/health

# View service logs
docker logs <service-container-id>

# Test service endpoints (through API Gateway)
curl -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

## Conclusion

This new architecture provides a solid foundation for scalable, maintainable microservices. The clear separation between authentication and user management allows for better resource utilization and easier maintenance. As the system grows, additional services can be added following the same patterns established here.