# NestJS Microservices API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Gateway](#api-gateway)
4. [Auth Service](#auth-service)
5. [Common Library](#common-library)
6. [Shared Infrastructure](#shared-infrastructure)
7. [gRPC Protocol](#grpc-protocol)
8. [Configuration](#configuration)
9. [Usage Examples](#usage-examples)
10. [Development](#development)

## Overview

This is a NestJS-based microservices application that implements a distributed architecture with:
- **API Gateway**: HTTP REST API that routes requests to microservices
- **Auth Service**: gRPC microservice for authentication and user management
- **Common Library**: Shared types, interfaces, and constants
- **Shared Infrastructure**: Database and infrastructure modules

The application uses gRPC for inter-service communication and MongoDB for data persistence.

## Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐    gRPC     ┌─────────────────┐
│   Client App    │ ──────────→ │  API Gateway    │ ──────────→ │  Auth Service   │
└─────────────────┘             └─────────────────┘             └─────────────────┘
                                         │                               │
                                         │                               │
                                         ▼                               ▼
                                ┌─────────────────┐             ┌─────────────────┐
                                │   Common Lib    │             │  MongoDB        │
                                └─────────────────┘             └─────────────────┘
```

## API Gateway

### Overview
The API Gateway serves as the entry point for all client requests, providing HTTP REST endpoints that internally communicate with microservices via gRPC.

### Module: `ApiGatewayModule`

**Location**: `apps/api-gateway/src/api-gateway.module.ts`

**Purpose**: Configures the API Gateway with gRPC client connections and HTTP controllers.

**Configuration**:
- Global configuration module
- gRPC client for Auth Service
- HTTP controllers for REST endpoints

**Dependencies**:
- `@nestjs/config` - Configuration management
- `@nestjs/microservices` - gRPC client support
- `@app/common` - Shared types and constants

### Controller: `ApiGatewayController`

**Location**: `apps/api-gateway/src/api-gateway.controller.ts`

**Purpose**: Handles HTTP requests and routes them to appropriate microservices.

**Endpoints**:

#### 1. Demo Authentication
```typescript
GET /demo-authenticate?auth={authString}
```

**Parameters**:
- `auth` (query): Authentication string

**Response**: Authentication result from Auth Service

**Example**:
```bash
curl "http://localhost:3000/demo-authenticate?auth=Bearer%20token123"
```

#### 2. Demo Login
```typescript
GET /demo-login?username={username}&password={password}
```

**Parameters**:
- `username` (query): User's username
- `password` (query): User's password

**Response**: Login result with token from Auth Service

**Example**:
```bash
curl "http://localhost:3000/demo-login?username=john&password=secret123"
```

#### 3. Demo Registration
```typescript
GET /demo-register?username={username}&password={password}&email={email}
```

**Parameters**:
- `username` (query): Desired username
- `password` (query): Desired password
- `email` (query): User's email address

**Response**: Registration result with user ID from Auth Service

**Example**:
```bash
curl "http://localhost:3000/demo-register?username=jane&password=secret456&email=jane@example.com"
```

### Service: `ApiGatewayService`

**Location**: `apps/api-gateway/src/api-gateway.service.ts`

**Purpose**: Manages gRPC client connections and routes requests to microservices.

**Methods**:

#### `demoAuthenticate(authString: string)`
- **Purpose**: Authenticates a user using an authentication string
- **Parameters**: `authString` - Authentication token/string
- **Returns**: Observable of authentication result
- **Usage**: Called by the demo-authenticate endpoint

#### `demoLogin(username: string, password: string)`
- **Purpose**: Authenticates user credentials and returns a login token
- **Parameters**: 
  - `username` - User's username
  - `password` - User's password
- **Returns**: Observable of login response with token
- **Usage**: Called by the demo-login endpoint

#### `demoRegister(username: string, password: string, email: string)`
- **Purpose**: Registers a new user account
- **Parameters**:
  - `username` - Desired username
  - `password` - Desired password
  - `email` - User's email address
- **Returns**: Observable of registration response with user ID
- **Usage**: Called by the demo-register endpoint

## Auth Service

### Overview
The Auth Service is a gRPC microservice responsible for user authentication, login, and registration operations.

### Module: `AuthServiceModule`

**Location**: `apps/auth-service/src/auth-service.module.ts`

**Purpose**: Configures the Auth Service with database connections and gRPC controllers.

**Configuration**:
- Global configuration module
- MongoDB database connection
- gRPC service registration

**Dependencies**:
- `@nestjs/config` - Configuration management
- `@app/shared-infra` - Database infrastructure

### Controller: `AuthServiceController`

**Location**: `apps/auth-service/src/auth-service.controller.ts`

**Purpose**: Implements gRPC service methods for authentication operations.

**Decorators**:
- `@Controller('auth')` - HTTP controller (for testing)
- `@AuthServiceControllerMethods()` - gRPC service registration

**Methods**:

#### `authenticate(request: { Authentication: string })`
- **Purpose**: Validates an authentication token/string
- **Parameters**: `request.Authentication` - Authentication string
- **Returns**: Promise/Observable of `UserMessage`
- **Response Format**:
  ```typescript
  {
    message: string // "Authenticated: {token}"
  }
  ```

#### `login(request: { username: string; password: string })`
- **Purpose**: Authenticates user credentials and returns a login token
- **Parameters**:
  - `request.username` - User's username
  - `request.password` - User's password
- **Returns**: Promise/Observable of `LoginResponse`
- **Response Format**:
  ```typescript
  {
    token: string,        // "demo-token"
    message: string       // "Logged in as {username}"
  }
  ```

#### `register(request: { username: string; password: string; email: string })`
- **Purpose**: Creates a new user account
- **Parameters**:
  - `request.username` - Desired username
  - `request.password` - Desired password
  - `request.email` - User's email address
- **Returns**: Promise/Observable of `RegisterResponse`
- **Response Format**:
  ```typescript
  {
    userId: string,       // "demo-user-id"
    message: string       // "Registered user {username} with email {email}"
  }
  ```

### Service: `AuthServiceService`

**Location**: `apps/auth-service/src/auth-service.service.ts`

**Purpose**: Business logic service for authentication operations (currently minimal implementation).

**Methods**:

#### `getHello(): string`
- **Purpose**: Returns a greeting message
- **Returns**: "Hello World!"
- **Usage**: Currently unused, placeholder for future business logic

## Common Library

### Overview
The Common Library provides shared types, interfaces, and constants used across all microservices.

### Location: `libs/common/src/`

### Types: `libs/common/src/types/auth.ts`

#### Interfaces

##### `Authentication`
```typescript
interface Authentication {
  Authentication: string;
}
```
**Purpose**: Wrapper for authentication strings/tokens

##### `LoginRequest`
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```
**Purpose**: Request payload for login operations

##### `RegisterRequest`
```typescript
interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}
```
**Purpose**: Request payload for user registration

##### `UserMessage`
```typescript
interface UserMessage {
  message: string;
}
```
**Purpose**: Generic response message wrapper

##### `LoginResponse`
```typescript
interface LoginResponse {
  token: string;
  message?: string;
}
```
**Purpose**: Response payload for successful login

##### `RegisterResponse`
```typescript
interface RegisterResponse {
  userId: string;
  message?: string;
}
```
**Purpose**: Response payload for successful registration

#### Service Interfaces

##### `AuthServiceClient`
```typescript
interface AuthServiceClient {
  authenticate(request: Authentication): Observable<UserMessage>;
  login(request: LoginRequest): Observable<LoginResponse>;
  register(request: RegisterRequest): Observable<RegisterResponse>;
}
```
**Purpose**: Client interface for gRPC Auth Service calls

##### `AuthServiceController`
```typescript
interface AuthServiceController {
  authenticate(request: Authentication): Promise<UserMessage> | Observable<UserMessage> | UserMessage;
  login(request: LoginRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;
  register(request: RegisterRequest): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;
}
```
**Purpose**: Controller interface for gRPC Auth Service implementation

#### Constants

##### `AUTH_PACKAGE_NAME`
```typescript
export const AUTH_PACKAGE_NAME = 'auth';
```
**Purpose**: gRPC package identifier for Auth Service

##### `AUTH_SERVICE_NAME`
```typescript
export const AUTH_SERVICE_NAME = 'AuthService';
```
**Purpose**: gRPC service identifier for Auth Service

#### Decorators

##### `AuthServiceControllerMethods()`
```typescript
export function AuthServiceControllerMethods() {
  // Registers gRPC methods: authenticate, login, register
  // Registers gRPC stream methods: none currently
}
```
**Purpose**: Automatically registers gRPC methods on controller classes

## Shared Infrastructure

### Overview
The Shared Infrastructure library provides common database and infrastructure modules used across microservices.

### Location: `libs/shared-infra/src/`

### Database Module: `MongoDatabaseModule`

**Location**: `libs/shared-infra/src/database/mongo-database.module.ts`

**Purpose**: Provides MongoDB connection configuration and management.

**Features**:
- Async configuration using environment variables
- Global MongoDB connection
- Feature-based model registration

**Configuration**:
- **Environment Variable**: `MONGODB_URI` - MongoDB connection string
- **Transport**: Mongoose ODM

**Static Methods**:

#### `forFeature(models: ModelDefinition[])`
```typescript
static forFeature(models: ModelDefinition[]) {
  return MongooseModule.forFeature(models);
}
```
**Purpose**: Registers Mongoose models for a specific module
**Parameters**: `models` - Array of Mongoose model definitions
**Returns**: Configured MongooseModule for feature registration

**Usage Example**:
```typescript
@Module({
  imports: [
    MongoDatabaseModule.forFeature([
      { name: 'User', schema: UserSchema }
    ])
  ]
})
export class UserModule {}
```

### Abstract Schema: `AbstractDocument`

**Location**: `libs/shared-infra/src/database/abstract.schema.ts`

**Purpose**: Base class for all Mongoose documents with common properties.

**Properties**:
- `_id`: MongoDB ObjectId (auto-generated)

**Usage Example**:
```typescript
@Schema()
export class User extends AbstractDocument {
  @Prop({ required: true })
  username: string;
  
  @Prop({ required: true })
  email: string;
}
```

## gRPC Protocol

### Overview
The application uses Protocol Buffers (protobuf) to define gRPC service contracts.

### Location: `proto/auth.proto`

### Service Definition

```protobuf
service AuthService {
  rpc Authenticate (Authentication) returns (UserMessage) {}
  rpc Login (LoginRequest) returns (LoginResponse) {}
  rpc Register (RegisterRequest) returns (RegisterResponse) {}
}
```

### Message Definitions

#### `Authentication`
```protobuf
message Authentication {
  string Authentication = 1;
}
```

#### `LoginRequest`
```protobuf
message LoginRequest {
  string username = 1;
  string password = 2;
}
```

#### `RegisterRequest`
```protobuf
message RegisterRequest {
  string username = 1;
  string password = 2;
  string email = 3;
}
```

#### `UserMessage`
```protobuf
message UserMessage {
  string message = 1;
}
```

#### `LoginResponse`
```protobuf
message LoginResponse {
  string token = 1;
  string message = 2;
}
```

#### `RegisterResponse`
```protobuf
message RegisterResponse {
  string userId = 1;
  string message = 2;
}
```

## Configuration

### Environment Variables

#### API Gateway
- `PORT`: HTTP server port (default: 3000)
- `AUTH_GRPC_URL`: gRPC endpoint for Auth Service

#### Auth Service
- `AUTH_GRPC_URL`: gRPC server binding address
- `MONGODB_URI`: MongoDB connection string

### Configuration Files

#### `nest-cli.json`
- Monorepo configuration
- Library path mappings
- Build configurations

#### `tsconfig.json`
- TypeScript compiler options
- Path aliases for libraries
- Module resolution settings

## Usage Examples

### Starting the Services

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Set Environment Variables
```bash
# .env file
PORT=3000
AUTH_GRPC_URL=localhost:5000
MONGODB_URI=mongodb://localhost:27017/auth-service
```

#### 3. Start Auth Service
```bash
cd apps/auth-service
pnpm run start:dev
```

#### 4. Start API Gateway
```bash
cd apps/api-gateway
pnpm run start:dev
```

### API Usage Examples

#### Authentication
```bash
# Authenticate with token
curl "http://localhost:3000/demo-authenticate?auth=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

# Response
{
  "message": "Authenticated: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
```

#### User Login
```bash
# Login with credentials
curl "http://localhost:3000/demo-login?username=john&password=secret123"

# Response
{
  "token": "demo-token",
  "message": "Logged in as john"
}
```

#### User Registration
```bash
# Register new user
curl "http://localhost:3000/demo-register?username=jane&password=secret456&email=jane@example.com"

# Response
{
  "userId": "demo-user-id",
  "message": "Registered user jane with email jane@example.com"
}
```

### gRPC Client Usage

#### Direct gRPC Calls
```typescript
import { AuthServiceClient } from '@app/common';

// In a service
@Inject(AUTH_SERVICE_NAME)
private readonly client: ClientGrpc;

onModuleInit() {
  this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
}

// Call methods
const result = await this.authService.login({ username: 'john', password: 'secret' }).toPromise();
```

## Development

### Project Structure
```
nestjs-microservices/
├── apps/
│   ├── api-gateway/          # HTTP API Gateway
│   └── auth-service/         # Authentication microservice
├── libs/
│   ├── common/               # Shared types and interfaces
│   └── shared-infra/         # Database and infrastructure
├── proto/                    # gRPC protocol definitions
├── scripts/                  # Build and deployment scripts
└── docker-compose.yml        # Local development environment
```

### Available Scripts

#### Build
```bash
pnpm run build              # Build all applications
```

#### Development
```bash
pnpm run start:dev         # Start in watch mode
pnpm run start:debug       # Start with debugger
```

#### Testing
```bash
pnpm run test              # Run unit tests
pnpm run test:watch        # Run tests in watch mode
pnpm run test:cov          # Run tests with coverage
pnpm run test:e2e          # Run end-to-end tests
```

#### Code Quality
```bash
pnpm run lint              # Run ESLint
pnpm run format            # Format code with Prettier
```

### Adding New Services

#### 1. Create Service Directory
```bash
mkdir -p apps/new-service/src
```

#### 2. Define gRPC Protocol
```protobuf
// proto/new-service.proto
syntax = "proto3";
package newservice;

service NewService {
  rpc DoSomething (Request) returns (Response) {}
}
```

#### 3. Generate Types
```bash
# Add to package.json scripts
"generate:proto": "protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./libs/common/src/types --proto_path=./proto"
```

#### 4. Create Service Implementation
```typescript
// apps/new-service/src/new-service.controller.ts
@Controller()
@NewServiceControllerMethods()
export class NewServiceController {
  doSomething(request: Request): Promise<Response> {
    // Implementation
  }
}
```

#### 5. Update API Gateway
```typescript
// Add to api-gateway.module.ts
ClientsModule.registerAsync([
  {
    name: NEW_SERVICE_NAME,
    useFactory: (configService: ConfigService) => ({
      transport: Transport.GRPC,
      options: {
        package: NEW_SERVICE_PACKAGE_NAME,
        protoPath: join(__dirname, '../../../proto/new-service.proto'),
        url: configService.getOrThrow<string>('NEW_SERVICE_GRPC_URL'),
      },
    }),
    inject: [ConfigService],
  },
])
```

### Testing

#### Unit Tests
```bash
# Run specific service tests
pnpm run test -- apps/auth-service
pnpm run test -- apps/api-gateway

# Run specific test file
pnpm run test -- auth-service.controller.spec.ts
```

#### Integration Tests
```bash
# Test API Gateway endpoints
pnpm run test:e2e
```

### Docker Development

#### Start Local Environment
```bash
docker-compose up -d
```

#### Services Available
- **MongoDB**: `localhost:27017`
- **API Gateway**: `localhost:3000`
- **Auth Service**: `localhost:5000` (gRPC)

#### Stop Environment
```bash
docker-compose down
```

## Troubleshooting

### Common Issues

#### 1. gRPC Connection Errors
- Verify `AUTH_GRPC_URL` environment variable
- Check if Auth Service is running
- Ensure proto file paths are correct

#### 2. MongoDB Connection Issues
- Verify `MONGODB_URI` environment variable
- Check if MongoDB is running
- Ensure network connectivity

#### 3. Port Conflicts
- Check if ports 3000 or 5000 are already in use
- Modify environment variables to use different ports

#### 4. Type Generation Issues
- Ensure protobuf compiler is installed
- Check proto file syntax
- Verify import paths in generated files

### Debug Mode
```bash
# Start with debugger
pnpm run start:debug

# Attach debugger to port 9229
```

### Logs
```bash
# View service logs
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
```

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow NestJS conventions
- Use ESLint and Prettier for formatting
- Write comprehensive tests

### Adding Features
1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Submit pull request

### Testing Requirements
- Unit test coverage > 80%
- Integration tests for new endpoints
- E2E tests for critical flows

---

This documentation covers all public APIs, functions, and components in the NestJS microservices application. For additional support or questions, please refer to the NestJS documentation or create an issue in the project repository.