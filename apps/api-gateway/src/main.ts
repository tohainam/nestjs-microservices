import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Authentication API Gateway')
    .setDescription(`
      # Authentication API Gateway

      This API Gateway provides authentication and user management services through a RESTful API interface.

      ## Overview
      - **User Registration**: Create new user accounts
      - **User Authentication**: Login with username/email and password
      - **Token Management**: JWT access and refresh tokens
      - **User Profiles**: View and update user information
      - **Health Monitoring**: Service health status

      ## Architecture
      - **API Gateway**: HTTP endpoints for external clients
      - **Auth Service**: gRPC microservice for authentication logic
      - **MongoDB**: User data storage
      - **JWT**: Secure token-based authentication

      ## Security Features
      - Password hashing with bcrypt
      - JWT token validation
      - Input validation and sanitization
      - Network isolation for auth service
      - Single entry point architecture

      ## Authentication Flow
      1. **Register**: Create new user account
      2. **Login**: Get access and refresh tokens
      3. **Use API**: Include access token in Authorization header
      4. **Refresh**: Get new tokens when access token expires
      5. **Logout**: Revoke current access token

      ## Rate Limiting
      - Registration: 5 requests per hour per IP
      - Login: 10 requests per minute per IP
      - API calls: 100 requests per minute per user

      ## Error Handling
      - Consistent error response format
      - Detailed validation error messages
      - HTTP status codes following REST standards
      - Comprehensive error logging

      ## Development
      - Built with NestJS framework
      - TypeScript for type safety
      - Swagger/OpenAPI documentation
      - Docker containerization
      - MongoDB replica set
    `)
    .setVersion('1.0.0')
    .setContact(
      'Development Team',
      'https://github.com/your-org/auth-service',
      'dev@yourcompany.com'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Health', 'Service health monitoring endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for @ApiBearerAuth() decorator
    )
    .addServer('http://localhost:8000', 'Local Development')
    .addServer('https://api.yourcompany.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add any custom request interceptor logic here
        return req;
      },
      responseInterceptor: (res) => {
        // Add any custom response interceptor logic here
        return res;
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; }
      .swagger-ui .scheme-container { margin: 20px 0; }
      .swagger-ui .auth-wrapper { margin: 20px 0; }
    `,
    customSiteTitle: 'Authentication API Documentation',
    customfavIcon: '/favicon.ico',
  });

  // Global prefix for all routes
  app.setGlobalPrefix('v1');

  const port = configService.getOrThrow<string>('PORT');
  await app.listen(port);
  
  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
  console.log(`🔍 Health check available at: http://localhost:${port}/v1/health`);
}
void bootstrap();
