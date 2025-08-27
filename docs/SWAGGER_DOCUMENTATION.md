# Swagger API Documentation Setup

## 🎯 Overview

This document describes the Swagger/OpenAPI documentation setup for the Authentication API Gateway, following NestJS 10+ standards. The API documentation provides an interactive interface for testing all authentication endpoints.

## 🚀 Features

### **Interactive API Documentation**
- **Swagger UI**: Visual interface for API exploration
- **Try It Out**: Test endpoints directly from the browser
- **Request/Response Examples**: Pre-filled examples for all endpoints
- **Authentication Support**: JWT Bearer token integration
- **Response Models**: Detailed response schemas
- **Error Handling**: Comprehensive error documentation

### **API Organization**
- **Authentication Tag**: User registration, login, and token management
- **Health Tag**: Service health monitoring
- **Versioning**: API versioning with `/v1` prefix
- **CORS Support**: Cross-origin resource sharing enabled

## 📚 API Endpoints Documentation

### **Base URL**
```
Local Development: http://localhost:8000
Production: https://api.yourcompany.com
API Documentation: http://localhost:8000/api
```

### **API Versioning**
All endpoints are prefixed with `/v1`:
```
http://localhost:8000/v1/auth/register
http://localhost:8000/v1/auth/login
http://localhost:8000/v1/health
```

## 🔐 Authentication Endpoints

### **1. User Registration**
```http
POST /v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

### **2. User Login**
```http
POST /v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
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

### **3. Token Refresh**
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **4. Token Validation**
```http
POST /v1/auth/validate
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "isValid": true,
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

### **5. User Logout**
```http
POST /v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### **6. Get User Profile**
```http
GET /v1/auth/profile/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **7. Update User Profile**
```http
PUT /v1/auth/profile/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Johnny",
  "lastName": "Doe",
  "email": "johnny@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "johnny@example.com",
    "firstName": "Johnny",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🏥 Health Endpoints

### **Health Check**
```http
GET /v1/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "api-gateway",
  "version": "1.0.0",
  "details": {
    "uptime": 9000.123,
    "memory": "45.2 MB",
    "environment": "development"
  }
}
```

## 🔧 Swagger Configuration

### **Document Builder Configuration**
```typescript
const config = new DocumentBuilder()
  .setTitle('Authentication API Gateway')
  .setDescription('Comprehensive API documentation...')
  .setVersion('1.0.0')
  .setContact('Development Team', 'https://github.com/...', 'dev@...')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addTag('Authentication', 'User authentication endpoints')
  .addTag('Health', 'Service health monitoring')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
  }, 'JWT-auth')
  .addServer('http://localhost:8000', 'Local Development')
  .addServer('https://api.yourcompany.com', 'Production')
  .build();
```

### **Swagger UI Options**
```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,        // Keep auth token between requests
    displayRequestDuration: true,      // Show request execution time
    filter: true,                      // Enable endpoint filtering
    showRequestHeaders: true,          // Display request headers
    docExpansion: 'list',              // Expand endpoint list by default
    defaultModelsExpandDepth: 2,       // Expand model schemas
    defaultModelExpandDepth: 2,        // Expand model properties
    tryItOutEnabled: true,             // Enable "Try it out" feature
  },
  customCss: '...',                    // Custom styling
  customSiteTitle: 'Authentication API Documentation',
});
```

## 🎨 Custom Styling

### **CSS Customizations**
```css
.swagger-ui .topbar { display: none }
.swagger-ui .info .title { font-size: 2.5em; }
.swagger-ui .info .description { font-size: 1.1em; }
.swagger-ui .scheme-container { margin: 20px 0; }
.swagger-ui .auth-wrapper { margin: 20px 0; }
```

## 🧪 Testing with Swagger UI

### **1. Access Swagger Documentation**
```
http://localhost:8000/api
```

### **2. Authentication Testing**
1. **Register a new user** using `/v1/auth/register`
2. **Login** using `/v1/auth/login` to get tokens
3. **Click "Authorize"** button in Swagger UI
4. **Enter JWT token**: `Bearer <your-access-token>`
5. **Test protected endpoints** with authentication

### **3. Endpoint Testing**
- **Try It Out**: Click "Try it out" button for any endpoint
- **Modify Parameters**: Edit request body, headers, or parameters
- **Execute Request**: Click "Execute" to send the request
- **View Response**: See response body, headers, and status code

### **4. Response Examples**
- **Success Responses**: 200, 201 status codes with data
- **Error Responses**: 400, 401, 404, 500 with error details
- **Validation Errors**: Detailed field-level error messages

## 📋 Data Transfer Objects (DTOs)

### **Request DTOs**
- **RegisterDto**: User registration data
- **LoginDto**: User login credentials
- **RefreshTokenDto**: Token refresh request
- **ValidateTokenDto**: Token validation request
- **UpdateUserProfileDto**: Profile update data

### **Response DTOs**
- **ApiResponseDto<T>**: Generic response wrapper
- **UserProfileResponseDto**: User profile information
- **LoginResponseDto**: Login success response
- **TokenValidationResponseDto**: Token validation result

### **Validation Rules**
- **Username**: 3-50 characters, alphanumeric + underscore
- **Email**: Valid email format
- **Password**: 8-100 characters, complexity requirements
- **Names**: 2-50 characters, letters only
- **Required Fields**: All fields are mandatory

## 🔒 Security Features

### **JWT Authentication**
- **Access Token**: 15 minutes validity
- **Refresh Token**: 7 days validity
- **Bearer Scheme**: `Authorization: Bearer <token>`
- **Token Validation**: Every protected request validates token

### **Input Validation**
- **Class Validator**: Comprehensive field validation
- **Sanitization**: Whitelist approach for security
- **Type Safety**: TypeScript interfaces for all DTOs
- **Error Handling**: Detailed validation error messages

### **CORS Configuration**
```typescript
app.enableCors({
  origin: true,           // Allow all origins
  credentials: true,      // Allow credentials
});
```

## 🚀 Getting Started

### **1. Start the Services**
```bash
docker-compose up -d
```

### **2. Access API Documentation**
```
http://localhost:8000/api
```

### **3. Test Authentication Flow**
1. Register a new user
2. Login to get tokens
3. Authorize with JWT token
4. Test protected endpoints

### **4. Monitor Health**
```
http://localhost:8000/v1/health
```

## 📊 API Response Format

### **Standard Response Structure**
```json
{
  "success": boolean,           // Operation success status
  "message": string,            // Human-readable message
  "data": object,               // Response payload (optional)
  "errors": string[]            // Error messages (optional)
}
```

### **Error Response Example**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Username must be at least 3 characters long",
    "Password must contain at least one uppercase letter"
  ]
}
```

## 🔍 Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Ensure CORS is enabled in main.ts
   - Check browser console for CORS messages

2. **Validation Errors**
   - Check DTO validation rules
   - Verify required fields are present
   - Ensure data types match expectations

3. **Authentication Errors**
   - Verify JWT token format
   - Check token expiration
   - Ensure token is included in Authorization header

4. **Swagger UI Issues**
   - Clear browser cache
   - Check console for JavaScript errors
   - Verify Swagger configuration

### **Debug Mode**
```typescript
// Enable debug logging
const app = await NestFactory.create(ApiGatewayModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

## 📚 Additional Resources

### **NestJS Documentation**
- [Swagger Integration](https://docs.nestjs.com/openapi/introduction)
- [Validation Pipes](https://docs.nestjs.com/techniques/validation)
- [CORS Configuration](https://docs.nestjs.com/security/cors)

### **OpenAPI Specification**
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Options](https://swagger.io/docs/swagger-ui/usage/configuration/)

### **Testing Tools**
- **Postman**: Alternative API testing tool
- **Insomnia**: Modern API client
- **cURL**: Command-line HTTP client

## 🎉 Conclusion

The Swagger documentation provides a comprehensive, interactive interface for testing the Authentication API Gateway. With proper JWT authentication, detailed request/response examples, and comprehensive validation, developers can easily understand and test all API endpoints.

The documentation follows NestJS 10+ best practices and provides a professional, production-ready API interface that enhances developer experience and API adoption.