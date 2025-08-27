# gRPC Architecture Documentation

## Overview

This document explains the gRPC-based microservices architecture where all services communicate via gRPC and clients interact only through the API Gateway.

## Architecture Diagram

```
┌─────────────┐    HTTP/REST    ┌─────────────┐
│   Client    │ ──────────────→ │ API Gateway │
└─────────────┘                 └─────────────┘
                                         │
                                         │ gRPC
                                         ▼
                    ┌─────────────────────────────────┐
                    │                                 │
              ┌─────▼─────┐                   ┌─────▼─────┐
              │   Auth    │                   │   User    │
              │ Service   │                   │ Service   │
              │ (gRPC)    │                   │ (gRPC)    │
              │ Port 50050│                   │ Port 50051│
              └───────────┘                   └───────────┘
                    │                                 │
                    │ MongoDB                        │ MongoDB
                    ▼                                 ▼
              ┌───────────┐                   ┌───────────┐
              │ Auth DB   │                   │ User DB   │
              └───────────┘                   └───────────┘
```

## Service Communication

### 1. Client → API Gateway
- **Protocol**: HTTP/REST
- **Port**: 8000 (default)
- **Purpose**: All client requests go through the API Gateway

### 2. API Gateway → Microservices
- **Protocol**: gRPC
- **Auth Service**: Port 50050
- **User Service**: Port 50051
- **Purpose**: Internal service communication

### 3. Microservices → Database
- **Protocol**: MongoDB driver
- **Purpose**: Data persistence

## gRPC Benefits

### Performance
- **Protocol Buffers**: Efficient binary serialization
- **HTTP/2**: Multiplexing, compression, and streaming
- **Low Latency**: Faster than REST for internal communication

### Type Safety
- **Strong Typing**: Compile-time type checking
- **Code Generation**: Automatic client/server code generation
- **Contract First**: Proto files define the API contract

### Streaming
- **Unary**: Request-response (most common)
- **Server Streaming**: Server sends multiple responses
- **Client Streaming**: Client sends multiple requests
- **Bidirectional**: Both sides stream simultaneously

## Service Definitions

### Auth Service (Port 50050)
```protobuf
service UserService {
  rpc Register (RegisterRequest) returns (RegisterResponse) {}
  rpc Login (LoginRequest) returns (LoginResponse) {}
  rpc ValidateToken (ValidateTokenRequest) returns (ValidateTokenResponse) {}
  rpc RefreshToken (RefreshTokenRequest) returns (RefreshTokenResponse) {}
}

service AuthService {
  rpc Authenticate (AuthenticateRequest) returns (AuthenticateResponse) {}
  rpc RevokeToken (RevokeTokenRequest) returns (RevokeTokenResponse) {}
  rpc Health (HealthRequest) returns (HealthResponse) {}
}
```

### User Service (Port 50051)
```protobuf
service UserService {
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse) {}
  rpc GetUserByUserId (GetUserByUserIdRequest) returns (GetUserByUserIdResponse) {}
  rpc UpdateUserProfile (UpdateUserProfileRequest) returns (UpdateUserProfileResponse) {}
  rpc DeleteUser (DeleteUserRequest) returns (DeleteUserResponse) {}
  rpc ActivateUser (ActivateUserRequest) returns (ActivateUserResponse) {}
  rpc DeactivateUser (DeactivateUserRequest) returns (DeactivateUserResponse) {}
  rpc UpdateLastLogin (UpdateLastLoginRequest) returns (UpdateLastLoginResponse) {}
  rpc SearchUsers (SearchUsersRequest) returns (SearchUsersResponse) {}
  rpc GetUsersByIds (GetUsersByIdsRequest) returns (GetUsersByIdsResponse) {}
  rpc Health (HealthRequest) returns (HealthResponse) {}
}
```

## Request Flow Examples

### User Registration Flow
1. **Client** → **API Gateway** (HTTP POST /auth/register)
2. **API Gateway** → **Auth Service** (gRPC Register)
3. **Auth Service** → **Database** (Create auth record)
4. **Auth Service** → **User Service** (gRPC CreateUser)
5. **User Service** → **Database** (Create user profile)
6. **User Service** → **Auth Service** (gRPC response)
7. **Auth Service** → **API Gateway** (gRPC response)
8. **API Gateway** → **Client** (HTTP response)

### User Profile Access Flow
1. **Client** → **API Gateway** (HTTP GET /users/:userId)
2. **API Gateway** → **Auth Service** (gRPC ValidateToken)
3. **Auth Service** → **API Gateway** (gRPC validation response)
4. **API Gateway** → **User Service** (gRPC GetUserByUserId)
5. **User Service** → **Database** (Fetch user profile)
6. **User Service** → **API Gateway** (gRPC response)
7. **API Gateway** → **Client** (HTTP response)

## Error Handling

### gRPC Status Codes
- **OK (0)**: Success
- **INVALID_ARGUMENT (3)**: Invalid request parameters
- **NOT_FOUND (5)**: Resource not found
- **PERMISSION_DENIED (7)**: Authentication/authorization failed
- **INTERNAL (13)**: Server error
- **UNAVAILABLE (14)**: Service unavailable

### Error Response Format
```typescript
{
  success: false,
  message: "Error description",
  errors: ["Detailed error 1", "Detailed error 2"]
}
```

## Configuration

### Environment Variables
```bash
# Auth Service
AUTH_GRPC_URL=0.0.0.0:50050
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your-secret-key

# User Service
USER_GRPC_URL=0.0.0.0:50051
MONGODB_URI=mongodb://localhost:27017/user_db

# API Gateway
AUTH_GRPC_URL=localhost:50050
USER_GRPC_URL=localhost:50051
```

### Docker Configuration
```yaml
services:
  auth-service:
    ports:
      - '50050:50050'
  
  user-service:
    ports:
      - '50051:50051'
  
  api-gateway:
    ports:
      - '8000:8000'
```

## Development Workflow

### 1. Start Services
```bash
# Start auth service (gRPC on port 50050)
pnpm run start:auth:dev

# Start user service (gRPC on port 50051)
pnpm run start:user:dev

# Start API gateway (HTTP on port 8000)
pnpm run start:api-gateway:dev
```

### 2. Test Endpoints
```bash
# All requests go through API Gateway
curl http://localhost:8000/auth/register
curl http://localhost:8000/users/search?q=john
```

### 3. Monitor gRPC Communication
```bash
# View service logs
docker logs biz-fseai-auth-service
docker logs biz-fseai-user-service
```

## Best Practices

### 1. Service Isolation
- Services should not expose HTTP endpoints
- All external communication goes through API Gateway
- Services only communicate via gRPC

### 2. Error Handling
- Use appropriate gRPC status codes
- Provide meaningful error messages
- Implement proper logging and monitoring

### 3. Security
- Validate all requests at API Gateway
- Use JWT tokens for authentication
- Implement rate limiting and throttling

### 4. Performance
- Use connection pooling for gRPC clients
- Implement caching strategies
- Monitor service response times

## Troubleshooting

### Common Issues

#### 1. gRPC Connection Failed
```bash
# Check if service is running
docker ps | grep user-service

# Check service logs
docker logs biz-fseai-user-service

# Verify port configuration
netstat -tlnp | grep 50051
```

#### 2. Proto File Not Found
```bash
# Ensure proto files are in the correct location
ls -la proto/user.proto

# Check proto path in main.ts
cat apps/user-service/src/main.ts
```

#### 3. Service Discovery Issues
```bash
# Verify environment variables
cat apps/user-service/.env

# Check gRPC URL format
echo $USER_GRPC_URL
```

### Debug Commands
```bash
# Test gRPC service directly (for debugging)
grpcurl -plaintext localhost:50051 list

# Check service health
grpcurl -plaintext localhost:50051 user.UserService/Health

# View proto definitions
protoc --decode_raw < proto/user.proto
```

## Future Enhancements

### 1. Service Mesh
- Implement Istio or Linkerd for advanced traffic management
- Add circuit breakers and retry policies
- Implement distributed tracing

### 2. Load Balancing
- Add multiple service instances
- Implement client-side load balancing
- Use health checks for instance selection

### 3. Monitoring
- Add Prometheus metrics
- Implement distributed tracing with Jaeger
- Set up alerting and dashboards

### 4. Caching
- Add Redis for session storage
- Implement response caching
- Add database query caching

## Conclusion

The gRPC architecture provides a robust foundation for microservices communication with:
- **High Performance**: Binary protocol and HTTP/2
- **Type Safety**: Strong typing and code generation
- **Scalability**: Efficient internal communication
- **Maintainability**: Clear service boundaries and contracts

All client requests go through the API Gateway, ensuring proper authentication, authorization, and request routing while maintaining service isolation and performance.