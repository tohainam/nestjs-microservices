# Environment Configuration

## Overview

This project uses a service-specific environment configuration approach where each microservice has its own environment files. This provides better isolation, security, and flexibility for different deployment scenarios.

## Structure

```
nestjs-microservices/
├── apps/
│   ├── api-gateway/
│   │   ├── .env                 # API Gateway environment (not committed)
│   │   └── .env.example         # API Gateway environment template
│   └── auth-service/
│       ├── .env                 # Auth Service environment (not committed)
│       └── .env.example         # Auth Service environment template
└── .env.example                 # Global environment template (deprecated)
```

## Service-Specific Configuration

### API Gateway (`apps/api-gateway/`)

**Environment Variables:**
- `NODE_ENV`: Application environment (development, production, staging)
- `PORT`: HTTP server port (default: 8000)
- `AUTH_GRPC_URL`: gRPC connection URL for auth service
- `CORS_ORIGINS`: Allowed CORS origins
- `RATE_LIMIT_TTL`: Rate limiting time window
- `RATE_LIMIT_LIMIT`: Rate limiting request count
- `LOG_LEVEL`: Logging level
- `ENABLE_SWAGGER`: Enable/disable Swagger documentation
- `ENABLE_HEALTH_CHECK`: Enable/disable health check endpoints
- `ENABLE_METRICS`: Enable/disable metrics collection
- `METRICS_PORT`: Metrics server port

**Example:**
```bash
# apps/api-gateway/.env
NODE_ENV=development
PORT=8000
AUTH_GRPC_URL=0.0.0.0:50051
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
ENABLE_SWAGGER=true
```

### Auth Service (`apps/auth-service/`)

**Environment Variables:**
- `NODE_ENV`: Application environment
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens
- `JWT_ACCESS_EXPIRES_IN`: Access token expiration time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time
- `AUTH_GRPC_URL`: gRPC server binding address
- `LOG_LEVEL`: Logging level
- `ENABLE_REQUEST_LOGGING`: Enable request logging
- `ENABLE_HEALTH_CHECK`: Enable health check endpoints

**Example:**
```bash
# apps/auth-service/.env
NODE_ENV=development
MONGODB_URI=mongodb://mongodb1:27017,mongodb2:27018,mongodb3:27019/auth_db?replicaSet=rs0
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AUTH_GRPC_URL=0.0.0.0:50051
LOG_LEVEL=debug
```

## Docker Configuration

The `docker-compose.yml` file is configured to use service-specific environment files:

```yaml
services:
  api-gateway:
    env_file:
      - ./apps/api-gateway/.env
    # ... other configuration

  auth-service:
    env_file:
      - ./apps/auth-service/.env
    # ... other configuration
```

## Environment File Management

### Development Setup

1. **Copy example files:**
   ```bash
   cp apps/api-gateway/.env.example apps/api-gateway/.env
   cp apps/auth-service/.env.example apps/auth-service/.env
   ```

2. **Customize values:**
   - Update database connection strings
   - Generate strong JWT secrets
   - Configure CORS origins
   - Set appropriate log levels

### Production Deployment

1. **Create production environment files:**
   ```bash
   cp apps/api-gateway/.env.example apps/api-gateway/.env.production
   cp apps/auth-service/.env.example apps/auth-service/.env.production
   ```

2. **Update with production values:**
   - Use strong, unique secrets
   - Configure production database URLs
   - Set appropriate CORS origins
   - Disable development features

3. **Use in Docker:**
   ```yaml
   services:
     api-gateway:
       env_file:
         - ./apps/api-gateway/.env.production
   ```

## Security Best Practices

### JWT Secrets

- **Never use default secrets** in production
- **Generate strong random secrets:**
  ```bash
  openssl rand -base64 64
  ```
- **Use different secrets** for access and refresh tokens
- **Rotate secrets** periodically

### Database Security

- **Use connection strings** with authentication
- **Limit network access** to database containers
- **Use environment-specific** database instances
- **Encrypt sensitive data** in transit and at rest

### CORS Configuration

- **Restrict origins** to trusted domains only
- **Use HTTPS** in production
- **Avoid wildcard origins** (`*`)

## Environment-Specific Configurations

### Development
- Enable debug logging
- Enable Swagger documentation
- Use local/containerized services
- Enable request logging

### Staging
- Use staging database instances
- Enable detailed logging
- Enable health checks and metrics
- Use staging-specific secrets

### Production
- Use production database instances
- Minimal logging (warn/error only)
- Disable development features
- Use strong, unique secrets
- Enable monitoring and metrics

## Troubleshooting

### Common Issues

1. **Environment file not found:**
   - Ensure `.env` files exist in service directories
   - Check file permissions
   - Verify docker-compose.yml paths

2. **Configuration not loaded:**
   - Restart containers after environment changes
   - Check ConfigModule configuration
   - Verify environment variable names

3. **Permission denied:**
   - Check file ownership and permissions
   - Ensure Docker can read environment files

### Validation

Use the health check endpoints to verify configuration:

```bash
# API Gateway health check
curl http://localhost:8000/v1/health

# Auth Service health check (if exposed)
curl http://localhost:50051/health
```

## Migration from Global Environment

If migrating from a global `.env` file:

1. **Identify required variables** for each service
2. **Create service-specific** `.env` files
3. **Update docker-compose.yml** to use service-specific files
4. **Test each service** independently
5. **Remove global** `.env` file

## References

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [12-Factor App Configuration](https://12factor.net/config)
